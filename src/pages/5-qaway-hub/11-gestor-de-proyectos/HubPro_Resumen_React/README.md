# HubPro — Resumen regional en React

## Archivos
- `HubProResumen.jsx`: componente React.
- `HubProResumen.css`: estilos responsive.

## Instalación
Copia ambos archivos a tu proyecto React y usa:

```jsx
import HubProResumen from "./HubProResumen";

export default function App() {
  return <HubProResumen />;
}
```

No requiere librerías de gráficos ni iconos adicionales. Los gráficos están dibujados con SVG/CSS para facilitar la adaptación.

## Datos
Los arrays `DEMO_UGEL`, `DEMO_HITOS` y `PHASES` son datos de demostración. Reemplázalos por los datos de tu API antes de usarlo como reporte oficial. Los porcentajes y estados que aparecen en la lámina son ilustrativos; no deben interpretarse como resultados oficiales de la DRE Junín.

## Integración
- Los filtros de fase, UGEL, estado y búsqueda ya filtran la tabla.
- El botón Actualizar actualiza la marca de hora local, pero no consulta una API todavía.
- Los botones “Ver detalle” emiten eventos de navegador `hubpro:open-report`. Puedes reemplazarlos por rutas React Router o callbacks.
- Los enlaces superiores son anclas de ejemplo; ajústalos a las rutas reales del producto.
- El campo Periodo es editable visualmente; conéctalo a tu selector de fechas si necesitas filtrar por rango real.

## Personalización visual
Colores principales en `:root` de `HubProResumen.css`:
- `--hp-blue`
- `--hp-green`
- `--hp-amber`
- `--hp-red`
- `--hp-bg`
