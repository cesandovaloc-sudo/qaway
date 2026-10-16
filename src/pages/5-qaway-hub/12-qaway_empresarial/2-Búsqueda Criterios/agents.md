# 🤖 Reglas y Directivas del Agente - Módulo Búsqueda de Criterios

## 🎯 Contexto y Competencia
Este directorio contiene la aplicación de **Búsqueda de Criterios (RAG Engine)** de Qaway Lab y MINEDU.
* **Líder (Orquestador):** Antigravity CLI (`quaker`).
* **Subagente (Ejecutor):** OpenCode (`opencode2`), coordinado mediante `orca terminal send/read`.
* **Canal de orquestación:** CLI Orca según [ORQUESTACION_MULTIAGENTE.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/ORQUESTACION_MULTIAGENTE.md).

---

## 🔒 Candado Visual y Restricciones Específicas
1. **Cero Iframes, Cero Parches:** La app se integra de manera 100% nativa en React + TypeScript.
2. **Aislamiento para Desacoplamiento (Cloudflare Pages):**
   * Todos los imports internos deben ser relativos (`./`, `../`). Prohibido importar módulos del host con `@/`.
   * La app debe poder copiarse a una carpeta o repositorio independiente y compilar con Vite de forma inmediata.
3. **Ergonomía Tipográfica:** Ningún texto informativo puede ser inferior a 14.5px.
4. **Respeto al Host:** No inyectar clases globales (`body`, `html`, `*`) que deformen el Layout, Navbar o Footer de Qaway Lab. Todos los estilos deben estar contenidos dentro del namespace `.qaway-criterios-root`.
5. **Aprobación Obligatoria:** No realizar cambios estructurales sin presentar el plan y recibir la orden de "aplica".

---

## 📁 Documentos SDD de Referencia en esta Carpeta
* [spect.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-B%C3%BAsqueda%20Criterios/spect.md): Especificación funcional, historias de usuario y contratos de tipos.
* [stack.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-B%C3%BAsqueda%20Criterios/stack.md): Arquitectura técnica, compatibilidad y estrategia Cloudflare.
* [task.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-B%C3%BAsqueda%20Criterios/task.md): Plan de ejecución atómica desglosado.
* [qa.md](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/12-qaway_empresarial/2-B%C3%BAsqueda%20Criterios/qa.md): Matriz de calidad y criterios de aceptación.
