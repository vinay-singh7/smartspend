import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { Transaction } from "../models/Transaction";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

  const allTransactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(6);
  const monthlyTransactions = await Transaction.find({
    userId: req.userId,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  const totalIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return res.json({
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthlyOverview: {
      month: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
      income: totalIncome,
      expense: totalExpense,
    },
    recentTransactions: allTransactions,
  });
});
