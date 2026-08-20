# Estándar general para iniciar y construir proyectos web de vanguardia

**Versión:** 3.0  
**Estado:** Documento base para creación, validación, migración y auditoría  
**Aplicación:** webs públicas, landing pages, sitios one-page, sitios multipágina, aplicaciones web, dashboards, paneles administrativos y productos híbridos  
**Principio:** construir sistemas reutilizables y configurables, no copiar una plantilla visual cerrada

---

## 1. Propósito

Este documento define una estructura general para iniciar proyectos web modernos con React y TypeScript.

No describe un proyecto concreto ni compara repositorios específicos. Su objetivo es establecer:

- comandos de inicio;
- estructura de carpetas;
- dependencias obligatorias y opcionales;
- reglas de diseño;
- puntos de aprobación;
- arquitectura de componentes;
- SEO;
- rendimiento;
- accesibilidad;
- animaciones;
- gráficos;
- formularios;
- datos;
- integraciones;
- pruebas;
- migraciones;
- auditorías;
- criterios para publicar.

La base debe permitir que una IA o un desarrollador inicie proyectos consistentes sin producir interfaces básicas, genéricas o difíciles de escalar.

---

# 2. Principios obligatorios

Todo proyecto debe seguir estas reglas:

1. **TypeScript desde el inicio.**
2. **Diseño validado antes de construir toda la interfaz.**
3. **Responsive desde la arquitectura, no como corrección final.**
4. **SEO integrado durante la construcción de rutas públicas.**
5. **Accesibilidad y rendimiento como requisitos, no adornos.**
6. **Dependencias instaladas solo cuando resuelven una necesidad real.**
7. **Contenido, diseño, datos e integraciones separados.**
8. **Credenciales privadas fuera del frontend.**
9. **Pruebas incorporadas progresivamente.**
10. **Auditorías proporcionales al alcance de la revisión.**
11. **Aprobación explícita antes de avanzar entre etapas críticas.**
12. **Documentación de decisiones y excepciones.**

---

# 3. Clasificar el proyecto antes de instalar dependencias

La IA debe identificar primero el tipo de producto.

## 3.1 Landing page

Objetivo principal:

```text
campaña → mensaje específico → conversión
```

Prioridades:

- velocidad;
- claridad;
- CTA;
- analítica;
- SEO de una página;
- formulario, compra, reserva o WhatsApp;
- navegación mínima;
- carga ligera.

---

## 3.2 Sitio one-page

Objetivo:

```text
presentar un negocio completo en una página vertical
```

Incluye normalmente:

- inicio;
- servicios o productos;
- beneficios;
- nosotros;
- testimonios;
- ubicación;
- contacto.

---

## 3.3 Sitio multipágina

Objetivo:

```text
distribuir contenido y posicionamiento en rutas independientes
```

Incluye:

- arquitectura de URLs;
- metadata por ruta;
- navegación interna;
- sitemap;
- breadcrumbs;
- páginas de servicios, productos o contenido;
- 404;
- renderizado y carga por ruta.

---

## 3.4 Aplicación web

Objetivo:

```text
operar, registrar, administrar o procesar información
```

Prioridades:

- autenticación;
- permisos;
- datos;
- formularios;
- CRUD;
- seguridad;
- manejo de estados;
- pruebas;
- recuperación ante errores;
- rendimiento operativo.

---

## 3.5 Dashboard

Es una aplicación enfocada en datos.

Prioridades:

- métricas;
- filtros;
- tablas;
- gráficos;
- periodos;
- exportación;
- trazabilidad;
- accesibilidad de datos;
- carga diferida de visualizaciones.

---

## 3.6 Producto híbrido

Combina una parte pública con una aplicación privada.

Ejemplo:

```text
/             web pública
/servicios    contenido indexable
/login        acceso
/panel        aplicación privada
```

Debe separar:

- layouts;
- indexación;
- metadata;
- autenticación;
- permisos;
- navegación;
- analítica;
- caché;
- seguridad.

---

# 4. Flujo obligatorio de diseño web

## 4.1 Regla principal

Antes de diseñar o modificar una interfaz web, usar las herramientas según el tipo de superficie (la sección 52 desarrolla el detalle completo):

- **Web pública, landing, portfolio, página editorial o presentación visual** → `design-taste-frontend` + Impeccable.
- **Aplicación, plataforma, dashboard, CRM, agenda o herramienta operativa** → Impeccable como núcleo; Taste solo en superficies donde realmente encaje.
- **Producto híbrido** → Taste para la parte pública; Impeccable para todo el producto.

No debe forzarse Taste sobre tablas, CRUD densos o flujos operativos de múltiples pasos cuando no corresponda. La IA no debe crear primero una interfaz básica para “mejorarla después”.

---

## 4.2 Flujo según el tipo de trabajo

### Creación desde cero

```text
design-taste-frontend
```

### Rediseño de un producto existente

```text
design-taste-frontend
+ redesign-existing-projects
```

### Necesidad de referencia visual antes de programar

```text
imagegen-frontend-web
o
image-to-code
```

### Trabajo desde screenshot, imagen o referencia fuerte

```text
image-to-code
```

### Estilos visuales específicos

Utilizar únicamente cuando el brief los solicite:

```text
minimalist-ui
industrial-brutalist-ui
gpt-taste
```

No imponer estos estilos por defecto.

---

# 5. Impeccable como capa obligatoria de calidad visual

Cuando esté disponible, **Impeccable debe formar parte del proceso**.

## 5.1 Al iniciar

Usarlo para:

- fijar contexto visual;
- impedir una dirección genérica;
- definir nivel de calidad;
- revisar densidad;
- anticipar problemas de composición;
- evitar patrones repetidos de IA.

## 5.2 Durante el diseño

Usarlo como guía para:

- jerarquía;
- espaciado;
- contraste;
- composición;
- tipografía;
- claridad;
- ritmo;
- densidad;
- uso de cards;
- navegación;
- responsive.

## 5.3 Antes de cerrar

Usarlo para detectar:

- exceso de tarjetas;
- separación débil entre secciones;
- tipografía sin jerarquía;
- contraste insuficiente;
- apariencia de plantilla;
- abuso de degradados;
- efectos decorativos sin función;
- interfaces excesivamente básicas;
- inconsistencias;
- problemas de accesibilidad;
- señales de diseño generado sin criterio.

---

# 6. Puntos obligatorios de aprobación

La IA debe solicitar aprobación antes de avanzar en los siguientes momentos.

## Aprobación 1 — Dirección

Presentar:

- tipo de proyecto;
- objetivo;
- público;
- arquitectura;
- rutas o secciones;
- CTA principal;
- referencias;
- dirección visual.

