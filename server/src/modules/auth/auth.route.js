import express from "express";
import { validate } from "express-validation";
import { signup } from "./auth.controller.js";
import { signupValidation } from "./auth.validation.js";

const router = express.Router();

router.post(
  "/signup",
  validate(signupValidation, { context: true }, { abortEarly: false }),
  signup,
);

export default router;
