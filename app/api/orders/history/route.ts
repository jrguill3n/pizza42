import { NextResponse } from "next/server";
import * as jose from "jose";
import { getUser } from "@/lib/auth0Management";

export const runtime = "nodejs";

// Cache JWKS for performance
let jwksCache: jose.JWTVerifyGetKey | null = null;

async function getJWKS(): Promise<jose.JWTVerifyGetKey> {
  if (!jwksCache) {
    const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
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
  if (payload.permissions?.includes(required)) {
    return true;
  }
  if (payload.scope?.split(" ").includes(required)) {
    return true;
  }
  return false;
}

/**
 * GET /api/orders/history
 * Returns user's order history from user_metadata
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
    console.error("[v0] GET /api/orders/history: JWT verification failed:", error);
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