No iniciar la implementación completa sin aprobación.

## Aprobación 2 — Diseño inicial

Presentar:

- hero o primera pantalla;
- navbar;
- sistema tipográfico;
- paleta;
- componentes principales;
- tratamiento móvil;
- ejemplo de una sección interior.

Solicitar aprobación antes de construir todas las páginas o secciones.

## Aprobación 3 — Prototipo funcional

Validar:

- escritorio;
- tablet;
- móvil;
- navegación;
- formularios;
- estados;
- animación propuesta;
- integración prevista.

Solicitar aprobación antes de conectar producción, datos sensibles, pagos o automatizaciones.

## Aprobación 4 — Publicación

Presentar:

- auditoría;
- pruebas;
- SEO;
- rendimiento;
- accesibilidad;
- seguridad;
- build;
- pendientes conocidos.

Solicitar aprobación antes del despliegue definitivo.

---

# 7. Stack general de proyectos nuevos

## 7.1 Núcleo

```text
React
TypeScript
Vite
Tailwind CSS 4
React Router
Lucide
Oxlint
```

## 7.2 Dependencias condicionales

```text
Motion           → animaciones de interfaz
GSAP             → secuencias complejas y narrativa visual
Recharts         → gráficos y dashboards
Supabase         → Auth, Postgres, Storage, RLS, Realtime, Functions
Tailwind Forms   → reset de formularios
Vitest           → pruebas unitarias
Testing Library  → pruebas de componentes
Playwright       → pruebas de flujos completos
```

No instalar todos los módulos por defecto.

---

# 8. Comando base para iniciar un proyecto

## 8.1 Opción general con Vite, React y TypeScript

```bash
npm create vite@latest nombre-proyecto -- --template react-ts
cd nombre-proyecto
npm install
```

Usar esta opción para:

- landing;
- one-page;
- aplicación;
- dashboard;
- sitio con arquitectura personalizada.

---

## 8.2 Opción SEO y rutas públicas con React Router Framework

Para un sitio público con muchas rutas, renderizado o prerenderizado:

```bash
npx create-react-router@latest nombre-proyecto
cd nombre-proyecto
npm install
npm run dev
```

La elección entre Vite directo y React Router Framework debe definirse en la fase de arquitectura, no después de crear todas las páginas.

---

# 9. Instalar Tailwind CSS 4 con Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

Configurar `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
```

En el CSS principal:

```css
@import "tailwindcss";
```

No crear `tailwind.config.js` salvo que una necesidad real no pueda resolverse con el enfoque CSS de Tailwind 4.

---

# 10. Instalar navegación, iconos y calidad

## React Router en un proyecto Vite

```bash
npm install react-router
```

## Iconos

```bash
npm install lucide-react
```

## Oxlint

```bash
npm install -D oxlint
```

Scripts mínimos sugeridos:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

# 11. TypeScript obligatorio

## 11.1 Extensiones

```text
Componentes y páginas: .tsx
Servicios y utilidades: .ts
Configuración: .ts
Tipos: .ts
Edge Functions: .ts
Pruebas de componentes: .test.tsx
Pruebas de lógica: .test.ts
```

## 11.2 Configuración estricta

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "useUnknownInCatchVariables": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true
  }
}
```

## 11.3 Reglas

- Evitar `any`.
- Usar `unknown` en límites externos y validar.
- Tipar props.
- Tipar formularios.
- Tipar servicios.
- Tipar respuestas.
- Tipar errores.
- Tipar rutas.
- Tipar configuración.
- Tipar eventos.
- Generar tipos de base de datos cuando sea posible.
- No duplicar tipos sin necesidad.

---

# 12. Estructura general de carpetas

```text
src/
├── app/
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── errors/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── navigation/
│   ├── feedback/
│   └── data-display/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── bookings/
│   ├── customers/
│   └── analytics/
│
├── pages/
├── sections/
├── services/
├── integrations/
├── config/
├── data/
├── hooks/
├── lib/
├── utils/
├── types/
├── styles/
├── assets/
└── tests/

public/
├── icons/
├── images/
├── og/
├── robots.txt
├── sitemap.xml
└── site.webmanifest

docs/
├── architecture/
├── decisions/
├── design/
├── seo/
├── migrations/
└── audits/
```

No todas las carpetas son obligatorias desde el primer día. Deben crearse cuando tengan contenido real.

---

# 13. Sistema visual y tokens

## 13.1 Tokens primitivos

```css
@theme {
  --color-neutral-0: #ffffff;
  --color-neutral-950: #111111;
  --color-brand-500: #ff4b0b;

  --font-sans: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --radius-sm: 0.5rem;
  --radius-md: 0.875rem;
  --radius-lg: 1.25rem;
}
```

## 13.2 Tokens semánticos

```css
:root {
  --background-page: var(--color-neutral-0);
  --background-surface: #f5f5f5;
  --text-primary: var(--color-neutral-950);
  --text-secondary: #52525b;
  --action-primary: var(--color-brand-500);
  --border-default: #e4e4e7;
  --focus-ring: var(--color-brand-500);
}
```

Los componentes deben consumir tokens semánticos.

No escribir colores de marca repetidos en cada componente.

---

# 14. Componentes y variantes

Los componentes deben aceptar variantes sin duplicar la estructura.

Ejemplos:

```tsx
<Header variant="transparent" sticky />
<Header variant="solid" sticky />
<Header variant="minimal" />
```

```tsx
<Hero
  variant="background"
  alignment="center"
  overlay="dark"
