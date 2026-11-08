# Mapa analítico territorial estilo Power BI — React

## Dependencia

```bash
npm install maplibre-gl
```

## Integración

Copia:
- `src/components/PeruPowerBIMap.jsx`
- `src/components/PeruPowerBIMap.css`

Importa el componente y entrega `regionData` con métricas reales.

## Cómo funciona

- Los polígonos departamentales se muestran como contexto geográfico tenue.
- Las burbujas se colocan en el centroide geométrico aproximado de cada departamento.
- El color indica el estado de cumplimiento.
- El tamaño indica la magnitud definida en `bubbleValue` (o `ugelCount`).
- Al seleccionar una burbuja se muestra el detalle analítico.

## Datos geográficos

Por defecto utiliza un GeoJSON departamental remoto del repositorio juaneladio/peru-geojson. Para producción se recomienda descargar, validar y servir el archivo GeoJSON oficial desde el propio proyecto, o pasarlo mediante la propiedad `geojson`.

## Precisión importante

El centroide calculado en este ejemplo es un promedio de vértices, no un centroide cartográfico garantizado. Para un tablero nacional departamental es una aproximación visual. Para visualizar UGEL individuales, usa coordenadas geográficas reales por UGEL y crea un GeoJSON de puntos; no reutilices centroides departamentales.

## Datos

Los valores del ejemplo son demostrativos. No representan cifras oficiales ni datos reales del MINEDU. Los umbrales de estado (>=80, >0, 0) son ilustrativos y deben alinearse con las reglas de negocio del proyecto.
