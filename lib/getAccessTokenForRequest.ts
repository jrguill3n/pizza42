import "server-only";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0.server";

/**
 * Helper to get access token for the current session in an App Router route handler.
 * Uses @auth0/nextjs-auth0 v4 with proper audience and scopes.
 * Returns { accessToken, response } where response contains any set-cookie headers.
 */
export async function getAccessTokenForRequest(request: Request): Promise<{
  accessToken: string;
  response?: Response;
}> {
  // Create a NextResponse to allow SDK to set cookies if needed
  const res = new NextResponse();

  // Get access token with required audience and scopes
  const { token } = await auth0.getAccessToken(request, res, {
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email read:orders create:orders",
    },
  });

  if (!token) {
    throw new Error("No access token returned from Auth0");
  }

  return {
    accessToken: token,
    response: res,
  };
}
