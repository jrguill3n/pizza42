import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me
 * Returns current user info from session
 */
export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session || !session.user) {
    return NextResponse.json({ 
      authenticated: false 
    });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      given_name: session.user.given_name,
      family_name: session.user.family_name,
      picture: session.user.picture,
    },
  });
}
