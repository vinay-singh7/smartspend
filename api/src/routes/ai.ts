import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "../middlewares/auth";
import { Transaction } from "../models/Transaction";
import { Budget } from "../models/Budget";
import { env } from "../config/env";

export const aiRouter = Router();
aiRouter.use(requireAuth);

aiRouter.post("/chat", async (req, res) => {
  // Return a friendly message if API key is not configured
  if (!env.GEMINI_API_KEY) {
    return res.json({
      reply:
        "🔑 AI assistant isn't configured yet. Add your `GEMINI_API_KEY` to `api/.env` and restart the server. Get a free key at https://aistudio.google.com/app/apikey",
    });
  }

  const { message, history = [] } = req.body as {
    message: string;
    history: { role: "user" | "model"; parts: { text: string }[] }[];
  };

  if (!message?.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  // ── Gather financial context ──────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const currentMonthKey = now.toISOString().slice(0, 7);

  const [recentTx, monthlyTx, budget] = await Promise.all([
    Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(50),
    Transaction.find({ userId: req.userId, date: { $gte: startOfMonth } }),
    Budget.findOne({ userId: req.userId, month: currentMonthKey }),
  ]);

  const totalIncome = monthlyTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = monthlyTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const categoryBreakdown = monthlyTx
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
    .join(", ");

  const recentSummary = recentTx
    .slice(0, 10)
    .map((t) => `  • [${t.type.toUpperCase()}] ${t.title} — $${t.amount} (${t.category}) on ${new Date(t.date).toLocaleDateString()}`)
    .join("\n");

  const systemPrompt = `You are SmartSpend AI, a friendly and concise personal finance assistant built into the SmartSpend app.
You answer questions about the user's spending, income, budgets, and financial health.

Here is the user's LIVE financial data (current month: ${currentMonthKey}):

📊 This Month Summary:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Net Savings: $${(totalIncome - totalExpense).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0}%
${budget ? `- Monthly Budget: $${budget.amount} | Spent: $${totalExpense.toFixed(2)} | ${((totalExpense / budget.amount) * 100).toFixed(0)}% used` : "- No monthly budget set"}

🏷️ Top Spending Categories This Month:
${topCategories || "No expense data yet"}

🕒 10 Most Recent Transactions:
${recentSummary || "No transactions yet"}

Guidelines:
- Be concise and friendly. Use emojis sparingly for readability.
- Give actionable insights, not just numbers.
- If the user asks something you can't answer from the data, say so honestly.
- Keep responses under 200 words unless the user asks for detail.`;

  // ── Call Gemini ─────────────────────────────────────────────────────────
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

  // Try models in order of preference
  const MODEL_PREFERENCE = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

  for (const modelName of MODEL_PREFERENCE) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const chat = model.startChat({
        history,
        generationConfig: { maxOutputTokens: 512 },
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();
      return res.json({ reply });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);

      // Quota exhausted — give a clear message, no point trying other models
      if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
        return res.json({
          reply:
            "⚠️ The Gemini API quota for this key is currently exhausted (free-tier limit reached). Please:\n\n1. Enable billing on your Google AI Studio project at https://aistudio.google.com\n2. Or create a fresh API key and update `GEMINI_API_KEY` in `api/.env`\n3. Then restart the API server.",
        });
      }

      // Invalid/revoked key
      if (msg.includes("400") || msg.includes("401") || msg.includes("403") || msg.includes("API key")) {
        return res.json({
          reply:
            "🔑 The Gemini API key appears to be invalid or revoked. Please get a new key at https://aistudio.google.com/app/apikey and update `GEMINI_API_KEY` in `api/.env`.",
        });
      }

      // Model not found — try next model in the list
      if (msg.includes("404") || msg.includes("not found")) {
        console.warn(`[AI] Model ${modelName} not available, trying next...`);
        continue;
      }

      // Unknown error — re-throw so the global error handler logs it
      throw err;
    }
  }

  // All models failed
  return res.json({
    reply: "😕 No compatible Gemini model is available for your API key. Please check https://aistudio.google.com and ensure your key has access to at least one generative model.",
  });
});
