"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics" },
];

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">SmartSpend</h1>
        <nav className="hidden gap-2 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "btn",
                pathname === item.href ? "bg-cyan-600 text-white" : "bg-slate-200/80 dark:bg-slate-800",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn bg-slate-200/80 dark:bg-slate-800"
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
            className="btn bg-rose-500 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
