import PDFDocument from "pdfkit";
import { TransactionDocument } from "../models/Transaction";

export function toMonthlyPdf(month: string, transactions: TransactionDocument[]) {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ margin: 40 });

  doc.on("data", (chunk) => chunks.push(chunk as Buffer));

  doc.fontSize(18).text(`SmartSpend Monthly Report - ${month}`);
  doc.moveDown();

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  doc.fontSize(12).text(`Total Income: ${income.toFixed(2)}`);
  doc.text(`Total Expense: ${expenses.toFixed(2)}`);
  doc.text(`Net: ${(income - expenses).toFixed(2)}`);
  doc.moveDown();
  doc.text("Transactions");
  doc.moveDown(0.4);

  transactions.forEach((item) => {
    doc
      .fontSize(10)
      .text(
        `${item.date.toISOString().slice(0, 10)}  |  ${item.title}  |  ${item.category}  |  ${item.type.toUpperCase()}  |  ${item.currency} ${item.amount.toFixed(2)}`,
      );
  });

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
