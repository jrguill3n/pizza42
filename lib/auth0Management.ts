/**
 * Auth0 Management API helpers
 */

interface ManagementTokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: ManagementTokenCache | null = null;

/**
 * Get Auth0 Management API token using Client Credentials flow
 * Caches token in memory with expiry
 */
export async function getManagementToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error("Missing Auth0 Management API credentials");
  }

  const tokenUrl = `https://${domain}/oauth/token`;
  const audience = `https://${domain}/api/v2/`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get Management API token: ${response.statusText}`
    );
  }

  const data = await response.json();

  // Cache token (expires_in is in seconds)
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Get user from Auth0 Management API
 */
export async function getUser(sub: string): Promise<any> {
  const token = await getManagementToken();
  const domain = process.env.AUTH0_DOMAIN;

  const response = await fetch(
    `https://${domain}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update user metadata in Auth0
 */
export async function updateUserMetadata(
  sub: string,
  user_metadata: object
): Promise<any> {
  const token = await getManagementToken();
  const domain = process.env.AUTH0_DOMAIN;

  const response = await fetch(
    `https://${domain}/api/v2/users/${encodeURIComponent(sub)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_metadata }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update user metadata: ${response.statusText}`);
  }

  return response.json();
}
