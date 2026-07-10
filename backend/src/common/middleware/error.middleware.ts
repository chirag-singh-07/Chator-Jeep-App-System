import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!formattedErrors[path]) formattedErrors[path] = [];
      formattedErrors[path].push(issue.message);
    });

    res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
};
