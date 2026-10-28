# 📘 Bitácora y Pautas de Implementación: Módulo Búsqueda de Criterios (RAG Engine)

**Fecha:** 2026-10-16  
**Módulo:** `12-qaway_empresarial / 2-Búsqueda Criterios`  
**Ruta en Host:** `/hub/criterios`  
**Metodología:** SDD (Spec-Driven Development)  
**Roles:** Antigravity (Líder / Quaker) + OpenCode (Subagente Ejecutor)  
**Protocolo:** [acoplamiento-web](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/.agents/skills/acoplamiento-web/SKILL.md) y [ORQUESTACION_MULTIAGENTE.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/ORQUESTACION_MULTIAGENTE.md)

---

## 1. Contexto y Objetivo
Se acopló de forma 100% nativa en Qaway Lab el módulo de Búsqueda de Criterios RAG (diseñado para la asistencia técnica de normativas y distribución de materiales MINEDU/corporativo), preservando íntegramente el diseño y la interacción de `Propuesta de codigo.txt` bajo **Candado Visual**, sin iframes y con una arquitectura lista para ser desacoplada en cualquier momento hacia **Cloudflare Pages**.

---

## 2. Acciones Realizadas

### A. Documentación SDD en la Carpeta Raíz
Se generaron los 4 pilares SDD más la gobernanza multiagente:
1. `spect.md`: Especificación funcional, historias de usuario, modelos de datos (`LegalLocator`, `SpreadsheetLocator`, `DocumentLocator`, `RagChunkMatch`).
2. `stack.md`: Justificación técnica (React, TS, Tailwind scoped, Lucide Icons, cero iframes) y matriz de compatibilidad Cloudflare.
3. `task.md`: Desglose de tareas por fases.
4. `qa.md`: Matriz de aceptación (10 criterios) y calibración responsive.
5. `agents.md`: Reglas de candado visual y roles multiagente.

### B. Modularización Limpia (Delegada a OpenCode vía Orca CLI)
Se desglosó el código monolítico sin alterar ni un solo detalle visual:
* `src/types/criterios.ts`: Definición estricta de interfaces y tipos TypeScript.
* `src/data/scenarios.ts`: Semillas de escenarios interactivos (Laboral, EBITDA, MINEDU) y paletas White-Label.
* `src/components/ui/HubIcon.tsx`: Envoltorio tipado para iconografía segura.
* `src/CriteriosApp.tsx`: Núcleo React desacoplado con Inspector Polimórfico, grilla Excel con fórmulas `fx`, visor legal, visor documental, tabla comparativa y modal de arquitectura `pgvector`.

### C. Acoplamiento Nativo en Qaway Web
* **Envoltorio Host:** `CriteriosAppPage.jsx` con `ErrorBoundary`, scoped wrapper `.qaway-criterios-app-page` y `Suspense`.
* **Enrutamiento:** Montado en `src/router/AppRouter.jsx` bajo `/hub/criterios` y `hub/criterios/*` protegido por `HubAccessGuard`.

### D. Certificación de Portabilidad Cloudflare Pages
* Se agregaron `package.json` e `index.html` autónomos dentro de `2-Búsqueda Criterios/`.
* Se verificó que el 100% de los imports internos en `src/` sean relativos (`./` y `../`), con cero dependencias del alias `@/` del host.

---

## 3. Matriz de Cumplimiento de Reglas
* **Sin iframes ni parches:** Todo es React puro y tipado.
* **Candado Visual:** Todas las clases Tailwind, estilos inline, radios y paletas permanecen 100% fieles a la propuesta original.
* **Aislamiento CSS:** Encapsulado bajo `.qaway-criterios-root` sin estilos que alteren el Navbar ni el Footer de Qaway.


---

## 4. Iteración y Calibración RAG en Vivo (2026-10-27)

### A. Eliminación de Inyección Artificial de Fuentes (Mock Fallback)
* **Diagnóstico:** En [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx), la condición `if (turnSources.length === 0 && activeSources.length > 0)` inyectaba forzosamente las dos primeras fuentes del proyecto cuando el modelo no citaba ninguna (ej. chistes, saludos o preguntas abiertas). Esto generaba la tarjeta *"Fuentes y referencias vinculadas (2)"* con datos inconexos e innecesarios.
* **Solución:** Se retiró dicho fallback. La lista de fuentes del turno `turnSources` solo se puebla a partir de citaciones explícitas (`geminiResult.citations`), manteniendo el chat limpio y sin tarjetas residuales.

