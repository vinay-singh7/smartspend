export type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  createdAt: string;
};

export type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
  currency: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  createdAt: string;
};
