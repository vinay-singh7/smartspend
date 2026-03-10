"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Target, Plus } from "lucide-react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/lib/constants";

type BudgetDetail = {
  _id: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  status: "healthy" | "warning" | "exceeded";
  usedPercent: number;
};

type BudgetResponse = {
  budgets: BudgetDetail[];
  spent: number;
  remaining: number;
  budget?: { amount: number };
  status: "healthy" | "warning" | "exceeded";
  usedPercent: number;
};

export default function BudgetsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("overall");

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currency = user?.preferredCurrency || "USD";

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/budget/${currentMonth}`);
      setData(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const saveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return toast.error("Enter a valid amount");

    try {
      await api.put("/budget", { month: currentMonth, amount: numAmount, category });
      toast.success("Budget saved");
      setAmount("");
      setCategory("overall");
      await loadBudgets();
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const getBarColor = (status: string) => {
    if (status === "exceeded") return "bg-rose-500";
    if (status === "warning") return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <ProtectedRoute>
      <TopBar />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 pb-24">
        <div>
          <h1 className="text-2xl font-bold">Budgets & Goals</h1>
          <p className="text-sm text-slate-500">Set spending limits for the month to stay on track.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card h-fit space-y-4"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Plus size={16} className="text-cyan-600" />
              Set Budget
            </h3>
            <form onSubmit={saveBudget} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Category</label>
                <select 
                  className="input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="overall">Overall Total</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn w-full bg-cyan-600 text-white"
              >
                Save Limit
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {loading && !data ? (
              <div className="glass-card animate-pulse h-32" />
            ) : !data?.budgets || data.budgets.length === 0 ? (
              <div className="glass-card text-center py-10">
                <Target size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-slate-500">No budgets set for this month.</p>
              </div>
            ) : (
              data?.budgets?.sort((a, b) => a.category === "overall" ? -1 : 1).map((b) => (
                <div key={b._id} className="glass-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold capitalize">
                        {b.category === "overall" ? "Overall Monthly Budget" : `${b.category} Budget`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(b.spent, currency)} spent of {formatCurrency(b.amount, currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${b.status === "healthy" ? "text-emerald-500" : b.status === "warning" ? "text-amber-500" : "text-rose-500"}`}>
                        {formatCurrency(b.remaining, currency)}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</p>
                    </div>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(b.usedPercent, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${getBarColor(b.status)}`}
                    />
                  </div>
                  
                  {b.status === "exceeded" && (
                     <p className="text-xs text-rose-500 text-right mt-1">
                       Over budget by {formatCurrency(b.spent - b.amount, currency)}
                     </p>
                  )}
                </div>
              ))
            )}
          </motion.div>
        </div>
      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
