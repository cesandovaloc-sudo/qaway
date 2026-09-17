# Registro de Avance: Creación, Implementación y Mejoras - 1-qawayLab-CRM

**Módulo:** 1-qawayLab-CRM  
**Ubicación:** `src/pages/5-qaway-hub/1-qawayLab-CRM/`  
**Ruta de acceso en navegador:** `/hub/crm`  
**Fecha de inicio:** 2026-09-16  

---

## 1. Contexto y Propósito del Módulo
El módulo **1-qawayLab-CRM** es la solución centralizada de gestión de relaciones comerciales, embudo de ventas y comercio conversacional (WhatsApp) de Qaway Lab Digital.

### Componentes Actuales:
- `CRMPage.jsx`: Contenedor principal con pestañas y roles (`management`, `marketing`, `sales`), protegido por un `ErrorBoundary` SaaS corporativo y simulador de webhooks CTWA.
- `context/CRMContext.jsx`: Estado global desacoplado y conectado al adaptador, con evaluación de ventana de 24h y soporte para payloads de Flows y Catálogo.
- `types.js`: Contratos canónicos de datos (Leads, Campañas, Mensajes con `wamid`, Atribución `referral`, Ventana 24h WABA).
- `adapters/crmAdapter.js`: Capa de abstracción de datos para Supabase y Webhooks de Meta.
- `components/`:
  - `DashboardView.jsx`: KPIs y analítica comercial.
  - `KanbanView.jsx`: Pipeline comercial con Drawer lateral interactivo.
  - `WhatsAppInboxView.jsx`: Inbox de comercio conversacional de 3 paneles resizables, con soporte nativo de WhatsApp Flows 3.0, Catálogo con Pagos, ventana de 24h y atribución CTWA.
  - `CampaignsView.jsx`: Reportes y atribución de campañas con métrica de ROAS y datos de demostración si la base de datos está vacía.
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

### [Iteración 06 - 2026-09-16]
- **Ajustes de Visibilidad y Simulación en Vivo:**
  - **Gestor de Campañas sin Pantalla en Blanco:** Inclusión de `DEMO_CAMPAIGNS` como fallback en [CampaignsView.jsx] cuando la tabla de Supabase está vacía, desplegando tarjetas de anuncios con ROAS de 4.38x y 4.24x.
  - **Simulador CTWA de Meta Ads:** Actualización de `handleSimulate` en [CRMPage.jsx] para inyectar leads completos con nombre, WhatsApp y objeto `referral` de Meta Ads, permitiendo ver la tarjeta de atribución verde y la insignia "72h Gratis".
  - **Claridad de Sub-Pestañas:** Rediseño prominente de los selectores de Plantillas, Flows y Catálogo con badges de conteo y subtítulos descriptivos en [WhatsAppInboxView.jsx].

### [Iteración 07 - 2026-09-16]
- **Registro de Activos Oficiales y Arquitectura de Integración WABA (Ronda 02 de Meta):**
  - **Credenciales del Business Manager:** Registro del Business ID (`860625207070053`) y Asset ID (`1065820593280322`) vinculados a Qaway Lab.
  - **Aprovisionamiento de Meta Business Agent:** Requisitos de System User Admin con permisos `whatsapp_business_messaging` y `whatsapp_business_management`.
  - **Handover Protocol (Human Handoff):** Definición de arquitectura Primary Receiver en CRM y transferencia fluida mediante `pass_thread_control` para alternar entre IA y asesores.
  - **Seguridad en Webhooks:** Especificación de validación criptográfica `x-hub-signature-256` con HMAC-SHA256 y deduplicación con `wamid`.
  - **Atribución CTWA:** Mapeo del objeto `referral` (`source_id`, `headline`, `image_url`) con la campaña activa y ventana de 72 horas gratuitas.
  - **WhatsApp Flows 3.0:** Requerimientos de cifrado RSA y esquemas de intercambio de datos dinámicos.

