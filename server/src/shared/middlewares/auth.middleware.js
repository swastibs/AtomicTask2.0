import passport from "passport";
import ApiError from "../utils/ApiError.js";

export const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const message = info?.message || "Invalid token";
      return next(ApiError.unauthorized(message));
    }
    req.user = user;
    next();
  })(req, res, next);
};
