"use client";

import toast from "react-hot-toast";
import { api } from "@/lib/api";

export function ExportActions({ month }: { month: string }) {
  const downloadFile = async (url: string, filename: string, type: string) => {
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data], { type });
    const href = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(href);
  };

  return (
    <div className="glass-card space-y-2">
      <h3 className="text-sm font-semibold">Exports</h3>
      <button
        type="button"
        className="btn w-full bg-slate-200 dark:bg-slate-800"
        onClick={async () => {
          await downloadFile("/export/csv", "smartspend-transactions.csv", "text/csv");
          toast.success("CSV downloaded");
        }}
      >
        Export CSV
      </button>
      <button
        type="button"
        className="btn w-full bg-cyan-600 text-white"
        onClick={async () => {
          await downloadFile(`/export/pdf?month=${month}`, `smartspend-${month}.pdf`, "application/pdf");
          toast.success("PDF report downloaded");
        }}
      >
        Download Monthly PDF
      </button>
    </div>
  );
}
