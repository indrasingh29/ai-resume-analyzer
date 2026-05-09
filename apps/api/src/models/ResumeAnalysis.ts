import { model, Schema, Types, type HydratedDocument } from "mongoose";

export type SectionScore = {
  label: string;
  score: number;
  weight: number;
  notes: string;
};

export type ResumeAnalysisPayload = {
  atsScore: number;
  summary: string;
  keywordMatches: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  interviewQuestions: string[];
  sectionScores: SectionScore[];
};

export type ResumeAnalysis = {
  user: Types.ObjectId;
  fileName: string;
  fileSize: number;
  fileHash: string;
  targetRole?: string;
  company?: string;
  jobDescription?: string;
  textPreview: string;
  wordCount: number;
  analysis: ResumeAnalysisPayload;
  createdAt: Date;
  updatedAt: Date;
};

export type ResumeAnalysisDocument = HydratedDocument<ResumeAnalysis>;

const sectionScoreSchema = new Schema<SectionScore>(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true, min: 0 },
    notes: { type: String, required: true }
  },
  { _id: false }
);

const analysisSchema = new Schema<ResumeAnalysisPayload>(
  {
    atsScore: { type: Number, required: true, min: 0, max: 100 },
    summary: { type: String, required: true },
    keywordMatches: [{ type: String, required: true }],
    missingKeywords: [{ type: String, required: true }],
    strengths: [{ type: String, required: true }],
    improvements: [{ type: String, required: true }],
    interviewQuestions: [{ type: String, required: true }],
    sectionScores: [sectionScoreSchema]
  },
  { _id: false }
);

const resumeAnalysisSchema = new Schema<ResumeAnalysis>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileHash: { type: String, required: true },
    targetRole: { type: String, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 120 },
    jobDescription: { type: String, trim: true, maxlength: 8000 },
    textPreview: { type: String, required: true },
    wordCount: { type: Number, required: true },
    analysis: { type: analysisSchema, required: true }
  },
  {
    timestamps: true
  }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

export const ResumeAnalysisModel = model<ResumeAnalysis>(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
