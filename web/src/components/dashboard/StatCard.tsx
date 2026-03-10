import { motion, HTMLMotionProps } from "framer-motion";
import { formatCurrency } from "@/lib/format";

type Props = {
  label: string;
  amount: number;
  currency?: string;
  accent?: "cyan" | "emerald" | "rose";
} & HTMLMotionProps<"div">;

const accentClass = {
  cyan: "from-cyan-500/20 to-cyan-100/30 dark:to-cyan-900/10",
  emerald: "from-emerald-500/20 to-emerald-100/30 dark:to-emerald-900/10",
  rose: "from-rose-500/20 to-rose-100/30 dark:to-rose-900/10",
};

export function StatCard({ label, amount, currency, accent = "cyan", className = "", ...props }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`glass-card bg-gradient-to-br transition-shadow hover:shadow-lg hover:shadow-${accent}-500/10 ${accentClass[accent]} ${className}`}
      {...props}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{formatCurrency(amount, currency)}</p>
    </motion.div>
  );
}
