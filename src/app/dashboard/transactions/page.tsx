import Link from "next/link";
import { Plus } from "lucide-react";

import { TransactionList } from "@/features/transactions/components/transaction-list";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function TransactionsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Semua pengeluaran yang sudah kamu catat.
          </p>
        </div>
        <Link href={ROUTES.TRANSACTIONS.NEW}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
            <Plus size={16} className="mr-1.5" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <TransactionList />
    </div>
  );
}
