# Estándar Maestro de Arquitectura, Paneles, Encabezados y Estilos SaaS

**Versión:** 2.0 (Auditoría Profunda de Portadas y UX Comparativa)  
**Ubicación:** `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/`  
**Objetivo:** Establecer la especificación canónica y exhaustiva de diseño, interacción, anatomía de paneles, encabezados multiusuario y estilos visuales para cualquier aplicación web o SaaS de Qaway Lab.

---

## 1. Principio Fundamental: Desacoplamiento Lógica vs. Presentación

> **Regla inviolable:** El núcleo funcional (modelos de datos, autenticación, Supabase, estados globales, CRUD y lógica de negocio) es completamente agnóstico de la piel visual (*Skin*) y del chasis de navegación (*Layout Shell*).

* **Intercambiabilidad de estilo (*Theme/Skin Swap*):** Si un cliente considera un módulo "demasiado tosco", "demasiado oscuro" o "muy denso", debe ser posible conmutar entre los arquetipos visuales aprobados sin rehacer la lógica de la aplicación.
* **Flexibilidad de disposición (*Layout Swap*):** Capacidad de alternar entre navegación lateral (Sidebar) y navegación superior (TopNav) reutilizando los mismos componentes de datos.
* **Cero pantallas huérfanas:** Ninguna aplicación puede iniciarse como una pantalla vacía, una tabla cruda o una landing básica descontextualizada. La aplicación nace con su chasis de navegación, cabecera de usuario y portada modular activa.

---

## 2. Fase 0: Cuestionario de Arranque (Discovery Pre-Código)

Antes de crear rutas o componentes, la IA o el desarrollador debe definir:

```text
1. DOMINIO Y PROPÓSITO:
   ├── Productividad / Tareas / Proyectos (ej. Plane.so, Asana)
   ├── Creadores / Media / Audio / IA (ej. Fish Audio, Content Studio)
   ├── Analítica Comercial / CRM / Ventas (ej. CRM Qaway)
   └── Estrategia / Dossier / Flujo por Etapas (ej. Studio OS)

2. CORE LOOP Y ACCIÓN PRIMARIA:
   ├── ¿Qué acción núcleo realiza el usuario al entrar? (+ Tarea, + Lead, + Audio, + Post)
   └── ¿Qué vista necesita primero? (Home modular, Tablero Kanban, Métricas o Lista)

3. DISPOSICIÓN Y COMPLEJIDAD DE PANELES:
   ├── Sidebar Simple Colapsable (Menú único con iconos y textos)
   ├── Doble Panel / Dual-Rail (Rail primario estrecho + panel secundario de proyectos/filtros)
   └── TopNav Superior (Lienzo ancho completo para tablas masivas o dashboards horizontales)

4. ARQUETIPO DE DISEÑO VISUAL:
   ├── 1. Minimal Utilitarian (Linear / Plane.so Style)
   ├── 2. Vibrant Creative SaaS (Fish Audio / Content Studio Style)
   ├── 3. Executive High-Contrast (CRM Dark/Light Hybrid)
   └── 4. Structured Dossier & Stepper (Studio OS Style)
```

---

## 3. Anatomía y Mecánica Obligatoria del Panel Izquierdo (Sidebar)

> **Requisito de arquitectura:** La aplicación **debe estar preparada desde el inicio para contar con panel izquierdo**. No es una adición opcional posterior; el chasis base de la aplicación se programa para soportarlo.

```text
      [MODO EXPANDIDO]               [MODO COLAPSADO]                [DOBLE PANEL (DUAL-RAIL)]
┌───────────────────────────┐       ┌──────┐              ┌──────┬───────────────────────┐
│ [Logo]         [Toggle <] │       │ [Logo│              │ Rail │ Subpanel Secundario   │
├───────────────────────────┤       ├──────┤              │ Prim.│ (Proyectos/Carpetas)  │
│ [Selector de Workspace v] │       │ [W]  │              ├──────┼───────────────────────┤
├───────────────────────────┤       ├──────┤              │ [H]  │ • Proyecto Alfa       │
│ • Inicio                  │       │  🏠  │  (Hover →    │ [T]  │ • Proyecto Beta       │
│ • Mis Tareas          [3] │  ──>  │  ✓   │   Tooltip    │ [P]  │ • Campaña Setiembre   │
│ • Proyectos               │       │  📁  │   Flotante)  │ [M]  │                       │
│ • Analítica               │       │  📊  │              │      │ [ + Crear Proyecto ]  │
├───────────────────────────┤       ├──────┤              ├──────┴───────────────────────┤
│ [Perfil / Trial / Info]   │       │ [👤] │              │ [Configuración / Soporte]     │
└───────────────────────────┘       └──────┘              └──────────────────────────────┘
```

### 3.1. Fijación de Pantalla y Scroll Independiente (Viewport Locking)
* **Contenedor raíz fijo:** La estructura general del aplicativo implementa `h-screen overflow-hidden`.
* **Prohibido el scroll global de la barra:** El panel izquierdo jamás se desplaza verticalmente junto al cuerpo de la página. Permanece anclado a la izquierda.
* **Scroll local (`overflow-y: auto`):** Si la lista de proyectos, canales o carpetas excede la altura de la pantalla, el panel activa su propio scroll interno con scrollbar estilizado y discreto (`scrollbar-thin`).

