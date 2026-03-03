import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = { userId: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
