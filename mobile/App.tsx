import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
};

type Summary = {
  count: number;
  total: number;
};

const API_BASE_URL = "http://localhost:4000";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [expensesRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/expenses`),
        fetch(`${API_BASE_URL}/expenses/summary`),
      ]);
      if (!expensesRes.ok || !summaryRes.ok) {
        throw new Error("Failed to load data");
      }
      const expensesJson = await expensesRes.json();
      const summaryJson = await summaryRes.json();
      setExpenses(expensesJson);
      setSummary(summaryJson);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleAddExpense() {
    if (!amount || !category || !date) {
      setError("Amount, category, and date are required");
      return;
    }

    const payload = {
      amount: Number(amount),
      category,
      description: description || undefined,
      date,
    };

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to add expense");
      }
      setModalVisible(false);
      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");
      await fetchData();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Expense Tracker</Text>
        <Text style={styles.subtitle}>Track your daily spending</Text>
      </View>

      {summary && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This period</Text>
          <Text style={styles.summaryAmount}>${summary.total.toFixed(2)}</Text>
          <Text style={styles.summaryCount}>{summary.count} expenses</Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color="#38bdf8" />
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recent expenses</Text>
        <Pressable onPress={fetchData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View>
              <Text style={styles.expenseCategory}>{item.category}</Text>
              {item.description ? (
                <Text style={styles.expenseDescription}>{item.description}</Text>
              ) : null}
              <Text style={styles.expenseDate}>{item.date}</Text>
            </View>
            <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No expenses yet. Add your first one!</Text>
          ) : null
        }
      />

      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Expense</Text>

            <TextInput
              placeholder="Amount (e.g. 12.50)"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="Category (e.g. Food, Transport)"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="Date (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              style={styles.input}
              placeholderTextColor="#64748b"
            />
            <TextInput
              placeholder="Notes (optional)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.inputMultiline]}
              placeholderTextColor="#64748b"
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#0f172a",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f9fafb",
    marginTop: 4,
  },
  summaryCount: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  errorText: {
    color: "#f97373",
    marginHorizontal: 20,
    marginBottom: 4,
  },
  loading: {
    marginVertical: 4,
  },
  listHeader: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  refreshText: {
    fontSize: 13,
    color: "#38bdf8",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  expenseItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#1f2933",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expenseCategory: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  expenseDescription: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#38bdf8",
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 24,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#020617",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e5e7eb",
    marginBottom: 10,
    fontSize: 14,
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginLeft: 8,
  },
  modalButtonSecondary: {
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalButtonSecondaryText: {
    color: "#e5e7eb",
  },
  modalButtonPrimary: {
    backgroundColor: "#38bdf8",
  },
  modalButtonPrimaryText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});

