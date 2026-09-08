# DESIGN.md — Sistema de Inventario Qaway

## Dirección Visual

### Personalidad
- **Profesional** — Software de operaciones, no una landing
- **Limpio** — Sin ornamentación innecesaria
- **Eficiente** — Información clara y accesible
- **Moderno** — Estética actual sin ser genérica

### Tono visual
- Herramienta de trabajo seria
- Densidad controlada (no saturada)
- Contraste adecuado para legibilidad
- Espaciado consistente

---

## Paleta de Colores

### Tokens principales
```css
:root {
  /* Marca */
  --color-brand: #f97316;        /* Orange-500 */
  --color-brand-light: #fb923c;  /* Orange-400 */
  --color-brand-dark: #ea580c;   /* Orange-600 */

  /* Neutros */
  --color-ink: #111827;          /* Gray-900 */
  --color-muted: #6b7280;        /* Gray-500 */
  --color-surface: #f9fafb;      /* Gray-50 */
  --color-surface-muted: #e5e7eb; /* Gray-200 */

  /* Estados */
  --color-success: #22c55e;      /* Green-500 */
  --color-warning: #f59e0b;      /* Amber-500 */
  --color-error: #ef4444;        /* Red-500 */
  --color-info: #3b82f6;         /* Blue-500 */
}
```

### Uso de colores
| Contexto | Color | Ejemplo |
|----------|-------|---------|
| Acción principal | Brand (Orange) | Botones primarios, links activos |
| Texto principal | Ink (Gray-900) | Títulos, contenido |
| Texto secundario | Muted (Gray-500) | Descripciones, labels |
| Fondos | Surface (Gray-50) | Backgrounds de página |
| Bordes | Surface Muted (Gray-200) | Dividers, cards |
| Éxito | Green | Estados activos, guardado |
| Advertencia | Amber | Stock bajo, alertas |
| Error | Red | Errores, eliminación |
| Info | Blue | Informativo, enlaces |

---

## Tipografía

### Fuentes
```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Escala tipográfica
| Elemento | Tamaño | Peso | Uso |
|----------|--------|------|-----|
| Display | 2xl (24px) | Semibold | Títulos de página |
| Heading | lg (18px) | Semibold | Títulos de sección |
| Body | sm (14px) | Regular | Contenido principal |
| Caption | xs (12px) | Regular | Labels, metadata |
| Mono | xs (12px) | Regular | SKUs, códigos |

---

## Espaciado

### Sistema de spacing
| Token | Valor | Uso |
|-------|-------|-----|
| 1 | 4px | Padding mínimo |
| 2 | 8px | Spacing entre elementos pequeños |
| 3 | 12px | Padding de cards |
| 4 | 16px | Spacing estándar |
| 5 | 20px | Padding de secciones |
| 6 | 24px | Gap entre cards |
| 8 | 32px | Spacing entre secciones |

---

## Componentes

### Cards
```tsx
// Card estándar
<div className="bg-white rounded-xl border border-gray-200 p-5">

// Card con hover
<div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">

// Card seleccionada
<div className="bg-white rounded-xl border-2 border-orange-500 p-5">
```

### Botones
```tsx
// Primario
<button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">

// Secundario
<button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">

// Peligro
<button className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
```

### Inputs
```tsx
// Input estándar
<input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">

// Input con icono
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  <input className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg" />
</div>
```

### Badges/Tags
```tsx
// Badge estándar
<span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">

// Badge de estado
<span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
```

---

## Layout

### Sidebar
- Ancho: 260px (expandido) / 72px (colapsado)
- Color fondo: Gray-900 (Ink)
- Posición: Fixed left
- Transición: 300ms

### Contenido principal
- Margen left: 260px (o 72px si sidebar colapsado)
- Padding: 32px
- Max-width: None (fluid)

### Header de página
- Flex justify-between
- Título + subtítulo a la izquierda
- Acciones a la derecha

---

## Iconos

### Librería
Lucide React

### Tamaños
| Contexto | Tamaño | Ejemplo |
|----------|--------|---------|
| Sidebar | 18px | Navegación |
| Cards | 16px-18px | Acciones |
| Botones | 14px-16px | Interior de botones |
| Stats | 18px | Dashboard |

### Colores
- Iconos heredan color del texto padre
- Iconos de estado usan colores semánticos

---

## Tablas

### Estructura
```tsx
<table className="w-full">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
  </thead>
  <tbody className="divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
```

### Selección
- Checkbox en primera columna
- Fila seleccionada: `bg-orange-50`
- Barra de acciones aparece abajo

---

## Formularios

### Modal
```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
    {/* Header */}
    <div className="px-6 py-4 border-b border-gray-200">
    {/* Content */}
    <div className="p-6 space-y-4 overflow-y-auto">
    {/* Footer */}
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
  </div>
</div>
```

---

## Estados de carga

### Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
</div>
```

### Spinner
```tsx
<Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
```

### Empty state
```tsx
<div className="text-center py-12">
  <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-900 mb-1">Título</h3>
  <p className="text-sm text-gray-500">Descripción</p>
</div>
```

---

## Responsive

### Breakpoints
| Breakpoint | Ancho | Uso |
|------------|-------|-----|
| sm | 640px | Tablets |
| md | 768px | Tablets landscape |
| lg | 1024px | Desktop |
| xl | 1280px | Desktop grande |

### Patrones
- **Móvil**: Stack vertical, cards completos
- **Tablet**: 2 columnas
- **Desktop**: 3-4 columnas, sidebar visible

---

## Accesibilidad

### Requisitos
- HTML semántico
- Labels en todos los inputs
- Focus visible
- Contraste WCAG AA
- Navegación por teclado
- ARIA labels cuando sea necesario

---

## Animaciones

### Transiciones estándar
```css
transition-colors duration-200  /* Colores */
transition-shadow duration-200  /* Sombras */
transition-transform duration-200 /* Transformaciones */
```

### Hover states
- Cards: `hover:shadow-md`
- Botones: `hover:bg-{color}-700`
- Filas: `hover:bg-gray-50`

---

## Dark mode (futuro)

No implementado en MVP. Preparar tokens semánticos para facilitar la migración.

---

## Archivos de referencia

- `src/index.css` — Tokens globales
- `src/components/` — Componentes reutilizables
- `tailwind.config.js` — Configuración Tailwind
