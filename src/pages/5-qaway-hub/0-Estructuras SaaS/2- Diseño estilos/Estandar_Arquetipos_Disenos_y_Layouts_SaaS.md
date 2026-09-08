# Estándar de Arquetipos de Diseño, Disposiciones de Layout y Estructura Home SaaS

**Versión:** 1.0  
**Ubicación:** `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/`  
**Objetivo:** Establecer la matriz de arquetipos visuales, layouts intercambiables y el protocolo de bienvenida/Home para aplicaciones web y SaaS desarrolladas en Qaway Lab.

---

## 1. Principio Fundamental: Desacoplamiento de Lógica y Presentación

> **Regla de oro:** La lógica de negocio, modelos de datos, estados y módulos operativos (CRM, tareas, posts, leads, Supabase) son completamente independientes del arquetipo visual y de la disposición del layout.

### ¿Por qué esta arquitectura?
1. **Adaptabilidad inmediata al cliente:** Si un cliente solicita un CRM o gestor de tareas pero lo percibe "demasiado tosco", "demasiado oscuro" o "muy denso", el sistema debe permitir cambiar el arquetipo visual o la disposición de barra (lateral vs. superior) sin reprogramar la lógica ni los componentes de datos.
2. **Cero pantallas huérfanas o desiertas:** Ninguna aplicación o proyecto debe arrancar con una tabla vacía, una pantalla básica sin navegación o una landing genérica descontextualizada.
3. **Escalabilidad modular:** Al estandarizar los "shells" (envoltorios de layout) y los tokens de diseño, cualquier aplicación nueva puede nacer directamente con un acabado premium de alta gama.

---

## 2. Fase 0: Cuestionario Guiado Obligatorio (Discovery Pre-Código)

Antes de escribir código o crear rutas para una nueva aplicación web o SaaS, la IA o el desarrollador debe plantear y resolver estas cuatro preguntas fundamentales:

```text
1. ¿Cuál es el dominio y propósito central de la aplicación?
   ├── Productividad / Tareas / Proyectos (ej. Plane, Asana)
   ├── Creadores / Media / Audio / IA (ej. Fish Audio, Content Studio)
   ├── Analítica Comercial / Ventas / Métricas (ej. CRM Qaway)
   └── Estrategia / Dossier / Formación por Etapas (ej. Studio OS)

2. ¿Cuál es la Acción Primaria (Core Loop) del usuario tras iniciar sesión?
   ├── ¿Crear un nuevo ítem (post, tarea, lead, guión)?
   ├── ¿Consultar un resumen o gráfica ejecutiva de métricas?
   └── ¿Continuar un flujo guiado paso a paso?

3. ¿Qué disposición de layout requiere el producto?
   ├── Preset A: Sidebar Lateral (Recomendado para apps con muchas vistas y módulos)
   └── Preset B: TopNav Superior (Recomendado para lienzos anchos, analítica densa o tablas)

4. ¿Qué arquetipo de diseño visual es el más adecuado para el perfil del usuario?
   ├── 1. Minimal Utilitarian (Linear / Plane.so Style)
   ├── 2. Vibrant Creative SaaS (Content Studio / Fish Audio Style)
   ├── 3. Executive High-Contrast (CRM Dark/Light Hybrid)
   └── 4. Structured Dossier & Stepper (Studio OS Style)
```

---

## 3. Disposiciones de Layout Intercambiables (Layout Shells)

La disposición de la navegación estructural se encapsula en dos envoltorios reutilizables:

```text
        OPCIÓN A: SIDEBAR LAYOUT                      OPCIÓN B: TOPNAV LAYOUT
┌─────────┬───────────────────────────────┐   ┌───────────────────────────────────────────┐
│         │ TopBar (Búsqueda, Perfil, CTA)│   │ TopBar (Logo | Menú Horizontal | Perfil)  │
│         ├───────────────────────────────┤   ├───────────────────────────────────────────┤
│ Sidebar │                               │   │                                           │
│ Lateral │       Lienzo Principal        │   │             Lienzo Principal              │
│ (Fijo/  │       de Trabajo              │   │             de Ancho Completo             │
│ Colaps) │                               │   │                                           │
│         │                               │   │                                           │
└─────────┴───────────────────────────────┘   └───────────────────────────────────────────┘
```

### 3.1. Preset A: Sidebar Layout (Vertical - Izquierda)
* **Estructura:**
  * **Barra lateral fija/colapsable (izquierda):** Logo corporativo, selector de espacio de trabajo o marca activa, navegación por módulos, proyectos pineados y panel de perfil/configuración en la base.
  * **Header superior (Top bar):** Migas de pan (breadcrumbs), buscador global rápido (`Cmd/Ctrl + K`), notificaciones y botón de acción principal (`+ Crear`).
