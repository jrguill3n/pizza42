"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { OrderItem, Session, User } from "@/lib/mock-data";
import { getSessionMock } from "@/lib/mock-data";

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
  setUserType: (type: "logged-out" | "verified" | "unverified" | "newVerified") => void;
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

  // Auth state - defaults to verified for demo
  const [userType, setUserTypeState] = useState<"logged-out" | "verified" | "unverified" | "newVerified">("verified");
  const [session, setSession] = useState<Session>(() => getSessionMock(userType));

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

  const setUserType = useCallback((type: "logged-out" | "verified" | "unverified" | "newVerified") => {
    setUserTypeState(type);
    setSession(getSessionMock(type));
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, setUserType }}>
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
