/**
 * Auth0 Post-Login Action: Add Orders Context to ID Token
 * 
 * This Action fetches the user's order history from user_metadata and adds
 * a custom namespaced claim to the ID token with order statistics.
 * 
 * Required Action Secrets (configure in Auth0 Dashboard > Actions > Library):
 * - AUTH0_DOMAIN: Your Auth0 domain (e.g., "your-tenant.auth0.com")
 * - AUTH0_MGMT_CLIENT_ID: Management API client ID
 * - AUTH0_MGMT_CLIENT_SECRET: Management API client secret
 * 
 * How to deploy:
 * 1. Go to Auth0 Dashboard > Actions > Library
 * 2. Create a new Action (Post Login flow)
 * 3. Copy/paste this code
 * 4. Add the required secrets in the Secrets tab
 * 5. Deploy the Action
 * 6. Add it to the Login flow
 */

let managementToken = null;
let tokenExpiry = 0;

/**
 * Get Management API access token with caching
 */
async function getManagementToken(domain, clientId, clientSecret) {
  const now = Date.now();
  
  // Return cached token if still valid (with 5 min buffer)
  if (managementToken && tokenExpiry > now + 300000) {
    return managementToken;
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get management token: ${response.statusText}`);
  }

  const data = await response.json();
  managementToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000);
  
  return managementToken;
}

/**
 * Fetch user data from Management API
 */
async function getUser(domain, token, userId) {
  const response = await fetch(
    `https://${domain}/api/v2/users/${encodeURIComponent(userId)}`,
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
 * Post-Login Action handler
 * 
 * Simplified version that adds basic user context to both ID and access tokens.
 * The access token claim is required by /api/orders POST to validate email_verified.
 */
exports.onExecutePostLogin = async (event, api) => {
  const NS = "https://pizza42.example/orders_context";
  const payload = {
    ts: new Date().toISOString(),
    email: event.user.email || null,
    email_verified: !!event.user.email_verified,
    note: "post-login action executed"
  };
  api.idToken.setCustomClaim(NS, payload);
  api.accessToken.setCustomClaim(NS, payload);
};