* **Ideal para:** Aplicaciones con jerarquías profundas, múltiples herramientas, gestión de proyectos y flujos multifacéticos.

### 3.2. Preset B: TopNav Layout (Horizontal - Superior)
* **Estructura:**
  * **Barra superior única integrada:** Agrupa el logo a la izquierda, los enlaces de navegación principales centrados horizontalmente, y el buscador junto al perfil de usuario a la derecha.
  * **Lienzo principal libre:** Ocupa el 100% del ancho del viewport sin obstrucción lateral.
* **Ideal para:** Portales corporativos, tableros analíticos con gráficos panorámicos, tablas de datos masivas (data tables con muchas columnas) o vistas Kanban expandidas.

---

## 4. Catálogo de los 4 Arquetipos de Diseño (Design Skins)

Basado en las implementaciones validadas y el banco de capturas de Qaway Lab:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CATÁLOGO DE ARQUETIPOS SAAS                                │
├──────────────────────────────┬──────────────────────────────────────────────────────────┤
│ 1. Minimal Utilitarian       │ Inspirado en Plane.so / Linear                           │
│    (Studio Blog / Gelato)    │ Fondo neutro, bordes sutiles 1px, alta densidad y foco.  │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 2. Vibrant Creative SaaS     │ Inspirado en Fish Audio / Content Studio                 │
│    (Content Studio)          │ Sidebar saturado, tarjetas rounded-2xl, visual y ágil.   │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 3. Executive High-Contrast   │ Dark Sidebar + Light Canvas (CRM Qaway)                  │
│    (CRM Analítica)           │ Sidebar oscuro, KPIs vivos, métricas comerciales C-Level.│
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 4. Structured Dossier        │ Stepper por etapas y fichas técnicas (Studio OS)         │
│    (Studio OS Buyer Personas)│ Badges numerados, hero oscuro, tarjetas con edición lápiz│
└──────────────────────────────┴──────────────────────────────────────────────────────────┘
```

### Arquetipo 1: Minimal Utilitarian (Linear / Plane.so Style)
* **Referencias en el proyecto:** `Studio Blog`, `Gelato Gourmet SAC (Work Items)`.
* **Inspiración externa:** [Plane.so](https://plane.so/), Linear, Notion.
* **Características visuales:**
  * Paleta de fondos: Blancos puros (`#ffffff`) combinados con grises neutros de fondo (`#f8fafc` o `#f1f5f9`).
  * Delimitación: Bordes ultradelgados de 1px (`border-slate-200 / border-zinc-200`) sin sombras pesadas.
  * Tipografía y densidad: Jerarquías tipográficas sobrias, etiquetas compactas con estados (Borrador, En Progreso, Completado), avatares limpios y fechas relativas (`~5m`, `8 set`).
  * Botones: Estilo flat o contorno minimalista (`border border-slate-300 hover:bg-slate-100`).
* **Casos de uso recomendados:** Gestores de tareas técnicas, desarrollo de software, editores de blog/markdown, herramientas donde el contenido debe primar sobre el adorno.

---

### Arquetipo 2: Vibrant Creative SaaS (Fish Audio / Content Studio Style)
* **Referencias en el proyecto:** `Qaway Content Studio`.
* **Inspiración externa:** Fish Audio, Canva, plataformas creativas Web3/AI.
* **Características visuales:**
  * Sidebar protagónica: Color de marca vibrante y saturado en la barra lateral (ej. azul/violeta eléctrico `#4f46e5` o gradientes).
  * Geometría: Tarjetas de contenido con radios pronunciados (`rounded-2xl` o `rounded-3xl`).
  * Micro-interacciones y badges: Pills de estado con colores llamativos, barras de progreso circulares (`10% Tasks Done`), contadores y botones de acción tipo pastilla (`+ Nuevo Guión`).
* **Casos de uso recomendados:** Estudios de generación de contenido, herramientas de voz/audio con IA, suites de marketing y redes sociales, software B2C.

---

### Arquetipo 3: Executive High-Contrast (Dark/Light Hybrid)
* **Referencias en el proyecto:** `Qaway CRM Analítica Comercial`.
* **Inspiración externa:** Stripe Dashboard, Datadog, Salesforce moderno.
* **Características visuales:**
  * Contraste cromático: Sidebar lateral negro profundo (`#09090b` o `#0f172a`) contrastado con un lienzo de trabajo principal claro y diáfano.
  * Color de acento de marca: Naranja de alta energía (`#ff5722` / `#f97316`) reservado exclusivamente para métricas activas, llamadas a la acción primarias e indicadores clave.
  * Tarjetas de métricas (KPIs): Números en gran escala, comparativas de variación (`+14.2% vs. mes anterior`) y micro-gráficos sparkline lineales integrados en la tarjeta.
