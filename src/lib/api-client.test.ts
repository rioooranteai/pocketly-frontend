import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiClient } from "@/lib/api-client";
import { getQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/stores/auth";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function catchApiError(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  useAuthStore.setState({ token: "token-123", user: null });
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("apiClient", () => {
  it("sends the bearer token and unwraps the {data} envelope", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { id: "1" } }));

    await expect(apiClient.get("/x")).resolves.toEqual({ id: "1" });
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get("Authorization")).toBe("Bearer token-123");
  });

  it("uses the backend's error message for failed responses", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "Tidak valid" }, 400));

    const error = await catchApiError(apiClient.get("/x"));
    expect(error.status).toBe(400);
    expect(error.message).toBe("Tidak valid");
  });

  it.each([
    ["Chrome", "Failed to fetch"],
    ["Firefox", "NetworkError when attempting to fetch resource."],
    ["Safari", "Load failed"],
  ])("recognises a %s network failure", async (_browser, message) => {
    fetchMock.mockRejectedValue(new TypeError(message));

    const error = await catchApiError(apiClient.get("/x"));
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/Tidak dapat terhubung ke server/);
  });

  it("turns its own timeout into a readable error", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        })
    );

    const pending = catchApiError(apiClient.request("/x", { timeoutMs: 5000 }));
    await vi.advanceTimersByTimeAsync(5000);

    const error = await pending;
    expect(error.status).toBe(0);
    expect(error.message).toMatch(/lebih dari 5 detik/);
  });

  it("rethrows a caller cancellation untouched", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError"))
          );
        })
    );

    const pending = apiClient.get("/x", { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toBeInstanceOf(DOMException);
  });

  it("clears the session and cache on a 401 with a token", async () => {
    const queryClient = getQueryClient();
    queryClient.setQueryData(["secret"], "data");
    fetchMock.mockResolvedValue(jsonResponse({ error: "Expired" }, 401));

    await catchApiError(apiClient.get("/x"));

    expect(useAuthStore.getState().token).toBeNull();
    expect(queryClient.getQueryData(["secret"])).toBeUndefined();
  });

  it("keeps the session on a 401 without a token (wrong password)", async () => {
    useAuthStore.setState({ token: null });
    const clearAuth = vi.spyOn(useAuthStore.getState(), "clearAuth");
    fetchMock.mockResolvedValue(jsonResponse({ error: "Salah" }, 401));

    await catchApiError(apiClient.post("/login", {}));

    expect(clearAuth).not.toHaveBeenCalled();
  });
});
