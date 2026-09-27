# Paquete de Referencia Técnica: Módulo Inventario & ERP Comercial Qaway

> **Propósito:** Este archivo consolida la arquitectura exacta, componentes de layout, rutas, servicios de usuario y módulo Resumen/Dashboard del proyecto de Inventario para que una IA externa pueda auditar, extender o diseñar componentes atómicos compatibles sin romper el ecosistema existente.

---

## 1. Configuración de Entorno & Dependencias

### `package.json`
```json
{
  "name": "qawaylab-inventario",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 9600",
    "build": "tsc -b && vite build",
    "lint": "oxlint .",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "test:run": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.112.3",
    "@tailwindcss/vite": "^4.3.3",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "jspdf-autotable": "^5.0.8",
    "lucide-react": "^1.31.0",
    "motion": "^13.1.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "recharts": "^3.10.1",
    "tailwindcss": "^4.3.3",
    "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.13.3",
    "@types/react": "^19.2.17",
    "@vitejs/plugin-react": "^6.0.4",
    "typescript": "^7.0.2",
    "vite": "^8.2.0",
    "vitest": "^4.1.10"
  }
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    preserveSymlinks: true,
  },
  server: {
    port: 9600,
  },
})
```

---

## 2. Sistema de Rutas Central (`AppRouter.tsx`)

```typescript
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
import PackagesPage from '@/pages/packages/PackagesPage'
import LiquidationPage from '@/pages/liquidation/LiquidationPage'
import CatalogsPage from '@/pages/liquidation/CatalogsPage'
import CustomersPage from '@/pages/customers/CustomersPage'
import QuotationsPage from '@/pages/quotations/QuotationsPage'
import SalesPage from '@/pages/sales/SalesPage'
import NewSalePage from '@/pages/sales/NewSalePage'
import SaleDetailPage from '@/pages/sales/SaleDetailPage'
import WebOrdersPage from '@/pages/sales/WebOrdersPage'
import SuppliersPage from '@/pages/suppliers/SuppliersPage'
import PurchaseOrdersPage from '@/pages/purchases/PurchaseOrdersPage'
import NewPurchaseOrderPage from '@/pages/purchases/NewPurchaseOrderPage'
import PettyCashPage from '@/pages/finance/PettyCashPage'
import ExpensesPage from '@/pages/finance/ExpensesPage'
import AccountingPage from '@/pages/finance/AccountingPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import SettingsPage from '@/pages/SettingsPage'
import SharedLinksPage from '@/pages/config/SharedLinksPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          {/* Dashboard / Resumen */}
          <Route index element={<DashboardPage />} />

          {/* Logística */}
          <Route path="logistica" element={<ProductsPage />} />
          <Route path="logistica/:id" element={<ProductDetailPage />} />
          <Route path="logistica/categorias" element={<CategoriesPage />} />
          <Route path="logistica/ubicaciones" element={<LocationsPage />} />
          <Route path="logistica/movimientos" element={<MovementsPage />} />
          <Route path="inventario" element={<ProductsPage />} />

          <Route element={<RequirePermission permission="can_create_products" />}>
            <Route path="logistica/nuevo" element={<NewProductPage />} />
            <Route path="inventario/nuevo" element={<NewProductPage />} />
          </Route>

          {/* Comercial */}
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="precios" element={<PriceListsPage />} />
          <Route path="precios/listas" element={<PriceListsPage />} />
          <Route path="paquetes" element={<PackagesPage />} />
          <Route path="cotizaciones" element={<QuotationsPage />} />

          {/* Ventas */}
          <Route element={<RequirePermission permission="can_view_sales" />}>
            <Route path="ventas" element={<SalesPage />} />
            <Route path="ventas/pedidos-web" element={<WebOrdersPage />} />
            <Route path="ventas/:id" element={<SaleDetailPage />} />
          </Route>
          <Route element={<RequirePermission permission="can_create_sales" />}>
            <Route path="ventas/nueva" element={<NewSalePage />} />
          </Route>

          {/* Compras */}
          <Route path="compras" element={<PurchaseOrdersPage />} />
          <Route path="compras/nueva" element={<NewPurchaseOrderPage />} />
          <Route path="compras/proveedores" element={<SuppliersPage />} />
          <Route path="compras/ordenes" element={<PurchaseOrdersPage />} />

          {/* Promociones & Liquidaciones */}
          <Route path="promociones" element={<LiquidationPage />} />
          <Route path="promociones/catalogos" element={<CatalogsPage />} />

          {/* Finanzas & Contabilidad */}
          <Route element={<RequirePermission permission="can_access_fiscal_settings" />}>
            <Route path="caja" element={<PettyCashPage />} />
            <Route path="gastos" element={<ExpensesPage />} />
            <Route path="contabilidad" element={<AccountingPage />} />
          </Route>

          {/* Reportes & Configuración */}
          <Route path="reportes" element={<ReportsPage />} />
          <Route element={<RequirePermission permission="can_access_settings" />}>
            <Route path="config" element={<SettingsPage />} />
            <Route path="config/enlaces" element={<SharedLinksPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
```

---

## 3. Layout Principal (`AppLayout.tsx`) & Shell Nav

```typescript
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-dvh bg-surface overflow-hidden">
      <Sidebar collapsed={collapsed} />
      <div
        className="flex flex-col h-dvh min-h-0 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
```

