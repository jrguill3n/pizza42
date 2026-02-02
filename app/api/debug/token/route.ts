import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0.server";
import { getAccessTokenForRequest } from "@/lib/getAccessTokenForRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/debug/token
 * Debug endpoint to diagnose access token retrieval
 * Returns safe token diagnostics without exposing the full token
 */
export async function GET(request: Request) {
  // Check session
  let session;
  try {
    session = await auth0.getSession(request);
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: "session_read_failed",
      message: error.message || "Failed to read session",
    });
  }

  if (!session) {
    return NextResponse.json({
      ok: false,
      error: "no_session",
      message: "No active session found",
    });
  }

  // Try to get access token
  try {
    const tokenResult = await getAccessTokenForRequest(request);

    const token = tokenResult.accessToken;
    const jsonResponse = NextResponse.json({
      ok: true,
      hasSession: true,
      tokenLength: token.length,
      tokenStartsWith: token.substring(0, 12),
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
    // Extract safe error details
    let message = error.message || "Token exchange failed";
    let status = 500;

    // If error has a response object, extract status
    if (error.response) {
      status = error.response.status || 500;
    } else if (error.status) {
      status = error.status;
    }

    // Sanitize message to avoid exposing sensitive info
    if (message.includes("token") || message.includes("secret") || message.includes("key")) {
      message = "Token exchange failed";
    }

    return NextResponse.json({
      ok: false,
      error: "token_exchange_failed",
      message: message.substring(0, 200),
      status,
    });
  }
}
