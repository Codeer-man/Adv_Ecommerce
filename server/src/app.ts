import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import { ok } from "./utils/envolve";
import { notFound } from "./middleware/not-found";
import { errorHanlder } from "./middleware/errorHandler";
import { clerkMiddleware } from "@clerk/express";
import { authRoute } from "./routes/auth/auth.routes";

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

app.use("/auth", authRoute);

app.use(notFound);
app.use(errorHanlder);

export default app;
