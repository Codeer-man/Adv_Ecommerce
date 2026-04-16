import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { User } from "../models/user";
import { asyncHanlder } from "../utils/asyncHandler";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const { userId } = getAuth(req); // from clerk

  if (!userId) {
    return next(new AppError(401, "User not authorized"));
  }

  next();
}

export async function getDbUser(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new AppError(401, "User not authorized");
  }

  const dbUser = await User.findOne({ clerkUserId: userId });
  if (!dbUser) throw new AppError(404, "User not found");

  return dbUser;
}

export const adminRequired = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const extractCurrentDbUser = await getDbUser(req);

    if (extractCurrentDbUser.role !== "admin") {
      throw new AppError(403, "Admin access only");
    }
    next();
  },
);
