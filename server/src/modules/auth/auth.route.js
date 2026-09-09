import express from "express";
import { validate } from "express-validation";
import { login, signup } from "./auth.controller.js";
import { loginValidation, signupValidation } from "./auth.validation.js";

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

export default router;
