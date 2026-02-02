"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Sparkles, ShoppingBag, Repeat, CheckCircle, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { useCart } from "@/components/providers/app-provider";
import { mockMenuItems, type OrderItem } from "@/lib/mock-data";
import { toast } from "sonner";
import type { Auth0User, OrdersContext } from "@/lib/auth0";
import { getLoginUrl, getSignupUrl, getLogoutUrl } from "@/lib/auth0";
import { t } from "@/lib/copy";

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
  const { addItem, setCartItems } = useCart(); // Import setCartItems from useCart
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
                  price_cents: item.price_cents,
                  quantity: item.qty,
                  category: "pizza" as const,
                })),
                total: order.total_cents / 100,
                total_cents: order.total_cents,
                created_at: order.created_at,
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
  // Prefer total_cents if available, otherwise use total, or compute from items
  const lastOrderTotal = lastOrder
    ? lastOrder.total_cents
      ? lastOrder.total_cents / 100
      : lastOrder.total || 
        lastOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : 0;

  // Compute personalized recommendations based on order history
  const recommendedItems = useMemo(() => {
    if (!isAuthenticated || !ordersContext?.last_3_orders || ordersContext.last_3_orders.length === 0) {
      return [];
    }

    // Extract unique SKUs from last 3 orders
    const orderedSkus = new Set<string>();
    ordersContext.last_3_orders.forEach(order => {
      order.items.forEach(item => {
        orderedSkus.add(item.id);
      });
    });

    // Find matching menu items (up to 4)
    const matches = mockMenuItems.filter(menuItem => orderedSkus.has(menuItem.id));
    return matches.slice(0, 4);
  }, [isAuthenticated, ordersContext]);

  // Format friendly date helper
  function formatFriendlyDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();

    const isSameDay = d.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay) return t("home_date_today");
    if (d.toDateString() === yesterday.toDateString()) return t("home_date_yesterday");

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== d.getFullYear() ? "numeric" : undefined,
    });
  }

  const handleRepeatOrder = () => {
    if (!lastOrder?.items) return;
    
    // Normalize last order items to canonical cart format
    const normalized = lastOrder.items
      .map((item) => {
        // Skip items missing required fields
        if (!item.id || !item.price_cents) {
          return null;
        }
        
        return {
          sku: item.id, // Map id to sku
          name: item.name,
          quantity: Number(item.quantity ?? 1),
          price_cents: Number(item.price_cents ?? 0),
        };
      })
      .filter((item): item is OrderItem => item !== null);
    
    // Replace cart contents entirely (reorder = repeat order)
    setCartItems(normalized);
    
    toast.success("Pedido agregado al carrito", {
      description: "Tu último pedido está listo para ordenar",
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
              <p className="text-sm text-muted-foreground">Entrega Express</p>
            </div>
          </div>

          {/* Hero text changes based on auth state */}
          {!isAuthenticated ? (
            <>
              <h2 className="text-lg md:text-xl text-foreground font-semibold mb-2 leading-relaxed">
                {t("home_guest_title")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-md leading-relaxed">
                {t("home_guest_subtitle")}
              </p>
            </>
          ) : (
            <p className="text-lg md:text-xl text-foreground/90 font-medium mb-6 max-w-sm leading-relaxed">
              Pizza fresca, preparada al momento. Ordena en segundos.
            </p>
          )}

          {/* Auth State Area */}
          {!isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle h-12 px-6 font-semibold text-base active-scale"
                >
                  <Link href="/order">{t("home_guest_cta_primary")}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground h-12 px-6 font-semibold text-base bg-transparent active-scale"
                >
                  <a href={getLoginUrl("/")}>{t("home_guest_cta_secondary")}</a>
                </Button>
              </div>
              <div className="text-center sm:text-left">
                <a
                  href={getSignupUrl("/")}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                >
                  {t("home_guest_cta_signup")}
                </a>
              </div>
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
                    <span>{t("profile_email_verified")}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-semibold">
                    <span>{t("profile_email_unverified")}</span>
                  </div>
                )}
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <a href={getLogoutUrl("/")}>{t("nav_logout")}</a>
              </Button>
            </div>
          )}
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
                    {t("home_welcome_back")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("home_first_order_subtitle")}
                  </p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("home_reorder_title")}
                </p>
                {lastOrder?.created_at && (
                  <p className="text-xs text-muted-foreground">
                    {formatFriendlyDate(lastOrder.created_at)}
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {lastOrder.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center gap-2.5 py-1"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total line */}
              <div className="flex items-center justify-between py-3 border-t border-border/20">
                <span className="text-sm font-semibold text-foreground">
                  {t("profile_order_total")}
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
                  {t("home_reorder_cta")}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-border/40 text-foreground hover:bg-secondary/50 sm:flex-none h-12 px-5 font-medium text-sm bg-transparent active-scale"
                >
                  <Link href="/profile">
                    {t("profile_orders_title")}
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
                  {t("home_first_order_title")}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t("home_first_order_subtitle")}
                </p>
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle h-11 px-5 font-semibold active-scale"
                >
                  <Link href="/order">
                    {t("home_first_order_cta")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Personalized Recommendations - Only for authenticated users with order history */}
      {recommendedItems.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {t("home_recommended_title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("home_recommended_subtitle")}
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
            {recommendedItems.map((item) => (
              <div key={item.id} className="snap-start">
                <MenuItemCard item={item} variant="featured" />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
