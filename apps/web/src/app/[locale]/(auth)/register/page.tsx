"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import NextLink from "next/link";
import { useRegister } from "@/hooks/use-auth";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("registerSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name field */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-secondary"
          >
            {t("name")}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-negative">{t("nameRequired")}</p>
          )}
        </div>

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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary"
          >
            {t("password")}
          </label>
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

        {/* Confirm Password field */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-secondary"
          >
            {t("confirmPassword")}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-negative">{t("passwordMismatch")}</p>
          )}
        </div>

        {/* Error message */}
        {registerMutation.isError && (
          <div className="rounded-lg border border-negative/20 bg-negative/10 p-3 text-sm text-negative">
            {(registerMutation.error as Error)?.message || t("invalidEmail")}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || registerMutation.isPending}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed glow-accent"
        >
          {registerMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("registerButton")}...
            </span>
          ) : (
            t("registerButton")
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-text-secondary">
        {t("hasAccount")}{" "}
        <NextLink
          href={`/${locale}/login`}
          className="font-medium text-accent hover:text-accent-dim transition-colors"
        >
          {t("login")}
        </NextLink>
      </p>
    </div>
  );
}
