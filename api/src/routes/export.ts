import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { Transaction } from "../models/Transaction";
import { toCsv } from "../utils/csv";
import { toMonthlyPdf } from "../utils/pdf";

export const exportRouter = Router();
exportRouter.use(requireAuth);

const monthSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
});

exportRouter.get("/csv", async (req, res) => {
  const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
  const csv = toCsv(transactions);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=smartspend-transactions.csv");
  return res.send(csv);
});

exportRouter.get("/pdf", async (req, res) => {
  const { month } = monthSchema.parse(req.query);
  const [year, monthNum] = month.split("-").map(Number);

  const start = new Date(Date.UTC(year, monthNum - 1, 1));
  const end = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));

  const transactions = await Transaction.find({
    userId: req.userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const pdfBuffer = await toMonthlyPdf(month, transactions);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=smartspend-${month}.pdf`);
  return res.send(pdfBuffer);
});
