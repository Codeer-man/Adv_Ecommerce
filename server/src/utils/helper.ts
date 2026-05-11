import { AppError } from "./AppError";

export function textRequired(
  value: unknown,
  message: string,
  statusCode = 400,
) {
  if (!String(value).trim()) {
    throw new AppError(statusCode, message);
  }
}

export function numberRequired(
  value: unknown,
  message: string,
  statusCode = 400,
) {
  if (Number.isNaN(value)) {
    throw new AppError(statusCode, message);
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  message: string,
  status = 404,
): T {
  if (!value) {
    throw new AppError(status, message);
  }

  return value;
}
