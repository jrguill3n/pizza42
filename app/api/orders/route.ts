import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

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
  // Check session first
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    console.log("[v0] GET /api/orders: No session found");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub as string;

  // Get access token with required scopes
  let accessToken: string;
  let scope: string;
  try {
    const tokenResult = await auth0.getAccessToken();
    
    if (!tokenResult || !tokenResult.accessToken) {
      console.log("[v0] GET /api/orders: Token retrieval returned no token");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    
    accessToken = tokenResult.accessToken;
    scope = tokenResult.scope || "";
    console.log("[v0] GET /api/orders: Access token received:", !!accessToken);
    console.log("[v0] GET /api/orders: Raw scope string:", scope);
  } catch (error: any) {
    console.error("[v0] GET /api/orders: Token retrieval failed:", error.message || error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Verify scope
  const scopes = scope.split(" ");
  
  if (!scopes.includes("read:orders")) {
    console.log("[v0] GET /api/orders: Missing required scope read:orders");
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Get orders for user
  const orders = ordersStore.get(userId) || [];
  
  return NextResponse.json({ orders, orders_count: orders.length });
}

/**
 * POST /api/orders
 * Creates a new order
 * Requires scope: create:orders
 */
export async function POST(request: Request) {
  // Check session first
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    console.log("[v0] POST /api/orders: No session found");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub as string;

  // Get access token with required scopes
  let accessToken: string;
  let scope: string;
  try {
    const tokenResult = await auth0.getAccessToken();
    
    if (!tokenResult || !tokenResult.accessToken) {
      console.log("[v0] POST /api/orders: Token retrieval returned no token");
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    
    accessToken = tokenResult.accessToken;
    scope = tokenResult.scope || "";
    console.log("[v0] POST /api/orders: Access token received:", !!accessToken);
    console.log("[v0] POST /api/orders: Raw scope string:", scope);
  } catch (error: any) {
    console.error("[v0] POST /api/orders: Token retrieval failed:", error.message || error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Verify scope
  const scopes = scope.split(" ");
  
  if (!scopes.includes("create:orders")) {
    console.log("[v0] POST /api/orders: Missing required scope create:orders");
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Verify email is verified
  if (!session.user.email_verified) {
    console.log("[v0] POST /api/orders: Email not verified");
    return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
  }

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

  return NextResponse.json({ order, orders_count: userOrders.length }, { status: 201 });
}
