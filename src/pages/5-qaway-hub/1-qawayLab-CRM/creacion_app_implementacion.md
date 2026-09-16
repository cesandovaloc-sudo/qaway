# Registro de Avance: Creación, Implementación y Mejoras - 1-qawayLab-CRM

**Módulo:** 1-qawayLab-CRM  
**Ubicación:** `src/pages/5-qaway-hub/1-qawayLab-CRM/`  
**Ruta de acceso en navegador:** `/hub/crm`  
**Fecha de inicio:** 2026-09-16  

---

## 1. Contexto y Propósito del Módulo
El módulo **1-qawayLab-CRM** es la solución centralizada de gestión de relaciones comerciales, embudo de ventas y atención omnicanal (WhatsApp) de Qaway Lab Digital.

### Componentes Actuales:
- `CRMPage.jsx`: Contenedor principal con pestañas y roles (`management`, `marketing`, `sales`).
- `context/CRMContext.jsx`: Estado global sincronizado con Supabase (`realtime-leads`).
- `components/`:
  - `DashboardView.jsx`: KPIs y analítica.
  - `KanbanView.jsx`: Pipeline comercial con Drawer lateral interactivo.
  - `WhatsAppInboxView.jsx`: Inbox multi-agente de 3 paneles resizables.
  - `CampaignsView.jsx`: Reportes y atribución.
  - `LeadsView.jsx`, `ClientesView.jsx`, `TareasView.jsx`, `AutomatizacionesView.jsx`, `ConfiguracionView.jsx`.
  - `MetricBuilderModal.jsx`: Creador de métricas.
- `meta_ai_consultoria_waba.md`: Repositorio de requerimientos y auditoría de la IA de Meta (WABA Septiembre 2026).

---

## 2. Registro de Iteraciones y Mejoras

### [Iteración 01 - 2026-09-16]
- **Estructuración del Módulo:**
  - Renombrado de carpeta de `crm/` a `1-qawayLab-CRM/` dentro de `src/pages/5-qaway-hub/`.
  - Actualización de importación diferida en `src/router/AppRouter.jsx`.
  - Verificación de ruta activa en navegador: `/hub/crm`.
  - Creación del presente documento de seguimiento (`creacion_app_implementacion.md`).
  - Creación del registro de asesoría de Meta (`meta_ai_consultoria_waba.md`).

---

## 3. Hoja de Ruta Maestra de Implementación (4 Fases)

### Fase 1: Cimientos de Arquitectura y Contratos (NO AFECTA DISEÑO)
- [ ] Crear `types.js` con contratos de `Lead`, `Campaign`, `ChatMessage` (incluyendo `wamid` y `referral`).
- [ ] Crear `adapters/crmAdapter.js` desacoplando Supabase de la vista.
- [ ] Refactorizar `CRMContext.jsx` para consumir el adaptador y calcular el temporizador de ventana de 24h.

### Fase 2: Resiliencia y Fallback Corporativo (AFECTA DISEÑO - CANDADO VISUAL)
- [ ] Rediseñar `ErrorBoundary` a un fallback SaaS sobrio (`#111111`, zinc neutro).

### Fase 3: Integración WABA Nivel 1 - Atribución CTWA y Regla de 24h (LÓGICA + UI)
- [ ] Ingesta del payload `referral` (ad_id, headline) para cálculo de ROAS y ventana de 72h gratuita.
- [ ] Candado visual en el chat si >24h sin respuesta del cliente (forzar uso de plantilla HSM).

### Fase 4: Integración WABA Nivel 2 - Comercio Conversacional
- [ ] Mensajes interactivos (listas y botones nativos).
- [ ] Integración con WhatsApp Flows y Catálogo.
