"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

// Channel subscriptions
export function subscribeToMarket(symbols: string[]): void {
  const s = getSocket();
  s.emit("subscribe:market", { symbols });
}

export function unsubscribeFromMarket(symbols: string[]): void {
  const s = getSocket();
  s.emit("unsubscribe:market", { symbols });
}

export function subscribeToNews(): void {
  const s = getSocket();
  s.emit("subscribe:news");
}

export function subscribeToAlerts(): void {
  const s = getSocket();
  s.emit("subscribe:alerts");
}

// Event types
export interface MarketUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  timestamp: string;
}

export interface NewsUpdate {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  region: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface AlertTrigger {
  alertId: string;
  message: string;
  triggeredAt: string;
}

export interface TickerItem {
  type: "news" | "market";
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
  timestamp: string;
}
