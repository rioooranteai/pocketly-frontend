// @vitest-environment node
import { setupServer } from "msw/node";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { transactionsApi } from "@/features/transactions/api";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api-client";
import { resetMockDb } from "@/mocks/db";
import { handlers } from "@/mocks/handlers";
import { createSeedTransactions } from "@/mocks/seed";
import { useAuthStore } from "@/stores/auth";

// Exercises the dummy API through the real apiClient, so mock mode and
// the app agree on URLs, envelopes and shapes.
const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
beforeEach(() => {
  resetMockDb();
  useAuthStore.setState({ token: "mock-token", user: null });
});

describe("seed data", () => {
  it("always has transactions today and yesterday with consistent totals", () => {
    const now = new Date(2026, 8, 24, 18, 0);
    const seed = createSeedTransactions(now);
    const dayOf = (iso: string) => new Date(iso).toDateString();

    expect(
      seed.filter((tx) => dayOf(tx.date) === now.toDateString())
    ).toHaveLength(3);
    for (const tx of seed) {
      const sum = tx.items.reduce(
        (s, item) => s + item.quantity * item.price,
        0
      );
      expect(tx.total_amount).toBe(sum);
      expect(new Date(tx.date).getTime()).toBeLessThanOrEqual(now.getTime());
    }
    // Both "no category" flavours the UI must tell apart are present.
    expect(seed.some((tx) => tx.category === "others")).toBe(true);
    expect(seed.some((tx) => tx.category === "uncategorized")).toBe(true);
  });
});

describe("mock API", () => {
  it("logs in with any credentials except the 'salah' password", async () => {
    await expect(
      authApi.login({ email: "dewi.lestari@mail.com", password: "rahasia" })
    ).resolves.toMatchObject({ name: "Dewi Lestari", token: "mock-token" });

    await expect(
      authApi.login({ email: "dewi@mail.com", password: "salah" })
    ).rejects.toMatchObject({
      status: 401,
      message: "Email atau password salah.",
    });
  });

  it("creates, updates and deletes a transaction", async () => {
    const created = await transactionsApi.create({
      description: "Grab ke bandara",
      date: "2026-09-24T08:00:00+07:00",
      items: [{ name: "GrabCar", quantity: 1, price: 150000 }],
    });
    expect(created).toMatchObject({
      category: "transportation",
      total_amount: 150000,
    });

    const updated = await transactionsApi.update(created.id, {
      description: "Grab ke bandara",
      date: created.date,
      items: [
        { name: "GrabCar", quantity: 1, price: 150000 },
        { name: "Tol", quantity: 2, price: 12000 },
      ],
    });
    expect(updated.total_amount).toBe(174000);
    expect(updated.category).toBe("transportation");

    await expect(transactionsApi.remove(created.id)).resolves.toBeUndefined();
    const list = await transactionsApi.list();
    expect(list.some((tx) => tx.id === created.id)).toBe(false);

    const gone = await transactionsApi.remove(created.id).catch((e) => e);
    expect(gone).toMatchObject({
      status: 404,
      serverMessage: "Transaction not found",
    });
  });

  it("rejects a bare date like the backend", async () => {
    const error = await transactionsApi
      .create({
        description: "Kopi",
        date: "2026-09-24",
        items: [{ name: "Kopi", quantity: 1, price: 20000 }],
      })
      .catch((e: unknown) => e);
    expect(error).toMatchObject({
      status: 400,
      serverMessage: "invalid request body",
    });
  });

  it("falls back to uncategorized when nothing matches", async () => {
    const created = await transactionsApi.create({
      description: "Titip beli sesuatu",
      date: "2026-09-24T08:00:00+07:00",
      items: [{ name: "Barang", quantity: 1, price: 10000 }],
    });
    expect(created.category).toBe("uncategorized");
  });

  it("rejects requests without a token", async () => {
    useAuthStore.setState({ token: null });
    const error = await transactionsApi.list().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
  });
});
