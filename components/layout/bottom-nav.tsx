"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/app-provider";
import { t } from "@/lib/copy";

const navItems = [
  { href: "/", label: "nav_home" as const, icon: Home },
  { href: "/order", label: "nav_menu" as const, icon: ShoppingBag },
  { href: "/profile", label: "nav_profile" as const, icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Gradient fade above nav for content bleed */}
      <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="glass-elevated border-t border-border/30">
        <div className="flex items-stretch justify-around pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const showBadge = item.href === "/order" && itemCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-6 py-3 min-h-[64px] relative",
                  "transition-neon active-scale",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {/* Active indicator - top pill */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary neon-glow-subtle" />
                )}

                <div className="relative">
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-neon",
                      isActive && "neon-text-readable"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {showBadge && (
                    <span
                      className={cn(
                        "absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full",
                        "bg-primary text-primary-foreground text-[11px] font-bold",
                        "flex items-center justify-center",
                        isActive && "neon-glow-subtle"
                      )}
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-wide uppercase",
                    isActive && "neon-text-readable"
                  )}
                >
                  {t(item.label)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
