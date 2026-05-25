"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, BrainCircuit, Lock } from "lucide-react";
import { api } from "@/lib/api";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.resetPassword({ token, password });
      setMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-ink p-8 text-white sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint text-white">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-white/70">AI Resume Analyzer</p>
              <h1 className="text-2xl font-semibold">Resume intelligence workspace</h1>
            </div>
          </div>
          <div className="mt-12 grid gap-4 text-sm text-white/75">
            <p>Create a new password and continue from your saved dashboard history.</p>
            <p>Reset links expire automatically to keep account recovery bounded.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-mint">New password</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Reset account access</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Password</span>
              <span className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-mint">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full outline-none"
                  placeholder="At least 8 characters"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Confirm password</span>
              <span className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-mint">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full outline-none"
                  placeholder="Repeat password"
                />
              </span>
            </label>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-3 text-sm text-teal-900">
              <p>{message}</p>
              <Link href="/login" className="mt-3 inline-flex font-semibold text-mint hover:text-teal-800">
                Sign in
              </Link>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-mint px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Reset password"}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </section>
    </main>
  );
}