* **Casos de uso recomendados:** CRMs de ventas, paneles financieros, tableros de rendimiento comercial, analítica de embudos ManyChat y directivos.

---

### Arquetipo 4: Structured Dossier & Stepper (Studio OS Style)
* **Referencias en el proyecto:** `Studio OS (Buyer Personas & Slides Ejecutivos)`.
* **Inspiración externa:** Atlassian Confluence/Jira Discovery, sistemas de diagnóstico y consultoría técnica.
* **Características visuales:**
  * Sidebar con flujo secuencial: Elementos numerados con badges de colores específicos por etapa (`0. ADN Empresa`, `1. Buyer Personas`, `2. Objetivos SMART`, `3. Content Mapping`, etc.).
  * Banner Hero Contrastado: Encabezado oscuro en la parte superior del lienzo para enmarcar el módulo activo (`Resumen de tu buyer persona`), integrando acciones de exportación (`Ver Slide`, `Descargar / Exportar`).
  * Fichas de datos estructurados: Tarjetas en rejilla tipo "dossier" con campos editables en línea mediante iconos de lápiz (`edit in-place`), avatares circulares y listas de dolores/soluciones.
* **Casos de uso recomendados:** Herramientas de consultoría, generadores de estrategia, configuración guiada de empresas, asistentes de compliance o auditorías paso a paso.

---

## 5. Estructura Canónica Obligatoria de la Portada (Home Workspace)

Toda portada o pantalla de bienvenida inicial de una aplicación SaaS en Qaway Lab (inspirada en las mejores prácticas de **Asana, Fish Audio y Atlassian Home**) debe estructurarse obligatoriamente con estos 5 bloques funcionales:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. BANNER DE BIENVENIDA Y SALUDO CONTEXTUAL                                            │
│    "Martes, 8 de Septiembre — Buenos días, Carlos"  |  KPIs rápidos de la semana       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. ACCESOS RÁPIDOS A CREACIÓN (Quick Actions / Core Loop)                               │
│    [ + Nuevo Proyecto ]      [ + Subir Audio / Crear ]      [ + Nueva Tarea / Lead ]    │
├─────────────────────────────────────────────────────────────┬───────────────────────────┤
│ 3. TRABAJO ACTIVO / RECIENTE                                │ 4. ONBOARDING & TUTORIALES│
│    • Proyecto Alfa (75% avance)                             │    • Guía de inicio (3m)  │
│    • Post "Automatizar WhatsApp..." (En redacción)          │    • Video tutorial       │
│    *(Si está vacío: Empty state guiado con botón de inicio)*│    • Soporte y comunidad  │
└─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

### Los 5 Bloques Explicados:
1. **Saludo y Contexto Temporal:** Fecha del día + saludo personalizado con el nombre del usuario logueado. Humaniza la interfaz y orienta al usuario en el tiempo.
2. **Acciones Primarias Inmediatas:** Las 2 o 3 operaciones más frecuentes del producto colocadas a 1 solo clic en tarjetas destacadas en la parte superior.
3. **Contenedor de Actividad Reciente / Pendientes:** Resumen de los últimos ítems en los que el usuario trabajó (tareas, proyectos, borradores).
4. **Manejo Proactivo de Estados Vacíos (Empty States):** Si el usuario es nuevo y no tiene datos, **nunca dejar el área en blanco**. Mostrar ilustración, mensaje inspirador y botón directo de acción (*"Comienza tu viaje creando tu primer proyecto"*).
5. **Módulo de Autoservicio y Aprendizaje:** Carrusel o lista lateral de guías breves (*"Primeros pasos"*, *"Atajos de teclado"*, *"Tutoriales"*), reduciendo la curva de fricción de la aplicación.

---

## 6. Referencia a los Recursos y Capturas de Estudio

Para consultar las capturas de pantalla reales que respaldan este estándar, revisar los subdirectorios locales en `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/`:
* `Assana/`: Referencias completas de paneles de tareas, calendarios, planificación de lanzamientos y estructura de dashboards de productividad.
* `Fish Studio/`: Referencias de plataformas de creación multimedia e IA, herramientas de voz y navegación creativa.
* `Treelo/`: Referencias del portal Atlassian Home, cards de aplicaciones integradas y flujos de espacios de trabajo.
