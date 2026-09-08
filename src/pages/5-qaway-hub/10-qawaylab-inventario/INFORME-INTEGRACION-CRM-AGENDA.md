# 📋 INFORME DE INTEGRACIÓN: CRM y Agenda como Módulos

**Fecha:** 15 de agosto, 2026
**Proyecto base:** 10-qawaylab-inventario (commit `743ec0f`)
**Apps a integrar:** 7-qawaylab-crm, 8-qawaylab-agenda

---

## 🎯 RESUMEN EJECUTIVO

| App | Estado de Integración | Esfuerzo estimado | Prioridad |
|---|---|---|---|
| **CRM** | 🟡 Parcialmente compatible | 2-3 semanas | Alta |
| **Agenda** | 🟡 Parcialmente compatible | 2-3 semanas | Media |

**Conclusión:** Ambas apps están **listas para integrarse** pero requieren **adaptaciones moderadas** en: (1) conexión a la BD del inventario, (2) integración del router, y (3) unificación del tema visual. **No requieren reescritura**, solo refactorización de adapters y layout.

---

## 📊 ANÁLISIS: APP CRM (7-qawaylab-crm)

### 1. Arquitectura Actual

```
src/crm/
├── CRMPage.tsx              ← Layout principal con sidebar propio
├── types.ts                 ← Tipos: Lead, Campaign, CrmRole, etc.
├── adapters/
│   └── crmAdapter.ts        ← Conexión a Supabase (leads, campaigns)
├── context/
│   └── CRMContext.tsx        ← Estado global: leads, campaigns, roles
└── components/
    ├── DashboardView.tsx     ← KPIs, gráficos Recharts
    ├── KanbanView.tsx        ← Pipeline de ventas (drag & drop)
    ├── LeadsView.tsx         ← Lista de leads
    ├── ClientesView.tsx      ← Gestión de clientes
    ├── CampaignsView.tsx     ← Campañas de marketing
    ├── WhatsAppInboxView.tsx ← Chat/WhatsApp inbox
    ├── AutomatizacionesView.tsx ← Flujos automáticos
    ├── TareasView.tsx        ← Gestión de tareas
    ├── ConfiguracionView.tsx ← Config del CRM
    └── MetricBuilderModal.tsx ← Modal de métricas custom
```

### 2. Schema de BD (CRM)

```sql
-- Tablas CRM (independientes del inventario)
campaigns (id, name, platform, status, spend, revenue, leadsCount, impressions, clicks)
leads (id, name, whatsapp, email, campaign_id, campaign_name, status, priority, 
       budget, agent, last_message, history, metadata, unread_count)
```

### 3. Dependencias

```json
{
  "@supabase/supabase-js": "^2.110.0",  // ✅ Compatible
  "framer-motion": "^12.43.0",          // ⚠️ No está en inventario
  "lucide-react": "^1.28.0",            // ✅ Compatible
  "react": "^19.2.7",                   // ✅ Compatible
  "react-router-dom": "^7.18.1",        // ✅ Compatible
  "recharts": "^3.10.1"                 // ✅ Compatible
}
```

### 4. ✅ Lo que ESTÁ listo para integrar

| Componente | Estado | Notas |
|---|---|---|
| **crmAdapter.ts** | ✅ Listo | Patrón adapter, swapeable |
| **CRMContext.tsx** | ✅ Listo | Provider con estado global |
| **DashboardView** | ✅ Listo | KPIs y gráficos Recharts |
| **KanbanView** | ✅ Listo | Pipeline de ventas |
| **LeadsView** | ✅ Listo | Lista de leads |
| **ClientesView** | ✅ Listo | Gestión de clientes |
| **CampaignsView** | ✅ Listo | Campañas de marketing |
| **WhatsAppInboxView** | ✅ Listo | Chat/WhatsApp |
| **AutomatizacionesView** | ✅ Listo | Flujos automáticos |
| **TareasView** | ✅ Listo | Gestión de tareas |
| **ConfiguracionView** | ✅ Listo | Config del CRM |
| **Schema SQL** | ✅ Listo | 2 tablas, RLS, Realtime |
| **Realtime** | ✅ Listo | Suscripción a leads en vivo |

