"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { marketApi, type MarketAsset } from "@/lib/api";
import {
  getSocket,
  connectSocket,
  subscribeToMarket,
  unsubscribeFromMarket,
  type MarketUpdate,
} from "@/lib/socket";

export function useMarketData(params?: {
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();
  const subscribedRef = useRef<string[]>([]);

  const query = useQuery({
    queryKey: ["market", "assets", params],
    queryFn: () => marketApi.getAssets(params),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const handleMarketUpdate = useCallback(
    (update: MarketUpdate) => {
      queryClient.setQueryData(
        ["market", "assets", params],
        (old: Awaited<ReturnType<typeof marketApi.getAssets>> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((asset) =>
              asset.symbol === update.symbol
                ? {
                    ...asset,
                    price: update.price,
                    change24h: update.change24h,
                    changePercent24h: update.changePercent24h,
                    volume24h: update.volume24h,
                  }
                : asset
            ),
          };
        }
      );
    },
    [queryClient, params]
  );

  useEffect(() => {
    if (!query.data?.data) return;

    const socket = connectSocket();
    const symbols = query.data.data.map((a) => a.symbol);

    if (subscribedRef.current.length > 0) {
      unsubscribeFromMarket(subscribedRef.current);
    }

    subscribeToMarket(symbols);
    subscribedRef.current = symbols;

    socket.on("market:update", handleMarketUpdate);

    return () => {
      socket.off("market:update", handleMarketUpdate);
      if (subscribedRef.current.length > 0) {
        unsubscribeFromMarket(subscribedRef.current);
        subscribedRef.current = [];
      }
    };
  }, [query.data?.data, handleMarketUpdate]);

  return query;
}

export function useAssetDetail(symbol: string) {
  return useQuery({
    queryKey: ["market", "asset", symbol],
    queryFn: () => marketApi.getAsset(symbol),
    enabled: !!symbol,
    staleTime: 10 * 1000,
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["market", "heatmap"],
    queryFn: () => marketApi.getHeatmap(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useLivePrice(symbol: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!symbol) return;

    const socket = connectSocket();

    subscribeToMarket([symbol]);

    const handler = (update: MarketUpdate) => {
      if (update.symbol === symbol) {
        queryClient.setQueryData(
          ["market", "live-price", symbol],
          update
        );
      }
    };

    socket.on("market:update", handler);

    return () => {
      socket.off("market:update", handler);
      unsubscribeFromMarket([symbol]);
    };
  }, [symbol, queryClient]);

  return useQuery({
    queryKey: ["market", "live-price", symbol],
    queryFn: () => marketApi.getAsset(symbol),
    enabled: !!symbol,
    staleTime: 5 * 1000,
  });
}
