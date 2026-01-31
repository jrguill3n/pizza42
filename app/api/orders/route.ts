import { NextResponse } from "next/server";
import { getSessionUser, getAccessTokenWithScopes } from "@/lib/api-auth";

export const runtime = "nodejs";

// In-memory storage for orders (temporary)
const ordersStore = new Map<string, Array<Order>>();

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
}

/**
 * GET /api/orders
 * Returns user's orders
 * Requires scope: read:orders
 */
export async function GET() {
  try {
    // Validate session and scope
    const { userId } = await getSessionUser();
    await getAccessTokenWithScopes(["read:orders"]);

    // Get orders for user
    const orders = ordersStore.get(userId) || [];
    
    return NextResponse.json({ orders });
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json(
        { 
          error: "insufficient_scope",
          requiredScopes: error.requiredScopes || ["read:orders"]
        },
        { status: 403 }
      );
    }
    console.error("[v0] GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/orders
 * Creates a new order
 * Requires scope: create:orders
 */
export async function POST(request: Request) {
  try {
    // Validate session and scope
    const { userId } = await getSessionUser();
    await getAccessTokenWithScopes(["create:orders"]);

    // Parse request body
    let body: { items: OrderItem[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Validate items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Items array is required" }, { status: 400 });
    }

    for (const item of body.items) {
      if (!item.name || typeof item.qty !== "number" || typeof item.price !== "number") {
        return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
      }
    }

    // Calculate total
    const total = body.items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    // Create order
    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      items: body.items,
      total,
    };

    // Store order
    const userOrders = ordersStore.get(userId) || [];
    userOrders.push(order);
    ordersStore.set(userId, userOrders);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.statusCode === 401) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (error.statusCode === 403) {
      return NextResponse.json(
        { 
          error: "insufficient_scope",
          requiredScopes: error.requiredScopes || ["create:orders"]
        },
        { status: 403 }
      );
    }
    console.error("[v0] POST /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