### 5. ⚠️ Lo que requiere MODIFICACIÓN

| Elemento | Problema | Solución |
|---|---|---|
| **CRMPage.tsx** | Tiene su propio layout con sidebar | Eliminar layout, usar AppLayout del inventario |
| **crmera.ts** | Conecta a BD separada | Cambiar para conectar a BD del inventario |
| **framer-motion** | No está en inventario | Instalar: `npm i framer-motion` |
| **Sidebar CRM** | Sidebar propio con tabs | Mover a sidebar del inventario |
| **Header CRM** | Header propio con búsqueda | Integrar en header del inventario |
| **Roles (CrmRole)** | Sistema de roles propio | Compatibilizar con sistema de permisos del inventario |
| **Theme** | Colores propios (#ff4b0b) | Adaptar al theme del inventario |

### 6. 🔗 Tablas que FALTAN en el inventario

```sql
-- Para integrar CRM, agregar estas tablas:
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  campaign_id TEXT,
  campaign_name TEXT,
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  budget NUMERIC DEFAULT 0,
  agent TEXT,
  last_message TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  unread_count INTEGER DEFAULT 0,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT DEFAULT 'Meta Ads',
  status TEXT DEFAULT 'Activa',
  spend NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. 📋 Pasos de Integración CRM

1. **Instalar dependencia:** `npm i framer-motion`
2. **Crear migración SQL:** Agregar tablas `leads` y `campaigns`
3. **Mover componentes:** Copiar `src/crm/` a `src/modules/crm/`
4. **Modificar crmera.ts:** Conectar a BD del inventario
5. **Modificar CRMPage.tsx:** Eliminar layout propio, usar rutas del inventario
6. **Agregar rutas en AppRouter:** `/crm`, `/crm/leads`, `/crm/pipeline`, etc.
7. **Agregar al Sidebar:** Sección "CRM" con submenús
8. **Adaptar theme:** Cambiar colores #ff4b0b → brand color
9. **Integrar con clientes:** Leads pueden vincularse a `customers` existentes
10. **Testing:** Verificar Realtime, Kanban, Roles

---

## 📊 ANÁLISIS: APP AGENDA (8-qawaylab-agenda)

### 1. Arquitectura Actual

```
src/agenda/
├── types.ts                 ← Tipos: Business, EventType, Booking, etc.
├── adapters/
│   └── agendaAdapter.ts     ← Conexión a Supabase (businesses, bookings, etc.)
├── context/
│   └── AgendaContext.tsx     ← Estado global: business, eventTypes, bookings
├── pages/
│   ├── HomePage.tsx         ← Landing page
│   ├── AdminPanelPage.tsx   ← Panel de administración
│   ├── PublicBookingPage.tsx ← Reserva pública (clientes)
│   └── ManageBookingPage.tsx ← Gestión de reserva (cancelar/reprogramar)
└── components/              ← (vacío, todo está en pages)
```

### 2. Schema de BD (Agenda)

```sql
-- Tablas Agenda (independientes del inventario)
businesses (id, owner_id, name, slug, timezone, whatsapp_number, branding)
event_types (id, business_id, title, slug, description, duration_minutes, buffer_minutes, price, currency, color, is_active)
schedules (id, business_id, day_of_week, start_time, end_time)
availability_exceptions (id, business_id, exception_date, is_available, start_time, end_time)
bookings (id, business_id, event_type_id, customer_name, customer_email, customer_phone, 
          start_at, end_at, status, payment_status, payment_intent_id, cancel_token)
reminders (id, booking_id, channel, kind, send_at, status, error_message)
```

### 3. Dependencias

```json
{
  "@supabase/supabase-js": "^2.110.0",  // ✅ Compatible
  "framer-motion": "^12.43.0",          // ⚠️ No está en inventario
  "lucide-react": "^1.28.0",            // ✅ Compatible
  "react": "^19.2.7",                   // ✅ Compatible
  "react-router-dom": "^7.18.1",        // ✅ Compatible
  "recharts": "^3.10.1"                 // ✅ Compatible
}
```

### 4. ✅ Lo que ESTÁ listo para integrar

| Componente | Estado | Notas |
|---|---|---|
| **agendaAdapter.ts** | ✅ Listo | Patrón adapter, swapeable |
| **AgendaContext.tsx** | ✅ Listo | Provider con estado global |
| **AdminPanelPage** | ✅ Listo | CRUD de eventos, horarios, excepciones |
| **PublicBookingPage** | ✅ Listo | Reserva pública para clientes |
| **ManageBookingPage** | ✅ Listo | Cancelar/reprogramar con token |
| **HomePage** | ⚠️ Opcional | Landing page (puede no ser necesaria) |
| **Schema SQL** | ✅ Listo | 6 tablas, RLS, Realtime, RPC |
| **Función RPC** | ✅ Listo | `secure_manage_booking` para gestión segura |
| **Vista booked_slots** | ✅ Listo | Slots ocupados sin PII |
| **Exclusion constraint** | ✅ Listo | Evita doble booking |

### 5. ⚠️ Lo que requiere MODIFICACIÓN

| Elemento | Problema | Solución |
|---|---|---|
| **AgendaProvider** | Usa `supabase.auth` directamente | Compatibilizar con auth del inventario |
| **businesses table** | Multi-tenant (owner_id) | Adaptar a modelo de 1 negocio por cliente |
| **bookings table** | USA `event_type_id` | Vincular a productos/servicios del inventario |
| **PublicBookingPage** | Ruta pública独立 | Integrar como sub-ruta del inventario |
| **AdminPanelPage** | Layout propio | Integrar en AppLayout del inventario |
| **Theme** | Colores propios | Adaptar al theme del inventario |
| **Hooks** | `useAgenda()` propio | Compatibilizar con estado del inventario |

### 6. 🔗 Tablas que FALTAN en el inventario

```sql
-- Para integrar Agenda, agregar estas tablas:
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  whatsapp_number TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'PEN',
  color TEXT DEFAULT '#8b5cf6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(business_id, slug)
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS public.availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  exception_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  event_type_id UUID REFERENCES public.event_types(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','rescheduled','pending_payment')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  payment_intent_id TEXT,
  cancel_token UUID DEFAULT gen_random_uuid(),
  slot_range TSGRANGE GENERATED ALWAYS AS (tsrange(start_at, end_at, '[)')) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  EXCLUDE USING gist (business_id WITH =, slot_range WITH &&) WHERE (status IN ('confirmed','pending_payment'))
);

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email','whatsapp')),
  kind TEXT NOT NULL DEFAULT 'reminder' CHECK (kind IN ('confirmation','reminder')),
  send_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 7. 📋 Pasos de Integración Agenda

1. **Instalar dependencia:** `npm i framer-motion`
2. **Crear migración SQL:** Agregar 6 tablas (businesses, event_types, schedules, etc.)
3. **Crear función RPC:** `secure_manage_booking` para gestión segura
4. **Crear vista:** `booked_slots` para slots ocupados
5. **Mover componentes:** Copiar `src/agenda/` a `src/modules/agenda/`
6. **Modificar agendaAdapter.ts:** Conectar a BD del inventario
7. **Modificar AgendaContext.tsx:** Compatibilizar con auth del inventario
8. **Agregar rutas en AppRouter:** `/agenda`, `/agenda/admin`, `/reservar/:slug`
9. **Agregar al Sidebar:** Sección "Agenda" con submenús
10. **Adaptar theme:** Cambiar colores a brand color
11. **Vincular con productos:** Event types pueden ser servicios del inventario
12. **Testing:** Verificar reservas, exclusión de slots, pagos

---

## 🔗 INTEGRACIÓN CON INVENTARIO: Puntos de Conexión

### CRM ↔ Inventario

| Entidad Inventario | Entidad CRM | Conexión |
|---|---|---|
| `customers` | `leads` | Lead puede vincularse a customer existente |
| `sales` | `leads` (ganado) | Venta cierra un lead ganado |
| `products` | `campaigns` | Campaña puede promocionar productos |
| `quotations` | `leads` (propuesta) | Cotización alimenta pipeline |

### Agenda ↔ Inventario

| Entidad Inventario | Entidad Agenda | Conexión |
|---|---|---|
| `products` (servicios) | `event_types` | Servicio = tipo de evento |
| `customers` | `bookings` | Reserva vinculada a cliente |
| `sales` | `bookings` (pagados) | Pago de reserva = venta |
| `inventory_movements` | N/A | No hay conexión directa |

---

## 📦 DEPENDENCIAS FALTANTES EN INVENTARIO

```bash
# Solo falta instalar framer-motion (para animaciones de CRM y Agenda)
npm i framer-motion
```

**Todas las demás dependencias ya están instaladas:**
- ✅ @supabase/supabase-js
- ✅ lucide-react
- ✅ react-router-dom
- ✅ recharts
- ✅ react 19
- ✅ tailwindcss

---

## 🎨 ADAPTACIÓN DE THEME

### CRM (colores actuales → inventario)

| Actual | Inventario | Uso |
|---|---|---|
| `#ff4b0b` (naranja) | `brand` (violeta) | Accent principal |
| `#111111` (fondo oscuro) | `background` | Fondo principal |
| `#18181b` (superficie) | `surface` | Tarjetas |
| `#f5f5f4` (canvas) | `background` | Área de contenido |

### Agenda (colores actuales → inventario)

| Actual | Inventario | Uso |
|---|---|---|
| `#ff4b0b` (naranja) | `brand` (violeta) | Accent principal |
| `bg-ink` | `bg-background` | Fondo oscuro |
| `bg-ink-2` | `bg-surface` | Superficie |
| `border-line` | `border-white/10` | Bordes |

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | CRM | Agenda | Total |
|---|---|---|---|
| Migración SQL | 0.5 día | 1 día | 1.5 días |
| Refactorizar adapters | 1 día | 1 día | 2 días |
| Integrar en router/sidebar | 0.5 día | 0.5 día | 1 día |
| Adaptar theme/estilos | 1 día | 1 día | 2 días |
| Testing | 1 día | 1 día | 2 días |
| **Total** | **4 días** | **4.5 días** | **~8.5 días** |

---

## ✅ VEREDICTO FINAL

### ¿Están listos para integrarse?

| App | ¿Listo? | Condición |
|---|---|---|
| **CRM** | 🟡 **SÍ, con adaptaciones** | Mover componentes, conectar adapters, adaptar theme |
| **Agenda** | 🟡 **SÍ, con adaptaciones** | Mover componentes, conectar adapters, crear tablas, adaptar theme |

### ¿Qué se necesita?

1. **Instalar:** `framer-motion` (1 dependencia)
2. **Crear:** ~8 tablas SQL nuevas (2 CRM + 6 Agenda)
3. **Crear:** 1 función RPC + 1 vista SQL
4. **Mover:** ~25 archivos de código
5. **Modificar:** ~5 archivos (adapters, context, pages)
6. **Adaptar:** Theme y estilos (~10 archivos)
7. **Agregar:** ~15 rutas en AppRouter
8. **Agregar:** ~10 items en Sidebar

### ¿Qué NO se necesita?

- ❌ Reescritura de componentes
- ❌ Cambio de framework
- ❌ Nuevas dependencias mayores
- ❌ Cambio de arquitectura
- ❌ Nuevo diseño de UI

---

**Generado por Buffy (Codebuff) — 15/08/2026**
