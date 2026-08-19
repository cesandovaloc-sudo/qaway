# Josué Panadería — Next.js

Sitio web comercial one-page construido en React mediante Next.js App Router.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Validar

```bash
npm run typecheck
npm run build
```

## Configuración

Copiar `.env.example` a `.env.local` y actualizar:

```env
NEXT_PUBLIC_SITE_URL=https://tu-dominio-o-vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=51987654321
NEXT_PUBLIC_GOOGLE_MAPS_URL=https://maps.app.goo.gl/TU_ENLACE
NEXT_PUBLIC_MAP_LAT=-12.0781
NEXT_PUBLIC_MAP_LNG=-77.0884
```

> `NEXT_PUBLIC_WHATSAPP_NUMBER` debe tener el formato `51` + número (sin `+`, sin espacios).
> `NEXT_PUBLIC_GOOGLE_MAPS_URL` es opcional: si se deja vacío, el enlace del mapa se genera automáticamente a partir de la dirección configurada en `data/site.ts`.
> `NEXT_PUBLIC_MAP_LAT` / `NEXT_PUBLIC_MAP_LNG` alimentan el schema de geolocalización (SEO local); coloca las coordenadas reales del negocio.

## Despliegue gratis en Vercel

El sitio es 100% estático, ideal para Vercel. Pasos:

1. **Subir el proyecto a GitHub** (esta carpeta ya es un repo con rama `main`):

   ```bash
   git remote add origin https://github.com/TU_USUARIO/josue-panaderia.git
   git push -u origin main
   ```

2. **Crear el proyecto en Vercel:**
   - Ir a [vercel.com/new](https://vercel.com/new) e iniciar sesión con GitHub.
   - Importar el repo `josue-panaderia`.
   - Framework: **Next.js** (detectado automáticamente). Root Directory: `/`.
   - No cambies los comandos por defecto (`npm run build` / `npm start`).

3. **Configurar las variables de entorno** en Vercel → *Settings* → *Environment Variables*:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | URL de producción (p. ej. `https://josue-panaderia.vercel.app`) |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número real en formato `51xxxxxxxxx` |
   | `NEXT_PUBLIC_GOOGLE_MAPS_URL` | (Opcional) Enlace de Google Maps de la panadería |
   | `NEXT_PUBLIC_MAP_LAT` | Latitud real del negocio |
   | `NEXT_PUBLIC_MAP_LNG` | Longitud real del negocio |

4. **Desplegar:** Vercel hace *Deploy* automático desde `main`. Con cada `git push` se actualiza solo.

5. **(Opcional) Dominio propio:** Vercel → *Settings* → *Domains* → agregar `josuepanaderia.pe` y configurar los DNS. SSL gratis automático.

> Previews: cada rama/PR que subas genera una URL de vista previa sin afectar producción.

## Assets

Los assets de trabajo se incluyen en PNG y WebP. Los iconos y el logo se incluyen en SVG.

> Nota: las fotografías se reconstruyeron desde la maqueta y las referencias proporcionadas. Para producción final conviene sustituirlas por los originales fotográficos o por assets generados/exportados desde su fuente para conservar el máximo detalle.
