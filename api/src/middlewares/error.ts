import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({ message: "Route not found" });
}

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", issues: error.flatten() });
  }

  return res.status(500).json({
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}
