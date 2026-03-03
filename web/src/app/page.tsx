import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
      <div className="glass-card w-full space-y-3 text-center">
        <h1 className="text-3xl font-bold">SmartSpend</h1>
        <p className="text-sm text-slate-500">Track expenses, set budgets, and export reports with a modern PWA.</p>
        <Link href="/auth" className="btn inline-flex bg-cyan-600 text-white">
          Get Started
        </Link>
      </div>
    </main>
  );
}
