import { Router, type Request, type Response } from "express";
import { adminRequired, requireAuth } from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { Promo } from "../../models/Promo";
import { Types } from "mongoose";
import { ok } from "../../utils/envolve";
import { AppError } from "../../utils/AppError";
import { requireFound, textRequired } from "../../utils/helper";

export const adminPromoRoute = Router();

adminPromoRoute.use(requireAuth);
adminPromoRoute.use(adminRequired);

type PromoDbItem = {
  _id?: Types.ObjectId;
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startAt: Date;
  endedAt: Date;
  createdAt: Date;
};

function mapPromo(item: PromoDbItem) {
  return {
    _id: String(item._id),
    code: item.code,
    percentage: item.percentage,
    count: item.count,
    minimumOrderValue: item.minimumOrderValue,
    startAt: item.startAt,
    endedAt: item.endedAt,
    createdAt: item.createdAt,
  };
}

async function getAllPromo() {
  const promo = await Promo.find().sort({ createdAt: -1 });

  return promo.map((prommo) => mapPromo(prommo.toObject()));
}

function parsePromoPayload(req: Request) {
  const code = String(req.body.code || "")
    .trim()
    .toUpperCase();
  const percentage = Number(req.body.percentage);
  const count = Number(req.body.count);
  const minimumOrderValue = Number(req.body.minimumOrderValue);
  const startsAt = new Date(req.body.startsAt);
  const endsAt = new Date(req.body.endsAt);

  textRequired(code, "promo code is required");

  if (Number.isNaN(percentage) || percentage < 1 || percentage > 100) {
    throw new AppError(400, "Percentage must be between 1 and 10");
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new AppError(400, "Promo count must be atleast 1");
  }

  if (Number.isNaN(minimumOrderValue) || minimumOrderValue < 0) {
    throw new AppError(400, "Promo count must be atleast 0 or more");
  }

  if (Number.isNaN(startsAt.getTime())) {
    throw new AppError(400, "Valid start time is required");
  }
  if (Number.isNaN(endsAt.getTime())) {
    throw new AppError(400, "Valid end time is required");
  }

  if (endsAt <= startsAt) {
    throw new AppError(400, "End time should be after start time");
  }

  return {
    code,
    percentage,
    count,
    minimumOrderValue,
    startsAt,
    endsAt,
  };
}
adminPromoRoute.get(
  "/promo",
  asyncHanlder(async (_req, res) => {
    res.json(
      ok({
        items: await getAllPromo(),
      }),
    );
  }),
);

adminPromoRoute.post(
  "/promo",
  asyncHanlder(async (req, res) => {
    const payload = parsePromoPayload(req);

    const existingPromo = await Promo.findOne({ code: payload.code });

    if (existingPromo) {
      throw new AppError(400, "promo already exists");
    }

    await Promo.create(payload);

    res.json(
      ok({
        item: await getAllPromo(),
      }),
    );
  }),
);

adminPromoRoute.patch(
  "/promo/:promoId",
  asyncHanlder(async (req, res) => {
    const promoId = String(req.params.promoId).trim();
    const payload = parsePromoPayload(req);

    textRequired(promoId, "Promo id is reqrueid");
    const promo = await Promo.findById(promoId);

    const foundPromo = requireFound(promo, "promo not found");

    // newly promo code already exist in other promo check
    const existingPromo = await Promo.findOne({
      code: payload.code,
      _id: { $ne: promoId },
    });

    if (existingPromo) {
      throw new AppError(400, "Promo code already exists");
    }

    foundPromo.code = payload.code;
    foundPromo.percentage = payload.percentage;
    foundPromo.count = payload.count;
    foundPromo.minimumOrderValue = payload.minimumOrderValue;
    foundPromo.startAt = payload.startsAt;
    foundPromo.endedAt = payload.endsAt;

    await foundPromo.save();

    res.json(
      ok({
        item: await getAllPromo(),
      }),
    );
  }),
);

adminPromoRoute.delete(
  "/promo/:promoId",
  asyncHanlder(async (req, res) => {
    const promoId = String(req.params.promoId).trim();

    textRequired(promoId, "Promo id is reqrueid");
    const promo = await Promo.findById(promoId);

    requireFound(promo, "promo not found");

    await Promo.findByIdAndDelete(promoId);

    res.json(
      ok({
        item: await getAllPromo(),
      }),
    );
  }),
);
