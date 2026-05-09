import { Router } from "express";
import multer from "multer";
import { env } from "../config/env";
import {
  analyzeUploadedResume,
  deleteResumeAnalysis,
  getResumeAnalysis,
  listResumeAnalyses
} from "../controllers/resumeController";
import { authenticate } from "../middleware/auth";
import { ApiError } from "../utils/http";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_BYTES,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new ApiError(400, "Only PDF resume uploads are supported"));
      return;
    }

    callback(null, true);
  }
});

export const resumeRoutes = Router();

resumeRoutes.use(authenticate);
resumeRoutes.get("/", listResumeAnalyses);
resumeRoutes.get("/:id", getResumeAnalysis);
resumeRoutes.delete("/:id", deleteResumeAnalysis);
resumeRoutes.post("/analyze", upload.single("resume"), analyzeUploadedResume);
