import express from "express";
import { validate } from "express-validation";
import { login, signup, refreshToken, logout } from "./auth.controller.js";
import {
  loginValidation,
  signupValidation,
  refreshTokenValidation,
} from "./auth.validation.js";

const router = express.Router();

router.post(
  "/signup",
  validate(
    signupValidation,
    { context: true },
    { abortEarly: false, stripUnknown: true },
  ),
  signup,
);

router.post(
  "/login",
  validate(
    loginValidation,
    { context: true },
    { abortEarly: false, stripUnknown: true },
  ),
  login,
);

router.post(
  "/refresh-token",
  validate(
    refreshTokenValidation,
    { context: true },
    { abortEarly: false, stripUnknown: true },
  ),
  refreshToken,
);

router.post(
  "/logout",
  validate(
    refreshTokenValidation,
    { context: true },
    { abortEarly: false, stripUnknown: true },
  ),
  logout,
);

export default router;
