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
