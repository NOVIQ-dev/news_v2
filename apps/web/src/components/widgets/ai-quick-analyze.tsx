"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Brain,
  Send,
  ChevronUp,
  Loader2,
  History,
  Sparkles,
  Zap,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextSkeleton } from "@/components/common/loading-skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QueryEntry {
  id: string;
  query: string;
  response: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Mock recent queries factory (avoids hydration mismatch)
// ---------------------------------------------------------------------------

function createMockRecentQueries(): QueryEntry[] {
  const now = Date.now();
  return [
    {
      id: "q1",
      query: "What's the BTC outlook for this week?",
      response:
        "**Bitcoin Short-Term Outlook**\n\nBitcoin is showing strong bullish momentum:\n\n- **Price:** Currently at $94,521, up 1.98% in 24h\n- **Key resistance:** $95,000 psychological level, then $97,500\n- **Support:** $92,000 and $90,000\n- **RSI:** 62 - bullish but not overbought\n\nInstitutional flows remain positive with ETF inflows averaging $250M daily this week. Watch for FOMC decision impact.",
      timestamp: now - 3600000,
    },
    {
      id: "q2",
      query: "Impact of ECB rate cut on EUR/USD?",
      response:
        "**ECB Rate Cut Impact Analysis**\n\nA rate cut would likely:\n\n1. **Weaken EUR/USD** - expect a move toward 1.075-1.080\n2. **Boost DAX** - lower rates support equity valuations\n3. **Gold neutral** - already pricing in global easing\n\nHistorically, ECB cuts have led to 0.5-1.0% EUR weakness in the first 48 hours.",
      timestamp: now - 7200000,
    },
    {
      id: "q3",
      query: "Correlation between oil and S&P 500?",
      response:
        "**Oil-SPX Correlation Analysis**\n\nCurrent 30-day correlation: **0.32** (weak positive)\n\n- When oil drops due to demand concerns, SPX typically follows\n- Supply-driven oil drops can be SPX positive (lower input costs)\n- Current oil weakness is supply-driven (OPEC+ increase), which is mildly positive for equities",
      timestamp: now - 18000000,
    },
  ];
}

// ---------------------------------------------------------------------------
// Simulated streaming response
// ---------------------------------------------------------------------------

const SAMPLE_RESPONSES = [
  "**Market Analysis**\n\nBased on current data, here are the key observations:\n\n- Major indices are showing mixed signals with the S&P 500 near all-time highs\n- Crypto markets remain bullish with BTC holding above $94K\n- Geopolitical tensions continue to support gold prices\n\n**Recommendation:** Maintain a balanced allocation with slight overweight in quality equities and crypto exposure.",
  "**Technical Perspective**\n\nLooking at the broader market structure:\n\n1. **Trend:** Primary uptrend intact across major markets\n2. **Momentum:** RSI divergences forming on some indices\n3. **Volume:** Declining on recent rallies - cautious sign\n4. **Sentiment:** Fear & Greed at 68 (Greed) - watch for pullbacks\n\nKey levels to watch this week include SPX 6000 resistance and BTC $95K breakout zone.",
];

// ---------------------------------------------------------------------------
// Quick prompt buttons
// ---------------------------------------------------------------------------