### 3.2. Estados del Panel Izquierdo:
1. **Estado Expandido (~240px - 280px):** Muestra el logo, conmutador de marca/espacio, nombres de módulos con contadores numéricos (badges) y subsecciones jerárquicas con flechas desplegables.
2. **Estado Colapsado (~64px - 72px):** Se activa mediante botón toggle (`<` o hamburguesa `=`). Se compacta mostrando únicamente la columna vertical de iconos.
   * **Interacción Hover / Flyout:** Al posicionar el cursor sobre un icono colapsado, se despliega un **tooltip o flyout flotante** con el nombre del módulo, atajo de teclado y opciones secundarias directas.
3. **Variante Doble Panel (Dual-Rail / Multi-Pane):**
   * **Rail Primario (Fino, ~64px):** Iconos de navegación global (*Inicio, Proyectos, Agentes, Estrategia, Ajustes*).
   * **Rail Secundario (Contextual, ~200px):** Árbol de trabajo del módulo activo (ej. lista de tableros de Trello, proyectos en curso en Asana o categorías del Blog).
   * El rail secundario puede replegarse independientemente dejando visible únicamente el rail primario.
4. **Comportamiento en Móvil (`< 768px`):** Se transforma en un *drawer* flotante superpuesto con desenfoque de fondo (`backdrop-blur-sm bg-black/40`), cerrándose al pulsar fuera o seleccionar una ruta.

---

## 4. Anatomía y Funciones del Encabezado Global (TopBar / Header)

El encabezado superior orquesta la identidad del usuario, la búsqueda transversal y las acciones globales del sistema:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡] [Logo] [Espacio de Trabajo v]   |   [🔍 Buscar (Ctrl+K)]   |  [+ Crear] [🔔] [⚙] [👤▾]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Zona Izquierda: Contexto y Multiusuario
* **Botón Toggle de Menú:** Disparador para colapsar o expandir el panel lateral.
* **Selector Multi-Tenant / Marca / Espacio de Trabajo:** Dropdown que permite alternar entre empresas, clientes o marcas activas (ej. *"Qaway Lab (Digital Studio)"* vs. *"Marca Cliente SAC"* con botón `+ Nuevo Espacio`).
* **Selector de Aplicaciones (App Grid 3x3):** Icono de matriz de 9 puntos (estilo Atlassian/Google) para brincar entre aplicaciones del ecosistema (CRM, Editor de Blog, Academy, Pagos).

### 4.2. Zona Central: Búsqueda Global Omnibox
* Campo de búsqueda estilizado con icono de lupa y atajo visible (`Cmd+K` o `Ctrl+K`).
* Permite buscar transversalmente tareas, proyectos, contactos, posts y comandos rápidos desde cualquier pantalla.

### 4.3. Zona Derecha: Acciones del Sistema y Perfil de Usuario
* **Botón Primario de Acción Rápida (`+ Crear`):**
  * Botón de alto contraste (píldora o rectángulo redondeado).
  * Admite clic directo o menú desplegable para elegir qué crear (*Nueva Tarea, Nuevo Proyecto, Nuevo Lead, Nuevo Post*).
* **Centro de Notificaciones (Campana `🔔`):**
  * Icono con badge numérico en tiempo real.
  * Al hacer clic, abre un panel lateral o flotante con menciones, avisos del sistema y cambios de estado.
* **Configuración Rápida y Soporte (`⚙` / `?`):** Enlaces directos a documentación, atajos de teclado y ayuda.
* **Ficha y Dropdown de Perfil de Usuario (`[👤▾]`):**
  * Muestra el avatar del usuario (foto o iniciales con color identificador) + Nombre completo + Rol corporativo (ej. *"Andrés Valencia — Director Comercial"* o *"Leo Sandoval — Director Creativo"*).
  * **Menú desplegable de cuenta:**
    * Resumen del usuario y correo corporativo.
    * Estado de la cuenta o suscripción (ej. *"Prueba gratuita: 14 días restantes"*).
    * Mi perfil / Datos personales.
    * Conmutador de tema visual (Claro / Oscuro / Sistema).
    * Configuración de la organización / Facturación.
    * Enlace destructivo: **Cerrar sesión** (`text-red-500`).

---

## 5. Anatomía del Lienzo Central (Main Canvas) y Vistas de Trabajo

El panel central es el área operativa donde se despliegan los datos. Cuenta con una barra de contexto y control antes de renderizar los contenidos:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Migas de pan: Qaway Lab / Hub Central / Studio Blog                                     │
│                                                                                         │
│ TÍTULO DE LA VISTA (H1)  [Badge Estado]                           [Acción Contextual]   │
│                                                                                         │
│ [Lista]  [Tablero Kanban]  [Calendario]  [Métricas]  [Archivos]                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Barra de Filtros: [Todas] [Próximas] [Retrasadas] | [Ordenar por v] [Filtrar] [🔍 Buscar]│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ ● EN PROGRESO (2)                                                                       │
│   [ ] QW-104  Maquetación Hero + Catálogo 60 FPS      [URGENTE]  [Antigravity]  [27 Ago] │
│   [ ] QW-105  Integración Checkout WhatsApp            [ALTA]     [Antigravity]  [28 Ago] │
│                                                                                         │
│ ● COMPLETADO (3)                                                                        │
│   [✓] QW-101  Discovery y Requerimientos Comerciales   [URGENTE]  [Leo S.]       [19 Ago] │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Subheader de Navegación y Contexto
* **Breadcrumbs (Migas de Pan):** Indican la ubicación jerárquica exacta para no perder el contexto.
* **Título de la sección con metadatos:** Título descriptivo acompañado de contadores (`Mostrando 6 de 6 artículos`), badges de entorno o estado del proyecto.
* **Switcher de Vistas (View Tabs):** Pestañas que permiten conmutar la forma de ver la misma información sin recargar la página:
  * *Vista Lista (Table/List)*: Para edición rápida y alta densidad.
  * *Vista Tablero (Kanban)*: Para mover tarjetas entre columnas de estado.
  * *Vista Calendario / Cronograma*: Para seguimiento temporal de fechas de entrega.
  * *Vista Métricas / Dashboard*: Para gráficas y analítica agregada.

