"use client";

import React from "react"

import { useEffect, useState } from "react";
import { Users, Sparkles, Heart, Clock } from "lucide-react";
import { getOrders } from "@/lib/api-client";
import type { OrdersContext } from "@/lib/auth0";

interface SegmentationPreviewCardProps {
  ordersContext: OrdersContext | null;
}

type Segment = "new_customer" | "repeat_customer" | "lapsed_customer";

interface SegmentInfo {
  label: string;
  reasoning: string;
  icon: React.ReactNode;
  color: string;
}

function computeSegment(ordersCount: number, lastOrderAt: string | null): Segment {
  if (ordersCount === 0) {
    return "new_customer";
  }

  if (lastOrderAt) {
    const lastOrderDate = new Date(lastOrderAt);
    const now = new Date();
    const daysSinceLastOrder = Math.floor(
      (now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (ordersCount >= 2 && daysSinceLastOrder <= 30) {
      return "repeat_customer";
    }

    if (daysSinceLastOrder > 30) {
      return "lapsed_customer";
    }
  }

  // Default for single order within 30 days
  return ordersCount >= 2 ? "repeat_customer" : "new_customer";
}

function getSegmentInfo(segment: Segment): SegmentInfo {
  switch (segment) {
    case "new_customer":
      return {
        label: "New Customer",
        reasoning: "Welcome! You haven't placed an order yet. We can't wait to serve you your first pizza.",
        icon: <Sparkles className="w-4 h-4" />,
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    case "repeat_customer":
      return {
        label: "Repeat Customer",
        reasoning: "You're one of our regulars! Thanks for coming back within the last 30 days.",
        icon: <Heart className="w-4 h-4" />,
        color: "bg-primary/20 text-primary border-primary/30",
      };
    case "lapsed_customer":
      return {
        label: "We Miss You",
        reasoning: "It's been over 30 days since your last order. Come back for a slice!",
        icon: <Clock className="w-4 h-4" />,
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
  }
}

export function SegmentationPreviewCard({ ordersContext }: SegmentationPreviewCardProps) {
  const [ordersCount, setOrdersCount] = useState(ordersContext?.orders_count ?? 0);
  const [lastOrderAt, setLastOrderAt] = useState(ordersContext?.last_order_at ?? null);
  const [isLoading, setIsLoading] = useState(!ordersContext);

  // Fallback to API if no claim data
  useEffect(() => {
    if (ordersContext) {
      setOrdersCount(ordersContext.orders_count);
      setLastOrderAt(ordersContext.last_order_at);
      setIsLoading(false);
      return;
    }

    // Fetch from API as fallback
    async function fetchOrders() {
      try {
        const result = await getOrders();
        if (result.success && result.orders) {
          const count = result.orders.length;
          const lastOrder = result.orders[0];
          setOrdersCount(count);
          setLastOrderAt(lastOrder?.created_at ?? null);
        }
      } catch {
        // Keep defaults if API fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [ordersContext]);

  const segment = computeSegment(ordersCount, lastOrderAt);
  const segmentInfo = getSegmentInfo(segment);

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Segmentation preview</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-secondary/50 rounded-full w-32" />
          <div className="h-4 bg-secondary/50 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Segmentation preview</h3>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${segmentInfo.color}`}
        >
          {segmentInfo.icon}
          {segmentInfo.label}
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {ordersCount} {ordersCount === 1 ? "order" : "orders"}
        </span>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {segmentInfo.reasoning}
      </p>
    </div>
  );
}
