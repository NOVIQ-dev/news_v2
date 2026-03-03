"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Globe } from "lucide-react";
import { cn } from "@fintelligence/ui/lib/utils";
import type { Locale } from "@fintelligence/shared";

// ---------------------------------------------------------------------------
// Language options
// ---------------------------------------------------------------------------

interface LanguageOption {
  code: Locale;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { code: "de", label: "Deutsch", flag: "\uD83C\uDDE9\uD83C\uDDEA" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\uD83C\uDDF7\uD83C\uDDFA" },
];

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export function LanguageSwitcher({
  currentLocale = "en",
  onLocaleChange,
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>(currentLocale);

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const handleSelect = useCallback(
    (code: Locale) => {
      setLocale(code);
      setOpen(false);
      onLocaleChange?.(code);

      // In a real app, this would use next-intl's useRouter to switch locale:
      // const router = useRouter();
      // router.replace(pathname, { locale: code });
    },
    [onLocaleChange]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-200 transition-colors duration-200 hover:bg-white/[0.06]"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden text-xs sm:block">{currentLanguage.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0F1629]/95 py-1 shadow-xl backdrop-blur-xl"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-white/[0.06]",
                    locale === lang.code
                      ? "text-[#00D4FF]"
                      : "text-slate-300"
                  )}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {locale === lang.code && (
                    <Check className="h-3.5 w-3.5 text-[#00D4FF]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
