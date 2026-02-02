"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Mail, LogIn, Lock } from "lucide-react";
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
import { placeOrder } from "@/lib/api-client";
import { toast } from "sonner";

interface CheckoutSectionProps {
  onClose?: () => void;
}

export function CheckoutSection({ onClose }: CheckoutSectionProps) {
  const { items, clearCart } = useCart();
  const { session, login } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const isVerified = session.user?.email_verified; // Declare isVerified variable
  const emailVerified = session.user?.email_verified; // Declare emailVerified variable

  const isAuthenticated = session.isAuthenticated;
  const canCheckout = isAuthenticated && items.length > 0;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || items.length === 0) return;

    // Only block if email_verified is explicitly false
    if (emailVerified === false) {
      setShowVerifyModal(true);
      return;
    }

    setIsPlacing(true);
    try {
      const result = await placeOrder(items);
      
      if (!result.success) {
        // Handle email_not_verified error from server
        if (result.code === "email_not_verified") {
          setShowVerifyModal(true);
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

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="space-y-3">
          <Button
            onClick={() => setShowLoginModal(true)}
            disabled={items.length === 0}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold text-base transition-neon active-scale disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 mr-2" />
            Log in to place order
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Browse the menu anytime. Log in to place orders.
          </p>
        </div>

        {/* Login Modal */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent className="glass border border-border/50">
            <DialogHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl">
                Log in to place your order
              </DialogTitle>
              <DialogDescription className="text-center">
                You can browse the menu anytime. To place orders and save order history, please log in.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={login}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log in
              </Button>
              <Button
                onClick={() => setShowLoginModal(false)}
                variant="outline"
                className="w-full h-11 bg-transparent border-border/50 hover:bg-secondary/30 font-medium"
              >
                Continue browsing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
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

      {/* Email Verification Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="glass border border-border/50">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <DialogTitle className="text-center text-xl">
              Verify your email
            </DialogTitle>
            <DialogDescription className="text-center">
              Please check your inbox and verify your email address before placing orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => setShowVerifyModal(false)}
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle font-semibold"
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
