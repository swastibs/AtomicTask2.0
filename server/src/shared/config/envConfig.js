import "dotenv/config";

export const PORT = process.env.PORT || 8080;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
export const BCRYPT_SALT_ROUNDS =
  parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
