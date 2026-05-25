import { Router, type Request, type Response } from "express";
import { asyncHanlder } from "../../utils/asyncHandler";
import { requireFound, textRequired } from "../../utils/helper";
import { AppError } from "../../utils/AppError";
import { Promo } from "../../models/Promo";
import { ok } from "../../utils/envolve";

export const customerPromoRoute = Router();

customerPromoRoute.post(
  "/promos/apply",
  asyncHanlder(async (req, res) => {
    const code = String(req.body.code || "")
      .toUpperCase()
      .trim();

    const orderVal = Number(req.body.orderVal || 0);

    textRequired(orderVal, "Order price is required");

    if (Number.isNaN(orderVal) || orderVal < 0) {
      throw new AppError(400, "valid order value is required");
    }

    const promo = await Promo.findOne({ code: code });

    const foundPromo = requireFound(promo, "Promo not found", 404);

    const now = new Date();

    if (now < foundPromo.startAt) {
      throw new AppError(400, "Promo code is not active yes");
    } else if (now > foundPromo.endedAt) {
      throw new AppError(400, "Promo code is already expired");
    }

    if (foundPromo?.count < 1) {
      throw new AppError(400, "Promo code limit is exceded");
    }

    if (orderVal < foundPromo.minimumOrderValue) {
      throw new AppError(
        400,
        `Minimum order value is ${foundPromo.minimumOrderValue}`,
      );
    }

    res.json(
      ok({
        code: foundPromo.code,
        percentage: foundPromo.percentage,
        count: foundPromo.count,
        minimumOrderValue: foundPromo.minimumOrderValue,
      }),
    );
  }),
);
