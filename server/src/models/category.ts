import { HydratedDocument, HydrateOptions, model, Schema } from "mongoose";

export type Category = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type categoryDoc = HydratedDocument<Category>;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Category = model<categoryDoc>("Category", categorySchema);
