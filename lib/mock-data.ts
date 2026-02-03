// Mock Data and Placeholder Functions for Pizza 42
// These can be replaced later with real Auth0 and API calls

export interface User {
  email: string;
  email_verified: boolean;
  connection: string;
  orders_context: {
    orders_count: number;
    last_order_at: string | null;
    last_order_items: OrderItem[] | null;
  };
}

export interface Session {
  isAuthenticated: boolean;
  user: User | null;
}

export interface OrderItem {
  sku: string;
  name: string;
  price_cents: number; // Price in cents (canonical for cart)
  quantity: number;
  // Legacy fields for compatibility
  id?: string;
  price?: number;
  category?: 'pizza' | 'sides' | 'drinks';
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  created_at: string;
}

export interface MenuItem {
  id: string;
  sku: string; // SKU for image mapping (p1, s2, d4, etc.)
  name: string;
  description: string;
  price: number;
  category: 'pizza' | 'sides' | 'drinks';
  image?: string;
}

// Token Claims namespace
export const CLAIMS_NAMESPACE = 'https://pizza42.example/orders_context';

// Mock session states for testing
export const mockUsers: Record<string, User> = {
  verified: {
    email: 'alex@example.com',
    email_verified: true,
    connection: 'google-oauth2',
    orders_context: {
      orders_count: 5,
      last_order_at: '2026-01-28T18:30:00Z',
      last_order_items: [
        { id: 'p1', name: 'Pepperoni Suprema', price: 18.99, quantity: 1, category: 'pizza' },
        { id: 's1', name: 'Pan de Ajo', price: 5.99, quantity: 2, category: 'sides' },
      ],
    },
  },
  unverified: {
    email: 'new.user@example.com',
    email_verified: false,
    connection: 'Username-Password-Authentication',
    orders_context: {
      orders_count: 0,
      last_order_at: null,
      last_order_items: null,
    },
  },
  newVerified: {
    email: 'verified.new@example.com',
    email_verified: true,
    connection: 'google-oauth2',
    orders_context: {
      orders_count: 0,
      last_order_at: null,
      last_order_items: null,
    },
  },
};

// Get mock session - can be toggled for testing
export function getSessionMock(userType: 'logged-out' | 'verified' | 'unverified' | 'newVerified' = 'verified'): Session {
  if (userType === 'logged-out') {
    return { isAuthenticated: false, user: null };
  }
  return { isAuthenticated: true, user: mockUsers[userType] };
}

// Get token claims mock
export function getTokenClaimsMock(user: User | null): Record<string, unknown> {
  if (!user) return {};
  
  return {
    sub: 'auth0|123456789',
    email: user.email,
    email_verified: user.email_verified,
    [CLAIMS_NAMESPACE]: user.orders_context,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'pizza42-api',
    iss: 'https://pizza42.auth0.com/',
  };
}

// Mock menu items
export const mockMenuItems: MenuItem[] = [
  // Pizzas
  { id: 'p1', sku: 'p1', name: 'Pepperoni Suprema', description: 'Pepperoni clásico con queso extra y especias secretas', price: 18.99, category: 'pizza' },
  { id: 'p2', sku: 'p2', name: 'Margarita Neon', description: 'Mozzarella fresca, tomates y albahaca en nuestra masa signature', price: 16.99, category: 'pizza' },
  { id: 'p3', sku: 'p3', name: 'Pollo BBQ 42', description: 'Pollo a la parrilla, salsa BBQ, cebollas rojas y cilantro', price: 19.99, category: 'pizza' },
  { id: 'p4', sku: 'p4', name: 'Veggie Matrix', description: 'Pimientos, champiñones, aceitunas, cebollas y tomates', price: 17.99, category: 'pizza' },
  { id: 'p5', sku: 'p5', name: 'La Carnívora', description: 'Cargada de pepperoni, salchicha, tocino y jamón', price: 21.99, category: 'pizza' },
  { id: 'p6', sku: 'p6', name: 'Hawaiian Glitch', description: 'Jamón, piña y tocino con salsa de chile dulce', price: 18.99, category: 'pizza' },
  
  // Sides
  { id: 's1', sku: 's1', name: 'Pan de Ajo', description: 'Pan crujiente con mantequilla de ajo y hierbas', price: 5.99, category: 'sides' },
  { id: 's2', sku: 's2', name: 'Bocados de Queso', description: 'Bolitas de masa rellenas de mozzarella', price: 7.99, category: 'sides' },
  { id: 's3', sku: 's3', name: 'Alitas', description: 'Alitas crujientes con la salsa de tu elección', price: 12.99, category: 'sides' },
  { id: 's4', sku: 's4', name: 'Ensalada César', description: 'Lechuga romana fresca, parmesano, crutones y aderezo César', price: 8.99, category: 'sides' },
  
  // Drinks
  { id: 'd1', sku: 'd1', name: 'Neon Cola', description: 'Nuestra cola signature con infusión de cítricos', price: 2.99, category: 'drinks' },
  { id: 'd2', sku: 'd2', name: 'Agua Mineral', description: 'Agua mineral con gas refrescante', price: 1.99, category: 'drinks' },
  { id: 'd3', sku: 'd3', name: 'Limonada', description: 'Limonada recién exprimida con toque de menta', price: 3.49, category: 'drinks' },
  { id: 'd4', sku: 'd4', name: 'Té Helado', description: 'Té negro preparado en frío con limón', price: 2.49, category: 'drinks' },
];

