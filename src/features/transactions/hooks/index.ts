"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/features/transactions/api";
import { transactionKeys } from "@/features/transactions/query-keys";
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/types/api";

export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: ({ signal }) => transactionsApi.list(signal),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: ({ signal }) => transactionsApi.get(id, signal),
    enabled: !!id,
  });
}

/** Every write can change totals, lists and details — refresh them all. */
function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: transactionKeys.all });
}

export function useCreateTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) =>
      transactionsApi.create(data),
    onSuccess: invalidate,
  });
}

export function useScanReceipt() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: (file: File) => transactionsApi.scan(file),
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionRequest;
    }) => transactionsApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: invalidate,
  });
}
