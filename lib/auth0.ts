/**
 * Client-safe Auth0 types and utilities
 * Server-only functions are in lib/auth0.server.ts
 */

// Custom claim namespace for orders context
export const ORDERS_CONTEXT_CLAIM = "https://pizza42.example/orders_context";

export interface OrdersContext {
  orders_count: number;
  last_order_at: string | null;
  last_3_orders?: Array<{
    id: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      price_cents?: number;
      quantity: number;
      category: "pizza" | "sides" | "drinks";
    }>;
    total: number;
    total_cents?: number;
    created_at?: string;
  }> | null;
}

export interface Auth0User {
  email: string;
  email_verified: boolean;
  sub: string;
  name?: string;
  picture?: string;
  [ORDERS_CONTEXT_CLAIM]?: OrdersContext;
}

/**
 * Generate login URL with optional returnTo path
 */
export function getLoginUrl(returnTo?: string): string {
  const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return `/auth/login${params}`;
}

/**
 * Generate signup URL with optional returnTo path
 */
export function getSignupUrl(returnTo?: string): string {
  const baseParams = "screen_hint=signup";
  const returnParams = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";
  return `/auth/login?${baseParams}${returnParams}`;
}

/**
 * Generate logout URL (returnTo is handled server-side as absolute URL)
 */
export function getLogoutUrl(): string {
  return "/auth/logout";
}
