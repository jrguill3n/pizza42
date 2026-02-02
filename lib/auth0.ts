import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Create Auth0 client singleton with configuration
export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email read:orders create:orders",
  },
  beforeSessionSaved: async (session) => ({ ...session }),
});

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

export interface Auth0User {
  email: string;
  email_verified: boolean;
  sub: string;
  name?: string;
  picture?: string;
  [ORDERS_CONTEXT_CLAIM]?: OrdersContext;
}

/**
 * Get the current session including user (server-side only)
 */
export async function getAuth0Session() {
  return await auth0.getSession();
}

/**
 * Get the current authenticated user from the session (server-side only)
 */
export async function getSessionUserServer(): Promise<Auth0User | null> {
  const session = await auth0.getSession();
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
 * Extract orders context from session
 */
export function getOrdersContextFromSession(session: any): OrdersContext | null {
  if (!session?.user) return null;
  return (session.user as Auth0User)[ORDERS_CONTEXT_CLAIM] ?? null;
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
