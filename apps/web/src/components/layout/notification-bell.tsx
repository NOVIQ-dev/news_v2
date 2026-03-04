"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  TrendingUp,
  Newspaper,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Notification {
  id: string;
  type: "price" | "news" | "alert" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  url?: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "price",
    title: "BTC Price Alert",
    message: "Bitcoin has risen above $94,000",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "news",
    title: "Breaking News",
    message: "ECB signals potential rate cut amid slowing growth",
    time: "15 min ago",
    read: false,
    url: "/news",
  },
  {
    id: "n3",
    type: "alert",
    title: "Alert Triggered",
    message: "Gold crossed above $2,930 threshold",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "n4",
    type: "system",
    title: "Portfolio Update",
    message: "Your portfolio is up 1.22% today",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "n5",
    type: "news",
    title: "Market Analysis",
    message: "S&P 500 approaches all-time high on strong earnings",
    time: "3 hours ago",
    read: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_ICONS = {
  price: TrendingUp,
  news: Newspaper,
  alert: AlertCircle,
  system: Bell,
};

const TYPE_COLORS = {
  price: "text-[#00FF88] bg-[#00FF88]/10",
  news: "text-[#00D4FF] bg-[#00D4FF]/10",
  alert: "text-[#FFCC00] bg-[#FFCC00]/10",
  system: "text-slate-400 bg-white/[0.06]",
};

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface NotificationBellProps {
  notifications?: Notification[];
  onViewAll?: () => void;
}

export function NotificationBell({
  notifications = MOCK_NOTIFICATIONS,
  onViewAll,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] transition-colors duration-200",
          "bg-white/[0.03] hover:bg-white/[0.06]",
          open && "bg-white/[0.06]"
        )}
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-4 w-4 text-slate-300" />
        ) : (
          <Bell className="h-4 w-4 text-slate-300" />
        )}

        {/* Count badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF4444] text-[9px] font-bold text-white shadow-lg shadow-[#FF4444]/30"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F1629]/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[#00D4FF] transition-colors hover:text-[#00D4FF]/80"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications list */}
              <div className="max-h-80 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-slate-600" />
                    <p className="mt-2 text-xs text-slate-500">
                      No notifications
                    </p>
                  </div>
                ) : (
                  items.map((notification, i) => {
                    const Icon = TYPE_ICONS[notification.type];
                    const colorClass = TYPE_COLORS[notification.type];

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          "group flex items-start gap-3 border-b border-white/[0.02] px-4 py-3 transition-colors duration-200 hover:bg-white/[0.03]",
                          !notification.read && "bg-[#00D4FF]/[0.02]"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                            colorClass
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={cn(
                                "text-xs font-medium",
                                notification.read
                                  ? "text-slate-400"
                                  : "text-slate-200"
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-600">
                            {notification.time}
                          </p>
                        </div>

                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="mt-1 shrink-0 rounded-md p-1 text-slate-600 opacity-0 transition-all duration-200 hover:bg-white/5 hover:text-slate-400 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.04] px-4 py-2.5">
                <button
                  onClick={() => {
                    setOpen(false);
                    onViewAll?.();
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium text-[#00D4FF] transition-colors duration-200 hover:bg-[#00D4FF]/5"
                >
                  View all alerts
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
