import logger from "../utils/logger.js";

/**
 * Middleware to log every incoming request with method, URL, status, and response time.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture the original end method to log when response finishes
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? "error" : "http";

    // Build log message
    const message = `${req.method} ${req.originalUrl} ${statusCode} - ${responseTime}ms`;
    // Optionally log request body (be careful with sensitive data)
    // If you want to log body, use: req.body (but may contain passwords)
    // const bodyLog = req.body ? ` Body: ${JSON.stringify(req.body)}` : '';
    // const fullMessage = message + bodyLog;

    logger[logLevel](message);

    // Call original end
    originalEnd.apply(this, args);
  };

  next();
};

export default requestLogger;
