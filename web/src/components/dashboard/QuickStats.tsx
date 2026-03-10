"use client";

import { useMemo } from "react";
import { Flame, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { Transaction } from "@/lib/types";

type Props = {
  transactions: Transaction[];
  currency?: string;
};

export function QuickStats({ transactions, currency = "USD" }: Props) {
  const { streak, avgDailySpend } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    // Average daily spend this month
    const monthExpenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    });
    const totalMonthExpense = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const dayOfMonth = now.getUTCDate();
    const avgDailySpend = dayOfMonth > 0 ? totalMonthExpense / dayOfMonth : 0;

    // Logging streak — consecutive days with at least 1 transaction (going back from today)
    const daySet = new Set(transactions.map((t) => new Date(t.date).toISOString().slice(0, 10)));
    let streak = 0;
    const cursor = new Date(now);
    // Start check from today
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (daySet.has(key)) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }

    return { streak, avgDailySpend };
  }, [transactions]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="glass-card transition-shadow hover:shadow-lg hover:shadow-orange-500/5"
    >
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Flame size={16} className="text-orange-500" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Logging Streak</p>
            <p className="text-base font-bold">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/30">
            <CalendarDays size={16} className="text-cyan-500" />
          </span>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg Daily Spend</p>
            <p className="text-base font-bold">{formatCurrency(avgDailySpend, currency)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
