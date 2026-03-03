"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CATEGORIES, CURRENCIES } from "@/lib/constants";
import { api } from "@/lib/api";

const schema = z.object({
  title: z.string().min(2),
  amount: z.coerce.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.enum(CATEGORIES),
  date: z.string().min(1),
  notes: z.string().optional(),
  currency: z.enum(CURRENCIES),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
});

type FormValues = z.infer<typeof schema>;

export function TransactionForm({
  onCreated,
  preferredCurrency = "USD",
}: {
  onCreated: () => Promise<void>;
  preferredCurrency?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      category: "Food",
      currency: (CURRENCIES.includes(preferredCurrency as (typeof CURRENCIES)[number])
        ? preferredCurrency
        : "USD") as (typeof CURRENCIES)[number],
      date: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      recurringInterval: "monthly",
    },
  });

  const isRecurring = watch("isRecurring");

  const onSubmit = async (values: FormValues) => {
    await api.post("/transactions", values);
    toast.success("Transaction added");
    reset({
      ...values,
      title: "",
      amount: 0,
      notes: "",
    });
    await onCreated();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-3">
      <h3 className="text-sm font-semibold">Add Transaction</h3>
      <input className="input" placeholder="Title" {...register("title")} />
      {errors.title && <p className="text-xs text-rose-500">{errors.title.message}</p>}

      <div className="grid grid-cols-2 gap-3">
        <input className="input" type="number" step="0.01" placeholder="Amount" {...register("amount")} />
        <select className="input" {...register("type")}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select className="input" {...register("category")}>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input className="input" type="date" {...register("date")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select className="input" {...register("currency")}>
          {CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
          <input type="checkbox" {...register("isRecurring")} />
          Recurring
        </label>
      </div>
      {isRecurring && (
        <select className="input" {...register("recurringInterval")}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      )}
      <textarea className="input min-h-20" placeholder="Notes (optional)" {...register("notes")} />
      <button type="submit" disabled={isSubmitting} className="btn w-full bg-cyan-600 text-white disabled:opacity-60">
        {isSubmitting ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
