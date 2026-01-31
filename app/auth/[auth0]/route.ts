import { handleAuth } from "@auth0/nextjs-auth0/server";

export const runtime = "nodejs";

export const GET = handleAuth();
