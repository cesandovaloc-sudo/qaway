---
name: qaway-saas-architecture
description: Enforce and generate world-class SaaS architecture, multi-panel layouts, high-converting auth portals, user profile drop-downs, and project scaffolding for Qaway Lab applications. Use this skill whenever creating or refactoring a web application, dashboard, CRM, portal, or SaaS project to guarantee it follows the complete Qaway Lab master standard without barebones or incomplete designs.
license: Qaway Lab Proprietary
---

# Qaway Lab SaaS Architecture & Project Generator Skill

Este skill es el **estándar técnico y visual obligatorio** para cualquier agente o desarrollador que cree, audite o refactorice una aplicación web, dashboard, CRM, editor o SaaS dentro del ecosistema de Qaway Lab.

> **Objetivo fundamental:** Ninguna aplicación de Qaway Lab puede nacer como una pantalla vacía, una tabla cruda o una plantilla genérica ("AI slop"). Toda app debe ensamblarse obligatoriamente con la arquitectura completa de los productos de mayor margen de la industria (Linear, Plane.so, Asana, Trello, Atlassian).

---

## 1. Regla de Oro: Desacoplamiento Lógica vs. Presentación

* La lógica de negocio (modelos, estado, Supabase, CRUD, autenticación) es **completamente independiente** del Arquetipo Visual y del Layout Shell.
* Debe ser posible conmutar entre los 4 arquetipos visuales (*Theme/Skin Swap*) o entre barra lateral y barra superior (*Layout Swap*) sin reescribir la funcionalidad de negocio.

---

## 2. Fase 0: Cuestionario de Discovery Obligatorio (Antes de Codificar)

El agente debe resolver obligatoriamente estas 4 preguntas antes de tocar código:
1. **Dominio & Nicho:** ¿Es un CRM de ventas, gestor de tareas, plataforma de creadores/audio, clínica dental, barbería o consultoría?
2. **Core Action (Acción Núcleo):** ¿Qué es lo primero que viene a hacer el usuario tras iniciar sesión? (`+ Crear tarea`, `+ Registrar lead`, `+ Generar guión`).
3. **Disposición del Layout:** ¿Preset Sidebar Lateral (estándar multifacético) o Preset TopNav Superior (panorámico para tablas densas)?
4. **Arquetipo Visual Inicial:** ¿Cuál de los 4 estilos aprobados de Qaway Lab encaja con el cliente?

---

## 3. Catálogo de los 4 Arquetipos de Diseño Oficiales

```text
┌──────────────────────────────┬──────────────────────────────────────────────────────────┐
│ 1. Minimal Utilitarian       │ Inspirado en Plane.so / Linear                           │
│    (Studio Blog / Gelato)    │ Fondo neutro, bordes 1px, tipografía sobria, alta densidad│
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 2. Vibrant Creative SaaS     │ Inspirado en Fish Audio / Content Studio                 │
│    (Content Studio)          │ Sidebar saturado (violeta/azul), tarjetas rounded-2xl.   │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 3. Executive High-Contrast   │ Inspirado en Stripe / CRM Qaway (Dark/Light Hybrid)      │
│    (CRM Analítica)           │ Sidebar negro profundo, lienzo claro, acentos naranja.   │
├──────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 4. Structured Dossier        │ Inspirado en Atlassian / Studio OS (Buyer Personas)      │
│    (Studio OS)               │ Stepper por etapas numeradas, hero oscuro y fichas.      │
└──────────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 4. Anatomía Obligatoria del Panel Izquierdo (Sidebar & Dual-Rail)

1. **Fijación de Pantalla (*Viewport Locking*):**
   * Contenedor raíz con `h-screen overflow-hidden`.
   * Los paneles son fijos; **jamás hacen scroll global con la página**.
   * Scroll local independiente (`overflow-y: auto`) con scrollbar estilizado solo si la lista de carpetas/proyectos supera la altura visible.
2. **Modo Expandido (~260px) vs. Colapsado (~64px):**
   * Al colapsar con el botón toggle (`<`), se compacta a una sola columna de iconos.
   * **Hover / Flyout:** Al pasar el cursor sobre un icono colapsado, se despliega un tooltip flotante o flyout menu con el título del módulo y acciones secundarias.
3. **Variante Doble Panel (Dual-Rail):**
   * *Rail Primario (Estrecho, 64px):* Iconos globales del sistema (*Inicio, Proyectos, Agentes, Configuración*).
   * *Rail Secundario (Contextual, 200px):* Subárbol del módulo activo (lista de proyectos en curso, tableros o categorías). Puede replegarse de forma independiente.
4. **Modo Móvil (`< 768px`):** Drawer flotante superpuesto con desenfoque de fondo (`backdrop-blur-sm bg-black/40`).

---

## 5. Anatomía del Encabezado Global (TopBar) y Tríada de Navegación

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [::: ⤹ Apps]  [Qaway Lab ⤹ Web]  [Icon:Home Inicio] / [Submódulo]  ...  [Icon:Search] [Usuario]│
└──────┬───────────────┬──────────────────────┬───────────────────────────────────────────────────┘
       │               │                      │
       │               │                      └──► 3. Icono Casa (Home): Inicio de la MISMA APP activa
       │               │
       │               └──► 2. Logo Qaway Lab: Retorno a la WEB PÚBLICA (qaway.pe)
       │
       └──► 1. Icono 9 Puntos (Waffle): Hover expande suavemente "Apps" → abre Menú Ecosistema
```

