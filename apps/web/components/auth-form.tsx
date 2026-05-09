"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, BrainCircuit, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }

      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to continue");
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
            <p>ATS scoring, keyword coverage, interview questions, and saved analysis history.</p>
            <p>Built for focused resume iteration before high-stakes applications.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-mint">{isRegister ? "Create account" : "Welcome back"}</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">
              {isRegister ? "Start analyzing resumes" : "Sign in to your dashboard"}
            </h2>
          </div>

          <div className="space-y-4">
            {isRegister ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Name</span>
                <span className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-mint">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={2}
                    className="w-full outline-none"
                    placeholder="Alex Morgan"
                  />
                </span>
              </label>
            ) : null}

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

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Password</span>
              <span className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 focus-within:border-mint">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={isRegister ? 8 : 1}
                  className="w-full outline-none"
                  placeholder={isRegister ? "At least 8 characters" : "Your password"}
                />
              </span>
            </label>
          </div>

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
            {submitting ? "Working..." : isRegister ? "Create account" : "Sign in"}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-mint hover:text-teal-800"
            >
              {isRegister ? "Sign in" : "Create one"}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
