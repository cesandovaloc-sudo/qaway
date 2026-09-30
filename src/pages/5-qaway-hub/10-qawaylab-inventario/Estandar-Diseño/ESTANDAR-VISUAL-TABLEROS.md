# Estándar visual de tableros

## Referencia auditada

- Ruta: `/hub/inventario/logistica`
- Pantalla: **Productos**
- Punto de entrada: `src/pages/inventory/ProductsPage.tsx`
- Implementación renderizada: `imagen-diseño/1-ResumenPanel/2-ProductosPanel.jsx`
- Namespace visual actual: `.pxp-*`
- Fuente de los valores: CSS embebido del panel y `src/index.css`.

Este documento fija el patrón para que los tableros operativos de la app compartan la misma jerarquía, densidad y comportamiento visual. No define contenido, reglas de negocio ni datos.

## Composición obligatoria

```text
Sidebar + barra superior
└─ Contenido de módulo
   ├─ Encabezado: icono + título + subtítulo + acciones
   ├─ Métricas: 5 tarjetas en escritorio
   ├─ Barra de herramientas: búsqueda + filtros + vista
   └─ Tabla: encabezado + filas + estados + paginación
```

El orden se conserva en módulos de logística, ventas, compras, clientes, proveedores, reportes y configuraciones con listado. Cuando un módulo no tenga métricas, la barra de herramientas pasa inmediatamente después del encabezado.

## Tokens verificados

```css
/* src/index.css */
@theme {
  --color-brand: #ff4b0b;
  --color-brand-light: #ff7a45;
  --color-brand-bright: #ff9b73;
  --color-brand-hover: #e03f06;

  --color-ink: #111111;
  --color-ink-2: #18181b;
  --color-ink-3: #1f1f23;
  --color-ink-4: #27272a;
  --color-muted: #71717a;
  --color-muted-light: #a1a1aa;
  --color-surface: #f5f5f5;
  --color-surface-muted: #f2f1ef;

  --font-display: "Space Grotesk", "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

El panel de Productos utiliza además estos tokens locales. Deben convertirse en tokens compartidos antes de replicar el patrón en más módulos.

```css
/* imagen-diseño/1-ResumenPanel/2-ProductosPanel.jsx */
.pxp-root {
  --blue: #ff4b0b;   /* nombre histórico; semánticamente es brand */
  --ink: #17233b;
  --muted: #71809e;
  --line: #e5ebf4;
  --soft: #f5f8fc;
  --green: #059669;
  --red: #e11d48;
  --amber: #d97706;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f7f9fc;
  font-size: 14px;
}
```

### Equivalencia recomendada

| Uso | Valor de referencia | Token semántico propuesto |
| --- | --- | --- |
| Acción primaria | `#ff4b0b` | `--color-brand` |
| Hover primario | `#e03f06` | `--color-brand-hover` |
| Texto principal del tablero | `#0f172a` | `--table-text-primary` |
| Texto secundario | `#64748b` | `--table-text-secondary` |
| Borde principal | `#e5ebf4` | `--table-border` |
| Separador de fila | `#f1f5f9` | `--table-row-border` |
| Fondo de encabezado y hover | `#f8fafc` | `--table-header-bg` |
| Zebra | `#fafafa` | `--table-zebra-bg` |
| Éxito | `#166534` / `#f0fdf4` | `--status-success-*` |
| Advertencia | `#b45309` / `#fffbeb` | `--status-warning-*` |

## Tipografía

```css
/* Base */
.pxp-root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; font-size: 14px; }

/* Encabezado de página */
.pxp-heading h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.8px;
  color: #111b2d;
}

/* Métrica */
.pxp-metric-label { font-size: 12px; font-weight: 600; color: #52525b; }
.pxp-metric-value { font-size: 26px; font-weight: 800; letter-spacing: -0.6px; color: #0f172a; }
.pxp-metric-note { font-size: 11px; font-weight: 500; color: #71717a; }

/* Tabla */
.pxp-table th { font-size: 13px; font-weight: 700; letter-spacing: 0.2px; color: #475569; }
.pxp-table td { font-size: 14.5px; color: #334155; }
.pxp-product-name { font-size: 14.5px; font-weight: 700; color: #0f172a; }
.pxp-product-sub { font-size: 12px; color: #64748b; }
```

Reglas:

