"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";

type Props = {
  transactions: Transaction[];
  onRefresh: () => Promise<void>;
};

export function TransactionTable({ transactions, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const onDelete = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    toast.success("Transaction deleted");
    await onRefresh();
  };

  const onStartEdit = (item: Transaction) => {
    setEditingId(item._id);
    setEditingTitle(item.title);
  };

  const onSave = async (id: string) => {
    await api.patch(`/transactions/${id}`, { title: editingTitle });
    setEditingId(null);
    toast.success("Transaction updated");
    await onRefresh();
  };

  return (
    <div className="glass-card overflow-hidden">
      <h3 className="mb-3 text-sm font-semibold">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800">
              <th className="pb-2">Title</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Date</th>
              <th className="pb-2 text-right">Amount</th>
              <th className="pb-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id} className="border-b border-slate-100 dark:border-slate-800/50">
                <td className="py-3">
                  {editingId === item._id ? (
                    <input
                      className="input"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                    />
                  ) : (
                    item.title
                  )}
                </td>
                <td className={`py-3 capitalize ${item.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                  {item.type}
                </td>
                <td className="py-3">{item.category}</td>
                <td className="py-3">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-3 text-right">{formatCurrency(item.amount, item.currency)}</td>
                <td className="py-3">
                  <div className="flex justify-end gap-2">
                    {editingId === item._id ? (
                      <button type="button" className="btn bg-cyan-600 text-white" onClick={() => onSave(item._id)}>
                        Save
                      </button>
                    ) : (
                      <button type="button" className="btn bg-slate-200 dark:bg-slate-800" onClick={() => onStartEdit(item)}>
                        <Pencil size={14} />
                      </button>
                    )}
                    <button type="button" className="btn bg-rose-500 text-white" onClick={() => onDelete(item._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