/>
```

```tsx
<Button variant="primary" />
<Button variant="outline" />
<Button variant="danger" />
```

Reglas:

- estructura estable;
- props tipadas;
- variantes limitadas;
- valores visuales mediante tokens;
- accesibilidad incorporada;
- estados hover, focus, disabled y loading;
- no resolver cada excepción con CSS aislado.

---

# 15. Contenido separado del diseño

El contenido no debe quedar enterrado en componentes extensos.

Ejemplo:

```ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  available: boolean;
}
```

Fuentes posibles:

- archivo local;
- JSON;
- CMS;
- Supabase;
- API;
- panel administrativo.

La interfaz no debe depender de una única fuente de datos.

---

# 16. Formularios

## 16.1 Tailwind Forms

Instalación opcional:

```bash
npm install -D @tailwindcss/forms
```

En Tailwind 4:

```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
```

Se utiliza como reset, no como sistema visual completo.

## 16.2 Componentes propios

```text
FormField
TextInput
TextArea
Select
Checkbox
RadioGroup
DateInput
FormError
FormSuccess
SubmitButton
```

Todo formulario debe contemplar:

- label;
- descripción;
- error;
- ayuda;
- required;
- disabled;
- loading;
- éxito;
- teclado;
- autocompletado;
- validación cliente;
- validación servidor;
- doble envío;
- errores de red;
- privacidad.

---

# 17. Política de animaciones

## 17.1 Motion para interfaz

Instalación:

```bash
npm install motion
```

Uso recomendado:

```tsx
import { motion } from "motion/react";
```

Aplicar en:

- modales;
- menús;
- tabs;
- acordeones;
- estados;
- transiciones de ruta;
- feedback;
- microinteracciones;
- layout;
- login;
- dashboards;
- paneles.

Motion es la primera opción para comportamiento normal de interfaz.

---

## 17.2 GSAP para narrativa compleja

Instalación opcional:

```bash
npm install gsap @gsap/react
```

Aplicar cuando exista:

- scroll narrativo;
- timelines;
- secuencias coordinadas;
- hero premium;
- presentación editorial;
- animaciones SVG complejas;
- portafolio;
- landing donde el movimiento sea parte del mensaje.

No instalar por defecto en:

- paneles operativos;
- formularios;
- tablas;
- expedientes;
- configuración;
- CRUD simple.

Regla:

```text
Motion → interacción y continuidad de UI
GSAP → narrativa visual y secuencias complejas
```

No usar ambas librerías para controlar simultáneamente el mismo elemento.

---

## 17.3 Momento de animar

Orden:

```text
arquitectura
→ contenido
→ responsive
→ accesibilidad
→ rendimiento base
→ animación
```

La interfaz debe funcionar correctamente sin animaciones.

---

## 17.4 Movimiento reducido

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 18. Política de gráficos

## 18.1 Recharts

Instalación opcional:

```bash
npm install recharts
```

Utilizar para:

- ventas;
- marketing;
- CRM;
- pacientes;
- reservas;
- inventario;
- formación;
- conversiones;
- actividad;
- reportes.

No utilizar para decorar una landing sin datos reales.

## 18.2 Flujo

```text
pregunta de negocio
→ fuente
→ métrica
→ unidad
→ tipo de gráfico
→ contrato de datos
→ componente
→ accesibilidad
→ validación móvil
```

## 18.3 Módulo compartido

```text
features/analytics/charts/
├── ChartContainer.tsx
├── BarChart.tsx
├── LineChart.tsx
├── AreaChart.tsx
├── DonutChart.tsx
├── chartTheme.ts
├── chartFormatters.ts
└── chartTypes.ts
```

Cargar Recharts de forma diferida cuando no sea parte del primer viewport.

---

# 19. SEO fundamental

Las rutas públicas deben incorporar desde la construcción:

- title;
- meta description;
- canonical;
- Open Graph;
- imagen social;
- idioma;
- robots;
- un `h1` principal;
- jerarquía de encabezados;
- contenido HTML;
- enlaces rastreables;
- nombres descriptivos;
- alt;
- schema pertinente;
- sitemap;
- 404;
- estrategia de renderizado;
- rendimiento móvil.

Una aplicación privada debe utilizar:

```text
noindex
título de pantalla
metadata mínima
```

No aplicar schema comercial a contenido privado.

---

# 20. Uso de skills SEO en el flujo web

Para auditorías completas de una web, usar siempre `seo-audit` como skill principal.

Esta debe emplearse cuando se quiera revisar:

- salud SEO general;
- estructura;
- rendimiento;
- contenido;
- schema;
- indexabilidad;
- imágenes;
- mobile;
- oportunidades prioritarias.

## 20.1 Usar `seo-audit` cuando el pedido sea

- auditoría completa;
- revisión SEO general;
- detectar problemas SEO;
- evaluar una web antes de publicar;
- generar plan de mejoras SEO.

## 20.2 Para revisiones pequeñas, usar skills específicas

### `seo-page`

Revisar una sola URL o página puntual.

### `seo-technical`

Revisar:

- indexación;
- robots;
- sitemap;
- headers;
- canonical;
- Core Web Vitals;
- problemas técnicos.

### `seo-content`

Revisar:

- textos;
- claridad;
- E-E-A-T;
- intención de búsqueda;
- calidad;
- utilidad.

### `seo-schema`

Revisar o crear:

- JSON-LD;
- datos estructurados;
- correspondencia con contenido visible.

### `seo-images`

Revisar:

- peso;
- formatos;
- dimensiones;
- alt text;
- lazy loading;
- optimización.

### `seo-performance`

Revisar:

- velocidad;
- LCP;
- CLS;
- INP;
- JavaScript;
- fuentes;
- recursos pesados.

### `seo-visual`

Revisar:

- above the fold;
- mobile;
- jerarquía visual;
- legibilidad;
- experiencia inicial.

## 20.3 Regla práctica

```text
Toda la web              → seo-audit
Una sola página          → seo-page
Problema técnico         → seo-technical
Textos                    → seo-content
Schema                    → seo-schema
Imágenes                  → seo-images
Rendimiento               → seo-performance
Primera pantalla y mobile → seo-visual
```

## 20.4 Regla de eficiencia

No lanzar una auditoría completa cuando solo se necesita revisar:

- una página;
- un schema;
- imágenes;
- rendimiento puntual;
- contenido;
- un canonical;
- un hero.

Flujo:

```text
reglas SEO durante construcción
→ skill especializada durante iteración
→ seo-audit antes de publicar
```

## 20.5 Cuándo repetir una auditoría completa

- cambio de dominio;
- nueva arquitectura;
- paso de one-page a multipágina;
- rediseño completo;
- modificación del renderizado;
- incorporación de catálogo;
- incorporación de blog;
- cambios masivos de URLs;
- problemas de indexación;
- publicación definitiva.

## 20.6 Registro

```text
docs/audits/
├── seo-audit.md
├── seo-page.md
├── seo-technical.md
├── seo-schema.md
├── seo-images.md
├── seo-performance.md
└── seo-visual.md
```

La auditoría valida el trabajo. No reemplaza las reglas de construcción.

---

# 21. Supabase e integraciones

## 21.1 Instalación

```bash
npm install @supabase/supabase-js
```

## 21.2 CLI y tipos

```bash
npm install -D supabase
npx supabase login
```

Generación desde proyecto vinculado:

```bash
npx supabase gen types typescript --linked > src/types/database.types.ts
```

Generación local:

```bash
npx supabase gen types --lang typescript --local > src/types/database.types.ts
```

Regenerar los tipos cada vez que cambie el esquema.

---

## 21.3 RLS

RLS debe aplicarse cuando el navegador accede directamente a la base de datos.

La interfaz no es una barrera de seguridad.

---

## 21.4 Edge Functions

Usar para:

- pagos;
- CRM;
- email;
- WhatsApp;
- webhooks;
- secretos;
- integraciones;
- notificaciones;
- acciones administrativas.

Nunca exponer secretos en variables `VITE_*`.

---

## 21.5 Capa de adaptadores

```text
UI
↓
servicio
↓
adaptador
↓
API o proveedor
```

Ejemplo:

```ts
export interface CommerceAdapter {
  getProducts(): Promise<Product[]>;
  addToCart(productId: string, quantity: number): Promise<void>;
  createCheckout(): Promise<{ url: string }>;
}
```

Esto permite reemplazar un proveedor sin reconstruir todos los componentes.

---

# 22. Variables de entorno

Crear:

```text
.env.example
.env.local
```

Ejemplo:

```env
VITE_PUBLIC_SITE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Reglas:

