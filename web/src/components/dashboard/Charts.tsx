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
  Area,
  AreaChart,
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

export function TrendAreaChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="glass-card h-[400px] flex flex-col">
      <h3 className="mb-4 text-sm font-semibold">Spending & Income Trend</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
              axisLine={false}
              tickLine={false}
              dx={-10}
              tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tw-glass-bg, rgba(255,255,255,0.8))",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                border: "1px solid rgba(148,163,184,0.2)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
              }
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#f43f5e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
