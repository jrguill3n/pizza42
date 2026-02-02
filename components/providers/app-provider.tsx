"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { OrderItem } from "@/lib/mock-data";

interface User {
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface OrdersContext {
  orders_count: number;
  last_order_at: string | null;
  last_order?: {
    id: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      category: "pizza" | "sides" | "drinks";
    }>;
    total: number;
  } | null;
}

interface Session {
  isAuthenticated: boolean;
  user: User | null;
  claims?: OrdersContext;
}

interface CartContextType {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setCartItems: (items: OrderItem[]) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

interface AuthContextType {
  session: Session;
  login: () => void;
  logout: () => void;
  refreshSession: () => void;
}

const CartContext = createContext<CartContextType | null>(null);
const AuthContext = createContext<AuthContextType | null>(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within AppProvider");
  return context;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AppProvider");
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Cart state
  const [items, setItems] = useState<OrderItem[]>([]);

  // Auth state - fetch real session from API
  const [session, setSession] = useState<Session>({ isAuthenticated: false, user: null });

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        setSession({
          isAuthenticated: data.authenticated || false,
          user: data.user || null,
          claims: data.claims || undefined,
        });
      } else {
        setSession({ isAuthenticated: false, user: null });
      }
    } catch {
      setSession({ isAuthenticated: false, user: null });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const addItem = useCallback((item: OrderItem) => {
    setItems((prev) => {
      const itemSku = item.sku || item.id;
      const existing = prev.find((i) => (i.sku || i.id) === itemSku);
      if (existing) {
        return prev.map((i) => 
          (i.sku || i.id) === itemSku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => (i.sku || i.id) !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => (i.sku || i.id) !== itemId));
    } else {
      setItems((prev) => prev.map((i) => 
        (i.sku || i.id) === itemId ? { ...i, quantity } : i
      ));
    }
  }, []);

  const setCartItems = useCallback((newItems: OrderItem[]) => {
    setItems(newItems);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Calculate totals using cents (canonical format)
  const subtotal_cents = items.reduce((sum, item) => {
    const priceInCents = item.price_cents ?? 0;
    return sum + (priceInCents * item.quantity);
  }, 0);
  const subtotal = subtotal_cents / 100;
  const total = subtotal; // Could add tax/delivery here
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const login = useCallback(() => {
    window.location.href = "/auth/login";
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/auth/logout";
  }, []);

  const refreshSession = useCallback(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <AuthContext.Provider value={{ session, login, logout, refreshSession }}>
      <CartContext.Provider
        value={{
          items,
          addItem,
          removeItem,
          updateQuantity,
          setCartItems,
          clearCart,
          subtotal,
          total,
          itemCount,
        }}
      >
        {children}
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
