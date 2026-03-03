"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Brain,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  Loader2,
  Clock,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const SUGGESTED_PROMPTS = [
  "prompt1",
  "prompt2",
  "prompt3",
  "prompt4",
] as const;

export default function AnalysisPage() {
  const t = useTranslations("ai");
  const tCommon = useTranslations("common");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory] = useState([
    { id: "1", title: "Market outlook analysis", updatedAt: "2h ago" },
    { id: "2", title: "Sanctions impact on energy", updatedAt: "1d ago" },
    { id: "3", title: "BTC vs ETH comparison", updatedAt: "3d ago" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Based on my analysis, here are the key insights regarding your query about "${userMessage.content}":\n\n**Market Overview:**\nCurrent market conditions suggest a cautiously optimistic outlook. Key indicators point to moderate growth with some headwinds from geopolitical tensions.\n\n**Key Factors:**\n- Federal Reserve policy trajectory remains accommodative\n- Global trade patterns showing signs of normalization\n- Energy sector volatility linked to Middle East developments\n- Crypto market correlation with traditional risk assets increasing\n\n**Risk Assessment:**\nPrimary risks include potential escalation of regional conflicts, unexpected inflation data, and central bank policy divergence.\n\n**Recommendation:**\nConsider a balanced approach with diversified exposure across asset classes. Monitor upcoming economic releases closely for potential market-moving events.`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 2000);
  };

  const handlePromptClick = (promptKey: string) => {
    setInput(t(promptKey as any));
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4 animate-fade-in">
      {/* Chat history sidebar */}
      <div className="hidden w-64 shrink-0 flex-col glass rounded-xl lg:flex">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            {t("chatHistory")}
          </h3>
          <button className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-accent transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chatHistory.map((chat) => (
            <button
              key={chat.id}
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-hover"
            >
              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">
                  {chat.title}
                </p>
                <p className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock className="h-2.5 w-2.5" />
                  {chat.updatedAt}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-negative hover:bg-negative/10 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            {t("clearHistory")}
          </button>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col glass rounded-xl overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
            <Brain className="h-4 w-4 text-info" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              {t("title")}
            </h2>
            <p className="text-[10px] text-text-muted">
              Powered by FinTelligence AI
            </p>
          </div>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-hover transition-colors">
            <Plus className="h-3.5 w-3.5" />
            {t("newChat")}
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            /* Empty state with suggested prompts */
            <div className="flex h-full flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10 mb-4">
                <Sparkles className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                {t("title")}
              </h3>
              <p className="text-sm text-text-muted mb-6 text-center max-w-md">
                {t("placeholder")}
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-lg sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePromptClick(key)}
                    className="rounded-xl border border-border bg-surface/50 p-3 text-left text-sm text-text-secondary transition-all hover:border-accent/30 hover:bg-surface-hover hover:text-text-primary"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat messages */
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : ""
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10">
                      <Bot className="h-4 w-4 text-info" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[75%] rounded-xl px-4 py-3",
                      message.role === "user"
                        ? "bg-accent/10 text-text-primary"
                        : "bg-surface-light text-text-primary"
                    )}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    <p className="mt-2 text-[10px] text-text-muted">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking indicator */}
              {isThinking && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10">
                    <Bot className="h-4 w-4 text-info" />
                  </div>
                  <div className="rounded-xl bg-surface-light px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <Loader2 className="h-4 w-4 animate-spin text-info" />
                      {t("thinking")}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t("placeholder")}
                rows={1}
                className="max-h-32 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-background transition-all hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
