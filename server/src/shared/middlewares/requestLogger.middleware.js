import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 400 ? "error" : "http";

    const message = `${req.method} ${req.originalUrl} ${statusCode} - ${responseTime}ms`;

    logger[logLevel](message);

    originalEnd.apply(this, args);
  };

  next();
};

export default requestLogger;
