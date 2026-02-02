"use client";

import React from "react";

import { useEffect, useState } from "react";
import { Users, Sparkles, Repeat, Crown, Info } from "lucide-react";
import { getOrders } from "@/lib/api-client";
import type { OrdersContext } from "@/lib/auth0";

interface SegmentationPreviewCardProps {
  ordersContext: OrdersContext | null;
}

type Segment = "new_customer" | "repeat_customer" | "power_customer";

interface SegmentInfo {
  label: string;
  reasoning: string;
  icon: React.ReactNode;
  color: string;
}

function computeSegment(ordersCount: number): Segment {
  if (ordersCount === 0) {
    return "new_customer";
  }
  if (ordersCount >= 1 && ordersCount < 5) {
    return "repeat_customer";
  }
  // ordersCount >= 5
  return "power_customer";
}

function getSegmentInfo(segment: Segment): SegmentInfo {
  switch (segment) {
    case "new_customer":
      return {
        label: "New Customer",
        reasoning: "First order bonus unlocked.",
        icon: <Sparkles className="w-4 h-4" />,
        color: "bg-green-500/20 text-green-400 border-green-500/30",
      };
    case "repeat_customer":
      return {
        label: "Repeat Customer",
        reasoning: "Welcome back! Reorder in one tap.",
        icon: <Repeat className="w-4 h-4" />,
        color: "bg-primary/20 text-primary border-primary/30",
      };
    case "power_customer":
      return {
        label: "Power Customer (VIP)",
        reasoning: "You're one of our regulars. Thanks for coming back!",
        icon: <Crown className="w-4 h-4" />,
        color: "bg-accent/20 text-accent border-accent/30",
      };
  }
}

export function SegmentationPreviewCard({ ordersContext }: SegmentationPreviewCardProps) {
  const [ordersCount, setOrdersCount] = useState(ordersContext?.orders_count ?? 0);
  const [isLoading, setIsLoading] = useState(!ordersContext);
  const [prevSegment, setPrevSegment] = useState<Segment | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Fallback to API if no claim data
  useEffect(() => {
    if (ordersContext) {
      setOrdersCount(ordersContext.orders_count);
      setIsLoading(false);
      return;
    }

    // Fetch from API as fallback
    async function fetchOrders() {
      try {
        const result = await getOrders();
        if (result.success && result.orders) {
          const count = result.orders.length;
          setOrdersCount(count);
        }
      } catch {
        // Keep defaults if API fails
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, [ordersContext]);

  const segment = computeSegment(ordersCount);
  const segmentInfo = getSegmentInfo(segment);

  // Animate on segment change
  useEffect(() => {
    if (prevSegment !== null && prevSegment !== segment) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevSegment(segment);
  }, [segment, prevSegment]);

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
        <div className="relative ml-auto">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            className="w-5 h-5 rounded-full bg-secondary/50 hover:bg-secondary/80 flex items-center justify-center transition-colors"
            aria-label="Why am I seeing this?"
          >
            <Info className="w-3 h-3 text-muted-foreground" />
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-elevated rounded-lg p-3 text-xs text-foreground shadow-lg z-10">
              <p className="font-semibold mb-1">Why am I seeing this?</p>
              <p className="text-muted-foreground">Based on your order history.</p>
            </div>
          )}
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
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

        <p className="text-muted-foreground text-sm leading-relaxed mt-4">
          {segmentInfo.reasoning}
        </p>
      </div>
    </div>
  );
}