### B. Calibración Conversacional y Empatía Humana (Gemini RAG)
* **Diagnóstico:** En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts), las directivas imponían un tono acartonado que inducía a la IA a justificarse con preámbulos robóticos (*"Entiendo perfectamente tu punto y aprecio tu interés..."*) y a forzar una transición institucional forzada al final de cada interacción informal.
* **Solución:** Se reformularon la **Capa 0** y la **Capa 1**:
  - Prohibición estricta de aperturas defensivas o discursos burocráticos.
  - Conversación ágil, ingeniosa y cercana en intercambios casuales o de humor.
  - Activación rigurosa del análisis documental y citaciones únicamente ante consultas de fondo sobre normas, directivas y procesos del proyecto.


### C. Soporte Híbrido: Google Search Grounding y Toggle Búsqueda Web
* **Diagnóstico:** En un RAG cerrado corporativo, si el usuario solicita enlaces directos a portales externos (ej. link del Banco del Libro en `minedu.gob.pe`), la IA no los posee en sus documentos internos locales y no debe alucinarlos. Se requería un mecanismo de orientación al usuario y un switch para habilitar consultas en tiempo real a internet cuando se cuente con autorización.
* **Solución Implementada:**
  1. **Directiva de Orientación:** Se incorporó en la Capa 0 de [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts) la instrucción explícita de informar con amabilidad si el enlace no figura en las normas y guiar al usuario a activar el modo online o solicitar permisos a su administrador.
  2. **Switch en Chat y Configuración:** En [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx), se agregó un botón toggle con icono `Globe` (`[🌐 Búsqueda Web / Web en vivo]`) persistido en `localStorage` y replicado en la pestaña *Motor RAG* de Configuración.
  3. **Conector en Tiempo Real:** Al activar el modo, se envía `tools: [{ google_search: {} }]` a la API de Gemini para que consulte Google en vivo y devuelva los enlaces oficiales verificados.


### D. Renderizado de Enlaces Clicables y Formato Markdown en Mensajes
* **Diagnóstico:** El renderizador del mensaje asistente en [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx) solo dividía el texto por citas numéricas `(\[\d+\])`. Cuando el modelo generaba enlaces Markdown (`[Título](https://...)`) o URLs directas desde Google Search Grounding, estas se imprimían como texto plano no interactivo.
* **Solución Implementada:** Se refactorizó el tokenizador inline de la burbuja sin alterar el layout:
  1. **Enlaces Markdown y URLs directas:** Ahora se renderizan como hipervínculos `<a>` interactivos con `target="_blank"`, icono `ExternalLink` y estilo corporativo accesible.
  2. **Compatibilidad Total:** Mantiene las citas documentales `[1]`, `[2]` abriendo el Inspector lateral, interpreta negritas `**texto**`, y preserva saltos de línea con `whitespace-pre-wrap`.


### E. Soporte Multimodal (Pegado de Capturas Ctrl+V) y Enlaces Infalibles Anti-404
* **Diagnóstico:** 
  1. Al copiar capturas de pantalla (`Win+Shift+S`) para reportar errores visuales, el `<textarea>` del chat no permitía pegarlas (`Ctrl+V`), imposibilitando el feedback visual al modelo.
  2. Al solicitar resoluciones previas a 2018 (como la RM 0401-2008-ED), el LLM generaba enlaces con IDs numéricos aleatorios en `gob.pe` provocando páginas de error 404.
* **Solución Implementada:**
  1. **Pegado Multimodal Directo (`Ctrl+V`):** Se intercepta el evento `onPaste` en el `<textarea>` de [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx), extrayendo la imagen a Base64 y desplegando un chip de previsualización `[ 🖼️ Captura adjunta ✕ ]`.
  2. **Envío Multimodal a Gemini:** La imagen se transmite como `inline_data` a la API de Gemini para que el modelo analice visualmente la captura (reconociendo pantallas de error 404 o interfaces).
  3. **Regla de Enlaces Infalibles:** En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts), se prohíbe inventar slugs o IDs numéricos ficticios.

### F. Extracción Real de Grounding Web (`groundingChunks`), Análisis Profundo Multi-Turno y Notificación con Sonido (28-Oct-2026)
- **Problema:**
  1. Gemini devolvía enlaces genéricos de barra de búsqueda (`?term=057-2026-MINEDU`) porque la instrucción previa lo forzaba a usar `?term=` y `geminiRAGService.ts` ignoraba `candidate.groundingMetadata.groundingChunks` (donde la API de Google Search Grounding devuelve las URLs reales verificadas).
  2. En repreguntas cortas (ej. *"verifica el link antes de enviarme"*), la recuperación local BM25 solo evaluaba el texto del último mensaje y dejaba vacíos los fragmentos de la norma del turno anterior (confundiendo RM 0401-2008-ED con RM 057-2026-MINEDU).
  3. Se solicitó incorporar en Configuración (respetando el diseño visual) un interruptor para activar o desactivar notificaciones con sonido por respuesta.
