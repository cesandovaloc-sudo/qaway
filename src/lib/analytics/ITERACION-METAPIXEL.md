# Bitácora de Iteraciones — Meta Pixel (`src/lib/analytics`)

Registro de cambios e iteraciones de la analítica de Meta (píxel) de Qaway Lab.

**ID de píxel canónico:** `1787532068936007` (único válido del proyecto).

---

## Iteración 1: Migración al estándar oficial de Meta y corrección del PageView en SPA
**Fecha:** 2026-09-13
**Objetivo:** Que Meta registre correctamente el tráfico de la web. Antes recibía
**1 solo PageView por sesión** porque la web es una SPA y nunca se emitía
`PageView` en los cambios de ruta.

### Diagnóstico de partida (verificado, no supuesto)

| Hallazgo | Evidencia |
| --- | --- |
| El código base NO estaba en el HTML servido | `dist/index.html` sin `fbq` ni `connect.facebook.net` |
| `PageView` no se emitía al navegar | Prueba en Chromium: `/` → `init`+`PageView`; navegar a `/landings/identidad-visual` → sin PageView nuevo |
| Segundo píxel `985308637781961` nunca inicializaba | El `<script>` estaba en el DOM pero el navegador no lo ejecutaba |
| El píxel podía no cargarse nunca | `ipapi.co` sin timeout ni manejo de 429 → `country_code` `undefined` → gate cerrado en silencio |

### Puntos esenciales:

1. **Código base en `<head>` (`index.html`):**
   - Snippet oficial de Meta con el ID canónico, dentro de `<head>`, como
     especifica la documentación oficial.
   - `<noscript>` con la imagen de respaldo al inicio de `<body>`.

2. **Gate de consentimiento (opt-out):**
   - Carga por defecto para tráfico general (Perú/LATAM).
   - Si `qaway_cookie_consent === 'declined'`, **no se carga**, sin importar la
     geografía. La decisión del usuario manda siempre.
   - Se eliminó por completo la dependencia de `ipapi.co`.

3. **Módulo central (`src/lib/analytics/metaPixel.js`):**
   - `trackLead(source)`, `trackStandard(name, params)`, `pageview()`.
   - `hasConsent()` encapsula el gate; `emit()` encapsula las tres guardas
     (entorno, consentimiento, `fbq` disponible) y nunca rompe la UI.
   - `revokeMetaPixel()`: limpia `_fbp`, `_fbc` y `fr` al retirar el
     consentimiento. Meta no documenta `fbq('consent','revoke')`; su mecanismo
     oficial es `dataProcessingOptions` (Limited Data Use, solo EE.UU.), por lo
     que no se inventó ninguna API.

4. **`PageView` por ruta (`MetaPixelRouteTracker.jsx`):**
   - `useLocation()` emite `pageview()` en cada transición real de URL.
   - La primera ruta NO se emite: ya la registra el código base.
   - Referencia por ruta en lugar de un booleano "primera vez", para evitar
     duplicados con el doble montaje de React StrictMode en desarrollo.

5. **Limpieza del píxel residual:**
   - Purgados `<script>` y `<noscript>` con el ID obsoleto `985308637781961`
     de `IdentidadVisualLandingPage.jsx`.
   - Eliminado `src/components/analytics/MetaPixel.jsx` (cargaba la librería
     tarde y desde un componente React).

6. **Evento `Lead` en todos los puntos de captación** (con `content_name`):
   - Inicio · Academy · Estudio · Sistemas Digitales · Landing Desarrollo Web ·
     Landing Contable · Landing Identidad Visual ·
     Recursos (Ebook, Primeros Flujos IA, Optimizador WebP).

7. **Protección de la redirección a WhatsApp:**
   - El beacon de `Lead` se despacha antes de salir de la pestaña, con una
     espera defensiva de 250 ms en lugar de una navegación externa dura
     inmediata.

### Pendiente / siguiente fase (no incluido en esta iteración)
- [ ] Conversions API (server-side) con `eventID` para deduplicar y recuperar
      eventos perdidos por adblockers/ITP.
- [ ] Evento `Contact` en los CTA de WhatsApp (fuera del alcance aprobado).
