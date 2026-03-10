"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import { Transaction } from "@/lib/types";

const schema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.enum(CATEGORIES),
  date: z.string().min(1),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  transaction: Transaction;
  onClose: () => void;
  onSaved: () => Promise<void>;
  preferredCurrency?: string;
};

export function EditTransactionModal({ transaction, onClose, onSaved, preferredCurrency = "USD" }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type as "income" | "expense",
      category: transaction.category as (typeof CATEGORIES)[number],
      date: new Date(transaction.date).toISOString().slice(0, 10),
      notes: transaction.notes || "",
      isRecurring: transaction.isRecurring || false,
      recurringInterval: (transaction.recurringInterval as FormValues["recurringInterval"]) || "monthly",
    },
  });

  const isRecurring = watch("isRecurring");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const onSubmit = async (values: FormValues) => {
    await api.patch(`/transactions/${transaction._id}`, {
      ...values,
      currency: preferredCurrency || "USD",
    });
    toast.success("Transaction updated");
    await onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/40 bg-white/90 p-5 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Edit Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input className="input" placeholder="Title" {...register("title")} />
          {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}

          <div className="grid grid-cols-2 gap-3">
            <input className="input" type="number" step="0.01" placeholder="Amount" {...register("amount")} />
            <select className="input" {...register("type")}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select className="input" {...register("category")}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input className="input" type="date" {...register("date")} />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 cursor-pointer">
            <input type="checkbox" {...register("isRecurring")} />
            Recurring
          </label>

          {isRecurring && (
            <select className="input" {...register("recurringInterval")}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          )}

          <textarea className="input min-h-16" placeholder="Notes (optional)" {...register("notes")} />

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn flex-1 bg-slate-100 dark:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn flex-1 bg-cyan-600 text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
