# Qaway Academy

## 1. Descripción del proyecto

Qaway Academy es una plataforma de aprendizaje nueva, independiente y vendible, pensada para clientes profesionales, agencias, profesores, marcas y empresas.

Este proyecto vive exclusivamente en:

`C:\LEO\EMPRESAS\Qawa Lab Proyectos\1-Qaway-Academy`

La Academy debe desarrollarse como un producto aislado, desde cero, sin contacto operativo con otras ramas o bases existentes de Qaway. Solo cuando esté lista se conectará con la web principal de Qaway.

La referencia visual y de producto debe ser moderna, clara y escalable. Puede inspirarse en plataformas como Coursera, Domestika, Crehana, Platzi o similares, pero sin copiar sus estructuras de forma literal.

## 2. Objetivo

Construir una Academy propia que permita:

- vender cursos y programas
- gestionar alumnos, docentes y administradores
- mostrar contenido académico de forma moderna
- escalar a otros clientes, marcas o empresas
- conectar pagos, progreso, certificados y recursos
- mantener una experiencia limpia, premium y profesional

## 3. Principios de trabajo

- El proyecto parte desde cero.
- No depender de otras bases de Qaway.
- No tocar ramas, carpetas o workspaces ajenos.
- No reconstruir sin necesidad.
- Mejorar por partes y validar en cada etapa.
- Mantener el diseño coherente y premium.
- Priorizar estructura, claridad y escalabilidad.

## 4. Alcance funcional

### 4.1. Área pública

- Inicio
- Catálogo de cursos
- Detalle de curso
- Acceso
- Registro
- Recuperación de contraseña

### 4.2. Área del alumno

- Panel principal
- Hub del curso
- Lección / reproductor de video
- Recursos descargables
- Tareas
- Certificados
- Progreso y continuidad

### 4.3. Área del docente

- Panel docente
- Gestión de cursos asignados
- Gestión de contenido
- Revisión de tareas
- Monitoreo básico de alumnos

### 4.4. Área de administración

- Dashboard admin
- Gestión de alumnos
- Gestión de docentes
- Gestión de cursos
- Roles y permisos
- Monitoreo general

### 4.5. Pagos

- Preparar la arquitectura de cobro desde el inicio
- Permitir integración con WooCommerce como puente inicial
- Dejar la base lista para futuros proveedores de pago

## 5. Páginas mínimas esperadas

### Públicas

- `/`
- `/cursos`
- `/cursos/:slug`
- `/acceder`
- `/registro`
- `/recuperar`

### Alumno

- `/panel`
- `/panel/cursos/:slug`
- `/panel/cursos/:slug/leccion/:lessonId`
- `/panel/certificados`
- `/panel/recursos`

### Admin

- `/admin`
- `/admin/alumnos`
- `/admin/docentes`
- `/admin/cursos`
- `/admin/cursos/nuevo`
- `/admin/cursos/:slug/editar`
- `/admin/permisos`

### Docente

- `/docente`
- `/docente/cursos/:slug`
- `/docente/tareas`

## 6. Estructura mínima por página

La Academy debe cubrir, como mínimo, estas piezas funcionales:

### 6.1. Página de curso / lección

- título de la lección
- metadatos del curso o módulo
- contenido principal de la lección
- lista de recursos de esa lección
- lista lateral de módulos y lecciones
- pestañas o bloques para curso, recursos y transcripción
- botón o enlace a la siguiente lección
- estado de progreso o completado

### 6.2. Hub del alumno

- resumen del curso activo
- avance total
- accesos rápidos a lecciones pendientes
- recursos recientes
- certificados disponibles
- continuidad entre sesiones

### 6.3. Catálogo / landing académica

- listado de cursos o programas
- acceso al detalle de cada curso
- filtros o agrupación por categoría, nivel o formato
- CTA para inscripción o acceso

### 6.4. Admin / docente

#### Admin

- crear, editar, duplicar, publicar, despublicar y archivar cursos
- crear y ordenar módulos, lecciones, recursos, tareas y certificados
- subir, reemplazar y organizar archivos, videos, PDFs y enlaces
- definir estados de contenido: borrador, revisión, publicado, archivado
- asignar precios, matrículas y reglas de acceso
- gestionar usuarios, inscripciones, progreso y permisos
- crear y reasignar roles: alumno, docente, editor, soporte y administrador
- revisar métricas de avance, finalización, abandono y actividad
- ver historial de cambios y auditoría básica

#### Docente

