import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET() {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const result = await auth0.getAccessToken();
    
    if (!result || !result.accessToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ accessToken: result.accessToken });
  } catch (error) {
    console.error("[v0] Token retrieval error:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
