import { NextResponse } from "next/server";
import { getUser, updateUserMetadata } from "@/lib/auth0Management.server";
import { verifyAccessToken, requireScope, getUserId, checkPermission } from "@/lib/auth.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price_cents: number;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  total_cents: number;
  note?: string;
}

/**
 * GET /api/orders
 * Returns user's orders
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

  let userId: string;
  let payload: any;
  try {
    payload = result.payload;
    userId = getUserId(payload);
  } catch (error: any) {
    console.error("[v0] GET /api/orders: JWT verification failed:", error);
    return NextResponse.json(
      {
        error: "invalid_token",
        detail: {
          code: error.code || "unknown",
          claim: error.claim || undefined,
          reason: error.reason || error.message || "verify_failed",
        },
      },
      { status: 401 }
    );
  }

  // Check permissions
  if (!checkPermission(payload, "read:orders")) {
    return NextResponse.json(
      { error: "forbidden", missing: "read:orders" },
      { status: 403 }
    );
  }

  // Fetch orders from user_metadata via Management API
  try {
    const user = await getUser(userId);
    const existingOrders = (user.user_metadata?.orders as Order[]) || [];
    const order = {}; // Declare the order variable here
    const updatedOrders = [...existingOrders, order];

    // Write back to user_metadata
    const nextOrders = updatedOrders; // Declare the nextOrders variable here
    await updateUserMetadata(userId, {
      ...user.user_metadata,
      orders: nextOrders,
    });

    return NextResponse.json(
      { ok: true, order, orders_count: nextOrders.length },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[v0] POST /api/orders: Management API error:", error);
    return NextResponse.json(
      { error: "mgmt_api_error", detail: error.message },
      { status: 500 }
    );
  }
}
