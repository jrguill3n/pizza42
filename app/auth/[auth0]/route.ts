import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0/server";

export const runtime = "nodejs";

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email read:orders create:orders",
    },
  }),
  logout: handleLogout({
    returnTo: new URL("/", process.env.APP_BASE_URL || "http://localhost:3000").toString(),
  }),
});
