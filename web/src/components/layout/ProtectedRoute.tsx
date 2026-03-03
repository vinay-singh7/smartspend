"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/auth");
    }
  }, [token, loading, router]);

  if (loading || !token) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading your workspace...</div>;
  }
  return <>{children}</>;
}
