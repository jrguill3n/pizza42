"use client";

/**
 * Client-side API utilities for making authenticated requests
 */

interface TokenResponse {
  accessToken: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "pizza" | "sides" | "drinks";
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  created_at: string;
}

interface OrdersResponse {
  orders: Order[];
  orders_count: number;
}

interface CreateOrderResponse {
  order: Order;
  orders_count: number;
}

interface ApiError {
  error: string;
  code?: string;
}

/**
 * Get access token for API calls
 * Returns null if not authenticated
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      credentials: "include",
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error("Failed to get access token");
    }
    
    const data: TokenResponse = await response.json();
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Place an order via the API
 */
export async function placeOrder(
  items: OrderItem[]
): Promise<{ success: true; order: Order } | { success: false; error: string; code?: string }> {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: "Not authenticated", code: "not_authenticated" };
    }
    
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ items }),
      credentials: "include",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const apiError = data as ApiError;
      return { 
        success: false, 
        error: apiError.error || "Failed to place order",
        code: apiError.code 
      };
    }
    
    const orderData = data as CreateOrderResponse;
    return { success: true, order: orderData.order };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}

/**
 * Get order history via the API
 */
export async function getOrders(): Promise<{ success: true; orders: Order[]; orders_count: number } | { success: false; error: string }> {
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: "Not authenticated" };
    }
    
    const response = await fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });
    
    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error || "Failed to fetch orders" };
    }
    
    const data: OrdersResponse = await response.json();
    return { success: true, orders: data.orders, orders_count: data.orders_count };
  } catch {
    return { success: false, error: "Network error. Please try again." };
  }
}
