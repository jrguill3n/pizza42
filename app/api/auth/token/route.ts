import { NextResponse } from "next/server";
import { getAuth0Session } from "@/lib/auth0";

/**
 * GET /api/auth/token
 * Returns an access token for the logged-in user with read:orders and create:orders scopes.
 * 
 * In production with Auth0 configured, this would use:
 * import { Auth0Client } from "@auth0/nextjs-auth0/server";
 * const auth0 = new Auth0Client();
 * const { accessToken } = await auth0.getAccessToken({
 *   scopes: ["read:orders", "create:orders"],
 *   audience: process.env.AUTH0_AUDIENCE,
 * });
 */
export async function GET() {
  const session = await getAuth0Session();

  if (!session?.user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Not logged in" },
      { status: 401 }
    );
  }

  // In v0 preview, return a demo token
  // When deployed with Auth0, replace with real getAccessToken() call:
  //
  // try {
  //   const { accessToken } = await auth0.getAccessToken({
  //     scopes: ["read:orders", "create:orders"],
  //     audience: process.env.AUTH0_AUDIENCE,
  //   });
  //   return NextResponse.json({ accessToken });
  // } catch (error) {
  //   return NextResponse.json(
  //     { error: "token_error", message: "Failed to get access token" },
  //     { status: 500 }
  //   );
  // }

  // Demo token for preview (not a real JWT - for UI testing only)
  const demoToken = Buffer.from(
    JSON.stringify({
      sub: session.user.sub,
      scope: "read:orders create:orders",
      aud: process.env.AUTH0_AUDIENCE || "https://api.pizza42.example",
      iss: `https://${process.env.AUTH0_DOMAIN || "pizza42.us.auth0.com"}/`,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString("base64");

  return NextResponse.json({
    accessToken: `demo.${demoToken}.signature`,
  });
}
