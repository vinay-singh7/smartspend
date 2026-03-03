"use client";

import { useState } from "react";
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

  const saveBudget = async () => {
    const amount = Number(budgetAmount);
    if (!amount) return toast.error("Enter a valid budget amount");
    await api.put("/budget", { month, amount });
    toast.success("Budget saved");
    await loadBudget();
  };

  return (
    <div className="glass-card space-y-3">
      <h3 className="text-sm font-semibold">Monthly Budget</h3>
      <div className="flex gap-2">
        <input
          className="input"
          type="number"
          placeholder="Set monthly budget"
          value={budgetAmount}
          onChange={(event) => setBudgetAmount(event.target.value)}
        />
        <button type="button" className="btn bg-cyan-600 text-white" onClick={saveBudget}>
          Save
        </button>
      </div>
      <button type="button" className="btn w-full bg-slate-200 dark:bg-slate-800" onClick={loadBudget}>
        {loading ? "Loading..." : "Refresh Budget Status"}
      </button>
      {budget && (
        <div className="space-y-1 text-sm">
          <p>Spent: {formatCurrency(budget.spent, currency)}</p>
          <p>Remaining: {formatCurrency(budget.remaining, currency)}</p>
          <p
            className={
              budget.status === "exceeded"
                ? "text-rose-500"
                : budget.status === "warning"
                  ? "text-amber-500"
                  : "text-emerald-500"
            }
          >
            {budget.status === "exceeded"
              ? "Budget exceeded"
              : budget.status === "warning"
                ? "80% budget limit crossed"
                : "Budget on track"}
          </p>
        </div>
      )}
    </div>
  );
}
