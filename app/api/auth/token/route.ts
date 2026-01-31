import { NextResponse } from "next/server";
import { getAccessToken } from "@auth0/nextjs-auth0";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 */
export async function GET() {
  try {
    const { accessToken } = await getAccessToken({
      scopes: ["read:orders", "create:orders"],
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
      },
    });

    if (!accessToken) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ accessToken });
  } catch (error) {
    // User not authenticated or token retrieval failed
    console.error("[v0] Token error:", error);
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 }
    );
  }
}
