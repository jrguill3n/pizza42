import { NextRequest, NextResponse } from "next/server";
import { auth0, getOrdersContextFromSession } from "@/lib/auth0.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me
 * Returns current user info from session with orders context claims
 */
export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session || !session.user) {
    return NextResponse.json({ 
      authenticated: false 
    });
  }

  // Get orders context from session (namespaced claims)
  const ordersContext = getOrdersContextFromSession(session);

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      given_name: session.user.given_name,
      family_name: session.user.family_name,
      picture: session.user.picture,
      email_verified: session.user.email_verified,
    },
    claims: ordersContext || undefined,
  });
}
