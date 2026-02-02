import { NextResponse } from "next/server";
import * as jose from "jose";
import { getUser, updateUserMetadata } from "@/lib/auth0Management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory storage for orders (temporary)
const ordersStore = new Map<string, Array<Order>>();

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

// Cache JWKS for performance
let jwksCache: jose.JWTVerifyGetKey | null = null;

async function getJWKS(): Promise<jose.JWTVerifyGetKey> {
  if (!jwksCache) {
    const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
    const jwksUrl = new URL(`${issuer.replace(/\/$/, "")}/.well-known/jwks.json`);
    jwksCache = jose.createRemoteJWKSet(jwksUrl);
  }
  return jwksCache;
}

async function verifyToken(token: string) {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
  const audience = process.env.AUTH0_AUDIENCE!;
  const JWKS = await getJWKS();

  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: issuer,
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
  } catch (error: any) {
    console.error("[v0] GET /api/orders: JWT verification failed:", error);
    return NextResponse.json(
      { error: "invalid_token", detail: error.code || error.message || "verify_failed" },
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

  // Get user ID from token
  const userId = payload.sub as string;

  // Fetch orders from user_metadata via Management API
  try {
    const user = await getUser(userId);
    const orders = (user.user_metadata?.orders as Order[]) || [];
    return NextResponse.json({ ok: true, orders, orders_count: orders.length });
  } catch (error: any) {
    console.error("[v0] GET /api/orders: Management API error:", error);
    return NextResponse.json(
      { error: "mgmt_api_error", detail: error.message },
      { status: 500 }
    );
  }
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
  } catch (error: any) {
    console.error("[v0] POST /api/orders: JWT verification failed:", error);
    return NextResponse.json(
      { error: "invalid_token", detail: error.code || error.message || "verify_failed" },
      { status: 401 }
    );
  }

  // Check permissions
  if (!checkPermission(payload, "create:orders")) {
    return NextResponse.json(
      { error: "forbidden", missing: "create:orders" },
      { status: 403 }
    );
  }

  // Check email verification from namespaced claim
  const NS = "https://pizza42.example/orders_context";
  const ordersContext = payload[NS];

  if (!ordersContext) {
    return NextResponse.json(
      {
        error: "email_verification_unknown",
        hint: "Add NS claim to access token",
      },
      { status: 403 }
    );
  }

  if (ordersContext.email_verified === false) {
    return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
  }

  // Get user ID from token
  const userId = payload.sub as string;

  // Parse request body
  let body: { items: OrderItem[]; total_cents: number; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate items
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Items array is required" }, { status: 400 });
  }

  if (typeof body.total_cents !== "number") {
    return NextResponse.json({ error: "total_cents is required" }, { status: 400 });
  }

  for (const item of body.items) {
    if (
      !item.sku ||
      !item.name ||
      typeof item.qty !== "number" ||
      typeof item.price_cents !== "number"
    ) {
      return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
    }
  }

  // Create order
  const order: Order = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    items: body.items,
    total_cents: body.total_cents,
    note: body.note,
  };

  // Persist to user_metadata via Management API
  try {
    // Read current user metadata
    const user = await getUser(userId);
    const currentOrders = (user.user_metadata?.orders as Order[]) || [];

    // Append new order and keep only last 5
    const nextOrders = [order, ...currentOrders].slice(0, 5);

    // Update user_metadata
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
