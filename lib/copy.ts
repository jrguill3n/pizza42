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
    home_guest_title: "Order delicious pizza in minutes",
    home_guest_subtitle: "Sign in to track your orders and save your favorites.",
    home_guest_cta: "Sign In",
    home_date_today: "Today",
    home_date_yesterday: "Yesterday",
    
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
    home_welcome_back: "Bienvenido de nuevo",
    home_reorder_title: "Tu último pedido",
    home_reorder_cta: "Repetir último pedido",
    home_first_order_title: "¿Listo para tu primer pedido?",
    home_first_order_subtitle: "Comienza explorando nuestro delicioso menú.",
    home_first_order_cta: "Ver Menú",
    home_guest_title: "Ordena pizza deliciosa en minutos",
    home_guest_subtitle: "Inicia sesión para rastrear tus pedidos y guardar tus favoritos.",
    home_guest_cta: "Iniciar Sesión",
    home_date_today: "Hoy",
    home_date_yesterday: "Ayer",
    
    // Menú
    menu_add_to_cart: "Agregar al Carrito",
    
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
  },
};

// Default locale
const DEFAULT_LOCALE = "es";

// Simple translation helper
export function t(key: keyof typeof copy.en): string {
  return copy[DEFAULT_LOCALE][key] || copy.en[key] || key;
}
