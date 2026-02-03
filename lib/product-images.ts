/**
 * Product Image Mapping
 * Single source of truth for product SKU → image file mapping
 */

/**
 * Maps a product SKU to its corresponding image path in /public/images
 * @param sku - Product SKU (e.g., 'p1', 's2', 'd4')
 * @returns Image path like '/images/p1.jpg', '/images/s2.jpg', '/images/d4.jpg' or '/images/placeholder.jpg'
 */
export function getProductImageSrc(sku: string | undefined): string {
  if (!sku) {
    return "/images/placeholder.jpg";
  }

  // Normalize SKU to lowercase for consistent matching
  const normalizedSku = sku.toLowerCase().trim();

  // Map SKUs to image files in /images directory
  // Pizzas: p1.jpg through p6.jpg
  // Sides: s1.jpg through s4.jpg
  // Drinks: d1.jpg through d4.jpg
  const validSkus = [
    "p1",
    "p2",
    "p3",
    "p4",
    "p5",
    "p6",
    "s1",
    "s2",
    "s3",
    "s4",
    "d1",
    "d2",
    "d3",
    "d4",
  ];

  if (validSkus.includes(normalizedSku)) {
    return `/images/${normalizedSku}.jpg`;
  }

  // Fallback for unknown SKUs
  return "/images/placeholder.jpg";
}

/**
 * Get the category letter from a SKU
 * @param sku - Product SKU
 * @returns 'P' for pizza, 'S' for sides, 'D' for drinks, '?' for unknown
 */
export function getCategoryLetter(sku: string | undefined): string {
  if (!sku) return "?";

  const normalized = sku.toLowerCase().trim();
  const firstChar = normalized.charAt(0);

  switch (firstChar) {
    case "p":
      return "P";
    case "s":
      return "S";
    case "d":
      return "D";
    default:
      return "?";
  }
}