- **Solución Aplicada:**
  1. **Extracción de URLs Reales de Google Search Grounding:** En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts) se implementaron `extractGroundingWebLinks` y `enrichTextWithGroundingLinks` para extraer las páginas web reales verificadas desde `candidate.groundingMetadata.groundingChunks[].web.{uri, title}`, reemplazando cualquier `?term=` genérico y listando los enlaces directos verificados por Google Search.
  2. **Recuperación Contextual Multi-Turno y Excerpt Ampliado:** En [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx) y [`ragVectorStoreService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/ragVectorStoreService.ts) se amplió `buildSourceExcerpt` a 2800 caracteres, se incluyó el contexto de los últimos 4 turnos en `retrieveRelevantChunks` y se garantizó un extracto base para cada fuente activa del proyecto para que el modelo jamás confunda una norma con otra.
  3. **Notificaciones con Sonido por Respuesta:** En `Configuración > Parámetros del Motor RAG` (`4. Toggles de Optimización`) se añadió el switch **Notificaciones con Sonido por Respuesta** (`soundNotificationEnabled` persistido en `localStorage` bajo `qaway_rag_sound_notification`) que reproduce un acorde sutil mediante Web Audio API al completarse cada respuesta del asistente.

### G. Erradicación de Negativas Automatizadas en Búsqueda Web y Búsqueda Profunda de Programas Diarios (28-Oct-2026)
- **Problema:** Con el botón *Web en vivo* activo, Gemini disparaba su respuesta automatizada de modelo ("como soy una IA no tengo acceso en tiempo real a internet...") y al insistir, buscaba cadenas literales de fecha como "28 de octubre de 2026", obviando que los programas diarios en YouTube (ej. *La Encerrona* en `@canalYAAAAA`) se titulan por el tema coyuntural del día y no por la fecha en el texto.
- **Solución Aplicada:**
  1. En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts) se modificó `compileFullRAGSystemInstruction` para inyectar un banner operativo crítico en la cima del prompt cuando `webSearch: true`, prohibiendo expresamente las negativas de corte de información y ordenando la búsqueda web inmediata.
  2. Se instruyó al modelo en la Sección 7 de directivas sobre búsqueda profunda de noticieros y programas diarios en YouTube: buscar por canal oficial (`@canalYAAAAA`), titulares temáticos matutinos y hashtags (`#LaEncerrona`), en lugar de restringirse a fechas textuales.
  3. En `extractGroundingWebLinks`, se implementó normalización para que si Google Search devuelve enlaces genéricos a la raíz de YouTube en consultas de canales conocidos (Marco Sifuentes), se dirijan automáticamente a la sección de videos recientes del canal (`https://www.youtube.com/@canalYAAAAA/videos`).

### H. Sanitizador Pre-Respuesta de URLs y Prohibición Estricta de Enlaces Inferidos (28-Oct-2026)
- **Problema:** El modelo generativo intentaba adivinar o ensamblar enlaces Markdown `[Texto](url)` en el cuerpo de la respuesta con slugs institucionales inventados (ej. `gob.pe/institucion/minedu/normas-legales/12345-...`), generando errores 404 al hacer clic.
- **Solución Aplicada:**
  1. **Validación Pre-Respuesta en `enrichTextWithGroundingLinks`:** Se implementó un algoritmo de inspección que escanea todas las etiquetas Markdown `[Texto](url)` del texto generado y las contrasta contra el conjunto de URIs verificadas devueltas por Google Search Grounding (`verifiedUris`).
  2. **Reemplazo / Desactivación de Enlaces No Verificados:** Si una URL en el cuerpo de la respuesta pertenece a un dominio sensible (`gob.pe`, `minedu.gob.pe`, `elperuano.pe`, `youtube.com`) y no fue verificada por Google Search Grounding:
     - Si hay un enlace verificado de Grounding disponible, se sustituye el enlace roto por la URL real verificada.
     - Si no hay verificación web en vivo, se neutraliza el enlace convirtiéndolo en texto plano (`**Texto** *(enlace web no verificado en línea)*`), garantizando 0% de enlaces 404.
  3. **Generación de Consultas Restrictivas en el Prompt:** Se añadieron pautas explícitas en `CAPA_0_LEGAL_PERUANA` para que las consultas internas de búsqueda utilicen sintaxis restrictiva (`site:gob.pe`, `site:elperuano.pe`, `site:youtube.com/@canalYAAAAA`).

### I. Jerarquía de Autoridad Oficial en Enlaces Web (.gob.pe Primero, Prensa al Final) (28-Oct-2026)
- **Problema:** En consultas sobre leyes y normativas públicas (ej. Ley de Presupuesto del MEF), Google Search Grounding devolvía primero diarios o portales de noticias (como `lpderecho.pe` o `larepublica.pe`), colocando las fuentes gubernamentales oficiales (`mef.gob.pe`, `gob.pe`) en posiciones secundarias, y el modelo agregaba notas aclaratorias defensivas en paréntesis.
- **Solución Aplicada:**
  1. **Algoritmo de Priorización por Autoridad (`calculateLinkAuthorityScore`):** En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts) se implementó un sistema de puntuación que clasifica y ordena los enlaces devueltos por Google Search:
     - **Máxima Prioridad (+150 puntos):** Portal institucional del ministerio o sector consultado (ej. `mef.gob.pe` / `/institucion/mef/` para finanzas, `minedu.gob.pe` para educación).
     - **Alta Prioridad (+80 puntos):** Plataforma digital del Estado (`gob.pe`), Diario Oficial El Peruano (`elperuano.pe`), SPIJ.
     - **Prioridad Secundaria (al final, -35 puntos):** Diarios y medios periodísticos (`larepublica.pe`, `elcomercio.pe`, `rpp.pe`, `lpderecho.pe`).
  2. **Títulos Descriptivos Ejecutivos (`enhanceLinkTitle`):** Se reemplazaron los nombres de dominio crudos (`mef.gob.pe`, `www.gob.pe`) por denominaciones institucionales claras (ej. `Ministerio de Economía y Finanzas (MEF) - Portal Oficial`).
  3. **Erradicación de Paréntesis Defensivos en el Prompt:** Se prohibió al modelo incluir disculpas o notas aclaratorias de "enlace de ejemplo" en el texto, instruyéndole redactar con seguridad y autoridad ejecutiva.

