"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { api } from "@/lib/api";
import { EditTransactionModal } from "./EditTransactionModal";

type Props = {
  transactions: Transaction[];
  onRefresh: () => Promise<void>;
  preferredCurrency?: string;
  hideTitle?: boolean;
};

export function TransactionTable({ transactions, onRefresh, preferredCurrency, hideTitle }: Props) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const onDelete = async (id: string) => {
    await api.delete(`/transactions/${id}`);
    toast.success("Transaction deleted");
    await onRefresh();
  };

  return (
    <>
      <AnimatePresence>
        {editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction}
            preferredCurrency={preferredCurrency}
            onClose={() => setEditingTransaction(null)}
            onSaved={onRefresh}
          />
        )}
      </AnimatePresence>

      <div className="glass-card overflow-hidden">
        {!hideTitle && <h3 className="mb-3 text-sm font-semibold">Recent Transactions</h3>}
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
              <AnimatePresence mode="popLayout">
                {transactions.length === 0 && (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No transactions found.
                    </td>
                  </motion.tr>
                )}
                {transactions.map((item) => (
                  <motion.tr
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
                  >
                    <td className="py-3">
                      <span className="font-medium">{item.title}</span>
                      {item.isRecurring && (
                        <span className="ml-2 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                          recurring
                        </span>
                      )}
                      {item.notes && (
                        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">{item.notes}</p>
                      )}
                    </td>
                    <td className={`py-3 capitalize font-medium ${item.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                      {item.type}
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-3 text-right font-mono font-semibold">{formatCurrency(item.amount, item.currency)}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="btn bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                          onClick={() => setEditingTransaction(item)}
                          title="Edit transaction"
                        >
                          <Pencil size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="btn bg-rose-500 text-white hover:bg-rose-600"
                          onClick={() => onDelete(item._id)}
                          title="Delete transaction"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
