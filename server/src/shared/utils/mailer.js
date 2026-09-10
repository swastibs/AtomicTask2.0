import nodemailer from "nodemailer";
import logger from "./logger.js";
import {
  CLIENT_URL,
  IS_PRODUCTION,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
} from "../config/envConfig.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailer = getTransporter();

  if (!mailer) {
    if (IS_PRODUCTION) {
      logger.error(`SMTP is not configured. Dropped email to ${to}: ${subject}`);
      return;
    }
    logger.info(`[mail:dev] to=${to} subject=${subject}\n${text}`);
    return;
  }

  await mailer.sendMail({ from: SMTP_FROM, to, subject, text, html });
};

export const sendVerificationEmail = async (user, rawToken) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${rawToken}`;
  const text = `Hi ${user.name},\n\nVerify your AtomicTask account:\n${verifyUrl}\n\nThis link expires in 24 hours. If you did not create this account, ignore this email.`;

  await sendMail({
    to: user.email,
    subject: "Verify your AtomicTask email",
    text,
    html: `<p>Hi ${user.name},</p><p><a href="${verifyUrl}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
  });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${rawToken}`;
  const text = `Hi ${user.name},\n\nReset your AtomicTask password:\n${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`;

  await sendMail({
    to: user.email,
    subject: "Reset your AtomicTask password",
    text,
    html: `<p>Hi ${user.name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 15 minutes.</p>`,
  });
};
