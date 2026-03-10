"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = [
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#f43f5e", // rose
  "#3b82f6", // blue
  "#ec4899", // pink
];

type CategoryData = { name: string; value: number };
type MonthlyData = { month: string; expense: number; income?: number };

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="glass-card h-80">
      <h3 className="mb-4 text-sm font-semibold">Category Distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={85}
            innerRadius={40}
            paddingAngle={3}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
            }
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="glass-card h-80">
      <h3 className="mb-4 text-sm font-semibold">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} barCategoryGap="25%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)} // show "03" instead of "2026-03"
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
            }
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