- documentar todas las variables;
- no guardar secretos en el repositorio;
- validar al iniciar;
- mostrar un fallback controlado;
- no dejar pantalla blanca;
- diferenciar desarrollo, pruebas y producción.

---

# 23. Error Boundaries y estados

Toda aplicación debe contemplar:

```text
RootErrorBoundary
RouteErrorBoundary
FeatureErrorBoundary para procesos críticos
```

Estados mínimos:

- loading;
- empty;
- success;
- error;
- offline;
- timeout;
- retry;
- unauthorized;
- forbidden;
- not found.

No dejar botones sin respuesta.

---

# 24. Pruebas

## 24.1 Vitest

```bash
npm install -D vitest
```

## 24.2 Testing Library

```bash
npm install -D @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom
```

## 24.3 Playwright

```bash
npm init playwright@latest
```

## 24.4 Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## 24.5 Qué probar

### Unitario

- utilidades;
- servicios;
- permisos;
- validaciones;
- formateadores;
- adaptadores;
- cálculos.

### Componentes

- formularios;
- errores;
- estados;
- navegación;
- interacción;
- accesibilidad básica.

### E2E

- login;
- lead;
- reserva;
- carrito;
- checkout;
- alta de registro;
- recuperación de error;
- rutas protegidas.

### Regla

```text
función crítica creada → prueba
bug corregido          → prueba de regresión
flujo completo         → prueba E2E
```

---

# 25. Rendimiento

Objetivos de referencia:

```text
LCP ≤ 2.5 s
INP ≤ 200 ms
CLS ≤ 0.1
```

Reglas:

- WebP y AVIF cuando corresponda;
- `srcset`;
- `sizes`;
- dimensiones;
- no lazy load en el hero principal;
- lazy load bajo el primer viewport;
- carga diferida;
- fuentes limitadas;
- librerías opcionales fuera del bundle inicial;
- evitar efectos costosos;
- evitar imágenes gigantes;
- medir móvil;
- revisar terceros.

No usar `manualChunks` por costumbre.

Orden:

```text
rutas
→ imports dinámicos
→ lazy loading
→ análisis del bundle
→ manualChunks solo con evidencia
```

---

# 26. Accesibilidad

Requisitos:

- HTML semántico;
- teclado;
- focus visible;
- contraste;
- labels;
- mensajes de error;
- orden de lectura;
- alt;
- áreas táctiles;
- `prefers-reduced-motion`;
- no depender solo del color;
- estados anunciables;
- modal accesible;
- navegación móvil usable.

El diseño visual no puede justificar la eliminación de accesibilidad.

---

# 27. Responsive

Validar como mínimo:

```text
360–430 px
768–1024 px
1280–1440 px
```

No reducir todo proporcionalmente.

Definir:

- orden;
- columnas;
- recortes;
- navegación;
- CTA;
- tipografía;
- densidad;
- espacios;
- tablas;
- gráficos;
- formularios;
- elementos fijos;
- teclado móvil.

---

# 28. Flujo completo de construcción

## Fase 1 — Brief

- objetivo;
- usuario;
- tipo de producto;
- contenido;
- conversión;
- integraciones;
- referencias.

Usar `design-taste-frontend`.

Solicitar aprobación.

## Fase 2 — Dirección visual

- sistema visual;
- hero;
- navbar;
- tipografía;
- paleta;
- componentes;
- mobile.

Usar Impeccable.

Solicitar aprobación.

## Fase 3 — Base técnica

- React;
- Vite;
- TypeScript;
- Tailwind;
- Router;
- Oxlint;
- estructura;
- tokens;
- variables;
- Error Boundary.

## Fase 4 — Diseño funcional

- layouts;
- secciones;
- componentes;
- formularios;
- responsive;
- accesibilidad.

## Fase 5 — Datos e integraciones

- Supabase;
- API;
- CRM;
- agenda;
- carrito;
- pagos;
- notificaciones;
- analítica.

## Fase 6 — SEO fundamental

Aplicar durante construcción.

Usar skills especializadas solo cuando corresponda.

## Fase 7 — Movimiento

- Motion para UI;
- GSAP solo si la narrativa lo justifica;
- reduced motion;
- medición de rendimiento.

## Fase 8 — Gráficos

Solo con datos y preguntas definidas.

## Fase 9 — Pruebas

- unitarias;
- componentes;
- E2E;
- rutas;
- permisos;
- errores.

## Fase 10 — Revisión visual

Usar Impeccable.

Corregir:

- jerarquía;
- espaciado;
- densidad;
- contraste;
- responsive;
- patrones genéricos.

## Fase 11 — Auditoría

Usar:

```text
seo-audit
Lighthouse
pruebas
validación de accesibilidad
validación de seguridad
build de producción
```

Solicitar aprobación para publicar.

---

# 29. Migraciones

La migración es una sección independiente. No debe convertir el estándar general en una descripción de proyectos concretos.

## 29.1 Orden recomendado

```text
1. Crear rama de migración.
2. Capturar referencia visual y funcional.
3. Ejecutar pruebas de humo.
4. Introducir TypeScript.
5. Corregir tipos.
6. Incorporar lint.
7. Actualizar runtime y bundler.
8. Actualizar estilos.
9. Revisar rutas.
10. Validar SEO.
11. Validar animaciones.
12. Validar datos.
13. Ejecutar pruebas.
14. Comparar build.
15. Publicar de forma controlada.
```

## 29.2 No mezclar sin control

Evitar ejecutar simultáneamente:

- rediseño;
- cambio de contenido;
- cambio de framework;
- migración de CSS;
- modificación de base de datos;
- cambio de rutas;
- cambio de dominio.