### J. Badges de Capacidad Multimodal, Embeddings Google text-embedding-004 y Pestaña Perfil del Agente (28-Oct-2026)
- **Diagnóstico y Necesidad:**
  1. En la matriz de proveedores solo OpenAI y Cohere mostraban botones para embeddings y reranker, y no se distinguía visualmente qué motores soportan visión/multimodalidad frente a modelos exclusivamente textuales (crucial para saber si el LLM puede analizar capturas de pantalla, tablas escaneadas o PDFs antiguos).
  2. Dentro del modal de Configuración faltaba una sección dedicada e intuitiva para configurar en profundidad la identidad del agente, su tono, su modo de razonamiento y directivas de empresa personalizadas.
- **Solución Implementada:**
  1. **Distintivos de Capacidad Multimodal (`isMultimodal`):**
     - En [`CriteriosApp.tsx`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/CriteriosApp.tsx) se extendió la interfaz `AiProvider` para etiquetar explícitamente a cada proveedor:
       - `👁️ Multimodal`: Google DeepMind (Gemini 2.5/2.0/1.5), OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet) y Mistral (Pixtral-12b / Large).
       - `📝 Solo Texto`: DeepSeek (R1/V3), Groq (LPU) y Cohere.
  2. **Habilitación de Embeddings para Google (`text-embedding-004`) y Mistral:**
     - Se reemplazó el filtro condicional rígido por `{prov.supportsEmbeddings && ...}`, permitiendo designar a Google DeepMind como motor de embeddings vectoriales (768 dimensiones).
     - Se actualizó el KPI de Embeddings y el desplegable de Parámetros del Motor para incluir la opción `Google text-embedding-004 (768 dimensiones - Nativo Gemini)`.
  3. **Pestaña Canónica "Perfil del Agente" en Configuración:**
     - Se añadió la pestaña `Perfil del Agente` con 4 módulos de configuración interactiva:
       - **1. Perfil Profesional:** Selector visual de tarjetas para *Auditor Normativo & Laboral*, *Analista Financiero & EBITDA* y *Oficial de Cumplimiento & RRHH*.
       - **2. Tono y Estilo:** Conmutador entre *Ejecutivo* (sobrio), *Técnico* (rigor legal) y *Didáctico* (pedagógico).
       - **3. Modo de Razonamiento:** Selección entre *⚡ Rápido*, *⚖️ Estándar* y *🧠 Profundo*.
       - **4. Directivas Institucionales Personalizadas:** Área de texto con persistencia automática en `localStorage` (`qaway_rag_custom_agent_directives`) inyectada en la Capa 1 de `geminiRAGService.ts` para que Gemini respete directrices específicas de la empresa.

