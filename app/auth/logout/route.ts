import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const base = process.env.APP_BASE_URL!;
  const returnToAbs = new URL("/", base).toString();
  return auth0.logout(request, { returnTo: returnToAbs });
}
