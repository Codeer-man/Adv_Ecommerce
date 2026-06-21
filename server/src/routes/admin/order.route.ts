import { Types } from "mongoose";
import { Order, OrderStatus, PaymentStatus } from "../../models/order";
import { Router } from "express";
import { adminRequired } from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { ok } from "../../utils/envolve";
import { requireFound, textRequired } from "../../utils/helper";
import { AppError } from "../../utils/AppError";

const ALLOWED_ORDER_STATUSES = [
  "placed",
  "shipped",
  "delivered",
  "returned",
] as const;

type AdminOrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

type AdminOrderRow = {
  _id: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  totalItems: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
  returnedAt?: Date | null;
  createdAt: Date;
};

export const adminOrderRouter = Router();

adminOrderRouter.use(adminRequired);

adminOrderRouter.get(
  "/orders",
  asyncHanlder(async (_req, res) => {
    const order = await Order.find()
      .select(
        "customerName customerEmail deliveredAt paidAt totalItems totalAmount paymentStatus orderStatus",
      )
      .sort({ createdAt: -1 })
      .lean<AdminOrderRow[]>();

    res.json(
      ok({
        items: order.map((orderItem) => ({
          _id: String(orderItem._id),
          customerName: String(orderItem.customerName),
          customerEmail: String(orderItem.customerEmail),
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

adminOrderRouter.patch(
  "/orders/:orderId/status",
  asyncHanlder(async (req, res) => {
    const orderId = String(req.params.orderId || "").trim();
    const orderStatus = String(
      req.body.orderStatus || "",
    ).trim() as AdminOrderStatus;

    textRequired(orderId, "order id is required");
    textRequired(orderStatus, "OrderStatus is required");

    if (!ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
      throw new AppError(400, "invalid order status");
    }

    const order = await Order.findById(orderId);
    const foundOrder = requireFound(order, "order not found");

    // admin return order - return the quantity of the product

    if (orderStatus === "returned" && foundOrder.orderStatus !== "returned") {
      for (const item of foundOrder.items) {
        await foundOrder.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );
      }
    }

    if (orderStatus === "delivered" && !foundOrder.deliveredAt) {
      foundOrder.deliveredAt = new Date();
    }

    foundOrder.orderStatus = orderStatus;

    await foundOrder.save();

    res.json(
      ok({
        id: String(foundOrder._id),
        orderStatus: foundOrder.orderStatus,
        deliveredAt: foundOrder.deliveredAt,
      }),
    );
  }),
);