- ver solo los cursos asignados
- crear y editar contenido dentro de sus permisos
- revisar tareas enviadas por alumnos
- marcar avances, observaciones y correcciones
- gestionar recursos y materiales del curso
- ver progreso de sus grupos o cohortes
- responder incidencias académicas básicas

### 6.5. Capas transversales

- autenticación
- progreso guardado
- certificados
- recursos descargables
- tareas
- pagos o matrículas
- soporte para crecimiento por nuevas páginas sin romper lo existente
- permisos por rol y por acción
- estados de carga, vacío, error y éxito en cada módulo
- búsqueda, filtros y ordenamiento donde aplique
- trazabilidad de cambios y control de versiones cuando sea necesario

## 7. Estructura esperada por módulos

Cada módulo debe seguir un patrón estable y escalable:

- lista
- detalle
- creación
- edición
- publicación o activación
- eliminación o archivo
- permisos por rol
- manejo claro de errores y estados vacíos
- separación entre vista, lógica y datos
- reutilización de componentes comunes sin copiar pantallas completas

La aplicación debe construirse con componentes reutilizables y una capa clara de datos para que, si cambia el router, la IA solo ajuste la fuente de rutas sin rehacer el proyecto completo.

Debe poder crecer con nuevas pÃ¡ginas sin romper lo ya hecho.

## 8. Faltantes clave del sistema

La Academy debe incluir tambiÃ©n estas piezas para quedar completa y escalable:

### 8.1. Permisos y control de acceso

- matriz de permisos por rol y por acciÃ³n
- acceso total para administraciÃ³n
- acceso acotado para docente segÃºn cursos asignados
- acceso del alumno solo a su contenido, progreso y certificados
- control de lectura, creaciÃ³n, ediciÃ³n, publicaciÃ³n, eliminaciÃ³n y archivo

### 8.2. Modelo de datos mÃ­nimo

- cursos
- mÃ³dulos
- lecciones
- recursos
- tareas
- entregas
- inscripciones
- progreso
- certificados
- pagos o registros de pago
- usuarios y roles

### 8.3. Flujo de inscripciÃ³n

- entrada desde catÃ¡logo o landing
- registro o acceso
- compra o matrÃ­cula
- desbloqueo del curso
- continuidad de acceso
- seguimiento de estado de inscripciÃ³n

### 8.4. Flujo acadÃ©mico del alumno

- iniciar curso
- continuar lecciÃ³n
- marcar avance
- ver siguiente lecciÃ³n
- consultar recursos
- entregar tareas
- revisar certificados
- retomar donde quedÃ³

### 8.5. Tareas y evaluaciÃ³n

- crear tareas por lecciÃ³n o mÃ³dulo
- enviar entrega
- revisar entrega
- calificar o aprobar
- devolver observaciones
- manejar estados: pendiente, enviada, revisada, aprobada, devuelta

### 8.6. Certificados y finalizaciÃ³n

- emitir certificado por finalizaciÃ³n
- descargar certificado
- validar certificado
- mostrar estado de emisiÃ³n
- asociar certificado a curso y alumno

### 8.7. Recursos

- recursos por lecciÃ³n
- recursos globales del curso
- recursos descargables del alumno
- organizaciÃ³n por tipo: PDF, video, enlace, archivo, plantilla

### 8.8. Estados y calidad de uso

- estados de carga, vacÃ­o, error y Ã©xito
- contenido en borrador, revisiÃ³n, publicado y archivado
- feedback claro en cada acciÃ³n
- consistencia de comportamiento entre vistas

### 8.9. MÃ©tricas y trazabilidad

- progreso por alumno
- avance por curso
- finalizaciÃ³n y abandono
- actividad reciente
- historial bÃ¡sico de cambios

## 9. Sistema de navegación y descubrimiento

La Academy debe comportarse como una plataforma grande de aprendizaje, no solo como un conjunto de páginas sueltas.

### 9.1. Catálogo

- secciones de destacados, nuevos, recomendados y más vistos
- filtros por categoría, nivel, duración, precio, formato y estado
- ordenamiento por relevancia, novedades, popularidad y avance
- carga progresiva o paginación cuando haya muchos cursos
- cursos relacionados y sugeridos

### 9.2. Tarjetas de curso

- imagen o portada
- título
- instructor
- duración
- nivel
- precio o estado gratuito
- badge de destacado, nuevo o certificado
- progreso si el usuario ya está inscrito

### 9.3. Navegación multipágina

- barra de navegación clara por contexto: público, alumno, docente y admin
- breadcrumbs en cursos, módulos y lecciones
- navegación siguiente/anterior dentro del curso
- acceso rápido a continuar donde quedó el usuario

