import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TransactionsToolbar } from "@/features/transactions/components/transactions-toolbar";
import type { CategoryFilter } from "@/features/transactions/list-utils";

const SEPT = new Date(2026, 8, 1);

function renderToolbar(category: CategoryFilter = "all") {
  const onMonthChange = vi.fn();
  const onCategoryChange = vi.fn();
  render(
    <TransactionsToolbar
      month={SEPT}
      onMonthChange={onMonthChange}
      category={category}
      onCategoryChange={onCategoryChange}
    />
  );
  return { onMonthChange, onCategoryChange };
}

describe("TransactionsToolbar", () => {
  it("steps the month back and forward", async () => {
    const user = userEvent.setup();
    const { onMonthChange } = renderToolbar();

    expect(screen.getByText(/september 2026/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Bulan sebelumnya" }));
    await user.click(screen.getByRole("button", { name: "Bulan berikutnya" }));

    expect(onMonthChange).toHaveBeenNthCalledWith(1, new Date(2026, 7, 1));
    expect(onMonthChange).toHaveBeenNthCalledWith(2, new Date(2026, 9, 1));
  });

  it("marks the active category chip as pressed", () => {
    renderToolbar("food");

    expect(screen.getByRole("button", { name: "Makanan" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Semua" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("filters by a primary chip or a category from the dropdown", async () => {
    const user = userEvent.setup();
    const { onCategoryChange } = renderToolbar();

    await user.click(screen.getByRole("button", { name: "Transportasi" }));
    await user.selectOptions(
      screen.getByLabelText("Kategori lainnya"),
      "Kesehatan"
    );

    expect(onCategoryChange).toHaveBeenNthCalledWith(1, "transportation");
    expect(onCategoryChange).toHaveBeenNthCalledWith(2, "health");
  });
});