### 5.2. Barra de Filtros y Segmentación Secundaria
* Filtros de segmento rápido: Botones tipo pill (`Próximas | Con retraso | Finalizadas` o `Borradores | Publicados`).
* Controles de ordenamiento y agrupación: Dropdowns para ordenar por fecha, prioridad o agrupar por responsable.
* Buscador local reactivo: Filtrado instantáneo por texto en el listado visible.

### 5.3. Densidad de Datos y Estados
* Las filas o tarjetas combinan: Checkbox de selección, identificador único de ticket (`QW-104`, `POST-01`), thumbnail/icono, título legible, etiquetas de categoría/prioridad (`URGENTE`, `ALTA`), responsable asignado, fecha de vencimiento y menú contextual de acciones (`Editar`, `Eliminar`, `Duplicar`).

---

## 6. Catálogo de los 4 Arquetipos Visuales (Design Skins)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               CATÁLOGO DE ESTILOS SAAS                                  │
├──────────────────────────────┬──────────────────────────────────────────────────────────┤
│ 1. Minimal Utilitarian       │ Plane.so / Linear Style                                  │
│    (Studio Blog / Gelato)    │ Blanco/gris neutro, bordes 1px, tipografía sobria y foco.│
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 2. Vibrant Creative SaaS     │ Fish Audio / Content Studio Style                        │
│    (Content Studio)          │ Sidebar saturado, tarjetas rounded-2xl, badges vivos.    │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 3. Executive High-Contrast   │ CRM Qaway (Dark/Light Hybrid)                            │
│    (CRM Analítica)           │ Sidebar negro profundo, lienzo claro, acentos naranja.   │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 4. Structured Dossier        │ Studio OS (Buyer Personas / Atlassian)                   │
│    (Studio OS)               │ Stepper con badges de color, banner hero oscuro y fichas.│
└──────────────────────────────┴──────────────────────────────────────────────────────────┘
```

### Arquetipo 1: Minimal Utilitarian (Linear / Plane.so Style)
* **Referencias:** `Studio Blog`, `Gelato Gourmet SAC (Work Items)`.
* **Inspiración:** [Plane.so](https://plane.so/), Linear.
* **Claves visuales:** Bordes precisos de 1px (`border-slate-200`), fondo blanco limpio, tipografía compacta, densidad alta, ausencia de sombras pesadas, botones de contorno discreto.
* **Aplicación ideal:** Herramientas para desarrolladores, gestores de tareas técnicas, repositorios y editores editoriales.

### Arquetipo 2: Vibrant Creative SaaS (Fish Audio / Content Studio Style)
* **Referencias:** `Qaway Content Studio`.
* **Inspiración:** Fish Audio, Canva.
* **Claves visuales:** Barra lateral con color de marca sólido y saturado (azul/violeta eléctrico), tarjetas con bordes generosos (`rounded-2xl` o `rounded-3xl`), gráficos circulares de progreso, badges de estado en tonos pastel luminosos.
* **Aplicación ideal:** Estudios de creación de contenido, suites de marketing, plataformas de IA generativa de audio o video.

### Arquetipo 3: Executive High-Contrast (Dark/Light Hybrid)
* **Referencias:** `Qaway CRM Analítica Comercial`.
* **Inspiración:** Stripe Dashboard, Datadog.
* **Claves visuales:** Sidebar lateral en negro o grafito profundo (`#09090b`), lienzo de trabajo en gris muy claro (`#f8fafc`), y naranja corporativo Qaway (`#ff5722`) como único acento en botones clave, indicadores y sparklines de rendimiento.
* **Aplicación ideal:** CRMs de ventas, paneles financieros, tableros de control directivo.

### Arquetipo 4: Structured Dossier & Stepper (Studio OS Style)
* **Referencias:** `Studio OS (Buyer Personas & Slides Ejecutivos)`.
* **Inspiración:** Atlassian Confluence, Jira Discovery.
* **Claves visuales:** Barra lateral con pasos numerados (`0. ADN Empresa`, `1. Buyer Personas`, `2. Objetivos SMART`) con badges de colores individuales; encabezado hero de contraste oscuro para delimitar la sección activa; fichas de datos con botones de edición directa in-place (icono lápiz).
* **Aplicación ideal:** Generadores de estrategia comercial, diagnóstico de empresas, asistentes de onboarding y configuración guiada.

---

## 7. Estructura Canónica de Portada (Home Workspace) y Onboarding

Toda pantalla inicial o Home post-login implementa obligatoriamente la arquitectura de 5 zonas observada en **Asana, Fish Audio y Atlassian**:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. BANNER DE BIENVENIDA CONTEXTUAL                                                      │
│    "Martes, 8 de Septiembre — Buenos días, Carlos"  |  KPIs rápidos: 0 tareas / 0 colab.│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. ACCESOS DIRECTOS DE CREACIÓN (Quick Launch / Core Loop)                              │
│    [ + Nuevo Proyecto ]      [ + Subir Audio / Crear ]      [ + Nueva Tarea / Lead ]    │
├─────────────────────────────────────────────────────────────┬───────────────────────────┤
│ 3. TRABAJO ACTIVO / RECIENTE                                │ 4. RECURSOS Y ONBOARDING  │
│    • Proyecto Gelato Gourmet (75% avance)                   │    • Primeros pasos (3m)  │
│    • Borrador Post WhatsApp (En redacción)                  │    • Automatización (15m) │
│    *(Si está vacío: Empty State ilustrado con botón CTA)*   │    • Soporte y comunidad  │
└─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

