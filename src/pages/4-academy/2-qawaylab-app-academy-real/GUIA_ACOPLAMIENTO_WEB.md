# Guía de Acoplamiento Web — Qaway Lab Academy

> Documento técnico para integrar `2-qawaylab-academy` a cualquier sitio web
> externo (HTML estático, React, Next.js, WordPress, etc.) manteniendo
> coherencia visual total: mismo Navbar, mismo Footer, misma tipografía y
> misma paleta de colores.

---

## 1. Arquitectura de conexión

Academy y la web principal son **dos aplicaciones independientes** que viven en
dominios o subdominios separados. La conexión entre ellas es mediante
**hypervínculos HTML estándar** (`<a href="...">`), no mediante iframes ni
dependencias de código compartido.

```
Web principal          Academy
www.qawaylab.com  ←──► academy.qawaylab.com
(cualquier stack)       (React + Vite + Supabase)
```

La transición entre sitios genera una recarga de navegador (inevitable entre
dos apps separadas). Para que esa recarga sea **imperceptible** visualmente,
ambas webs deben compartir los mismos tokens visuales (ver Sección 4).

---

## 2. Variable de entorno obligatoria

En el archivo `.env` (o `.env.production`) de Academy se debe definir:

```env
VITE_MAIN_WEB_URL=https://www.qawaylab.com
```

Esta variable controla:
- La URL del logo en el Navbar (enlace de regreso a la web principal).
- Los enlaces del menú principal que apuntan a secciones de la web principal.
- Los enlaces del footer que apuntan a áreas de la web principal.

En desarrollo local se puede omitir; el código usa `https://www.qawaylab.com`
como valor por defecto.

---

## 3. Sincronización del Navbar

### 3.1 Links del menú (desktop y móvil)

En `src/layouts/PublicLayout.jsx`, la constante `mainWebLinks` contiene los
enlaces que apuntan a la web principal. Si la web principal agrega o elimina
secciones del menú, se debe actualizar esta constante:

```js
const mainWebLinks = [
  { key: 'estudio',          label: 'Estudio',           href: `${MAIN_WEB_URL}/estudio` },
  { key: 'sistemasDigitales', label: 'Sistemas digitales', href: `${MAIN_WEB_URL}/sistemas-digitales` },
  { key: 'academy',          label: 'Academy',            href: `${MAIN_WEB_URL}/academy`, isActive: true },
  { key: 'hub',              label: 'Qaway Hub',          href: `${MAIN_WEB_URL}/hub` },
  { key: 'blog',             label: 'Blog',               href: `${MAIN_WEB_URL}/blog` },
]
```

> **Regla:** El link con `isActive: true` se muestra resaltado en naranja
> `#ff4b0b` indicando al usuario en qué sección del ecosistema Qaway está.
> Academy siempre activa `academy`.

### 3.2 Logo

El logo `Qaway Lab` en el Navbar de Academy apunta a la web principal mediante
`href={MAIN_WEB_URL}`. Nunca debe usar `<Link to="/">` de React Router porque
eso navegaría dentro de Academy, no de regreso a la web principal.

### 3.3 Botón CTA (derecha del Navbar)

- Si el usuario **no tiene sesión**: muestra `"Cuéntanos tu proyecto"` con
  enlace al WhatsApp de Qaway Lab (`WHATSAPP_LINK`). Esto es idéntico al CTA
  de la web principal.
- Si el usuario **tiene sesión activa en Academy**: muestra `"Mi Panel"`
  dirigiendo al panel correspondiente según el rol (estudiante, docente, admin).

---

## 4. Tokens visuales — lo que debe estar alineado en la web contenedora

Para que la transición entre la web principal y Academy sea imperceptible,
la web contenedora debe usar los **mismos valores base** en sus estilos:

### 4.1 Tipografía

| Rol               | Familia                                                                         |
| :---------------- | :------------------------------------------------------------------------------ |
| Texto general     | `'Inter', system-ui, -apple-system, sans-serif`                                |
| Títulos / Display | `'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', Impact, sans-serif` |

Las fuentes se cargan desde Google Fonts o sistema local. Academy las tiene
declaradas en `src/index.css` bajo `@theme`.

