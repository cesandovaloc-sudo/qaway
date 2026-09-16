# Registro de Avance: Creación, Implementación y Mejoras - 1-qawayLab-CRM

**Módulo:** 1-qawayLab-CRM  
**Ubicación:** `src/pages/5-qaway-hub/1-qawayLab-CRM/`  
**Ruta de acceso en navegador:** `/hub/crm`  
**Fecha de inicio:** 2026-09-16  

---

## 1. Contexto y Propósito del Módulo
El módulo **1-qawayLab-CRM** es la solución centralizada de gestión de relaciones comerciales, embudo de ventas y comercio conversacional (WhatsApp) de Qaway Lab Digital.

### Componentes Actuales:
- `CRMPage.jsx`: Contenedor principal con pestañas y roles (`management`, `marketing`, `sales`), protegido por un `ErrorBoundary` SaaS corporativo.
- `context/CRMContext.jsx`: Estado global desacoplado y conectado al adaptador, con evaluación de ventana de 24h y soporte para payloads de Flows y Catálogo.
- `types.js`: Contratos canónicos de datos (Leads, Campañas, Mensajes con `wamid`, Atribución `referral`, Ventana 24h WABA).
- `adapters/crmAdapter.js`: Capa de abstracción de datos para Supabase y Webhooks de Meta.
- `components/`:
  - `DashboardView.jsx`: KPIs y analítica.
  - `KanbanView.jsx`: Pipeline comercial con Drawer lateral interactivo.
  - `WhatsAppInboxView.jsx`: Inbox de comercio conversacional de 3 paneles resizables, con soporte nativo de WhatsApp Flows 3.0, Catálogo con Pagos, ventana de 24h y atribución CTWA.
  - `CampaignsView.jsx`: Reportes y atribución de campañas con métrica de ROAS.
  - `LeadsView.jsx`, `ClientesView.jsx`, `TareasView.jsx`, `AutomatizacionesView.jsx`, `ConfiguracionView.jsx`.
  - `MetricBuilderModal.jsx`: Creador de métricas.
- `meta_ai_consultoria_waba.md`: Repositorio de requerimientos y auditoría de la IA de Meta (WABA Septiembre 2026).

---

## 2. Registro de Iteraciones y Mejoras

### [Iteración 01 - 2026-09-16]
- Renombrado de carpeta de `crm/` a `1-qawayLab-CRM/` en `src/pages/5-qaway-hub/`.
- Actualización de importación diferida en `src/router/AppRouter.jsx`.
- Creación de bitácora (`creacion_app_implementacion.md`) y repositorio de Meta (`meta_ai_consultoria_waba.md`).

### [Iteración 02 - 2026-09-16]
- **Fase 1 (Arquitectura & Tipado):** Creación de `types.js`, `adapters/crmAdapter.js` y desacoplamiento de Supabase de `CRMContext.jsx`.

### [Iteración 03 - 2026-09-16]
- **Fase 2 (Resiliencia y Fallback):** Rediseño del `ErrorBoundary` con fallback SaaS corporativo `#111111` y auditoría de consistencia global.

### [Iteración 04 - 2026-09-16]
- **Fase 3 (Atribución CTWA y Regla de 24h):** Candado en el inbox si pasan >24h sin respuesta del cliente, badge de estado en tiempo real, bloque CTWA en ficha del lead y cálculo de ROAS en campañas.

### [Iteración 05 - 2026-09-16]
- **Fase 4 (Comercio Conversacional - WABA Septiembre 2026):**
  - **WhatsApp Flows 3.0 Integrados:** Envío y renderizado de formularios interactivos dentro de WhatsApp (`Formulario Cotización`, `Agendar Cita`).
  - **Catálogo Oficial y Pagos Nativos:** Envío de fichas de producto (`Plantilla Notion Pro`, `Curso Identidad Visual`) con precios y botón de checkout interactivo simulando WhatsApp Pay.
  - **Selector de Acciones Rápidas:** Sub-pestañas ergonómicas en la barra de entrada (`✨ Plantillas HSM` | `📋 WhatsApp Flows` | `🛒 Catálogo & Pagos`).
  - **Burbujas Enriquecidas:** Renderizado de tarjetas visuales estructuradas para mensajes de tipo `flow` y `product` dentro del historial del chat.

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
- [x] Mensajes interactivos estructurados (tarjetas visuales para formularios y productos).
- [x] Integración de WhatsApp Flows 3.0 (agendamiento y cotizaciones nativas en chat).
- [x] Sincronización de Catálogo de Productos y botón de compra directa con WhatsApp Pay.
