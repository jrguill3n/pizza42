"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/app-provider";
import type { MenuItem } from "@/lib/mock-data";
import { toast } from "sonner";
import { t } from "@/lib/copy";

// Helper to generate Unsplash image URLs
function getMenuItemImage(name: string) {
  const q = name.toLowerCase().replace(/[^a-z0-9]+/g, ",");
  return `https://source.unsplash.com/600x400/?${q},food`;
}

interface MenuItemCardProps {
  item: MenuItem;
  variant?: "default" | "compact" | "featured";
}

export function MenuItemCard({ item, variant = "default" }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity ?? 0;
  const [imageError, setImageError] = useState(false);

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      category: item.category,
    });
    toast.success(`${item.name} added`, {
      description: `$${item.price.toFixed(2)} each`,
    });
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      toast.info(`${item.name} removed`);
    }
    updateQuantity(item.id, quantity - 1);
  };

  // Category icon letter
  const categoryLetter = item.category === "pizza" ? "P" : item.category === "sides" ? "S" : "D";

  if (variant === "featured") {
    return (
      <div className="glass-elevated rounded-2xl p-4 min-w-[180px] w-[180px] flex flex-col transition-neon hover:neon-glow-subtle group">
        {/* Image */}
        <div className="w-full aspect-square rounded-xl bg-secondary/30 mb-3 flex items-center justify-center overflow-hidden relative">
          {!imageError ? (
            <>
              <Image
                src={getMenuItemImage(item.name) || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-xl font-bold text-primary/70">
                  {categoryLetter}
                </span>
              </div>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>
        <p className="text-primary font-bold text-lg mb-3">
          ${item.price.toFixed(2)}
        </p>

        <div className="mt-auto">
          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              size="sm"
              className="w-full h-10 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-neon active-scale font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t("menu_add_to_cart")}
            </Button>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-secondary/30 rounded-xl p-1">
              <Button
                onClick={handleDecrement}
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-foreground hover:bg-secondary/50 rounded-lg active-scale"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-foreground tabular-nums">{quantity}</span>
              <Button
                onClick={handleIncrement}
                size="icon"
                className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active-scale"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3 p-3 glass-elevated rounded-xl transition-neon hover:bg-secondary/30">
        <div className="w-12 h-12 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0 overflow-hidden relative">
          {!imageError ? (
            <>
              <Image
                src={getMenuItemImage(item.name) || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <span className="text-base font-bold text-primary/70">{categoryLetter}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm truncate">{item.name}</h3>
          <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
        </div>
        {quantity === 0 ? (
          <Button
            onClick={handleAdd}
            size="icon"
            className="h-10 w-10 bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground active-scale"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          <div className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
            <Button
              onClick={handleDecrement}
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-foreground hover:bg-secondary/50 rounded-lg active-scale"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-6 text-center font-bold text-foreground text-sm tabular-nums">{quantity}</span>
            <Button
              onClick={handleIncrement}
              size="icon"
              className="h-8 w-8 bg-primary text-primary-foreground rounded-lg active-scale"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Default variant - improved layout and touch targets
  return (
    <div className="glass-elevated rounded-2xl p-4 transition-neon hover:neon-glow-subtle group">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0 overflow-hidden relative">
          {!imageError ? (
            <>
              <Image
                src={getMenuItemImage(item.name) || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 flex items-center justify-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-lg md:text-xl font-bold text-primary/70">
                  {categoryLetter}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{item.name}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2 flex-1">{item.description}</p>
          <p className="text-primary font-bold text-lg">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add/Quantity controls - full width on mobile for better touch */}
      <div className="mt-4">
        {quantity === 0 ? (
          <Button
            onClick={handleAdd}
            className="w-full md:w-auto md:ml-auto md:flex bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground transition-neon h-11 px-5 font-semibold active-scale"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to cart
          </Button>
        ) : (
          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="flex items-center gap-1 bg-secondary/30 rounded-xl p-1">
              <Button
                onClick={handleDecrement}
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-foreground hover:bg-secondary/50 rounded-lg active-scale"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-bold text-foreground tabular-nums">{quantity}</span>
              <Button
                onClick={handleIncrement}
                size="icon"
                className="h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active-scale"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-400" />
              <span>In cart</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
