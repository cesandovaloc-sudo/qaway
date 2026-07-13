# Qaway Lab - Full SEO/SXO Audit Dev

Fecha: 2026-07-13
Entorno auditado: http://127.0.0.1:4000
Rama: main-front
Modo: desarrollo local

## Resumen Ejecutivo

Se ejecuto una auditoria completa adaptada a entorno local usando el skill SEO instalado de AgriciDaniel/codex-seo, sus instrucciones, subagentes especializados y extraccion renderizada con Playwright.

El pipeline oficial `run_headless_audit.py` no pudo auditar `localhost` ni `127.0.0.1` porque el propio skill bloquea hosts locales por seguridad SSRF. Para hacerlo funcionar en desarrollo se ejecuto un flujo equivalente: auditoria renderizada por ruta, revision tecnica, content/SXO, visual/performance, imagenes, schema, headings, enlaces, metadata y capturas desktop/mobile.

Paginas auditadas: `/`, `/estudio`, `/academy`, `/sistemas-digitales`, `/recursos`, `/blog`, `/hub`, `/landings/sistema-contenido-notion`, `/landings/identidad-visual`.

## Puntaje General

SEO Health Score estimado: 57/100
SXO/claridad comercial estimada: 68/100

Estado real: la propuesta visual tiene potencial, pero el sitio todavia no esta listo como activo SEO serio para produccion porque faltan metadatos por ruta, canonical, schema, sitemap/robots y decisiones claras de indexabilidad.

## Hallazgos Criticos

### P0 - Indexabilidad publica incompleta

En `src/config/siteVisibility.js`, varias rutas objetivo estan desactivadas en modo publico: `estudio`, `academy`, `hub`, `recursos`, `blog` y `landings`.

Impacto: si el build publico usa esa configuracion, Google no tendra paginas reales para auditar/rankear salvo las rutas visibles.

Recomendacion: decidir que rutas salen a produccion y activar solo esas. Si `hub` es interno, mantenerlo protegido/noindex.

### P0 - Metadata global repetida

Todas las rutas renderizan el mismo title: `Qaway LAB - Strategic Digital Systems`.

Todas usan la misma meta description: `Qaway LAB - Strategic Digital Systems. Proyectos digitales, contenido visual y soluciones con IA para marcas, negocios y proyectos.`

Impacto: bajo CTR, baja diferenciacion por pagina, mala interpretacion por Google/IA y poca capacidad de posicionar servicios, cursos, recursos o articulos.

Recomendacion: crear un sistema SEO por ruta con `title`, `description`, `canonical`, `robots`, OG/Twitter y JSON-LD.

### P0 - Sin canonical ni structured data

No se detecto `rel="canonical"` ni JSON-LD en las 9 paginas auditadas.

Impacto: Google no recibe senales claras de entidad, tipo de pagina, oferta, articulo, curso o producto.

Recomendacion: implementar `Organization`, `WebSite`, `WebPage`, `Service`, `Course`, `BlogPosting`, `Product/Offer` segun corresponda.

## Puntajes Por Pagina

| Pagina | SEO tecnico | Content/SXO | Visual/perf | Diagnostico |
|---|---:|---:|---:|---|
| Inicio | 55 | 74 | 86 | Buena vision de ecosistema, pero propuesta muy amplia. Necesita entrada por objetivo del usuario. |
| Estudio | 52 | 70 | 68 | Visualmente fuerte, pero `Direccion Visual` requiere traduccion comercial mas directa. |
| Academy | 50 | 76 | 63 | Buena claridad formativa; faltan instructor, credenciales, syllabus indexable y schema Course. |
| Sistemas | 58 | 72 | 58 | Es concreta, pero tiene riesgo LCP por hero PNG pesado y falta evidencia de resultados. |
| Recursos | 48 | 63 | 60 | Intencion clara, pero contenido bajo, alt faltante y sin autor/fechas/criterios. |
| Blog | 46 | 56 | 72 | Page type correcto, pero articulos thin, sin autor, fuentes, schema ni profundidad. |
| Hub | 35 | 45 | 66 | Mismatch publico: se siente interno. Debe ser noindex/auth o redisenarse como hub publico. |
| Landing Notion | 62 | 78 | 76 | Mejor fit comercial. Necesita prueba real, schema Product/Offer y autoridad. |
| Landing Identidad Visual | 58 | 68 | 52 | Clara como landing, pero depende de assets externos/iframe y necesita mas confianza verificable. |

