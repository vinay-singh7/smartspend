import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "SmartSpend",
  description: "Production-ready expense tracker app",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>
          {children}
          <Toaster position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}
