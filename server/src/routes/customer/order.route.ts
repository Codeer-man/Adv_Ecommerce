import { Router } from "express";
import { getDbUserFromReq, requireAuth } from "../../middleware/auth";
import { Types } from "mongoose";
import { Order, OrderStatus, PaymentStatus } from "../../models/order";
import { asyncHanlder } from "../../utils/asyncHandler";
import { ok } from "../../utils/envolve";
import { requireFound, textRequired } from "../../utils/helper";
import { AppError } from "../../utils/AppError";
import { Product } from "../../models/product";
import { User } from "../../models/user";

export const customerOrderRouter = Router();

type CustomerOrderRow = {
  _id: Types.ObjectId;
  totalItems: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  returnedAt?: Date | null;
  createdAt: Date;
};

customerOrderRouter.use(requireAuth);

customerOrderRouter.get(
  "/orders",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);

    const order = await Order.find({ user: dbUser._id })
      .select(
        "deliveredAt paidAt totalItems totalAmount paymentStatus orderStatus",
      )
      .sort({ createdAt: -1 })
      .lean<CustomerOrderRow[]>();

    res.json(
      ok({
        items: order.map((orderItem) => ({
          _id: String(orderItem._id),
          code: String(orderItem._id).slice(-8).toUpperCase(),
          totalItem: String(orderItem.totalItems),
          totalAmount: String(orderItem.totalAmount),
          paymentStatus: String(orderItem.paymentStatus),
          orderStatus: String(orderItem.orderStatus),
          paidAt: String(orderItem.paidAt),
          deliveredAt: String(orderItem.deliveredAt),
          returnedAt: String(orderItem.returnedAt),
          createdAt: String(orderItem.createdAt),
        })),
      }),
    );
  }),
);

customerOrderRouter.patch(
  "/orders/return",
  asyncHanlder(async (req, res) => {
    const dbUser = await getDbUserFromReq(req);
    const orderId = String(req.body.orderId || "").trim();

    textRequired(orderId, "order id is required");

    const order = await Order.findOne({ _id: orderId });

    const foundOrder = requireFound(order, "order not found");

    if (foundOrder.orderStatus !== "delivered" || !foundOrder.deliveredAt) {
      throw new AppError(500, "Only delivered order can be returned");
    }

    const sevenDayReturnValid = 7 * 24 * 60 * 60 * 1000;

    if (
      Date.now() - new Date(foundOrder.deliveredAt).getTime() >
      sevenDayReturnValid
    ) {
      throw new AppError(500, "return validated time expired");
    }

    for (const item of foundOrder.items) {
      await Product.updateOne(
        {
          _id: item.product,
        },
        {
          $inc: { stock: item.quantity },
        },
      );
    }

    await User.updateOne(
      {
        _id: dbUser._id,
      },
      {
        $inc: { points: foundOrder.totalAmount },
      },
    );

    foundOrder.orderStatus = "returned";
    foundOrder.returnedAt = new Date();

    await foundOrder.save();

    res.json(
      ok({
        item: {
          _id: String(foundOrder._id),
          orderStatus: foundOrder.orderStatus,
          returnedAt: foundOrder.returnedAt,
        },
      }),
    );
  }),
);
