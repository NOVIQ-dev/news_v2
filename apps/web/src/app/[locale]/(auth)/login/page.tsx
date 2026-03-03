"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import NextLink from "next/link";
import { useLogin } from "@/hooks/use-auth";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("loginTitle")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary"
          >
            {t("email")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-negative">{t("invalidEmail")}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary"
            >
              {t("password")}
            </label>
            <NextLink
              href={`/${locale}/forgot-password`}
              className="text-xs text-accent hover:text-accent-dim transition-colors"
            >
              {t("forgotPassword")}
            </NextLink>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-negative">{t("passwordMin")}</p>
          )}
        </div>

        {/* Error message */}
        {loginMutation.isError && (
          <div className="rounded-lg border border-negative/20 bg-negative/10 p-3 text-sm text-negative">
            {(loginMutation.error as Error)?.message || t("invalidEmail")}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || loginMutation.isPending}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
        >
          {loginMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("loginButton")}...
            </span>
          ) : (
            t("loginButton")
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        {t("noAccount")}{" "}
        <NextLink
          href={`/${locale}/register`}
          className="font-medium text-accent hover:text-accent-dim transition-colors"
        >
          {t("register")}
        </NextLink>
      </p>
    </div>
  );
}
