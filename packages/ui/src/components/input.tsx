import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, label, error, helperText, id, ref, ...props }: InputProps) {
  const inputId = id || React.useId();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <LabelPrimitive.Root
          htmlFor={inputId}
          className="text-sm font-medium text-slate-200"
        >
          {label}
        </LabelPrimitive.Root>
      )}
      <input
        type={type}
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-[#0F1629] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 transition-colors duration-200",
          "border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
          className
        )}
        ref={ref}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error
            ? `${inputId}-error`
            : helperText
              ? `${inputId}-helper`
              : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

export { Input };
