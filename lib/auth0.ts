import { getSession, type Claims } from "@auth0/nextjs-auth0";

// Custom claim namespace for orders context
export const ORDERS_CONTEXT_CLAIM = "https://pizza42.example/orders_context";

export interface OrdersContext {
  orders_count: number;
  last_order_at: string | null;
  last_order?: {
    id: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category: "pizza" | "sides" | "drinks";
    }>;
    total: number;
  } | null;
}

export interface Auth0User extends Claims {
  email: string;
  email_verified: boolean;
  sub: string;
  [ORDERS_CONTEXT_CLAIM]?: OrdersContext;
}

/**
 * Get the current session including user (server-side only)
 */
export async function getAuth0Session() {
  const session = await getSession();
  return session;
}

/**
 * Get the current authenticated user from the session (server-side only)
 */
export async function getSessionUserServer(): Promise<Auth0User | null> {
  const session = await getSession();
  return (session?.user as Auth0User) ?? null;
}

/**
 * Extract orders context from user claims
 */
export function getOrdersContext(user: Auth0User | null): OrdersContext | null {
  if (!user) return null;
  return user[ORDERS_CONTEXT_CLAIM] ?? null;
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
 * Generate logout URL with optional returnTo path
 */
export function getLogoutUrl(returnTo?: string): string {
  const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return `/auth/logout${params}`;
}
