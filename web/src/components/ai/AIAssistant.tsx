"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";

type Role = "user" | "model";

type Message = {
  role: Role;
  text: string;
};

const STARTERS = [
  "Summarize my spending 📊",
  "Am I on budget? 💰",
  "Where am I overspending? 🔍",
  "What's my top expense category?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async (text: string) => {
    const userMessage = text.trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      // Build history in Gemini format (all messages except the latest user one)
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const { data } = await api.post("/ai/chat", {
        message: userMessage,
        history,
      });

      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => setMessages([]);

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/30 transition-transform hover:scale-110 active:scale-95"
        whileTap={{ scale: 0.9 }}
        title="AI Financial Assistant"
        aria-label="Open AI assistant"
        style={{ width: 52, height: 52 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} className="text-white" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={20} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-[84px] right-5 z-40 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 sm:w-[380px]"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">SmartSpend AI</p>
                <p className="text-[10px] text-slate-500">Powered by Gemini</p>
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Clear chat"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 220, maxHeight: 340 }}>
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    👋 Hi! Ask me anything about your finances.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-left text-[11px] leading-snug text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:bg-cyan-900/20"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "model" && (
                    <span className="mr-1.5 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600">
                      <Bot size={11} className="text-white" />
                    </span>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-sm dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <span className="mr-1.5 mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-600">
                    <Bot size={11} className="text-white" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 dark:border-slate-700 dark:bg-slate-900">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                  placeholder="Ask about your finances…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-40"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
