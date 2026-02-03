"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Loader2, AlertCircle, ShoppingBag, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl, getSignupUrl } from "@/lib/auth0";
import { t } from "@/lib/copy";
import { useRouter } from "next/navigation";

/**
 * Convert cents to formatted dollar string
 * @param cents - Amount in cents (integer)
 * @returns Formatted string like "$12.34"
 */
function centsToDollars(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

interface OrderHistoryListProps {
  userId?: string;
  isAuthenticated?: boolean;
  emailVerified?: boolean;
}

interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  price_cents: number;
}

interface Order {
  id: string;
  created_at: string;
  items: OrderItem[];
  total_cents: number;
  note?: string;
}

export function OrderHistoryList({ userId, isAuthenticated = false, emailVerified = false }: OrderHistoryListProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadOrders = useCallback(async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // Don't fetch if email is not verified
    if (!emailVerified) {
      setIsLoading(false);
      setIsUnverified(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsUnverified(false);
    
    try {
      // Step 1: Get access token
      const tokenRes = await fetch("/api/auth/token", {
        credentials: "include",
        cache: "no-store",
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get access token");
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.accessToken;

      if (!accessToken) {
        throw new Error("No access token returned");
      }

      // Step 2: Fetch orders with token
      const ordersRes = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (!ordersRes.ok) {
        const errorData = await ordersRes.json();
        
        // Handle expected error states gracefully
        if (errorData.error === "email_not_verified" || errorData.error === "forbidden") {
          setIsUnverified(true);
          return;
        }
        
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, emailVerified]);

  useEffect(() => {
    loadOrders();
  }, [userId, refreshTrigger, loadOrders]);

  // Listen for order-placed events
  useEffect(() => {
    const handleOrderPlaced = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("order-placed", handleOrderPlaced);
    return () => window.removeEventListener("order-placed", handleOrderPlaced);
  }, []);

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
        <div className="rounded-2xl p-8 text-center bg-secondary/30">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-foreground font-semibold mb-2">{t("orders_login_title")}</h4>
          <p className="text-muted-foreground text-sm mb-6">
            {t("orders_login_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href={getLoginUrl("/profile")}>{t("orders_login_cta")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <a href={getSignupUrl("/profile")}>{t("orders_signup_cta")}</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Email not verified state
  if (isUnverified) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
        <div className="rounded-2xl p-8 text-center bg-secondary/30">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
          <h4 className="text-foreground font-semibold mb-2">{t("orders_unverified_title")}</h4>
          <p className="text-muted-foreground text-sm mb-6">
            {t("orders_unverified_subtitle")}
          </p>
          <Button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            {t("orders_refresh_cta")}
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">{t("orders_loading")}</p>
        </div>
      </div>
    );
  }

  // Unexpected error state (500, network error, etc.)
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
        <div className="rounded-2xl p-8 text-center bg-destructive/10">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h4 className="text-destructive font-semibold mb-2">{t("orders_error_title")}</h4>
          <p className="text-muted-foreground text-sm mb-6">
            {t("orders_error_subtitle")}
          </p>
          <Button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            {t("orders_retry_cta")}
          </Button>
        </div>
      </div>
    );
  }

  // Empty state (verified user with no orders)
  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
        <div className="rounded-2xl p-8 text-center bg-secondary/30">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-foreground font-semibold mb-2">{t("orders_empty_title")}</h4>
          <p className="text-muted-foreground text-sm mb-6">
            {t("orders_empty_subtitle")}
          </p>
          <Button
            onClick={() => router.push("/order")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t("orders_empty_cta")}
          </Button>
        </div>
      </div>
    );
  }

  // Populated state
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("orders_history_title")}</h3>
      <div className="space-y-3">
        {orders.map((order) => {
          const orderDate = new Date(order.created_at);

          return (
            <div
              key={order.id}
              className="glass rounded-xl p-4 transition-neon hover:bg-secondary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {orderDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at{" "}
                    {orderDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {order.note && (
                    <p className="text-muted-foreground text-xs mt-1 italic">
                      {order.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => {
                  const itemTotalCents = item.qty * item.price_cents;
                  return (
                    <div
                      key={`${order.id}-${item.sku}-${idx}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.qty}x {item.name}
                      </span>
                      <span className="text-foreground">
                        {centsToDollars(itemTotalCents)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-primary font-bold neon-text-cyan">
                  {centsToDollars(order.total_cents)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
