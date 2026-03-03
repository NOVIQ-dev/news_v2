"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  User,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { cn } from "@fintelligence/ui/lib/utils";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NotificationBell } from "@/components/layout/notification-bell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderProps {
  /** Current page title or breadcrumb segments */
  pageTitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onNavigate?: (path: string) => void;
}

// ---------------------------------------------------------------------------
// User avatar dropdown
// ---------------------------------------------------------------------------

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onNavigate?: (path: string) => void;
}

function UserMenu({ user, onNavigate }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const menuItems = [
    { id: "profile", label: "Profile", icon: User, href: "/settings/profile" },
    { id: "billing", label: "Billing", icon: CreditCard, href: "/settings/billing" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 transition-colors duration-200 hover:bg-white/[0.06]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4FF]/30 to-[#00FF88]/30 text-[10px] font-bold text-slate-200">
          {initials}
        </div>
        <span className="hidden text-xs font-medium text-slate-300 sm:block">
          {user.name}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0F1629]/95 shadow-2xl backdrop-blur-xl"
            >
              {/* User info */}
              <div className="border-b border-white/[0.04] px-4 py-3">
                <p className="text-sm font-medium text-slate-200">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.(item.href);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 transition-colors duration-200 hover:bg-white/[0.04] hover:text-slate-100"
                    >
                      <Icon className="h-4 w-4 text-slate-500" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Logout */}
              <div className="border-t border-white/[0.04] py-1">
                <button
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[#FF4444] transition-colors duration-200 hover:bg-[#FF4444]/5"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function Header({
  pageTitle = "Dashboard",
  breadcrumbs,
  user = { name: "Max Mustermann", email: "max@fintelligence.io" },
  onNavigate,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0A0E1A]/80 px-6 backdrop-blur-xl">
      {/* Left: Breadcrumbs / Page title */}
      <div className="flex items-center gap-2">
        {breadcrumbs ? (
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                )}
                {crumb.href ? (
                  <button
                    onClick={() => onNavigate?.(crumb.href!)}
                    className="text-slate-500 transition-colors hover:text-slate-300"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-medium text-slate-200">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-lg font-semibold text-slate-200">{pageTitle}</h1>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        <div className="mx-1 h-6 w-px bg-white/[0.06]" />
        <UserMenu user={user} onNavigate={onNavigate} />
      </div>
    </header>
  );
}
