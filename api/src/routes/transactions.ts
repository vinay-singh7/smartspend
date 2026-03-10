import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import {
  CATEGORIES,
  RECURRING_INTERVALS,
  Transaction,
  TRANSACTION_TYPES,
} from "../models/Transaction";

const transactionSchema = z.object({
  title: z.string().min(2).max(120),
  amount: z.number().positive(),
  type: z.enum(TRANSACTION_TYPES),
  category: z.enum(CATEGORIES),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().max(500).optional().or(z.literal("")),
  currency: z.string().length(3).default("USD"),
  isRecurring: z.boolean().optional().default(false),
  recurringInterval: z.enum(RECURRING_INTERVALS).optional(),
});

const emptyToUndefined = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const filterSchema = z.object({
  from: emptyToUndefined,
  to: emptyToUndefined,
  category: emptyToUndefined.pipe(z.enum(CATEGORIES).optional()),
  type: emptyToUndefined.pipe(z.enum(TRANSACTION_TYPES).optional()),
  search: emptyToUndefined,
});

export const transactionRouter = Router();
transactionRouter.use(requireAuth);

transactionRouter.get("/", async (req, res) => {
  const filters = filterSchema.parse(req.query);
  const query: Record<string, unknown> = { userId: req.userId };

  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) {
      (query.date as Record<string, Date>).$gte = new Date(filters.from);
    }
    if (filters.to) {
      (query.date as Record<string, Date>).$lte = new Date(filters.to);
    }
  }
  if (filters.category) query.category = filters.category;
  if (filters.type) query.type = filters.type;
  if (filters.search) query.title = { $regex: filters.search, $options: "i" };

  const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 });
  return res.json({ transactions });
});

transactionRouter.post("/", async (req, res) => {
  const data = transactionSchema.parse(req.body);
  const transaction = await Transaction.create({
    userId: req.userId,
    ...data,
    currency: data.currency.toUpperCase(),
    recurringInterval: data.isRecurring ? data.recurringInterval || "monthly" : undefined,
  });

  return res.status(201).json({ transaction });
});

transactionRouter.patch("/:id", async (req, res) => {
  const data = transactionSchema.partial().parse(req.body);

  const payload = {
    ...data,
    currency: data.currency ? data.currency.toUpperCase() : undefined,
  };

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    payload,
    { new: true },
  );

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  return res.json({ transaction });
});

transactionRouter.delete("/:id", async (req, res) => {
  const deleted = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  return res.status(204).send();
});

transactionRouter.get("/recent/list", async (req, res) => {
  const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(6);
  return res.json({ transactions });
});
