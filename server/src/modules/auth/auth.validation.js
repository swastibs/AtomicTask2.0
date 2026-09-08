import { Joi } from "express-validation";
import { THEME } from "../../shared/constants/user.constants.js";

// ----- Shared schemas / reusable rules -----
const username = Joi.string()
  .min(3)
  .max(30)
  .pattern(/^[a-zA-Z_.]+$/)
  .messages({
    "string.base": "Username must be a string",
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 30 characters",
    "string.pattern.base":
      "Username can only contain letters, underscores, and dots",
    "any.required": "Username is required",
  });

const email = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  });

const password = Joi.string().min(4).messages({
  "string.base": "Password must be a string",
  "string.empty": "Password is required",
  "string.min": "Password must be at least 4 characters",
  "any.required": "Password is required",
});

const phone = Joi.string()
  .pattern(/^\+?[1-9]\d{7,14}$/)
  .allow(null, "")
  .messages({
    "string.pattern.base":
      "Phone must be in E.164 format (e.g., +919876543210)",
  });

const timezone = Joi.string().default("UTC");
const theme = Joi.string()
  .valid(...Object.values(THEME))
  .default(THEME.SYSTEM);
const avatar = Joi.string().uri().allow(null);
const bio = Joi.string().max(280).allow("");

// ----- 1. SIGNUP -----
export const signupValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    }),
    username: username.required(),
    email: email.required(),
    password: password.required(),
    phone,
    timezone,
    theme,
    avatar,
    bio,
    preferences: Joi.object().optional(),
    settings: Joi.object().optional(),
  }),
};

// ----- 2. LOGIN -----
export const loginValidation = {
  body: Joi.object({
    email: email.required(),
    password: password.required(),
  }),
};

// ----- 3. EMAIL VERIFICATION -----
export const verifyEmailValidation = {
  params: Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Verification token is required",
      "any.required": "Verification token is required",
    }),
  }),
};

// ----- 4. FORGOT PASSWORD (request reset link) -----
export const forgotPasswordValidation = {
  body: Joi.object({
    email: email.required(),
  }),
};

// ----- 5. RESET PASSWORD (with token) -----
export const resetPasswordValidation = {
  body: Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Reset token is required",
      "any.required": "Reset token is required",
    }),
    password: password.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "string.empty": "Please confirm your password",
        "any.required": "Password confirmation is required",
      }),
  }),
};

// ----- 6. CHANGE PASSWORD (authenticated) -----
export const changePasswordValidation = {
  body: Joi.object({
    oldPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
      "any.required": "Current password is required",
    }),
    newPassword: password.required(),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "New passwords do not match",
        "string.empty": "Please confirm your new password",
        "any.required": "New password confirmation is required",
      }),
  }),
};

// ----- 7. UPDATE PROFILE (authenticated) -----
export const updateProfileValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    username: username.optional(),
    email: email.optional(),
    phone,
    timezone,
    theme,
    avatar,
    bio,
    preferences: Joi.object().optional(),
    settings: Joi.object().optional(),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

// ----- 8. REFRESH TOKEN -----
export const refreshTokenValidation = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
      "any.required": "Refresh token is required",
    }),
  }),
};
