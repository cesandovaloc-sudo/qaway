# 9-imagenes-optimizacion.md

## Imagen Core — optimización compartida de imágenes

**Fecha:** 20 de noviembre de 2026
**Estado:** núcleo creado y validado. **Primer consumidor conectado:** Mi Perfil del Gestor de Proyectos 2. Los demás consumidores siguen sin conectar.

### Propósito

Un único motor para convertir imágenes a WebP antes de subirlas a Supabase Storage. Sirve para foto de perfil, fotos de producto, logos y evidencias, sin que cada app reescriba su propio compresor.

### Por qué vive en `14-Librerías`

Cumple las reglas de `8-funcionalidades-framework.md:7-18`:

- No incluye UI, colores ni diseño.
- No contiene reglas de negocio (qué imagen merece subirse lo decide cada app).
- No trae dependencias nuevas: usa `FileReader`, `Image` y `canvas`, ya disponibles en el navegador.
- Es un helper puro: recibe un `File`, devuelve un `Blob` WebP o lanza error.
- No importa Supabase: cada app elige bucket, ruta y políticas.

Está clasificado como **Tipo A (infraestructura reutilizable)** según `3-clasificacion-functional.md:13-24,84`.

### Archivos

| Archivo | Contenido |
|---|---|
| `services/imageOptimization.js` | Contrato y motor de conversión |
| `services/imageOptimization.test.ts` | Pruebas del contrato y de los presets |
| `services/adoptionMatrix.js` | Registro del feature `image-optimization` en el catálogo (`FRAMEWORK_FEATURES`) |

`APP_ADOPTION` ya registra `image-optimization` en `gestor_proyectos_2` con su nota de conexión. Las demás apps siguen sin `NEED`.

### API

```js
import {
  esImagenPermitida,
  optimizarImagen,
  optimizarAvatar,
  optimizarProducto,
  optimizarEvidencia,
} from '@/pages/5-qaway-hub/14-Librerías/services/imageOptimization'
```

| Función | Uso | Resultado |
|---|---|---|
| `esImagenPermitida(file)` | Validar antes de mostrar preview | `true` sólo para PNG/JPG/WebP |
| `optimizarImagen(file, opciones)` | Caso general | `{ blob, fileName, width, height, bytes, originalBytes, mode }` |
| `optimizarAvatar(file)` | Perfil | recorte cuadrado centrado, máx 512, WebP 0.85 |
| `optimizarProducto(file)` | Inventario / catálogo | sin recorte, máx 1200, WebP 0.85 |
| `optimizarEvidencia(file)` | Adjuntos / evidencias | sin recorte, máx 1440, WebP 0.9 |

Opciones de `optimizarImagen`: `preset` (`avatar`/`product`/`evidence`), `mode` (`avatar`/`general`), `maxEdge` y `quality`.

### Decisiones técnicas

1. **Sin ampliación.** Si la imagen original es más chica que el límite, se conserva su tamaño. `optimizeAvatar` de `HubPanelPage.jsx:203` siempre forzaba 512 px, difuminando fotos pequeñas.
2. **Recorte sólo en avatar.** Producto y evidencia conservan proporción: recortarlos deformaría el contenido.
3. **Fallo explícito.** Si `FileReader`, `Image` o `toBlob` fallan, se lanza error. Nunca se devuelve el archivo original pesado, fallo presente en `blog-editor/services/storageService.ts:50,57,60,64`.
4. **EXIF.** `canvas` elimina metadatos. Para evidencia con valor legal se debe conservar también el archivo original además del WebP.
5. **Sin Storage acoplado.** La ruta `avatars/{uid}.webp`, `products/{tenant_id}/...` o `resources/...` la define cada app según su bucket y RLS.

### Implementaciones reemplazadas y pendientes

- `HubPanelPage.jsx:191-224` → `fileToDataUrl` + `optimizeAvatar` local. Pendiente.
- `imagenToWebp.js:10-47` → `convertirAWebp`, hoy usado en `HubOnboardingPage.jsx:732`. Pendiente.
- `blog-editor/services/storageService.ts:15-68` → `compressImageToWebpBlob`. Pendiente.
- `PerfilTab.tsx` → `comprimirAvatar`, **ya reemplazado** por `optimizarAvatar` + upload a `avatars/{uid}.webp`.

### Conexión aplicada: Mi Perfil del Gestor

Archivo: `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/modules/configuracion/PerfilTab.tsx`.

| Línea | Elemento |
|---:|---|
| 7 | import de `optimizarAvatar` desde `../../../../14-Librerías/services/imageOptimization` |
| 72-88 | `subirAvatar`: optimiza, sube el Blob WebP y devuelve la URL pública con versión |
| 90-107 | `handleFileChange`: valida sesión, sube y persiste `avatar_url` |
| 141 | texto de la UI ajustado a WebP 512 px |
| 158-172 | borrar foto también elimina `avatars/{uid}.webp` |

El bucket y las políticas ya existen en `supabase/migrations/20260925000000_storage_avatars_bucket.sql:8-19,25-59`: no se creó DDL ni RLS nuevo. Si falla la conversión o el upload, se muestra el mensaje real; no se guarda JPEG base64.

### Validación

- `npm run typecheck` → sin errores.
- Revisión de fuente: exports, presets, contrato de error y registro en `adoptionMatrix.js`.
- No se ejecutó `build`/`dist`. No se hizo commit ni push.
- Se modificó una app consumidora: `PerfilTab.tsx`. No se conectaron producto, evidencia ni otra app.

### Pendiente para la siguiente etapa (supervisada)

- Perfil ya conectado. Siguen pendientes Hub Panel, Onboarding, Blog e Inventario.
- Imports del rename ya corregidos: `src/router/AppRouter.jsx:71` y `src/pages/5-qaway-hub/HubPanelPage.jsx:21-22` apuntan a `14-Librerías`. La única referencia restante a `14-Notificaciones` es histórica, en `13-Gestor_Proyectos2/doc2/9-Credenciales-y-auditoria/9.2-Ejecucion-y-verificacion.md:87`, y no se tocó.