- `Inter` es la fuente de interfaz y datos. `Space Grotesk` queda reservada para la familia de display global, no para convertir cada celda en un titular.
- El título de pantalla es único: `28px / 700`.
- Los títulos de columnas no se escriben en mayúsculas. La tabla de Productos usa `13px / 700` con `letter-spacing: 0.2px`.
- SKU, códigos internos y valores técnicos usan `JetBrains Mono` en `12px` cuando se requiera diferenciación.
- Los números operativos importantes usan peso `700` u `800`; las descripciones, `400` o `500`.

## Layout, bordes y radios

```css
.pxp-content { padding: 22px 20px; max-width: 1800px; margin: auto; }
.pxp-heading { gap: 14px; margin-bottom: 22px; }
.pxp-metrics { grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }

.pxp-metric {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.pxp-toolbar {
  padding: 12px;
  gap: 10px;
  border: 1px solid #e5ebf4;
  border-radius: 11px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.pxp-table-wrap {
  background: #fff;
  border: 1px solid #e5ebf4;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
```

Reglas:

- Superficies operativas: fondo blanco, borde de `1px`, radio entre `8px` y `12px`.
- No usar tarjetas dentro de tarjetas. La fila de métricas y el contenedor de tabla son superficies hermanas.
- Las sombras son de elevación mínima; el borde hace la mayor parte del trabajo visual.
- En escritorio, conservar contenido fluido y ancho máximo de `1800px`.

## Encabezado y acciones

```css
.pxp-heading-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f4f4f5;
  border: 1px solid #e4e4e7;
}

.pxp-btn {
  border: 1px solid #e5ebf4;
  background: #fff;
  color: #34415b;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 600;
}

.pxp-btn.primary {
  background: #ff4b0b;
  border-color: #ff4b0b;
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 75, 11, 0.25);
}

.pxp-btn.dark { background: #14213c; border-color: #14213c; color: #fff; }
```

- Orden de acciones: secundarias, acción oscura contextual y acción primaria de marca al extremo derecho.
- Las acciones con icono conservan `gap: 8px` y una altura equivalente a los filtros.
- La acción primaria usa naranja únicamente para ejecutar una creación, confirmación o avance principal; no para acciones auxiliares.

## Métricas

```css
.pxp-metric-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f4f4f5;
  color: #52525b;
}

.pxp-metric:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}
```

Cada métrica contiene: icono, label, valor, nota y, opcionalmente, tendencia lineal. La grilla es de cinco columnas en escritorio; en tamaños menores debe reducirse sin comprimir el texto.

## Barra de herramientas

```css
.pxp-toolbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.pxp-search {
  height: 38px;
  min-width: 220px;
  max-width: 480px;
  border: 1px solid #e5ebf4;
  background: #f9fbfd;
  border-radius: 8px;
  padding: 0 12px;
}

.pxp-select {
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
}
```

- Búsqueda a la izquierda; filtros después; selector de vista alineado al extremo derecho.
- Input y select tienen altura `38px`.
- El foco de controles es naranja: `border-color: #ff4b0b` y halo `0 0 0 3px rgba(255, 75, 11, 0.1)`.
- Mantener la barra sticky solo en tableros cuyo listado sea largo.

## Tabla, zebra y estados

```css
.pxp-table { width: 100%; border-collapse: collapse; min-width: 940px; }

.pxp-table th {
  background: #f8fafc;
  padding: 15px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.pxp-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.pxp-table tbody tr:nth-child(even) { background: #fafafa; }
.pxp-table tbody tr:hover { background: #f8fafc; }

.pxp-product-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}
```

Reglas no negociables:

- Zebra: solo filas pares `#fafafa`; no usar alternancias oscuras ni contrastes fuertes.
- Hover: `#f8fafc`, distinguible pero sin competir con una fila seleccionada.
- Selección: `bg-brand/5`; no sustituye el estado semántico de una celda.
- Celda principal: icono/miniatura de `42px`, nombre en `700`, segundo renglón descriptivo en `12px`.
- Columnas de datos se alinean según su tipo: texto a la izquierda, números a la derecha cuando el escaneo lo requiera, y acciones al extremo derecho.
- La tabla requiere scroll horizontal bajo `940px` de ancho interno; no reducir arbitrariamente los textos hasta perder legibilidad.

```css
.pxp-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  padding: 4px 9px;
  font-size: 12px;
  font-weight: 650;
}

.pxp-badge.ok   { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.pxp-badge.low  { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
.pxp-badge.zero { background: #f4f4f5; color: #52525b; border: 1px solid #e4e4e7; }
```

## Iconografía e interacción

- Librería del panel: `lucide-react`.
- Iconos en controles: `16px` a `20px`.
- Iconos de métrica: contenedor de `28px`; icono visual de `16px` a `18px`.
- Cada icono sin texto debe tener `title` o `aria-label`.
- El foco global actual es visible y consistente:

