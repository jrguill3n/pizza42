# 🍕 Pizza42 — Auth0 CIAM Reference Implementation

Pizza42 is a modern, consumer-style pizza ordering application built as a **reference implementation for Auth0 (Okta CIAM)**.

It demonstrates how to design and implement a secure, scalable, and user-friendly customer identity platform using:

- Universal Login
- JWT-protected APIs with scopes
- Post-login Actions
- Custom claims
- User metadata
- Token-based personalization
- Modern Next.js App Router architecture

This project intentionally goes beyond a basic authentication demo and focuses on **real-world CIAM patterns** found in production consumer applications.

---

## 🔗 Live Demo

https://v0-pizza42.vercel.app

> UI is in Spanish to simulate a LATAM consumer product.  
> Documentation is in English for technical review.

---

## 🎯 What This Demonstrates (Auth0 CIAM Capabilities)

- Auth0 Universal Login (DB + Social)
- Session-based authentication
- Secure access token issuance with audience & scopes
- JWT validation in server-side APIs
- API authorization using scopes:
  - `read:orders`
  - `create:orders`
- Saving last orders into `user_metadata`
- Injecting order context into ID token via Post-Login Action
- Custom namespaced claims
- Gating functionality based on `email_verified`
- Token-driven personalization

---

## 🧩 Architecture

## Authentication & Authorization Flow
High-level flow for obtaining tokens and placing orders:
```
Browser
↓
Next.js App Router (Client Components)
↓
Auth0 SDK (Session)
↓
/api/auth/token → Access Token (JWT)
↓
/api/orders (Protected API + scopes)
↓
Auth0 Management API
↓
Auth0 User Metadata (orders)
```
- Auth0 Universal Login handles authentication.
- Access Tokens are used to call protected APIs.
- ID Tokens contain custom claims for UI personalization.
- Orders are stored in Auth0 user_metadata.

### Detailed Architecture Diagram
![Detailed Architecture](diagramageneral.png)

**Separation of concerns:**

- Client-safe Auth0 code → `lib/auth0.ts`
- Server-only Auth0 code → `lib/auth0.server.ts`
- JWT validation happens server-side
- No secrets exposed to client

---

## 👤 User Flows

### Login

- User clicks "Iniciar sesión"
- Redirected to Auth0 Universal Login
- Session established

### View Menu

- Public catalog loads
- Prices resolved from catalog map

### Place Order

- Client requests access token
- Calls protected `/api/orders`
- JWT validated
- Scope `create:orders` required
- Order saved to user_metadata

### Reorder Last Order

- Last orders read from ID token custom claim
- Cart rebuilt from SKU price map
- User can instantly reorder

---

## 🔐 Security Model

- All sensitive operations happen server-side
- APIs protected by JWT validation
- Scopes enforced
- Namespaced custom claims
- No trusting client-provided prices
- Orders rebuilt from catalog SKUs

---

## 🛠 Tech Stack

- Next.js 16 (App Router)
- React 19
- Auth0 (Okta CIAM)
- TypeScript
- Tailwind CSS
- Vercel

---

## 🚀 Local Development

```bash
git clone https://github.com/jrguill3n/pizza42
cd pizza42
npm install
npm run dev
```

Create `.env.local`:

```bash
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=
AUTH0_ISSUER_BASE_URL=
AUTH0_BASE_URL=http://localhost:3000
```

---

## 📝 Notes for Reviewers

This project intentionally models patterns used in real consumer platforms:

- Token-driven personalization
- Backend-enforced authorization
- Clear client/server separation
- Minimal surface area for secrets
- Scalable identity architecture

The goal is to demonstrate how a Solutions Engineer designs CIAM, not just how they wire up login.

---

## 👨‍💻 Author

Ramon Guillén  
Senior Solutions Engineer / Solutions Architect
