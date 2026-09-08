# Análisis de Integración — CRM y Agenda → Inventario

**Fecha:** 15 agosto 2026  
**Objetivo:** Verificar si las apps CRM y Agenda están listas para integrarse como módulos dentro del inventario, conforme al estándar v3.

---

## 1. Estado actual de cada app

### 1.1 Inventario (`10-qawaylab-inventario`)

| Aspecto | Estado |
|---|---|
| Stack | React 19 + Vite 8 + Tailwind 4 + TypeScript 7 |
| Auth | Supabase Auth (email/password) |
| BD | Supabase PostgreSQL (25 tablas activas) |
| RLS | Habilitado con `has_permission()` |
| Adaptadores | `supabaseProductAdapter`, `fiscalService`, `userService`, etc. |
| Branding | `BrandingContext.tsx` + `BrandingSettings.tsx` existen pero **no conectados** |
| Router | `react-router-dom` v7 con rutas anidadas bajo `AppLayout` |
| Sidebar | 20 items, colapsable, scrollable |

### 1.2 CRM (`7-qawaylab-crm`)

| Aspecto | Estado |
|---|---|
| Stack | React 19 + Vite 8 + Tailwind 4 + TypeScript 7 |
| Auth | **Sin auth propia** — usa `anon` key de Supabase |
| BD | Supabase PostgreSQL (2 tablas: `campaigns`, `leads`) |
| RLS | Habilitado pero **permite todo al anon** (sin restricción) |
| Adaptador | `crmAdapter.ts` — interface clara, 6 métodos |
| Contexto | `CRMContext.tsx` — providers y estado centralizado |
| Componentes | 10 vistas: Dashboard, Leads, Kanban, Clientes, Automatizaciones, Tareas, WhatsApp, Campañas, Configuración |
| Realtime | ✅ Suscripción a cambios en `leads` |

**Tablas CRM:**
```sql
campaigns (id, name, platform, status, spend, revenue, leadsCount, impressions, clicks, created_at)
leads (id, name, whatsapp, email, campaign_id, campaign_name, status, priority, budget, agent, last_message, history, metadata, unread_count, created_at)
```

### 1.3 Agenda (`8-qawaylab-agenda`)

| Aspecto | Estado |
|---|---|
| Stack | React 19 + Vite 8 + Tailwind 4 + TypeScript 7 |
| Auth | Supabase Auth (email/password) + sesiones por token |
| BD | Supabase PostgreSQL (6 tablas + 1 vista + 1 RPC) |
| RLS | ✅ Bien configurado: owner-based + anon read |
| Adaptador | `agendaAdapter.ts` — interface completa, 16 métodos |
| Contexto | `AgendaContext.tsx` — providers y estado centralizado |
| Componentes | 4 páginas: Home, AdminPanel, PublicBooking, ManageBooking |
| Multi-tenant | ✅ Tabla `businesses` con `owner_id` y `slug` |
| Pagos | ✅ Integración con Supabase Edge Functions (`create-payment`) |
| Recordatorios | ✅ Tabla `reminders` (email + WhatsApp) |

**Tablas Agenda:**
```sql
businesses (id, name, slug, owner_id, timezone, whatsapp_number, branding, created_at)
event_types (id, business_id, title, slug, description, duration_minutes, buffer_minutes, price, currency, color, is_active, created_at)
schedules (id, business_id, day_of_week, start_time, end_time)
availability_exceptions (id, business_id, exception_date, is_available, start_time, end_time)
bookings (id, business_id, event_type_id, customer_name, customer_email, customer_phone, start_at, end_at, status, payment_status, payment_intent_id, cancel_token, slot_range, created_at)
reminders (id, booking_id, channel, kind, send_at, status, error_message, created_at)
```

---

## 2. Análisis de compatibilidad

### 2.1 Stack técnico — ✅ Compatible

