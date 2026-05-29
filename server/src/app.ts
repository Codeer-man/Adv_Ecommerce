import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import { ok } from "./utils/envolve";
import { notFound } from "./middleware/not-found";
import { errorHanlder } from "./middleware/errorHandler";
import { clerkMiddleware } from "@clerk/express";
import { authRoute } from "./routes/auth/auth.routes";
import { adminProductRouter } from "./routes/admin/products.route";
import { adminPromoRoute } from "./routes/admin/promo.route";
import { customerProductRouter } from "./routes/customer/product.route";
import { customerAddressRoute } from "./routes/customer/address.route";
import { customerPromoRoute } from "./routes/customer/promo.route";
import { customerCartWishlistRouter } from "./routes/customer/cart-wishlist.route";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN!;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));
//read auth state from cookie or header
app.use(clerkMiddleware());

app.use("/health", (_req, res) => {
  res.status(200).json(ok({ message: "Server is healthy/in running state" }));
});

//auth routes
app.use("/auth", authRoute);

//admin routes
app.use("/admin", adminProductRouter);
app.use("/admin", adminPromoRoute);

//customer routes
app.use("/customer", customerProductRouter);
app.use("/customer", customerAddressRoute);
app.use("/customer", customerPromoRoute);
app.use("/customer", customerCartWishlistRouter);

app.use(notFound);
app.use(errorHanlder);

export default app;
