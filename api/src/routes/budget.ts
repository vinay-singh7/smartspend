import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  category: z.string().optional().default("overall"),
  amount: z.number().nonnegative(),
});

export const budgetRouter = Router();
budgetRouter.use(requireAuth);

budgetRouter.put("/", async (req, res) => {
  const data = budgetSchema.parse(req.body);

  const budget = await Budget.findOneAndUpdate(
    { userId: req.userId, month: data.month, category: data.category },
    { amount: data.amount },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json({ budget });
});

budgetRouter.get("/:month", async (req, res) => {
  const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(req.params.month);
  
  // Find all budgets for this month (overall + category specific)
  const budgets = await Budget.find({ userId: req.userId, month });

  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));

  // Aggregate expenses for the month, grouping by category
  const expensesByCategory = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.userId),
        type: "expense",
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
  ]);

  // Overall total expense
  const totalExpense = expensesByCategory.reduce((acc, curr) => acc + curr.total, 0);

  // Map category spends
  const spentByCategory = expensesByCategory.reduce((acc, curr) => {
    acc[curr._id] = curr.total;
    return acc;
  }, {} as Record<string, number>);

  // Format response for all found budgets
  const budgetDetails = budgets.map((b) => {
    const isOverall = b.category === "overall";
    const spent = isOverall ? totalExpense : (spentByCategory[b.category] || 0);
    const amount = b.amount;
    const usedPercent = amount > 0 ? (spent / amount) * 100 : 0;
    
    return {
      _id: b._id,
      category: b.category,
      amount: b.amount,
      spent,
      remaining: Math.max(amount - spent, 0),
      status: usedPercent >= 100 ? "exceeded" : usedPercent >= 80 ? "warning" : "healthy",
      usedPercent,
    };
  });

  // Provide an overall summary at the root, maintaining backward compatibility for older cards if needed
  const overallBudget = budgetDetails.find(b => b.category === "overall");

  return res.json({
    budgets: budgetDetails, // Full array of detailed category budgets
    
    // Legacy support fields for the single-budget UI until fully refactored
    budget: overallBudget ? { amount: overallBudget.amount } : undefined,
    spent: totalExpense,
    remaining: overallBudget ? Math.max(overallBudget.amount - totalExpense, 0) : 0,
    status: overallBudget?.status || "healthy",
    usedPercent: overallBudget?.usedPercent || 0,
  });
});