Cuando sea necesario hacerlo, crear hitos verificables.

---

# 30. Registro de decisiones

Crear:

```text
docs/decisions/
├── 001-architecture.md
├── 002-rendering.md
├── 003-design-system.md
├── 004-animation.md
├── 005-data.md
└── 006-integrations.md
```

Formato:

```md
# Decisión

## Contexto

## Opción elegida

## Razón

## Alternativas

## Impacto

## Mitigación

## Fecha

## Estado
```

---

# 31. Lista de comandos por capacidad

## Proyecto base

```bash
npm create vite@latest nombre-proyecto -- --template react-ts
cd nombre-proyecto
npm install
```

## Tailwind 4

```bash
npm install tailwindcss @tailwindcss/vite
```

## Router e iconos

```bash
npm install react-router lucide-react
```

## Calidad

```bash
npm install -D oxlint
```

## Motion

```bash
npm install motion
```

## GSAP

```bash
npm install gsap @gsap/react
```

## Recharts

```bash
npm install recharts
```

## Supabase

```bash
npm install @supabase/supabase-js
npm install -D supabase
```

## Formularios

```bash
npm install -D @tailwindcss/forms
```

## Pruebas

```bash
npm install -D vitest
npm install -D @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom
npm init playwright@latest
```

Instalar únicamente las capacidades que el proyecto necesita.

---

# 32. Criterio para instalar una dependencia

Antes de instalar, responder:

```text
¿Resuelve una necesidad real?
¿Se puede resolver con la plataforma?
¿Se utilizará en más de una sección?
¿Afecta el bundle inicial?
¿Puede cargarse de forma diferida?
¿Tiene mantenimiento activo?
¿Se puede probar?
¿Está documentada?
```

Ejemplos:

```text
Modal                  → Motion
Hero con scroll        → GSAP
Dashboard de ventas    → Recharts
Landing sin datos      → no Recharts
Formulario básico      → componentes propios
Web pública con rutas  → estrategia SEO y renderizado
Panel privado          → noindex
```

---

# 33. Checklist antes de publicar

## Diseño

- dirección aprobada;
- Impeccable ejecutado;
- sin apariencia genérica;
- responsive;
- estados;
- coherencia;
- tipografía;
- contraste.

## Código

- TypeScript;
- lint;
- typecheck;
- build;
- errores controlados;
- dependencias necesarias;
- sin secretos.

## SEO

- metadata;
- canonical;
- schema;
- sitemap;
- robots;
- headings;
- alt;
- renderizado;
- `seo-audit`.

## Rendimiento

- imágenes;
- fuentes;
- bundle;
- LCP;
- INP;
- CLS;
- móvil.

## Accesibilidad

- teclado;
- focus;
- contraste;
- formularios;
- labels;
- reduced motion;
- lector de pantalla básico.

## Funcionalidad

- rutas;
- formularios;
- auth;
- permisos;
- pagos;
- carrito;
- agenda;
- CRM;
- notificaciones;
- errores.

## Pruebas

- unitarias;
- componentes;
- E2E;
- regresiones;
- producción.

## Aprobación

- pendientes documentados;
- riesgos declarados;
- aprobación explícita para publicar.

---

# 34. Instrucción maestra para una IA

> Clasifica primero el proyecto como landing, one-page, multipágina, aplicación, dashboard o híbrido.
>
> Antes de crear o modificar la interfaz, usa `design-taste-frontend`. Para rediseños, añade `redesign-existing-projects`. Cuando exista una referencia visual, utiliza `image-to-code`; cuando sea necesario definir una referencia antes de programar, utiliza `imagegen-frontend-web` o `image-to-code`.
>
> Usa Impeccable al inicio, durante el diseño y antes de cerrar la entrega.
>
> No construyas primero una interfaz básica para mejorarla después.
>
> Presenta arquitectura, dirección visual y primera pantalla. Solicita aprobación antes de implementar el resto.
>
> Construye con React, TypeScript, Vite y Tailwind CSS 4. Usa componentes reutilizables, tokens, variantes, contenido separado y estructura por dominios.
>
> Utiliza Motion para comportamiento normal de interfaz. Utiliza GSAP únicamente cuando exista narrativa visual, scroll o una secuencia compleja. Utiliza Recharts únicamente cuando existan datos reales que deban visualizarse.
>
> Integra SEO fundamental durante la construcción de rutas públicas. Usa la skill especializada para revisiones puntuales y reserva `seo-audit` para una auditoría completa o la validación antes de publicar.
>
> Implementa responsive, accesibilidad, rendimiento, validación de entorno, Error Boundaries, estados, pruebas e integraciones seguras.
>
> No expongas secretos en el frontend.
>
> Documenta excepciones y solicita aprobación antes de conectar producción o publicar.

---

# 35. Referencias técnicas verificadas

Los comandos generales de este documento se basan en documentación oficial de:

- Vite;
- Tailwind CSS;
- React Router;
- Motion;
- GSAP;
- Recharts;
- Supabase;
- Vitest;
- Testing Library;
- Playwright;
- Oxlint.

Las versiones no se fijan en este estándar. Antes de iniciar o migrar un proyecto, revisar compatibilidad entre Node.js, React, Vite, Router y plugins.

---

# 36. Conclusión

Este estándar no describe proyectos anteriores. Define una base general para iniciar productos web actuales con:

```text
diseño desde el primer momento
+ aprobación por etapas
+ TypeScript
+ arquitectura modular
+ SEO proporcional
+ animación con criterio
+ datos e integraciones seguras
+ pruebas
+ auditoría
+ documentación
```

La regla final es:

> Ninguna web o aplicación debe comenzar como una interfaz genérica. Debe iniciar con criterio visual, arquitectura, herramientas de diseño y aprobación antes de escalar la implementación.

---

# 37. Ecosistema multi-app

Qaway Lab opera un conjunto de aplicaciones independientes dentro de un mismo directorio de trabajo.

## 37.1 Nomenclatura

Formato: `N-qawaylab-<nombre-funcional>`

```text
1-qawaylab-web              → web institucional (fuera de alcance hasta nuevo aviso)
2-qawaylab-app-academy      → aplicación de formación
3-qawaylab-pagos            → pagos
5-qawaylab-editor-blog      → editor de contenido de blog
6-qawaylab-editor-web       → editor visual de webs
7-qawaylab-app-crm          → CRM
8-qawaylab-app-agenda       → agenda y reservas
9-qawaylab-expedientes      → historial clínico dual
```

Reglas:

