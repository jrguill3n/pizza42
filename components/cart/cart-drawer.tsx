"use client";

import { useState, useCallback, useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2, ChevronUp, Lock, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart, useAuth } from "@/components/providers/app-provider";
import { CheckoutSection } from "./checkout-section";
import { toast } from "sonner";
import { t } from "@/lib/copy";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { items, updateQuantity, removeItem, subtotal, total, itemCount } = useCart();
  const { session, login } = useAuth();

  const handleRemove = useCallback((itemId: string, itemName: string) => {
    removeItem(itemId);
    toast.info(`${itemName} removed`);
  }, [removeItem]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCartClick = () => {
    if (!session.isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Floating cart button - positioned above bottom nav */}
      <button
        onClick={handleCartClick}
        aria-label={`Open cart with ${itemCount} items`}
        className={cn(
          "fixed bottom-24 right-4 z-40 md:hidden",
          "w-16 h-16 rounded-2xl bg-primary text-primary-foreground",
          "flex flex-col items-center justify-center gap-0.5",
          "shadow-lg neon-glow-cyan transition-neon active-scale",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          itemCount === 0 && "hidden"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-xs font-bold">${total.toFixed(0)}</span>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
          {itemCount}
        </span>
        {!session.isAuthenticated && (
          <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-background flex items-center justify-center">
            <Lock className="w-3 h-3 text-primary" />
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 md:hidden",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="glass-elevated rounded-t-3xl max-h-[90vh] flex flex-col">
          {/* Drag handle area */}
          <button
            onClick={handleClose}
            className="w-full flex flex-col items-center pt-3 pb-2 cursor-pointer"
            aria-label="Close cart"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/40 mb-1" />
            <ChevronUp className="w-4 h-4 text-muted-foreground/60" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">Your Cart</h2>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl hover:bg-secondary/50 transition-colors touch-target"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-5">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-semibold text-lg mb-1">Nothing here yet</p>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">
                  Tap the + button on any item to start building your order
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-border/20"
                  >
                    {/* Item visual */}
                    <div className="w-14 h-14 rounded-xl bg-secondary/40 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary/80">
                        {item.category === "pizza" ? "P" : item.category === "sides" ? "S" : "D"}
                      </span>
                    </div>

                    {/* Item details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-[15px] leading-tight truncate">
                        {item.name}
                      </h4>
                      <p className="text-primary font-bold text-sm mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
                      <Button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-foreground hover:bg-secondary/50 rounded-lg"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-7 text-center font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 text-foreground hover:bg-secondary/50 rounded-lg"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Remove button */}
                    <Button
                      onClick={() => handleRemove(item.id, item.name)}
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with totals and checkout */}
          {items.length > 0 && (
            <div className="border-t border-border/30 px-5 py-5 space-y-4 pb-safe">
              {/* Order summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="h-px bg-border/30 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="text-foreground font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary neon-text-readable">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <CheckoutSection onClose={handleClose} />
            </div>
          )}
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
    </>
  );
}
