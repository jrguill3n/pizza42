import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAccessTokenForRequest } from "@/lib/getAccessTokenForRequest";

export const runtime = "nodejs";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET(request: Request) {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const result = await getAccessTokenForRequest(request);
    
    const jsonResponse = NextResponse.json({ accessToken: result.accessToken });
    
    // Preserve any set-cookie headers from the token response
    if (result.response) {
      const cookies = result.response.headers.get("set-cookie");
      if (cookies) {
        jsonResponse.headers.set("set-cookie", cookies);
      }
    }
    
    return jsonResponse;
  } catch (error) {
    console.error("[v0] Token retrieval error:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
