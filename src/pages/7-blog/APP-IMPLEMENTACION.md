# App / Implementación — Blog: Open Graph, rutas prerenderizadas y dominio canónico

Módulo: `src/pages/7-blog` · `scripts/prerender-articles.mjs` · `.htaccess` · `src/components/seo/RouteSeo.jsx`
Rama: `main-web` · Repo: `1-qawaylab-web`
Estado: **APLICADO Y DESPLEGADO** — commits `f5b48fad` + `f5da1d68` en `origin/main-web` (2026-09-13). **Pendiente: verificación en el Facebook Sharing Debugger.**
Doc hermana: `README.md` de esta carpeta (**desactualizado**, ver §7.5)

---

## 0. Puntos esenciales de esta iteración

1. **El blog ya generaba el HTML correcto. Nunca se estaba sirviendo.** Los archivos `dist/blog/articulo/<slug>/index.html` existían, con sus etiquetas Open Graph bien escritas y desplegados en el servidor — pero la URL limpia nunca llegaba a ellos.
2. **Causa raíz única y comprobable:** la regla 2 del `.htaccess` raíz usaba el test `-f` (*¿es un archivo?*). Una ruta prerenderizada es un **directorio**, así que el test siempre fallaba y el bot caía al fallback SPA, recibiendo el HTML genérico de la home.
3. **El `og:image` de la home era un SVG.** Facebook y WhatsApp **no aceptan SVG**. Ya existía `public/assets/og/home.png` de **1200×630** sin usar.
4. **Había contenido duplicado real:** `www.qawaylab.com` y `qawaylab.com` servían el mismo contenido (mismo ETag) **sin ninguna redirección entre ellos**. Decisión del cliente: canónico = **`https://www.qawaylab.com`**.
5. **`dist/.htaccess` + `og-preview.php` son una trampa inerte.** Si se activaran, los bots de redes entrarían en **bucle infinito** de redirección. No se activaron (ver §7.2).
6. **Incidencia propia, registrada para no repetirla:** un reemplazo masivo con PowerShell 5.1 doble-codificó 17 archivos. Se reparó íntegramente con Node.js (ver §4).

---

## 1. Causa raíz verificada (con evidencia en vivo)

### 1.1 El bot leía la home, no el artículo

| URL consultada | Título devuelto por el servidor |
|---|---|
| `/dist/blog/articulo/agentes-autonomos-ia-productividad/index.html` | ✅ `Agentes autónomos de IA: El futuro de la productividad en 2026 \| Blog Qaway Lab` |
| `/blog/articulo/agentes-autonomos-ia-productividad` | ❌ `Qaway Lab \| Marcas, sistemas digitales y formacion con IA` |

El archivo prerenderizado **estaba generado, correcto y subido**. La URL limpia no llegaba a él.

### 1.2 Por qué fallaba la regla

```apache
RewriteCond %{DOCUMENT_ROOT}/dist/$1 -f      # -f = ¿es un ARCHIVO?
RewriteRule ^(.*)$ dist/$1 [L]
```

`/blog/articulo/<slug>` es un **directorio** → `-f` falso → caía a `RewriteRule . dist/index.html [L]`.

### 1.3 Pruebas de configuración del servidor

| Prueba | Resultado | Conclusión |
|---|---|---|
| `/vite.config.js` | **HTTP 403** | El `.htaccess` de la **raíz** es el activo (la regla de seguridad disparó) |
| `/dist/robots.txt` | 200 | El DocumentRoot es la **raíz del repo**, no `dist/` |
| `http://qawaylab.com` | 301 → `https://qawaylab.com/` | Solo hace `http→https`, **preserva el host** |
| `http://www.qawaylab.com` | 301 → `https://www.qawaylab.com/` | Igual: **no hay redirección entre www y sin-www** |
| `https://` ambas | 200, **mismo ETag** | Contenido duplicado confirmado |

> Nota metodológica: los 301 **no** indican cuál es el dominio canónico — solo suben a https conservando el host. La decisión de www fue del cliente, no una inferencia del servidor.

---

## 2. Cambios aplicados

