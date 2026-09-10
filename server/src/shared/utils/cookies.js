import {
  COOKIE_NAME,
  COOKIE_SAMESITE,
  COOKIE_SECURE,
  JWT_EXPIRES_IN_MS,
  JWT_REFRESH_EXPIRES_IN_MS,
} from "../config/envConfig.js";
import { REFRESH_COOKIE_PATH } from "../constants/auth.constants.js";

const cookieOptions = {
  httpOnly: true,
  secure: COOKIE_SECURE,
  sameSite: COOKIE_SAMESITE,
  path: REFRESH_COOKIE_PATH,
};

export const getRefreshTokenFromRequest = (req) =>
  req.cookies?.[COOKIE_NAME] || req.body?.refreshToken || null;

export const shouldReturnRefreshTokenInBody = (req) =>
  String(req.get("x-client-type") || "").toLowerCase() === "native";

export const setRefreshCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: JWT_REFRESH_EXPIRES_IN_MS,
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
};

export const buildAuthPayload = (req, { accessToken, refreshToken }) => {
  const payload = {
    accessToken,
    tokenType: "Bearer",
    expiresIn: Math.floor(JWT_EXPIRES_IN_MS / 1000),
  };

  if (shouldReturnRefreshTokenInBody(req)) {
    payload.refreshToken = refreshToken;
  }

  return payload;
};
