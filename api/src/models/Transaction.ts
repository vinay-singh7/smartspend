import mongoose, { InferSchemaType } from "mongoose";

export const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Salary", "Health", "Other"] as const;
export const TRANSACTION_TYPES = ["income", "expense"] as const;
export const RECURRING_INTERVALS = ["daily", "weekly", "monthly", "yearly"] as const;

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, enum: TRANSACTION_TYPES, index: true },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    date: { type: Date, required: true, index: true },
    notes: { type: String, trim: true, maxlength: 500 },
    currency: { type: String, required: true, uppercase: true, trim: true, default: "USD" },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: String, enum: RECURRING_INTERVALS },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Transaction = mongoose.model("Transaction", transactionSchema);