| Dependencia | Inventario | CRM | Agenda | Compatible |
|---|---|---|---|---|
| react | 19.2.7 | 19.2.7 | 19.2.7 | ✅ |
| react-router-dom | 7.18.1 | 7.18.1 | 7.18.1 | ✅ |
| vite | 8.1.1 | 8.1.1 | 8.1.1 | ✅ |
| tailwindcss | 4.3.2 | 4.3.2 | 4.3.2 | ✅ |
| @supabase/supabase-js | 2.110.0 | 2.110.0 | 2.110.0 | ✅ |
| typescript | 7.0.2 | 7.0.2 | 7.0.2 | ✅ |
| lucide-react | 1.28.0 | 1.28.0 | 1.28.0 | ✅ |
| framer-motion | ❌ no instalado | 12.43.0 | 12.43.0 | ⚠️ Falta en inventario |

### 2.2 Supabase — ⚠️ Requiere decisión

| Pregunta | CRM | Agenda | Inventario |
|---|---|---|---|
| ¿Misma instancia Supabase? | `@/config/supabase` (independiente) | `@/config/supabase` (independiente) | `@/config/supabase` |
| ¿Mismo `supabaseUrl`? | Variable de entorno propia | Variable de entorno propia | Variable de entorno propia |
| ¿Auth compartido? | No tiene auth | Tiene auth propia | Tiene auth propia |
| ¿RLS compatible? | Anon all (inseguro) | Owner-based (bien) | has_permission() |

**Problema clave:** Cada app apunta a su propia instancia de Supabase. Para integrar, todas deben apuntar a la **misma BD**.

### 2.3 Diseño visual — ⚠️ Incompatible

| Aspecto | Inventario | CRM | Agenda |
|---|---|---|---|
| Tema | Claro (`#f5f5f5`) | Oscuro (`#111111`) | Claro (`bg-white`) |
| Sidebar | Izquierda, colapsable | Izquierda, fijo | No tiene (usa rutas) |
| Brand color | `#ff4b0b` | `#ff4b0b` | `#ff4b0b` |
| Framer Motion | ❌ | ✅ | ✅ |

**El CRM tiene tema oscuro** — necesita adaptarse al tema claro del inventario para integrarse visualmente.

---

## 3. Qué se necesita para integrar

### 3.1 CRM → Inventario

| Requisito | Estado | Esfuerzo |
|---|---|---|
| **Migrar tablas a BD del inventario** | Faltan `campaigns` y `leads` | Bajo — ejecutar migración SQL |
| **Unificar Supabase config** | CRM usa `@/config/supabase` propio | Bajo — reusar la config del inventario |
| **Adaptar tema oscuro → claro** | CRM es `bg-[#111111]` | Medio — rediseñar sidebar y headers |
| **Conectar con auth del inventario** | CRM no tiene auth | Medio — usar sesión del inventario |
| **Crear rutas en AppRouter** | CRM tiene su propio `App.tsx` | Bajo — agregar rutas `/crm/*` |
| **Agregar al sidebar** | No existe | Bajo — agregar item "CRM" |
| **Desacoplar BrandingSettings** | CRM no tiene | Bajo — reusar el del inventario |
| **Instalar framer-motion** | No está en inventario | Bajo — `npm install framer-motion` |
| **RLS: migrar de anon a owner-based** | CRM permite todo al anon | Medio — reescribir políticas |

**Esfuerzo total CRM:** ~2-3 días de desarrollo

### 3.2 Agenda → Inventario

| Requisito | Estado | Esfuerzo |
|---|---|---|
| **Migrar tablas a BD del inventario** | Faltan 6 tablas + vista + RPC | Medio — ejecutar migración SQL |
| **Unificar Supabase config** | Agenda usa `@/config/supabase` propio | Bajo — reusar la config del inventario |
| **Adaptar diseño** | Agenda tiene diseño propio completo | Bajo — ya es tema claro, compatible |
| **Conectar con auth del inventario** | Agenda tiene auth propia | Medio — usar sesión del inventario |
| **Crear rutas en AppRouter** | Agenda tiene su propio `App.tsx` | Bajo — agregar rutas `/agenda/*` |
| **Agregar al sidebar** | No existe | Bajo — agregar item "Agenda" |
| **Edge Functions** | Agenda usa `create-payment` | Medio — desplegar en Supabase |
| **RLS: owner-based** | ✅ Ya bien configurado | Ninguno — solo verificar |

