"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import {
  Settings,
  Globe,
  Palette,
  Bell,
  Shield,
  User,
  Key,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Download,
  Trash2,
  ChevronRight,
  Lock,
} from "lucide-react";

type SettingsTab = "general" | "appearance" | "notifications" | "security" | "account";

const TABS: { key: SettingsTab; icon: React.ElementType }[] = [
  { key: "general", icon: Settings },
  { key: "appearance", icon: Palette },
  { key: "notifications", icon: Bell },
  { key: "security", icon: Shield },
  { key: "account", icon: User },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-display)]">
          {t("title")}
        </h1>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <div className="glass w-full shrink-0 rounded-xl p-2 lg:w-56">
          <nav className="space-y-1">
            {TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === key
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(key)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General */}
          {activeTab === "general" && (
            <div className="glass rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("general")}
              </h2>

              {/* Language */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-muted" />
                  <label className="text-sm font-medium text-text-primary">
                    {t("language")}
                  </label>
                </div>
                <div className="flex gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        locale === lang.code
                          ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                          : "bg-surface-light text-text-secondary hover:bg-surface-hover"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="glass rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("appearance")}
              </h2>

              {/* Theme */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-primary">
                  {t("theme")}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: "dark", icon: Moon, label: t("darkTheme") },
                    { key: "light", icon: Sun, label: t("lightTheme") },
                    { key: "system", icon: Monitor, label: t("systemTheme") },
                  ] as const).map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setTheme(key)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                        theme === key
                          ? "border-accent/30 bg-accent/5"
                          : "border-border hover:border-border-light hover:bg-surface-hover"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          theme === key ? "text-accent" : "text-text-muted"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          theme === key ? "text-accent" : "text-text-secondary"
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="glass rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("notifications")}
              </h2>

              <div className="space-y-4">
                {/* Email notifications */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {t("emailNotifications")}
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive email notifications for alerts and updates
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifs(!emailNotifs)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      emailNotifs ? "bg-accent" : "bg-surface-light"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all shadow-sm",
                        emailNotifs ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                {/* Push notifications */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {t("pushNotifications")}
                      </p>
                      <p className="text-xs text-text-muted">
                        Receive push notifications in your browser
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPushNotifs(!pushNotifs)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      pushNotifs ? "bg-accent" : "bg-surface-light"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all shadow-sm",
                        pushNotifs ? "left-[22px]" : "left-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="glass rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {t("security")}
              </h2>

              <button className="flex w-full items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t("changePassword")}
                    </p>
                    <p className="text-xs text-text-muted">
                      Update your password regularly for security
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </button>

              <button className="flex w-full items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t("twoFactor")}
                    </p>
                    <p className="text-xs text-text-muted">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </button>

              <button className="flex w-full items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t("apiKeys")}
                    </p>
                    <p className="text-xs text-text-muted">
                      Manage your API keys for integrations
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-muted" />
              </button>
            </div>
          )}

          {/* Account */}
          {activeTab === "account" && (
            <div className="space-y-4">
              <div className="glass rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  {t("account")}
                </h2>

                <button className="flex w-full items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {t("exportData")}
                      </p>
                      <p className="text-xs text-text-muted">
                        Download all your data in a portable format
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </button>
              </div>

              {/* Danger zone */}
              <div className="glass rounded-xl border-negative/20 p-6">
                <h3 className="text-sm font-semibold text-negative mb-3">
                  Danger Zone
                </h3>
                <button className="flex w-full items-center justify-between rounded-lg border border-negative/20 bg-negative/5 p-4 transition-colors hover:bg-negative/10">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-5 w-5 text-negative" />
                    <div>
                      <p className="text-sm font-medium text-negative">
                        {t("deleteAccount")}
                      </p>
                      <p className="text-xs text-negative/70">
                        This action is permanent and cannot be undone
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-negative" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
