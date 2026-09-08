/**
 * ============================================================
 * APP-WIDE CONSTANTS / ENUMS
 * ============================================================
 * Single source of truth for every enum used in models,
 * controllers, and the frontend. Import from here instead of
 * hardcoding string literals so a value only ever changes
 * in one place.
 * ============================================================
 */

// ---------------- Auth ----------------
export const AUTH_PROVIDERS = {
  EMAIL: "email",
  GOOGLE: "google",
  TWITTER: "twitter",
  GITHUB: "github",
};

// ---------------- User account ----------------
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  TEAM_ADMIN: "team_admin",
};

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
};

// ---------------- Profile preferences ----------------
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const DASHBOARD_LAYOUT = {
  KANBAN: "kanban",
  LIST: "list",
  CALENDAR: "calendar",
};

export const WEEK_START_DAY = {
  SUNDAY: 0,
  MONDAY: 1,
};

// ---------------- Subscription / billing ----------------
export const SUBSCRIPTION_PLAN = {
  FREE: "free",
  PRO: "pro",
  TEAM: "team",
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
};

// ---------------- Integrations ----------------
export const INTEGRATION_PROVIDERS = {
  GOOGLE_CALENDAR: "google_calendar",
  SLACK: "slack",
  GMAIL: "gmail",
  OUTLOOK: "outlook",
  TEAMS: "teams",
};

// ---------------- Tasks ----------------
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  ARCHIVED: "archived",
};

export const TASK_PRIORITY = {
  LOWEST: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  HIGHEST: 5,
};

// ---------------- Habits ----------------
export const HABIT_FREQUENCY = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};
