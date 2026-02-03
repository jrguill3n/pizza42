import "server-only";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import type { Auth0User, OrdersContext } from "./auth0";
import { ORDERS_CONTEXT_CLAIM } from "./auth0";

export { ORDERS_CONTEXT_CLAIM };

// Create Auth0 client singleton with configuration
export const auth0 = new Auth0Client({
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: "openid profile email read:orders create:orders",
  },
  beforeSessionSaved: async (session) => ({ ...session }),
});

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
  const { ORDERS_CONTEXT_CLAIM } = require("./auth0");
  return user[ORDERS_CONTEXT_CLAIM] ?? null;
}

/**
 * Extract orders context from session
 */
export function getOrdersContextFromSession(session: any): OrdersContext | null {
  if (!session?.user) return null;
  const { ORDERS_CONTEXT_CLAIM } = require("./auth0");
  return (session.user as Auth0User)[ORDERS_CONTEXT_CLAIM] ?? null;
}
