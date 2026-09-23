"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../api";
import type { CreateTransactionRequest } from "@/types/api";

const TRANSACTIONS_KEY = ["transactions"] as const;

export function useTransactions() {
  return useQuery({
    queryKey: TRANSACTIONS_KEY,
    queryFn: () => transactionsApi.list(),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, id],
    queryFn: () => transactionsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useScanReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => transactionsApi.scan(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTransactionRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}