1. **Tríada Superior Izquierda:**
   * **Waffle 9 puntos (`[:::]`):** Hover con micro-interacción suave (`transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1)`) que expande el texto `"Apps"` y abre el menú con todas las herramientas del Hub.
   * **Logo `Qaway Lab`:** Retorno seguro a la web pública principal `qaway.pe` sin perder sesión.
   * **Icono `Home`:** Retorno a la portada/dashboard de la **misma aplicación activa**.
2. **Zona Derecha:**
   * Omnibox buscador global (`Cmd+K`).
   * Botón primario de acción rápida (`+ Crear`).
   * Campana de notificaciones con badge numérico.
   * Separador vertical de 24px (`h-6 w-px bg-surface-200`).

---

## 6. Dropdown de Perfil y Cuenta (Patrón Qaway Academy & Atlassian)

Implementa obligatoriamente las 6 funciones probadas en `UserMenu.tsx`:
1. **Algoritmo `formatShortName`:** Formatea nombres a estándar ejecutivo (`Carlos S.` o `Ce.sandovaloc`), evitando desbordamientos en el header.
2. **Monograma Tipográfico Vectorial (`getInitial`):** Iniciales en mayúscula sobre fondo de color corporativo de contraste. **Cero emojis**.
3. **Inyección Condicional por Rol:** Enlaces a `Panel Admin`, `Panel Docente` o `Certificados` según `profile.role`.
4. **Submenú de Tema con Mini-Previews:** Flyout con miniaturas visuales para modo *Luz*, *Oscuro* y *Sistema*.
5. **Doble Listener de Cierre:** Cierre por `Click-Outside` y tecla `Escape` (WCAG).
6. **Animación y Chevron:** Rotación de chevron 180° (`rotate-180`) y animación de entrada `animate-in fade-in slide-in-from-top-2`.

---

## 7. Portal de Autenticación Canónico (`LoginPage.jsx`)

Todo acceso a plataformas de Qaway Lab debe estructurarse con:
* **OAuth Social a 1 clic:** Botón `Continuar con Google` (y Microsoft opcional).
* **Toggle Ver/Ocultar Contraseña:** Icono `Eye` / `EyeOff` para alternar entre `password` y `text`.
* **Checkbox "Recordarme":** Persistencia controlada en `localStorage` vs. `sessionStorage`.
* **Recuperación de Contraseña:** Enlace directo con flujo `resetPasswordForEmail`.
* **Prueba Social:** Pills con identificadores de proyectos y clientes activos.

---

## 8. Lienzo Central y Vistas de Trabajo (Data Views & Drawer)

1. **Switcher de Vistas:** Pestañas para alternar entre `Lista`, `Tablero Kanban`, `Calendario` y `Métricas / Dashboard` sin recargar la página.
2. **Slide-Over Sheet / Drawer:** Al pulsar sobre una fila o tarjeta, se abre un **panel lateral deslizante desde la derecha** (`w-[480px] - w-[640px]`) para editar campos y comentarios sin perder la lista de fondo (estándar Linear/Plane).
3. **Barra de Acciones Masivas (*Bulk Actions Bar*):** Al seleccionar múltiples checkboxes, la barra superior se convierte en un panel de acciones grupales (*Publicar, Archivar, Eliminar en lote*).
4. **Filtros Sincronizados en URL (*URL State Sync*):** Todos los filtros y vistas se reflejan en `searchParams` (`?status=en_progreso&view=kanban`) para ser compartibles.
5. **Skeletons con Brillo (*Zero CLS*):** Prohibidos los spinners en pantallas completas; usar siluetas animadas con brillo (*Shimmer*).

---

## 9. Política Estricta de Calidad Visual (Zero-Emoji Policy)

* **Prohibición Total de Emojis:** Queda terminantemente prohibido usar caracteres emoji en botones, menús, estados o navegación.
* **Iconos Vectoriales SVG:** Usar exclusivamente **Lucide React**, **Heroicons** o **Tabler**, con grosor de trazo uniforme (`strokeWidth={1.75}`) y tamaños normalizados (16px, 20px, 24px).
* **Logos de Clientes:** Isotipos vectoriales SVG limpios o monogramas tipográficos de alta definición (`font-black text-xs`).

---

## 10. Flujos de Onboarding Interactivo (Learn-by-Doing Wizard)

* Toda app de primer uso incorpora una **micro-simulación interactiva** construida 100% en React + SVG (Stepper superior `← [━] [━] [ ] →`, tarjeta simulada y mensaje de éxito `¡Listo!`).
* Persiste `has_completed_onboarding` en Supabase o `localStorage` para no repetir el flujo.

---

## 11. Generador de Proyectos y Scaffolding (`5-gestor-de-proyectos`)

Al crear un nuevo proyecto, el motor debe permitir seleccionar:
1. **Framework Metodológico:**
   * **Agile / Scrum:** Sprints de 2 semanas, Backlog, Kanban de Sprint, Ceremonias.
   * **PMB / 6 Hitos:** Cascada formal de entregas (*Discovery, SOW, Mockups UI, Staging, Go-Live, Certificación*).
   * **Product Management:** Discovery, User Stories, Matriz RICE, Roadmap Now/Next/Later.
   * **Kanban Lean:** Flujo continuo con límites de WIP.
2. **Skin / Arquetipo de Diseño:** Aplicación automática de los tokens de Tailwind del arquetipo seleccionado.