### 4.2 Paleta de colores

| Token                    | Valor     | Uso                                          |
| :----------------------- | :-------- | :------------------------------------------- |
| Naranja primario         | `#ff4b0b` | Links activos, badges, botones CTA           |
| Naranja hover            | `#df3900` | Estado hover del botón primario              |
| Texto tinta oscuro       | `#20201f` | Textos principales, logo "Qaway"             |
| Texto gris suave         | `#292927` | Links de menú inactivos                      |
| Fondo claro inicial      | `#f8f9f7` | Fondo del Navbar antes de hacer scroll       |
| Fondo claro scrolled     | `#f8f7f4` | Fondo del Navbar con opacidad 95% al hacer scroll |
| Fondo oscuro footer      | `#111111` | Footer de ambas webs                         |

### 4.3 Dimensiones del Navbar

| Propiedad         | Valor           |
| :---------------- | :-------------- |
| Altura del header | `80px` (h-20)   |
| Max-width         | `96rem`         |
| Padding horizontal| `px-6 sm:px-10 lg:px-14` |

> **Importante:** Ambas webs deben usar exactamente `80px` de altura en el
> Navbar. Academy aplica `pt-20` al `<main>` para compensar el header fijo.
> Si la web contenedora usa una altura diferente habrá un salto visual.

---

## 5. Sincronización del Footer

El footer de Academy replica exactamente la estructura de la web principal:

- **Fondo:** `#111111` (negro corporativo).
- **4 columnas:** Marca + redes sociales / Áreas (links a web principal) / Academy (links internos) / Contacto.
- **Redes sociales:** TikTok, Instagram, Facebook, YouTube, WhatsApp Channel.
- **Copyright:** `© [año] Qaway Lab`.

Si la web principal modifica su footer (nuevas redes, nuevas secciones),
se debe actualizar también en `src/layouts/PublicLayout.jsx`.

---

## 6. Cómo conectar desde una web en HTML estático

Si la web contenedora está en HTML puro (sin framework), el enlace hacia
Academy es simplemente:

```html
<!-- En el menú de la web principal -->
<a href="https://academy.qawaylab.com">Academy</a>

<!-- O a una sección específica -->
<a href="https://academy.qawaylab.com/cursos">Ver cursos</a>
```

No se requiere ninguna configuración adicional en el HTML. Academy es una
aplicación autónoma con su propio servidor.

---

## 7. Cómo conectar desde WordPress o CMS

1. En el menú de WordPress, agregar un **Custom Link** con la URL de Academy:
   `https://academy.qawaylab.com`.
2. En el footer del tema de WordPress, replicar los tokens visuales de la
   Sección 4 para que el cambio sea imperceptible.

---

## 8. Despliegue (Deployment)

Academy se construye con:

```bash
npm run build
```

El output en `/dist` se puede servir en:
- **Vercel / Netlify**: Drag & drop de la carpeta `dist` o conectar el repositorio.
- **Servidor propio / VPS**: Servir `dist/` con Nginx o Apache como SPA
  (todas las rutas deben apuntar a `index.html`).
- **Subdominio recomendado**: `academy.qawaylab.com` o `cursos.qawaylab.com`.

### Configuración de Nginx para SPA:

```nginx
server {
  listen 80;
  server_name academy.qawaylab.com;
  root /var/www/academy/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 9. Checklist de acoplamiento rápido

- [ ] Definir `VITE_MAIN_WEB_URL` en `.env.production` con la URL real de la web principal.
- [ ] Verificar que la web principal usa el mismo `font-family` (Inter + Arial Narrow).
- [ ] Verificar que la web principal usa `#111111` en el footer.
- [ ] Verificar que la altura del Navbar es `80px` en ambas webs.
- [ ] Agregar el enlace a Academy en el menú de la web principal.
- [ ] Configurar el subdominio o la URL de despliegue de Academy.
- [ ] Hacer build de Academy y desplegar.

---

---

## 10. Registro de implementación — Acoplamiento Web → Academy (01/08/2026)

> Esta sección documenta el acoplamiento **real ejecutado** entre la web
> principal (`1-qawaylab-web`, rama `main-web`) y Academy
> (`2-qawaylab-academy`, rama `main-academy`), verificado el 02/08/2026.