| Archivo | Qué se cambió |
|---|---|
| `.htaccess` | **Regla 2b** (sirve carpetas prerenderizadas) + **bloque 0**: 301 de `qawaylab.com` → `www.qawaylab.com` |
| `index.html` | `og:image` / `twitter:image` de SVG → `/assets/og/home.png`; `og:url`, `secure_url`, `width`, `height`, `type`, `alt`, `locale`; dominio a www |
| `src/components/seo/RouteSeo.jsx` | `SITE_URL` a www; `DEFAULT_IMAGE` a 1200×630; dimensiones OG solo se declaran con la imagen por defecto (`removePropertyMeta`) |
| `scripts/prerender-articles.mjs` | Dominio a www; portadas por defecto inexistentes → `/assets/og/home.png` |
| `public/sitemap.xml` | Añadidos los 2 artículos reales que faltaban; `lastmod`; dominio a www |
| `public/robots.txt` | `Sitemap:` a www |
| `vite.config.js` | `emptyOutDir: false` → **`true`** (dejaba de acumular bundles obsoletos en `dist/`) |
| 13 archivos de `src/` | Canonical / JSON-LD / enlaces con dominio antiguo o sin www → unificados a www |
| `src/pages/2-estudio/EstudioPage.jsx` | `canonical` y JSON-LD apuntaban a **`qaway.pe`** (dominio anterior) |
| `src/pages/3-sistemas-digitales/SistemasDigitalesPage.jsx` | `canonical` apuntaba a **`qaway.dev`** (dominio ajeno) |
| `src/pages/5-qaway-hub/.../AppSwitcherDropdown.jsx` y `GestorHeaderV2.jsx` | Enlaces del Hub "Ir a la web principal" de `qaway.pe` → www (correos intactos) |
| `DesarrolloWebQawayPage.jsx`, `Vallet*` | 4 `og:image` que daban **404** → `/assets/og/home.png` |

### 2.1 La regla que resuelve el problema

```apache
# ==============================================================================
# 2b. RUTAS PRERENDERIZADAS: Carpetas con su propio index.html (Open Graph)
# ==============================================================================
RewriteCond %{DOCUMENT_ROOT}/dist/$1/index.html -f
RewriteRule ^(.+?)/?$ dist/$1/index.html [L]
```

### 2.2 La redirección canónica

```apache
# ==============================================================================
# 0. DOMINIO CANONICO UNICO: qawaylab.com (sin www) -> www.qawaylab.com
# ==============================================================================
RewriteCond %{HTTP_HOST} ^qawaylab\.com$ [NC]
RewriteRule ^(.*)$ https://www.qawaylab.com/$1 [R=301,L]
```

El anclaje `^...$` es lo que impide el bucle y evita tocar subdominios (`academy.qawaylab.com`). **No se añadió condición `%{HTTPS}`** a propósito: Hostinger ya hace `http→https` y añadirla es el patrón clásico que genera bucle infinito si el proxy no reporta bien esa variable.

---

## 3. Verificación posterior

| Comprobación | Resultado |
|---|---|
| `mojibake` en todo `src/`, `scripts/`, `public/` | **0** |
| Acentos y eñes intactos | **11.629 caracteres** |
| URLs con `https://www` | 57 |
| URLs sin www restantes | 2 (placeholders del editor, excluidos a propósito) |
| `qaway.pe` restantes | 3 (correos, por indicación del cliente) |
| `oxlint` en los archivos tocados | 0 errores |
| Build | `✓ built in 36.40s` |
| Artículos prerenderizados | `[Prerender] ✓ 10 artículos` |
| `dist/index.html`, `sitemap.xml`, `robots.txt` | www correcto, 0 ocurrencias sin www |
| Los 10 artículos | `canonical` en www, `og:image` válida, 0 mojibake |

---

## 4. Incidencia de codificación (registro para no repetir)

**Qué pasó.** El reemplazo masivo se hizo con **Windows PowerShell 5.1**. Ahí `Get-Content -Raw` **lee los archivos UTF-8 como ANSI (Windows-1252)** y `Set-Content -Encoding utf8` los reescribe como UTF-8 → **doble codificación**. Los acentos se rompieron (`Pública` → `PÃºblica`).

**Alcance.** 17 archivos de código. Verificado que `git HEAD` estaba **intacto** (5701 bytes, 5 acentos, 0 mojibake) frente al working tree dañado (5722 bytes, 0 acentos, 5 mojibake).

**Cómo se reparó (Opción A).**
1. Restaurar los 17 archivos desde `git show HEAD:<archivo>` con redirección byte-exacta de `cmd` (sin decodificación). Sin `reset`, `checkout`, `clean` ni `revert`.
2. Reaplicar las 27 sustituciones con **Node.js** (UTF-8 nativo) — 0 fallos, todas las anclas localizadas.
3. Verificar `mojibake = 0` antes de continuar.

**Regla para el futuro.** Para edición masiva de archivos con acentos, **usar Node.js**, nunca `Get-Content`/`Set-Content` de PowerShell. Y validar siempre en **un** archivo antes de lanzarlo a todo el árbol.

