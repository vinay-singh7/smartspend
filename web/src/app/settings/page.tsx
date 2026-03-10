"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";
import { Moon, Sun, LogOut, User, DollarSign, Palette } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await api.patch("/auth/currency", { preferredCurrency: e.target.value });
      await refreshUser();
      toast.success(`Currency changed to ${e.target.value}`);
    } catch {
      toast.error("Failed to update currency");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth";
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <ProtectedRoute>
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-8 pb-24">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1 }}
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100 text-3xl font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400 shadow-xl shadow-cyan-500/10">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card overflow-hidden p-0">
            <div className="border-b border-slate-200/50 bg-slate-50/50 px-5 py-3 dark:border-slate-800/50 dark:bg-slate-900/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Palette size={16} className="text-cyan-600 dark:text-cyan-400" />
                Preferences
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    {theme === "light" ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
                  </div>
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-xs text-slate-500">Toggle dark/light mode</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="btn bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  {theme === "light" ? "Switch to Dark" : "Switch to Light"}
                </button>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">Currency</p>
                    <p className="text-xs text-slate-500">Preferred display currency</p>
                  </div>
                </div>
                <select
                  value={user?.preferredCurrency || "USD"}
                  onChange={handleCurrencyChange}
                  className="input max-w-[120px] bg-slate-100 border-none dark:bg-slate-800"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card overflow-hidden p-0 border-rose-200/50 dark:border-rose-900/50">
            <div className="px-5 py-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="btn w-full flex items-center justify-center gap-2 bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
              >
                <LogOut size={16} />
                Logout
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
