# Brief para agente creador de páginas

Construir/implementar este case study como una experiencia editorial visual, no como una landing comercial convencional.

## Referencias
Usar `public/references/reference-case-study-01.png` y `reference-case-study-02.png` como referencias de ritmo, composición y tratamiento de portfolio. No copiarlas literalmente.

## Objetivo
Vender la capacidad de Qaway Lab mostrando un proyecto completo: estrategia, identidad, experiencia web, responsive, detalles de UX, aplicaciones de marca e integración digital.

## Regla principal de composición
No colocar explicación larga a la izquierda en todas las secciones.

Alternar:
- explicación breve + flujo/iconos;
- sección visual-only;
- mockups;
- fotografía full-bleed;
- identidad;
- galería;
- video;
- aplicaciones de marca.

Las secciones visual-only deben poder entenderse sin párrafos.

## Superficies
Usar principalmente:
- fondo oscuro/verde profundo del proyecto;
- crema/papel;
- dorado de marca;
- fotografías full-bleed;
- imágenes con overlay;
- nunca usar el naranja de Qaway como color dominante del proyecto.

## Video
Mantener dos espacios:
1. Hero: video/presentación del proyecto.
2. Mitad del recorrido: video de navegación/microinteracciones.

Ambos deben tener poster, controles y fallback accesible cuando se conecten los videos reales.

## Secciones obligatorias
1. Hero + video.
2. Introducción compacta con flujo.
3. Fotografía full-bleed.
4. Identidad visual: logo, paleta, tipografías y aplicaciones.
5. Experiencia web con mockups.
6. Galería de páginas principales.
7. Detalles de diseño/UX visuales: navegación, CTA, formularios, WhatsApp, mapa, responsive, iconografía.
8. Video de recorrido.
9. Aplicaciones de marca.
10. Mobile/microinteracciones.
11. Resultados/aporte del proyecto.
12. CTA sobre imagen.
13. Navegación entre proyectos.

## Arquitectura
Mantener:
- contenido separado de componentes;
- tokens semánticos;
- componentes reutilizables;
- TypeScript estricto;
- responsive desde la arquitectura;
- Motion solo para UI/microinteracciones;
- GSAP solo si después se decide implementar scroll storytelling;
- imágenes reales optimizadas en producción;
- video lazy cuando no esté en el primer viewport;
- no exponer secretos.

## Assets
Los SVG incluidos son placeholders funcionales. Sustituirlos por:
- fotografía arquitectónica real;
- fotografía de interiores;
- videos;
- mockups reales;
- aplicaciones de identidad finales.

No publicar las imágenes de referencia entregadas en `public/references`.