## Evidencia Renderizada

Todas las paginas respondieron `200` en desarrollo. Se generaron capturas en `seo-audit-qaway-dev/screenshots/` y datos renderizados en `seo-audit-qaway-dev/raw-audit.json`.

| Pagina | Palabras | Imagenes | Alt faltante | Transfer aprox |
|---|---:|---:|---:|---:|
| Inicio | 582 | 9 | 2 | 11.37 MB |
| Estudio | 432 | 12 | 0 | 0.77 MB |
| Academy | 833 | 16 | 15 | 10.22 MB |
| Sistemas | 649 | 13 | 0 | 6.21 MB |
| Recursos | 177 | 11 | 2 | 5.46 MB |
| Blog | 303 | 6 | 0 | 0.30 MB |
| Hub | 303 | 0 | 0 | 0.03 MB |
| Landing Notion | 543 | 2 | 0 | 0.40 MB |
| Landing Identidad Visual | 361 | 10 | 0 | 0.49 MB |

Nota: los numeros son mediciones locales orientativas, no Core Web Vitals reales de produccion.

## Diagnostico SXO

Tu percepcion es valida: Qaway habla con mucha arquitectura interna.

Terminos como `ecosistema`, `direccion visual`, `sistemas`, `pilares`, `capacidad instalada`, `criterio` y `herramientas internas` elevan la marca, pero pueden alejar a usuarios que solo quieren entender rapidamente que hacer: construir una marca, automatizar su negocio, aprender IA, descargar recursos, lanzar un proyecto u ordenar contenido.

La solucion no es bajar calidad, sino agregar una capa de traduccion: primero objetivo claro, luego lenguaje premium.

## Diagnostico Por Pagina

### Inicio

Funciona como manifiesto de marca, pero no como entrada rapida para usuarios nuevos. Debe sumar un bloque temprano tipo `Elige tu punto de partida`.

### Estudio

La direccion visual esta bien posicionada, pero debe conectar antes con problemas concretos: marca poco clara, perfil poco profesional, contenido inconsistente, presentaciones que no venden.

### Academy

Es una de las paginas mas comprensibles. Falta convertirla en pagina SEO de formacion: instructor, temario, resultados, nivel, duracion, requisitos y schema Course.

### Sistemas

Tiene buena base porque menciona automatizacion, CRM, dashboards y agentes. Falta evidencia: antes/despues, casos, metricas verificables y entregables concretos. Ademas, el hero PNG pesado debe optimizarse.

### Recursos

Tiene intencion clara, pero es delgada para SEO. Si va a posicionar, necesita fichas de recurso con descripcion, uso, autor, fecha, categoria, relacionados y schema.

### Blog

El blog necesita convertirse en contenido real, no solo cards y articulos cortos. Para SEO/IA hacen falta articulos extensos, autor, fecha, fuentes, H2/H3, resumen answer-first y JSON-LD BlogPosting.

### Hub

Debe decidirse. Si es interno, proteger/noindex. Si sera publico, hay que reescribirlo como centro de rutas, herramientas gratuitas, demos y recursos, no como consola interna.

### Landing Notion

Es la mejor alineada a venta: promesa clara, producto concreto y CTA. Debe reforzar confianza: screenshots con contexto, FAQ, prueba social, quien lo creo, garantia y schema Product/Offer.

### Landing Identidad Visual

Tiene buen H1 y orientacion comercial. Debe evitar sonar generica agregando evidencias: proyectos reales, instructor, muestras, resultados de estudiantes, FAQ y schema Course/Product. Debe reducir dependencias externas above-the-fold.

## Recomendacion Estrategica

Antes de desarrollo, definir el mapa publico:

- Publico indexable: Inicio, Estudio, Sistemas, Academy, Recursos, Blog, landings.
- Interno/noindex: Hub y herramientas internas.
- Beta/noindex temporal: paginas incompletas o rutas de prueba.

Luego implementar SEO por ruta y recien despues optimizar contenido fino.

## Limitaciones

- No se hizo SERP live ni DataForSEO.
- No se midieron Core Web Vitals reales de campo porque el sitio no esta en produccion.
- El pipeline oficial del skill bloqueo hosts locales por seguridad SSRF; se ejecuto flujo local equivalente con Playwright y subagentes.
- WeasyPrint esta degradado en esta maquina, por eso no se genero PDF premium.
