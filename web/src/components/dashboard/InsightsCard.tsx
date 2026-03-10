"use client";

import { useMemo } from "react";
import { TrendingUp, Repeat2, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
  categoryBreakdown: Record<string, number>;
  totalIncome: number;
  totalExpense: number;
  currency?: string;
};

export function InsightsCard({ transactions, categoryBreakdown, totalIncome, totalExpense, currency = "USD" }: Props) {
  const top3 = useMemo(
    () =>
      Object.entries(categoryBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    [categoryBreakdown],
  );

  const savingsRate = useMemo(
    () => (totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0),
    [totalIncome, totalExpense],
  );

  const recurringTotal = useMemo(
    () =>
      transactions
        .filter((t) => t.isRecurring && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions],
  );

  const RANK_COLORS = ["text-amber-400", "text-slate-400", "text-orange-600"];
  const RANK_LABELS = ["🥇", "🥈", "🥉"];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="glass-card space-y-4 transition-shadow hover:shadow-lg hover:shadow-amber-500/5"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Trophy size={15} className="text-amber-400" />
        Spending Insights
      </h3>

      {/* Top 3 categories */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Top Categories</p>
        {top3.length === 0 ? (
          <p className="text-xs text-slate-400">No expense data yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {top3.map(([name, value], i) => (
              <li key={name} className="flex items-center justify-between text-sm">
                <span className={`font-medium ${RANK_COLORS[i]}`}>
                  {RANK_LABELS[i]} {name}
                </span>
                <span className="font-mono text-xs">{formatCurrency(value, currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      {/* Savings rate */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <TrendingUp size={14} />
          Savings Rate
        </span>
        <span
          className={`font-semibold ${
            savingsRate >= 30 ? "text-emerald-500" : savingsRate >= 10 ? "text-amber-500" : "text-rose-500"
          }`}
        >
          {savingsRate.toFixed(1)}%
        </span>
      </div>

      {/* Recurring expenses */}
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Repeat2 size={14} />
          Recurring Expenses
        </span>
        <span className="font-mono text-xs font-semibold text-rose-500">
          {formatCurrency(recurringTotal, currency)}
        </span>
      </div>
    </motion.div>
  );
}
