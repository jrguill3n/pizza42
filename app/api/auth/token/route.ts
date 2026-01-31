import { type NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ["read:orders", "create:orders"],
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
      },
    });

    if (!accessToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("[v0] Token retrieval error:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}
