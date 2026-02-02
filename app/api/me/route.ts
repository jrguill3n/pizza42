import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

/**
 * GET /api/me
 * Returns current user info from session
 */
export async function GET() {
  const session = await auth0.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    sub: session.user.sub,
    email: session.user.email,
    email_verified: session.user.email_verified,
  });
}
