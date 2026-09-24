import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TransactionList } from "@/features/transactions/components/transaction-list";
import type { DayGroup } from "@/features/transactions/list-utils";
import type { TransactionResponse } from "@/types/api";

const coffee: TransactionResponse = {
  id: "tx-1",
  description: "Kopi susu",
  category: "food",
  total_amount: 25000,
  date: "2026-09-24T08:00:00",
  items: [{ name: "Kopi susu", quantity: 1, price: 25000 }],
};

const groups: DayGroup[] = [
  {
    key: "2026-09-24",
    label: "Hari ini",
    total: 25000,
    transactions: [coffee],
  },
];

function renderList(overrides: Partial<Parameters<typeof TransactionList>[0]>) {
  const props = {
    groups: [],
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
    onSelect: vi.fn(),
    onAdd: vi.fn(),
    monthLabel: "September 2026",
    isFiltered: false,
    pagination: {
      page: 1,
      totalPages: 1,
      from: 1,
      to: 1,
      total: 1,
      onPageChange: vi.fn(),
    },
    ...overrides,
  };
  render(<TransactionList {...props} />);
  return props;
}

describe("TransactionList", () => {
  it("shows a skeleton while loading", () => {
    renderList({ isLoading: true });
    expect(screen.getByLabelText("Memuat transaksi")).toBeInTheDocument();
  });

  it("offers a retry when loading failed", async () => {
    const user = userEvent.setup();
    const { onRetry } = renderList({ isError: true });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Gagal memuat transaksi"
    );
    await user.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("invites adding the first transaction when the month is empty", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderList({});

    expect(
      screen.getByText("Belum ada transaksi di September 2026")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /scan struk/i }));
    await user.click(screen.getByRole("button", { name: /tambah manual/i }));
    expect(onAdd).toHaveBeenNthCalledWith(1, "scan");
    expect(onAdd).toHaveBeenNthCalledWith(2, "manual");
  });

  it("says nothing matched when a filter is active", () => {
    renderList({ isFiltered: true });
    expect(
      screen.getByText("Tidak ada transaksi yang cocok")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tambah manual/i })
    ).not.toBeInTheDocument();
  });

  it("lists transactions grouped by day and opens one on click", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderList({ groups });

    expect(
      screen.getByRole("heading", { name: /hari ini/i })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /kopi susu/i }));
    expect(onSelect).toHaveBeenCalledWith(coffee);
    expect(screen.getByText(/menampilkan 1–1 dari 1/i)).toBeInTheDocument();
  });
});
