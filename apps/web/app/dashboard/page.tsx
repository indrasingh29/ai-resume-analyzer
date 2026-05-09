"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, BrainCircuit, FileText, LogOut, Target, Trophy } from "lucide-react";
import { AnalysisResult } from "@/components/analysis-result";
import { useAuth } from "@/components/auth-provider";
import { ResumeHistory } from "@/components/resume-history";
import { StatCard } from "@/components/stat-card";
import { UploadPanel } from "@/components/upload-panel";
import { api } from "@/lib/api";
import type { DashboardSummary, ResumeAnalysis } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoadingSummary(true);
    setDashboardError("");

    try {
      const response = await api.dashboard();
      setSummary(response.summary);
      setSelectedAnalysis((current) => current ?? response.summary.recentAnalyses[0] ?? null);
    } catch (caughtError) {
      setDashboardError(
        caughtError instanceof Error ? caughtError.message : "Unable to load dashboard"
      );
    } finally {
      setLoadingSummary(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const recentAnalyses = summary?.recentAnalyses ?? [];
  const statCards = useMemo(
    () => [
      {
        label: "Analyses",
        value: summary?.totalAnalyses ?? 0,
        icon: FileText,
        tone: "mint" as const
      },
      {
        label: "Average ATS",
        value: summary?.averageScore ?? 0,
        icon: BarChart3,
        tone: "gold" as const
      },
      {
        label: "Best score",
        value: summary?.bestScore ?? 0,
        icon: Trophy,
        tone: "coral" as const
      }
    ],
    [summary]
  );

  async function handleAnalyzed(analysis: ResumeAnalysis) {
    setSelectedAnalysis(analysis);
    await loadDashboard();
  }

  async function handleDelete(id: string) {
    await api.deleteAnalysis(id);
    setSelectedAnalysis((current) => (current?._id === id ? null : current));
    await loadDashboard();
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <SignedOutState />;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-black/10 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink text-white">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-gray-500">AI Resume Analyzer</p>
              <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-ink"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {dashboardError ? (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <UploadPanel onAnalyzed={handleAnalyzed} />
            <ResumeHistory
              analyses={recentAnalyses}
              selectedId={selectedAnalysis?._id}
              onSelect={setSelectedAnalysis}
              onDelete={handleDelete}
            />
            <MissingKeywordPanel keywords={summary?.topMissingKeywords ?? []} />
          </div>

          <div>
            {loadingSummary && !summary ? (
              <div className="rounded-lg border border-black/10 bg-white p-8 text-sm text-gray-500 shadow-sm">
                Loading dashboard...
              </div>
            ) : (
              <AnalysisResult analysis={selectedAnalysis} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function MissingKeywordPanel({
  keywords
}: {
  keywords: Array<{
    keyword: string;
    count: number;
  }>;
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-coral">
          <Target className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold text-ink">Recurring gaps</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.length > 0 ? (
          keywords.map((item) => (
            <span
              key={item.keyword}
              className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm text-coral"
            >
              {item.keyword} · {item.count}
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-500">No recurring keyword gaps yet.</p>
        )}
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-lg border border-black/10 bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
        Loading workspace...
      </div>
    </main>
  );
}

function SignedOutState() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-lg border border-black/10 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white">
          <BrainCircuit className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold text-ink">AI Resume Analyzer</h1>
        <p className="mt-3 text-gray-600">Sign in to access your dashboard.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-mint px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-gray-200 px-5 py-3 font-semibold text-ink transition hover:border-mint"
          >
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