1. **Saludo y Contexto Temporal:** Fecha dinámica + saludo humano personalizado con el nombre del usuario.
2. **Acciones Rápidas de Creación:** Los 2 o 3 botones principales de creación inmediata para que el usuario empiece a producir sin navegar por menús.
3. **Trabajo Activo / Reciente:** Contenedores modulares que resumen los últimos proyectos, tareas o contenidos abordados.
4. **Empty States Proactivos:** Si no hay datos, **jamás mostrar un área vacía o desértica**. Presentar un contenedor con ilustración, texto de acompañamiento y botón de acción (*"Aún no tienes proyectos creados. Comienza creando el primero"*).
5. **Autoservicio y Aprendizaje:** Carrusel o cuadrícula de guías de inicio (*"Aprende a usar la herramienta"*, *"Tutoriales"* con indicadores de duración como `3 min` o `15 min`), reduciendo a cero la frustración de nuevos usuarios.

---

## 8. Catálogo de Recursos Visuales de Referencia (Carpetas Locales)

Las capturas y pantallas reales que sustentan este documento se encuentran en este mismo directorio:
* `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/Assana/`: Paneles de tareas, tableros Kanban, planificador de lanzamientos, vistas de calendario y estructura de navegación lateral.
* `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/Fish Studio/`: Plataformas de creación multimedia con IA, accesos rápidos de herramientas y reproductores.
* `src/pages/5-qaway-hub/0-Estructuras SaaS/2- Diseño estilos/Treelo/`: Portal de bienvenida Atlassian Home, tableros Trello con mapas y vistas multi-pantalla.

---

## 9. Anatomía Canónica del Portal de Ingreso / Login SaaS

Todo login de aplicaciones Qaway Lab debe incluir estas funcionalidades obligatorias:

### 9.1. Funcionalidades Obligatorias (En orden de prioridad)

1. **Autenticación Social (OAuth):** Botones de acceso rápido a 1 clic con proveedores externos (`Google`, `Microsoft`). Elimina fricción y contraseñas débiles.

2. **Ver / Ocultar Contraseña:** Botón toggle con icono de ojo (`Eye` / `EyeOff`) integrado al campo de contraseña. Permite al usuario verificar lo que escribe y evitar errores de tipeo silenciosos.

3. **Recuperación de Contraseña:** Enlace `¿Olvidaste tu contraseña?` que dispara flujo de reseteo por correo (Supabase `resetPasswordForEmail`). Sin esto el usuario queda bloqueado sin salida propia.

4. **Persistencia de Sesión ("Recordarme"):** Checkbox que controla si la sesión se mantiene activa al cerrar el navegador. Da control al usuario sobre privacidad en equipos compartidos.

5. **Switcher de modo (Login / Solicitar Acceso):** Enlace inferior que informa al usuario qué hacer si no tiene cuenta aún (`Solicita acceso a tu administrador` o `Regístrate`).

6. **Prueba Social / Logos de Clientes:** Sección de logos de empresas o proyectos que usa la plataforma. Genera confianza y percepción de valor antes de ingresar.

### 9.2. Estructura de Layout del Login (Dos Columnas en Desktop)

```text
┌──────────────────────────┬─────────────────────────────────────────┐
│   PANEL IZQUIERDO        │   PANEL DERECHO                         │
│   Branding & Propuesta   │   Formulario de Acceso                  │
│                          │                                         │
│   • Logo                 │   [ G  Continuar con Google ]           │
│   • Titular de valor     │   [ 🪟 Continuar con Microsoft ]        │
│   • Descripción          │   ────────── o con correo ──────────    │
│   • Sello de seguridad   │   Email (con validación en tiempo real) │
│                          │   Contraseña         [ 👁 Ver/Ocultar ] │
│                          │   [✓ Recordarme]  [¿Olvidaste tu clave?]│
│                          │   [ → Ingresar al Hub ]                 │
│                          │   [¿No tienes cuenta? Solicita acceso]  │
│                          │   ── Logos de proyectos / confianza ──  │
└──────────────────────────┴─────────────────────────────────────────┘
```

### 9.3. Referencia de Implementación
* Archivo de implementación: `src/pages/auth/LoginPage.jsx`
* Proveedor de Auth: Supabase Auth (con soporte OAuth Google/Microsoft configurado en el proyecto Supabase)

---

## 10. Anatomía Canónica del Menú de Perfil y Cuenta (Profile & Account Dropdown)

Inspirado en el estándar de oro de **Atlassian / Trello**, el menú de perfil desplegable al hacer clic en el avatar del usuario debe organizarse en **6 bloques lógicos obligatorios**:

