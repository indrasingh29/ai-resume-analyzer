import crypto from "node:crypto";
import { z } from "zod";
import { ResumeAnalysisModel } from "../models/ResumeAnalysis";
import { analyzeResume } from "../services/atsAnalyzer";
import { generateInterviewQuestions } from "../services/questionGenerator";
import { parseResumePdf } from "../services/resumeParser";
import { ApiError, asyncHandler } from "../utils/http";

const analyzeBodySchema = z.object({
  targetRole: z.string().trim().max(120).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  jobDescription: z.string().trim().max(8000).optional().or(z.literal(""))
});

export const analyzeUploadedResume = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  if (!req.file) {
    throw new ApiError(400, "Resume PDF file is required");
  }

  const body = analyzeBodySchema.parse(req.body);
  const resumeText = await parseResumePdf(req.file.buffer);
  const atsAnalysis = analyzeResume({
    resumeText,
    targetRole: normalizeOptional(body.targetRole),
    jobDescription: normalizeOptional(body.jobDescription)
  });
  const interviewQuestions = await generateInterviewQuestions({
    resumeText,
    targetRole: normalizeOptional(body.targetRole),
    company: normalizeOptional(body.company),
    analysis: atsAnalysis
  });
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const analysis = await ResumeAnalysisModel.create({
    user: req.user.id,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileHash: crypto.createHash("sha256").update(req.file.buffer).digest("hex"),
    targetRole: normalizeOptional(body.targetRole),
    company: normalizeOptional(body.company),
    jobDescription: normalizeOptional(body.jobDescription),
    textPreview: resumeText.slice(0, 1800),
    wordCount,
    analysis: {
      ...atsAnalysis,
      interviewQuestions
    }
  });

  res.status(201).json({
    analysis
  });
});

export const listResumeAnalyses = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  const analyses = await ResumeAnalysisModel.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({
    analyses
  });
});

export const getResumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  const analysis = await ResumeAnalysisModel.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!analysis) {
    throw new ApiError(404, "Resume analysis not found");
  }

  res.json({
    analysis
  });
});

export const deleteResumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  const analysis = await ResumeAnalysisModel.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!analysis) {
    throw new ApiError(404, "Resume analysis not found");
  }

  res.status(204).send();
});

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
