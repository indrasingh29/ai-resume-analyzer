"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const response = await api.login(input);
    setStoredToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const response = await api.register(input);
      setStoredToken(response.token);
      setUser(response.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
