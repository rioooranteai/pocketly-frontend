import type { TransactionResponse } from "@/types/api";
import { createSeedTransactions } from "@/mocks/seed";

const STORAGE_KEY = "pocketly_mock_db";

/**
 * In-browser "database" for mock mode. Kept in sessionStorage so edits
 * survive a reload while reviewing; closing the tab (or calling
 * `resetMockDb()` from the console via `window.pocketlyMock`) starts fresh.
 */
function load(): TransactionResponse[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TransactionResponse[];
  } catch {
    // Storage blocked or corrupt — fall through to a fresh seed.
  }
  return createSeedTransactions();
}

let transactions = load();

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // Non-fatal: data just won't survive a reload.
  }
}

export const mockDb = {
  list: () => transactions,
  find: (id: string) => transactions.find((tx) => tx.id === id),
  insert(tx: TransactionResponse) {
    transactions = [tx, ...transactions];
    persist();
    return tx;
  },
  update(id: string, next: TransactionResponse) {
    transactions = transactions.map((tx) => (tx.id === id ? next : tx));
    persist();
    return next;
  },
  remove(id: string) {
    const before = transactions.length;
    transactions = transactions.filter((tx) => tx.id !== id);
    persist();
    return transactions.length < before;
  },
};

export function resetMockDb() {
  transactions = createSeedTransactions();
  persist();
}