const QUICK_PROMPTS = [
  { label: "Summarize today's market", icon: Zap },
  { label: "Geopolitical risk today", icon: Sparkles },
  { label: "Top movers analysis", icon: MessageSquare },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_CHAT_HISTORY = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface RecentQueryProps {
  entry: QueryEntry;
  onSelect: (query: string) => void;
}

function RecentQuery({ entry, onSelect }: RecentQueryProps) {
  return (
    <button
      onClick={() => onSelect(entry.query)}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-slate-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-slate-200"
    >
      <History className="h-3 w-3 shrink-0 text-slate-600" />
      <span className="truncate">{entry.query}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SSE streaming helper
// ---------------------------------------------------------------------------

async function streamFromAPI(
  prompt: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: () => void,
) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      credentials: "include",
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok || !response.body) {
      onError();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text") {
              fullText += data.content;
              onChunk(fullText);
            } else if (data.type === "done") {
              onDone(fullText);
              return;
            } else if (data.type === "error") {
              onError();
              return;
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    }

    onDone(fullText);
  } catch {
    onError();
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface AiQuickAnalyzeProps {
  recentQueries?: QueryEntry[];
}

export function AiQuickAnalyze({
  recentQueries: externalQueries,
}: AiQuickAnalyzeProps) {
  const [mockQueries] = useState(createMockRecentQueries);
  const initialQueries = externalQueries ?? mockQueries;

  const [query, setQuery] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  const [chatHistory, setChatHistory] = useState<QueryEntry[]>(initialQueries);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const addToChatHistory = useCallback((q: string, response: string) => {
    setChatHistory((prev) => {
      const newEntry: QueryEntry = {
        id: `q-${Date.now()}`,
        query: q,
        response,
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...prev];
      return updated.slice(0, MAX_CHAT_HISTORY);
    });
  }, []);

  const simulateStreaming = useCallback((q: string) => {
    const fullText =
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)]!;
    let charIndex = 0;

    streamIntervalRef.current = setInterval(() => {
      charIndex += Math.floor(Math.random() * 3) + 1;
      if (charIndex >= fullText.length) {
        setStreamedText(fullText);
        setIsStreaming(false);
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
        }
        addToChatHistory(q, fullText);
      } else {
        setStreamedText(fullText.slice(0, charIndex));
      }
    }, 20);
  }, [addToChatHistory]);

  const handleSubmit = useCallback(
    (submittedQuery?: string) => {
      const q = submittedQuery || query;
      if (!q.trim() || isStreaming) return;

      setIsStreaming(true);
      setShowResponse(true);
      setShowRecent(false);
      setStreamedText("");

      // Try SSE streaming from API, fallback to simulated
      streamFromAPI(
        q,
        (text) => setStreamedText(text),
        (fullText) => {
          setIsStreaming(false);
          addToChatHistory(q, fullText);
        },
        () => {
          // Fallback to simulated streaming
          simulateStreaming(q);
        },
      );

      if (!submittedQuery) setQuery("");
    },
    [query, isStreaming, addToChatHistory, simulateStreaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRecentSelect = (q: string) => {
    setQuery(q);
    handleSubmit(q);
  };

  return (
    <div className="space-y-3">
      {/* Quick prompt buttons */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => handleSubmit(prompt.label)}
            disabled={isStreaming}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition-colors duration-200 hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] disabled:opacity-30"
          >
            <prompt.icon className="h-3 w-3" />
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Input field */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <Brain className="h-4 w-4 text-[#00D4FF]/60" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AI about markets..."
          className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#0A0E1A] pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-600 transition-colors duration-200 focus:border-[#00D4FF]/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10"
        />
        <button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isStreaming}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors duration-200 hover:bg-white/5 hover:text-[#00D4FF] disabled:opacity-30"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Recent queries / chat history */}
      <AnimatePresence>
        {showRecent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Chat History
              </p>
              <Sparkles className="h-3 w-3 text-[#00D4FF]/40" />
            </div>
            <div className="mt-1 space-y-0.5">
              {chatHistory.slice(0, 5).map((entry) => (
                <RecentQuery
                  key={entry.id}
                  entry={entry}
                  onSelect={handleRecentSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streaming response */}
      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-[#00D4FF]/10 bg-[#00D4FF]/[0.03] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-[#00D4FF]" />
                  <span className="text-[10px] font-semibold text-[#00D4FF]">
                    AI Analysis (claude-opus-4-6)
                  </span>
                  {isStreaming && (
                    <span className="text-[10px] text-[#00D4FF]/60">
                      streaming...
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowResponse(false);
                    setShowRecent(true);
                  }}
                  className="text-slate-500 transition-colors hover:text-slate-300"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="ai-response mt-3 text-xs leading-relaxed text-slate-300">
                {streamedText ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-100">
                          {children}
                        </strong>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 list-disc text-slate-300">
                          {children}
                        </li>
                      ),
                      ol: ({ children }) => (
                        <ol className="ml-4 list-decimal space-y-1">
                          {children}
                        </ol>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-1">{children}</ul>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-2 text-sm font-bold text-slate-100">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-1 text-sm font-bold text-slate-100">
                          {children}
                        </h2>
                      ),
                      table: ({ children }) => (
                        <table className="my-2 w-full text-xs border-collapse border border-white/10">
                          {children}
                        </table>
                      ),
                      th: ({ children }) => (
                        <th className="border border-white/10 bg-white/5 px-2 py-1 text-left font-semibold text-slate-200">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-white/10 px-2 py-1 text-slate-300">
                          {children}
                        </td>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-white/10 px-1 py-0.5 text-[#00D4FF] font-mono text-[10px]">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {streamedText}
                  </ReactMarkdown>
                ) : (
                  <TextSkeleton lines={4} />
                )}
                {isStreaming && (
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-[#00D4FF]" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
