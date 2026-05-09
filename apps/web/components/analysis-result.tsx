import { CheckCircle2, ListChecks, MessageSquareText, Sparkles, TriangleAlert } from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import type { ResumeAnalysis } from "@/lib/types";

type AnalysisResultProps = {
  analysis: ResumeAnalysis | null;
};

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  if (!analysis) {
    return (
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-coral">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-ink">Analysis result</h2>
            <p className="mt-1 text-sm text-gray-500">Upload a resume to populate the scorecard.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center">
            <ScoreRing score={analysis.analysis.atsScore} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{analysis.fileName}</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {analysis.targetRole || "Resume analysis"}
            </h2>
            <p className="mt-3 text-gray-600">{analysis.analysis.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Metric label="Words parsed" value={analysis.wordCount.toLocaleString()} />
              <Metric label="Keyword matches" value={analysis.analysis.keywordMatches.length} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Score breakdown" icon={ListChecks}>
          <div className="space-y-4">
            {analysis.analysis.sectionScores.map((section) => (
              <div key={section.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{section.label}</p>
                  <p className="text-sm font-semibold text-mint">{section.score}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-mint"
                    style={{ width: `${section.score}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">{section.notes}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Interview questions" icon={MessageSquareText}>
          <ol className="space-y-3">
            {analysis.analysis.interviewQuestions.map((question, index) => (
              <li key={question} className="flex gap-3 text-sm text-gray-700">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-mint">
                  {index + 1}
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Strengths" icon={CheckCircle2}>
          <BulletList items={analysis.analysis.strengths} tone="positive" />
        </Panel>
        <Panel title="Improvements" icon={TriangleAlert}>
          <BulletList items={analysis.analysis.improvements} tone="warning" />
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <KeywordPanel title="Matched keywords" keywords={analysis.analysis.keywordMatches} tone="match" />
        <KeywordPanel title="Missing keywords" keywords={analysis.analysis.missingKeywords} tone="missing" />
      </div>
    </section>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: typeof Sparkles;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-mint">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function BulletList({ items, tone }: { items: string[]; tone: "positive" | "warning" }) {
  const markerClass = tone === "positive" ? "bg-teal-100 text-mint" : "bg-orange-100 text-coral";

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-gray-700">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${markerClass}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function KeywordPanel({
  title,
  keywords,
  tone
}: {
  title: string;
  keywords: string[];
  tone: "match" | "missing";
}) {
  const chipClass =
    tone === "match"
      ? "border-teal-200 bg-teal-50 text-mint"
      : "border-orange-200 bg-orange-50 text-coral";

  return (
    <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.length > 0 ? (
          keywords.map((keyword) => (
            <span key={keyword} className={`rounded-full border px-3 py-1 text-sm ${chipClass}`}>
              {keyword}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">No keywords in this group.</p>
        )}
      </div>
    </div>
  );
}
