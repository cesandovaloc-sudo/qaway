# Guía de Diseño – Catálogo de Categorías

Este documento describe la **aplicación** de la política de diseño que reside en `DESIGN.md` a la página de **categorías** (`/hub/inventario/logistica/categorias`). No se modifica la estructura ni los datos, solamente se especifica cómo deben representarse los UI‑elementos.

## 1. Layout general

- **Contenedor principal**: `w-full px-4 md:px-8 py-6` (piensa en la `max-w-container` del sistema de enlaces raíz).  
- **Sidebar**: permanece fijo a la izquierda (260 px) con color de fondo `bg-gray-900`.  
- **Área de contenido**: `ml-260 md:ml-72` dependiendo de la colapsación, con `gap-6` entre filas.

## 2. Tabla de categorías

| Atributo | Clase Tailwind propuesta | Comentario |
|-----------|------------------------|-------------|
| `thead`  | `bg-gray-50` | Fondo del encabezado |
| `th`     | `px-4 py-3 text-xs font-medium text-gray-500 uppercase` | Igual al esquema general |
| `tbody tr`  | `hover:bg-orange-50 transition-colors` | Resalta con el tono de acción principal |
| `td`     | `px-4 py-3` | El contenido de la columna |
| Primera columna (`id` o `checkbox`) | `w-8` | Tamaño fijo |
| Acciones | `flex space-x-2` | Botones con clases de `btn-primario`, `btn-secundario` |

> **Tip**: Para filas seleccionadas, añadir `bg-orange-50` y mostrar la barra de acciones flíndaba con `bg-white` en la parte inferior.

## 3. Filtros y búsqueda

- **Input/Select**: `w-full md:w-64` con `border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500` y un icono de búsqueda a la izquierda (posicionado con `relative`).
- **Botón de aplicar**: `px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors`.
- **Botón de reset**: `px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors`.

## 4. Paginación

- **Botones**: `btn-secundario` con un icono `<ChevronLeft />` / `<ChevronRight />`.  
- **Estado**: `text-gray-500` cuando la página está inactiva.

## 5. Acciones de fila

- **Botón de edición**: `text-orange-600 hover:text-orange-700` con `width: 18px; height: 18px`.  
- **Botón de eliminación**: `text-red-600 hover:text-red-700` con similar tamaño.

> Todas las interacciones siguen el patrón `transition-colors duration-200`.

## 6. Responsividad

| Breakpoint | Ajustes |
|------------|---------|
| `<md` | La tabla se vuelve `w-full`, la barra lateral se colapsa (`w-72`). Los filtros se apilan verticalmente.
| `md`+ | Saltar a la vista de escritorio, tabla normal y sidebar expandido.

## 7. Accesibilidad

- Todos los `<th>` y `<td>` deben posicionar el rol adecuado.  
- Inputs reciben `label` con `htmlFor`.  
- Acciones de fila incluyen `aria-label` descriptivo.

---

> Si necesitas ejemplos concretos de código JSX, puedes seguir la plantilla de la tabla que aparece en `DESIGN.md` (sección **Tablas**) y aplicar las clases indicadas.

---

**Nota**: No se modifica ningún dato ni la estructura de la página, solo se describe cómo aplicar la política visual descrita en `DESIGN.md`.---
