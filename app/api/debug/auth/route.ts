import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/debug/auth
 * Diagnostic endpoint for Auth0 session debugging
 * Returns safe session info without exposing tokens or cookies
 */
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const hasCookieHeader = !!cookieHeader;
  const cookieHeaderLength = cookieHeader?.length || 0;
  
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  const xForwardedHost = request.headers.get("x-forwarded-host");
  const xForwardedProto = request.headers.get("x-forwarded-proto");

  try {
    const session = await auth0.getSession(request);
    const hasSession = !!session;
    const userSub = session?.user?.sub || null;
    const userEmail = session?.user?.email || null;

    return NextResponse.json({
      ok: true,
      hasCookieHeader,
      cookieHeaderLength,
      hasSession,
      userSub,
      userEmail,
      host,
      origin,
      xForwardedHost,
      xForwardedProto,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: "session_read_failed",
      detail: error.message,
      hasCookieHeader,
      host,
      origin,
      xForwardedHost,
      xForwardedProto,
    });
  }
}
