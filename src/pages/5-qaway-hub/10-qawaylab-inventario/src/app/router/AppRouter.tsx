import { Routes, Route } from "react-router-dom"
import AppLayout from '@/app/layouts/AppLayout'
import RequireAuth from '@/app/router/RequireAuth'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/inventory/ProductsPage'
import ProductDetailPage from '@/pages/inventory/ProductDetailPage'
import CategoriesPage from '@/pages/inventory/CategoriesPage'
import LocationsPage from '@/pages/inventory/LocationsPage'
import MovementsPage from '@/pages/inventory/MovementsPage'
import PriceListsPage from '@/pages/pricing/PriceListsPage'
import PackagesPage from '@/pages/packages/PackagesPage'
import LiquidationPage from '@/pages/liquidation/LiquidationPage'
import CatalogsPage from '@/pages/liquidation/CatalogsPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import QuotationsPage from '@/pages/quotations/QuotationsPage'
import SalesPage from '@/pages/sales/SalesPage'
import NewSalePage from '@/pages/sales/NewSalePage'
import SaleDetailPage from '@/pages/sales/SaleDetailPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import PurchaseOrdersPage from '@/pages/purchases/PurchaseOrdersPage'
import NewPurchaseOrderPage from '@/pages/purchases/NewPurchaseOrderPage'
import PettyCashPage from '@/pages/finance/PettyCashPage'
import ExpensesPage from '@/pages/finance/ExpensesPage'
import AccountingPage from '@/pages/finance/AccountingPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import CapturePage from '@/pages/CapturePage'
import PublicCatalogPage from '@/pages/PublicCatalogPage'
import GuestAccessPage from '@/pages/GuestAccessPage'
import CartPage from '@/pages/CartPage'
import SharedLinksPage from '@/pages/config/SharedLinksPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas (sin layout admin) */}
      <Route path="login" element={<LoginPage />} />
      <Route path="remates/:slug" element={<PublicCatalogPage />} />
      <Route path="carrito" element={<CartPage />} />
      <Route path="acceso/:token" element={<GuestAccessPage />} />

      {/* Rutas protegidas (requieren sesión) */}
      <Route element={<RequireAuth />}>
        {/* Rutas admin (con layout) */}
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route index element={<DashboardPage />} />

          {/* Logística */}
          <Route path="logistica" element={<ProductsPage />} />
          <Route path="logistica/:id" element={<ProductDetailPage />} />
          <Route path="logistica/categorias" element={<CategoriesPage />} />
          <Route path="logistica/ubicaciones" element={<LocationsPage />} />
          <Route path="logistica/movimientos" element={<MovementsPage />} />

          {/* Comercial */}
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="precios" element={<PriceListsPage />} />
          <Route path="precios/listas" element={<PriceListsPage />} />
          <Route path="paquetes" element={<PackagesPage />} />
          <Route path="cotizaciones" element={<QuotationsPage />} />

          {/* Ventas */}
          <Route path="ventas" element={<SalesPage />} />
          <Route path="ventas/nueva" element={<NewSalePage />} />
          <Route path="ventas/:id" element={<SaleDetailPage />} />

          {/* Compras */}
          <Route path="compras" element={<PurchaseOrdersPage />} />
          <Route path="compras/nueva" element={<NewPurchaseOrderPage />} />
          <Route path="compras/proveedores" element={<SuppliersPage />} />
          <Route path="compras/ordenes" element={<PurchaseOrdersPage />} />

          {/* Promociones */}
          <Route path="promociones" element={<LiquidationPage />} />
          <Route path="promociones/catalogos" element={<CatalogsPage />} />

          {/* Finanzas */}
          <Route path="caja" element={<PettyCashPage />} />
          <Route path="gastos" element={<ExpensesPage />} />
          <Route path="contabilidad" element={<AccountingPage />} />

          {/* Reportes */}
          <Route path="reportes" element={<ReportsPage />} />

          {/* Config */}
          <Route path="config" element={<SettingsPage />} />
          <Route path="config/enlaces" element={<SharedLinksPage />} />
        </Route>

        {/* Captura IA (protegida, fuera del layout principal) */}
        <Route path="captura" element={<CapturePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