- numeración única sin reutilizar números;
- nombres de máximo dos palabras que describen la función;
- `app-` identifica productos vendibles independientes;
- cada aplicación es un repositorio git propio e independiente;
- no debe existir un `.git` superior que envuelva a varias aplicaciones.

## 37.2 Identidad por capas

Debe diferenciarse en cada aplicación:

```text
nombre interno del repositorio    → N-qawaylab-<nombre>
nombre del producto               → visible al cliente
slug                              → parte de URLs y rutas
dominio / subdominio              → configuración de despliegue
nombre mostrado al cliente        → white-label
```

Para aplicaciones revendibles, la identidad técnica interna no debe quedar incrustada como marca visible obligatoria.

## 37.3 Puertos

Los puertos se registran por convención pero son configurables por variable de entorno:

```bash
PORT=7000
```

No deben convertirse en reglas rígidas ni hardcodearse como valor universal.

# 38. Git y flujo de trabajo

## 38.1 Repositorios

- cada aplicación tiene su propio repositorio con `.git` propio;
- prohibido un repositorio git superior que envuelva varias aplicaciones;
- cada repo declara su rama principal con nombre identificable de la aplicación: `main-app-academy`, `main-app-crm`, `main-expedientes`, etc.

Razón: al operar varios agentes en paralelo, la rama con nombre de aplicación permite verificar de un vistazo que cada agente trabaja en el repositorio correcto. Verificación obligatoria: `git branch --show-current` antes de cualquier cambio.

## 38.2 Ramas de tarea

Las ramas corresponden a tareas, no a repositorios:

```text
chore/aplicar-estandar-qaway-v3
feat/carrito
feat/autenticacion
fix/reservas-duplicadas
refactor/adaptador-supabase
```

## 38.3 Mensajes de commit

Formato convencional y legible:

```text
chore: registrar estado inicial no validado
feat: añadir configuración white-label
fix: corregir validación de reservas
refactor: desacoplar consultas de Supabase
```

La fecha no se incluye en el mensaje: git la registra automáticamente en cada commit.

## 38.4 Baseline

Antes de normalizar o corregir una aplicación no validada:

```bash
git status
git add .
git commit -m "chore: registrar estado inicial no validado"
git tag baseline-unvalidated-YYYY-MM-DD
```

El baseline preserva el estado original. Normalizar después no implica aprobación: significa que el estado anterior queda registrado y recuperable.

# 39. Empaquetado y reventa

Cada aplicación revendible debe poder instalarse, venderse y desplegarse de forma autónoma, sin la web principal.

## 39.1 Variables conceptuales

La arquitectura no debe acoplarse a un framework específico. Se definen variables conceptuales y cada framework las mapea:

```text
PUBLIC_SITE_URL=
PUBLIC_APP_URL=
PUBLIC_API_URL=
PUBLIC_ASSETS_URL=
```

Mapeo por framework:

```text
Vite        → VITE_*
Next.js     → NEXT_PUBLIC_*
Backend     → variables privadas sin prefijo público
```

## 39.2 Checklist de aplicación vendible

- ausencia de dominios hardcodeados;
- branding configurable;
- rutas configurables;
- proveedor de backend intercambiable;
- conexión con web pública mediante URL o contrato;
- README de instalación;
- `.env.example` completo;
- datos demo opcionales y controlados;
- build limpio;
- posibilidad de desplegar la app sin la web principal;
- declaración de tablas y migraciones que le pertenecen;
- declaración de dependencias externas;
- declaración de estructuras compartidas que necesita;
- instrucciones de instalación en un Supabase nuevo;
- instrucciones de conexión a un Supabase existente;
- instrucciones para sustituir Supabase mediante un adaptador.

# 40. White-label

White-label es la capacidad de cambiar la identidad de la aplicación por despliegue:

```text
logotipo
colores
tipografías
nombre
dominio
textos
módulos visibles
```

Reglas:

- el branding se resuelve mediante configuración, no mediante código hardcodeado;
- los tokens semánticos consumen la configuración del tenant o despliegue;
- es capacidad preferente en aplicaciones revendibles;
- una misma aplicación puede venderse a N clientes con identidad distinta cada uno.

# 41. Multi-tenant

Multi-tenant es un perfil arquitectónico opcional, no una obligación.

## 41.1 Definición

Una sola instalación contiene varios clientes y separa sus datos:

```text
tenant A
tenant B
tenant C
```

## 41.2 Implica

- `tenant_id`;
- aislamiento de datos;
- RLS;
- roles;
- configuración por organización;
- dominios;
- límites;
- facturación potencial.

## 41.3 Perfiles admitidos

```text
single-tenant
multi-tenant
white-label single-tenant
white-label multi-tenant
```

Multi-tenant no debe hacerse obligatorio para todas las aplicaciones. Se declara según el modelo de negocio de cada producto.

# 42. Perfiles tecnológicos

El stack no es único para todo el ecosistema. Se selecciona por perfil:

| Tipo | Decisión |
|---|---|
| Web pública, blog, catálogo, contenido con SEO relevante | evaluar **Next.js** en proyectos nuevos |
| Aplicación interna, CRM, dashboard, herramienta operativa | **React + Vite** puede mantenerse |
| Producto híbrido | decidir según contenido público, autenticación, rutas, renderizado e integraciones |

"Chip versión alineada" significa versiones aprobadas dentro de cada perfil, no que todas las aplicaciones usen el mismo bundler.

Aplicación a proyectos existentes: evaluar cada aplicación según su naturaleza, no mantener una tecnología únicamente porque ya fue utilizada. Excepción explícita: la web institucional queda fuera de alcance hasta nuevo aviso.

## 42.1 Nota sobre el blog

El editor de blog es nuevo y no está validado. Antes de normalizarlo debe determinarse su función:

- si es únicamente un panel editorial interno → puede mantenerse en React + Vite;
- si también sirve páginas públicas indexables del blog → evaluar Next.js ahora, antes de consolidar su arquitectura.

# 43. PWA

PWA es un módulo opcional según el tipo de producto.

## 43.1 PWA recomendada

- agenda operativa;
- CRM móvil;
- herramienta de campo;
- app usada frecuentemente;
- app con necesidad de instalación.

## 43.2 PWA no necesaria por defecto

- landing;
- web corporativa;
- blog público;
- portafolio;
- página informativa.

No se añade service worker automáticamente: puede introducir problemas de caché y actualizaciones si no está bien diseñado.

## 43.3 Criterio: preparación móvil desde el inicio

Toda aplicación se construye como web app responsive. Convertirse en app instalable (PWA) o empaquetarse como app nativa (Capacitor) en el futuro no debe requerir rediseñar la interfaz. Para garantizarlo, aplicar desde el inicio:

