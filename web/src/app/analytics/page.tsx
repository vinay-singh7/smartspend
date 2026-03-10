"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { Transaction } from "@/lib/types";

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
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 pb-20">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="glass-card">
            <p className="text-xs text-slate-500">Income vs Expense</p>
            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(analytics?.totalIncome || 0, user?.preferredCurrency)} /{" "}
              {formatCurrency(analytics?.totalExpense || 0, user?.preferredCurrency)}
            </p>
          </div>
          <div className="glass-card">
            <p className="text-xs text-slate-500">Net Savings</p>
            <p className="mt-2 text-lg font-semibold">
              {formatCurrency(analytics?.totalBalance || 0, user?.preferredCurrency)}
            </p>
          </div>
          <div className="glass-card">
            <p className="text-xs text-slate-500">Highest Spending Category</p>
            <p className="mt-2 text-lg font-semibold">{analytics?.highestSpendingCategory || "N/A"}</p>
          </div>
          <InsightsCard
            transactions={transactions}
            categoryBreakdown={analytics?.categoryBreakdown || {}}
            totalIncome={analytics?.totalIncome || 0}
            totalExpense={analytics?.totalExpense || 0}
            currency={user?.preferredCurrency}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card h-96">
            <h3 className="mb-4 text-sm font-semibold">Monthly Spending Graph</h3>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={analytics?.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card">
            <h3 className="mb-4 text-sm font-semibold">Category-wise Breakdown</h3>
            <div className="space-y-2">
              {categoryRows.map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                  <span>{row.name}</span>
                  <span className="font-medium">{formatCurrency(row.value, user?.preferredCurrency)}</span>
                </div>
              ))}
              {categoryRows.length === 0 && <p className="text-sm text-slate-500">No category data yet.</p>}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
