"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

type BudgetResponse = {
  budget?: { amount: number };
  spent: number;
  remaining: number;
  status: "healthy" | "warning" | "exceeded";
  usedPercent: number;
};

export function BudgetCard({ month, currency }: { month: string; currency: string }) {
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBudget = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/budget/${month}`);
      setBudget(response.data);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    loadBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const saveBudget = async () => {
    const amount = Number(budgetAmount);
    if (!amount) return toast.error("Enter a valid budget amount");
    await api.put("/budget", { month, amount });
    toast.success("Budget saved");
    setBudgetAmount("");
    await loadBudget();
  };

  const barColor =
    !budget
      ? "bg-slate-300"
      : budget.status === "exceeded"
      ? "bg-rose-500"
      : budget.status === "warning"
      ? "bg-amber-400"
      : "bg-emerald-500";

  const pct = Math.min(budget?.usedPercent ?? 0, 100);

  return (
    <div className="glass-card space-y-3">
      <h3 className="text-sm font-semibold">Monthly Budget</h3>

      <div className="flex gap-2">
        <input
          className="input"
          type="number"
          placeholder={
            budget?.budget
              ? `Current: ${formatCurrency(budget.budget.amount, currency)}`
              : "Set monthly budget"
          }
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
        />
        <button type="button" className="btn bg-cyan-600 text-white" onClick={saveBudget}>
          Save
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{loading ? "Loading…" : budget ? `${pct.toFixed(0)}% used` : "No budget set"}</span>
          {budget && (
            <span
              className={
                budget.status === "exceeded"
                  ? "font-medium text-rose-500"
                  : budget.status === "warning"
                  ? "font-medium text-amber-500"
                  : "font-medium text-emerald-500"
              }
            >
              {budget.status === "exceeded"
                ? "Exceeded!"
                : budget.status === "warning"
                ? "80% reached"
                : "On track"}
            </span>
          )}
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {budget && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Spent</p>
            <p className="font-semibold">{formatCurrency(budget.spent, currency)}</p>
          </div>
          <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Remaining</p>
            <p className={`font-semibold ${budget.remaining < 0 ? "text-rose-500" : ""}`}>
              {formatCurrency(Math.abs(budget.remaining), currency)}
              {budget.remaining < 0 && " over"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