### 10.1 Las dos direcciones de conexión

- **Academy → Web** (secciones 1-9): el Navbar y el logo de Academy apuntan a
  la web principal mediante `VITE_MAIN_WEB_URL`.
- **Web → Academy** (este registro): el menú de la web principal apunta a la
  plataforma Academy mediante `VITE_ACADEMY_URL`. Sin esto, el visitante de la
  landing `/academy` no puede llegar a la plataforma real.

### 10.2 Commits en la web (rama `main-web`)

| Commit | Descripción |
| :----- | :---------- |
| `281fb48` | A22 — h2 estandarizado sin estilos inline |
| `90b3e08` | A22 — quitar `uppercase` residual de `h2` |
| `b38de2a` | A22 — `no-qw` en `h3` de cards para evitar estilos globales |
| `24c94a1` | A23 — implementar acoplamiento del Navbar con Academy |
| `6336d58` | A24 — corrección `.env` UTF-8 + fallback (commit global de cierre) |

### 10.3 Corrección de `.env` (bloqueante resuelto)

**Problema:** PowerShell introdujo bytes nulos (carácter NUL) en `.env`,
`.env.development` y `.env.public`, rompiendo el parseo de variables por Vite.

**Solución:** reescritura con script Node nativo → UTF-8 plano, sin BOM, cero
bytes nulos, con fallback correcto al `.env` principal.

**Verificado el 02/08/2026 (conteo exacto de bytes):**

| Archivo | Null bytes | BOM | Contenido relevante |
| :------ | :--------- | :-- | :------------------ |
| `.env` | 0 | No | `VITE_ACADEMY_URL=http://localhost:7000` (fallback dev) |
| `.env.development` | 0 | No | `VITE_SITE_SCOPE=development` + `VITE_ACADEMY_URL=http://localhost:7000` |
| `.env.public` | 0 | No | `VITE_SITE_SCOPE=public` + `VITE_ACADEMY_URL=https://academy.qawaylab.com` |

> **Regla:** producción se construye con `npm run build --mode public` para que
> Vite inyecte `https://academy.qawaylab.com` y elimine el fallback de
> `localhost:7000` como dead code.

### 10.4 Acoplamiento del Navbar (`src/components/layout/Navbar.jsx` + `src/data/navigation.js`)

- `navigation.js` define el dropdown **Academy** con 4 ítems:
  - `Academy` → `/academy` (landing interna de la web).
  - `Acceder` → `${VITE_ACADEMY_URL}/acceder` (external).
  - `Registrarse` → `${VITE_ACADEMY_URL}/registro` (external).
  - `Cursos` → `${VITE_ACADEMY_URL}/cursos` (external).
- `Navbar.jsx` fue refactorizado para ser **coherente con `navigation.js`**:
  todos los nodos con ítems (Sistemas Digitales, Qaway Hub, Blog, Academy)
  ahora despliegan correctamente. Academy tiene manejo especial
  (`isAcademy` / `sourceItem`, líneas 90-91).

### 10.5 Landing `/academy` (`src/pages/4-academy/AcademyPage.jsx`)

Links hardcodeados reemplazados por `VITE_ACADEMY_URL || fallback` (líneas
533, 566 y 821), incluido el último enlace de la zona inferior de la página.

### 10.6 Validación del build público

`npm run build --mode public` compila limpio. Rastreo en los assets
minificados de `dist/`:

- ✅ `https://academy.qawaylab.com` presente en el bundle (`page-brand-core-*.js`).
- ✅ `localhost:7000` **ausente** en todo `dist/` (fallback eliminado como dead code).

### 10.7 Pendiente de infraestructura (no es código)

- [ ] Apuntar el subdominio `academy.qawaylab.com` al hosting del build de
  Academy (DNS + certificado SSL).
- [ ] Definir `VITE_MAIN_WEB_URL=https://www.qawaylab.com` en `.env.production`
  de Academy (actualmente el `.env` local usa `http://localhost:4000`).
- [ ] Ejecutar `npm run build` en `2-qawaylab-academy` y desplegar `dist/`.

---

*Última actualización: 2026-08-02 — Qaway Lab Digital*
