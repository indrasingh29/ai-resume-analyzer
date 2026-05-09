"use client";

import { useState, type FormEvent } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { api } from "@/lib/api";
import type { ResumeAnalysis } from "@/lib/types";

type UploadPanelProps = {
  onAnalyzed: (analysis: ResumeAnalysis) => void;
};

export function UploadPanel({ onAnalyzed }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a PDF resume before analyzing.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("targetRole", targetRole);
    formData.append("company", company);
    formData.append("jobDescription", jobDescription);

    setSubmitting(true);

    try {
      const response = await api.analyzeResume(formData);
      onAnalyzed(response.analysis);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to analyze resume");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">New analysis</h2>
          <p className="mt-1 text-sm text-gray-500">PDF upload with role-specific scoring.</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-mint">
          <UploadCloud className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-mint hover:bg-teal-50/40">
        <FileText className="h-8 w-8 text-mint" aria-hidden="true" />
        <span className="mt-3 text-sm font-semibold text-ink">
          {file ? file.name : "Select resume PDF"}
        </span>
        <span className="mt-1 text-xs text-gray-500">Maximum 5 MB</span>
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Target role</span>
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Fullstack Engineer"
            className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-mint"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">Company</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Acme Labs"
            className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-mint"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium text-gray-700">Job description</span>
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={6}
          placeholder="Paste the job description or key requirements..."
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-mint"
        />
      </label>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
        {submitting ? "Analyzing..." : "Analyze resume"}
      </button>
    </form>
  );
}
