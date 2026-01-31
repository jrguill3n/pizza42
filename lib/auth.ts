import * as jose from "jose";

const AUTH0_ISSUER = process.env.AUTH0_ISSUER_BASE_URL!;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE!;

// Cache JWKS for performance
let jwks: jose.JWTVerifyGetKey | null = null;

function getJWKS() {
  if (!jwks) {
    const jwksUrl = new URL("/.well-known/jwks.json", AUTH0_ISSUER);
    jwks = jose.createRemoteJWKSet(jwksUrl);
  }
  return jwks;
}

export interface AccessTokenPayload {
  sub: string;
  scope?: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: unknown;
}

export interface VerifyResult {
  payload: AccessTokenPayload;
  error?: never;
}

export interface VerifyError {
  payload?: never;
  error: string;
  status: number;
}

/**
 * Verify an Auth0 access token using JWKS
 */
export async function verifyAccessToken(
  authHeader: string | null
): Promise<VerifyResult | VerifyError> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jose.jwtVerify(token, getJWKS(), {
      issuer: AUTH0_ISSUER.endsWith("/") ? AUTH0_ISSUER : `${AUTH0_ISSUER}/`,
      audience: AUTH0_AUDIENCE,
    });

    return { payload: payload as AccessTokenPayload };
  } catch (err) {
    if (err instanceof jose.errors.JWTExpired) {
      return { error: "Token expired", status: 401 };
    }
    if (err instanceof jose.errors.JWTClaimValidationFailed) {
      return { error: "Token validation failed", status: 401 };
    }
    return { error: "Invalid token", status: 401 };
  }
}

/**
 * Check if the token has the required scope
 */
export function requireScope(
  payload: AccessTokenPayload,
  requiredScope: string
): { error: string; status: number } | null {
  const scopes = payload.scope?.split(" ") ?? [];
  if (!scopes.includes(requiredScope)) {
    return { error: `Missing required scope: ${requiredScope}`, status: 403 };
  }
  return null;
}

/**
 * Extract user ID from token subject
 */
export function getUserId(payload: AccessTokenPayload): string {
  return payload.sub;
}
