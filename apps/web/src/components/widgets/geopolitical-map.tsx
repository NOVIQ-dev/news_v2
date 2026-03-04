"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  X,
  ZoomIn,
  ExternalLink,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/common/loading-skeleton";

// Leaflet CSS + default icon compatibility
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// Direct react-leaflet imports (this component is already loaded with ssr:false)
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MapNewsEvent {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  region: string;
  lat: number;
  lng: number;
  riskLevel: "low" | "medium" | "high";
  publishedAt: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

function createMockMapEvents(): MapNewsEvent[] {
  const now = Date.now();
  return [
    {
      id: "m1",
      title: "ECB Rate Decision - Potential Cut Signaled",
      summary: "The ECB hinted at a possible rate reduction in Q2.",
      source: "Reuters",
      sourceUrl: "#",
      region: "EUROPE",
      lat: 50.1109,
      lng: 8.6821,
      riskLevel: "medium",
      publishedAt: new Date(now - 3600000).toISOString(),
    },
    {
      id: "m2",
      title: "Russia-Ukraine Ceasefire Talks Progress",
      summary: "Both sides agree to framework for continued peace negotiations.",
      source: "BBC",
      sourceUrl: "#",
      region: "CIS",
      lat: 50.4501,
      lng: 30.5234,
      riskLevel: "high",
      publishedAt: new Date(now - 7200000).toISOString(),
    },
    {
      id: "m3",
      title: "OPEC+ Production Increase Expected",
      summary: "Markets pricing in higher output quotas from OPEC+ nations.",
      source: "CNBC",
      sourceUrl: "#",
      region: "MIDDLE_EAST",
      lat: 24.7136,
      lng: 46.6753,
      riskLevel: "medium",
      publishedAt: new Date(now - 10800000).toISOString(),
    },
    {
      id: "m4",
      title: "China AI Investment - $50B Initiative",
      summary: "Beijing announces major domestic AI development acceleration.",
      source: "FT",
      sourceUrl: "#",
      region: "ASIA",
      lat: 39.9042,
      lng: 116.4074,
      riskLevel: "low",
      publishedAt: new Date(now - 14400000).toISOString(),
    },
    {
      id: "m5",
      title: "Fed Minutes Show Divided Views",
      summary: "Officials disagree on pace of future rate adjustments.",
      source: "WSJ",
      sourceUrl: "#",
      region: "AMERICAS",
      lat: 38.8977,
      lng: -77.0365,
      riskLevel: "medium",
      publishedAt: new Date(now - 18000000).toISOString(),
    },
    {
      id: "m6",
      title: "Taiwan Strait Military Activity Rises",
      summary: "Increased naval presence reported in the Taiwan Strait region.",
      source: "Reuters",
      sourceUrl: "#",
      region: "ASIA",
      lat: 24.0,
      lng: 121.0,
      riskLevel: "high",
      publishedAt: new Date(now - 21600000).toISOString(),
    },
    {
      id: "m7",
      title: "Middle East Energy Corridor Disruption Risk",
      summary: "Ongoing tensions threaten major shipping lanes in the Red Sea.",
      source: "Bloomberg",
      sourceUrl: "#",
      region: "MIDDLE_EAST",
      lat: 15.3694,
      lng: 44.191,
      riskLevel: "high",
      publishedAt: new Date(now - 25200000).toISOString(),
    },
  ];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RISK_COLORS = {
  low: "#00FF88",
  medium: "#FFCC00",
  high: "#FF4444",
};

const REGION_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  EUROPE: { lat: 50, lng: 10, zoom: 4 },
  MIDDLE_EAST: { lat: 25, lng: 45, zoom: 4 },
  ASIA: { lat: 35, lng: 105, zoom: 3 },
  AMERICAS: { lat: 38, lng: -95, zoom: 3 },
  CIS: { lat: 55, lng: 40, zoom: 3 },
};

// ---------------------------------------------------------------------------
// Loading fallback
// ---------------------------------------------------------------------------

function MapLoadingFallback() {
  return (
    <div className="flex h-80 items-center justify-center rounded-lg bg-[#0A0E1A]/80">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#00D4FF]/40" />
        <p className="text-xs text-slate-500">Loading map...</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Side panel for selected event
// ---------------------------------------------------------------------------

interface NewsPanelProps {
  event: MapNewsEvent | null;
  onClose: () => void;
}

function NewsPanel({ event, onClose }: NewsPanelProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute right-2 top-2 z-[1000] w-64 rounded-lg border border-white/[0.08] bg-[#0F1629]/95 p-4 shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: RISK_COLORS[event.riskLevel] }}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  event.riskLevel === "high" && "text-[#FF4444]",
                  event.riskLevel === "medium" && "text-[#FFCC00]",
                  event.riskLevel === "low" && "text-[#00FF88]"
                )}
              >
                {event.riskLevel} risk
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <h3 className="mt-2 text-sm font-semibold text-slate-200">
            {event.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {event.summary}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-slate-400">
              {event.source}
            </span>
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-[#00D4FF] hover:underline"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface GeopoliticalMapProps {
  events?: MapNewsEvent[];
  isLoading?: boolean;
}

export function GeopoliticalMap({
  events: externalEvents,
  isLoading = false,
}: GeopoliticalMapProps) {
  const [mockEvents] = useState(createMockMapEvents);
  const events = externalEvents ?? mockEvents;
  const [selectedEvent, setSelectedEvent] = useState<MapNewsEvent | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapInitialized = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      mapInitialized.current = false;
    };
  }, []);

  if (isLoading || !isMounted) {
    return <MapLoadingFallback />;
  }

  return (
    <div className="space-y-3">
      {/* Region zoom buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-slate-500" />
        {Object.entries(REGION_CENTERS).map(([region, coords]) => {
          const eventCount = events.filter((e) => e.region === region).length;
          return (
            <button
              key={region}
              className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-400 transition-colors duration-200 hover:bg-white/[0.08] hover:text-slate-200"
            >
              <ZoomIn className="h-3 w-3" />
              {region.replace("_", " ")}
              {eventCount > 0 && (
                <span className="rounded-full bg-[#00D4FF]/20 px-1.5 text-[8px] font-bold text-[#00D4FF]">
                  {eventCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="relative h-80 overflow-hidden rounded-lg border border-white/[0.04]">
        <MapContainer
          key="geopolitical-map"
          center={[30, 20]}
          zoom={2}
          minZoom={2}
          maxZoom={10}
          style={{ height: "100%", width: "100%", background: "#0A0E1A" }}
          zoomControl={false}
          attributionControl={false}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {events.map((event) => (
            <CircleMarker
              key={event.id}
              center={[event.lat, event.lng]}
              radius={event.riskLevel === "high" ? 10 : event.riskLevel === "medium" ? 7 : 5}
              pathOptions={{
                color: RISK_COLORS[event.riskLevel],
                fillColor: RISK_COLORS[event.riskLevel],
                fillOpacity: 0.3,
                weight: 2,
              }}
              eventHandlers={{
                click: () => setSelectedEvent(event),
              }}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-slate-500">{event.source}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* News panel overlay */}
        <NewsPanel
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />

        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0E1A]">
            <Loader2 className="h-6 w-6 animate-spin text-[#00D4FF]/40" />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1">
        {(["low", "medium", "high"] as const).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: RISK_COLORS[level] }}
            />
            <span className="text-[10px] capitalize text-slate-500">
              {level} risk
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
