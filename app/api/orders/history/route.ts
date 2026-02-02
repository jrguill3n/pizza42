import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth0Management.server";
import { verifyAccessToken, requireScope, getUserId } from "@/lib/auth.server";
import { verifyToken, checkPermission } from "@/lib/auth.server"; // Declare the missing variables

export const runtime = "nodejs";

/**
 * GET /api/orders/history
 * Returns user's order history from user_metadata
 * Requires permission: read:orders
 */
export async function GET(request: Request) {
  // Verify token
  const authHeader = request.headers.get("authorization");
  const result = await verifyAccessToken(authHeader);
  
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Check permission
  const scopeError = requireScope(result.payload, "read:orders");
  if (scopeError) {
    return NextResponse.json({ error: scopeError.error }, { status: scopeError.status });
  }

  const userId = getUserId(result.payload);

  // Get user's order history from user_metadata
  try {
    const user = await getUser(userId);
    const orders = (user.user_metadata?.orders as any[]) || [];

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[v0] GET /api/orders/history: Failed to fetch user metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch order history" },
      { status: 500 }
    );
  }
}
