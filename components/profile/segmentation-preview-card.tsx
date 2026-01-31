"use client";

import { Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/components/providers/app-provider";
import { getSegmentationMock } from "@/lib/mock-data";

export function SegmentationPreviewCard() {
  const { session } = useAuth();

  const ordersCount = session.user?.orders_context.orders_count ?? 0;
  const lastOrderAt = session.user?.orders_context.last_order_at ?? null;

  const { segment, reasoning } = getSegmentationMock(ordersCount, lastOrderAt);

  const segmentColors: Record<string, string> = {
    "New User": "bg-green-500/20 text-green-400 border-green-500/30",
    "VIP Customer": "bg-primary/20 text-primary border-primary/30",
    "Win-back": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Active Customer": "bg-accent/20 text-accent border-accent/30",
    "Regular Customer": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Segmentation preview</h3>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
            segmentColors[segment] ?? "bg-secondary text-foreground border-border"
          }`}
        >
          {segment}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">{ordersCount} orders</span>
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{reasoning}</p>
    </div>
  );
}
