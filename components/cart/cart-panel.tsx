"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/app-provider";
import { CheckoutSection } from "./checkout-section";
import { getProductImageSrc, getCategoryLetter } from "@/lib/product-images";
import { toast } from "sonner";

export function CartPanel() {
  const { items, updateQuantity, removeItem, subtotal, total, itemCount } = useCart();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleRemove = (itemId: string, itemName: string) => {
    removeItem(itemId);
    toast.info(`${itemName} removed`);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  return (
    <aside className="hidden md:flex flex-col w-[380px] glass-elevated rounded-2xl h-fit sticky top-24 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Tu Carrito</h2>
            <p className="text-sm text-muted-foreground">
              {itemCount === 0 ? "Vacío" : `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"}`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 max-h-[420px] scrollbar-hide">
        {items.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-18 h-18 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-5 w-[72px] h-[72px]">
              <ShoppingCart className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <p className="text-foreground font-semibold mb-1">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
              Agrega artículos del menú para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const itemId = item.sku || item.id;
              const itemPrice = ((item.price_cents ?? 0) * item.quantity) / 100;
              const imageSrc = getProductImageSrc(itemId);
              const categoryLetter = getCategoryLetter(itemId);
              const hasImageError = imageErrors[itemId];
              
              return (
                <div
                  key={itemId}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 border border-border/10 transition-colors hover:bg-secondary/30"
                >
                  {/* Item image */}
                  <div className="w-12 h-12 rounded-xl bg-secondary/40 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {!hasImageError ? (
                      <Image
                        src={imageSrc || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover rounded-xl"
                        onError={() => handleImageError(itemId)}
                      />
                    ) : (
                      <span className="text-base font-bold text-primary/70">
                        {categoryLetter}
                      </span>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                    <p className="text-primary font-bold text-sm mt-0.5">
                      ${itemPrice.toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 mt-2 bg-secondary/30 rounded-lg p-0.5 w-fit">
                      <Button
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-foreground hover:bg-secondary/50 rounded-md"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center font-bold text-foreground text-sm tabular-nums">
                        {item.quantity}
                      </span>
                    <Button
                      onClick={() => updateQuantity(itemId, item.quantity + 1)}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-foreground hover:bg-secondary/50 rounded-md"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Remove button */}
                <Button
                  onClick={() => handleRemove(itemId, item.name)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with totals and checkout */}
      {items.length > 0 && (
        <div className="border-t border-border/20 p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entrega</span>
              <span className="text-green-400 font-medium">Gratis</span>
            </div>
            <div className="h-px bg-border/20 my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-foreground font-semibold">Total</span>
              <span className="text-xl font-bold text-primary neon-text-readable tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <CheckoutSection />
        </div>
      )}
    </aside>
  );
}
