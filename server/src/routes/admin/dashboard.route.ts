import { Router, type Request, type Response } from "express";
import { adminRequired } from "../../middleware/auth";
import { asyncHanlder } from "../../utils/asyncHandler";
import { Product } from "../../models/product";
import { Category } from "../../models/category";
import { Order } from "../../models/order";
import { ok } from "../../utils/envolve";

type TotalSaleRow = {
  _id: null;
  totalSales: number;
};

export const adminDashboardRouter = Router();

adminDashboardRouter.use(adminRequired);

adminDashboardRouter.get(
  "/dashboard/lite",
  asyncHanlder(async (_req: Request, res: Response) => {
    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalReturnedOrders,
      salesRows,
    ] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "returned" }),
      Order.aggregate<TotalSaleRow>([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json(
      ok({
        totalProducts,
        totalCategories,
        totalSales: salesRows[0]?.totalSales || 0,
        totalOrders,
        totalReturnedOrders,
      }),
    );
  }),
);
