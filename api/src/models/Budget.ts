import mongoose, { InferSchemaType } from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/, index: true },
    category: { type: String, required: true, default: "overall" },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

budgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

export type BudgetDocument = InferSchemaType<typeof budgetSchema> & { _id: mongoose.Types.ObjectId };
export const Budget = mongoose.model("Budget", budgetSchema);
