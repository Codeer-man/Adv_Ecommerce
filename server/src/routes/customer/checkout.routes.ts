import { Router } from "express";
import { getDbUserFromReq, requireAuth } from "../../middleware/auth";
import { Types } from "mongoose";
import { Product, ProductSize } from "../../models/product";
import { asyncHanlder } from "../../utils/asyncHandler";
import { requireFound, textRequired } from "../../utils/helper";
import { User } from "../../models/user";
import { Cart } from "../../models/cart";
import { AppError } from "../../utils/AppError";
import { Promo } from "../../models/Promo";
import { Order } from "../../models/order";
import { ok } from "../../utils/envolve";
import crypto from "crypto";

type UserAddressRow = {
  _id: Types.ObjectId;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
};

type CheckoutUserRow = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  addresses: UserAddressRow[];
};

type CartRow = {
  items: Array<{
    product: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: ProductSize;
  }>;
};

type ProductRow = {
  _id: Types.ObjectId;
  price: number;
  salePercentage: number;
  stock: number;
  status: "active" | "inactive";
};

type PromoRow = {
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
};

export const customerCheckoutRouter = Router();

customerCheckoutRouter.use(requireAuth);

customerCheckoutRouter.post(
  "/checkout/create-session",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const addressId = String(req.body.addressId || "").trim();
    const promoCode = String(req.body.promoCode || "")
      .trim()
      .toUpperCase();

    textRequired(addressId, "address id is required");

    //get user and cart
    //lean method returns plain js
    const [user, cart] = await Promise.all([
      User.findById(dbUser._id)
        .select("name email addresses ")
        .lean<CheckoutUserRow>(),

      Cart.findOne({ user: dbUser._id }).select("items").lean<CartRow>(),
    ]);

    const foundUser = requireFound(user, "User not found", 404);
    const foundCart = requireFound(cart, "Cart not found", 404);

    if (!foundCart.items.length) {
      throw new AppError(400, "Cart is empty");
    }

    const selectedAddress = foundUser.addresses.find(
      (item) => String(item._id) === addressId,
    );

    if (!selectedAddress) {
      throw new AppError(404, "Address not found");
    }

    const product = await Product.find({
      _id: { $in: foundCart.items.map((item) => item.product) },
    })
      .select("price salePercentage stock status")
      .lean<ProductRow[]>();

    //key and value pair
    const productMap = new Map(product.map((item) => [String(item._id), item]));

    let totalItems = 0;
    let subTotal = 0;

    const items = foundCart.items.map((cartItem) => {
      const product = productMap.get(String(cartItem.product));

      if (!product || product.status === "inactive") {
        throw new AppError(400, "One or more cart item are not found");
      }

      if (product.stock < cartItem.quantity) {
        throw new AppError(400, "Cart item out of stock");
      }

      const finalPrice = product.salePercentage
        ? Math.round(
            product.price - (product.price * product.salePercentage) / 100,
          )
        : product.salePercentage;

      totalItems += cartItem.quantity;
      subTotal += finalPrice * cartItem.quantity;

      return {
        product: cartItem.product,
        quantity: cartItem.quantity,
      };
    });

    let appliedPromoCode = "";
    let discountAmount: number = 0;

    if (promoCode) {
      const promo = await Promo.findOne({
        code: promoCode,
      }).lean<Promo | null>();

      const foundPromo = requireFound(promo, "Promo not found");
      const now = new Date();

      if (
        now < foundPromo.startAt ||
        now > foundPromo.endedAt ||
        foundPromo.count < 1
      ) {
        throw new AppError(400, "Promo code not active");
      }

      if (subTotal < foundPromo.minimumOrderValue) {
        throw new AppError(
          400,
          "Minimul order value for this promo is not at thread",
        );
      }
      appliedPromoCode = foundPromo.code;
      discountAmount = Math.round((subTotal * foundPromo.percentage) / 100);
    }

    const totalAmount = Math.max(subTotal - discountAmount, 0);

    // esewa payment integration

    const deliveryAddress = [
      selectedAddress.address,
      selectedAddress.postalCode,
      selectedAddress.state,
    ]
      .filter(Boolean)
      .join(", ");

    const order = await Order.create({
      user: dbUser._id,
      customerName: foundUser.name,
      customerEmail: foundUser.email,
      items,
      totalItems,
      deliveryName: selectedAddress.fullName,
      deliveryAddress,
      promoCode: appliedPromoCode,
      discountAmount,
      totalAmount,
      paymentStatus: "pending",
      orderStatus: "placed",
    });

    res.json(
      ok({
        order: {
          _id: order._id,
          totalItems,
          discountAmount,
          totalAmount,
        },
      }),
    );
  }),
);

customerCheckoutRouter.post(
  "checkout/confirm",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);
    const orderId = String(req.body.orderId).trim();
    const esewaSignature = String(req.body.esewaSignature || "").trim();
    const esewaOrderId = String(req.body.esewaOrderId || "").trim();
    const esewaPaymentId = String(req.body.esewaPaymentId).trim();

    textRequired(esewaOrderId, "Esewa order id is required");
    textRequired(orderId, " order id is required");
    textRequired(esewaSignature, "esewa Signatureis required");
    textRequired(esewaPaymentId, "esewa Payment Id  is required");

    const order = await Order.findById(orderId);

    const foundOrder = requireFound(order, "order not found", 404);

    if (foundOrder.paymentStatus === "paid") {
      throw new AppError(400, "Payment is already done");
    }

    if (esewaPaymentId !== foundOrder.paymentId) {
      throw new AppError(400, "order is missing");
    }

    // the ESEWA_KEY_SECRET does not exist in the .env files
    const signature = crypto
      .createHmac("sha256", process.env.ESEWA_KEY_SECRET || "")
      .update(`${esewaOrderId}|${esewaPaymentId} `)
      .digest("hex");

    if (signature !== esewaSignature) {
      throw new AppError(400, "Invalid payment signature ");
    }

    for (const item of foundOrder.items) {
      const updated = await Product.updateOne(
        {
          _id: item.product,
          stock: { $gt: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
      );

      if (!updated.matchedCount) {
        throw new AppError(400, "One or more product is out of stock");
      }
    }

    if (foundOrder.promoCode) {
      await Promo.updateOne(
        {
          code: foundOrder.promoCode,
          count: {
            $gt: 0,
          },
        },
        {
          $inc: { count: -1 },
        },
      );
    }

    await Cart.updateOne(
      {
        user: dbUser._id,
      },
      {
        $set: { items: [] },
      },
    );

    foundOrder.paymentStatus = "paid";
    foundOrder.paymentId = esewaPaymentId;
    foundOrder.paidAt = new Date();

    await foundOrder.save();

    res.json({
      _id: String(foundOrder._id),
    });
  }),
);
