import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";

const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  amount: z.number().positive(),
});

export const budgetRouter = Router();
budgetRouter.use(requireAuth);

budgetRouter.put("/", async (req, res) => {
  const data = budgetSchema.parse(req.body);

  const budget = await Budget.findOneAndUpdate(
    { userId: req.userId, month: data.month },
    { amount: data.amount },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.json({ budget });
});

budgetRouter.get("/:month", async (req, res) => {
  const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(req.params.month);
  const budget = await Budget.findOne({ userId: req.userId, month });

  const [year, monthNum] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));

  const totalExpense = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.userId),
        type: "expense",
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const spent = totalExpense[0]?.total || 0;
  const amount = budget?.amount || 0;
  const usedPercent = amount > 0 ? (spent / amount) * 100 : 0;

  return res.json({
    budget,
    spent,
    remaining: Math.max(amount - spent, 0),
    status: usedPercent >= 100 ? "exceeded" : usedPercent >= 80 ? "warning" : "healthy",
    usedPercent,
  });
});
