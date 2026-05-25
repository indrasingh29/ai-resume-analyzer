import crypto from "node:crypto";
import { env } from "../config/env";

export function createPasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry() {
  return new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MS);
}

export function buildPasswordResetUrl(token: string) {
  const origin = env.CLIENT_ORIGINS[0] || "http://localhost:3000";
  const resetUrl = new URL("/reset-password", origin);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
}
