import { getSession } from "@auth0/nextjs-auth0";

/**
 * Get the current authenticated user from the session (server-side only)
 */
export async function getSessionUserServer() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Generate login URL with optional returnTo path
 */
export function getLoginUrl(returnTo?: string): string {
  const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return `/auth/login${params}`;
}

/**
 * Generate logout URL with optional returnTo path
 */
export function getLogoutUrl(returnTo?: string): string {
  const params = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return `/auth/logout${params}`;
}
