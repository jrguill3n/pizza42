import { handleLogin } from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/";
  const screen_hint = req.nextUrl.searchParams.get("screen_hint") || undefined;
  const prompt = req.nextUrl.searchParams.get("prompt") || undefined;

  return handleLogin(req, {
    returnTo,
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email read:orders create:orders",
      ...(screen_hint ? { screen_hint } : {}),
      ...(prompt ? { prompt } : {}),
    },
  });
}
