"use client";

import { Suspense, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@fintelligence/ui/lib/utils";
import { ErrorBoundary, ErrorFallback } from "@/components/common/error-boundary";
import { CardSkeleton } from "@/components/common/loading-skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetWrapperProps {
  /** Unique widget identifier */
  id: string;
  /** Widget display title */
  title: string;
  /** Optional icon component */
  icon?: ReactNode;
  /** Widget content */
  children: ReactNode;
  /** Whether the widget is currently loading */
  isLoading?: boolean;
  /** Called when refresh is requested */
  onRefresh?: () => void;
  /** Extra CSS class */
  className?: string;
  /** DnD kit drag handle attributes */
  dragHandleProps?: Record<string, unknown>;
  /** DnD kit drag listeners */
  dragListeners?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WidgetWrapper({
  id,
  title,
  icon,
  children,
  isLoading = false,
  onRefresh,
  className,
  dragHandleProps,
  dragListeners,
}: WidgetWrapperProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    onRefresh?.();
    // Reset refreshing state after animation
    setTimeout(() => setRefreshing(false), 1000);
  }, [onRefresh, refreshing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F1629]/80 backdrop-blur-xl shadow-lg transition-shadow duration-300",
        expanded && "fixed inset-4 z-50 overflow-auto",
        "hover:shadow-xl hover:shadow-black/20",
        className
      )}
    >
      {/* Glass highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          {dragHandleProps && (
            <button
              className="cursor-grab touch-none rounded p-0.5 text-slate-600 transition-colors duration-200 hover:bg-white/5 hover:text-slate-400 active:cursor-grabbing"
              {...dragHandleProps}
              {...dragListeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          {icon && (
            <span className="text-[#00D4FF]/60">{icon}</span>
          )}

          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="rounded-md p-1.5 text-slate-500 transition-all duration-200 hover:bg-white/5 hover:text-slate-300"
            title="Refresh"
          >
            <RotateCcw
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-500",
                refreshing && "animate-spin"
              )}
            />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-slate-500 transition-all duration-200 hover:bg-white/5 hover:text-slate-300"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Maximize */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-md p-1.5 text-slate-500 transition-all duration-200 hover:bg-white/5 hover:text-slate-300"
            title={expanded ? "Minimize" : "Maximize"}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <ErrorBoundary>
                <Suspense fallback={<CardSkeleton />}>
                  {isLoading ? <CardSkeleton /> : children}
                </Suspense>
              </ErrorBoundary>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded overlay backdrop */}
      {expanded && (
        <div
          className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm"
          onClick={() => setExpanded(false)}
        />
      )}
    </motion.div>
  );
}
