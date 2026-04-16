import express from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { clerkClient, getAuth } from "@clerk/express";
import { AppError } from "../../utils/AppError";
import { User } from "../../models/user";
import { ok } from "../../utils/envolve";

export const authRoute = express.Router();

authRoute.post(
  "/sync",
  requireAuth,
  asyncHanlder(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(404, "User not authorized");
    }

    //get current user
    const clerkUser = await clerkClient.users.getUser(userId);

    const extractEmailFromUserInfo =
      clerkUser.emailAddresses.find(
        (item) => item.id === clerkUser.primaryEmailAddressId,
      ) || clerkUser.emailAddresses[0];

    const email = extractEmailFromUserInfo.emailAddress;

    const fullName = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const name = fullName || clerkUser.fullName;

    const raw = process.env.ADMIN_USER || "";
    const adminEmail = new Set(
      raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    );

    //check existing user from db
    const existingUser = await User.findOne({ clerkUserId: userId });
    const shouldBeAdmin = email ? adminEmail.has(email.toLowerCase()) : false;

    const nextRole =
      existingUser?.role === "admin"
        ? "admin"
        : shouldBeAdmin
          ? "admin"
          : existingUser?.role || "user";

    const newlyCreatedBDbUser = await User.findOneAndUpdate(
      {
        clerkUserId: userId,
      },
      {
        clerkUserId: userId,
        name,
        email,
        role: nextRole,
      },
      {
        new: true,
        setDefaultsOnInsert: true,
        upsert: true,
      },
    );

    res.status(200).json(
      ok({
        user: {
          id: newlyCreatedBDbUser._id,
          clerkUserId: newlyCreatedBDbUser.clerkUserId,
          email: newlyCreatedBDbUser.email,
          role: newlyCreatedBDbUser.role,
        },
      }),
    );
  }),
);

authRoute.get(
  "me",
  requireAuth,
  asyncHanlder(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(404, "userId is not present");
    }

    const dbUser = await User.findOne({ clerkUserId: userId });

    if (!dbUser) {
      throw new AppError(404, "User not found in db");
    }

    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          role: dbUser.role,
        },
      }),
    );
  }),
);
