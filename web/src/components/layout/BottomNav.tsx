"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs",
                pathname === item.href ? "bg-cyan-600 text-white" : "text-slate-500",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
