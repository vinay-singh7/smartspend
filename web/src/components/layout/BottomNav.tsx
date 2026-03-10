"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";
import { BarChart3, LayoutDashboard } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 md:hidden">
      <div className="mx-auto flex max-w-xl justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-colors",
                isActive ? "text-cyan-700 dark:text-cyan-300 font-medium" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300",
              )}
            >
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 z-0 rounded-xl bg-cyan-50 dark:bg-cyan-900/30"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
