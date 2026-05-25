import type {
  AuthResponse,
  DashboardSummary,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ResumeAnalysis,
  User
} from "./types";

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

  const response = await fetchWithRetry(`${API_URL}${path}`, {
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

async function fetchWithRetry(url: string, init: RequestInit) {
  const delays = [1500, 3500];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await fetch(url, init);
    } catch (error) {
      lastError = error;

      if (attempt < delays.length) {
        await wait(delays[attempt] ?? 0);
      }
    }
  }

  throw new Error(
    lastError instanceof Error && lastError.message !== "Failed to fetch"
      ? lastError.message
      : "API is waking up or temporarily unreachable. Please wait a few seconds and try again."
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
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
  requestPasswordReset(input: { email: string }) {
    return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify(input)
    });
  },
  resetPassword(input: { token: string; password: string }) {
    return apiRequest<ResetPasswordResponse>("/auth/reset-password", {
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
