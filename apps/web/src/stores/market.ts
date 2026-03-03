"use client";

import { create } from "zustand";

export type AssetType = "all" | "stocks" | "crypto" | "forex" | "commodities" | "indices";
export type ViewMode = "list" | "grid";

interface MarketFilterState {
  assetType: AssetType;
  exchange: string | null;
  sector: string | null;
  searchQuery: string;
  viewMode: ViewMode;

  setAssetType: (type: AssetType) => void;
  setExchange: (exchange: string | null) => void;
  setSector: (sector: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  resetFilters: () => void;
}

export const useMarketStore = create<MarketFilterState>((set) => ({
  assetType: "all",
  exchange: null,
  sector: null,
  searchQuery: "",
  viewMode: "grid",

  setAssetType: (assetType) => set({ assetType, exchange: null, sector: null }),
  setExchange: (exchange) => set({ exchange }),
  setSector: (sector) => set({ sector }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setViewMode: (viewMode) => set({ viewMode }),
  resetFilters: () =>
    set({ assetType: "all", exchange: null, sector: null, searchQuery: "" }),
}));
