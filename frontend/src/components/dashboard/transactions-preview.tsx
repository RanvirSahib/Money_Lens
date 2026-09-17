import { SectionPanel } from "@/components/common/finance-ui";
import { formatINR, formatShortDate } from "@/lib/formatters";
import type { Transaction } from "@/types/finance";

export function TransactionsPreview({ transactions }: { transactions: Transaction[] }) {
  return (
    <SectionPanel title="Recent Transactions" description="Sample transaction structure for backend integration.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-3 font-semibold">Date</th>
              <th className="py-3 font-semibold">Description</th>
              <th className="py-3 font-semibold">Merchant</th>
              <th className="py-3 font-semibold">Category</th>
              <th className="py-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-3 text-muted-foreground">{formatShortDate(transaction.date)}</td>
                <td className="py-3 text-foreground">{transaction.description}</td>
                <td className="py-3 text-muted-foreground">{transaction.merchant}</td>
                <td className="py-3 text-muted-foreground">{transaction.category}</td>
                <td className={transaction.type === "income" ? "py-3 text-right font-semibold text-success" : "py-3 text-right font-semibold text-warning"}>{transaction.type === "income" ? "+" : "-"}{formatINR(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}
