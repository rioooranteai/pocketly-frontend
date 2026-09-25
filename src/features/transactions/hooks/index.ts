"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionsApi } from "@/features/transactions/api";
import { transactionKeys } from "@/features/transactions/query-keys";
import { ApiError } from "@/lib/api-client";
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

/** Every write can change totals, lists and details — refresh them all. */
function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: transactionKeys.all });
}

/**
 * A 404 means the transaction is gone (or was never this user's) — e.g.
 * deleted in another tab. Per the API contract, drop it from the view.
 */
function isGone(error: unknown) {
  return error instanceof ApiError && error.status === 404;
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
    onError: (error) => {
      if (!isGone(error)) return;
      toast.error(error.message);
      // Refetching drops it from the list, which also closes its sheet.
      void invalidate();
    },
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateTransactions();

  return useMutation({
    // Already gone is exactly what the user wanted — treat it as deleted.
    mutationFn: (id: string) =>
      transactionsApi.remove(id).catch((error: unknown) => {
        if (!isGone(error)) throw error;
      }),
    onSuccess: invalidate,
  });
}
