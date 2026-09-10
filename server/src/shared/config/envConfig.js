import "dotenv/config";
import ms from "ms";

const getRequiredEnv = (key) => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const getOptionalEnv = (key, defaultValue) => {
  const value = process.env[key]?.trim();
  return value || defaultValue;
};

const getIntegerEnv = (key, defaultValue, { min, max } = {}) => {
  const rawValue = process.env[key];
  if (rawValue === undefined || rawValue.trim() === "") return defaultValue;
  const value = Number(rawValue);
  if (!Number.isInteger(value))
    throw new Error(`${key} must be a valid integer. Received: "${rawValue}"`);
  if (min !== undefined && value < min)
    throw new Error(
      `${key} must be greater than or equal to ${min}. Received: ${value}`,
    );
  if (max !== undefined && value > max)
    throw new Error(
      `${key} must be less than or equal to ${max}. Received: ${value}`,
    );
  return value;
};

const getBooleanEnv = (key, defaultValue) => {
  const rawValue = process.env[key]?.trim().toLowerCase();
  if (!rawValue) return defaultValue;
  if (["1", "true", "yes", "on"].includes(rawValue)) return true;
  if (["0", "false", "no", "off"].includes(rawValue)) return false;
  throw new Error(`${key} must be a boolean. Received: "${process.env[key]}"`);
};

const validateSecret = (key, secret, minLength = 32) => {
  if (secret.length < minLength)
    throw new Error(`${key} must be at least ${minLength} characters long.`);
  return secret;
};

const parseDuration = (key, value) => {
  const durationMs = ms(value);
  if (typeof durationMs !== "number" || durationMs <= 0) {
    throw new Error(
      `${key} must be a duration with a unit (e.g. "15m", "7d"). Received: "${value}"`,
    );
  }
  return durationMs;
};

export const NODE_ENV = getOptionalEnv("NODE_ENV", "development");
export const IS_PRODUCTION = NODE_ENV === "production";

export const PORT = getIntegerEnv("PORT", 8080, {
  min: 1,
  max: 65535,
});

export const MONGO_URI = getRequiredEnv("MONGO_URI");

export const BCRYPT_SALT_ROUNDS = getIntegerEnv("BCRYPT_SALT_ROUNDS", 12, {
  min: 10,
  max: 14,
});

export const JWT_SECRET = validateSecret(
  "JWT_SECRET",
  getRequiredEnv("JWT_SECRET"),
);

export const JWT_EXPIRES_IN = getOptionalEnv("JWT_EXPIRES_IN", "15m");
export const JWT_EXPIRES_IN_MS = parseDuration(
  "JWT_EXPIRES_IN",
  JWT_EXPIRES_IN,
);

export const JWT_REFRESH_SECRET = validateSecret(
  "JWT_REFRESH_SECRET",
  getRequiredEnv("JWT_REFRESH_SECRET"),
);

export const JWT_REFRESH_EXPIRES_IN = getOptionalEnv(
  "JWT_REFRESH_EXPIRES_IN",
  "30d",
);
export const JWT_REFRESH_EXPIRES_IN_MS = parseDuration(
  "JWT_REFRESH_EXPIRES_IN",
  JWT_REFRESH_EXPIRES_IN,
);

if (JWT_SECRET === JWT_REFRESH_SECRET) {
  throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be different.");
}

export const CLIENT_URL = getOptionalEnv("CLIENT_URL", "http://localhost:5173");

export const CORS_ORIGINS = getOptionalEnv(
  "CORS_ORIGIN",
  "http://localhost:3000,http://localhost:5173",
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const TRUST_PROXY = getBooleanEnv("TRUST_PROXY", false);

export const COOKIE_NAME = getOptionalEnv("COOKIE_NAME", "refreshToken");

export const COOKIE_SECURE = getBooleanEnv("COOKIE_SECURE", IS_PRODUCTION);

export const COOKIE_SAMESITE = getOptionalEnv(
  "COOKIE_SAMESITE",
  IS_PRODUCTION ? "strict" : "lax",
);

export const SMTP_HOST = getOptionalEnv("SMTP_HOST", "");
export const SMTP_PORT = getIntegerEnv("SMTP_PORT", 587, { min: 1, max: 65535 });
export const SMTP_USER = getOptionalEnv("SMTP_USER", "");
export const SMTP_PASS = getOptionalEnv("SMTP_PASS", "");
export const SMTP_FROM = getOptionalEnv(
  "SMTP_FROM",
  "AtomicTask <noreply@atomictask.local>",
);
