import { formatCurrency } from "@/lib/utils";
import type { TransactionItem } from "@/types/api";

interface TransactionItemsTableProps {
  items: TransactionItem[];
  total: number;
}

/** Read-only line items with per-row subtotal and the server's total. */
export function TransactionItemsTable({
  items,
  total,
}: TransactionItemsTableProps) {
  return (
    <>
      <p className="mb-1 text-[13px] font-semibold">Item ({items.length})</p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th scope="col" className="py-2 text-left font-medium">
              Nama
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Qty
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Harga
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Items have no id in the API; this list is read-only, so index is stable. */}
          {items.map((item, index) => (
            <tr key={index} className="border-t border-border">
              <td className="py-3 pr-2">{item.name}</td>
              <td className="py-3 text-right tabular-nums">{item.quantity}</td>
              <td className="py-3 pl-2 text-right tabular-nums text-muted-foreground">
                {formatCurrency(item.price)}
              </td>
              <td className="py-3 pl-2 text-right font-semibold tabular-nums">
                {formatCurrency(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-[1.5px] border-foreground">
            <td colSpan={3} className="pt-3.5 font-semibold">
              Total
            </td>
            <td className="pt-3.5 text-right text-base font-bold tabular-nums">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-2.5 text-xs text-muted-foreground">
        Total dihitung otomatis dari item.
      </p>
    </>
  );
}
