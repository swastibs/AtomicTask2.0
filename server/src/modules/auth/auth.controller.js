import crypto from "crypto";
import jwt from "jsonwebtoken";

import ApiError from "../../shared/utils/ApiError.js";
import ApiResponse from "../../shared/utils/ApiResponse.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import User from "./auth.model.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../shared/config/envConfig.js";
import {
  AUTH_PROVIDERS,
  USER_STATUS,
} from "../../shared/constants/user.constants.js";
import { decodeToken, generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken } from "../../shared/utils/token.js";

export const signup = asyncHandler(async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    phone,
    timezone,
    theme,
    avatar,
    bio,
    preferences,
    settings,
  } = req.body;

  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  const [existingUsername, existingEmail] = await Promise.all([
    User.findOne({ username: normalizedUsername }).select("_id"),
    User.findOne({ email: normalizedEmail }).select("_id"),
  ]);

  if (existingUsername) throw ApiError.conflict("Username already taken.");
  if (existingEmail) throw ApiError.conflict("Email is already registered.");

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const userData = {
    name: name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    authProvider: AUTH_PROVIDERS.EMAIL,
    verificationToken,
    verificationTokenExpires,
    ...(phone && { phone }),
    ...(timezone && { timezone }),
    ...(theme && { theme }),
    ...(avatar && { avatar }),
    ...(bio && { bio }),
    ...(preferences && { preferences }),
    ...(settings && { settings }),
  };

  const user = await User.create(userData);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          token: hashToken(refreshToken),
          expiresAt: new Date(decodeToken(refreshToken).exp * 1000),
          userAgent: req.headers["user-agent"] || null,
          ip: req.ip || null,
        },
      },
    },
  );

  const responseData = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    authProvider: user.authProvider,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    requiresVerification: true,
  };

  return ApiResponse.created(
    res,
    { user: responseData, accessToken, refreshToken, tokenType: "Bearer" },
    "User registered successfully. Please verify your email.",
  );
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const normalizedIdentifier = identifier.toLowerCase().trim();

  const user = await User.findOne({
    $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }],
  }).select("+password");

  if (!user) throw ApiError.unauthorized("Invalid credentials.");

  if (user.authProvider !== AUTH_PROVIDERS.EMAIL) {
    throw ApiError.unauthorized(
      `This account uses ${user.authProvider} sign-in.`,
    );
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden("Your account is not active.");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) throw ApiError.unauthorized("Invalid credentials.");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } },
  );

  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          token: hashToken(refreshToken),
          expiresAt: new Date(decodeToken(refreshToken).exp * 1000),
          userAgent: req.headers["user-agent"] || null,
          ip: req.ip || null,
        },
      },
      $set: { lastLogin: new Date() },
    },
  );

  const responseData = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    theme: user.theme,
    emailVerified: user.emailVerified,
    preferences: user.preferences,
    gamification: user.gamification,
    subscription: user.subscription,
    settings: user.settings,
    social: user.social,
    analytics: user.analytics,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return ApiResponse.ok(
    res,
    { user: responseData, accessToken, refreshToken, tokenType: "Bearer" },
    "Login successful.",
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  const responseData = {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    theme: user.theme,
    emailVerified: user.emailVerified,
    preferences: user.preferences,
    gamification: user.gamification,
    subscription: user.subscription,
    settings: user.settings,
    social: user.social,
    analytics: user.analytics,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return ApiResponse.ok(res, responseData, "Authenticated user data");
});

export const logout = () => {};

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: incomingToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded.id).select("+refreshTokens");
  if (!user) throw ApiError.unauthorized("User no longer exists.");

  if (user.status !== USER_STATUS.ACTIVE)
    throw ApiError.forbidden("Account is not active.");

  const incomingHash = hashToken(incomingToken);
  const tokenIndex = user.refreshTokens.findIndex(
    (rt) => rt.token === incomingHash,
  );

  if (tokenIndex === -1) {
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized(
      "Refresh token reuse detected. Please log in again.",
    );
  }

  if (user.refreshTokens[tokenIndex].expiresAt < new Date()) {
    user.refreshTokens.splice(tokenIndex, 1);
    await user.save({ validateBeforeSave: false });
    throw ApiError.unauthorized("Refresh token expired. Please log in again.");
  }

  user.refreshTokens.splice(tokenIndex, 1);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshTokens.push({
    token: hashToken(newRefreshToken),
    expiresAt: new Date(decodeToken(newRefreshToken).exp * 1000),
    userAgent: req.headers["user-agent"] || null,
    ip: req.ip || null,
  });

  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date(),
  );

  await user.save({ validateBeforeSave: false });

  return ApiResponse.ok(
    res,
    {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: "Bearer",
    },
    "Token refreshed successfully.",
  );
});
