"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Key, ShoppingCart, Send, Copy, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenData {
  access_token: string;
  scope?: string;
  expires_in?: number;
}

export default function OrdersDebugPage() {
  const [token, setToken] = useState<string>("");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [getResponse, setGetResponse] = useState<any>(null);
  const [postResponse, setPostResponse] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(false);

  // Load token from localStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("debug_access_token");
      if (savedToken) {
        setToken(savedToken);
      }
    }
  });

  const getAccessToken = async () => {
    setLoading("token");
    try {
      const res = await fetch("/api/auth/token");
      const data = await res.json();

      if (res.ok && data.access_token) {
        setToken(data.access_token);
        setTokenData(data);
        localStorage.setItem("debug_access_token", data.access_token);
      } else {
        setTokenData({ ...data, access_token: "Error: " + (data.error || "Unknown") });
      }
    } catch (error: any) {
      setTokenData({ access_token: "Error: " + error.message });
    } finally {
      setLoading(null);
    }
  };

  const getOrders = async () => {
    if (!token) {
      setGetResponse({ error: "No access token. Click 'Get Access Token' first." });
      return;
    }

    setLoading("get");
    setShowEmailBanner(false);
    try {
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setGetResponse({ status: res.status, data });
    } catch (error: any) {
      setGetResponse({ error: error.message });
    } finally {
      setLoading(null);
    }
  };

  const postOrder = async () => {
    if (!token) {
      setPostResponse({ error: "No access token. Click 'Get Access Token' first." });
      return;
    }

    setLoading("post");
    setShowEmailBanner(false);
    
    const sampleOrder = {
      items: [
        { sku: "PIZZA-001", name: "Margherita Pizza", qty: 1, price_cents: 1299 },
        { sku: "DRINK-001", name: "Coca Cola", qty: 2, price_cents: 299 },
      ],
      total_cents: 1897,
      note: "Extra cheese please",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sampleOrder),
      });
      const data = await res.json();
      setPostResponse({ status: res.status, data });

      // Check for email verification error
      if (res.status === 403 && data.error === "email_not_verified") {
        setShowEmailBanner(true);
      }
    } catch (error: any) {
      setPostResponse({ error: error.message });
    } finally {
      setLoading(null);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskToken = (token: string) => {
    if (token.length < 20) return token;
    return `${token.slice(0, 15)}...${token.slice(-10)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-6 max-w-4xl">
        {/* Page header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
            Orders Debug
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Test the /api/orders endpoint with JWT authorization
          </p>
        </div>

        {/* Email verification banner */}
        {showEmailBanner && (
          <div className="glass-elevated rounded-2xl p-4 mb-6 border-2 border-accent/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-accent mb-1">Verify your email to checkout</h3>
                <p className="text-sm text-muted-foreground">
                  You need to verify your email address before placing orders. Check your inbox for a verification link.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="glass-elevated rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Actions
          </h2>

          <div className="space-y-3">
            <Button
              onClick={getAccessToken}
              disabled={loading === "token"}
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold neon-glow-subtle"
            >
              <Key className="w-4 h-4" />
              {loading === "token" ? "Getting Token..." : "Get Access Token"}
            </Button>

            <Button
              onClick={getOrders}
              disabled={loading === "get" || !token}
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
              {loading === "get" ? "Loading..." : "GET /api/orders"}
            </Button>

            <Button
              onClick={postOrder}
              disabled={loading === "post" || !token}
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
            >
              <Send className="w-4 h-4" />
              {loading === "post" ? "Sending..." : "POST /api/orders (Sample Order)"}
            </Button>
          </div>
        </div>

        {/* Token display */}
        {tokenData && (
          <div className="glass-elevated rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4">Access Token</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Token</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 glass rounded-lg px-3 py-2 text-sm font-mono text-foreground break-all">
                    {maskToken(tokenData.access_token)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToken}
                    className="flex-shrink-0 bg-transparent"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {tokenData.scope && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Scope</label>
                  <code className="block glass rounded-lg px-3 py-2 text-sm font-mono text-foreground">
                    {tokenData.scope}
                  </code>
                </div>
              )}

              {tokenData.expires_in && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Expires In</label>
                  <code className="block glass rounded-lg px-3 py-2 text-sm font-mono text-foreground">
                    {tokenData.expires_in}s ({Math.floor(tokenData.expires_in / 60)} minutes)
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GET Response */}
        {getResponse && (
          <div className="glass-elevated rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">GET /api/orders Response</h2>
              {getResponse.status && (
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold",
                    getResponse.status === 200
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  )}
                >
                  {getResponse.status}
                </span>
              )}
            </div>
            <pre className="glass rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
              {JSON.stringify(getResponse.data || getResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* POST Response */}
        {postResponse && (
          <div className="glass-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">POST /api/orders Response</h2>
              {postResponse.status && (
                <span
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold",
                    postResponse.status === 201
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  )}
                >
                  {postResponse.status}
                </span>
              )}
            </div>
            <pre className="glass rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
              {JSON.stringify(postResponse.data || postResponse, null, 2)}
            </pre>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
