import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0.server";
import { getAccessTokenForRequest } from "@/lib/getAccessTokenForRequest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET(request: Request) {
  // Check session
  let session;
  try {
    session = await auth0.getSession(request);
  } catch (error: any) {
    console.error("[v0] Session read error:", error);
    const response = NextResponse.json(
      {
        error: "unauthorized",
        reason: "session_read_failed",
        detail: error.message || "Failed to read session",
      },
      { status: 401 }
    );
    response.headers.set("cache-control", "no-store");
    return response;
  }

  if (!session || !session.user) {
    const response = NextResponse.json(
      { error: "unauthorized", reason: "no_session" },
      { status: 401 }
    );
    response.headers.set("cache-control", "no-store");
    return response;
  }

  // Exchange for access token
  let result;
  try {
    result = await getAccessTokenForRequest(request);
  } catch (error: any) {
    console.error("[v0] Token exchange error:", error);

    // Extract safe error details
    let detail = error.message || "Token exchange failed";
    let status = 401;

    // If error has a response object, extract status
    if (error.response) {
      status = error.response.status || 401;
    } else if (error.status) {
      status = error.status;
    }

    // Sanitize detail to avoid exposing sensitive info
    if (detail.includes("token") || detail.includes("secret") || detail.includes("key")) {
      detail = "Token exchange failed";
    }

    const response = NextResponse.json(
      {
        error: "unauthorized",
        reason: "token_exchange_failed",
        detail: detail.substring(0, 200), // Limit length
        status,
      },
      { status: 401 }
    );
    response.headers.set("cache-control", "no-store");
    return response;
  }

  const jsonResponse = NextResponse.json({ accessToken: result.accessToken });

  // Add no-cache headers
  jsonResponse.headers.set("cache-control", "no-store");

  // Preserve any set-cookie headers from the token response
  if (result.response) {
    const cookies = result.response.headers.get("set-cookie");
    if (cookies) {
      jsonResponse.headers.set("set-cookie", cookies);
    }
  }

  return jsonResponse;
}
