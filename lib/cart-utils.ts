import type { OrderItem } from "./mock-data";

/**
 * Normalize order items from API/order history into cart-compatible format
 * Handles various input shapes and ensures canonical cart fields are present
 */
export function normalizeOrderItemToCartItem(item: {
  id?: string;
  sku?: string;
  name: string;
  qty?: number;
  quantity?: number;
  price?: number;
  price_cents?: number;
  category?: "pizza" | "sides" | "drinks";
}): OrderItem | null {
  // Determine SKU - prefer sku field, fallback to id
  const sku = item.sku || item.id;
  
  if (!sku) {
    console.warn("[v0] Skipping item without sku or id:", item);
    return null;
  }

  // Determine quantity - prefer quantity, fallback to qty, default to 1
  const quantity = Number(item.quantity ?? item.qty ?? 1);
  
  if (quantity <= 0) {
    console.warn("[v0] Skipping item with invalid quantity:", item);
    return null;
  }

  // Determine price_cents - prefer price_cents, fallback to converting price from dollars
  let priceCents: number;
  
  if (item.price_cents !== undefined && item.price_cents !== null) {
    priceCents = Number(item.price_cents);
  } else if (item.price !== undefined && item.price !== null) {
    // Convert dollars to cents, rounding to avoid floating point issues
    priceCents = Math.round(Number(item.price) * 100);
  } else {
    console.warn("[v0] Skipping item without price or price_cents:", item);
    return null;
  }

  // Validate price_cents is a valid number
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    console.warn("[v0] Skipping item with invalid price:", item);
    return null;
  }

  // Return normalized cart item with canonical structure
  return {
    sku,              // Canonical identifier
    name: item.name,
    price_cents: priceCents,
    quantity,
    // Optional legacy fields for compatibility
    id: sku,          // Mirror sku to id for backward compatibility
    price: priceCents / 100,  // Computed from price_cents
    category: item.category,
  };
}

/**
 * Normalize an array of order items, filtering out invalid items
 */
export function normalizeOrderItems(
  items: Array<{
    id?: string;
    sku?: string;
    name: string;
    qty?: number;
    quantity?: number;
    price?: number;
    price_cents?: number;
    category?: "pizza" | "sides" | "drinks";
  }>
): OrderItem[] {
  return items
    .map(normalizeOrderItemToCartItem)
    .filter((item): item is OrderItem => item !== null);
}
