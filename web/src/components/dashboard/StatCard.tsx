import { formatCurrency } from "@/lib/format";

type Props = {
  label: string;
  amount: number;
  currency?: string;
  accent?: "cyan" | "emerald" | "rose";
};

const accentClass = {
  cyan: "from-cyan-500/20 to-cyan-100/30 dark:to-cyan-900/10",
  emerald: "from-emerald-500/20 to-emerald-100/30 dark:to-emerald-900/10",
  rose: "from-rose-500/20 to-rose-100/30 dark:to-rose-900/10",
};

export function StatCard({ label, amount, currency, accent = "cyan" }: Props) {
  return (
    <div className={`glass-card bg-gradient-to-br ${accentClass[accent]}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{formatCurrency(amount, currency)}</p>
    </div>
  );
}
