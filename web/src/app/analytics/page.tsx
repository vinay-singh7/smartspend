"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { TrendAreaChart, CategoryPieChart } from "@/components/dashboard/Charts";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

type AnalyticsPayload = {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  highestSpendingCategory: string;
  categoryBreakdown: Record<string, number>;
  monthly: { month: string; income: number; expense: number }[];
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/analytics"),
      api.get("/transactions")
    ]).then(([analyticsRes, txRes]) => {
      setAnalytics(analyticsRes.data);
      setTransactions(txRes.data.transactions);
    });
  }, []);

  const categoryRows = useMemo(
    () => Object.entries(analytics?.categoryBreakdown || {}).map(([name, value]) => ({ name, value })),
    [analytics],
  );

  return (
    <ProtectedRoute>
      <TopBar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-20">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-sm text-slate-500">Deep dive into your spending patterns and financial health.</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
          <motion.div variants={itemVariants} className="glass-card relative overflow-hidden">
            <div className="absolute -right-4 -top-4 rounded-full bg-cyan-100 p-4 dark:bg-cyan-900/30">
              <Wallet className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Savings</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(analytics?.totalBalance || 0, user?.preferredCurrency)}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card relative overflow-hidden">
            <div className="absolute -right-4 -top-4 rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/30">
              <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Income</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(analytics?.totalIncome || 0, user?.preferredCurrency)}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card relative overflow-hidden">
            <div className="absolute -right-4 -top-4 rounded-full bg-rose-100 p-4 dark:bg-rose-900/30">
              <TrendingDown className="h-8 w-8 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Expense</p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(analytics?.totalExpense || 0, user?.preferredCurrency)}
            </p>
            <p className="mt-1 text-xs text-rose-500">Highest Category: {analytics?.highestSpendingCategory || "N/A"}</p>
          </motion.div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="col-span-full xl:col-span-1">
            <TrendAreaChart data={analytics?.monthly || []} />
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
            <CategoryPieChart data={categoryRows} />
            <InsightsCard
              transactions={transactions}
              categoryBreakdown={analytics?.categoryBreakdown || {}}
              totalIncome={analytics?.totalIncome || 0}
              totalExpense={analytics?.totalExpense || 0}
              currency={user?.preferredCurrency}
            />
          </motion.div>
        </motion.div>


      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
