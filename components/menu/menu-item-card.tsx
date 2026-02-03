"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/app-provider";
import type { MenuItem } from "@/lib/mock-data";
import { getProductImageSrc, getCategoryLetter } from "@/lib/product-images";
import { toast } from "sonner";
import { t, MENU_NAME_ES } from "@/lib/copy";

interface MenuItemCardProps {
  item: MenuItem;
  variant?: "default" | "compact" | "featured";
}

export function MenuItemCard({ item, variant = "default" }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => (i.sku || i.id) === item.id);
  const quantity = cartItem?.quantity ?? 0;
  const [imageError, setImageError] = useState(false);

  // Get Spanish display name, fallback to original
  const displayName = MENU_NAME_ES[item.id] ?? item.name;

  const imageSrc = getProductImageSrc(item.sku || item.id);
  const categoryLetter = getCategoryLetter(item.sku || item.id);

  const handleAdd = () => {
    addItem({
      sku: item.id, // Use sku as canonical field
      name: item.name, // Keep original name for API/backend
      price_cents: Math.round(item.price * 100),
      quantity: 1,
    });
    toast.success(`${displayName} agregado`, {
      description: `$${item.price.toFixed(2)} cada uno`,
    });
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
      toast.success(`${item.name} quantity decreased to ${quantity - 1}`);
    }
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
    toast.success(`${item.name} quantity increased to ${quantity + 1}`);
  };

  if (variant === "featured") {
    return (
      <div className="glass-elevated rounded-2xl p-4 min-w-[180px] w-[180px] flex flex-col transition-neon hover:neon-glow-subtle group">
        {/* Image */}
        <div className="w-full aspect-square rounded-xl bg-secondary/30 mb-3 flex items-center justify-center overflow-hidden relative">
          {!imageError ? (
            <>
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={displayName}
                width={400}
                height={400}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover rounded-xl"
                loading="lazy"
                priority={false}
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
          {displayName}
        </h3>
        <p className="text-primary font-bold text-lg mb-3">
          ${item.price.toFixed(2)}
        </p>

        <div className="mt-auto">
          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              size="sm"
              variant="ghost"
              className="w-full h-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-neon active-scale font-medium text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
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
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={displayName}
              width={400}
              height={400}
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover rounded-lg"
              loading="lazy"
              priority={false}
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-base font-bold text-primary/70">{categoryLetter}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{displayName}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 min-h-[2.5rem]">
            {item.description}
          </p>
          <p className="text-primary font-bold text-lg">
            ${item.price.toFixed(2)}
          </p>
        </div>
        {quantity === 0 ? (
          <Button
            onClick={handleAdd}
            size="sm"
            variant="ghost"
            className="ml-auto text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-neon h-8 px-3 font-medium active-scale"
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
                src={imageSrc || "/placeholder.svg"}
                alt={displayName}
                width={400}
                height={400}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover rounded-xl"
                loading="lazy"
                priority={false}
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
            variant="ghost"
            className="w-full md:w-auto md:ml-auto md:flex text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-neon h-9 px-4 font-medium text-sm active-scale"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("menu_add_to_cart")}
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
