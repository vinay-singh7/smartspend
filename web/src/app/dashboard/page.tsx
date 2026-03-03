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
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { BudgetCard } from "@/components/dashboard/BudgetCard";
import { ExportActions } from "@/components/dashboard/ExportActions";
import { Transaction } from "@/lib/types";

type DashboardStats = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyOverview: { month: string; income: number; expense: number };
};

type Analytics = {
  monthly: { month: string; expense: number; income: number }[];
  categoryBreakdown: Record<string, number>;
};

const initialFilters = { search: "", from: "", to: "", category: "", type: "" };

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({ monthly: [], categoryBreakdown: {} });
  const [filters, setFilters] = useState(initialFilters);

  const fetchDashboard = async () => {
    const [dashboardRes, txRes, analyticsRes] = await Promise.all([
      api.get("/dashboard"),
      api.get("/transactions", { params: filters }),
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard label="Total Balance" amount={stats?.totalBalance || 0} currency={user?.preferredCurrency} accent="cyan" />
          <StatCard label="Total Income" amount={stats?.totalIncome || 0} currency={user?.preferredCurrency} accent="emerald" />
          <StatCard label="Total Expense" amount={stats?.totalExpense || 0} currency={user?.preferredCurrency} accent="rose" />
          <StatCard
            label="Monthly Overview"
            amount={(stats?.monthlyOverview.income || 0) - (stats?.monthlyOverview.expense || 0)}
            currency={user?.preferredCurrency}
          />
        </motion.section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr,1fr]">
          <div className="space-y-4">
            <TransactionForm onCreated={fetchDashboard} preferredCurrency={user?.preferredCurrency} />
            <TransactionFilters filters={filters} onChange={setFilters} onApply={fetchDashboard} />
            <BudgetCard month={currentMonth} currency={user?.preferredCurrency || "USD"} />
            <ExportActions month={currentMonth} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <CategoryPieChart data={categoryData} />
            <MonthlyBarChart data={analytics.monthly} />
          </div>
        </section>

        <TransactionTable transactions={transactions} onRefresh={fetchDashboard} />
      </main>
      <BottomNav />
    </ProtectedRoute>
  );
}
