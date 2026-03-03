import { stringify } from "csv-stringify/sync";
import { TransactionDocument } from "../models/Transaction";

export function toCsv(transactions: TransactionDocument[]) {
  const rows = transactions.map((item) => ({
    title: item.title,
    amount: item.amount,
    type: item.type,
    category: item.category,
    date: item.date.toISOString().slice(0, 10),
    currency: item.currency,
    notes: item.notes || "",
  }));

  return stringify(rows, { header: true });
}
