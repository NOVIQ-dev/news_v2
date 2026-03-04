"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] ring-1 ring-white/[0.08]">
        <Icon className="h-7 w-7 text-slate-500" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        {description && (
          <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center rounded-lg bg-[#00D4FF]/10 px-4 py-2 text-xs font-medium text-[#00D4FF] transition-colors duration-200 hover:bg-[#00D4FF]/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
