import { HydratedDocument, model, Schema, Types } from "mongoose";

export type wishlistType = {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};

export type wishListDoc = HydratedDocument<wishlistType>;

const WishlistSchema = new Schema<wishlistType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      reqruied: true,
    },
    products: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const Wishlist = model<wishlistType>("Wishlist", WishlistSchema);
