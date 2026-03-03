import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { Transaction } from "../models/Transaction";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get("/", async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const transactions = await Transaction.find({
    userId: req.userId,
    date: { $gte: startOfYear },
  }).sort({ date: 1 });

  const totalIncome = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const categoryBreakdown = transactions
    .filter((item) => item.type === "expense")
    .reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const monthly = transactions.reduce(
    (acc, item) => {
      const key = item.date.toISOString().slice(0, 7);
      if (!acc[key]) {
        acc[key] = { month: key, income: 0, expense: 0 };
      }
      acc[key][item.type] += item.amount;
      return acc;
    },
    {} as Record<string, { month: string; income: number; expense: number }>,
  );

  const highestSpendingCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return res.json({
    totalIncome,
    totalExpense,
    totalBalance: totalIncome - totalExpense,
    highestSpendingCategory,
    categoryBreakdown,
    monthly: Object.values(monthly),
  });
});
