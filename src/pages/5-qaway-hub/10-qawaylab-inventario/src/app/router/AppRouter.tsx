import { Routes, Route, Navigate } from "react-router-dom"
import AppLayout from '@/app/layouts/AppLayout'
import RequireAuth from '@/app/router/RequireAuth'
import RequirePermission from '@/app/router/RequirePermission'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/inventory/ProductsPage'
import ProductDetailPage from '@/pages/inventory/ProductDetailPage'
import NewProductPage from '@/pages/inventory/NewProductPage'
import CategoriesPage from '@/pages/inventory/CategoriesPage'
import LocationsPage from '@/pages/inventory/LocationsPage'
import MovementsPage from '@/pages/inventory/MovementsPage'
import PriceListsPage from '@/pages/pricing/PriceListsPage'
import PreciosPanelPage from '@/pages/pricing/PreciosPanelPage'
import PackagesPage from '@/pages/packages/PackagesPage'
import KitsPage from '@/pages/kits/KitsPage'
import LiquidationPage from '@/pages/liquidation/LiquidationPage'
import CatalogsPage from '@/pages/liquidation/CatalogsPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import QuotationsPage from '@/pages/quotations/QuotationsPage'
import SalesPage from '@/pages/sales/SalesPage'
import RegistroVentasPage from '@/pages/sales/RegistroVentasPage'
import PedidosPage from '@/pages/orders/PedidosPage'
import NewSalePage from '@/pages/sales/NewSalePage'
import SaleDetailPage from '@/pages/sales/SaleDetailPage'
import WebOrdersPage from '@/pages/sales/WebOrdersPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import PurchaseOrdersPage from '@/pages/purchases/PurchaseOrdersPage'
import NewPurchaseOrderPage from '@/pages/purchases/NewPurchaseOrderPage'
import ComprasPanelPage from '@/pages/purchases/ComprasPanelPage'
import PettyCashPage from '@/pages/finance/PettyCashPage'
import ExpensesPage from '@/pages/finance/ExpensesPage'
import AccountingPage from '@/pages/finance/AccountingPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import CapturePage from '@/pages/CapturePage'
import PublicCatalogPage from '@/pages/PublicCatalogPage'
import GuestAccessPage from '@/pages/GuestAccessPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import PurchasesPage from '@/pages/PurchasesPage'
import SharedLinksPage from '@/pages/config/SharedLinksPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas (sin layout admin) */}
      <Route path="login" element={<LoginPage />} />
      <Route path="remates/:slug" element={<PublicCatalogPage />} />
      {/* Tienda de cliente: carrito → checkout → compras (piel del storefront) */}
      <Route path="carrito" element={<CartPage />} />
      <Route path="carrito/checkout" element={<CheckoutPage />} />
      <Route path="carrito/compras" element={<PurchasesPage />} />
      {/* Alias del flujo original, para no romper enlaces ya emitidos */}
      <Route path="checkout" element={<Navigate to="/carrito/checkout" replace />} />
      <Route path="compras" element={<Navigate to="/carrito/compras" replace />} />
      <Route path="acceso/:token" element={<GuestAccessPage />} />

      {/* Rutas protegidas (requieren sesión) */}
      <Route element={<RequireAuth />}>
        {/* Rutas admin (con layout) */}
        <Route element={<AppLayout />}>
          {/* Dashboard: cualquier autenticado (el detalle de datos lo decide el RLS) */}
          <Route index element={<DashboardPage />} />

          {/* Logística / Inventario — lectura: cualquier autenticado */}
          <Route path="logistica" element={<ProductsPage />} />
          <Route path="logistica/:id" element={<ProductDetailPage />} />
          <Route path="logistica/categorias" element={<CategoriesPage />} />
          <Route path="logistica/ubicaciones" element={<LocationsPage />} />
          <Route path="logistica/movimientos" element={<MovementsPage />} />
          <Route path="inventario" element={<ProductsPage />} />
          <Route path="inventario/:id" element={<ProductDetailPage />} />
          <Route path=":id" element={<ProductDetailPage />} />

          {/* C-4: creación de productos exige el permiso del modelo de roles
              (guest/viewer niegan can_create_products en rolePermissions) */}
          <Route element={<RequirePermission permission="can_create_products" />}>
            <Route path="logistica/nuevo" element={<NewProductPage />} />
            <Route path="inventario/nuevo" element={<NewProductPage />} />
            <Route path="nuevo" element={<NewProductPage />} />
          </Route>

          {/* Comercial */}
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="precios" element={<PriceListsPage />} />
          <Route path="precios/listas" element={<PriceListsPage />} />
          {/* Módulo de precios del panel de diseño (lista, cliente, canal,
              promociones, historial, configuración). Ruta propia: /precios y
              /precios/listas siguen siendo PriceListsPage. */}
          <Route path="precios-panel" element={<PreciosPanelPage />} />
          <Route path="paquetes" element={<PackagesPage />} />
          {/* Módulo de kits y paquetes armables. Este módulo no existía: no
              había ruta, página ni entrada de menú. /paquetes sigue siendo
              PackagesPage, sin tocar. */}
          <Route path="kits" element={<KitsPage />} />
          <Route path="cotizaciones" element={<QuotationsPage />} />

          {/* Ventas — lectura: exige can_view_sales (guest lo niega) */}
          <Route element={<RequirePermission permission="can_view_sales" />}>
            <Route path="ventas" element={<SalesPage />} />
            {/* Registro administrativo de ventas. Distinto del POS de
                mostrador, que sigue en /ventas y /ventas/nueva. */}
            <Route path="ventas/registro" element={<RegistroVentasPage />} />
            <Route path="ventas/pedidos-web" element={<WebOrdersPage />} />
            {/* Gestión de pedidos por canal. Aparte de Pedidos Web, que sigue
                intacto; la fusión se evalúa más adelante. */}
            <Route path="pedidos" element={<PedidosPage />} />
            <Route path="ventas/:id" element={<SaleDetailPage />} />
          </Route>

          {/* C-4: registrar ventas exige can_create_sales */}
          <Route element={<RequirePermission permission="can_create_sales" />}>
            <Route path="ventas/nueva" element={<NewSalePage />} />
          </Route>

          {/* Compras: lectura autenticada; la escritura la decide el RLS
              (purchase_orders recibe policies propias en el Bloque 2) */}
          <Route path="compras" element={<PurchaseOrdersPage />} />
          <Route path="compras/nueva" element={<NewPurchaseOrderPage />} />
          <Route path="compras/proveedores" element={<SuppliersPage />} />
          <Route path="compras/ordenes" element={<PurchaseOrdersPage />} />
          {/* Módulo de compras del panel de diseño (órdenes, proveedores y
              recepciones). Ruta propia y sin relación con /compras, que hoy
              resuelve al alias del carrito declarado más arriba en L55. */}
          <Route path="compras-panel" element={<ComprasPanelPage />} />

          {/* Promociones */}
          <Route path="promociones" element={<LiquidationPage />} />
          <Route path="promociones/catalogos" element={<CatalogsPage />} />

          {/* C-4: finanzas/contabilidad = sección fiscal (admin; el modelo de
              roles niega can_access_fiscal_settings a editor/viewer/guest) */}
          <Route element={<RequirePermission permission="can_access_fiscal_settings" />}>
            <Route path="caja" element={<PettyCashPage />} />
            <Route path="gastos" element={<ExpensesPage />} />
            <Route path="contabilidad" element={<AccountingPage />} />
          </Route>

          {/* Reportes */}
          <Route path="reportes" element={<ReportsPage />} />

          {/* C-4: configuración y usuarios = exclusivos de admin, igual que el
              Hub (ADMIN_ONLY_NAV: "Usuarios y Configuración son EXCLUSIVAS de
              administrador, jamás otorgables") */}
          <Route element={<RequirePermission permission="can_access_settings" />}>
            <Route path="config" element={<SettingsPage />} />
            <Route path="config/enlaces" element={<SharedLinksPage />} />
          </Route>
        </Route>

        {/* Captura IA (protegida, fuera del layout principal) */}
        <Route path="captura" element={<CapturePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
