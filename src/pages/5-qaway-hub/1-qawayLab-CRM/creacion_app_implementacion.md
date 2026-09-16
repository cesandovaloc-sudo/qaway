# Registro de Avance: Creación, Implementación y Mejoras - 1-qawayLab-CRM

**Módulo:** 1-qawayLab-CRM  
**Ubicación:** `src/pages/5-qaway-hub/1-qawayLab-CRM/`  
**Ruta de acceso en navegador:** `/hub/crm`  
**Fecha de inicio:** 2026-09-16  

---

## 1. Contexto y Propósito del Módulo
El módulo **1-qawayLab-CRM** es la solución centralizada de gestión de relaciones comerciales, embudo de ventas y atención omnicanal (WhatsApp) de Qaway Lab Digital.

### Componentes Actuales:
- `CRMPage.jsx`: Contenedor principal con pestañas y roles (`management`, `marketing`, `sales`), protegido por un `ErrorBoundary` SaaS corporativo.
- `context/CRMContext.jsx`: Estado global desacoplado y conectado al adaptador, con evaluación reactiva de la ventana de 24h.
- `types.js`: Contratos canónicos de datos (Leads, Campañas, Mensajes con `wamid`, Atribución `referral`, Ventana 24h WABA).
- `adapters/crmAdapter.js`: Capa de abstracción de datos para Supabase y Webhooks de Meta.
- `components/`:
  - `DashboardView.jsx`: KPIs y analítica.
  - `KanbanView.jsx`: Pipeline comercial con Drawer lateral interactivo.
  - `WhatsAppInboxView.jsx`: Inbox multi-agente de 3 paneles resizables con control de ventana de 24h y atribución CTWA.
  - `CampaignsView.jsx`: Reportes y atribución de campañas con métrica de ROAS.
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
  - Creación de bitácora (`creacion_app_implementacion.md`) y repositorio de Meta (`meta_ai_consultoria_waba.md`).

### [Iteración 02 - 2026-09-16]
- **Fase 1: Cimientos de Arquitectura & Tipado (Completada):**
  - Creación de `types.js` con contratos canónicos (`Lead`, `LeadStatus`, `ChatMessage` con `wamid`, `LeadReferral`, constantes 24h/72h).
  - Creación de `adapters/crmAdapter.js`: aislamiento de Supabase, soporte para cálculo de ventana de 24h y extracción de `referral`.
  - Refactorización de `CRMContext.jsx`: consumo del adaptador con 100% de compatibilidad hacia componentes hijos.

### [Iteración 03 - 2026-09-16]
- **Fase 2: Resiliencia y Fallback Corporativo (Completada):**
  - Sustitución de pantalla roja informal (`🚨 Error de React`) por fallback SaaS sobrio (`#111111`, zinc neutro, botones funcionales y acordeón de reporte técnico).
  - Auditoría global en `src/` confirmando consistencia.

### [Iteración 04 - 2026-09-16]
- **Fase 3: Integración WABA Nivel 1 - Atribución CTWA y Regla de 24h (Completada):**
  - **Candado de Ventana de 24 Horas:** En `WhatsAppInboxView.jsx`, si han pasado más de 24h desde el último mensaje entrante del prospecto, la caja de texto libre se deshabilita automáticamente y se resalta el catálogo de Plantillas Oficiales (HSM) para reabrir la conversación sin cobros imprevistos de Meta.
  - **Badge de Estado en Tiempo Real:** Cabecera del chat muestra indicador dinámico: *"Ventana 24h Activa"* (verde) o *"Fuera de Ventana (Plantilla Requerida)"* (ámbar con icono de bloqueo).
  - **Atribución Click-to-WhatsApp (CTWA):** La ficha del lead extrae y despliega la información del objeto `referral` de Meta Ads (`ad_id`, título del anuncio y badge *"72h Gratis"* de la ventana de conversación gratuita).
  - **Cálculo de ROAS:** Se incorporó el cálculo dinámico y despliegue del ROAS (*Return on Ad Spend*) en las tarjetas de [CampaignsView.jsx].

---

## 3. Hoja de Ruta Maestra de Implementación (4 Fases)

### Fase 1: Cimientos de Arquitectura y Contratos (NO AFECTA DISEÑO)
- [x] Crear `types.js` con contratos de `Lead`, `Campaign`, `ChatMessage` (incluyendo `wamid` y `referral`).
- [x] Crear `adapters/crmAdapter.js` desacoplando Supabase de la vista.
- [x] Refactorizar `CRMContext.jsx` para consumir el adaptador y calcular el temporizador de ventana de 24h.

### Fase 2: Resiliencia y Fallback Corporativo (AFECTA DISEÑO - CANDADO VISUAL)
- [x] Rediseñar `ErrorBoundary` a un fallback SaaS sobrio (`#111111`, zinc neutro).

### Fase 3: Integración WABA Nivel 1 - Atribución CTWA y Regla de 24h (LÓGICA + UI)
- [x] Ingesta del payload `referral` (ad_id, headline) para cálculo de ROAS y ventana de 72h gratuita.
- [x] Candado visual en el chat si >24h sin respuesta del cliente (forzar uso de plantilla HSM).
- [x] Cálculo y visualización de ROAS en Gestor de Campañas.

### Fase 4: Integración WABA Nivel 2 - Comercio Conversacional
- [ ] Mensajes interactivos (listas y botones nativos).
- [ ] Integración con WhatsApp Flows y Catálogo.
