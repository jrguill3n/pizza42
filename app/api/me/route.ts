import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me
 * Returns current user info from session
 */
export async function GET() {
  const session = await auth0.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null 
    });
  }

  return NextResponse.json({
    isAuthenticated: true,
    user: {
      sub: session.user.sub,
      email: session.user.email,
      email_verified: session.user.email_verified,
      name: session.user.name,
      given_name: session.user.given_name,
      family_name: session.user.family_name,
      picture: session.user.picture,
    },
  });
}
