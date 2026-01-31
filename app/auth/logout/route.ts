import { handleLogout } from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get("returnTo") || "/";
  return handleLogout(req, { returnTo });
}
