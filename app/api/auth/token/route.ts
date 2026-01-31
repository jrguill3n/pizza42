import { NextResponse } from "next/server";
import { getSession, getAccessToken } from "@auth0/nextjs-auth0";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET() {
  try {
    // Check session first
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get access token with required scopes and audience
    const result = await getAccessToken({
      scopes: ["read:orders", "create:orders"],
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE || "",
      },
    });

    if (!result || !result.accessToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ accessToken: result.accessToken });
  } catch (error) {
    console.error("[v0] Token retrieval error:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
