import "server-only";

const AUTH0_MGMT_DOMAIN = process.env.AUTH0_MGMT_DOMAIN!;
const AUTH0_MGMT_CLIENT_ID = process.env.AUTH0_MGMT_CLIENT_ID!;
const AUTH0_MGMT_CLIENT_SECRET = process.env.AUTH0_MGMT_CLIENT_SECRET!;

// Cache management token
let cachedToken: { token: string; expiresAt: number } | null = null;

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "pizza" | "sides" | "drinks";
}

export interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  total_usd: number;
}

export interface UserMetadata {
  orders?: Order[];
  orders_count?: number;
  last_order_at?: string;
}

export interface Auth0UserProfile {
  user_id: string;
  email: string;
  email_verified: boolean;
  user_metadata?: UserMetadata;
}

/**
 * Get a Management API access token using client credentials
 */
async function getManagementToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token;
  }

  const response = await fetch(`https://${AUTH0_MGMT_DOMAIN}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: AUTH0_MGMT_CLIENT_ID,
      client_secret: AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${AUTH0_MGMT_DOMAIN}/api/v2/`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get management token: ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/**
 * Get user profile from Auth0 Management API
 */
export async function getUser(userId: string): Promise<Auth0UserProfile> {
  const token = await getManagementToken();

  const response = await fetch(
    `https://${AUTH0_MGMT_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
export async function patchUserMetadata(
  userId: string,
  metadata: UserMetadata
): Promise<void> {
  const token = await getManagementToken();

  const response = await fetch(
    `https://${AUTH0_MGMT_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_metadata: metadata }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update user metadata: ${response.statusText}`);
  }
}

/**
 * Get user's orders from metadata
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const user = await getUser(userId);
  return user.user_metadata?.orders ?? [];
}

/**
 * Add a new order and update metadata
 */
export async function addOrder(
  userId: string,
  items: OrderItem[],
  totalUsd: number
): Promise<Order> {
  const user = await getUser(userId);
  const existingOrders = user.user_metadata?.orders ?? [];

  const newOrder: Order = {
    id: `order_${crypto.randomUUID().slice(0, 8)}`,
    created_at: new Date().toISOString(),
    items,
    total_usd: totalUsd,
  };

  // Keep most recent first, limit to 5
  const updatedOrders = [newOrder, ...existingOrders].slice(0, 5);

  await patchUserMetadata(userId, {
    orders: updatedOrders,
    orders_count: (user.user_metadata?.orders_count ?? 0) + 1,
    last_order_at: newOrder.created_at,
  });

  return newOrder;
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await getUser(userId);
  return user.email_verified;
}
