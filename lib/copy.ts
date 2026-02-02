/**
 * Simple copy/translation dictionary for Pizza 42
 * Default locale: Spanish (es)
 */

export const copy = {
  en: {
    // Navigation
    nav_home: "Home",
    nav_menu: "Menu",
    nav_profile: "Profile",
    nav_login: "Log in",
    nav_logout: "Log out",
    
    // Home
    home_hero_title: "Authentic Pizza, Delivered Hot",
    home_hero_subtitle: "Handcrafted pizzas made with the finest ingredients. Order now and taste the difference.",
    home_hero_cta: "Order Now",
    home_welcome_back: "Welcome back",
    home_reorder_title: "Your last order",
    home_reorder_cta: "Reorder last order",
    home_first_order_title: "Ready for your first order?",
    home_first_order_subtitle: "Start by browsing our delicious menu.",
    home_first_order_cta: "Browse Menu",
    home_guest_title: "Order your pizza in minutes",
    home_guest_subtitle: "Browse the menu without signing in. Sign in when you're ready to order.",
    home_guest_cta_primary: "View Menu",
    home_guest_cta_secondary: "Sign In",
    home_guest_cta_signup: "Create account",
    home_date_today: "Today",
    home_date_yesterday: "Yesterday",
    home_recommended_title: "Recommended for you",
    home_recommended_subtitle: "Based on your recent orders",
    
    // Menu
    menu_add_to_cart: "Add to Cart",
    
    // Cart
    cart_title: "Your Cart",
    cart_empty: "Your cart is empty",
    cart_empty_subtitle: "Add some delicious items to get started!",
    cart_item_remove: "Remove",
    cart_subtotal: "Subtotal",
    cart_place_order: "Place Order",
    cart_auth_required_title: "Sign in required",
    cart_auth_required_message: "Please sign in to place your order",
    cart_auth_required_cta: "Sign In",
    cart_verify_required_title: "Email verification required",
    cart_verify_required_message: "Please verify your email address to place orders",
    cart_verify_required_note: "Check your inbox for the verification email",
    cart_verify_required_cta: "I've Verified My Email",
    cart_order_placed: "Order placed successfully!",
    cart_order_error: "Failed to place order. Please try again.",
    cart_continue_browsing: "Continue browsing",
    
    // Profile
    profile_title: "Profile",
    profile_account: "Account",
    profile_email_verified: "Verified",
    profile_email_unverified: "Not verified",
    profile_orders_title: "Order History",
    profile_orders_empty: "No orders yet",
    profile_orders_empty_subtitle: "Your order history will appear here",
    profile_order_total: "Total",
    profile_order_items: "items",
  },
  es: {
    // Navegación
    nav_home: "Inicio",
    nav_menu: "Menú",
    nav_profile: "Perfil",
    nav_login: "Iniciar sesión",
    nav_logout: "Cerrar sesión",
    
    // Inicio
    home_hero_title: "Pizza Auténtica, Entregada Caliente",
    home_hero_subtitle: "Pizzas artesanales hechas con los mejores ingredientes. Ordena ahora y prueba la diferencia.",
    home_hero_cta: "Ordenar Ahora",
    home_welcome_back: "Bienvenido de vuelta",
    home_reorder_title: "Tu último pedido",
    home_reorder_cta: "Reordenar último pedido",
    home_first_order_title: "¿Listo para tu primer pedido?",
    home_first_order_subtitle: "Comienza explorando nuestro delicioso menú.",
    home_first_order_cta: "Ver Menú",
    home_guest_title: "Ordena tu pizza en minutos",
    home_guest_subtitle: "Explora el menú sin iniciar sesión. Inicia sesión cuando estés listo para ordenar.",
    home_guest_cta_primary: "Ver menú",
    home_guest_cta_secondary: "Iniciar sesión",
    home_guest_cta_signup: "Crear cuenta",
    home_date_today: "Hoy",
    home_date_yesterday: "Ayer",
    home_recommended_title: "Recomendado para ti",
    home_recommended_subtitle: "Basado en tus pedidos recientes",
    
    // Menú
    menu_add_to_cart: "Agregar",
    
    // Carrito
    cart_title: "Tu Carrito",
    cart_empty: "Tu carrito está vacío",
    cart_empty_subtitle: "¡Agrega algunos artículos deliciosos para comenzar!",
    cart_item_remove: "Eliminar",
    cart_subtotal: "Subtotal",
    cart_place_order: "Realizar Pedido",
    cart_auth_required_title: "Inicio de sesión requerido",
    cart_auth_required_message: "Por favor inicia sesión para realizar tu pedido",
    cart_auth_required_cta: "Iniciar Sesión",
    cart_verify_required_title: "Verificación de email requerida",
    cart_verify_required_message: "Por favor verifica tu dirección de email para realizar pedidos",
    cart_verify_required_note: "Revisa tu bandeja de entrada para el email de verificación",
    cart_verify_required_cta: "Ya Verifiqué Mi Email",
    cart_order_placed: "¡Pedido realizado con éxito!",
    cart_order_error: "Error al realizar el pedido. Por favor intenta de nuevo.",
    cart_continue_browsing: "Seguir navegando",
    
    // Perfil
    profile_title: "Perfil",
    profile_account: "Cuenta",
    profile_email_verified: "Verificado",
    profile_email_unverified: "No verificado",
    profile_orders_title: "Historial de Pedidos",
    profile_orders_empty: "Aún no hay pedidos",
    profile_orders_empty_subtitle: "Tu historial de pedidos aparecerá aquí",
    profile_order_total: "Total",
    profile_order_items: "artículos",
    
    // Segmentación
    segment_new_customer: "Nuevo Cliente",
    segment_new_benefit: "10% de descuento en tu primer pedido",
    segment_new_cta: "Obtener 10% de Descuento",
    segment_returning: "Cliente Frecuente",
    segment_returning_benefit: "Bebida gratis con tu próximo pedido",
    segment_returning_cta: "Canjear Recompensa",
    segment_power: "Power Customer (VIP)",
    segment_power_benefit: "Entrega gratis + acceso anticipado a nuevos artículos del menú",
    segment_power_cta: "Desbloquear Oferta VIP",
    segment_tooltip_title: "¿Por qué veo esto?",
    segment_tooltip_text: "Basado en tu historial de pedidos.",
  },
};

// Menu item name translations (keyed by SKU)
export const MENU_NAME_ES: Record<string, string> = {
  // Pizzas
  p1: "Pepperoni Suprema",
  p2: "Margherita Neón",
  p3: "Pollo BBQ Cyber",
  p4: "Veggie Matrix",
  p5: "Cárnica Suprema",
  p6: "Hawaiana Glitch",
  
  // Sides
  s1: "Pan de Ajo",
  s2: "Bocaditos de Queso",
  s3: "Alitas x8",
  s4: "Ensalada César",
  
  // Drinks
  d1: "Cola Neón",
  d2: "Agua Mineral",
  d3: "Limonada",
  d4: "Té Helado",
};

// Default locale
const DEFAULT_LOCALE = "es";

// Simple translation helper
export function t(key: keyof typeof copy.en): string {
  return copy[DEFAULT_LOCALE][key] || copy.en[key] || key;
}
