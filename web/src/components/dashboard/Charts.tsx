"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CategoryData = { name: string; value: number };
type MonthlyData = { month: string; expense: number; income?: number };

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="glass-card h-80">
      <h3 className="mb-4 text-sm font-semibold">Category Distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={95} fill="#0891b2" />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="glass-card h-80">
      <h3 className="mb-4 text-sm font-semibold">Monthly Expenses</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="expense" fill="#06b6d4" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
