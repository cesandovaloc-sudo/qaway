import { Routes, Route, Navigate } from "react-router-dom"
import AppLayout from '@/app/layouts/AppLayout'
import RequireAuth from '@/app/router/RequireAuth'
import RequirePermission from '@/app/router/RequirePermission'
import RequirePlanFeature from '@/app/router/RequirePlanFeature'
import RequireModuleReleased from '@/app/router/RequireModuleReleased'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/inventory/ProductsPage'
import SedesPanelPage from '@/pages/inventory/SedesPanelPage'
import ProductDetailPage from '@/pages/inventory/ProductDetailPage'
import NewProductPage from '@/pages/inventory/NewProductPage'
import CategoriesPage from '@/pages/inventory/CategoriesPage'
import MovementsPage from '@/pages/inventory/MovementsPage'
import PriceListsPage from '@/pages/pricing/PriceListsPage'
import PreciosPanelPage from '@/pages/pricing/PreciosPanelPage'
import PackagesPage from '@/pages/packages/PackagesPage'
import KitsPage from '@/pages/kits/KitsPage'
import LiquidationPage from '@/pages/liquidation/LiquidationPage'
import LiquidacionesPanelPage from '@/pages/liquidation/LiquidacionesPanelPage'
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
          <Route index element={<RequireModuleReleased moduleKey="dashboard"><DashboardPage /></RequireModuleReleased>} />

          {/* Productos / Inventario — lectura: cualquier autenticado */}
          <Route path="productos" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="products"><ProductsPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="productos/:id" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="products"><ProductDetailPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="sedes" element={<RequirePlanFeature feature="inventory"><RequireModuleReleased moduleKey="sedes"><SedesPanelPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="logistica" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="products"><ProductsPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="logistica/:id" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="products"><ProductDetailPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="logistica/categorias" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="categories"><CategoriesPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="logistica/movimientos" element={<RequirePlanFeature feature="movements"><RequireModuleReleased moduleKey="movements"><MovementsPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="inventario" element={<RequirePlanFeature feature="inventory"><RequireModuleReleased moduleKey="products"><ProductsPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="inventario/:id" element={<RequirePlanFeature feature="inventory"><RequireModuleReleased moduleKey="products"><ProductDetailPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path=":id" element={<RequirePlanFeature feature="products"><RequireModuleReleased moduleKey="products"><ProductDetailPage /></RequireModuleReleased></RequirePlanFeature>} />

          {/* C-4: creación de productos exige el permiso del modelo de roles
              (guest/viewer niegan can_create_products en rolePermissions) */}
          <Route element={<RequirePermission permission="can_create_products" />}>
            <Route path="productos/nuevo" element={<RequireModuleReleased moduleKey="products"><NewProductPage /></RequireModuleReleased>} />
            <Route path="logistica/nuevo" element={<RequireModuleReleased moduleKey="products"><NewProductPage /></RequireModuleReleased>} />
            <Route path="inventario/nuevo" element={<RequireModuleReleased moduleKey="products"><NewProductPage /></RequireModuleReleased>} />
            <Route path="nuevo" element={<RequireModuleReleased moduleKey="products"><NewProductPage /></RequireModuleReleased>} />
          </Route>

          {/* Comercial */}
           <Route path="clientes" element={<RequirePlanFeature feature="customers"><RequireModuleReleased moduleKey="clientes"><CustomersPage /></RequireModuleReleased></RequirePlanFeature>} />
           <Route path="precios" element={<RequirePlanFeature feature="price_lists"><RequireModuleReleased moduleKey="precios"><PriceListsPage /></RequireModuleReleased></RequirePlanFeature>} />
           <Route path="precios/listas" element={<RequirePlanFeature feature="price_lists"><RequireModuleReleased moduleKey="precios"><PriceListsPage /></RequireModuleReleased></RequirePlanFeature>} />
          {/* Módulo de precios del panel de diseño (lista, cliente, canal,
              promociones, historial, configuración). Ruta propia: /precios y
              /precios/listas siguen siendo PriceListsPage. */}
          <Route path="precios-panel" element={<RequireModuleReleased moduleKey="precios_panel"><PreciosPanelPage /></RequireModuleReleased>} />
           <Route path="paquetes" element={<RequirePlanFeature feature="packages"><RequireModuleReleased moduleKey="paquetes"><PackagesPage /></RequireModuleReleased></RequirePlanFeature>} />
          {/* Módulo de kits y paquetes armables. Este módulo no existía: no
              había ruta, página ni entrada de menú. /paquetes sigue siendo
              PackagesPage, sin tocar. */}
          <Route path="kits" element={<RequireModuleReleased moduleKey="kits"><KitsPage /></RequireModuleReleased>} />
           <Route path="cotizaciones" element={<RequirePlanFeature feature="quotations"><RequireModuleReleased moduleKey="cotizaciones"><QuotationsPage /></RequireModuleReleased></RequirePlanFeature>} />

          {/* Ventas — lectura: exige can_view_sales (guest lo niega) */}
          <Route element={<RequirePermission permission="can_view_sales" />}>
            <Route path="ventas" element={<RequireModuleReleased moduleKey="ventas"><SalesPage /></RequireModuleReleased>} />
            {/* Registro administrativo de ventas. Distinto del POS de
                mostrador, que sigue en /ventas y /ventas/nueva. */}
            <Route path="ventas/registro" element={<RequireModuleReleased moduleKey="registro_ventas"><RegistroVentasPage /></RequireModuleReleased>} />
            <Route path="ventas/pedidos-web" element={<RequireModuleReleased moduleKey="pedidos_web"><WebOrdersPage /></RequireModuleReleased>} />
            {/* Gestión de pedidos por canal. Aparte de Pedidos Web, que sigue
                intacto; la fusión se evalúa más adelante. */}
            <Route path="pedidos" element={<RequireModuleReleased moduleKey="pedidos"><PedidosPage /></RequireModuleReleased>} />
            <Route path="ventas/:id" element={<RequireModuleReleased moduleKey="ventas"><SaleDetailPage /></RequireModuleReleased>} />
          </Route>

          {/* C-4: registrar ventas exige can_create_sales */}
           <Route element={<RequirePermission permission="can_create_sales" />}>
             <Route path="ventas/nueva" element={<RequireModuleReleased moduleKey="punto_de_venta"><NewSalePage /></RequireModuleReleased>} />
             {/* Nombre explícito del POS; se conserva /ventas/nueva como alias compatible. */}
             <Route path="punto-de-venta" element={<RequireModuleReleased moduleKey="punto_de_venta"><NewSalePage /></RequireModuleReleased>} />
           </Route>

          {/* Compras: lectura autenticada; la escritura la decide el RLS
              (purchase_orders recibe policies propias en el Bloque 2) */}
          <Route path="compras" element={<RequireModuleReleased moduleKey="compras"><PurchaseOrdersPage /></RequireModuleReleased>} />
          <Route path="compras/nueva" element={<RequireModuleReleased moduleKey="compras"><NewPurchaseOrderPage /></RequireModuleReleased>} />
          <Route path="compras/proveedores" element={<RequireModuleReleased moduleKey="proveedores"><SuppliersPage /></RequireModuleReleased>} />
          <Route path="compras/ordenes" element={<RequireModuleReleased moduleKey="ordenes_compra"><PurchaseOrdersPage /></RequireModuleReleased>} />
          {/* Módulo de compras del panel de diseño (órdenes, proveedores y
              recepciones). Ruta propia y sin relación con /compras, que hoy
              resuelve al alias del carrito declarado más arriba en L55. */}
          <Route path="compras-panel" element={<RequireModuleReleased moduleKey="compras_panel"><ComprasPanelPage /></RequireModuleReleased>} />

          {/* Promociones */}
           <Route path="promociones" element={<RequirePlanFeature feature="promotions"><RequireModuleReleased moduleKey="promociones"><LiquidationPage /></RequireModuleReleased></RequirePlanFeature>} />
          <Route path="promociones/catalogos" element={<RequireModuleReleased moduleKey="catalogos"><CatalogsPage /></RequireModuleReleased>} />
          {/* Liquidaciones a proveedores y clientes. Distinto de /promociones,
              que liquida stock para vender (LiquidationPage). */}
          <Route path="liquidaciones" element={<RequireModuleReleased moduleKey="liquidaciones"><LiquidacionesPanelPage /></RequireModuleReleased>} />

          {/* C-4: finanzas/contabilidad = sección fiscal (admin; el modelo de
              roles niega can_access_fiscal_settings a editor/viewer/guest) */}
          <Route element={<RequirePermission permission="can_access_fiscal_settings" />}>
            <Route path="caja" element={<RequireModuleReleased moduleKey="caja"><PettyCashPage /></RequireModuleReleased>} />
            <Route path="gastos" element={<RequireModuleReleased moduleKey="gastos"><ExpensesPage /></RequireModuleReleased>} />
            <Route path="contabilidad" element={<RequireModuleReleased moduleKey="contabilidad"><AccountingPage /></RequireModuleReleased>} />
          </Route>

          {/* Reportes */}
          <Route path="reportes" element={<RequireModuleReleased moduleKey="reportes"><ReportsPage /></RequireModuleReleased>} />

          {/* C-4: configuración y usuarios = exclusivos de admin, igual que el
              Hub (ADMIN_ONLY_NAV: "Usuarios y Configuración son EXCLUSIVAS de
              administrador, jamás otorgables") */}
          <Route element={<RequirePermission permission="can_access_settings" />}>
            <Route path="config" element={<RequireModuleReleased moduleKey="config"><SettingsPage /></RequireModuleReleased>} />
            <Route path="config/enlaces" element={<RequireModuleReleased moduleKey="config_enlaces"><SharedLinksPage /></RequireModuleReleased>} />
          </Route>
        </Route>

        {/* Captura IA (protegida, fuera del layout principal) */}
         <Route path="captura" element={<RequirePlanFeature feature="assisted_capture"><RequireModuleReleased moduleKey="captura"><CapturePage /></RequireModuleReleased></RequirePlanFeature>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
