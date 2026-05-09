import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { resumeRoutes } from "./resumeRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/resumes", resumeRoutes);

export default router;