### Encabezado (`Header.tsx` - Topbar y Dropdown Perfil)
```typescript
import { useState } from 'react'
import { Search, Bell, LogOut, User, Menu, Shield, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Super Administrador',
  editor: 'Administrador de empresa',
  viewer: 'Miembro del equipo',
  guest: 'Invitado',
}

export default function Header({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean
  onToggleSidebar: () => void
}) {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const email = session?.user?.email ?? ''
  const displayName = profile?.full_name || email.split('@')[0] || 'Usuario'
  const roleLabel = profile ? roleLabels[profile.role] || profile.role : ''
  const initials = (displayName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    try { await signOut() } catch {}
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-[72px] shrink-0 bg-ink border-b border-white/10 flex items-center justify-between px-5 lg:px-6 relative z-50">
      <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Menu size={20} className={collapsed ? '' : 'rotate-180'} />
        </button>

        <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 text-white text-sm font-bold cursor-default">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="max-w-40 truncate">Qaway Lab</span>
        </div>

        <div className="relative flex-1 max-w-md lg:max-w-[420px] min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand/50 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 ml-4">
        <button className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-ink" />
        </button>

        {/* Dropdown de perfil */}
        <div className="relative z-[100]">
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 pr-1 cursor-pointer rounded-full hover:bg-white/10 transition-colors border border-transparent"
          >
            <span className="relative inline-flex w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-xs lg:text-sm">
              {initials || <User size={16} className="text-brand" />}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-ink" />
            </span>
            <div className="hidden lg:flex flex-col justify-center">
              <span className="text-white text-[13px] font-bold leading-none">{displayName}</span>
              <span className="text-[10px] text-white/40 leading-none mt-1.5">{roleLabel || email}</span>
            </div>
            <ChevronDown size={16} className={`hidden lg:block text-white/40 transition-transform ${isProfileOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-ink-2 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-4">
                  <span className="inline-flex w-12 h-12 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-sm shrink-0">
                    {initials || '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/40 truncate mt-0.5">{email || 'Sesión activa'}</p>
                  </div>
                </div>
                <div className="p-2 border-t border-white/10 space-y-0.5">
                  <button onClick={() => { setIsProfileOpen(false); navigate('/config') }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                    <User size={15} className="text-white/50 shrink-0" /> Mi cuenta
                  </button>
                  <button onClick={() => window.alert('Seguridad en desarrollo.')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-lg font-semibold">
                    <Shield size={15} className="text-white/40 shrink-0" /> Seguridad
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 rounded-lg font-bold">
                    <LogOut size={15} className="mr-3" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
```

---

## 4. Módulo Resumen / Dashboard (`DashboardPage.tsx`)

```typescript
import {
  Package, TrendingUp, AlertTriangle, Users, FileText, Zap, Loader2,
  RefreshCw, LayoutDashboard, BarChart3, ShoppingCart, DollarSign
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { QuickAccessCards } from '@/components/dashboard/QuickAccessCards'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { TopProducts } from '@/components/dashboard/TopProducts'
import { SalesChartsSection } from '@/components/dashboard/SalesCharts'

export default function DashboardPage() {
  const {
    stats, recentActivity, topProducts, lowStockProducts,
    salesData, categoryData, trendData, loading, error, refresh,
  } = useDashboard()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency', currency: 'PEN', minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <p className="mt-6 text-sm font-medium text-muted">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 rounded-xl">
            <LayoutDashboard size={24} className="text-brand" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted mt-0.5">Resumen operativo y comercial</p>
          </div>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-surface-muted hover:border-brand/30 text-ink text-sm font-semibold transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* Grid de KPIs principales */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Productos" value={stats.totalProducts} icon={<Package size={20} />} trend="+5% este mes" />
          <StatCard title="Valor Inventario" value={formatCurrency(stats.totalValue)} icon={<DollarSign size={20} />} trend="Valorizado" />
          <StatCard title="Ventas del Mes" value={formatCurrency(stats.monthlySales)} icon={<TrendingUp size={20} />} trend="Comercial" />
          <StatCard title="Alertas de Stock" value={stats.lowStockCount} icon={<AlertTriangle size={20} />} alert={stats.lowStockCount > 0} />
        </div>
      )}

      {/* Acciones Rápidas & Gráficos */}
      <QuickAccessCards />
      <SalesChartsSection salesData={salesData} categoryData={categoryData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TopProducts products={topProducts} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Servicio de Usuario & Perfil (`userService.ts`)

```typescript
import { supabase } from '@/config/supabase'
import type { User, UserRole, UserPermissions } from '@/types/user'
import { rolePermissions, resolvePermissions } from '@/types/user'

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Super Administrador',
        avatar_url: profileData?.avatar_url || null,
        role: 'admin' as UserRole,
        permissions: rolePermissions['admin'],
        created_at: profileData?.created_at || new Date().toISOString(),
        last_active_at: profileData?.last_active_at || null,
      }
    }

    let effectiveRole = data.role as UserRole
    try {
      const { data: appRole } = await supabase.rpc('user_app_role', { p_app_slug: 'inventario' })
      const isPlatformAdmin = data.is_platform_admin === true
      if (appRole && !isPlatformAdmin && ['admin', 'editor', 'viewer', 'guest'].includes(appRole)) {
        effectiveRole = appRole as UserRole
      }
    } catch {}

    return {
      ...data,
      role: effectiveRole,
      permissions: resolvePermissions(effectiveRole, (data.permissions as Partial<UserPermissions>) || {}),
    }
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
}
```