### 10.1. Diagrama de Arquitectura del Menú

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. IDENTIDAD DE CUENTA                                      │
│    [Avatar CO]  Carlos Enrique Sandoval Ocaña               │
│                 ce.sandovaloc@gmail.com                     │
│    • Cambiar cuentas (Soporte multi-cuenta)                 │
│    • Gestionar cuenta [↗] (Seguridad global / 2FA)          │
├─────────────────────────────────────────────────────────────┤
│ 2. PREFERENCIAS DEL PRODUCTO Y CONFIGURACIÓN                │
│    • Perfil y visibilidad pública                           │
│    • Actividad (Historial propio y registro de cambios)     │
│    • Mis elementos asignados (Tareas / Proyectos / Leads)   │
│    • Ajustes locales de la herramienta                      │
│    • Configuración de IA (Copilot / Automatizaciones)       │
│    • Laboratorios [Badge Beta] (Funciones experimentales)   │
├─────────────────────────────────────────────────────────────┤
│ 3. CONMUTADOR DE TEMA VISUAL (Submenú con Mini-Previews)    │
│    • Tema ▸  ┌──────────────────────────────────────────┐   │
│              │ (•) [Miniatura UI] Luz                   │   │
│              │ ( ) [Miniatura UI] Oscuro                │   │
│              │ ( ) [Miniatura UI] Equivalente al sistema│   │
│              └──────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ 4. ACCIÓN DE ORGANIZACIÓN / ESPACIOS                        │
│    • [👥] Crear Espacio de trabajo                          │
├─────────────────────────────────────────────────────────────┤
│ 5. RECURSOS Y PRODUCTIVIDAD                                 │
│    • Ayuda / Documentación y soporte                        │
│    • Accesos directos de teclado (Modal de atajos / Hotkeys)│
├─────────────────────────────────────────────────────────────┤
│ 6. SALIDA DEL SISTEMA                                       │
│    • Cerrar sesión (Enlace destructivo con confirmación)    │
└─────────────────────────────────────────────────────────────┘
```

### 10.2. Los 6 Bloques Explicados

1. **Cabecera de Identidad:**
   * Avatar con foto o iniciales de alto contraste (`CO`) + indicador de estado activo.
   * Nombre completo y correo electrónico corporativo visible.
   * **Multi-cuenta ("Cambiar cuentas"):** Permite conmutar entre diferentes perfiles autorizados sin tener que salir y volver a escribir credenciales.
   * **Gestionar cuenta [↗]:** Enlace externo para administrar contraseñas, doble factor (2FA) y facturación global.

2. **Preferencias del Producto & Configuración:**
   * **Perfil y visibilidad:** Controla cómo otros miembros del equipo ven tu usuario.
   * **Actividad:** Log de acciones recientes realizadas por el usuario.
   * **Configuración de IA:** Panel de control para llaves de API de modelos, tono del asistente y permisos de automatizaciones.
   * **Laboratorios [Badge Beta]:** Interruptor (*Feature Flags*) para probar características en fase experimental.

3. **Conmutador de Tema con Mini-Ilustraciones:**
   * Submenú desplegable en cascada (*Flyout*) que muestra miniaturas visuales de la interfaz en los 3 modos: **Luz**, **Oscuro** y **Equivalente al sistema**.

4. **Acción de Organización:**
   * Botón directo para crear una nueva organización, cliente o espacio de trabajo compartido.

5. **Recursos de Productividad:**
   * Centro de ayuda y soporte.
   * **Accesos directos de teclado:** Disparador del modal interactivo con la lista de atajos (`Ctrl+K`, `Shift+?`, etc.).

6. **Salida del Sistema:**
   * Botón inferior aislado con divisor, tipografía en tono neutro o destructivo (`text-red-400 hover:bg-red-500/10`), que limpia tokens de sesión y redirige al login.

### 10.3. Reglas Técnicas de Implementación Probadas (Patrón Qaway Academy)
Extraído de la implementación en producción de `UserMenu.tsx` y `StudentLayout.tsx`:
1. **Algoritmo `formatShortName` (Prevención de desbordamiento en Header):**
   * Si el usuario entra con correo (`ce.sandovaloc@gmail.com`), extrae la parte local y capitaliza (`Ce.sandovaloc`).
   * Si entra con nombre completo (`Carlos Enrique Sandoval Ocaña`), lo transforma al estándar ejecutivo: `Carlos S.` (Nombre + Inicial del primer apellido).
2. **Monograma Tipográfico Dinámico (`getInitial`):**
   * Genera el avatar con la primera letra en mayúscula sobre fondo de color corporativo de contraste (`bg-primary-100 text-primary-700`).
3. **Inyección Condicional de Rutas según Rol (*Role-Based Links*):**
   * Si `profile.role === 'admin'`: Inyecta el acceso directo al `Panel Admin` con icono vectorial `[Icon: Lock]`.
   * Si `profile.role === 'teacher'`: Inyecta el acceso al `Panel Docente` con `[Icon: FileText]`.
   * Si `profile.role === 'student'`: Muestra secciones de *Certificados* y *Recursos*.
4. **Accesibilidad y Cierre Seguro:**
   * **Click-Outside Listener:** Cierra automáticamente el menú si el usuario hace clic fuera de su contenedor.
   * **Escape Key Listener:** Cierra inmediatamente al pulsar la tecla `Esc` (requisito de accesibilidad WCAG).
5. **Micro-interacción de Apertura:**
   * El icono chevron rota 180° fluidamente (`rotate-180 transition-transform duration-200`).
   * El contenedor del menú utiliza animación de entrada limpia: `animate-in fade-in slide-in-from-top-2 duration-150`.

---

## 11. Orquestación del Ecosistema: App Switcher ("Waffle"), Retorno a Web y Espacios de Trabajo

Para que el usuario pueda transitar libremente entre el sitio público de Qaway Lab y las diferentes aplicaciones del Hub sin perder el estado de su trabajo, se establece el siguiente estándar de orquestación:

### 11.1. El Lanzador de Aplicaciones Híbrido y la Tríada de Navegación Superior
Para no depender exclusivamente de la intuición del usuario ni generar ambigüedades, la cabecera superior izquierda implementa la **Tríada de Navegación Inteligente** con micro-interacciones suaves de hover:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [::: ⤹ Apps]  [Qaway Lab ⤹ Web]  [Icon:Home Inicio] / [Submódulo]  ...  [Icon:Search] [Usuario]│
└──────┬───────────────┬──────────────────────┬───────────────────────────────────────────────────┘
       │               │                      │
       │               │                      └──► 3. Icono Casa (Home): Inicio de la MISMA APP activa
       │               │                           (ej. Portada del Blog si estás en Blog)
       │               │
       │               └──► 2. Logo Qaway Lab: Retorno seguro a la WEB PÚBLICA (qaway.pe)
       │                       (Feedback visual sutil "Ir a web principal")
       │
       └──► 1. Icono de 9 Puntos (Waffle): Conmutador de ECOSISTEMA
               (Microinteracción: al pasar el mouse, se expande suavemente el texto "Apps")
```