- mobile-first: diseñar primero la vista móvil y expandir a escritorio;
- componentes adaptables: sidebar → menú inferior; tabla → tarjetas; modales → pantallas completas;
- PWA-ready: viewport, safe areas, tokens fluidos, sin depender de hover ni de teclado de escritorio.

La interfaz es la misma en todos los contenedores (navegador, PWA o app nativa); solo cambia el marco que la envuelve.

# 44. Despliegue y hosting

La sección es agnóstica al proveedor. Hostinger, Vercel o Netlify son opciones de implementación, no parte obligatoria de la arquitectura.

Debe definirse por proyecto:

- desarrollo;
- preview;
- staging;
- producción;
- variables por entorno;
- dominios y subdominios;
- build reproducible;
- rollback;
- logs;
- comprobación posterior al despliegue;
- proveedor configurable.

# 45. Seguridad (bloque crítico)

La seguridad es requisito crítico, no una sección "importante". Debe incluir como mínimo:

- Supabase RLS;
- separación entre claves públicas y privadas;
- prohibición de `service_role` en el frontend;
- validación en servidor para acciones críticas;
- control de roles y permisos;
- CORS;
- CSP;
- protección de formularios (abuso y spam);
- rate limiting cuando exista backend;
- manejo de sesiones;
- secretos por entorno;
- rotación de secretos;
- logs de seguridad;
- aislamiento por cliente;
- políticas de almacenamiento;
- backups;
- recuperación;
- auditoría de dependencias.

# 46. Datos semilla y usuario demo

Los seeds y usuarios demo solo existen en desarrollo, preview, staging o instalaciones comerciales específicamente destinadas a demostración. Nunca se generan automáticamente en producción real de un cliente.

Debe diferenciarse:

```text
seed de desarrollo
seed de demostración comercial
seed de pruebas automatizadas
datos reales de producción
```

Los datos demo deben ser: ficticios, identificables, eliminables, regenerables, sin credenciales permanentes y controlados por entorno.

# 47. Supabase: propiedad de datos y migraciones

## 47.1 Modelo híbrido

Cada aplicación es propietaria de las migraciones de su dominio funcional y puede instalarse y venderse de forma autónoma.

La autonomía no significa duplicar tablas o migraciones de otras aplicaciones.

## 47.2 Propietario lógico único

Cada tabla, función, vista o política tiene un único propietario lógico:

```text
products      → comercio
orders        → comercio
appointments  → agenda
leads         → CRM
posts         → blog
profiles      → identidad compartida
```

Cuando varias aplicaciones comparten un proyecto de Supabase, las demás consumen la información mediante RLS, vistas, funciones, servicios o contratos definidos. No copian ni modifican directamente el esquema ajeno.

## 47.3 Elementos compartidos

Perfiles, organizaciones, membresías, roles o registros de auditoría tienen un propietario claramente identificado. No deben mantenerse versiones diferentes del mismo núcleo en varios repositorios.

## 47.4 Mapa de propietarios

El mapa inicial de propietarios lógicos se realiza antes de modificar tablas o migraciones. No es necesario resolver anticipadamente cada entidad futura: se definen las entidades existentes, se marcan explícitamente las pendientes y el mapa se actualiza cuando aparezcan nuevas dependencias.

# 48. Contratos entre aplicaciones

## 48.1 Propósito

Definir cómo se comunican las aplicaciones y qué datos intercambian:

```text
web → carrito
web → agenda
agenda → CRM
carrito → CRM
blog → web
```

## 48.2 Formato

Los contratos no se limitan a interfaces TypeScript: usan un esquema con validación en ejecución y tipos inferidos.

```text
contracts/<dominio>/
├── v1.schema.ts
├── v1.types.ts
└── v1.examples.ts
```

## 48.3 Versionado

Los contratos tienen versión semver. Una aplicación puede actualizarse sin romper otra:

```text
products contract v1
booking contract v1
crm lead contract v1
```

# 49. Capa de adaptadores

Ningún componente visual debe quedar acoplado directamente a Supabase.

```text
Componente
→ servicio o repositorio
→ adaptador
→ Supabase u otro backend
```

Esto es obligatorio especialmente para agenda, CRM, carrito, blog y otras aplicaciones que puedan conectarse después a diferentes backends.

El adaptador permite sustituir el proveedor sin reconstruir los componentes.

# 50. Autenticación entre subdominios

Debe determinarse por aplicación:

- qué apps son públicas;
- qué apps exigen login;
- si comparten sesión;
- si tienen autenticación independiente;
- cómo se gestionan los roles.

# 51. Observabilidad y recuperación

Debe contemplarse:

- logs;
- errores;
- auditoría;
- backups;
- rollback;
- alertas;
- fallos de Supabase;
- estados de contingencia;
- datos de relleno cuando corresponda.

# 52. Flujo de diseño con Taste e Impeccable

## 52.1 Alcance de cada herramienta

| Superficie | Herramienta |
|---|---|
| Web pública, landing, portfolio, página editorial, presentación visual | Taste + Impeccable |
| Aplicación, plataforma, dashboard, CRM, agenda, herramienta operativa | Impeccable como núcleo; Taste solo donde realmente encaje |
| Producto híbrido | Taste para la parte pública; Impeccable para todo el producto |

No debe forzarse Taste sobre tablas, CRUD densos o flujos operativos de múltiples pasos cuando no corresponda.

## 52.2 Comandos de Impeccable

```text
/impeccable init      → contexto del producto y diseño
/impeccable shape     → planificar UX/UI antes de escribir código
/impeccable craft     → definir y construir con iteración visual
/impeccable critique  → revisión de experiencia y dirección
/impeccable audit     → accesibilidad, rendimiento y responsive
/impeccable polish    → terminación y preparación para entrega
/impeccable document  → generar DESIGN.md desde una interfaz existente
/impeccable extract   → extraer componentes y tokens existentes
```

## 52.3 Assets e imágenes

Las instrucciones visuales y prompts para imágenes se delegan al subagente de assets disponible en el entorno, sin asumir que todos los entornos tienen el mismo subagente.

## 52.4 Flujo para creación nueva

1. Necesidad del negocio.
2. Tipo de producto y restricciones técnicas.
3. Impeccable init.
4. PRODUCT.md.
5. DESIGN.md.
6. Impeccable shape.
7. Taste cuando corresponda al tipo de superficie.
8. Dirección visual, wireframes y sistema de diseño.
9. Prompts y referencias para assets o mockups.
10. Aprobación de dirección.
11. Arquitectura y código.
12. Impeccable durante la implementación.
13. Responsive, estados y accesibilidad.
14. Critique + audit + polish.
15. Revisión de Carlos.
16. Correcciones puntuales.
17. Validación final.

