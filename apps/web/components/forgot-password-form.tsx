"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, BrainCircuit, Mail } from "lucide-react";
import { api } from "@/lib/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setSubmitting(true);

    try {
      const response = await api.requestPasswordReset({ email });
      setMessage(response.message);
      setResetUrl(response.resetUrl ?? "");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to prepare reset link");
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
            <p>Recover access without losing saved ATS history.</p>
            <p>Use the reset form to set a new password and return to your dashboard.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-mint">Password reset</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">Recover your account</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">Email</span>
            <span className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-mint">
              <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full outline-none"
                placeholder="alex@example.com"
              />
            </span>
          </label>

          {message ? (
            <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-3 text-sm text-teal-900">
              <p>{message}</p>
              {resetUrl ? (
                <a
                  href={resetUrl}
                  className="mt-3 inline-flex font-semibold text-mint hover:text-teal-800"
                >
                  Open reset form
                </a>
              ) : null}
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
            {submitting ? "Preparing..." : "Get reset link"}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link href="/login" className="font-semibold text-mint hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
