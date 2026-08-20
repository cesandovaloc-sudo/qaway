# Saniclick Web

Implementación React + TypeScript + Vite + Tailwind CSS 4 de la web de Saniclick, siguiendo el orden visual aprobado en las referencias enviadas.

## Incluye

- Hero completo con navbar flotante blanco.
- Imagen de fumigación con overlay oscuro.
- Barra de beneficios en turquesa.
- Categorías de necesidades.
- Servicios en tarjetas altas y aireadas.
- Dos bloques visuales de sanidad y mantenimiento.
- Bloque flotante oscuro de trabajos realizados con filtros.
- Barra de calidad/capacitación/atención/compromiso ambiental.
- Testimonios + proyecto destacado.
- FAQ interactivo.
- CTA final.
- Footer.
- Animaciones de entrada con IntersectionObserver + Motion.
- Hover/microinteracciones en tarjetas, botones, imágenes y navegación.
- Responsive 360 / 768 / 1280+.
- `prefers-reduced-motion`.
- Assets locales derivados de las referencias visuales suministradas.

## Ejecutar

```bash
npm install
npm run dev
```

Validaciones:

```bash
npm run typecheck
npm run lint
npm run build
```

## Cambios de contenido

Los textos y datos de servicios, proyectos, testimonios y FAQ están en:

`src/data/site.ts`

## Imágenes

Las imágenes están en:

`public/images/`

Son recortes de alta calidad de las referencias visuales proporcionadas en este proyecto. Para producción, se recomienda sustituirlas por los archivos fotográficos originales en resolución nativa, manteniendo los mismos nombres o actualizando las rutas.

## Siguiente integración

El WhatsApp está apuntando a un número de ejemplo (`51998123456`). Sustituirlo antes de producción.

No se han conectado APIs, Supabase, formularios de producción ni analítica todavía.
