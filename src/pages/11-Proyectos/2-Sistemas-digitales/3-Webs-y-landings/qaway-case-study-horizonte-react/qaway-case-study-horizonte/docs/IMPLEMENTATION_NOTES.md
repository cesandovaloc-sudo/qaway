# Implementation notes

## Dependencias
React + TypeScript + Vite + Tailwind CSS 4 + Motion + Lucide.

No se incluye GSAP porque esta primera implementación no requiere una narrativa de scroll compleja. Si se añade, cargarlo solo en la experiencia que lo necesite.

## Video
Los dos espacios de video están preparados como contenedores. Conectar archivos `.mp4`/`.webm` o un proveedor de video cuando estén disponibles.

## SEO
El `index.html` contiene metadata mínima. Para una ruta pública real, añadir canonical, Open Graph, schema y sitemap conforme al estándar general.

## Datos
El contenido del proyecto está separado en `src/data/project.ts`.

## Integraciones
No se conectan CRM/Supabase en esta demo. La mención de CRM/WhatsApp es parte de la narrativa del case study; cualquier integración real debe pasar por servicio/adaptador.
