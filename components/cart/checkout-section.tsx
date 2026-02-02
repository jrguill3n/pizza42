"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Mail, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, useAuth } from "@/components/providers/app-provider";
import { placeOrder } from "@/lib/api-client";
import { toast } from "sonner";

interface CheckoutSectionProps {
  onClose?: () => void;
}

export function CheckoutSection({ onClose }: CheckoutSectionProps) {
  const { items, clearCart } = useCart();
  const { session, login } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);

  const isAuthenticated = session.isAuthenticated;
  const isVerified = session.user?.email_verified ?? false;
  const canCheckout = isAuthenticated && items.length > 0;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || items.length === 0) return;

    setIsPlacing(true);
    try {
      const result = await placeOrder(items);
      
      if (!result.success) {
        // Handle email_not_verified error from server
        if (result.code === "email_not_verified") {
          toast.error("Email verification required", {
            description: "Please verify your email before placing orders",
          });
          return;
        }
        
        toast.error("Something went wrong", {
          description: result.error,
        });
        return;
      }
      
      clearCart();
      toast.success("Order placed!", {
        description: `Order #${result.order.id.slice(-6)} is being prepared`,
      });
      
      // Dispatch event to refresh order history
      window.dispatchEvent(new CustomEvent("order-placed"));
      
      onClose?.();
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  // Show verification banner if authenticated but not verified
  if (isAuthenticated && !isVerified) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-0.5">
                Verify your email
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Check your inbox to verify your email and unlock checkout.
              </p>
            </div>
          </div>
        </div>

        <Button
          disabled
          className="w-full h-12 bg-muted text-muted-foreground cursor-not-allowed font-semibold"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Verification required
        </Button>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Button
          onClick={login}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold text-base transition-neon active-scale"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Log in to checkout
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Create an account or log in to place your order
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      disabled={!canCheckout || isPlacing}
      className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold text-base transition-neon active-scale disabled:opacity-50 disabled:cursor-not-allowed disabled:neon-glow-none"
    >
      {isPlacing ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Placing order...
        </>
      ) : (
        "Place order"
      )}
    </Button>
  );
}
