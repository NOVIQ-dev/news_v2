import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

export interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: number;
  formattedValue?: string;
  changePercent?: number;
  prefix?: string;
  suffix?: string;
  sparkline?: React.ReactNode;
  loading?: boolean;
  animateValue?: boolean;
  decimals?: number;
  ref?: React.Ref<HTMLDivElement>;
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  formattedValue,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formattedValue?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    if (formattedValue && latest === value) {
      return `${prefix}${formattedValue}${suffix}`;
    }
    const num = latest.toFixed(decimals);
    return `${prefix}${Number(num).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });

    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{rounded}</motion.span>;
}

function DataCard({
  className,
  title,
  value,
  formattedValue,
  changePercent,
  prefix = "",
  suffix = "",
  sparkline,
  loading = false,
  animateValue = true,
  decimals = 2,
  ref,
  ...props
}: DataCardProps) {
  const isPositive = changePercent !== undefined && changePercent >= 0;
  const isNegative = changePercent !== undefined && changePercent < 0;

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/[0.08] bg-[#0F1629]/80 backdrop-blur-xl p-6 shadow-lg",
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#0F1629]/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-200 hover:border-white/[0.12] hover:shadow-xl",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-200">
            {animateValue ? (
              <AnimatedNumber
                value={value}
                prefix={prefix}
                suffix={suffix}
                decimals={decimals}
                formattedValue={formattedValue}
              />
            ) : (
              `${prefix}${formattedValue ?? value.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              })}${suffix}`
            )}
          </p>
          {changePercent !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && (
                <TrendingUp className="h-4 w-4 text-[#00FF88]" />
              )}
              {isNegative && (
                <TrendingDown className="h-4 w-4 text-[#FF4444]" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-[#00FF88]",
                  isNegative && "text-[#FF4444]"
                )}
              >
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        {sparkline && (
          <div className="flex-shrink-0">{sparkline}</div>
        )}
      </div>
    </div>
  );
}

export { DataCard };
