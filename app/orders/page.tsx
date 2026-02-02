"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Key, ShoppingCart, Send, Copy, Check, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pizza42_access_token";

// Helper to safely parse JSON even on errors
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return { error: "Failed to parse JSON response" };
  }
}

export default function OrdersDebugPage() {
  const [token, setToken] = useState<string>("");
  const [note, setNote] = useState<string>("order ui");
  const [getResponse, setGetResponse] = useState<any>(null);
  const [postResponse, setPostResponse] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailBanner, setShowEmailBanner] = useState(false);
  const [show401Hint, setShow401Hint] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const getAccessToken = async () => {
    setLoading("token");
    setShow401Hint(false);
    try {
      const res = await fetch("/api/auth/token", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await safeJson(res);

      if (res.ok && data.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem(STORAGE_KEY, data.accessToken);
      } else {
        alert(`Failed to get token: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  const clearToken = () => {
    setToken("");
    localStorage.removeItem(STORAGE_KEY);
    setGetResponse(null);
    setPostResponse(null);
    setShowEmailBanner(false);
    setShow401Hint(false);
  };

  const getOrders = async () => {
    if (!token) return;

    setLoading("get");
    setShowEmailBanner(false);
    setShow401Hint(false);
    try {
      const res = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      const data = await safeJson(res);
      setGetResponse({ status: res.status, data });

      if (res.status === 401) {
        setShow401Hint(true);
      }
    } catch (error: any) {
      setGetResponse({ error: error.message });
    } finally {
      setLoading(null);
    }
  };

  const postOrder = async () => {
    if (!token) return;

    setLoading("post");
    setShowEmailBanner(false);
    setShow401Hint(false);

    const orderBody = {
      items: [
        { sku: "pepperoni", name: "Pepperoni", qty: 1, price_cents: 1599 },
      ],
      total_cents: 1599,
      note: note || "order ui",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderBody),
        cache: "no-store",
      });
      const data = await safeJson(res);
      setPostResponse({ status: res.status, data });

      // Check for email verification error
      if (res.status === 403 && data.error === "email_not_verified") {
        setShowEmailBanner(true);
      }

      if (res.status === 401) {
        setShow401Hint(true);
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

  const formatTokenDisplay = (token: string) => {
    if (token.length < 20) return token;
    const first10 = token.slice(0, 10);
    const last10 = token.slice(-10);
    return `${first10}...${last10}`;
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
          <div className="glass-elevated rounded-2xl p-4 mb-6 border-2 border-accent/30 neon-glow-subtle">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-accent mb-1">Verify your email to checkout</h3>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for a verification link from Auth0.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 401 hint banner */}
        {show401Hint && (
          <div className="glass-elevated rounded-2xl p-4 mb-6 border-2 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Token expired</h3>
                <p className="text-sm text-muted-foreground">
                  Click "Get Token" again to refresh your access token.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token section */}
        <div className="glass-elevated rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Token
          </h2>

          <div className="space-y-3">
            <Button
              onClick={getAccessToken}
              disabled={loading === "token"}
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold neon-glow-subtle"
            >
              <Key className="w-4 h-4" />
              {loading === "token" ? "Getting Token..." : "Get Token"}
            </Button>

            {token && (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Token Status
                  </label>
                  <div className="glass rounded-lg p-3 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Length: {token.length} chars
                    </div>
                    <code className="block text-sm font-mono text-foreground break-all">
                      {formatTokenDisplay(token)}
                    </code>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyToken}
                        className="flex-1 bg-transparent"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={clearToken}
                        className="flex-1 bg-transparent text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* API section */}
        <div className="glass-elevated rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            API Calls
          </h2>

          <div className="space-y-3">
            <Button
              onClick={getOrders}
              disabled={loading === "get" || !token}
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
              {loading === "get" ? "Loading..." : "GET /api/orders"}
            </Button>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="order ui"
                className="w-full glass rounded-lg px-3 py-2 text-sm font-mono text-foreground bg-transparent border border-border/50 focus:border-primary/50 focus:outline-none"
              />
            </div>

            <Button
              onClick={postOrder}
              disabled={loading === "post" || !token}
              variant="outline"
              className="w-full justify-start gap-2 bg-transparent"
            >
              <Send className="w-4 h-4" />
              {loading === "post" ? "Sending..." : "POST /api/orders"}
            </Button>
          </div>
        </div>

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
