# Qaway Lab - SEO/SXO Action Plan

Fecha: 2026-07-13
Rama: main-front

## P0 - Antes De Produccion

1. Definir rutas publicas reales en `src/config/siteVisibility.js`.
2. Mantener `hub` como interno/protegido o marcarlo `noindex`.
3. Implementar metadata por ruta: title, description, canonical, robots, OG y Twitter.
4. Crear `public/robots.txt`.
5. Crear `public/sitemap.xml` solo con rutas publicas reales.
6. Agregar JSON-LD minimo: Organization, WebSite y WebPage.

## P1 - Base SEO Por Tipo De Pagina

1. Inicio: title orientado a marca + servicios digitales con IA.
2. Estudio: schema Service y copy inicial mas claro para marca/identidad/contenido.
3. Sistemas: schema Service y casos/entregables concretos.
4. Academy: schema Course, instructor, temario, duracion, nivel y resultados.
5. Recursos: fichas indexables por recurso con autor, fecha, descripcion y relacionados.
6. Blog: BlogPosting por articulo, autor, fecha, fuentes, H2/H3 y contenido largo.
7. Landings: Product/Offer o Course segun corresponda, FAQ y prueba social verificable.

## P2 - Claridad Comercial

Agregar una capa de entrada por objetivo, especialmente en Inicio:

- Quiero construir una marca.
- Quiero automatizar mi negocio.
- Quiero aprender IA.
- Quiero descargar recursos.
- Quiero lanzar u ordenar un proyecto.

Regla recomendada: frase premium + traduccion concreta.

Ejemplo: `Menos piezas sueltas. Mas Direccion Visual.`

Complemento: `Branding, contenido e imagen profesional para que tu marca se vea clara, confiable y lista para vender.`

## P2 - E-E-A-T Y Confianza

1. Crear bloque reutilizable `Quien lo crea`.
2. Crear bloque `Metodo Qaway`.
3. Crear bloque `Casos / antes y despues`.
4. Mostrar fechas de actualizacion en blog y recursos.
5. Agregar credenciales, experiencia o responsable editorial.
6. Reemplazar metricas genericas por datos verificables.

## P2 - Performance E Imagenes

1. Revisar Academy: 15 imagenes sin alt y peso local alto.
2. Revisar Sistemas: hero PNG pesado, usar WebP/AVIF y dimensiones.
3. Revisar Inicio, Sistemas y Recursos por transferencia local elevada.
4. Usar dimensiones explicitas en imagenes criticas para evitar CLS.
5. Mantener lazy loading fuera del hero, no en imagen LCP.
6. Definir alt text descriptivo por imagen importante.

## Orden De Implementacion Sugerido

1. Visibilidad publica/noindex.
2. Sistema SEO central por ruta.
3. Sitemap, robots y canonical.
4. Schema base.
5. Reescritura de copy por objetivo.
6. Blog/recursos como contenido real.
7. Optimizacion visual/performance.
8. Re-auditoria con URL de staging o produccion.

## Criterio De Listo Para Desarrollo

Una pagina puede pasar a desarrollo/publicacion cuando cumple:

- Tiene objetivo claro en los primeros 10 segundos.
- Tiene metadata unica.
- Tiene canonical.
- Tiene H1 unico.
- Tiene CTA primario claro.
- Tiene schema si aplica.
- Tiene links internos relevantes.
- Tiene imagenes con alt.
- Si es publica, aparece en sitemap.
- Si es interna/beta, tiene `noindex` o proteccion.