### 9.4. Curso como experiencia completa

- qué aprenderás
- requisitos
- para quién es
- contenido del curso
- instructor
- progreso
- certificado
- preguntas frecuentes
- cursos relacionados

### 9.5. Lección como experiencia completa

- índice lateral persistente o visible
- avance del módulo
- recursos sin salir de la lección
- transcripción o apoyo textual
- siguiente clase sugerida o automática
- estado de completado y reanudación

### 9.6. Continuidad del usuario

- continuar curso
- historial reciente
- recomendaciones según progreso o interés
- acceso rápido a cursos, recursos y certificados activos

### 9.7. Navbar y menús según estado de sesión

El navbar y los menús se adaptan según si hay sesión activa y el rol del usuario.

#### Invitado (sin sesión)

- Navbar con links de la web principal siempre visibles: Estudio, Sistemas digitales, Academy, Qaway Hub, Recursos, Blog, Proyectos
- CTA derecho: "Cuéntanos tu proyecto" (enlace a WhatsApp)
- Menú móvil: botón "Acceder" (`/acceder`)

#### Con sesión

- CTA derecho: botón "Mi Panel" con ruta según rol:
  - `student` → `/panel`
  - `teacher` / `editor` → `/docente`
  - `admin` / `support` → `/admin`

#### Menú desplegable del avatar (UserMenu)

Visible en los layouts autenticados (alumno, docente, admin y lección). Ítems según rol:

| Ítem | Ruta | Student | Teacher | Admin |
|---|---|---|---|---|
| Mi Aprendizaje | `/panel` | ✅ | ✅ | ✅ |
| Certificados | `/panel/certificados` | ✅ | ❌ | ❌ |
| Recursos | `/panel/recursos` | ✅ | ❌ | ❌ |
| Mis Compras | `/panel/compras` | ✅ | ✅ | ✅ |
| Configuración | `/panel/configuracion` | ✅ | ✅ | ✅ |
| Panel Docente | `/docente` | ❌ | ✅ | ❌ |
| Panel Admin | `/admin` | ❌ | ❌ | ✅ |
| Cerrar sesión | — | ✅ | ✅ | ✅ |

#### Guard de sesión

- Si el usuario ya está logueado y entra a `/acceder`, `/registro` o `/recuperar`, se redirige a su panel según rol.
- Cada área autenticada (alumno, docente, admin) tiene su propia barra lateral de navegación.

## 10. Recursos visuales y referencias

Para la creación inicial, se permite usar visuales de stock como referencia o apoyo, siempre que sirvan para acelerar la construcción del producto y no bloqueen el avance.

- las imágenes de stock pueden usarse para portadas, banners, cards o mockups mientras no exista material propio
- las referencias visuales pueden tomarse de plataformas ya posicionadas para orientar estructura y jerarquía
- el contenido final debe quedar preparado para sustituir stock por material propio sin rehacer la base

## 11. Seguridad y publicación

Antes de salir a producción, la Academy debe cubrir estos puntos:

### 11.1. Acceso y datos

- RLS activado en tablas sensibles
- roles bien separados entre publico, alumno, docente y admin
- ninguna clave secreta expuesta en el frontend
- datos privados protegidos por servidor o políticas

### 11.2. Pagos

- React no confirma pagos directamente
- el backend o webhook valida el pago
- la inscripcion se desbloquea solo despues de validacion segura
- el frontend solo muestra estado y resultado

### 11.3. Archivos

- recursos publicos y privados separados
- PDFs, videos y descargables premium en storage privado
- accesos temporales o controlados para material restringido

### 11.4. Revision antes de publicar

- rutas protegidas
- formularios validados
- dependencias revisadas
- permisos revisados
- claves revisadas
- errores tecnicos controlados
## 12. Reglas de edición

- Trabajar solo en este proyecto.
- No mezclarlo con otras academias, pruebas o versiones antiguas.
- No tocar otras carpetas de Qaway salvo que se indique expresamente.
- No duplicar pantallas que ya existan.
- No agregar páginas por intuición si no resuelven una necesidad real.
- Si una página ya existe, corregirla antes de crear otra.
- Si una función no se usa, eliminarla o dejarla claramente marcada.

## 13. Flujo de trabajo esperado

1. Revisar lo que ya existe.
2. Corregir lo que falta.
3. Completar páginas y rutas.
4. Validar experiencia de uso.
5. Ajustar diseño y contenido.
6. Repetir el ciclo hasta cerrar el objetivo.

## 14. Criterio de aceptación

El proyecto se considera bien encaminado cuando:

