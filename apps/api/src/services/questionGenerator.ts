import { env } from "../config/env";
import type { AtsAnalysis } from "./atsAnalyzer";

type GenerateQuestionsInput = {
  resumeText: string;
  targetRole?: string;
  company?: string;
  analysis: AtsAnalysis;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function generateInterviewQuestions(input: GenerateQuestionsInput) {
  if (!env.OPENAI_API_KEY) {
    return fallbackQuestions(input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "Generate concise, practical interview questions from resume evidence. Return strict JSON: {\"questions\":[\"...\"]}."
          },
          {
            role: "user",
            content: [
              `Target role: ${input.targetRole || "Not specified"}`,
              `Company: ${input.company || "Not specified"}`,
              `ATS score: ${input.analysis.atsScore}`,
              `Matched keywords: ${input.analysis.keywordMatches.join(", ") || "none"}`,
              `Missing keywords: ${input.analysis.missingKeywords.join(", ") || "none"}`,
              `Resume excerpt: ${input.resumeText.slice(0, 4500)}`
            ].join("\n")
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI provider responded with ${response.status}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI provider returned an empty response");
    }

    const parsed = JSON.parse(stripCodeFence(content)) as { questions?: string[] };
    const questions = cleanQuestions(parsed.questions ?? []);

    return questions.length >= 5 ? questions : fallbackQuestions(input);
  } catch (error) {
    console.warn("Falling back to local question generation", error);
    return fallbackQuestions(input);
  }
}

function fallbackQuestions(input: GenerateQuestionsInput) {
  const role = input.targetRole?.trim() || "this role";
  const company = input.company?.trim();
  const companyPhrase = company ? ` at ${company}` : "";
  const matched = input.analysis.keywordMatches.slice(0, 5);
  const missing = input.analysis.missingKeywords.slice(0, 5);
  const questions = [
    `Walk me through the strongest project on your resume that prepares you for ${role}${companyPhrase}.`,
    "Which achievement on your resume had the clearest measurable business impact, and how did you measure it?",
    "Tell me about a time you had to explain a technical tradeoff to a non-technical stakeholder.",
    "What part of your resume would you improve first if you had one more week before applying?",
    "Describe a difficult production or delivery problem you solved and what you learned from it."
  ];

  matched.forEach((keyword) => {
    questions.push(`How have you used ${keyword} in a real project, and what tradeoffs did you make?`);
  });

  missing.forEach((keyword) => {
    questions.push(`This role may expect ${keyword}. How would you approach closing that gap quickly?`);
  });

  input.analysis.improvements.slice(0, 3).forEach((improvement) => {
    questions.push(`Your resume could improve around "${improvement}". How would you strengthen that story in an interview?`);
  });

  return cleanQuestions(questions).slice(0, 10);
}

function cleanQuestions(questions: string[]) {
  return [
    ...new Set(
      questions
        .map((question) => question.trim())
        .filter((question) => question.length > 12 && question.endsWith("?"))
    )
  ];
}

function stripCodeFence(content: string) {
  return content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
}
