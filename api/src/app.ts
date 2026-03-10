import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import "express-async-errors";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { transactionRouter } from "./routes/transactions";
import { analyticsRouter } from "./routes/analytics";
import { budgetRouter } from "./routes/budget";
import { exportRouter } from "./routes/export";
import { dashboardRouter } from "./routes/dashboard";
import { aiRouter } from "./routes/ai";
import { errorHandler, notFoundHandler } from "./middlewares/error";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "smartspend-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/budget", budgetRouter);
app.use("/api/export", exportRouter);
app.use("/api/ai", aiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
