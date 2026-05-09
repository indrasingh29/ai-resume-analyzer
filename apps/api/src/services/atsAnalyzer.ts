import type { SectionScore } from "../models/ResumeAnalysis";

export type AtsAnalysis = {
  atsScore: number;
  summary: string;
  keywordMatches: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  sectionScores: SectionScore[];
};

type AnalyzeResumeInput = {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
};

const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node.js",
  "express",
  "mongodb",
  "postgresql",
  "mysql",
  "graphql",
  "rest api",
  "aws",
  "azure",
  "gcp",
  "docker",
  "kubernetes",
  "ci/cd",
  "python",
  "java",
  "c#",
  "go",
  "sql",
  "tailwind",
  "redux",
  "jest",
  "testing",
  "machine learning",
  "data analysis",
  "analytics",
  "leadership",
  "agile",
  "scrum",
  "project management",
  "communication",
  "stakeholder management"
];

const ROLE_KEYWORDS: Record<string, string[]> = {
  frontend: ["javascript", "typescript", "react", "next.js", "tailwind", "testing"],
  backend: ["node.js", "express", "mongodb", "rest api", "sql", "docker"],
  fullstack: ["javascript", "typescript", "react", "node.js", "mongodb", "rest api"],
  "data analyst": ["sql", "python", "analytics", "data analysis", "stakeholder management"],
  "product manager": ["project management", "analytics", "stakeholder management", "agile"],
  "software engineer": ["javascript", "typescript", "testing", "rest api", "ci/cd", "docker"]
};

const STOP_WORDS = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "also",
  "because",
  "being",
  "between",
  "candidate",
  "company",
  "could",
  "during",
  "experience",
  "from",
  "have",
  "including",
  "into",
  "more",
  "must",
  "other",
  "over",
  "role",
  "should",
  "team",
  "that",
  "their",
  "there",
  "these",
  "this",
  "through",
  "using",
  "with",
  "work",
  "will",
  "years"
]);

export function analyzeResume(input: AnalyzeResumeInput): AtsAnalysis {
  const normalizedResume = input.resumeText.toLowerCase();
  const desiredKeywords = selectDesiredKeywords(input);
  const keywordMatches = desiredKeywords.filter((keyword) =>
    containsTerm(normalizedResume, keyword)
  );
  const missingKeywords = desiredKeywords.filter(
    (keyword) => !keywordMatches.includes(keyword)
  );

  const sectionScores = buildSectionScores(input.resumeText, keywordMatches, desiredKeywords);
  const totalWeight = sectionScores.reduce((total, section) => total + section.weight, 0);
  const weightedScore =
    sectionScores.reduce((total, section) => total + section.score * section.weight, 0) /
    totalWeight;
  const atsScore = clamp(Math.round(weightedScore), 0, 100);

  return {
    atsScore,
    summary: buildSummary(atsScore, keywordMatches, missingKeywords),
    keywordMatches,
    missingKeywords,
    strengths: buildStrengths(sectionScores, keywordMatches),
    improvements: buildImprovements(sectionScores, missingKeywords),
    sectionScores
  };
}