```css
:focus-visible {
  outline: 2px solid var(--color-brand);
  outline-offset: 2px;
}
```

## Adaptación responsive

```css
/* Patrón mínimo */
@media (max-width: 1280px) {
  .pxp-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .pxp-content { padding: 16px; }
  .pxp-heading-actions { width: 100%; margin-left: 0; overflow-x: auto; }
  .pxp-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pxp-toolbar { align-items: stretch; }
  .pxp-search { max-width: none; width: 100%; }
}

@media (max-width: 480px) {
  .pxp-metrics { grid-template-columns: 1fr; }
}
```

## Aplicación en los próximos tableros

Todo listado nuevo debe reutilizar o extraer los siguientes primitivos, sin volver a declarar una variante propia:

```text
DashboardPageHeader
DashboardMetricCard
DashboardToolbar
DashboardTable
DashboardStatusBadge
DashboardEmptyState
DashboardPagination
```

Los nombres `.pxp-*` identifican la implementación actual de Productos. La siguiente etapa técnica es extraerlos a componentes y tokens compartidos para que Ventas, Compras, Clientes, Proveedores y Reportes consuman exactamente las mismas reglas visuales.



EXTRAS:
---

# Reglas de implementación, alcance y auditoría visual

## 1. Breakpoints y diseño responsive

El breakpoint de referencia para la adaptación móvil de los tableros es de 800 px.

- Breakpoint móvil: 800 px.
- Padding vertical móvil: 16 px.
- Padding horizontal móvil: 12 px.

Un módulo puede utilizar un breakpoint diferente únicamente cuando documente expresamente la excepción y su justificación.

Estos valores deben aplicarse a la superficie del tablero, sin alterar el comportamiento responsive del shell global.

## 2. Separación entre shell global y superficie del tablero

El estándar distingue dos niveles de interfaz:

### 2.1. Shell global de la aplicación

Incluye los elementos compartidos de navegación y estructura general:

- Sidebar.
- Barra superior.
- Navegación global.
- Permisos y elementos externos al módulo.

Estos elementos se documentan en el estándar del shell global y no deben considerarse parte del tablero cuando no estén presentes en el JSX del panel auditado.

### 2.2. Superficie propia del tablero

Incluye los elementos específicos del módulo:

- Encabezado del módulo.
- Métricas.
- Barra de herramientas (toolbar).
- Tabla.
- Paginación.

Las modificaciones visuales de un tablero deben limitarse a su superficie, salvo que se solicite expresamente modificar el shell global.

## 3. Tokens y precedencia de estilos

Los estilos de los tableros se organizan en dos niveles:

### 3.1. Tokens globales

Los tokens definidos en `src/index.css` establecen la base compartida de marca, colores y tipografía.

### 3.2. Variables locales del tablero

Las variables CSS locales definen los valores específicos de cada tablero.

Cuando exista una variable local con el mismo propósito visual que un token global, prevalece la variable local del namespace del tablero para ese panel.

### 3.3. Fuentes de estilos que deben revisarse

Antes de modificar o documentar un tablero, deben revisarse:

- Tokens globales.
- Variables CSS locales.
- CSS embebido.
- Estilos inline.
- Componentes visuales auxiliares.
- Reglas responsive.

No se deben asumir valores finales únicamente a partir de una clase CSS o de un token sin comprobar su aplicación efectiva.

## 4. Auditoría visual y verificación

Toda auditoría visual debe distinguir entre:

1. Valores declarados en el código fuente.
2. Valores heredados de estilos globales.
3. Valores computados y efectivamente aplicados en el navegador.
4. Valores que no pudieron verificarse.

Cuando no se disponga de evidencia suficiente, el valor debe marcarse como no verificado.

No se deben inventar valores, asumir equivalencias entre módulos ni convertir recomendaciones de diseño en reglas existentes del estándar.

Las excepciones específicas de un módulo deben documentarse expresamente.

---

## Tipografía específica de Categorías

- Las celdas de `.cat-table` utilizan `font-size: 14.5px`, `color: #334155` y `padding: 16px`.
- Los nombres de categoría heredan la tipografía de la celda de tabla.
- Las descripciones de categoría también heredan la tipografía de la celda.
- Las descripciones se limitan en JSX a 47 caracteres y agregan `…` cuando superan ese límite.
- `.cat-category-cell` aplica `font-weight: 550`, `color: #253653`, `display: flex`, `align-items: center` y `gap: 13px` al nombre y su contenedor.
- Las descripciones no tienen una regla propia de peso ni `line-height`; heredan los valores de `.cat-table td` y de la cascada global.
- No se declara un `line-height` específico para nombres ni descripciones en el panel.