**Incidencias menores del mismo proceso:** un bloqueo transitorio de escritura en `EstudioPage.jsx` (reintentado con tolerancia), una omisión de 6 URLs en `prerender-articles.mjs` y un helper duplicado en `RouteSeo.jsx` (ambos detectados y corregidos antes del build).

---

## 5. Cómo funciona el circuito

```
1. Escribes el blog en Supabase (Blog Studio) → status = "publicado"
                    ↓
2. npm run build
     ├─ vite build          → genera dist/index.html (plantilla base)
     └─ prerender-articles.mjs
           ├─ consulta Supabase: posts (publicado) + blog_articles (public)
           ├─ por CADA artículo escribe dist/blog/articulo/<slug>/index.html
           └─ con og:title, og:image, og:url y canonical YA grabados dentro
                    ↓
3. commit + push  →  Hostinger auto-despliega dist/
                    ↓
4. .htaccess regla 2b detecta la carpeta y sirve ESE archivo al bot
                    ↓
5. Meta lee el HTML puro → ve el título y la portada del artículo
```

**La clave:** el rastreador de Meta **no ejecuta JavaScript**. Por eso las etiquetas Open Graph tienen que estar *físicamente escritas* en el HTML. El prerender las graba; el `.htaccess` las entrega.

### 5.1 Qué es automático y qué no

| Elemento | ¿Automático al reconstruir? |
|---|---|
| Página prerenderizada del artículo nuevo | **Sí** |
| `og:title`, `og:description`, `og:url`, `canonical` | **Sí** |
| `og:image` (incluida portada en Base64 → se extrae a archivo) | **Sí** |
| Servirla a Facebook/WhatsApp | **Sí** (regla 2b, genérica por slug) |
| Aparecer en `sitemap.xml` | **NO** — es estático en `public/sitemap.xml` (ver §7.1) |
| Artículos borrados o despublicados | Sí — sus carpetas desaparecen al limpiar `dist/` |

---

## 6. Flujo operativo para publicar un blog nuevo

```
1. Publicar en Supabase (status = publicado)
2. npm run build
3. Verificar en la salida:  [Prerender] ✓ N artículos prerenderizados
4. commit + push
5. Compartir el enlace
```

> **Regla práctica:** no compartas un artículo nuevo hasta haber reconstruido y desplegado. El contenido de la página sí se lee de Supabase en vivo (React), pero **las etiquetas OG solo se actualizan en el build**.

### 6.1 Riesgos a vigilar

1. **Si Supabase falla durante el build, el build NO se rompe — se degrada en silencio.** El script captura el error, imprime un `warn` y continúa con los 8 artículos de respaldo. Como `emptyOutDir` limpia `dist/`, **desaparecerían las páginas de los artículos reales**. Revisar siempre el contador `✓ N artículos`: si baja, el build no vio Supabase.
2. **`sitemap.xml` es manual** (ver §7.1).
3. **Caché de Facebook.** Si una URL ya fue rascada antes del arreglo, Meta seguirá mostrando el preview viejo. Pasar por el **Sharing Debugger → "Scrape Again"**. Los artículos nuevos no tienen este problema.
4. **Cambiar el slug de un artículo ya compartido** y reconstruir hace desaparecer la carpeta antigua: ese enlace compartido vuelve al fallback genérico.

---

## 7. Pendientes (NO ejecutar todavía)

### 7.1 Automatizar `sitemap.xml` — APROBADO EN CONCEPTO, NO EJECUTAR AHORA

**Qué implicaría.** Hoy, al publicar un artículo nuevo hay que escribir su URL a mano en `public/sitemap.xml` para que Google sepa que existe. La mejora es que `prerender-articles.mjs` tome los artículos que ya consulta en Supabase y **escriba `sitemap.xml` automáticamente** en cada `npm run build`, con lo que nunca se desincronizaría.

| Dimensión | Impacto |
|---|---|
| **Diseño** | **Cero (0%).** No toca píxeles, colores, fuentes, responsive ni componentes. El `sitemap.xml` es un documento invisible para los humanos. |
| **Estructura** | Cambio acotado al script de prerender que ya se tocó. |
| **Facebook / WhatsApp / Twitter / LinkedIn** | **Ninguno.** No leen el sitemap. Solo leen las etiquetas Open Graph del HTML del artículo, ya resueltas. El sitemap solo sirve para la indexación de Google en el tiempo. |

**Veredicto del cliente: NO hacerlo ahora.**

Motivos:
- **Regla de oro de estabilidad:** cuando acabas de resolver un problema crítico y tienes un commit limpio y verificado en local, **no se añade más código antes de probarlo en vivo**.
- Modificar el script de prerender implicaría volver a tocar archivos del árbol de trabajo, riesgo innecesario de trabar el build y seguir retrasando el push a producción.

