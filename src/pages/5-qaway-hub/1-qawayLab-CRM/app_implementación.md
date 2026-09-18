# app_implementación — Qaway Lab CRM

## Iteración 1 — Desacoplamiento de Navbar y Pegado al Top (2026-09-18)
- **Rutas afectadas:**
  - \src/router/AppRouter.jsx\: Se movió la ruta \/hub/crm\ fuera de \<Route element={<Layout />}>\ al bloque de aplicaciones SaaS standalone.
  - \src/pages/5-qaway-hub/1-qawayLab-CRM/CRMPage.jsx\: Se removió el hook \useSetNavbarVariant('dark')\ y su importación.
- **Ajuste Espacial:**
  - Se removió la clase \pt-[80px]\ del contenedor raíz (\CRMContent\) en \CRMPage.jsx\.
- **Resultado:**
  - La aplicación CRM funciona en modo aplicación completa (full-screen standalone), sin el navbar/footer institucional de la web pública y anclada exactamente a \	op: 0\.
  - Se mantiene intacto su diseño interno (sidebar oscuro con marca Qaway Lab, selector de roles, pestañas de vistas, métricas y simulador).
