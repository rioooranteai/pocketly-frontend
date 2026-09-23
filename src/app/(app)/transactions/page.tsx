"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { TransactionList } from "@/features/transactions/components/transaction-list";
import { AddTransactionModal } from "@/features/transactions/components/add-transaction-modal";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary-hover"
        >
          <Plus size={16} className="mr-1.5" />
          Tambah Transaksi
        </Button>
      </div>

      <TransactionList onAddClick={() => setModalOpen(true)} />

      <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
