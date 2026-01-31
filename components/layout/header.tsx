"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, useAuth } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/order", label: "Menu" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, total } = useCart();
  const { session, login, logout } = useAuth();

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full">
      <div className="glass-elevated border-b border-border/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20 transition-neon group-hover:bg-primary/20">
              <span className="text-lg font-black text-primary neon-text-readable">42</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Pizza <span className="text-primary neon-text-readable">42</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-neon",
                  pathname === link.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart indicator */}
            <Link
              href="/order"
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-xl transition-neon",
                itemCount > 0 ? "bg-primary/15 hover:bg-primary/20" : "hover:bg-secondary/40"
              )}
            >
              <ShoppingCart className={cn("w-5 h-5", itemCount > 0 ? "text-primary" : "text-foreground")} />
              {itemCount > 0 && (
                <>
                  <span className="text-sm font-bold text-primary tabular-nums">${total.toFixed(0)}</span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                </>
              )}
            </Link>

            {/* Auth */}
            {session.isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-neon"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                    {session.user?.email?.split("@")[0]}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  className="text-foreground font-semibold"
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={login}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
