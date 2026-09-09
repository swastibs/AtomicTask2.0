import express from "express";
import helmet from "helmet";
import cors from "cors";

import authRouter from "./modules/auth/auth.route.js";
import healthRouter from "./modules/health/health.route.js";

import ErrorHandler from "./shared/middlewares/errorHandler.middleware.js";
import requestLogger from "./shared/middlewares/requestLogger.middleware.js";
import bodyNormalizer from "./shared/middlewares/bodyNormalizer.middleware.js";

import ApiResponse from "./shared/utils/ApiResponse.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(bodyNormalizer);
app.use(requestLogger);

app.get("/", (_req, res) => {
  return ApiResponse.ok(res, { name: "AtomicTask API", version: "v1" }, "OK");
});

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);

app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

export default app;
