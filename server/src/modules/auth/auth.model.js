import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {
  AUTH_PROVIDERS,
  USER_ROLES,
  USER_STATUS,
  THEME,
  DASHBOARD_LAYOUT,
  WEEK_START_DAY,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
  INTEGRATION_PROVIDERS,
} from "../../shared/constants/user.js";

const { Schema } = mongoose;

/**
 * ============================================================
 * USER MODEL (SmartTask / AtomicTasks / HabitFlow)
 * ============================================================
 * Covers: auth, profile, preferences, gamification,
 * subscriptions, integrations, social, analytics.
 * All enum values come from constants.js — never hardcode
 * a plan/status/role string here directly.
 * ============================================================
 */

// ---------------- Sub-schema: Notification preferences ----------------
const notificationPreferencesSchema = new Schema(
  {
    email: {
      type: Boolean,
      default: true, // receive email notifications by default
    },
    push: {
      type: Boolean,
      default: true, // receive push notifications by default
    },
    sms: {
      type: Boolean,
      default: false, // SMS opt-in required
    },
  },
  { _id: false }, // no need for a separate _id on this nested object
);

// ---------------- Sub-schema: Reminder defaults ----------------
const HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const reminderPreferencesSchema = new Schema(
  {
    taskReminderTime: {
      type: String, // stored as 'HH:mm'
      default: "09:00",
      validate: {
        validator: (v) => HHMM_REGEX.test(v),
        message: (props) =>
          `${props.value} is not a valid time. Use 24-hour HH:mm format (e.g. "09:00").`,
      },
    },
    habitReminderTime: {
      type: String,
      default: "08:00",
      validate: {
        validator: (v) => HHMM_REGEX.test(v),
        message: (props) =>
          `${props.value} is not a valid time. Use 24-hour HH:mm format (e.g. "08:00").`,
      },
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Privacy settings ----------------
const privacyPreferencesSchema = new Schema(
  {
    shareStats: {
      type: Boolean,
      default: false, // productivity stats hidden from others by default
    },
    publicProfile: {
      type: Boolean,
      default: false, // profile private by default
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Preferences (parent) ----------------
const preferencesSchema = new Schema(
  {
    notifications: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    reminders: {
      type: reminderPreferencesSchema,
      default: () => ({}),
    },
    privacy: {
      type: privacyPreferencesSchema,
      default: () => ({}),
    },
    dashboardLayout: {
      type: String,
      enum: {
        values: Object.values(DASHBOARD_LAYOUT),
        message: "{VALUE} is not a supported dashboard layout.",
      },
      default: DASHBOARD_LAYOUT.LIST,
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Streaks ----------------
const streaksSchema = new Schema(
  {
    current: {
      type: Number,
      default: 0,
      min: [0, "Current streak cannot be negative."],
    },
    best: {
      type: Number,
      default: 0,
      min: [0, "Best streak cannot be negative."],
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Gamification ----------------
const gamificationSchema = new Schema(
  {
    points: {
      type: Number,
      default: 0,
      min: [0, "Points cannot be negative."],
    },
    level: {
      type: Number,
      default: 1,
      min: [1, "Level cannot be less than 1."],
    },
    xp: {
      type: Number,
      default: 0,
      min: [0, "XP cannot be negative."],
    },
    badges: {
      type: [Schema.Types.ObjectId], // array of badge IDs
      default: [],
    },
    streaks: {
      type: streaksSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Billing address ----------------
const billingAddressSchema = new Schema(
  {
    line1: { type: String, trim: true, default: "" },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

// ---------------- Sub-schema: Subscription ----------------
const subscriptionSchema = new Schema(
  {
    plan: {
      type: String,
      enum: {
        values: Object.values(SUBSCRIPTION_PLAN),
        message: "{VALUE} is not a valid subscription plan.",
      },
      default: SUBSCRIPTION_PLAN.FREE,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(SUBSCRIPTION_STATUS),
        message: "{VALUE} is not a valid subscription status.",
      },
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    trialEndsAt: {
      type: Date,
      default: null, // set when a trial period starts
    },
    paymentCustomerId: {
      type: String, // Stripe / Razorpay customer ID
      default: null,
      index: true, // faster billing lookups
    },
    billing: {
      type: billingAddressSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: App-specific settings ----------------
const settingsSchema = new Schema(
  {
    defaultTaskPriority: {
      type: Number,
      default: 3,
      min: [1, "Priority must be between 1 and 5."],
      max: [5, "Priority must be between 1 and 5."],
    },
    defaultHabitReminder: {
      type: String,
      default: "08:00",
      validate: {
        validator: (v) => HHMM_REGEX.test(v),
        message: (props) =>
          `${props.value} is not a valid time. Use 24-hour HH:mm format.`,
      },
    },
    focusTimerDuration: {
      type: Number, // minutes
      default: 25,
      min: [5, "Focus timer must be at least 5 minute."],
      max: [180, "Focus timer cannot exceed 180 minutes."],
    },
    weekStartDay: {
      type: Number,
      default: WEEK_START_DAY.MONDAY,
      enum: {
        values: Object.values(WEEK_START_DAY),
        message: "weekStartDay must be 0 (Sunday) or 1 (Monday).",
      },
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Third-party integrations ----------------
const integrationSchema = new Schema(
  {
    provider: {
      type: String,
      required: [true, "Integration provider is required."],
      enum: {
        values: Object.values(INTEGRATION_PROVIDERS),
        message: "{VALUE} is not a supported integration provider.",
      },
    },
    accessToken: {
      type: String, // should be encrypted before saving (e.g. via mongoose-encryption)
      required: [true, "Access token is required for an integration."],
      select: false, // exclude from query results by default
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
      default: null,
    },
    connected: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true, timestamps: true }, // each integration gets its own id + createdAt/updatedAt
);

// ---------------- Sub-schema: Social connections ----------------
const socialSchema = new Schema(
  {
    friends: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    accountabilityPartners: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    teams: {
      type: [{ type: Schema.Types.ObjectId, ref: "Team" }],
      default: [],
    },
  },
  { _id: false },
);

// ---------------- Sub-schema: Analytics ----------------
const analyticsSchema = new Schema(
  {
    tasksCompleted: {
      type: Number,
      default: 0,
      min: [0, "tasksCompleted cannot be negative."],
    },
    habitsCompleted: {
      type: Number,
      default: 0,
      min: [0, "habitsCompleted cannot be negative."],
    },
    productivityScore: {
      type: Number,
      default: 0,
      min: [0, "productivityScore cannot be less than 0."],
      max: [100, "productivityScore cannot exceed 100."],
    },
    lastCalculatedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

// ================================================================
// MAIN USER SCHEMA
// ================================================================
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long."],
      maxlength: [30, "Username cannot exceed 30 characters."],
      match: [
        /^[a-zA-Z_.]+$/,
        "Username can only contain letters, underscores, and dots.",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === AUTH_PROVIDERS.EMAIL;
        },
        "Password is required for email/password accounts.",
      ],
      minlength: [4, "Password must be at least 4 characters long."],
      select: false,
    },

    authProvider: {
      type: String,
      enum: {
        values: Object.values(AUTH_PROVIDERS),
        message: "{VALUE} is not a supported authentication provider.",
      },
      default: AUTH_PROVIDERS.EMAIL,
    },

    googleId: { type: String, default: null, index: true },
    githubId: { type: String, default: null, index: true },
    twitterId: { type: String, default: null, index: true },

    avatar: {
      type: String,
      default: null,
      validate: {
        validator: (v) => !v || /^https?:\/\/.+/.test(v),
        message: "Avatar must be a valid URL.",
      },
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [280, "Bio cannot exceed 280 characters."],
      default: "",
    },

    timezone: { type: String, default: "UTC" },

    language: {
      type: String,
      default: "en",
      lowercase: true,
      minlength: [2, "Language code looks too short."],
      maxlength: [5, "Language code looks too long."],
    },

    theme: {
      type: String,
      enum: {
        values: Object.values(THEME),
        message: "{VALUE} is not a supported theme.",
      },
      default: THEME.SYSTEM,
    },

    emailVerified: { type: Boolean, default: false },

    phone: {
      type: String,
      default: null,
      validate: {
        validator: (v) => !v || /^\+?[1-9]\d{7,14}$/.test(v),
        message:
          "Please provide a valid phone number in E.164 format (e.g. +919876543210).",
      },
    },

    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: "{VALUE} is not a valid account status.",
      },
      default: USER_STATUS.ACTIVE,
    },

    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: "{VALUE} is not a valid role.",
      },
      default: USER_ROLES.USER,
    },

    lastLogin: { type: Date, default: null },

    // ---------- Nested feature groups ----------
    preferences: { type: preferencesSchema, default: () => ({}) },
    gamification: { type: gamificationSchema, default: () => ({}) },
    subscription: { type: subscriptionSchema, default: () => ({}) },
    settings: { type: settingsSchema, default: () => ({}) },
    integrations: { type: [integrationSchema], default: [] },
    social: { type: socialSchema, default: () => ({}) },
    analytics: { type: analyticsSchema, default: () => ({}) },

    // ---------- Password reset / email verification ----------
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    verificationToken: { type: String, default: null, select: false },
    verificationTokenExpires: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// INDEXES
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ "subscription.paymentCustomerId": 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });
userSchema.index({ twitterId: 1 });

// Hash the password before saving, only if it was modified and exists
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(16);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// INSTANCE METHODS
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
