# Meta Ads — Fase 1: Pixel de navegador y seguimiento de Leads

Documentación central del módulo de Meta Ads de Qaway Lab.

**ID de píxel canónico:** `1787532068936007` — único válido del proyecto.

---

## 1. Estado: Fase 1 cerrada

| Capacidad | Estado |
| --- | --- |
| Código base en `<head>` | ✅ |
| `PageView` en cada cambio de ruta (SPA) | ✅ |
| Evento `Lead` en los 10 puntos de captación | ✅ |
| Consentimiento (opt-out, rechazo respetado) | ✅ |
| Píxel residual eliminado | ✅ |
| Conversions API (server-side) | ⏳ Fase 2 |

---

## 2. Arquitectura

El píxel se apoya en el estándar oficial de Meta y en **un único punto de
emisión** de eventos:

```
index.html                      -> código base oficial + PageView inicial
  └─ src/lib/analytics/metaPixel.js          -> módulo central de emisión
       └─ src/components/analytics/
            MetaPixelRouteTracker.jsx         -> PageView por ruta (SPA)
       └─ formularios (10)                    -> trackLead(contenido)
```

### Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Código base oficial dentro de `<head>` + `<noscript>` de respaldo |
| `src/lib/analytics/metaPixel.js` | `pageview()`, `trackStandard()`, `trackLead()`, `hasConsent()`, `revokeMetaPixel()` |
| `src/components/analytics/MetaPixelRouteTracker.jsx` | Emite `PageView` en cada transición real de URL |
| `src/lib/analytics/ITERACION-METAPIXEL.md` | Bitácora técnica de la iteración |

**Regla de oro:** ningún componente llama a `window.fbq` directamente. Todo pasa
por `metaPixel.js`, que encapsula consentimiento, nombre oficial del evento y
parámetros.

---

## 3. Por qué existe el tracker de rutas

Qaway Lab es una SPA (Vite + React Router 7). La URL cambia **sin recargar el
documento**, así que el código base solo cubre la primera vista.

Sin `MetaPixelRouteTracker`, Meta recibía **1 solo PageView por sesión** sin
importar cuántas páginas recorriera el usuario, dejando el embudo invisible.

- La **primera** ruta no se emite desde el tracker: ya la registra el código base.
- Se compara por ruta (no con un booleano "primera vez") para no duplicar con el
  doble montaje de React StrictMode en desarrollo.

---

## 4. Eventos emitidos

Todos con el nombre estándar oficial y su `content_name` de origen:

| Origen | `content_name` |
| --- | --- |
| Inicio (Academy) | `Inicio - Formulario Academy` |
| Academy | `Academy - Formulario` |
| Estudio | `Estudio - Formulario` |
| Sistemas Digitales | `Sistemas Digitales - Formulario` |
| Landing Desarrollo Web | `Landing Desarrollo Web` |
| Landing Contable | `Landing Contable` |
| Landing Identidad Visual | `Landing Identidad Visual` |
| Recurso: Ebook | `Recurso - Ebook Google Calendar Dominado` |
| Recurso: Primeros Flujos IA | `Recurso - Primeros Flujos IA` |
| Recurso: Optimizador WebP | `Recurso - Optimizador de Imagenes WebP` |

**Protección anti-pérdida:** en los flujos que terminan en WhatsApp, el `Lead` se
emite y la navegación externa se retrasa 250 ms para asegurar que el beacon se
despache antes de abandonar la pestaña.

---

## 5. Consentimiento

Política acordada: **carga por defecto (opt-out)** para tráfico general
(Perú/LATAM).

- Si `qaway_cookie_consent === 'declined'`, el píxel **no se carga**, sin importar
  la ubicación geográfica. La decisión del usuario manda siempre.
- Al rechazar, `revokeMetaPixel()` elimina las cookies `_fbp`, `_fbc` y `fr`.
- Se eliminó la dependencia de `ipapi.co` que antes condicionaba la carga.

> Meta no documenta `fbq('consent','revoke')`. Su mecanismo oficial es
> `dataProcessingOptions` (Limited Data Use, solo EE.UU.), por eso la revocación
> se implementa deteniendo la emisión y limpiando identificadores, sin inventar
> API.

---

## 6. Verificación

Comprobado en Chromium real, bloqueando `connect.facebook.net` para leer el log
íntegro de `fbq` sin depender de la red de Meta:

```
Carga inicial de /              -> init 1787532068936007 + PageView (1 solo)
Navegación a /estudio           -> +1 PageView
Navegación a /recursos/...      -> +1 PageView
Consentimiento RECHAZADO        -> fbq ausente, sin cola
Sin decisión previa             -> carga por defecto
```

---

## 7. Fase 2 (pendiente)

- [ ] Conversions API (server-side) con `eventID` para deduplicar y recuperar
      eventos perdidos por adblockers / ITP.
- [ ] Evento `Contact` en los CTA de WhatsApp.
- [ ] Revisar `src/pages/5-qaway-hub/ads/PixelConfigPanel.jsx`, que aún consulta
      `ipapi.co` (panel interno, no afecta al píxel público).

---

## Referencias oficiales

- [Get started with the Meta Pixel](https://developers.facebook.com/docs/meta-pixel/get-started)
- [Conversion Tracking](https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking)
- [Data processing options](https://developers.facebook.com/docs/meta-pixel/implementation/data-processing-options)

**Última actualización:** 2026-09-13
