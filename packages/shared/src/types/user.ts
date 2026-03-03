// ---------------------------------------------------------------------------
// User & authentication types
// ---------------------------------------------------------------------------

import type { ISODateString, Locale, Theme, UUID } from './common';

/** User notification delivery preferences. */
export interface NotificationPreferences {
  /** Receive email notifications. */
  email: boolean;
  /** Receive push / in-app notifications. */
  push: boolean;
  /** Receive SMS notifications. */
  sms: boolean;
  /** Quiet-hours start (HH:mm, 24-h format). */
  quietHoursStart?: string;
  /** Quiet-hours end (HH:mm, 24-h format). */
  quietHoursEnd?: string;
}

/** Persisted per-user preferences. */
export interface UserPreferences {
  /** Display locale. */
  locale: Locale;
  /** UI colour-scheme. */
  theme: Theme;
  /** Preferred fiat currency for portfolio valuation. */
  baseCurrency: string;
  /** Default watchlist ID shown on the dashboard. */
  defaultWatchlistId?: UUID;
  /** Notification delivery settings. */
  notifications: NotificationPreferences;
  /** Whether the on-boarding wizard has been completed. */
  onboardingCompleted: boolean;
}

/** Full user entity as returned by the API. */
export interface User {
  /** Unique user identifier. */
  id: UUID;
  /** User email address (unique). */
  email: string;
  /** Display name. */
  displayName: string;
  /** Optional URL to the user's avatar image. */
  avatarUrl?: string;
  /** User role within the platform. */
  role: 'user' | 'admin';
  /** Whether the email address has been verified. */
  emailVerified: boolean;
  /** Personalisation preferences. */
  preferences: UserPreferences;
  /** ISO-8601 account creation timestamp. */
  createdAt: ISODateString;
  /** ISO-8601 last-update timestamp. */
  updatedAt: ISODateString;
  /** ISO-8601 timestamp of the most recent login, if any. */
  lastLoginAt?: ISODateString;
}

// ---------------------------------------------------------------------------
// Auth DTOs
// ---------------------------------------------------------------------------

/** JWT token pair returned after successful authentication. */
export interface AuthTokens {
  /** Short-lived access token (JWT). */
  accessToken: string;
  /** Long-lived refresh token. */
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  /** Token type (always `'Bearer'`). */
  tokenType: 'Bearer';
}

/** Payload for the login endpoint. */
export interface LoginDto {
  /** Account email. */
  email: string;
  /** Account password. */
  password: string;
  /** Optional TOTP code when 2FA is enabled. */
  totpCode?: string;
  /** Whether the session should persist beyond the browser session. */
  rememberMe?: boolean;
}

/** Payload for the registration endpoint. */
export interface RegisterDto {
  /** Desired email address. */
  email: string;
  /** Password (min 8 characters, must contain upper, lower, digit). */
  password: string;
  /** Password confirmation – must match `password`. */
  passwordConfirm: string;
  /** Display name shown throughout the app. */
  displayName: string;
  /** Preferred locale set during sign-up. */
  locale?: Locale;
  /** Whether the user accepted the Terms of Service. */
  acceptedTos: boolean;
}
