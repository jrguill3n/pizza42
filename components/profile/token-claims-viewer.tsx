"use client";

import { RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/app-provider";
import { getTokenClaimsMock } from "@/lib/mock-data";
import { toast } from "sonner";

export function TokenClaimsViewer() {
  const { session, login } = useAuth();
  const claims = getTokenClaimsMock(session.user);

  const handleReLogin = () => {
    login();
    toast.info("Session refreshed", {
      description: "Token claims have been updated",
    });
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
        onClick={handleReLogin}
        variant="outline"
        className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-neon bg-transparent"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Re-login to refresh claims
      </Button>
    </div>
  );
}
