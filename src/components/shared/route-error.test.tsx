import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RouteError } from "@/components/shared/route-error";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RouteError", () => {
  it("reports the error, shows its digest and retries on request", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const user = userEvent.setup();
    const retry = vi.fn();
    const error = Object.assign(new Error("boom"), { digest: "abc123" });

    render(<RouteError error={error} retry={retry} homeHref="/dashboard" />);

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(screen.getByText("Kode error: abc123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/dashboard"
    );

    await user.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