#### Reglas de Interacción y Física de Animación (Motion Protocol):
1. **Icono de 9 Puntos (`[:::]`):**
   * **En reposo:** Icono compacto de 9 puntos (Vector SVG).
   * **Al pasar el mouse (*Hover*):** Se expande suavemente hacia la derecha revelando la etiqueta `"Apps"` o `"Ecosistema"` mediante una transición desacelerada (`transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1)`), eliminando cualquier salto tosco. Al hacer clic, despliega el menú flotante con todas las herramientas del Hub.
2. **Logo `Qaway Lab`:**
   * Al pasar el mouse, despliega una indicación suave de retorno (*"Web Principal qaway.pe"*). Permite explorar la web sin cerrar ni resetear la sesión del Hub.
3. **Icono de Casa (`Home` Inicio):**
   * **Es el inicio local de la aplicación activa:** Si el usuario está redactando un artículo en el *Editor de Blog*, el icono `Home` lo regresa a la portada/lista del Blog; si está en el *CRM*, lo regresa al Dashboard Comercial del CRM. No sale de la herramienta.

```text
┌──────────────────────────────────────────────────┐
│ MENÚ FLOTANTE DEL ECOSISTEMA (Al pulsar [:::])   │
├──────────────────────────────────────────────────┤
│ PORTALES GLOBALES                                │
│ • [Icon: Globe] Web Pública Principal (qaway.pe) │
│ • [Icon: LayoutGrid] Hub Central de Aplicaciones │
├──────────────────────────────────────────────────┤
│ TUS APLICACIONES ACTIVAS                         │
│ • [Icon: FileEdit] Editor de Blog                │
│ • [Icon: BarChart3] CRM Comercial                │
│ • [Icon: Kanban] Gestor de Proyectos             │
│ • [Icon: Video] Content Studio                   │
│ • [Icon: GraduationCap] Academy                  │
│ • [Icon: CreditCard] Pagos & Facturación         │
└──────────────────────────────────────────────────┘
```

### 11.2. Módulo de Plantillas Interactivas (Interactive Template Hero)
* En lugar de banners estáticos, la portada de cada herramienta puede incorporar un carrusel o fila de **plantillas listas para usar** con mini-previews visuales (ej.: *Plantilla Kanban, Plantilla Scrum, Plantilla Calendario Editorial*).
* Permite al usuario clonar una estructura base en 1 segundo.
* Incluye botón de descarte (`[x]`) para no saturar a usuarios avanzados.

### 11.3. Grid de Espacios de Trabajo con Quick-Create Card Integrada
* Las tarjetas de proyectos o tableros utilizan portadas con degradados visuales o miniaturas de contenido.
* **Tarjeta de creación en el mismo flujo:** El botón **`[ + Crear nuevo... ]`** se renderiza como la última tarjeta de la cuadrícula con un borde interactivo destacado (`border-dashed border-2 hover:border-solid`), garantizando fricción cero al añadir trabajo.

---

## 12. Regla de Oro de Iconografía y Activos Visuales (Zero-Emoji Policy)

> **Política estricta de diseño Qaway Lab:** Queda **terminantemente prohibido el uso de emojis Unicode como iconos de interfaz** en cualquier producto, dashboard o portal. El uso de emojis en interfaces degrada la percepción de marca y denota estética genérica o descuidada.

### 12.1. Estándar de Iconografía Vectorial
1. **Vectores SVG Nativos o Bibliotecas Profesionales:**
   * Toda la iconografía del sistema debe provenir exclusivamente de bibliotecas vectoriales de precisión como **Lucide React**, **Heroicons**, **Tabler Icons** o **Radix Icons**.
   * El grosor de trazo (*stroke width*) debe mantenerse coherente en toda la aplicación (estándar: `strokeWidth={1.75}` o `2.0`).
   * Tamaño ergonómico unificado: `w-4 h-4` (16px) para botones compactos y badges; `w-5 h-5` (20px) para navegación principal; `w-6 h-6` (24px) para titulares de sección.

2. **Marcas, Clientes y Símbolos Personalizados:**
   * Si un cliente o proyecto requiere un identificador propio, **se diseña o importa su isotipo vectorial SVG en alta definición**.
   * Si no se dispone de logotipo oficial en vector, se genera un **Monograma Tipográfico de Alta Calidad** (círculo o pastilla estilizada con radio de borde de diseño, fondo con token de color de la marca y tipografía refinada con iniciales en peso `font-black text-xs`). Jamás un emoji.
   * Todos los activos de marca deben ser nítidos y vectoriales, escalando a pantallas Retina/4K sin pixelación.

---

