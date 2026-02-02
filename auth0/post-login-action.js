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
 */
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://pizza42.example/orders_context';
  
  try {
    // Get required secrets
    const domain = event.secrets.AUTH0_DOMAIN;
    const clientId = event.secrets.AUTH0_MGMT_CLIENT_ID;
    const clientSecret = event.secrets.AUTH0_MGMT_CLIENT_SECRET;

    if (!domain || !clientId || !clientSecret) {
      console.log('[Pizza42] Missing required secrets for Management API');
      return;
    }

    // Get Management API token
    const token = await getManagementToken(domain, clientId, clientSecret);

    // Fetch user data
    const user = await getUser(domain, token, event.user.user_id);

    // Get orders from user_metadata
    const orders = user.user_metadata?.orders || [];

    // Compute order statistics
    const ordersCount = orders.length;
    const lastOrderAt = ordersCount > 0 
      ? orders[orders.length - 1].createdAt 
      : null;
    const last3Orders = orders.slice(-3).reverse(); // Most recent first

    // Set custom claim on ID token
    api.idToken.setCustomClaim(namespace, {
      orders_count: ordersCount,
      last_order_at: lastOrderAt,
      last_3_orders: last3Orders,
    });

    console.log(`[Pizza42] Added orders context: ${ordersCount} orders`);
  } catch (error) {
    console.error('[Pizza42] Failed to add orders context:', error.message);
    // Don't fail the login, just skip the custom claim
  }
};