- el público puede navegar el catálogo y ver detalles
- el alumno puede entrar a su panel y continuar cursos
- el docente puede gestionar contenido y tareas
- el admin puede administrar usuarios y cursos
- el sistema está preparado para pagos y escalado
- el diseño se ve consistente y profesional
- no hay residuos que confundan el flujo

## 15. Notas para el agente

Si faltan páginas, se deben crear.
Si la estructura es mejorable, se puede mejorar sin romper el diseño base.
Si hay nuevas necesidades, pueden agregarse, siempre que respeten la independencia del proyecto.

## 16. Patrón arquitectónico: Layout Desacoplado con Inyección de Estado

La interfaz de Academy se estructura con un patrón de **Layout Desacoplado con Inyección de Estado** (State Lifting via Context API). En lugar de construir páginas enteras como un bloque único, la app se separa en piezas que se comunican mediante un "cerebro central" (un Context de React).

### 16.1. Las tres piezas del patrón

1. **La Carcasa (Shell/Layout)** — `src/layouts/LessonLayout.jsx`
   Contenedor maestro: dibuja el header (cabecera con perfil), el sidebar izquierdo (navegación de módulos/lecciones), los breadcrumbs y maneja el espacio. El layout **no sabe por sí mismo qué curso o lección se está viendo**: lo lee todo del contexto.

2. **El Contenido (Vista)** — `src/pages/student/Lesson.jsx`
   El reproductor del curso. Tan pronto como carga, toma la información vital (título de la lección, número, duración, progreso, estado de completado, paso activo) y la **inyecta hacia arriba** al contexto global con `setCourseSidebar(...)`.

3. **El Cerebro Central** — `src/contexts/CourseSidebarContext.jsx`
   Proveedor que expone `{ courseSidebar, setCourseSidebar }` vía Context API, con `useMemo` para estabilidad de referencia. Envuelve tanto al layout como a las vistas.

### 16.2. Cómo fluye la comunicación

- `Lesson.jsx` obtiene `setCourseSidebar` con `useCourseSidebar()` (tanto en `PublicLesson` como en `StudentLesson`).
- En un `useEffect`, cuando curso y lección están listos, inyecta el objeto completo: `visible`, `slug`, `coursePath`, `title`, `totalLessons`, `modules`, `currentLessonId`, `currentLessonTitle`, `currentLessonNumber`, `currentLessonDuration`, `completed`, `activeStep`, `setActiveStep`, `lessonSteps`.
- `LessonLayout.jsx` **escucha el contexto** y se actualiza instantáneamente: breadcrumbs arriba, tarjeta de progreso a la izquierda y módulos con la lección actual resaltada.
- El layout decide por sí mismo si el sidebar se muestra (`visible && modules.length > 0`) y qué contexto usa (`/cursos/:slug` público vs `/panel/cursos/:slug` alumno).

### 16.3. Especificidades técnicas verificadas

- **Cleanup al salir**: el `useEffect` de inyección retorna `() => setCourseSidebar(null)`. Al navegar fuera de la lección, la carcasa **se reinicia sola** — sin estados residuales entre lecciones.
- **Doble modo de acceso**: `PublicLesson` y `StudentLesson` usan el mismo patrón con `accessMode` distinto; el `coursePath` cambia entre público y panel.
- **Colapso desacoplado**: la lógica de colapsar el sidebar (`forceCollapse` / `collapsedModules`) vive en el layout y puede activarse desde cualquier parte del código vía el contexto.
- **Reutilización real**: `StudentLayout.jsx` también consume `CourseSidebarContext`, y existe `TeacherPreviewContext.jsx` con el mismo esquema — evidencia de que el patrón ya se replica dentro de la propia app.
- **Naming técnico**: el patrón mezcla *state lifting* (estado elevado al proveedor) con *Context API* (evita pasar por props). En términos de manual se conoce como *Lifted State via Context Provider (Shell/Content decoupling)*.

### 16.4. Beneficios

- **Alta reusabilidad**: el mismo layout puede servir a otras vistas (foro de estudiantes, panel, etc.) inyectando solo sus datos; la carcasa se adapta sola.
- **Componentes independientes (bajo acoplamiento)**: el reproductor no dibuja el header, y el header no calcula tiempos de video. Cada archivo hace una sola cosa bien.
- **Manejo de estados complejos**: colapso, modo enfoque, pasos de lección y progreso se controlan desde cualquier parte sin romper la interfaz.
- **Esqueleto modular**: piezas que se hablan entre sí mediante un intercomunicador central, en lugar de páginas "pegadas como un bloque de cemento".

