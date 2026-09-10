import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} from "../config/envConfig.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      tv: user.tokenVersion ?? 0,
      type: "access",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      tv: user.tokenVersion ?? 0,
      type: "refresh",
      jti: crypto.randomBytes(16).toString("hex"),
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.type !== "access") {
    throw new jwt.JsonWebTokenError("Invalid token type");
  }
  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  if (decoded.type !== "refresh") {
    throw new jwt.JsonWebTokenError("Invalid token type");
  }
  return decoded;
};

export const decodeToken = (token) => jwt.decode(token);

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateOpaqueToken = () => crypto.randomBytes(32).toString("hex");
