import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";


import User from "../../modules/auth/auth.model.js";
import { JWT_SECRET } from "./envConfig.js";
import { AUTH_PROVIDERS, USER_STATUS } from "../constants/user.constants.js";

// ── Local Strategy ──
const localStrategy = new LocalStrategy(
  {
    usernameField: "identifier",
    passwordField: "password",
    passReqToCallback: false,
  },
  async (identifier, password, done) => {
    try {
      const normalizedIdentifier = identifier.toLowerCase().trim();

      const user = await User.findOne({
        $or: [
          { email: normalizedIdentifier },
          { username: normalizedIdentifier },
        ],
      }).select("+password");

      if (!user) {
        return done(null, false, { message: "Invalid credentials." });
      }

      if (user.authProvider !== AUTH_PROVIDERS.EMAIL) {
        return done(null, false, {
          message: `This account uses ${user.authProvider} sign-in. Please use that method.`,
        });
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return done(null, false, {
          message: "Your account is not active. Please contact support.",
        });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return done(null, false, { message: "Invalid credentials." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  },
);

// ── JWT Strategy ──
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
  algorithms: ["HS256"],
  ignoreExpiration: false,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id).select("-password -__v");
    if (!user) {
      return done(null, false);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return done(null, false);
    }
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
});

export const passportConfig = { localStrategy, jwtStrategy };
