"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("smartspend_token");
    const storedUser = localStorage.getItem("smartspend_user");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("smartspend_token", nextToken);
    localStorage.setItem("smartspend_user", JSON.stringify(nextUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("smartspend_token");
    localStorage.removeItem("smartspend_user");
  };

  const refreshUser = async () => {
    const response = await api.get("/auth/me");
    setUser(response.data.user);
    localStorage.setItem("smartspend_user", JSON.stringify(response.data.user));
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refreshUser }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
