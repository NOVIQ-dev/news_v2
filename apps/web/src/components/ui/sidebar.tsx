"use client";

import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui";
import {
  LayoutDashboard,
  Newspaper,
  BarChart3,
  Briefcase,
  Calendar,
  TrendingUp,
  Brain,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

const navItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "news", href: "/news", icon: Newspaper },
  { key: "market", href: "/market", icon: BarChart3 },
  { key: "portfolio", href: "/portfolio", icon: Briefcase },
  { key: "calendar", href: "/calendar", icon: Calendar },
  { key: "predictions", href: "/predictions", icon: TrendingUp },
  { key: "analysis", href: "/analysis", icon: Brain },
  { key: "alerts", href: "/alerts", icon: Bell },
  { key: "settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <NextLink
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 ring-1 ring-accent/20">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-text-primary whitespace-nowrap">
              FinTelligence
            </span>
          )}
        </NextLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ key, href, icon: Icon }) => {
            const fullHref = `/${locale}${href}`;
            const isActive = pathname === fullHref || pathname.startsWith(`${fullHref}/`);

            return (
              <li key={key}>
                <NextLink
                  href={fullHref}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-text-muted group-hover:text-text-secondary"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate">{t(key)}</span>
                  )}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  )}
                </NextLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
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
    </aside>
  );
}
