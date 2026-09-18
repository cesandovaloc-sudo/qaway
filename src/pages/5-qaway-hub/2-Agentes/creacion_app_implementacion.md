# Bitácora de Implementación — Módulo Hub: Agentes de IA Responsable

## Información General
- **Módulo:** Agentes de IA Consultivos & Gobernanza Normativa (Hub)
- **Ubicación:** `src/pages/5-qaway-hub/2-Agentes/`
- **Ruta Oficial:** `/hub/agentes`
- **Estándar Visual:** Basado en Content Studio (`/hub/creador-contenido`) y Estándar Web Qaway v4.0.
- **Normativa Regulatoria:** Ley Peruana Nº 31814 (D.S. Nº 066-2024-PCM), Ley Nº 29733 (Protección de Datos Personales), Google Responsible AI Principles & Google PAIR Guidebook.

---

## Iteración 1 — Arquitectura Base, Motor de 3 Capas y Studio Ergonómico (2026-09-18)

### 1. Objetivos Cumplidos
1. **Creación del Motor de Compilación de Prompts en 3 Capas (`promptEngine.ts`):**
   - **Capa 0 (Inviolable):** Garantiza la declaración explícita de IA (principio de no suplantación), el protocolo inmediato de traspaso humano (*Human Handoff*), la prohibición de captura de datos financieros o sensibles, y la neutralización de ataques de inyección (*Anti-Prompt Injection*).
   - **Capa 1 (Voz de Marca):** Permite configurar nombre del asistente, arquetipo de personalidad (Formal Ejecutivo, Cercano & Empático, Dinámico & Juvenil), formato de salida para WhatsApp (máximo 3-4 líneas por párrafo) y calibración de temperatura (0.2 - 0.35 anti-alucinación).
   - **Capa 2 (Conocimiento & Guardrails):** Estructuración de portafolio de productos/servicios, límites de precios orientativos, políticas de atención y lista personalizada de palabras clave de traspaso humano.
2. **Estructuración de Tipos y Datos Semilla (`agent.types.ts`, `defaultAgents.ts`):**
   - Soporte para Multi-Tenant nativo alineado con la base de datos Supabase (`tenants.ai_settings`).
   - Semillas pre-configuradas para **Qaway Lab Digital (Master)**, **CoraVet Clínica Veterinaria (Piloto)** y **Vallet Grupo Inmobiliario (BYOK)**.
3. **Módulo de UI Tipo Content Studio (`AgentesHubPage.tsx` y subcomponentes):**
   - **Sidebar Índigo (`#4f46e5`):** Monograma Q, selector interactivo de marcas/tenants con persistencia dual (`Supabase` + `localStorage`), menú de navegación vertical con píldoras activas y pie de usuario.
   - **TopBar Ejecutiva:** Breadcrumb, selector de canal (WhatsApp WABA / Web Widget), píldora de semáforo ético con pulso en vivo y botón de guardado en la nube.
   - **Tabs Especializadas:**
     1. *Dashboard Ejecutivo:* Métricas de atención, compliance al 100%, distribución de intenciones y accesos directos.
     2. *Identidad & Misión:* Configuración de proveedor LLM (Gemini 2.5 Flash, GPT-4o, Claude 3.5 Sonnet), modalidad (Managed vs BYOK) y rol.
     3. *Voz & Tono:* Arquetipos de personalidad, calibración de longitud y reglas de cortesía.
     4. *Conocimiento & Traspaso:* Editor de servicios/catálogo, FAQs y palabras clave de intervención humana.
     5. *Simulador Dual & Auditor de Ética:* Emulador interactivo en tiempo real con alternador visual (WhatsApp con burbujas verdes y Web Widget), semáforo de auditoría de guardrails (evaluación de transparencia, traspaso humano, protección de datos y anti-inyección) e inspector de prompt en 3 capas.
     6. *Despliegue & WABA:* Credenciales de WhatsApp Cloud API y código de incrustación de Widget Web.
4. **Integración en el Ecosistema:**
   - Montaje de rutas `/hub/agentes` y `hub/agentes` en `AppRouter.jsx`.
   - Incorporación de tarjeta destacada en `HubPage.jsx`.
