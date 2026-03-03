"use client";

import { CATEGORIES } from "@/lib/constants";

type Filters = {
  search: string;
  from: string;
  to: string;
  category: string;
  type: string;
};

export function TransactionFilters({
  filters,
  onChange,
  onApply,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onApply: () => void;
}) {
  return (
    <div className="glass-card space-y-3">
      <h3 className="text-sm font-semibold">Filter & Search</h3>
      <input
        className="input"
        placeholder="Search by title..."
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="input"
          type="date"
          value={filters.from}
          onChange={(event) => onChange({ ...filters, from: event.target.value })}
        />
        <input
          className="input"
          type="date"
          value={filters.to}
          onChange={(event) => onChange({ ...filters, to: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          className="input"
          value={filters.category}
          onChange={(event) => onChange({ ...filters, category: event.target.value })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select className="input" value={filters.type} onChange={(event) => onChange({ ...filters, type: event.target.value })}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <button type="button" className="btn w-full bg-cyan-600 text-white" onClick={onApply}>
        Apply Filters
      </button>
    </div>
  );
}
