import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

/**
 * GET /api/debug/token
 * Debug endpoint to check Auth0 session and access token retrieval
 * Returns session status, token status, and scope information
 */
export async function GET() {
  // Check session
  const session = await auth0.getSession();
  const hasSession = !!session;

  if (!hasSession) {
    return NextResponse.json({
      hasSession: false,
      hasAccessToken: false,
      scope: null,
    });
  }

  // Try to get access token
  try {
    const tokenResult = await auth0.getAccessToken();

    if (!tokenResult || !tokenResult.accessToken) {
      return NextResponse.json(
        {
          hasSession: true,
          hasAccessToken: false,
          errorName: "NoTokenReturned",
          errorMessage: "getAccessToken() returned no token",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasSession: true,
      hasAccessToken: true,
      scope: tokenResult.scope || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        hasSession: true,
        hasAccessToken: false,
        errorName: error.name || "UnknownError",
        errorMessage: error.message || "Token retrieval failed",
      },
      { status: 500 }
    );
  }
}
