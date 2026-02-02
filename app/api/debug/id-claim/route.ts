import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0.server";

export const runtime = "nodejs";

/**
 * GET /api/debug/id-claim
 * Debug endpoint to check if custom orders_context claim exists in ID token
 * Returns the custom claim data from the user session
 */
export async function GET() {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json({
        hasClaim: false,
        claim: null,
        error: "No session found",
      });
    }

    const claimKey = "https://pizza42.example/orders_context";
    const claim = session.user[claimKey];
    const hasClaim = !!claim;

    return NextResponse.json({
      hasClaim,
      claim: claim || null,
    });
  } catch (error) {
    console.error("[v0] /api/debug/id-claim error:", error);
    return NextResponse.json(
      {
        hasClaim: false,
        claim: null,
        error: "Failed to get session",
      },
      { status: 500 }
    );
  }
}