## Iconografía de Categorías

- Los iconos de categoría se representan mediante caracteres Unicode y emojis almacenados en `categoryIcons` y en los datos de cada categoría.
- La selección inicial de iconos está definida por el array `categoryIcons`.
- La presentación final depende de la fuente y del renderizador Unicode del navegador.
- `.cat-icon-box` tiene `width: 36px`, `height: 36px`, `border-radius: 9px`, `display: grid`, `place-items: center`, `font-size: 20px` y `flex-shrink: 0`.
- Su borde declarado es `1px solid #e2e8f0`; su fondo y color se aplican inline mediante `iconBg(c.color)`.
- El fondo del icono se genera dinámicamente mediante `iconBg(c.color)`.

## Estados de Categorías

- El estado se renderiza mediante `.cat-status`.
- La clase `inactive` se aplica cuando la categoría está inactiva.
- La clase `empty` se aplica cuando la categoría no tiene productos.
- Cuando una categoría está activa y tiene cero productos, el texto visible se reemplaza por `Sin productos`.
- `.cat-status` usa `display: inline-flex`, `align-items: center`, `padding: 5px 10px`, `border-radius: 7px`, `font-size: 12px`, `font-weight: 600`, `background: #def8ed` y `color: #059669`.
- `.cat-status.inactive` usa `background: #f1f4f8` y `color: #748198`.
- `.cat-status.empty` usa `background: #fee8eb` y `color: #dc2626`.
- No se declara un `border` ni un `line-height` específico para `.cat-status`.

## Tabla de Categorías

- `.cat-table` tiene `min-width: 940px` y `border-collapse: collapse`.
- Las cabeceras utilizan:
  - Fondo: `#f8fafc`.
  - Padding: `15px 16px`.
  - Borde inferior: `1px solid #e2e8f0`.
  - Tamaño de fuente: `13px`.
  - Peso: `700`.
  - Espaciado entre letras: `0.2px`.
  - Color: `#475569`.
- Las celdas utilizan:
  - Padding: `16px`.
  - Borde inferior: `1px solid #f1f5f9`.
  - Tamaño de fuente: `14.5px`.
  - Color: `#334155`.
- Las filas pares utilizan el fondo `#fafafa`.
- Las filas en estado hover utilizan el fondo `#f8fafc`.
- Las filas seleccionadas utilizan el fondo `rgba(255, 75, 11, 0.05)`.

## Paginación de Categorías

- `.cat-pagination` tiene un borde superior `1px solid #f1f5f9`.
- La paginación contiene el rango de resultados, el selector de filas por página y los botones de navegación `.cat-page`.
- `.cat-pagination` usa `display: flex`, `align-items: center`, `gap: 9px`, `padding: 18px 16px` y `color: var(--muted)`; además tiene `border-top: 1px solid #f1f5f9`.
- `.cat-page` tiene `width: 36px`, `height: 36px`, `border: 1px solid var(--line)`, `border-radius: 8px`, `background: #fff`, `color: #34415b` y `cursor: pointer`.
- `.cat-page.active` usa `background: var(--blue)`, `border-color: var(--blue)` y `color: white`; en `.cat-root`, `--blue` es `#2165ed` y `--line` es `#e5ebf4`.
- No existe una regla CSS específica para `.cat-page:disabled`; su apariencia deshabilitada depende del comportamiento nativo del navegador.

## Acciones de fila

- Los botones de edición y menú de Productos y Categorías utilizan caracteres Unicode, no componentes Lucide.
- Los caracteres utilizados incluyen `✎`, `···` y `•••`.
- Productos aplica la clase `selected` al botón de menú cuando el menú está abierto.
- Categorías no aplica una clase de estado equivalente al abrir el menú.
- `.cat-icon-btn` tiene `width: 37px`, `height: 37px`, `border: 1px solid var(--line)`, `border-radius: 8px`, `background: #fff`, `color: #344b70`, `display: grid`, `place-items: center`, `font-size: 18px` y `cursor: pointer`.
- `.cat-icon-btn:hover` usa `border-color: #9dbbfa`, `color: var(--blue)` y `background: #f8fbff`.
- No existe una regla `.cat-icon-btn.selected` en el panel de Categorías.
- `.cat-actions` usa `display: flex`, `justify-content: flex-end` y `gap: 8px`.
- No se pudo confirmar mediante estilos computados ningún valor final del DOM; los valores anteriores son los declarados en el CSS embebido.