// Mock orders for order history
export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    items: [
      { id: 'p1', name: 'Pepperoni Suprema', price: 18.99, quantity: 1, category: 'pizza' },
      { id: 's1', name: 'Pan de Ajo', price: 5.99, quantity: 2, category: 'sides' },
    ],
    total: 30.97,
    status: 'delivered',
    created_at: '2026-01-28T18:30:00Z',
  },
  {
    id: 'ord-002',
    items: [
      { id: 'p3', name: 'Pollo BBQ 42', price: 19.99, quantity: 2, category: 'pizza' },
      { id: 'd1', name: 'Neon Cola', price: 2.99, quantity: 3, category: 'drinks' },
    ],
    total: 48.95,
    status: 'delivered',
    created_at: '2026-01-20T12:15:00Z',
  },
  {
    id: 'ord-003',
    items: [
      { id: 'p2', name: 'Margarita Neon', price: 16.99, quantity: 1, category: 'pizza' },
    ],
    total: 16.99,
    status: 'delivered',
    created_at: '2026-01-10T19:45:00Z',
  },
];

// Fetch orders mock - simulates API call with delay
export async function fetchOrdersMock(userId?: string): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate empty state for new users
  if (!userId) return [];
  
  return mockOrders;
}

// Place order mock - simulates order placement
export async function placeOrderMock(items: OrderItem[]): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    items,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  
  return newOrder;
}

// Apply last order to cart mock
export function applyLastOrderToCartMock(lastOrderItems: OrderItem[] | null): OrderItem[] {
  if (!lastOrderItems) return [];
  return lastOrderItems.map(item => ({ ...item }));
}

// Featured items for home page
export const featuredItems: MenuItem[] = [
  mockMenuItems[0], // Pepperoni Suprema
  mockMenuItems[2], // Pollo BBQ 42
  mockMenuItems[4], // La Carnívora
  mockMenuItems[7], // Bocados de Queso
];

// Segmentation logic mock
export function getSegmentationMock(ordersCount: number, lastOrderAt: string | null): { segment: string; reasoning: string } {
  if (ordersCount === 0) {
    return {
      segment: 'New User',
      reasoning: 'No previous orders. Show onboarding content and first-order promotions.',
    };
  }
  
  if (ordersCount >= 10) {
    return {
      segment: 'VIP Customer',
      reasoning: `${ordersCount} orders placed. Eligible for loyalty rewards and exclusive offers.`,
    };
  }
  
  if (lastOrderAt) {
    const daysSinceLastOrder = Math.floor((Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastOrder > 30) {
      return {
        segment: 'Win-back',
        reasoning: `Last order was ${daysSinceLastOrder} days ago. Show re-engagement offers.`,
      };
    }
    
    if (daysSinceLastOrder <= 7) {
      return {
        segment: 'Active Customer',
        reasoning: `Recent order ${daysSinceLastOrder} days ago. Show quick reorder options.`,
      };
    }
  }
  
  return {
    segment: 'Regular Customer',
    reasoning: `${ordersCount} orders total. Standard experience with personalized recommendations.`,
  };
}
