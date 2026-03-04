"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  TrendingUp,
  Wallet,
  Calendar,
  Target,
  Brain,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  href: string;
}

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "news", label: "News Feed", icon: Newspaper, href: "/news" },
  { id: "markets", label: "Markets", icon: TrendingUp, href: "/markets" },
  { id: "portfolio", label: "Portfolio", icon: Wallet, href: "/portfolio" },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/calendar" },
  { id: "predictions", label: "Predictions", icon: Target, href: "/predictions" },
  { id: "ai", label: "AI Assistant", icon: Brain, href: "/ai" },
  { id: "alerts", label: "Alerts", icon: Bell, href: "/alerts" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface NavLinkProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: (id: string) => void;
}

function NavLink({ item, active, collapsed, onClick }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick(item.id)}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#00D4FF]/10 text-[#00D4FF]"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#00D4FF]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}

      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors duration-200",
          active ? "text-[#00D4FF]" : "text-slate-500 group-hover:text-slate-300"
        )}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export function Sidebar({
  activeItem = "dashboard",
  onNavigate,
  user = { name: "Max Mustermann", email: "max@fintelligence.io" },
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentItem, setCurrentItem] = useState(activeItem);

  const handleNavClick = useCallback(
    (id: string) => {
      setCurrentItem(id);
      onNavigate?.(id);
    },
    [onNavigate]
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex h-screen flex-col border-r border-white/[0.06] bg-[#0A0E1A]"
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00D4FF]/10">
          <TrendingUp className="h-4.5 w-4.5 text-[#00D4FF]" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="whitespace-nowrap text-sm font-bold text-slate-200">
                Fintelligence
              </p>
              <p className="whitespace-nowrap text-[10px] text-slate-500">
                Financial Intelligence
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={currentItem === item.id}
            collapsed={collapsed}
            onClick={handleNavClick}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.04] p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 transition-colors duration-200 hover:bg-white/[0.04] hover:text-slate-300"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User profile */}
      <div className="border-t border-white/[0.04] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-white/[0.04]",
            collapsed && "justify-center"
          )}
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF]/30 to-[#00FF88]/30 text-xs font-bold text-slate-200">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden"
              >
                <p className="truncate text-xs font-medium text-slate-200">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {user.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
