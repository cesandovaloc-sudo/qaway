# Instrucciones de Desarrollo de Qaway Lab

## RESTRICCIONES Y REGLAS DEL AGENTE

### 🚨 Alertas, Competencia y Comunicación
* Se te da una tarea puntual, en caso me equivoque y te consulte, o indique alguna función que no es de competencia, debes enviar alerta de: Detente, este agente está especializado xxxx. Para no confundir.
* Ante cualquier dificultad, te detienes y consultas.
* Pregunta siempre por mi aprobación antes de aplicar cambios tras planificar.
* No crees artefactos; toda la comunicación y planes los veremos directamente aquí en el chat.
* Adviérteme si doy una instrucción que no corresponda a tu rama o repositorio activo.

### 🛠️ Filosofía de Desarrollo y Calidad
* Todo análisis se hace a profundidad en código, no se asumen errores.
* Cuando se pide investigar fuentes, se busca en red referentes, repositorios entre otros que validen la información, nunca se da respuestas sin base fundamentada.
* Todos son soluciones, nunca parches.
* Sin parches superficiales ni parches temporales.
* Nunca se destruye diseño.
* No salgas del repo actual ni crees nuevas ramas.

### 📉 Optimización de Consumo y Ejecución
* Prioriza la optimización de consumo de tokens.
* No hagas comandos como build u otros sin sentido, al menos que explícitamente se te diga.
* Si notas que la ejecución de una acción te esta teniendo en acción infinita, bucle, paralizada, o no hay resultados; paraliza e informa.
* No malgastes tokens en comandos sin sentido. Siempre procura optimizar.
* No ejecutes comandos innecesarios que ocasionen consumo excesivo de tokens, ni tiempo innecesario de ejecución.

### ⚙️ Ejecución directa vs. Aprobación ("Aplica")
* Instrucciones puntuales: Se ejecutan de forma directa sin solicitar confirmación previa ("aplica"), optimizando el ritmo de trabajo.
* Cambios estructurales o complejos: Si el cambio es extenso, altera múltiples archivos/tareas o impacta la arquitectura, planifícalo primero y espera mi confirmación explícita ("aplica") antes de editar código.

### 📂 Gestión de Archivos, Documentación y Carpeta /doc
* Siempre que tengas carpeta propia, crea un agents.md. (/inint si estamos con opencode)
* Además, se va registrando la iteración con puntos esenciales. Para esto, busca tu carpeta /doc que tiene .gitignore, (si no existe se informa para crearlo) donde se almacenan documentos de implementación, bitácora y más.
* Nomenclatura de archivos gitignore: creación_implementación, bitácora etc, nombres que se entiendan y adecuados a la materia que se está trabajando.

### 📌 Git: Commits y Entregas
* No hagas reset, ni reviertas commits, ni ninguna acción destructiva.
* Commits globales: cuando pidas commit, se incluye y rastrea todo el proyecto sin crear backups ni archivos/carpetas duplicadas innecesarias.
* Nomenclatura commit para entregar: numero commit_hora y fecha_ motivo.
* Se ejecuta solo commit cuando el cambio es proporcionado, no por cambios menores.
* Nunca hagas push, eso lo hace un agente específico.

### 🚫 PROHIBICIÓN ABSOLUTA DE OPERACIONES DESTRUCTIVAS
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

---

CANDADO VISUAL:
Solo toca el elemento exacto que menciono.
No muevas elementos hermanos, padres ni hijos.
No cambies tamaño de texto, imagen, sección, layout ni responsive.
No uses soluciones indirectas como tocar el contenedor general.
Primero revisa código y dime qué tocarías. No edites hasta que yo diga "aplica".

PROTOCOLO OBLIGATORIO DE DISEÑO, MOTION Y RESPONSIVE (MÍNIMO 2 SKILLS):
Toda decisión visual, tipográfica, espacial, responsive o de animación debe ser procesada y validada obligatoriamente mediante el cruce de MÍNIMO DOS SKILLS DE DISEÑO (ej. `frontend-design` + `tailwind-css-patterns` / `gsap-core` / `accessibility`). Prohibida la manipulación arbitraria o heurística directa sin pasar por este protocolo.

1. Auditoría de Escala y Coherencia (Cero tamaños huérfanos):
   - Todo elemento de igual jerarquía debe compartir el mismo token de tamaño en toda la web (todos los h2 de sección iguales, todos los h3 de tarjeta iguales).
   - Ningún texto de contenido o descripción puede ser menor a 14.5px - 16px (estándar ergonómico de alta legibilidad estilo Airbnb).
   - El espaciado vertical entre secciones (padding-block) debe ser idéntico en toda la página.

2. Calibración Móvil Obligatoria de Entrada (Mobile-First Real):
   - Ninguna vista se entrega sin haber sido auditada y ajustada de antemano en resoluciones móviles (< 480px y < 768px).
   - Prohibido desbordamiento horizontal, textos comprimidos o botones inaccesibles.

3. Física de Animación y Hover de Alta Gama (Niche-Aware Motion):
   - Toda animación de entrada o microinteracción al pasar el mouse (hover/press) debe usar curvas de desaceleración suaves (ej. cubic-bezier(0.16, 1, 0.3, 1) o ease-out), nunca lineales ni saltos toscos.
   - Prohibido usar escalados o zooms agresivos que deformen proporciones de productos, personas o arquitectura (máximo scale permitido en imágenes: 1.02 a 1.03 con transition: transform 0.6s cubic-bezier(...)).
   - La animación debe responder al nicho de la marca: en lujo/salud/skincare debe ser sutil y fluida; en tecnología, rápida y precisa.

4. Ejecución en Modo Tarea (Task-by-Task Verification):
   - El agente debe ejecutar y validar cada punto anterior paso a paso, sin saltarse etapas ni entregar código sin previa verificación de compilación y visualización.


