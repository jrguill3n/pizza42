import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

/**
 * Helper to get access token for a request with proper SDK signature handling
 * Tries auth0.getAccessToken(request) first, then falls back to auth0.getAccessToken(request, response)
 * Returns { accessToken, scope } and ensures any set-cookie headers are preserved
 */
export async function getAccessTokenForRequest(request: Request): Promise<{
  accessToken: string;
  scope: string;
  response?: NextResponse;
}> {
  try {
    // Try calling with just request first
    const tokenResult = await auth0.getAccessToken(request);
    
    if (tokenResult && tokenResult.accessToken) {
      return {
        accessToken: tokenResult.accessToken,
        scope: tokenResult.scope || "",
      };
    }
  } catch (error: any) {
    // If it fails due to argument mismatch, try with response object
    console.log("[v0] getAccessToken(request) failed, trying with response:", error.message);
  }

  // Fallback: try with response object
  const response = NextResponse.next();
  const tokenResult = await auth0.getAccessToken(request, response);
  
  if (!tokenResult || !tokenResult.accessToken) {
    throw new Error("NoTokenReturned");
  }

  return {
    accessToken: tokenResult.accessToken,
    scope: tokenResult.scope || "",
    response,
  };
}
