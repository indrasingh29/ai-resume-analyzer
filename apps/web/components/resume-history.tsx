"use client";

import { Clock3, Trash2 } from "lucide-react";
import { ScoreRing } from "@/components/score-ring";
import type { ResumeAnalysis } from "@/lib/types";

type ResumeHistoryProps = {
  analyses: ResumeAnalysis[];
  selectedId?: string;
  onSelect: (analysis: ResumeAnalysis) => void;
  onDelete: (id: string) => void;
};

export function ResumeHistory({ analyses, selectedId, onSelect, onDelete }: ResumeHistoryProps) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Recent resumes</h2>
          <p className="mt-1 text-sm text-gray-500">{analyses.length} saved analyses</p>
        </div>
        <Clock3 className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>

      <div className="space-y-3">
        {analyses.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-4 py-5 text-sm text-gray-500">
            No resume analyses yet.
          </p>
        ) : (
          analyses.map((analysis) => (
            <article
              key={analysis._id}
              className={`rounded-lg border p-3 transition ${
                selectedId === analysis._id
                  ? "border-mint bg-teal-50/40"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(analysis)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <ScoreRing score={analysis.analysis.atsScore} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{analysis.fileName}</span>
                    <span className="mt-1 block truncate text-sm text-gray-500">
                      {analysis.targetRole || "No target role"} ·{" "}
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(analysis._id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Delete ${analysis.fileName}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
