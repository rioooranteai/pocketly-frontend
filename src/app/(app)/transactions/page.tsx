import { TransactionsView } from "@/features/transactions/components/transactions-view";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { add } = await searchParams;
  const initialAdd = add === "scan" || add === "manual" ? add : undefined;

  // Keyed so a sidebar "Scan Receipt" click while already on this page
  // remounts the view and opens the modal again.
  return <TransactionsView key={initialAdd ?? "list"} initialAdd={initialAdd} />;
}
