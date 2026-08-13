import { HydratedDocument, model, Schema } from "mongoose";

export type Promo = {
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: number;
};

export type PromoDoc = HydratedDocument<Promo>;

const PromoSchema = new Schema<Promo>(
  {
    code: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
    },
    percentage: {
      type: Number,
      unique: true,
      required: true,
      min: 1,
      max: 100,
    },
    count: {
      type: Number,
      min: 1,
      required: true,
    },
    minimumOrderValue: {
      type: Number,
      min: 0,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const Promo = model<Promo>("Promo", PromoSchema);
