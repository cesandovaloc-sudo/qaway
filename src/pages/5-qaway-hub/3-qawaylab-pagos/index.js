import { createProductsService as _createProductsService } from './lib/services/products.js'
import { createOrdersService as _createOrdersService } from './lib/services/orders.js'
import { createPaymentsService as _createPaymentsService } from './lib/services/payments.js'

import Checkout_ from './components/Checkout.jsx'
import PurchaseHistory_ from './components/PurchaseHistory.jsx'
import PaymentsPanel_ from './admin/PaymentsPanel.jsx'
import ProductsManager_ from './admin/ProductsManager.jsx'

import ProductCard_ from './components/storefront/ProductCard.jsx'
import ProductGrid_ from './components/storefront/ProductGrid.jsx'
import ProductDetail_ from './components/storefront/ProductDetail.jsx'
import CartItems_ from './components/storefront/CartItems.jsx'
import OrderSummary_ from './components/storefront/OrderSummary.jsx'
import CartView_ from './components/storefront/CartView.jsx'

export const createProductsService = _createProductsService
export const createOrdersService = _createOrdersService
export const createPaymentsService = _createPaymentsService

export const Checkout = Checkout_
export const PurchaseHistory = PurchaseHistory_
export const PaymentsPanel = PaymentsPanel_
export const ProductsManager = ProductsManager_

// Storefront: piezas de la tienda (catálogo, ficha, carrito) — la piel vive
// en styles/storefront.css (scoped bajo .qawa-storefront)
export const ProductCard = ProductCard_
export const ProductGrid = ProductGrid_
export const ProductDetail = ProductDetail_
export const CartItems = CartItems_
export const OrderSummary = OrderSummary_
export const CartView = CartView_

export function createQawaServices(supabase, options = {}) {
  return {
    products: createProductsService(supabase),
    orders: createOrdersService(supabase),
    payments: createPaymentsService(supabase, options),
  }
}