## 13. Flujos de Onboarding Interactivo y Micro-Simulaciones (Learn-by-Doing Wizard)

Inspirado en el estándar de bienvenida de **Trello / Atlassian**, las aplicaciones clave de Qaway Lab pueden implementar un **recorrido interactivo guiado** para nuevos usuarios.

### 13.1. Filosofía: Aprender Haciendo (Zero Videos Pasivos)
* En lugar de obligar al usuario a leer textos largos o ver videos pasivos, el sistema presenta una **micro-simulación interactiva** donde el usuario realiza una acción real en menos de 45 segundos.
* El objetivo es alcanzar el **"Aha! Moment"** (el momento exacto donde el usuario comprende el valor del software de forma tangible).

### 13.2. Diagrama de Arquitectura del Componente Onboarding

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Trello / Qaway Hub          ←  [ ━ ] [ ━ ] [ ━ ] [   ]  →        [x] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                  TITULAR CLARO DE LA ACCIÓN (H2)                            │
│           "Añadir una tarea por hacer a la Bandeja de entrada"              │
│                                                                             │
│       Subtítulo explicativo con la promesa de valor en 1 sola línea         │
│                                                                             │
│     ┌──────────────────┐           ┌─────────────────────────────┐          │
│     │ [Icono / Avatar] │           │ [Icon: Inbox] Bandeja       │          │
│     │ ¡Hola! Haz clic  │ ────────► │ ┌─────────────────────────┐ │          │
│     │ en 'Añadir'      │ (Flecha   │ │ ¿Qué tienes pendiente?  │ │          │
│     │ para probar      │  SVG)     │ │        [ Añadir Tarea ] │ │          │
│     └──────────────────┘           │ └─────────────────────────┘ │          │
│                                    └─────────────────────────────┘          │
│                                                                             │
│                               [ Continuar → ]                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 13.3. Estándar de Construcción Técnica (100% Frontend React + SVG)
1. **Componente de Estado (Stepper):**
   * Controla el paso actual (`step: 1 -> 2 -> 3 -> 4 -> Complete`).
   * Renderiza el indicador superior de progreso (`Stepper Bar`) con botones anterior `←` y siguiente `→`, además del botón de cierre `[x]` para saltar el tutorial si el usuario ya es experto.
2. **Elementos de Micro-Simulación (Sandboxing):**
   * Los widgets son **componentes React reales** (inputs funcionales, botones clicables, tarjetas de preview).
   * Las flechas conectivas, líneas de flujo y mascotas son **vectores SVG dinámicos**.
3. **Física de Animación y Feedback:**
   * Al pulsar el botón de acción (ej. *"Añadir Tarea"* o *"Enviar Correo"*), se ejecuta una animación suave con curvas desaceleradas (`cubic-bezier(0.16, 1, 0.3, 1)`):
     - La tarjeta se traslada hacia el contenedor destino.
     - Aparece el mensaje de éxito de alta confianza (`¡Listo! La tarea se guardó en tu bandeja de entrada`).
4. **Persistencia del Estado de Onboarding:**
   * Una vez completado o cerrado el flujo, el estado se guarda en la base de datos (Supabase `user_metadata.has_completed_onboarding = true`) o en `localStorage`, evitando que vuelva a interrumpir al usuario en futuras sesiones.

---

## 14. Benchmark de Repositorios Top Globales (Patrones de Alto Margen y Vanguardia)

