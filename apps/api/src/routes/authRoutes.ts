import { Router } from "express";
import {
  forgotPassword,
  login,
  me,
  register,
  resetPassword
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
authRoutes.get("/me", authenticate, me);
