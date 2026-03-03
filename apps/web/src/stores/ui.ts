"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";

interface UiState {
  sidebarCollapsed: boolean;
  theme: Theme;
  activeWidgets: string[];
  tickerPaused: boolean;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
  setActiveWidgets: (widgets: string[]) => void;
  toggleWidget: (widgetId: string) => void;
  setTickerPaused: (paused: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: "dark",
      activeWidgets: [
        "market-overview",
        "portfolio-summary",
        "latest-news",
        "upcoming-events",
        "top-movers",
        "ai-insights",
      ],
      tickerPaused: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setTheme: (theme) => set({ theme }),

      setActiveWidgets: (widgets) => set({ activeWidgets: widgets }),

      toggleWidget: (widgetId) =>
        set((state) => ({
          activeWidgets: state.activeWidgets.includes(widgetId)
            ? state.activeWidgets.filter((id) => id !== widgetId)
            : [...state.activeWidgets, widgetId],
        })),

      setTickerPaused: (paused) => set({ tickerPaused: paused }),
    }),
    {
      name: "fintelligence-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        activeWidgets: state.activeWidgets,
      }),
    }
  )
);
