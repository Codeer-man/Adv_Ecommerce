import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import { ok } from "./utils/envolve";
import { notFound } from "./middleware/not-found";
import { errorHanlder } from "./middleware/errorHandler";

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

app.use("/health", (_req, res) => {
  res.status(200).json(ok({ message: "Server is healthy/in running state" }));
});

app.use(notFound);
app.use(errorHanlder);

export default app;
