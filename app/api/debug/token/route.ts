import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAccessTokenForRequest } from "@/lib/getAccessTokenForRequest";

export const runtime = "nodejs";

/**
 * GET /api/debug/token
 * Debug endpoint to check Auth0 session and access token retrieval
 * Returns session status, token status, and scope information
 */
export async function GET(request: Request) {
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
    const tokenResult = await getAccessTokenForRequest(request);

    const jsonResponse = NextResponse.json({
      hasSession: true,
      hasAccessToken: true,
      scope: tokenResult.scope || "",
    });
    
    // Preserve any set-cookie headers from the token response
    if (tokenResult.response) {
      const cookies = tokenResult.response.headers.get("set-cookie");
      if (cookies) {
        jsonResponse.headers.set("set-cookie", cookies);
      }
    }
    
    return jsonResponse;
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
