import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return auth0.handleCallback(request);
}
