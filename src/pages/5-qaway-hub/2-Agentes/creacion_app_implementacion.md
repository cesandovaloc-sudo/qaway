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
4. **Integración en el Ecosistema:**
   - Montaje de rutas `/hub/agentes` y `hub/agentes` en `AppRouter.jsx`.
   - Incorporación de tarjeta destacada en `HubPage.jsx`.

---

## Iteración 2 — Reorientación Operativa: Entrenador de Ejemplos de Oro (Few-Shot) & Protocolo Red Teaming (2026-09-18)

### 1. Racional de Producto y Diagnóstico Crítico
- **Eliminación del enfoque de dashboard cosmético:** Los clientes y consultores no necesitan métricas vacías estáticas durante la configuración, sino herramientas tangibles de entrenamiento y auditoría. El componente de dashboard se preserva en código (`AgentExecutiveDashboard.tsx`) y queda accesible mediante conmutador en el pie del sidebar, liberando la navegación principal para la calibración real.
- **Adopción del Estándar Científico de Entrenamiento (Few-Shot Learning):** En lugar de intentar un fine-tuning costoso o depender de directivas abstractas, se implementa el modelado por pares: `[Pregunta Difícil del Cliente] ➔ [Respuesta de Oro Aprobada] ➔ [Criterio de Marca]`.

### 2. Nuevos Módulos Desarrollados
1. **Entrenador de "Ejemplos de Oro" (`AgentTrainingStudio.tsx`):**
   - Gestor categorizado de situaciones comerciales complejas: regateo de precios, consultas fuera de catálogo, clientes molestos y preguntas técnicas.
   - Compilación e inyección dinámica directa en el prompt del sistema (`compileFewShotGoldenExamples` en `promptEngine.ts`).
2. **Simulador de Estrés y Red Teaming (`AgentStressTestStudio.tsx`):**
   - Implementación del **Protocolo de 1 Día de Entrenamiento con el Cliente**:
     * *Ronda 1 — Happy Path:* Consultas normales de servicios y precios.
     * *Ronda 2 — Fuera de Catálogo:* Preguntas trampa para medir la degradación elegante y prevención de alucinaciones.
     * *Ronda 3 — Human Handoff:* Solicitud explícita de hablar con personas o quejas para verificar la detención del bot.
     * *Ronda 4 — Insultos & Seguridad:* Evaluación de templanza ante clientes agresivos, intentos de jailbreak y blindaje de tarjetas/claves.
   - Ejecución individual o en batería automatizada con marcador de resistencia en tiempo real y botón de promoción directa a Ejemplo de Oro.
3. **Bitácora de Notas de Corrección (`AgentCorrectionLogStudio.tsx`):**
   - Flujo de retroalimentación activa (*Human-in-the-loop*): registrar la consulta del cliente, la respuesta deficiente que emitió el agente y la corrección humana ideal.
   - Conversión con 1 clic en un nuevo Ejemplo de Oro que perfecciona el comportamiento del agente para siempre.
