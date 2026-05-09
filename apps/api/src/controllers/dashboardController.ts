import { ResumeAnalysisModel } from "../models/ResumeAnalysis";
import { ApiError, asyncHandler } from "../utils/http";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication token is required");
  }

  const [totalAnalyses, recentAnalyses] = await Promise.all([
    ResumeAnalysisModel.countDocuments({ user: req.user.id }),
    ResumeAnalysisModel.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(12)
  ]);

  const scores = recentAnalyses.map((analysis) => analysis.analysis.atsScore);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const topMissingKeywords = buildKeywordFrequency(
    recentAnalyses.flatMap((analysis) => analysis.analysis.missingKeywords)
  );

  res.json({
    summary: {
      totalAnalyses,
      averageScore,
      bestScore,
      topMissingKeywords,
      recentAnalyses
    }
  });
});

function buildKeywordFrequency(keywords: string[]) {
  const counts = new Map<string, number>();

  keywords.forEach((keyword) => {
    counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([keyword, count]) => ({ keyword, count }));
}
