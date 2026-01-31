# Pizza 42

A demo pizza ordering app showcasing Auth0 integration patterns for identity-driven applications.

## What This App Demonstrates

- **Auth0 Authentication** - Login with Google (or other social/DB connections)
- **Custom Scopes** - `read:orders` and `create:orders` for API authorization
- **User Metadata Storage** - Order history stored in Auth0 `user_metadata`
- **Custom Claims** - `https://pizza42.example/orders_context` enriched via Auth0 Action
- **Email Verification Gating** - Unverified users cannot place orders
- **Token Refresh Flow** - Re-login to refresh claims after placing orders

## Local Setup

1. Clone the repository and install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy `.env.example` to `.env.local` and fill in your Auth0 credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

3. Configure Auth0:
   - Create an Auth0 Application (Regular Web Application)
   - Add `http://localhost:3000/auth/callback` to Allowed Callback URLs
   - Add `http://localhost:3000` to Allowed Logout URLs
   - Create an API with identifier matching `AUTH0_AUDIENCE`
   - Add scopes: `read:orders`, `create:orders`
   - Create a Machine-to-Machine app for Management API access

4. Add an Auth0 Action (Login flow) to enrich tokens with order context:
   \`\`\`javascript
   exports.onExecutePostLogin = async (event, api) => {
     const namespace = 'https://pizza42.example';
     const metadata = event.user.user_metadata || {};
     
     api.idToken.setCustomClaim(`${namespace}/orders_context`, {
       orders_count: metadata.orders_count || 0,
       last_order_at: metadata.last_order_at || null,
       last_order: metadata.last_order || null
     });
   };
   \`\`\`

5. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `AUTH0_SECRET` | Random string for session encryption (min 32 chars) |
| `AUTH0_BASE_URL` | App URL (e.g., `http://localhost:3000`) |
| `AUTH0_ISSUER_BASE_URL` | Auth0 tenant URL (e.g., `https://your-tenant.auth0.com`) |
| `AUTH0_CLIENT_ID` | Application client ID |
| `AUTH0_CLIENT_SECRET` | Application client secret |
| `AUTH0_AUDIENCE` | API identifier for access tokens |
| `AUTH0_MGMT_CLIENT_ID` | M2M app client ID for Management API |
| `AUTH0_MGMT_CLIENT_SECRET` | M2M app client secret |

## Demo Script

### 1. Unverified User Flow
1. Sign up with a new email/password account
2. Skip email verification
3. Add items to cart and attempt checkout
4. Observe: "Email verification required" banner appears, Place Order is blocked

### 2. Verified User Flow
1. Verify your email (check inbox for verification link)
2. Log out and log back in to refresh session
3. Add items to cart and place order
4. Observe: Order succeeds, toast confirmation appears

### 3. Claims Refresh Flow
1. After placing an order, go to Profile page
2. Check "Token Claims" section - `orders_context` shows stale data
3. Click "Re-login to refresh claims"
4. After re-authentication, observe updated `orders_count` and `last_order`

### 4. Repeat Order Flow
1. On Home page, logged-in users with past orders see "Repeat Last Order" card
2. Click "Reorder now" to prefill cart with previous items
3. Proceed to checkout

## Architecture

\`\`\`
/app
  /auth/[auth0]     → Auth0 route handler (login, logout, callback)
  /api/auth/token   → Returns access token for API calls
  /api/orders       → Protected orders API (GET/POST)
  /order            → Menu and cart page
  /profile          → User profile with claims viewer

/lib
  /auth0.ts         → Session helpers and type definitions
  /auth.ts          → JWT verification with JWKS
  /mgmt.ts          → Auth0 Management API client
  /api-client.ts    → Client-side API utilities
\`\`\`

## License

MIT
