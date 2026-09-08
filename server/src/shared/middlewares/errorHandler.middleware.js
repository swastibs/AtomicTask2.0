import ApiError from "../utils/ApiError.js";
import { ValidationError } from "express-validation";
import logger from "../utils/logger.js"; // <-- import

class ErrorHandler {
  static notFound(req, _res, next) {
    next(ApiError.notFound(`Route not found - ${req.originalUrl}`));
  }

  static handle(err, req, res, _next) {
    let error = err;

    // Check if it's an express-validation error
    const isExpressValidationError = err instanceof ValidationError;

    if (isExpressValidationError) {
      const formattedErrors = {};
      if (err.details) {
        for (const [key, value] of Object.entries(err.details)) {
          formattedErrors[key] = value.map((e) => e.message);
        }
      }
      error = ApiError.badRequest("Validation failed", formattedErrors);
    }

    // Convert other errors to ApiError
    if (!(error instanceof ApiError)) {
      const statusCode = error.statusCode || 500;
      const message = error.message || "Something went wrong";
      error = new ApiError(
        statusCode,
        message,
        error.errors || [],
        error.stack,
      );
    }

    // Only run these checks if NOT an express-validation error
    if (!isExpressValidationError) {
      if (err.name === "CastError") {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
      }

      if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        error = ApiError.conflict(`${field} already exists`);
      }

      if (err.name === "ValidationError") {
        const messages = err.errors
          ? Object.values(err.errors).map((val) => val.message)
          : [err.message];
        error = ApiError.validation("Validation failed", messages);
      }

      if (err.name === "JsonWebTokenError") {
        error = ApiError.unauthorized("Invalid token");
      }

      if (err.name === "TokenExpiredError") {
        error = ApiError.unauthorized("Token expired");
      }
    }

    // Log server errors
    if (error.statusCode >= 500) {
      console.error(
        `[Error] ${req.method} ${req.originalUrl} -`,
        error.message,
      );
    }

    // Send response
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
      ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    });
  }
}

export default ErrorHandler;
