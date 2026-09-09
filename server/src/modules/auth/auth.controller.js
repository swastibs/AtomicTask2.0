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

  if (existingUsername) {
    throw ApiError.conflict("Username already taken.");
  }

  if (existingEmail) {
    throw ApiError.conflict("Email is already registered.");
  }

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
    responseData,
    "User registered successfully. Please check your email to verify your account.",
  );
});

export const login = asyncHandler(async (req, res) => {
  const user = req.user;

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
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
    { user: responseData, accessToken, tokenType: "Bearer" },
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
