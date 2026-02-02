"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Repeat,
  CheckCircle,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { useCart } from "@/components/providers/app-provider";
import { featuredItems } from "@/lib/mock-data";
import { toast } from "sonner";
import type { Auth0User, OrdersContext } from "@/lib/auth0";
import { getLoginUrl, getSignupUrl, getLogoutUrl } from "@/lib/auth0";

interface HomeContentProps {
  user: Auth0User | null;
  ordersContext: OrdersContext | null;
}

interface OrderFromAPI {
  id: string;
  items: Array<{
    sku: string;
    name: string;
    qty: number;
    price_cents: number;
  }>;
  total_cents: number;
  created_at: string;
}

export function HomeContent({ user, ordersContext: initialOrdersContext }: HomeContentProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [ordersContext, setOrdersContext] = useState<OrdersContext | null>(initialOrdersContext);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const isAuthenticated = !!user;
  
  // If no orders context from token, fetch from API
  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated || ordersContext) return;
      
      setIsLoadingOrders(true);
      try {
        // Get access token
        const tokenRes = await fetch("/api/auth/token", {
          credentials: "include",
          cache: "no-store",
        });
        
        if (!tokenRes.ok) return;
        
        const { accessToken } = await tokenRes.json();
        
        // Fetch orders
        const ordersRes = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });
        
        if (ordersRes.ok) {
          const { orders } = await ordersRes.json() as { orders: OrderFromAPI[] };
          
          if (orders && orders.length > 0) {
            const lastOrder = orders[0];
            setOrdersContext({
              orders_count: orders.length,
              last_order_at: lastOrder.created_at,
              last_3_orders: orders.slice(0, 3).map(order => ({
                id: order.id,
                items: order.items.map(item => ({
                  id: item.sku,
                  name: item.name,
                  price: item.price_cents / 100,
                  quantity: item.qty,
                  category: "pizza" as const,
                })),
                total: order.total_cents / 100,
              })),
            });
          }
        }
      } catch {
        // Silently fail - user will see first-order CTA
      } finally {
        setIsLoadingOrders(false);
      }
    }
    
    fetchOrders();
  }, [isAuthenticated, ordersContext]);

  const ordersCount = Number(ordersContext?.orders_count ?? 0);
  const lastOrder = ordersContext?.last_3_orders?.[0] ?? null;
  const hasOrders = ordersCount > 0 && lastOrder !== null;

  // Calculate last order total
  const lastOrderTotal = lastOrder?.total ?? 0;

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleRepeatOrder = () => {
    if (!lastOrder?.items) return;
    
    // Convert last order items to cart items (matching OrderItem interface)
    lastOrder.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
      });
    });
    
    toast.success("Added to cart", {
      description: "Your last order is ready to checkout",
    });
    // Navigate to order page so user can review and checkout
    router.push("/order");
  };

  return (
    <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-4xl">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-elevated p-6 md:p-10 mb-6">
        {/* Background glow effects - subtle */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center border border-primary/20">
              <span className="text-2xl font-black text-primary neon-text-readable">
                42
              </span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Pizza <span className="text-primary neon-text-readable">42</span>
              </h1>
              <p className="text-sm text-muted-foreground">Neon fast delivery</p>
            </div>
          </div>

          <p className="text-lg md:text-xl text-foreground/90 font-medium mb-6 max-w-sm leading-relaxed">
            Fresh pizza, crafted fast. Order in seconds.
          </p>

          {/* Auth State Area */}
          {!isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle h-12 px-6 font-semibold text-base active-scale"
                >
                  <a href={getLoginUrl("/")}>Log in</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground h-12 px-6 font-semibold text-base bg-transparent active-scale"
                >
                  <a href={getSignupUrl("/")}>Create account</a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Save orders and reorder in one tap
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/30">
                <span className="text-sm font-medium text-foreground">
                  {user?.email}
                </span>
                {user?.email_verified ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-semibold">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-semibold">
                    <span>Unverified</span>
                  </div>
                )}
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <a href={getLogoutUrl("/")}>Log out</a>
              </Button>
            </div>
          )}

          {/* Debug info */}
          <div className="mt-6 pt-4 border-t border-border/20">
            <p className="text-xs text-muted-foreground/60 font-mono space-y-0.5">
              <span className="block">auth: {isAuthenticated ? "yes" : "no"}</span>
              <span className="block">orders_count: {ordersCount}</span>
              <span className="block">lastOrder: {lastOrder ? "yes" : "no"}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Personalization Card - High conversion "Repeat Order" */}
      <section className="mb-6">
        {isAuthenticated && hasOrders && lastOrder?.items && lastOrder.items.length > 0 ? (
          <div className="glass-elevated rounded-2xl overflow-hidden">
            {/* Header with highlight */}
            <div className="px-5 py-4 border-b border-border/20 bg-accent/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-foreground">
                    Welcome back
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Reorder your last order in one tap
                  </p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your last order
                </p>
                {ordersContext?.last_order_at && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(ordersContext.last_order_at)}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 mb-4">
                {lastOrder.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total line */}
              <div className="flex items-center justify-between py-3 border-t border-border/20">
                <span className="text-sm font-semibold text-foreground">
                  Total
                </span>
                <span className="text-lg font-bold text-primary neon-text-readable">
                  ${lastOrderTotal.toFixed(2)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={handleRepeatOrder}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle flex-1 h-12 font-semibold text-base active-scale"
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  Reorder last order
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border/40 text-foreground hover:bg-secondary/50 sm:flex-none h-12 px-5 font-medium text-sm bg-transparent active-scale"
                >
                  <Link href="/profile">
                    View order history
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : isAuthenticated ? (
          <div className="glass-elevated rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground mb-1">
                  Ready for your first order?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Build your perfect pizza in under 30 seconds. We{"'"}ll
                  remember your favorites.
                </p>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle h-11 px-5 font-semibold active-scale"
                >
                  <Link href="/order">
                    Browse menu
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-elevated rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground mb-1">
                  Start your pizza journey
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Explore our curated menu and discover something delicious.
                </p>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle h-11 px-5 font-semibold active-scale"
                >
                  <Link href="/order">
                    Browse menu
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Featured Items Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Featured
          </h2>
          <Link
            href="/order"
            className="text-primary text-sm font-semibold hover:underline flex items-center gap-0.5 active-scale"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {featuredItems.map((item) => (
            <div key={item.id} className="snap-start">
              <MenuItemCard item={item} variant="featured" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
