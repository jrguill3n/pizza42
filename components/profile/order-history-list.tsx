"use client";

import { useEffect, useState } from "react";
import { Clock, Package, CheckCircle, Truck, Loader2 } from "lucide-react";
import type { Order } from "@/lib/mock-data";
import { fetchOrdersMock } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface OrderHistoryListProps {
  userId?: string;
}

const statusConfig = {
  pending: { icon: Clock, label: "Pending", color: "text-yellow-400" },
  preparing: { icon: Package, label: "Preparing", color: "text-primary" },
  ready: { icon: CheckCircle, label: "Ready", color: "text-green-400" },
  delivered: { icon: Truck, label: "Delivered", color: "text-muted-foreground" },
};

export function OrderHistoryList({ userId }: OrderHistoryListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrdersMock(userId);
        setOrders(data);
      } catch {
        console.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, [userId]);

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
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
          const orderDate = new Date(order.created_at);

          return (
            <div
              key={order.id}
              className="glass rounded-xl p-4 transition-neon hover:bg-secondary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
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
                </div>
                <div className={cn("flex items-center gap-1.5", status.color)}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">{status.label}</span>
                </div>
              </div>

              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div
                    key={`${order.id}-${item.id}-${idx}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-primary font-bold neon-text-cyan">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