## 52.5 Flujo para aplicación ya creada

1. Guardar baseline.
2. Confirmar que la app instala y ejecuta.
3. Impeccable init o document.
4. Generar o actualizar PRODUCT.md.
5. Generar o actualizar DESIGN.md.
6. Impeccable shape.
7. Taste/redesign cuando corresponda.
8. Definir dirección visual, UX, tokens y assets.
9. Normalización técnica y visual coordinada.
10. Impeccable critique.
11. Impeccable audit.
12. Impeccable polish.
13. Revisión de Carlos.

No se espera a finalizar toda la normalización técnica para trabajar la interfaz, ni se rediseña antes de comprobar que el repositorio instala y ejecuta.

## 52.6 Lo que Impeccable recoge

web, aplicación, plataforma o producto híbrido; propósito; público; personalidad; voz; dirección visual; referencias y antirreferencias; tipografía; colores; densidad; navegación; componentes; responsive; necesidades de assets; restricciones técnicas y de despliegue relevantes.

# 53. Normalización de aplicaciones existentes

Para cada aplicación incluida, en este orden:

1. registra inventario inicial;
2. comprueba que instala y ejecuta;
3. aplica Impeccable init o document;
4. genera o actualiza PRODUCT.md;
5. genera o actualiza DESIGN.md;
6. Impeccable shape;
7. Taste cuando corresponda;
8. dirección visual, UX, tokens y assets;
9. aplica la estructura del estándar;
10. normaliza TypeScript;
11. revisa dependencias;
12. configura variables de entorno;
13. separa acceso a datos (servicios + adaptadores);
14. revisa autenticación y RLS;
15. normaliza seguridad;
16. ejecuta lint, typecheck, pruebas y build;
17. Impeccable critique + audit + polish;
18. documenta errores preexistentes;
19. documenta excepciones justificadas;
20. realiza commits pequeños por hito;
21. resultado final documentado.

No se rediseñan interfaces ni se inventan funcionalidades: se conserva la intención actual salvo que un cambio sea necesario por responsive, accesibilidad, rendimiento, seguridad o funcionamiento correcto.

# 54. Política de actualización de dependencias

Objetivo: mantener las aplicaciones del ecosistema alineadas y funcionales, sin perseguir cada versión nueva ni dejar que las herramientas queden desactualizadas sin criterio.

## 54.1 Unidad de cambio: minor, no patch

- Los parches (19.2.8 → 19.2.9) no se persiguen manualmente: los rangos caret (`^19.2.7`) los absorben en cada `npm install` sin tocar package.json.
- Solo se registra un parche manual si corrige un bug o fallo de seguridad que afecta a la aplicación.

## 54.2 Ventana de actualización trimestral

Cada 3 meses se ejecuta la ventana de actualización:

1. en cada app: `npm outdated`;
2. actualizar de una vez los minors del stack core (`19.2 → 19.3`);
3. validar en cada app: lint, typecheck, pruebas y build;
4. commit por app con el resultado de la validación.

Fuera de la ventana no se actualizan minors, salvo excepción aprobada.

## 54.3 Majors = proyecto de migración

Un cambio de major (React 19 → 20, Vite 8 → 9, TypeScript 6 → 7, lucide 1 → 2, etc.) nunca es automático: se decide explícitamente, se planifica como proyecto de migración por app y se documenta como decisión (docs/decisions/).

## 54.4 Seguridad: inmediata

Cualquier advisory o parche de seguridad se aplica de inmediato en todas las apps, sin esperar la ventana trimestral.

## 54.5 Alineación del ecosistema (stack core)

El stack core debe mantener el mismo major.minor que la baseline del ecosistema (la versión usada por la mayoría de las apps):

- react y react-dom
- react-router-dom
- vite y @vitejs/plugin-react
- tailwindcss y @tailwindcss/vite
- @supabase/supabase-js
- typescript
- oxlint
- lucide-react
- vitest

Reglas:

- al crear una app nueva se parte de la baseline vigente del ecosistema;
- al actualizar, se actualizan juntas las apps del mismo stack core;
- toda desviación (p. ej. lucide 0.475 en la web por iconos de marca) se declara como excepción documentada en el repo y en este estándar;
- una app puede quedar atrás temporalmente por compatibilidad, pero debe registrar la deuda y programar su actualización en la siguiente ventana.

## 54.6 Registro

Cada ventana trimestral deja un registro en docs/decisions/ con el estado de `npm outdated` por app y lo que se actualizó o se difirió, con su motivo.

# 55. Gestión de Cookies y Privacidad

## 55.1 Solución nativa obligatoria
Los proyectos web desarrollados bajo este estándar **no deben utilizar plugins de terceros pesados** (como Cookiebot, OneTrust o similares) para el aviso de cookies, ya que impactan negativamente en el rendimiento (LCP, scripts externos bloqueantes) y rompen la estética del sitio.

## 55.2 Implementación
Todo aviso de cookies debe construirse como un componente nativo de React (`CookieBanner.jsx`) que cumpla con:
- Aparecer de forma no intrusiva (ej. con retraso de 1-2 segundos) usando `framer-motion` o CSS para transiciones suaves.
- Estar integrado directamente en el layout principal (ej. `App.jsx` o `RootLayout.tsx`).
- Almacenar el consentimiento explícito ("Aceptar todo" o "Rechazar") en el `localStorage` (ej. `qaway_cookie_consent`).
- Respetar el esquema visual de la marca y la paleta de colores del ecosistema (dark mode por defecto en notificaciones).

# 56. Seguridad y Scripts en Producción

## 56.1 Prohibición de scripts locales
Está estrictamente prohibido commitear y desplegar a producción scripts de recarga en vivo o herramientas de desarrollo local (ej. `<script src="http://localhost:8400/live.js"></script>`, inyecciones de extensiones de VSCode, Live Server, etc.).

## 56.2 Riesgo asociado (Local Network Access)
La presencia de llamadas a `localhost` en un sitio público y seguro (`https://`) activa inmediatamente las defensas del navegador, disparando cuadros de diálogo de seguridad intrusivos como _"Acceder a otras aplicaciones y servicios de este dispositivo" (Local Network Access)_. Esto genera pánico en los usuarios, quiebra la confianza en la marca y daña la experiencia en producción.

## 56.3 Control y auditoría
Antes de cualquier despliegue definitivo a producción (ver **Aprobación 4**), se debe auditar el `index.html` y el entrypoint principal para asegurar que no existan scripts de desarrollo residuales.
