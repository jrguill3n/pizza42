"use client";

import Link from "next/link";
import { RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Auth0User, OrdersContext } from "@/lib/auth0";
import { ORDERS_CONTEXT_CLAIM, getLoginUrl } from "@/lib/auth0";

interface TokenClaimsViewerProps {
  user: Auth0User | null;
  ordersContext: OrdersContext | null;
}

export function TokenClaimsViewer({ user, ordersContext }: TokenClaimsViewerProps) {
  if (!user) return null;

  // Build filtered claims object - only show relevant fields
  const claims = {
    email: user.email,
    email_verified: user.email_verified,
    [ORDERS_CONTEXT_CLAIM]: ordersContext ?? null,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Token claims</h3>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <pre className="p-4 text-xs font-mono text-foreground overflow-x-auto scrollbar-hide">
          {JSON.stringify(claims, null, 2)}
        </pre>
      </div>

      <p className="text-xs text-muted-foreground">
        Claims refresh on next login.
      </p>

      <Button
        asChild
        variant="outline"
        className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-neon bg-transparent"
      >
        <Link href={getLoginUrl("/profile")}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-login to refresh claims
        </Link>
      </Button>
    </div>
  );
}