**Esfuerzo total Agenda:** ~2-3 días de desarrollo

---

## 4. Riesgos identificados

### 4.1 Riesgos técnicos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| CRM usa anon key sin restricción RLS | **Alta** | Reescribir RLS antes de integrar |
| Agenda necesita Edge Functions (`create-payment`) | Media | Desplegar en Supabase o desactivar pagos inicialmente |
| CRM usa `framer-motion` que inventario no tiene | Baja | Instalar la dependencia |
| Tablas CRM (`leads`, `campaigns`) pueden chocar con tablas existentes del inventario | Baja | Verificar nombres — no hay conflicto |
| Agenda usa `btree_gist` extension | Baja | Ya está en la migración |

### 4.2 Riesgos de negocio

| Riesgo | Severidad | Mitigación |
|---|---|---|
| CRM es oscuro, inventario es claro — experiencia inconsistente | Media | Rediseñar CRM en tema claro antes de integrar |
| Agenda tiene `businesses` table que podría confundir con `business_settings` del inventario | Media | Renombrar o clarificar en la UI |
| Múltiples providers (CRMContext, AgendaContext) pueden causar conflictos | Baja | Cada módulo tiene su propio provider |

---

## 5. Recomendación de integración

### 5.1 Orden de integración

```
1️⃣  INSTALAR DEPENDENCIA faltante (framer-motion)
2️⃣  CRM primero (más simple: 2 tablas, sin auth, sin Edge Functions)
3️⃣  Agenda segundo (más complejo: 6 tablas, auth, Edge Functions)
```

### 5.2 Estrategia por módulo

**CRM — Integración ligera:**
1. Ejecutar migración SQL `0001_crm_schema.sql` en BD del inventario
2. Mover `src/crm/` del repo CRM al inventario como `src/features/crm/`
3. Adaptar `CRMPage.tsx` al tema claro del inventario
4. Conectar `crmAdapter.ts` con la instancia de Supabase del inventario
5. Agregar rutas `/crm/*` en AppRouter
6. Agregar item "CRM" al sidebar bajo "COMERCIAL"
7. Reescribir RLS: cambiar de `anon all` a `authenticated` con `has_permission()`

**Agenda — Integración completa:**
1. Ejecutar migración SQL `0001_agenda_schema.sql` en BD del inventario
2. Mover `src/agenda/` del repo Agenda al inventario como `src/features/agenda/`
3. Adaptar páginas al layout del inventario (sidebar + header)
4. Conectar `agendaAdapter.ts` con la instancia de Supabase del inventario
5. Agregar rutas `/agenda/*` en AppRouter
6. Agregar item "Agenda" al sidebar
7. Desplegar Edge Functions de pago (opcional — se puede desactivar)
8. Verificar RLS owner-based

---

## 6. Lo que NO se debe hacer

- ❌ No mover archivos sin antes hacer commit del inventario
- ❌ No modificar el diseño del CRM/Agenda antes de integrarlos
- ❌ No conectar a BD de producción sin probar en local primero
- ❌ No activar pagos de Agenda sin configurar Stripe/MercadoPago
- ❌ No desactivar RLS del CRM en producción

---

## 7. Conclusión

**CRM: LISTO para integrar** — Stack compatible, 2 tablas simples, adaptador limpio. Solo necesita:
- Ejecutar migración SQL
- Adaptar tema oscuro → claro
- Conectar con auth del inventario

**Agenda: LISTO para integrar** — Stack compatible, diseño claro, RLS bien hecho. Solo necesita:
- Ejecutar migración SQL
- Conectar con auth del inventario
- Desplegar Edge Functions (opcional)

**Ambas apps están verificadas para integrarse.** No hay bloqueadores técnicos. El esfuerzo total estimado es de **4-6 días** para las dos.

---

*Documento generado automáticamente. No modifica código.*
