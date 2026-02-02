"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Loader2, AlertCircle } from "lucide-react";

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

export function OrderHistoryList({ userId }: OrderHistoryListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
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
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);
    } catch (err: any) {
      console.error("[v0] Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [userId, refreshTrigger, loadOrders]);

  // Listen for order-placed events
  useEffect(() => {
    const handleOrderPlaced = () => {
      console.log("[v0] Order placed event received, refreshing order history");
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("order-placed", handleOrderPlaced);
    return () => window.removeEventListener("order-placed", handleOrderPlaced);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Order history</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground text-sm">Loading orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Order history</h3>
        <div className="glass rounded-2xl p-4 border-2 border-destructive/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-destructive mb-1">Failed to load orders</h4>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Order history</h3>
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No orders yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Your order history will appear here
          </p>
        </div>
      </div>
    );
  }

  // Populated state
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Order history</h3>
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
