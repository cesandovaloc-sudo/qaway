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
