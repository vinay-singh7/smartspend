import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}