function buildSectionScores(
  resumeText: string,
  keywordMatches: string[],
  desiredKeywords: string[]
): SectionScore[] {
  const normalized = resumeText.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keywordCoverage =
    desiredKeywords.length > 0 ? keywordMatches.length / desiredKeywords.length : 0.65;

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText);
  const hasPhone = /(?:\+?\d[\s.-]?){8,}/.test(resumeText);
  const hasProfile = /(linkedin\.com|github\.com|portfolio|personal website)/i.test(resumeText);
  const contactScore = Math.round(((Number(hasEmail) + Number(hasPhone) + Number(hasProfile)) / 3) * 100);

  const sectionChecks = [
    /experience|employment|work history/i,
    /education|degree|university|college/i,
    /skills|technologies|toolkit/i,
    /projects|portfolio/i
  ];
  const foundSections = sectionChecks.filter((sectionRegex) => sectionRegex.test(resumeText)).length;
  const structureScore = Math.round((foundSections / sectionChecks.length) * 100);

  const hasMetrics = /\b(\d+%|\$?\d+(?:\.\d+)?[kKmM]?|reduced|increased|improved|grew|saved)\b/.test(
    resumeText
  );
  const impactPhrases = (resumeText.match(
    /\b(led|launched|built|owned|designed|optimized|automated|delivered|shipped|mentored)\b/gi
  ) ?? []).length;
  const impactScore = clamp((hasMetrics ? 45 : 10) + Math.min(impactPhrases * 8, 55), 0, 100);

  const lengthScore =
    wordCount >= 450 && wordCount <= 1200
      ? 100
      : wordCount >= 300 && wordCount <= 1600
        ? 75
        : 45;

  return [
    {
      label: "Role keyword match",
      score: Math.round(keywordCoverage * 100),
      weight: 35,
      notes: `${keywordMatches.length} of ${desiredKeywords.length} target keywords found.`
    },
    {
      label: "Resume structure",
      score: structureScore,
      weight: 20,
      notes: `${foundSections} of ${sectionChecks.length} expected sections detected.`
    },
    {
      label: "Impact evidence",
      score: impactScore,
      weight: 20,
      notes: hasMetrics
        ? "Includes measurable outcomes or quantified achievements."
        : "Add measurable outcomes to make achievements easier to rank."
    },
    {
      label: "Contact and profile",
      score: contactScore,
      weight: 15,
      notes: "Checks for email, phone, and a professional profile or portfolio."
    },
    {
      label: "ATS readability",
      score: lengthScore,
      weight: 10,
      notes: `${wordCount} parsed words. Best range is roughly 450 to 1,200 words.`
    }
  ];
}

function selectDesiredKeywords(input: AnalyzeResumeInput) {
  const roleText = input.targetRole?.toLowerCase() ?? "";
  const roleKeywords = Object.entries(ROLE_KEYWORDS)
    .filter(([role]) => roleText.includes(role))
    .flatMap(([, keywords]) => keywords);

  const jdKeywords = extractJobKeywords(input.jobDescription ?? "");
  const fallbackKeywords = ["communication", "leadership", "testing", "analytics", "project management"];
  const desired = unique([...roleKeywords, ...jdKeywords, ...fallbackKeywords]);

  return desired.slice(0, 24);
}

function extractJobKeywords(jobDescription: string) {
  if (!jobDescription.trim()) {
    return [];
  }

  const normalized = jobDescription.toLowerCase();
  const bankMatches = COMMON_SKILLS.filter((skill) => containsTerm(normalized, skill));
  const wordCounts = new Map<string, number>();

  normalized
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .forEach((word) => {
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
    });

  const repeatedTerms = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return unique([...bankMatches, ...repeatedTerms]);
}

function buildSummary(score: number, keywordMatches: string[], missingKeywords: string[]) {
  if (score >= 85) {
    return `Excellent ATS alignment with strong keyword coverage and clear resume structure. ${keywordMatches.length} role signals were found.`;
  }

  if (score >= 70) {
    return `Good ATS foundation. Add a few targeted keywords and quantified achievements to increase shortlist probability.`;
  }

  if (score >= 50) {
    return `Moderate ATS fit. The resume needs clearer role alignment, more measurable outcomes, and stronger section labeling.`;
  }

  return `Low ATS fit for the supplied role context. Prioritize missing keywords such as ${missingKeywords
    .slice(0, 4)
    .join(", ")} and make achievements easier to parse.`;
}

function buildStrengths(sectionScores: SectionScore[], keywordMatches: string[]) {
  const strengths: string[] = [];
  const strongSections = sectionScores.filter((section) => section.score >= 75);

  strongSections.slice(0, 3).forEach((section) => {
    strengths.push(`${section.label}: ${section.notes}`);
  });

  if (keywordMatches.length > 0) {
    strengths.push(`Relevant signals found: ${keywordMatches.slice(0, 6).join(", ")}.`);
  }

  return strengths.length > 0
    ? strengths
    : ["The resume has enough readable content to begin a structured optimization pass."];
}

function buildImprovements(sectionScores: SectionScore[], missingKeywords: string[]) {
  const improvements: string[] = [];
  const weakSections = sectionScores.filter((section) => section.score < 75);

  weakSections.slice(0, 3).forEach((section) => {
    improvements.push(`${section.label}: ${section.notes}`);
  });

  if (missingKeywords.length > 0) {
    improvements.push(`Naturally add missing role keywords: ${missingKeywords.slice(0, 8).join(", ")}.`);
  }

  return improvements;
}

function containsTerm(source: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9+#])${escaped}([^a-z0-9+#]|$)`, "i").test(source);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
