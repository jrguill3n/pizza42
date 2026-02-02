"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { OrderItem } from "@/lib/mock-data";

interface User {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface Session {
  isAuthenticated: boolean;
  user: User | null;
}

interface CartContextType {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
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
        setSession(data);
      } else {
        setSession({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      console.error("[v0] Failed to fetch session:", error);
      setSession({ isAuthenticated: false, user: null });
    } finally {
      setIsSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const addItem = useCallback((item: OrderItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
