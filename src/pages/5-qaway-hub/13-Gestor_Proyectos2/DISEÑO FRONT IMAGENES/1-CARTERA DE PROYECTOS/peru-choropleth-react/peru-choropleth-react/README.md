# Mapa coroplético del Perú — React

## Dependencias

```bash
npm install maplibre-gl
```

## Archivos

- `src/components/PeruChoropleth.jsx`
- `src/components/PeruChoropleth.css`
- `src/MapaRegional.example.jsx`

## Integración

Copia los dos archivos del componente a tu proyecto e importa:

```jsx
import PeruChoropleth from "./components/PeruChoropleth";
```

Pasa `regionMetrics` con los datos reales de tus regiones. Las claves deben ser nombres de departamentos (se normalizan tildes y mayúsculas).

```jsx
<PeruChoropleth regionMetrics={datosRealesPorRegion} />
```

## Cartografía

El componente usa el GeoJSON departamental de Perú publicado por `juaneladio/peru-geojson`:

https://github.com/juaneladio/peru-geojson

El repositorio publica geometrías departamentales, provinciales y distritales. La capa usada aquí es departamental. Verifica la licencia, vigencia y adecuación institucional antes de producción. Para una plataforma pública/estatal, se recomienda validar la cartografía con una fuente oficial (por ejemplo, GeoPerú/INEI) y alojar el GeoJSON validado dentro del propio proyecto, en vez de depender de GitHub en tiempo de ejecución.

## Importante

- El mapa representa los 25 departamentos/regiones, no límites de UGEL.
- El color se calcula a partir del `progress` que entregues:
  - 80–100: Cumple
  - 1–79: En proceso
  - 0: No cumple
  - `null` o ausente: Sin reporte
- Los umbrales son reglas de demostración; deben ajustarse a la metodología oficial del proyecto.
- Los valores del archivo `MapaRegional.example.jsx` son ilustrativos, no datos reales del MINEDU.
- El estilo base de mapa usa OpenFreeMap. Revisa sus condiciones de uso y disponibilidad para producción.
