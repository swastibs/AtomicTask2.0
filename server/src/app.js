import express from "express";
import authRouter from "./modules/auth/auth.route.js";
import healthRouter from "./modules/health/health.route.js";
import ErrorHandler from "./shared/middlewares/errorHandler.middleware.js";
import ApiResponse from "./shared/utils/ApiResponse.js";
import cors from "cors";
import requestLogger from "./shared/middlewares/requestLogger.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.get("/", (_req, res) =>
  ApiResponse.ok(res, { name: "AtomicTask API", version: "v1" }, "OK"),
);

app.use("/api/auth", authRouter);
app.use("/api/", healthRouter);

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

export default app;
