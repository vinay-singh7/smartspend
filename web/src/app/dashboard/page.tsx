"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryPieChart, MonthlyBarChart } from "@/components/dashboard/Charts";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Transaction } from "@/lib/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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


type DashboardStats = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyOverview: { month: string; income: number; expense: number };
};

type Analytics = {
  monthly: { month: string; expense: number; income: number }[];
  categoryBreakdown: Record<string, number>;
  totalIncome: number;
  totalExpense: number;
};

const initialFilters = { search: "", from: "", to: "", category: "", type: "" };

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    monthly: [],
    categoryBreakdown: {},
    totalIncome: 0,
    totalExpense: 0,
  });

  const fetchDashboard = async () => {
    const [dashboardRes, txRes, analyticsRes] = await Promise.all([
      api.get("/dashboard"),
      api.get("/transactions", { params: { search: "", from: "", to: "", category: "", type: "" } }), // Limit this on backend later, but for now fetch all and slice
      api.get("/analytics"),
    ]);
    setStats(dashboardRes.data);
    setTransactions(txRes.data.transactions);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const categoryData = useMemo(
    () =>
      Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
        name,
        value,
      })),
    [analytics.categoryBreakdown],
  );

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <ProtectedRoute>
      <TopBar />
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 pb-20">
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard variants={itemVariants} label="Total Balance" amount={stats?.totalBalance || 0} currency={user?.preferredCurrency} accent="cyan" />
          <StatCard variants={itemVariants} label="Total Income" amount={stats?.totalIncome || 0} currency={user?.preferredCurrency} accent="emerald" />
          <StatCard variants={itemVariants} label="Total Expense" amount={stats?.totalExpense || 0} currency={user?.preferredCurrency} accent="rose" />
          <StatCard
            variants={itemVariants}
            label="Monthly Overview"
            amount={(stats?.monthlyOverview.income || 0) - (stats?.monthlyOverview.expense || 0)}
            currency={user?.preferredCurrency}
          />
        </motion.section>

        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 xl:grid-cols-[1.1fr,1fr]"
        >
          <div className="space-y-4">
            <TransactionForm onCreated={fetchDashboard} preferredCurrency={user?.preferredCurrency} />
            <BudgetCard month={currentMonth} currency={user?.preferredCurrency || "USD"} />
            <InsightsCard
              transactions={transactions}
              categoryBreakdown={analytics.categoryBreakdown}
              totalIncome={analytics.totalIncome}
              totalExpense={analytics.totalExpense}
              currency={user?.preferredCurrency}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <CategoryPieChart data={categoryData} />
            <MonthlyBarChart data={analytics.monthly} />
          </div>
        </motion.section>

        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <QuickStats transactions={transactions} currency={user?.preferredCurrency} />
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Transactions</h3>
            <Link href="/transactions" className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <TransactionTable
            transactions={transactions.slice(0, 5)}
            onRefresh={fetchDashboard}
            preferredCurrency={user?.preferredCurrency}
            hideTitle
          />
        </motion.div>
      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
