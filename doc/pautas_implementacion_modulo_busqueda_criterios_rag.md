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
  3. **Regla de Enlaces Infalibles:** En [`geminiRAGService.ts`](file:///c:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda%20Criterios/src/services/geminiRAGService.ts), se prohíbe inventar slugs o IDs numéricos ficticios y se exige entregar enlaces del buscador oficial parametrizado (`https://www.gob.pe/institucion/minedu/normas-legales?term=...`), garantizando que jamás se rompan.
