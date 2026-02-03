"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingCart, User, Lock, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart, useAuth } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/copy";

const navLinks = [
  { href: "/", label: "nav_home" as const },
  { href: "/order", label: "nav_menu" as const },
  { href: "/profile", label: "nav_profile" as const },
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, total } = useCart();
  const { session, login, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full">
      <div className="glass-elevated border-b border-border/20">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Group: Logo + Navigation */}
          <div className="flex items-center gap-6">
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
                  {t(link.label)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Group: Cart + Auth */}
          <div className="flex items-center gap-3">
            {/* Cart indicator */}
            {session.isAuthenticated ? (
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
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
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
                <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-background flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-primary" />
                </span>
              </button>
            )}

            {/* Auth - only show when authenticated */}
            {session.isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-neon"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[100px]">
                    {(() => {
                      const user = session.user;
                      if (!user) return "Cuenta";
                      
                      // Priority: given_name > name (first part) > email > "Cuenta"
                      if (user.given_name) return user.given_name;
                      if (user.name) {
                        // If name contains spaces, use only the first part
                        return user.name.split(" ")[0];
                      }
                      if (user.email) return user.email;
                      return "Cuenta";
                    })()}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground font-medium"
                >
                  {t("nav_logout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="glass border border-border/50">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t("cart_auth_required_title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("cart_auth_required_message")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={login}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t("nav_login")}
            </Button>
            <Button
              onClick={() => setShowLoginModal(false)}
              variant="outline"
              className="w-full h-11 bg-transparent border-border/50 hover:bg-secondary/30 font-medium"
            >
              {t("cart_continue_browsing")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
