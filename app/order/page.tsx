"use client";

import React from "react"

import { useState } from "react";
import { Pizza, Drumstick, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartPanel } from "@/components/cart/cart-panel";
import { mockMenuItems } from "@/lib/mock-data";

type Category = "pizza" | "sides" | "drinks";

const categories: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: "pizza", label: "Pizza", icon: Pizza },
  { id: "sides", label: "Sides", icon: Drumstick },
  { id: "drinks", label: "Drinks", icon: Coffee },
];

export default function OrderPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("pizza");

  const filteredItems = mockMenuItems.filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-6">
        {/* Page header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-1">
            Menu
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Fresh ingredients, made to order
          </p>
        </div>

        {/* Category tabs - improved touch targets */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap",
                  "transition-neon active-scale snap-start touch-target",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary text-primary-foreground neon-glow-subtle"
                    : "glass text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && "text-primary-foreground")} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Content area with menu and cart */}
        <div className="flex gap-6">
          {/* Menu items grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="glass-elevated rounded-2xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/30 flex items-center justify-center mx-auto mb-4">
                  <Pizza className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-semibold mb-1">Coming soon</p>
                <p className="text-muted-foreground text-sm">
                  We{"'"}re adding new items to this category
                </p>
              </div>
            )}
          </div>

          {/* Desktop cart panel */}
          <CartPanel />
        </div>
      </main>

      {/* Mobile cart drawer */}
      <CartDrawer />

      <BottomNav />
    </div>
  );
}