**Respuesta oficial:** *"La mejora del sitemap automatizado tiene sentido, pero NO la tocaremos ahora. Primero debemos probar en producción lo que ya está listo: (1) no modificar ningún archivo más, (2) dejarlo como pendiente para una siguiente etapa, (3) proceder con el agente de despliegue a realizar el push del commit local y verificar en Facebook Debugger."*

### 7.2 `dist/.htaccess` + `og-preview.php` — trampa inerte

**Qué es.** En un intento previo se creó `og-preview.php`: un despachador que, al detectar el rastreador de Facebook, consultaba Supabase y le decía al navegador "redirige al artículo real".

**Por qué es una trampa.** Si se activara, se crearía un **bucle infinito**: el bot entra al artículo → el servidor lo manda al PHP → el PHP le dice que vuelva al artículo → y así en círculos.

**Estado real verificado:**

| Elemento | Estado |
|---|---|
| La **regla** que manda bots al PHP (`public/.htaccess:10` y `dist/.htaccess:10`) | **Inerte** — vive en `dist/.htaccess`, y el DocumentRoot es la raíz. No hay ninguna referencia en el `.htaccess` raíz |
| El **archivo** `og-preview.php` | **Vivo y accesible públicamente** — `https://www.qawaylab.com/og-preview.php?slug=...` responde **HTTP 200** |

**Riesgo de dejarlo:** endpoint sin autenticación que consulta Supabase y **puede escribir archivos** en el servidor (`assets/blog-covers/`). El slug va saneado, así que no hay traversal, pero sigue siendo una superficie de escritura abierta.

**Acción propuesta (pendiente):** borrar `public/og-preview.php` y eliminar las líneas 8–10 de `public/.htaccess`, conservando el resto del archivo como red de seguridad por si el DocumentRoot pasara a `dist/`.

### 7.3 Los 8 artículos fantasma

**Qué es.** En el código de la web hay **8 artículos maquetados a mano** (`Agentes autónomos`, `Facturación con Make`, `CRM en Notion`, `ADN visual`, `SOPs en Notion`, `Automatización de contenidos`, `Habilidades con IA`, `Google Calendar Dominado`). En Supabase solo hay **2 artículos reales**.

**El dilema.** `BlogPage` está programada como *"si hay artículos en Supabase, muestra solo los de Supabase"*. Por eso la web pública muestra **2** y los otros 8 no aparecen en el listado — pero el script del build **sí les sigue creando páginas invisibles**.

**Opciones (pendiente de decisión):**

| Opción | Implica |
|---|---|
| **A. Migrarlos a Supabase** | Recuperar 8 artículos reales en el listado; hay que exportar su contenido desde `BlogPage.jsx` |
| B. Borrarlos del código | Quitarlos de `BlogPage.jsx`, `ArticleDetailPage.jsx`, `RouteSeo.jsx` y de la lista de respaldo de `prerender-articles.mjs` |
| C. Dejarlo como está | 8 páginas prerenderizadas sin aparecer en el listado |

### 7.4 Placeholders del editor

`LeadFormModal.tsx:22` y `BookmarkModal.tsx:72` son textos de ejemplo del editor interno. **No afectan SEO ni la web pública.** No se tocan. Detalle cosmético opcional: alinear el de `BookmarkModal` a `www` (hoy redirige 301, es inofensivo).

### 7.5 `README.md` de esta carpeta — desactualizado

El `README.md` (2026-07-13) describe la lógica de destacados diciendo que se edita el arreglo local `articles`. **Eso ya no aplica**: desde la conexión con Supabase la fuente de verdad es la base de datos. Conviene actualizarlo para que nadie edite el lugar equivocado.

---

## 8. Estado del commit y del despliegue

| Commit | Origen | Estado |
|---|---|---|
| `f5b48fad` — `2026-09-13_14:13_A22@@@_unificacion-dominio-www-y-rutas-prerender-og` | esta iteración | **PUSHEADO** a `origin/main-web` |
| `f5da1d68` — `2026-09-13_14:22_A22@@@_build-dist-actualizado-mejoras-completas-y-push-limpio` | agente de despliegue | **PUSHEADO** |

Verificado: `git status -sb` → `## main-web...origin/main-web` (sincronizado) y `origin/main-web` contiene `f5b48fad`.

- Pendiente: verificación en el **Facebook Sharing Debugger** ("Scrape Again" para las URLs ya rascadas antes).
- El commit `f5b48fad` es global e incluye también trabajo ajeno que estaba sin commitear (9 migraciones `supabase/migrations/*.sql`).
