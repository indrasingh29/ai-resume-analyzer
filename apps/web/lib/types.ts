export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type SectionScore = {
  label: string;
  score: number;
  weight: number;
  notes: string;
};

export type ResumeAnalysis = {
  _id: string;
  fileName: string;
  fileSize: number;
  targetRole?: string;
  company?: string;
  jobDescription?: string;
  textPreview: string;
  wordCount: number;
  analysis: {
    atsScore: number;
    summary: string;
    keywordMatches: string[];
    missingKeywords: string[];
    strengths: string[];
    improvements: string[];
    interviewQuestions: string[];
    sectionScores: SectionScore[];
  };
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  topMissingKeywords: Array<{
    keyword: string;
    count: number;
  }>;
  recentAnalyses: ResumeAnalysis[];
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type ForgotPasswordResponse = {
  message: string;
  resetUrl?: string;
};

export type ResetPasswordResponse = {
  message: string;
};
