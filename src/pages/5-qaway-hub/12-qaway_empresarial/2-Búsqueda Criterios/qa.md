# 🧪 QA: Matriz de Calidad, Criterios de Aceptación y Pruebas

Este documento establece las pruebas y validaciones obligatorias para certificar el módulo de **Búsqueda de Criterios (RAG Engine)** antes de su entrega y aprobación.

---

## 1. Criterios de Aceptación Obligatorios

| ID | Criterio | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **AC-01** | **Acoplamiento Nativo** | La aplicación se visualiza en `/hub/criterios` dentro del DOM de Qaway Lab sin usar iframes, sin hacks de inyección ni librerías externas no controladas. | Pendiente |
| **AC-02** | **Interacción de Citaciones** | Al pulsar en los badges `[1]`, `[2]`, `[3]` de la respuesta o en las filas de la tabla de fuentes, el Inspector Polimórfico derecho cambia de modo y muestra la fuente exacta. | Pendiente |
| **AC-03** | **Inspector Polimórfico** | - Modo Legal: Muestra artículos y jerarquía.<br>- Modo Excel: Muestra grilla interactiva y barra `fx`.<br>- Modo Doc: Muestra extracto y página. | Pendiente |
| **AC-04** | **Conmutador White-Label** | Alternar entre los temas Neutral, Legal y Finanzas aplica la paleta Paper & Ink al instante sin recargar la página. | Pendiente |
| **AC-05** | **Modal SQL & Edge Function** | El botón de header abre el modal con el código SQL y la función Deno/Supabase sin errores de renderizado. | Pendiente |
| **AC-06** | **Candado Visual & Ergonomía** | - Cero desbordamiento horizontal (`overflow-x-hidden` en body/root).<br>- Textos de contenido con tamaño mínimo ergonómico (>= 14.5px).<br>- Espaciado uniforme según tokens de Qaway. | Pendiente |
| **AC-07** | **Calibración Móvil (< 768px)** | En pantallas pequeñas, el Inspector se colapsa en un drawer/panel deslizable inferior o modal, permitiendo una lectura cómoda. | Pendiente |
| **AC-08** | **Cero Fugas hacia el Host** | No hay clases CSS globales que contaminen el Header, Sidebar o Footer de Qaway Web. | Pendiente |
| **AC-09** | **Compilación Limpia** | Cero errores de TypeScript y validación de build exitosa (`npm run build`). | Pendiente |
| **AC-10** | **Portabilidad Cloudflare Pages** | El módulo dentro de `2-Búsqueda Criterios/` no importa archivos externos a su carpeta, permitiendo extraerlo a un repo limpio en 1 paso. | Pendiente |

---

## 2. Matriz de Pruebas Responsive y Dispositivos

* **Móvil Ultra-Compacto (< 480px):**
  - [ ] La barra de búsqueda ajusta padding y el botón de búsqueda pasa a ícono o bloque inferior.
  - [ ] La tabla comparativa tiene scroll horizontal con indicador táctil.
  - [ ] El inspector lateral no comprime el contenido principal.
* **Tablet (768px - 1024px):**
  - [ ] Visualización fluida en 2 columnas o con inspector deslizable.
* **Escritorio (> 1280px):**
  - [ ] Distribución canónica de 2 paneles (Panel central de búsqueda y respuestas 65%, Inspector lateral derecho 35%).

---

## 3. Protocolo de Pruebas de Desacoplamiento (Checklist Cloudflare)
1. Comprobar que todos los imports en `src/` empiecen con `./` o `../`.
2. Verificar que ningún archivo importe `@/` (alias raíz del host) que impida su portabilidad.
3. Verificar que `package.json` de la subcarpeta contenga sus scripts `dev` y `build`.
