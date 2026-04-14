import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/AppError";
import { fail } from "../utils/envolve";

export function errorHanlder(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(fail(err.message, "APP_ERROR"));
  }

  console.error("error", err);

  return res.status(500).json(fail("Internal server error", "INTERNAL"));
}
