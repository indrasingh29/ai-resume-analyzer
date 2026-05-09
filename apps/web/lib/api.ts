import type { AuthResponse, DashboardSummary, ResumeAnalysis, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "resume_analyzer_token";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const token = getStoredToken();

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const data = (await response.json()) as { message?: string };
      message = data.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  register(input: { name: string; email: string; password: string }) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input)
    });
  },
  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input)
    });
  },
  me() {
    return apiRequest<{ user: User }>("/auth/me");
  },
  dashboard() {
    return apiRequest<{ summary: DashboardSummary }>("/dashboard/summary");
  },
  analyzeResume(formData: FormData) {
    return apiRequest<{ analysis: ResumeAnalysis }>("/resumes/analyze", {
      method: "POST",
      body: formData
    });
  },
  deleteAnalysis(id: string) {
    return apiRequest<void>(`/resumes/${id}`, {
      method: "DELETE"
    });
  }
};
