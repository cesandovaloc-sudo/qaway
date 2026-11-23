# RESTRICCIONES Y REGLAS DEL AGENTE

## 🚨 Alertas, Competencia y Comunicación

* Se te da una tarea puntual, en caso me equivoque y te consulte, o indique alguna función que no es de competencia, debes enviar alerta de: Detente, este agente está especializado xxxx. Para no confundir.
* Ante cualquier dificultad, te detienes y consultas.
* Pregunta siempre por mi aprobación antes de aplicar cambios tras planificar.
* No crees artefactos; toda la comunicación y planes los veremos directamente aquí en el chat.
* Adviérteme si doy una instrucción que no corresponda a tu rama o repositorio activo.

## 🛠️ Filosofía de Desarrollo y Calidad

* Todo análisis se hace a profundidad en código, no se asumen errores.
* Cuando se pide investigar fuentes, se busca en red referentes, repositorios entre otros que validen la información, nunca se da respuestas sin base fundamentada.
* Todos son soluciones, nunca parches.
* Sin parches superficiales ni parches temporales.
* Nunca se destruye diseño.
* No salgas del repo actual ni crees nuevas ramas.

## 📉 Optimización de Consumo y Ejecución

* Prioriza la optimización de consumo de tokens.
* No hagas comandos como build u otros sin sentido, al menos que explícitamente se te diga
* Si notas que la ejecución de una acción te esta teniendo en acción infinita, bucle, paralizada, o no hay resultados; paraliza e informa
* No malgastes tokens en comandos sin sentido. Siempre procura optimizar.
* No ejecutes comandos innecesarios que ocasionen consumo excesivo de tokens, ni tiempo innecesario de ejecución.

## ⚙️ Ejecución directa vs. Aprobación ("Aplica")

* Instrucciones puntuales: Se ejecutan de forma directa sin solicitar confirmación previa ("aplica"), optimizando el ritmo de trabajo.
* Cambios estructurales o complejos: Si el cambio es extenso, altera múltiples archivos/tareas o impacta la arquitectura, planifícalo primero y espera mi confirmación explícita ("aplica") antes de editar código.

## 📌 Git: Commits y Entregas

* No hagas reset, ni reviertas commits, ni ninguna acción destructiva.
* Commits globales: cuando pidas commit, se incluye y rastrea todo el proyecto sin crear backups ni archivos/carpetas duplicadas innecesarias.
* Nomenclatura commit para entregar: numero commit_hora y fecha_ motivo.
* Se ejecuta solo commit cuando el cambio es proporcionado, no por cambios menores.
* Nunca hagas push, eso lo hace un agente específico.

## 🚫 PROHIBICIÓN ABSOLUTA DE OPERACIONES DESTRUCTIVAS

* Nunca ejecutes los siguientes comandos ni ningún comando equivalente que pueda borrar trabajo, sobrescribir cambios, eliminar archivos, regresar el repositorio a un commit anterior, reescribir historial o afectar avances que estén fuera de la tarea actual:
  * git reset
  * git reset --hard
  * git clean
  * git checkout .
  * git restore .
  * git revert
  * git push --force
  * git push --force-with-lease
* Nunca retrocedas a un commit anterior para solucionar un error.
* Los commits existentes son históricos y deben permanecer intactos. Que un commit anterior haya funcionado mejor NO significa que tengas autorización para regresar a él.
* Si necesitas consultar un commit anterior para INVESTIGAR: solo puedes leerlo/compararlo. Nunca modificarás el estado actual para regresar a él.

## 📝 Respuesta Obligatoria al Final de Cada Mensaje
Tu rama - tu ultimo commit - tu carpeta repo.

## 🎯 Alineación obligatoria antes de tocar código

* Al iniciar, lee `AGENTS.md` (o `ALINEACION.md`) en la raíz del repo y confírmalo en el chat antes de analizar. Si no existe, avisa y sigue solo con este bloque.
* Antes de proponer un fix, busca si el caso ya está documentado en `src/pages/5-qaway-hub/0-SOLUCIONES` y en `13-Gestor_Proyectos2/AUDITORIA`. Si existe, reutiliza esa solución; no la reinventes.
* Toda solución es estructural: se elimina la causa. Nunca subir timeouts, añadir fallbacks ni ocultar lentitud apoyándose en la sesión local del navegador.

## ⚡ Rendimiento (reglas verificables)

* Nunca encadenes `await` a Supabase si las consultas no dependen entre sí: usa `Promise.all` o promesa compartida (in-flight + caché). Prohibido pedir lo mismo en varias capas.
* Una sola resolución de sesión por flujo: reutiliza `getSession`/`getUser`, no la vuelvas a pedir en cada módulo.
* Todo módulo que no se use en el arranque se importa con `lazy()`. Prohibido añadir imports estáticos nuevos a `src/router/AppRouter.jsx`.
* La deduplicación es por recurso, no por módulo. Si un dato ya se consultó, se reutiliza.
* Las mediciones se hacen con datos sanos: una respuesta 400 no valida una métrica.

## ✅ Validación y cierre

* Valida solo con `typecheck` + revisión de source (grep). `build`, `build:dev` o regenerar `dist` está prohibido salvo autorización explícita.
* Antes del commit, revisa el `git diff` completo, no solo tus archivos: el commit total arrastra cambios de otros agentes.

## Aislamiento Visual de Apps (CSS Scoped)

Al crear o modificar una app dentro de `src/pages/5-qaway-hub/`, su diseño debe vivir 100% encapsulado sin contaminar la web principal ni otras apps:

* Prefijo único raíz: Todo estilo propio debe ir bajo una clase raíz de la app (ej. `.cfg-v1`, `.gantt-v2`, `.mi-app-v1`), nunca selectores globales sueltos (`body`, `html`, `*`, `h1`, `button`).
* Carga perezosa (`lazy()`): Importar la app con `lazy()` en `AppRouter.jsx` para que su CSS solo se cargue cuando el usuario entra a su ruta.
* Sin dependencias visuales cruzadas: No importar hojas de estilo de otra app ni de la web pública.