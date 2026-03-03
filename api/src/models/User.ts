import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    preferredCurrency: { type: String, default: "USD", uppercase: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.model("User", userSchema);
