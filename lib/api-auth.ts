import { auth0 } from "./auth0";

/**
 * Get session user info
 * @throws 401 if not authenticated
 */
export async function getSessionUser() {
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    const error = new Error("Unauthorized");
    (error as any).statusCode = 401;
    throw error;
  }

  return {
    userId: session.user.sub as string,
    email: session.user.email as string,
    email_verified: session.user.email_verified as boolean,
  };
}

/**
 * Get access token and validate required scopes
 * @throws 401 if not authenticated
 * @throws 403 if missing required scopes
 */
export async function getAccessTokenWithScopes(requiredScopes: string[]) {
  const result = await auth0.getAccessToken();
  
  if (!result || !result.accessToken) {
    const error = new Error("Unauthorized");
    (error as any).statusCode = 401;
    throw error;
  }

  // Decode token to get scopes
  // The scope claim is a space-separated string
  const tokenPayload = JSON.parse(
    Buffer.from(result.accessToken.split(".")[1], "base64").toString()
  );

  const tokenScopes = (tokenPayload.scope || "").split(" ");

  // Validate each required scope exists
  const missingScopes = requiredScopes.filter((scope) => !tokenScopes.includes(scope));

  if (missingScopes.length > 0) {
    const error = new Error("Insufficient scope");
    (error as any).statusCode = 403;
    (error as any).requiredScopes = requiredScopes;
    throw error;
  }

  return {
    accessToken: result.accessToken,
    scopes: tokenScopes,
  };
}
