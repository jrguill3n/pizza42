import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") ?? "/";
  const prompt = url.searchParams.get("prompt") ?? undefined;

  return auth0.login(request, {
    returnTo,
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email read:orders create:orders",
      ...(prompt ? { prompt } : {}),
    },
  });
}
