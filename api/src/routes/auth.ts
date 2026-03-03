import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { requireAuth } from "../middlewares/auth";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const data = signupSchema.parse(req.body);

  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
  });

  const token = signToken(user._id.toString());
  return res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
      createdAt: user.createdAt,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user._id.toString());
  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
      createdAt: user.createdAt,
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({ user });
});

authRouter.patch("/currency", requireAuth, async (req, res) => {
  const schema = z.object({ preferredCurrency: z.string().length(3) });
  const { preferredCurrency } = schema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.userId,
    { preferredCurrency: preferredCurrency.toUpperCase() },
    { new: true },
  ).select("-password");

  return res.json({ user });
});
