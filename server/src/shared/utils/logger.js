import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Determine the log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// Custom format for console (with colors and timestamps)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

// Format for file logs (JSON, without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
);

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    // Console transport (always on)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for errors (only in production)
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: path.join(__dirname, "../../../logs/error.log"),
            level: "error",
            format: fileFormat,
          }),
          new winston.transports.File({
            filename: path.join(__dirname, "../../../logs/combined.log"),
            format: fileFormat,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

export const stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
