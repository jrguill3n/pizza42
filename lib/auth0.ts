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

// Demo user for preview - toggle this to test different states
// Set to null to test logged-out state
const DEMO_USER: Auth0User | null = {
  email: "demo@pizza42.example",
  email_verified: true,
  sub: "auth0|demo123",
  name: "Demo User",
  [ORDERS_CONTEXT_CLAIM]: {
    orders_count: 5,
    last_order_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_order: {
      id: "order_abc123",
      items: [
        { id: "margherita", name: "Margherita", price: 14.99, quantity: 1, category: "pizza" },
        { id: "pepperoni", name: "Pepperoni", price: 16.99, quantity: 1, category: "pizza" },
        { id: "garlic-bread", name: "Garlic Bread", price: 5.99, quantity: 2, category: "sides" },
      ],
      total: 43.96,
    },
  },
};

/**
 * Get the current session including user (server-side only)
 * In production, this would use Auth0Client.getSession()
 * For v0 preview, returns demo data
 */
export async function getAuth0Session() {
  // In v0 preview environment, return demo session
  // When deployed with Auth0 configured, replace with real Auth0Client
  if (DEMO_USER) {
    return { user: DEMO_USER };
  }
  return null;
}

/**
 * Get the current authenticated user from the session (server-side only)
 */
export async function getSessionUserServer(): Promise<Auth0User | null> {
  const session = await getAuth0Session();
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
