import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", authenticate, getDashboardSummary);
