"use client";

import { useState, useCallback, useMemo, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Newspaper,
  BarChart3,
  Grid3X3,
  Calendar,
  Target,
  Wallet,
  Brain,
  Bell,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetWrapper } from "@/components/dashboard/widget-wrapper";
import { MarketOverview } from "@/components/widgets/market-overview";
import { NewsFeedWidget } from "@/components/widgets/news-feed-widget";
import { PriceChart } from "@/components/widgets/price-chart";
import { Heatmap } from "@/components/widgets/heatmap";
import { EconomicCalendarWidget } from "@/components/widgets/economic-calendar-widget";
import { PredictionMarketsWidget } from "@/components/widgets/prediction-markets-widget";
import { PortfolioSummary } from "@/components/widgets/portfolio-summary";
import { AiQuickAnalyze } from "@/components/widgets/ai-quick-analyze";
import { AlertsWidget } from "@/components/widgets/alerts-widget";
import { GeopoliticalMap } from "@/components/widgets/geopolitical-map";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetConfig {
  id: string;
  title: string;
  icon: ReactNode;
  component: ReactNode;
  colSpan?: number; // how many columns this widget spans on desktop
}

// ---------------------------------------------------------------------------
// Default widget layout
// ---------------------------------------------------------------------------

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "market-overview",
    title: "Market Overview",
    icon: <TrendingUp className="h-4 w-4" />,
    component: <MarketOverview />,
    colSpan: 3,
  },
  {
    id: "portfolio-summary",
    title: "Portfolio",
    icon: <Wallet className="h-4 w-4" />,
    component: <PortfolioSummary />,
    colSpan: 1,
  },
  {
    id: "price-chart",
    title: "Price Chart - BTC",
    icon: <BarChart3 className="h-4 w-4" />,
    component: <PriceChart />,
    colSpan: 2,
  },
  {
    id: "news-feed",
    title: "News Feed",
    icon: <Newspaper className="h-4 w-4" />,
    component: <NewsFeedWidget />,
    colSpan: 1,
  },
  {
    id: "ai-analyze",
    title: "AI Analysis",
    icon: <Brain className="h-4 w-4" />,
    component: <AiQuickAnalyze />,
    colSpan: 1,
  },
  {
    id: "heatmap",
    title: "Market Heatmap",
    icon: <Grid3X3 className="h-4 w-4" />,
    component: <Heatmap />,
    colSpan: 2,
  },
  {
    id: "economic-calendar",
    title: "Economic Calendar",
    icon: <Calendar className="h-4 w-4" />,
    component: <EconomicCalendarWidget />,
    colSpan: 1,
  },
  {
    id: "prediction-markets",
    title: "Prediction Markets",
    icon: <Target className="h-4 w-4" />,
    component: <PredictionMarketsWidget />,
    colSpan: 1,
  },
  {
    id: "geopolitical-map",
    title: "Geopolitical Map",
    icon: <Globe className="h-4 w-4" />,
    component: <GeopoliticalMap />,
    colSpan: 2,
  },
  {
    id: "alerts",
    title: "Alerts",
    icon: <Bell className="h-4 w-4" />,
    component: <AlertsWidget />,
    colSpan: 1,
  },
];

// ---------------------------------------------------------------------------
// Sortable widget item
// ---------------------------------------------------------------------------

interface SortableWidgetProps {
  widget: WidgetConfig;
}

function SortableWidget({ widget }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  // Responsive column spans
  const colClass = useMemo(() => {
    switch (widget.colSpan) {
      case 3:
        return "col-span-1 md:col-span-2 lg:col-span-3";
      case 2:
        return "col-span-1 md:col-span-2";
      default:
        return "col-span-1";
    }
  }, [widget.colSpan]);

  return (
    <div ref={setNodeRef} style={style} className={colClass}>
      <WidgetWrapper
        id={widget.id}
        title={widget.title}
        icon={widget.icon}
        dragHandleProps={{ ...attributes }}
        dragListeners={listeners}
      >
        {widget.component}
      </WidgetWrapper>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface WidgetGridProps {
  /** Override default widgets */
  widgets?: WidgetConfig[];
  /** Callback when layout changes (for persistence) */
  onLayoutChange?: (widgetIds: string[]) => void;
}

export function WidgetGrid({
  widgets: initialWidgets,
  onLayoutChange,
}: WidgetGridProps) {
  const [widgetOrder, setWidgetOrder] = useState<string[]>(
    () => (initialWidgets || DEFAULT_WIDGETS).map((w) => w.id)
  );

  const widgetMap = useMemo(() => {
    const map = new Map<string, WidgetConfig>();
    (initialWidgets || DEFAULT_WIDGETS).forEach((w) => map.set(w.id, w));
    return map;
  }, [initialWidgets]);

  const orderedWidgets = useMemo(
    () =>
      widgetOrder
        .map((id) => widgetMap.get(id))
        .filter(Boolean) as WidgetConfig[],
    [widgetOrder, widgetMap]
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setWidgetOrder((prev) => {
        const oldIndex = prev.indexOf(String(active.id));
        const newIndex = prev.indexOf(String(over.id));
        const newOrder = arrayMove(prev, oldIndex, newIndex);
        onLayoutChange?.(newOrder);
        return newOrder;
      });
    },
    [onLayoutChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orderedWidgets.map((widget) => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
