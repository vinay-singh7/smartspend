"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
];

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, refreshUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await api.patch("/auth/currency", { preferredCurrency: e.target.value });
      await refreshUser();
      toast.success(`Currency changed to ${e.target.value}`);
    } catch {
      toast.error("Failed to update currency");
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">SmartSpend</h1>
        <nav className="hidden gap-2 md:flex">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "btn relative transition-colors",
                  isActive ? "text-cyan-900 dark:text-cyan-100 font-medium" : "bg-slate-200/50 hover:bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                )}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="topNavIndicator"
                    className="absolute inset-0 z-0 rounded-xl bg-cyan-100 dark:bg-cyan-900/40"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={user?.preferredCurrency || "USD"}
            onChange={handleCurrencyChange}
            className="btn bg-slate-200/80 text-sm dark:bg-slate-800"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn bg-slate-200/80 transition-transform hover:scale-105 active:scale-95 dark:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/auth");
            }}
            className="btn bg-rose-500 text-white transition-transform hover:scale-105 active:scale-95 hover:bg-rose-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

