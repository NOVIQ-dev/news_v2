"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import { useUiStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import {
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  LogOut,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const localeLabels: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ru: "Русский",
};

export function Header() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setShowLangMenu(false);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface/50 px-4 backdrop-blur-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t("common.search") + "..."}
            className="w-64 rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            /
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
          title={theme === "dark" ? t("settings.lightTheme") : t("settings.darkTheme")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Language switcher */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden text-xs font-medium uppercase sm:inline">
              {locale}
            </span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-surface-light py-1 shadow-xl shadow-black/20">
              {Object.entries(localeLabels).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-sm transition-colors",
                    code === locale
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-negative" />
        </button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-border" />

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-hover transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
              <User className="h-3.5 w-3.5 text-accent" />
            </div>
            <span className="hidden text-sm font-medium text-text-primary sm:inline">
              {user?.name || "User"}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-text-muted sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-surface-light py-1 shadow-xl shadow-black/20">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-text-primary">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-text-muted">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <button
                onClick={() => logoutMutation.mutate()}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-negative hover:bg-negative/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t("auth.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
