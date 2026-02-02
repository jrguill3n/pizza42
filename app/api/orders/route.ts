import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAccessTokenForRequest } from "@/lib/getAccessTokenForRequest";
import * as jose from "jose";

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
export async function GET(request: Request) {
  // Check session first
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    console.log("[v0] GET /api/orders: No session found");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub as string;

  // Get access token with required scopes
  let accessToken: string;
  let tokenResponse: NextResponse | undefined;
  try {
    const tokenResult = await getAccessTokenForRequest(request);
    accessToken = tokenResult.accessToken;
    tokenResponse = tokenResult.response;
    console.log("[v0] GET /api/orders: Access token received:", !!accessToken);
  } catch (error: any) {
    console.error("[v0] GET /api/orders: Token retrieval failed:", error.message || error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Decode token to check permissions/scopes
  let payload: any;
  try {
    payload = jose.decodeJwt(accessToken);
  } catch (error) {
    console.error("[v0] GET /api/orders: Token decode failed:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Check permissions array (RBAC) or scope string
  const hasPermission = payload.permissions?.includes("read:orders");
  const hasScope = payload.scope?.split(" ").includes("read:orders");
  
  if (!hasPermission && !hasScope) {
    console.log("[v0] GET /api/orders: Missing required scope/permission read:orders");
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Get orders for user
  const orders = ordersStore.get(userId) || [];
  
  const jsonResponse = NextResponse.json({ orders, orders_count: orders.length });
  
  // Preserve any set-cookie headers from the token response
  if (tokenResponse) {
    const cookies = tokenResponse.headers.get("set-cookie");
    if (cookies) {
      jsonResponse.headers.set("set-cookie", cookies);
    }
  }
  
  return jsonResponse;
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
  let tokenResponse: NextResponse | undefined;
  try {
    const tokenResult = await getAccessTokenForRequest(request);
    accessToken = tokenResult.accessToken;
    tokenResponse = tokenResult.response;
    console.log("[v0] POST /api/orders: Access token received:", !!accessToken);
  } catch (error: any) {
    console.error("[v0] POST /api/orders: Token retrieval failed:", error.message || error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Decode token to check permissions/scopes
  let payload: any;
  try {
    payload = jose.decodeJwt(accessToken);
  } catch (error) {
    console.error("[v0] POST /api/orders: Token decode failed:", error);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Check permissions array (RBAC) or scope string
  const hasPermission = payload.permissions?.includes("create:orders");
  const hasScope = payload.scope?.split(" ").includes("create:orders");
  
  if (!hasPermission && !hasScope) {
    console.log("[v0] POST /api/orders: Missing required scope/permission create:orders");
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

  const jsonResponse = NextResponse.json({ order, orders_count: userOrders.length }, { status: 201 });
  
  // Preserve any set-cookie headers from the token response
  if (tokenResponse) {
    const cookies = tokenResponse.headers.get("set-cookie");
    if (cookies) {
      jsonResponse.headers.set("set-cookie", cookies);
    }
  }
  
  return jsonResponse;
}
