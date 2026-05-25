import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env";
import { UserModel, toPublicUser } from "../models/User";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken
} from "../services/passwordResetService";
import { signAccessToken } from "../services/tokenService";
import { ApiError, asyncHandler } from "../utils/http";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase())
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(32).max(256),
  password: z.string().min(8).max(128)
});

const resetMessage = "If an account exists, password reset instructions are ready.";

export const register = asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const existingUser = await UserModel.findOne({ email: body.email });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await UserModel.create({
    name: body.name,
    email: body.email,
    passwordHash
  });

  res.status(201).json({
    user: toPublicUser(user),
    token: signAccessToken(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await UserModel.findOne({ email: body.email }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(body.password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  res.json({
    user: toPublicUser(user),
    token: signAccessToken(user)
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const body = forgotPasswordSchema.parse(req.body);
  const user = await UserModel.findOne({ email: body.email });
  let resetUrl: string | undefined;

  if (user) {
    const token = createPasswordResetToken();
    user.passwordResetTokenHash = hashPasswordResetToken(token);
    user.passwordResetExpiresAt = getPasswordResetExpiry();
    await user.save();

    if (env.PASSWORD_RESET_RESPONSE_MODE === "inline") {
      resetUrl = buildPasswordResetUrl(token);
    }
  }

  res.json({
    message: resetMessage,
    resetUrl
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const body = resetPasswordSchema.parse(req.body);
  const tokenHash = hashPasswordResetToken(body.token);
  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: {
      $gt: new Date()
    }
  }).select("+passwordHash +passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new ApiError(400, "Reset link is invalid or has expired");
  }

  user.passwordHash = await bcrypt.hash(body.password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  res.json({
    message: "Password updated. You can sign in with your new password."
  });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  const user = await UserModel.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({
    user: toPublicUser(user)
  });
});
