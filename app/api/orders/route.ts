import { NextResponse } from "next/server";
import * as jose from "jose";
import { auth0 } from "@/lib/auth0";
import { getUser, updateUserMetadata } from "@/lib/auth0Management";

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

// Cache JWKS for performance
let jwksCache: jose.JWTVerifyGetKey | null = null;

async function getJWKS(): Promise<jose.JWTVerifyGetKey> {
  if (!jwksCache) {
    const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
    // Ensure trailing slash
    const issuerUrl = issuer.endsWith("/") ? issuer : `${issuer}/`;
    const jwksUrl = new URL(".well-known/jwks.json", issuerUrl);
    jwksCache = jose.createRemoteJWKSet(jwksUrl);
  }
  return jwksCache;
}

async function verifyToken(token: string) {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
  const issuerUrl = issuer.endsWith("/") ? issuer : `${issuer}/`;
  const audience = process.env.AUTH0_AUDIENCE!;
  const JWKS = await getJWKS();

  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: issuerUrl,
    audience: audience,
  });

  return payload;
}

function checkPermission(payload: any, required: string): boolean {
  // Check permissions array (RBAC)
  if (payload.permissions?.includes(required)) {
    return true;
  }
  // Check scope string (traditional OAuth)
  if (payload.scope?.split(" ").includes(required)) {
    return true;
  }
  return false;
}

/**
 * GET /api/orders
 * Returns user's orders
 * Requires permission: read:orders
 */
export async function GET(request: Request) {
  // Extract Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Verify JWT
  let payload: any;
  try {
    payload = await verifyToken(token);
  } catch (error) {
    console.error("[v0] GET /api/orders: JWT verification failed:", error);
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Check permissions
  if (!checkPermission(payload, "read:orders")) {
    return NextResponse.json(
      { error: "forbidden", missing: "read:orders" },
      { status: 403 }
    );
  }

  // Get user ID from token
  const userId = payload.sub as string;

  // Get orders for user
  const orders = ordersStore.get(userId) || [];

  return NextResponse.json({ orders });
}

/**
 * POST /api/orders
 * Creates a new order
 * Requires permission: create:orders
 */
export async function POST(request: Request) {
  // Extract Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Verify JWT
  let payload: any;
  try {
    payload = await verifyToken(token);
  } catch (error) {
    console.error("[v0] POST /api/orders: JWT verification failed:", error);
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Check permissions
  if (!checkPermission(payload, "create:orders")) {
    return NextResponse.json(
      { error: "forbidden", missing: "create:orders" },
      { status: 403 }
    );
  }

  // Get user ID from token
  const userId = payload.sub as string;

  // Verify email is verified (server-side session check)
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.user.email_verified !== true) {
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
  const total = body.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  // Create order
  const order: Order = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    items: body.items,
    total,
  };

  // Store order in memory
  const userOrders = ordersStore.get(userId) || [];
  userOrders.push(order);
  ordersStore.set(userId, userOrders);

  // Persist last 5 orders to user_metadata
  try {
    const user = await getUser(userId);
    const existingOrders = (user.user_metadata?.orders as Order[]) || [];
    
    // Append new order and keep only last 5
    const updatedOrders = [...existingOrders, order].slice(-5);
    
    await updateUserMetadata(userId, {
      ...user.user_metadata,
      orders: updatedOrders,
    });

    return NextResponse.json(
      { ok: true, order, saved_orders_count: updatedOrders.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] POST /api/orders: Failed to persist to metadata:", error);
    // Still return success since order was created
    return NextResponse.json({ ok: true, order }, { status: 201 });
  }
}
