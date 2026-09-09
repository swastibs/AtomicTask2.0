import express from "express";
import { validate } from "express-validation";
import passport from "passport";
import { login, signup, getMe } from "./auth.controller.js";
import { loginValidation, signupValidation } from "./auth.validation.js";
import { authenticateJWT } from "../../shared/middlewares/auth.middleware.js";

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
  passport.authenticate("local", { session: false }),
  login,
);

router.get("/me", authenticateJWT, getMe);

export default router;
