import { handleAuth, handleLogin } from "@auth0/nextjs-auth0/server";

export const runtime = "nodejs";

const authHandler = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email read:orders create:orders",
    },
  }),
});

export const GET = authHandler;
export const POST = authHandler;
