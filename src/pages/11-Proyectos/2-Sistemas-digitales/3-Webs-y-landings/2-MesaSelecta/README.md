# Mesa Selecta — catálogo web

Código fuente de la primera versión funcional de la web de Mesa Selecta.

## Incluye

- Inicio responsive.
- Catálogo con filtros y ordenamiento.
- Fichas individuales de producto.
- Carrito persistente.
- Finalización y confirmación de pedidos.
- API para registrar pedidos.
- Blog y artículos.
- Páginas de contacto, entrega y guía de compra.
- Integración preparada para Supabase.
- Inventario provisional local para que la web funcione sin conexión externa.

## Requisitos

- Node.js 22.13 o superior.
- Una cuenta de Supabase para activar datos, imágenes y pedidos reales.

## Uso local

1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta.
3. Ejecuta `npm install`.
4. Copia `.env.example` como `.env.local`.
5. Completa las variables de Supabase.
6. Ejecuta `npm run dev`.

Sin variables de Supabase, la web usa los productos y artículos provisionales
incluidos en `lib/fallback-data.ts`.

## Preparar Supabase

1. Crea un proyecto en Supabase.
2. Abre el editor SQL.
3. Ejecuta el contenido de `supabase/schema.sql`.
4. Crea un bucket público para imágenes de productos.
5. Agrega las tres variables descritas en `.env.example`.

La clave `SUPABASE_SERVICE_ROLE_KEY` es privada. Debe configurarse únicamente
en el servidor o plataforma de hosting; nunca debe publicarse en el navegador
ni guardarse en un repositorio público.

## Contenido principal

- `app/`: páginas y rutas.
- `components/`: componentes del catálogo, carrito y checkout.
- `lib/fallback-data.ts`: inventario y blog provisionales.
- `lib/data.ts`: lectura de productos y artículos desde Supabase.
- `supabase/schema.sql`: estructura inicial de la base de datos.
- `public/`: archivos visuales públicos.

## Estado actual

Esta entrega reproduce la versión publicada para revisión. Todavía faltan:

- Fotografías reales de los cinco productos.
- Logo final optimizado para web.
- Credenciales del proyecto Supabase definitivo.
- Configuración del almacenamiento de imágenes.
- Medio de pago, si se decide cobrar dentro de la web.
- Datos definitivos de Instagram y WhatsApp.

