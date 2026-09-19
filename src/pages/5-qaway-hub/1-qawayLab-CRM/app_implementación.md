# app_implementación — Qaway Lab CRM

## Iteración 1 — Desacoplamiento de Navbar y Pegado al Top (2026-09-18)
- **Rutas afectadas:**
  - \src/router/AppRouter.jsx\: Se movió la ruta \/hub/crm\ fuera de \<Route element={<Layout />}>\ al bloque de aplicaciones SaaS standalone.
  - \src/pages/5-qaway-hub/1-qawayLab-CRM/CRMPage.jsx\: Se removió el hook \useSetNavbarVariant('dark')\ y su importación.
- **Ajuste Espacial:**
  - Se removió la clase \pt-[80px]\ del contenedor raíz (\CRMContent\) en \CRMPage.jsx\.
- **Resultado:**
  - La aplicación CRM funciona en modo aplicación completa (full-screen standalone), sin el navbar/footer institucional de la web pública y anclada exactamente a top: 0.
  - Se mantiene intacto su diseño interno (sidebar oscuro con marca Qaway Lab, selector de roles, pestañas de vistas, métricas y simulador).

---

## Iteración 2 — Blindaje Multi-Tenant en Base de Datos (RLS) y Selector de Marcas (2026-09-19)
- **Objetivo:** Garantizar que los datos de prospectos, clientes y campañas jamás se crucen entre distintas empresas en la base de datos central (`qrusdsqgygfolxfrafyd`), e integrar soporte de multi-tenancy nativo en la consola del CRM.
- **Acciones Realizadas en Base de Datos:**
  1. **Vinculación de Usuarios con Tenant (`public.users`):**
     - Migración `20260919153000_strict_tenant_users_rls.sql` aplicada con `supabase db push`.
     - Columna `tenant_id uuid references public.tenants(id) on delete set null` agregada e indexada en `public.users`.
     - Función SQL `public.get_auth_tenant_id()` creada como `SECURITY DEFINER` para resolver el tenant del usuario conectado sin recursión RLS.
     - Trigger `public.handle_new_user()` actualizado para propagar `tenant_id` desde metadata de autenticación.
  2. **Saneamiento Histórico:**
     - 49 leads históricos que tenían `tenant_id = null` fueron saneados y asignados formalmente a Qaway Lab Master (`00000000-0000-0000-0000-000000000001`). Cero registros huérfanos.
  3. **Blindaje RLS Infranqueable en `public.leads` y `public.campaigns`:**
     - Eliminadas políticas permisivas (`using (true)`).
     - Establecidas políticas estrictas `leads_tenant_select`, `leads_tenant_insert`, `leads_tenant_update`, `leads_tenant_delete`:
       * SuperAdmins (`public.is_admin()`) auditan todas las marcas.
       * Usuarios autenticados de un tenant solo pueden consultar, crear y modificar filas que pertenezcan a su propio `tenant_id`.
       * Formularios públicos de captación (landing pages de clientes como CoraVet) pueden insertar leads de forma anónima siempre y cuando declaren su `tenant_id` válido.
- **Acciones Realizadas en Frontend:**
  1. **Adaptador CRM (`crmAdapter.js`):**
     - Métodos `getLeads(tenantId)` y `getCampaigns(tenantId)` actualizados para soportar filtrado granular por tenant (`.eq('tenant_id', tenantId)`) o vista consolidada.
     - Método `getTenants()` incorporado para consultar las marcas activas registradas en PostgreSQL.
     - Método `insertLead` blindado para asegurar siempre la inclusión del `tenant_id` activo.
  2. **Contexto CRM (`CRMContext.jsx`):**
     - Estados `tenants`, `selectedTenantId` y `activeTenant` incorporados con persistencia dual en `localStorage` (`qaway_crm_selected_tenant`).
     - Recarga reactiva de campañas y leads al conmutar de marca.
  3. **Interfaz Visual (`CRMPage.jsx`):**
     - **Candado Visual 100% Respetado:** Cero alteraciones en la cuadrícula, tipografía Oswald, botones, métricas ni responsive.
     - Título dinámico en el sidebar reflejando la marca activa (`[Marca] CRM`).
     - Selector de marcas ergonómico en el TopBar junto al menú de inicio y waffle de aplicaciones, permitiendo alternar entre marcas activas o ver el consolidado global.
- **Validación:**
  - Migración aplicada exitosamente con `supabase db push`.
  - Verificación en base de datos: 53 leads totales asignados a Qaway Lab Master, 0 huérfanos.
  - Compilación limpia con Vite (`npm run build:dev` exitoso en 21.75s).