Para que los proyectos de Qaway Lab compitan al nivel de los productos SaaS de mayor puntuación y referencia mundial, se incorporan los siguientes 6 patrones arquitectónicos de los referentes de la industria:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE PATRONES DE REPOSITORIOS TOP MUNDIALES                     │
├──────────────────────────────┬──────────────────────────────────────────────────────────┤
│ 1. Slide-Over Sheet / Drawer │ Inspirado en Linear.app & Plane.so                       │
│    (Edición sin perder foco) │ Abre un panel lateral deslizante sin abandonar la lista. │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 2. Command Palette (Cmd+K)   │ Inspirado en Raycast & Vercel Dashboard                  │
│    (Omnibox de Comandos)     │ Búsqueda difusa que ejecuta acciones y navegación en 0ms.│
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 3. Sincronización en URL     │ Inspirado en Dub.co & Cal.com (URL State Sync)           │
│    (Filtros Compartibles)    │ Filtros, vistas y páginas reflejados en la URL (?tab=...)│
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 4. Actualizaciones Optimistas│ Inspirado en Superhuman & Linear                         │
│    (Zero-Latency UX)         │ La UI cambia al instante (0ms) y sincroniza en fondo.    │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 5. Skeletons de Precisión    │ Inspirado en GitHub & Supabase Studio                    │
│    (Cero Saltos de Layout)   │ Siluetas animadas que eliminan el CLS (Layout Shift).    │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 6. Toasts con Acción Deshacer│ Inspirado en Sonner / Gmail                              │
│    (Undo Timed Action)       │ Notificaciones flotantes con botón de reversión 5 seg.   │
└──────────────────────────────┴──────────────────────────────────────────────────────────┘
```

### 14.1. Panel Deslizante Lateral (Slide-Over Sheet / Drawer Detail)
* **Problema tradicional:** Hacer clic en un cliente, tarea o post te saca a una página nueva, perdiendo el contexto de la lista y obligando a presionar "Atrás".
* **Estándar Linear / Plane:** Al hacer clic, se abre un panel lateral deslizante desde el borde derecho (`Sheet w-[480px] - w-[640px]`), permitiendo editar campos, cambiar estados y ver comentarios mientras la tabla o tablero sigue visible a la izquierda.

### 14.2. Command Palette Avanzada (`Cmd+K` / `Ctrl+K`)
* No es solo un buscador de texto; es un motor de ejecución directa dividido en 3 bloques:
  1. *Navegación rápida:* `Ir a CRM`, `Ir a Blog Editor`, `Ir a Configuración`.
  2. *Acciones inmediatas:* `Crear nuevo lead`, `Generar reporte mensual`, `Cambiar tema a modo oscuro`.
  3. *Búsqueda difusa:* Encuentra proyectos o clientes aunque el usuario escriba con errores ortográficos menores.

### 14.3. Sincronización de Estado en la URL (URL State Sync)
* Todos los filtros (`status=en_redaccion`), el orden (`sort=fecha_desc`), la vista (`view=kanban`) y la búsqueda (`q=whatsapp`) se sincronizan en la URL mediante `URLSearchParams`.
* **Beneficio directo:** Si un miembro del equipo filtra un listado y copia el enlace para enviárselo a otro por WhatsApp o Slack, el destinatario abre exactamente la misma vista filtrada.

### 14.4. Actualizaciones Optimistas (*Optimistic UI*)
* Cuando el usuario marca un checkbox, arrastra una tarjeta en el Kanban o cambia un estado, la interfaz se actualiza **inmediatamente en 0 milisegundos**.
* La petición a Supabase/Backend se procesa en segundo plano. Si ocurre un fallo de conexión, el sistema revierte el cambio de forma segura y notifica al usuario con un mensaje de alerta.

### 14.5. Skeletons de Precisión contra el Salto de Pantalla (*Zero CLS*)
* Queda prohibido el uso de spinners genéricos en el centro de páginas completas.
* Se utilizan **Skeletons con brillo (*Shimmer Animation*)** que calcan exactamente la altura, anchura y distribución de las tarjetas o tablas que se están cargando, evitando cualquier salto visual (*Cumulative Layout Shift*).

### 14.6. Notificaciones Flotantes con Botón "Deshacer" (*Undo Pattern*)
* Cuando el usuario elimina un ítem o realiza una acción masiva, el toast flotante inferior incluye un botón interactivo **`[ Deshacer ]`** con temporizador de 5 segundos antes de hacer la eliminación irreversible en la base de datos.

---

## 15. Protocolo de Ensamblaje y Generación Rápida de Proyectos por Nicho (Zero-Reinvention Policy)

> **Regla de oro de productividad:** Queda prohibido iniciar un nuevo proyecto o software desde una hoja en blanco. Todo proyecto nuevo se ensambla combinando los bloques chasis existentes adaptados al nicho del cliente.

### 15.1. El Algoritmo de Creación en 3 Pasos

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. DEFINIR NICHO Y ENTIDADES                                                │
│    • Nicho: (ej. Barbería, Clínica Dental, Inmobiliaria, Estudio Contable)  │
│    • 4 Métricas clave (KPIs) del negocio                                    │
│    • 3 Estados de su flujo de trabajo (para Listas y Kanban)                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SELECCIONAR ARQUETIPO VISUAL Y LAYOUT                                    │
│    • Arquetipo 1 (Minimal / Plane.so) → Devs, blogs, tareas técnicas        │
│    • Arquetipo 2 (Vibrant Creative)   → Creadores, marketing, media         │
│    • Arquetipo 3 (Executive Contrast) → CRM, ventas, barberías, negocios    │
│    • Arquetipo 4 (Structured Dossier) → Consultoría, diagnósticos, etapas   │
│    • Disposición: Sidebar Lateral (Estándar) o TopNav (Panorámico)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ENSAMBLAJE AUTOMÁTICO DE BLOQUES CHASIS                                  │
│    ├── A. Auth Shell: LoginPage.jsx con toggle ojo y branding del nicho     │
│    ├── B. Layout Shell: Sidebar fija con scroll independiente + TopBar      │
│    ├── C. TopBar: Tríada (Apps waffle + Logo retorno + Home app) + UserMenu │
│    ├── D. Home Canvas: Hero saludo con fecha + 4 KPIs + Quick Actions       │
│    ├── E. Data Views: Switcher (Lista / Kanban / Calendario)                │
│    ├── F. Detalle: Slide-over Sheet lateral para edición sin perder lista   │
│    └── G. Onboarding: Wizard interactivo simulado de primer uso             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 15.2. Matriz de Adaptación Rápida por Nichos Frecuentes

| Nicho de Cliente | Arquetipo Recomendado | 4 KPIs de Portada | Estados Kanban Base |
| :--- | :--- | :--- | :--- |
| **Barbería / Salón** | **Arquetipo 3 (Executive)** | Citas hoy · Ingresos día · Clientes VIP · Ticket prom. | En espera → Atendiendo → Cobrado |
| **Clínica Dental** | **Arquetipo 1 o 3** | Pacientes día · Tratamientos activos · Pagos pendientes · Presupuestos | Cita agendada → En gabinete → Tratamiento fin. |
| **Agencia / Media** | **Arquetipo 2 (Creative)** | Guiones listos · Videos producidos · Ritmo mensual · Leads | Idea / Hook → En rodaje → Editado / Publicado |
| **Inmobiliaria** | **Arquetipo 3 (Executive)** | Propiedades activas · Visitas semana · Oportunidades · Comisiones | Contacto inicial → Visita agendada → Cierre / Firma |
| **Consultora / Legal**| **Arquetipo 4 (Dossier)** | Casos activos · Documentos auditados · Hitos completados · ROI | Diagnóstico → En elaboración → Dictamen emitido |







