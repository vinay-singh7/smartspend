"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { ExportActions } from "@/components/dashboard/ExportActions";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Transaction } from "@/lib/types";

const initialFilters = { search: "", from: "", to: "", category: "", type: "" };

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions", { params: filters });
      setTransactions(res.data.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <ProtectedRoute>
      <TopBar />
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-sm text-slate-500">Manage and filter all your historical transactions here.</p>
          </div>
          <ExportActions month={currentMonth} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <TransactionFilters filters={filters} onChange={setFilters} onApply={fetchTransactions} />
          
          <div className={loading ? "opacity-60 pointer-events-none" : ""}>
            <TransactionTable
              transactions={transactions}
              onRefresh={fetchTransactions}
              preferredCurrency={user?.preferredCurrency}
            />
          </div>
        </motion.div>
      </main>
      <BottomNav />
      <AIAssistant />
    </ProtectedRoute>
  );
}
