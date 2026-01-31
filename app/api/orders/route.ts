import { NextResponse } from "next/server";
import { verifyAccessToken, requireScope, getUserId } from "@/lib/auth";
import { getUserOrders, addOrder, isEmailVerified, type OrderItem } from "@/lib/mgmt";

/**
 * GET /api/orders
 * Returns the user's orders from Auth0 user_metadata
 * Requires scope: read:orders
 */
export async function GET(request: Request) {
  // Verify access token
  const authResult = await verifyAccessToken(request.headers.get("Authorization"));
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Check required scope
  const scopeError = requireScope(authResult.payload, "read:orders");
  if (scopeError) {
    return NextResponse.json({ error: scopeError.error }, { status: scopeError.status });
  }

  try {
    const userId = getUserId(authResult.payload);
    const orders = await getUserOrders(userId);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Failed to get orders:", err);
    return NextResponse.json({ error: "Failed to retrieve orders" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order and saves to user_metadata
 * Requires scope: create:orders
 * Requires email verification
 */
export async function POST(request: Request) {
  // Verify access token
  const authResult = await verifyAccessToken(request.headers.get("Authorization"));
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  // Check required scope
  const scopeError = requireScope(authResult.payload, "create:orders");
  if (scopeError) {
    return NextResponse.json({ error: scopeError.error }, { status: scopeError.status });
  }

  const userId = getUserId(authResult.payload);

  // Enforce email verification
  try {
    const emailVerified = await isEmailVerified(userId);
    if (!emailVerified) {
      return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
    }
  } catch (err) {
    console.error("Failed to check email verification:", err);
    return NextResponse.json({ error: "Failed to verify email status" }, { status: 500 });
  }

  // Parse request body
  let body: { items: OrderItem[]; total_usd: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate request body
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Items array is required" }, { status: 400 });
  }

  if (typeof body.total_usd !== "number" || body.total_usd <= 0) {
    return NextResponse.json({ error: "Valid total_usd is required" }, { status: 400 });
  }

  // Validate each item
  for (const item of body.items) {
    if (!item.id || !item.name || typeof item.price !== "number" || typeof item.quantity !== "number") {
      return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
    }
    if (!["pizza", "sides", "drinks"].includes(item.category)) {
      return NextResponse.json({ error: "Invalid item category" }, { status: 400 });
    }
  }

  // Create order
  try {
    const order = await addOrder(userId, body.items, body.total_usd);
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
