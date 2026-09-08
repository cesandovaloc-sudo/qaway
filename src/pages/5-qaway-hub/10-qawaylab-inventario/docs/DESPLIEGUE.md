# 🚀 Guía de Despliegue — QawayLab Inventario

**Versión:** 1.0  
**Fecha:** 15 de agosto de 2026  
**Stack:** React 19 + Vite 8 + Supabase + Tailwind CSS 4

---

## 📋 Índice

1. [Prerrequisitos](#1-prerrequisitos)
2. [Crear proyecto en Supabase](#2-crear-proyecto-en-supabase)
3. [Configurar variables de entorno](#3-configurar-variables-de-entorno)
4. [Ejecutar migraciones SQL](#4-ejecutar-migraciones-sql)
5. [Desplegar Edge Functions](#5-desplegar-edge-functions)
6. [Configurar autenticación (Auth)](#6-configurar-autenticación-auth)
7. [Configurar Storage (imágenes)](#7-configurar-storage-imágenes)
8. [Build de producción](#8-build-de-producción)
9. [Desplegar el frontend](#9-desplegar-el-frontend)
10. [Verificación post-despliegue](#10-verificación-post-despliegue)
11. [Configurar dominio personalizado](#11-configurar-dominio-personalizado)
12. [Mantenimiento y backups](#12-mantenimiento-y-backups)

---

## 1. Prerrequisitos

### Cuentas necesarias

| Servicio | Propósito | Costo |
|---|---|---|
| [Supabase](https://supabase.com) | Base de datos, Auth, Storage, Edge Functions | Gratis (500 MB DB, 1 GB Storage, 500K Edge invocations) |
| [Vercel](https://vercel.com) o [Netlify](https://netlify.com) | Hosting del frontend | Gratis (suficiente para empezar) |
| [GitHub](https://github.com) | Repositorio del código fuente | Gratis |

### Herramientas locales

```bash
# Node.js (v18+)
node --version   # Debe ser v18 o superior

# npm
npm --version

# Git
git --version

# Supabase CLI (opcional pero recomendado)
npm install -g supabase
supabase --version
```

### Verificar que el proyecto compila localmente

```bash
# 1. Clonar o navegar al proyecto
cd 10-qawaylab-inventario

# 2. Instalar dependencias
npm install

# 3. Verificar que no hay errores TypeScript
npm run typecheck

# 4. Verificar que los tests pasan
npm run test:run

# 5. Build de producción
npm run build

# 6. Verificar que el build se generó
ls -la dist/
```

> **⚠️ Importante:** El proyecto depende de `@qawaylab/pago` (repo `3-qawaylab-pagos`). Asegúrate de que esa dependencia esté disponible. Si vas a desplegar en CI/CD, necesitarás configurar el acceso a ese paquete.

---

## 2. Crear proyecto en Supabase

### 2.1 Crear el proyecto

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Completa:
   - **Organization:** Selecciona o crea una
   - **Project name:** `qawaylab-inventario`
   - **Database Password:** Genera una contraseña segura (guárdala)
   - **Region:** `South America (São Paulo)` — más cercana a Perú
4. Click **"Create new project"**
5. Espera ~2 minutos a que se cree

### 2.2 Obtener credenciales

Una vez creado el proyecto:

1. Ve a **Settings → API** (ícono engranaje, columna izquierda)
2. Copia estos valores:

```
Project URL:    https://xxxxxxxx.supabase.co    ← VITE_SUPABASE_URL
Anon Key:       eyJhbGciOiJIUzI1NiIs...        ← VITE_SUPABASE_ANON_KEY
Service Role:   eyJhbGciOiJIUzI1NiIs...        ← NO USAR EN EL FRONTEND
```

> **⚠️ Seguridad:** La `service_role key` NUNCA va en el frontend. Solo se usa en Edge Functions y migraciones server-side.

### 2.3 (Opcional) Conectar con Supabase CLI

```bash
# Login
supabase login

# Vincular el proyecto local
supabase link --project-ref xxxxxxxx

# Verificar conexión
supabase db remote status
```

---

## 3. Configurar variables de entorno

### 3.1 Crear archivo `.env`

```bash
cp .env.example .env
```

### 3.2 Completar las variables

```env
# ─── SUPABASE ───────────────────────────────────
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# ─── APP ────────────────────────────────────────
VITE_PUBLIC_SITE_URL=https://tudominio.com
VITE_PUBLIC_APP_URL=https://tudominio.com

# ─── WHATSAPP / CONTACTO (opcional) ─────────────
VITE_PUBLIC_WHATSAPP=51999888777
VITE_PUBLIC_PHONE=51999888777

# ─── CARRITO (módulo @qawaylab/pago) ───────────
VITE_CART_ENABLED=false
# VITE_STRIPE_PUBLISHABLE_KEY=
# VITE_MERCADOPAGO_PUBLIC_KEY=

# ─── AI (captura de productos con IA) ───────────
VITE_OPENAI_API_KEY=
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
```

### 3.3 Variables para Edge Functions (secrets)

Estas **NO van en `.env`** — se configuran como secrets de Supabase:

```bash
# Consulta SUNAT/RENIEC (RUC/DNI)
supabase secrets set SUNAT_LOOKUP_API_TOKEN=tu_token_de_apis_net_pe
# Token de https://apis.net.pe — plan gratis: 500 consultas/mes
```

Si no usas Supabase CLI:

1. Ve a **Edge Functions → Settings → Secrets** en el dashboard de Supabase
2. Agrega `SUNAT_LOOKUP_API_TOKEN` con tu token

---

## 4. Ejecutar migraciones SQL

### 4.1 Archivos de migración (9 archivos)

Las migraciones crean todas las tablas necesarias:

| # | Archivo | Qué crea |
|---|---|---|
| 1 | `20260812000000_auth_roles_rls.sql` | Roles, políticas RLS, funciones de auth |
| 2 | `20260812000001_qawa_pagos_commerce.sql` | Tablas de pagos y comercio |
| 3 | `20260813000001_baseline_inventario.sql` | **Core:** productos, categorías, ubicaciones, stock, ventas, clientes |
| 4 | `20260813000002_clientes_fiscal.sql` | Documento fiscal, dirección, consulta SUNAT |
| 5 | `20260813000003_config_fiscal.sql` | Configuración fiscal (IGV, series, correlativos) |
| 6 | `20260813000004_ventas_credito.sql` | Ventas a crédito, pagos parciales |
| 7 | `20260813000005_facturacion.sql` | Facturación SUNAT (boletas, facturas, notas) |
| 8 | `20260813000006_compras_caja_contabilidad.sql` | Proveedores, órdenes de compra, caja chica, gastos |
| 9 | `20260813000007_accounting_entries.sql` | Asientos contables (débito/crédito) |

### 4.2 Método A: Supabase Dashboard (recomendado para empezar)

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Abre cada archivo `.sql` de la carpeta `supabase/migrations/`
3. **Copia y pega** el contenido completo en el editor SQL
4. Click **"Run"** (▶️)
5. Repite para cada archivo **en orden numérico**

> **⚠️ Orden importante:** Ejecutar las migraciones en orden. Si una falla, las siguientes pueden fallar también.

### 4.3 Método B: Supabase CLI

```bash
# Ejecutar todas las migraciones pendientes
supabase db push

# O ejecutar una específica
supabase migration up
```

### 4.4 Verificar que las tablas se crearon

En el SQL Editor de Supabase, ejecuta:

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver estas tablas:

```
accounting_entry_balances (vista)
accounting_entry_lines
accounting_entries
bundle_items
bundles
categories
customers
expenses
inventory_movements
locations
petty_cash_movements
products
product_images
promotions
purchase_order_items
purchase_orders
quotation_items
quotations
sale_items
sale_payments
sales
suppliers (vista)
```

### 4.5 Verificar las funciones

```sql
-- Ver funciones creadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

Deberías ver funciones como:

- `next_sale_number()`
- `next_quotation_number()`
- `next_order_number()`
- `next_entry_number()`
- `update_product_stock()`
- `get_or_create_customer()`
- Y otras...

---

## 5. Desplegar Edge Functions

### 5.1 Función existente: `consulta-ruc-dni`

Esta función consulta SUNAT/RENIEC para obtener datos de RUC o DNI.

### 5.2 Desplegar con CLI

```bash
# Desplegar la función
supabase functions deploy consulta-ruc-dni

# Verificar
supabase functions list
```

### 5.3 Desplegar sin CLI (manual)

1. Ve a **Edge Functions** en el dashboard de Supabase
2. Click **"Create a new function"**
3. Nombre: `consulta-ruc-dni`
4. Copia el contenido de `supabase/functions/consulta-ruc-dni/index.ts`
5. Pegalo en el editor
6. Click **"Deploy"**

### 5.4 Configurar secrets de la Edge Function

```bash
supabase secrets set SUNAT_LOOKUP_API_TOKEN=tu_token
```

### 5.5 Probar la Edge Function

```bash
# Test local (si tienes Supabase CLI)
supabase functions serve consulta-ruc-dni
curl http://localhost:54321/functions/v1/consulta-ruc-dni?document=20123456789

# Test en producción
curl https://xxxxxxxx.supabase.co/functions/v1/consulta-ruc-dni?document=20123456789
```

---

## 6. Configurar autenticación (Auth)

### 6.1 Habilitar métodos de login

En el dashboard de Supabase:

1. Ve a **Authentication → Providers**
2. Habilita:
   - **Email** ✅ (ya viene habilitado)
   - **Google** (opcional, para login con Google)

### 6.2 Crear usuario administrador

**Opción A — Desde el dashboard:**

1. Ve a **Authentication → Users**
2. Click **"Add user"**
3. Email: `admin@qawaylab.com`
4. Password: `tu_contraseña_segura`
5. Click **"Create user"**

**Opción B — Desde tu app local:**

1. Inicia la app localmente (`npm run dev`)
2. Ve a la pantalla de Login
3. Regístrate con tu email
4. En Supabase SQL Editor, ejecuta:

```sql
-- Asignar rol de admin al usuario
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'id_del_usuario';
```

### 6.3 Verificar RLS

```sql
-- Ver políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 7. Configurar Storage (imágenes)

### 7.1 Crear bucket para imágenes

1. Ve a **Storage** en el dashboard de Supabase
2. Click **"New bucket"**
3. Nombre: `product-images`
4. **Public bucket:** ✅ (para que las imágenes sean accesibles vía URL)
5. Click **"Create bucket"**

### 7.2 Configurar políticas de Storage

En el SQL Editor:

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Permitir subir imágenes a usuarios autenticados
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Permitir eliminar imágenes al propietario
CREATE POLICY "Owner delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() = (storage.foldername(name))[1]::uuid
);
```

### 7.3 Bucket adicional para logos (branding)

```sql
-- Bucket para logos de clientes (white-label)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true);
```

---

## 8. Build de producción

### 8.1 Preparar el build

```bash
# 1. Asegúrate de tener el .env correcto
cat .env

# 2. Limpiar builds anteriores
rm -rf dist/

# 3. Ejecutar build completo
npm run build

# 4. Verificar que no hay errores
echo "Build exitoso si dist/ existe:"
ls -la dist/
```

### 8.2 Salida esperada

```
dist/
├── index.html          ← Punto de entrada
├── assets/
│   ├── index-[hash].js ← Bundle JS principal
│   ├── index-[hash].css ← Estilos
│   └── ...             ← Otros assets
└── ...
```

### 8.3 Verificar localmente el build

```bash
# Previsualizar el build como si fuera producción
npm run preview -- --port 9600

# Abrir http://localhost:9600 en el navegador
```

---

## 9. Desplegar el frontend

### Opción A: Vercel (recomendado — más fácil)

#### 9A.1 Configurar Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (o `10-qawaylab-inventario` si el repo tiene múltiples carpetas)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Agrega las **Environment Variables** (las mismas del `.env`)
6. Click **"Deploy"**

#### 9A.2 Variables de entorno en Vercel

En **Settings → Environment Variables**, agrega cada variable:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `VITE_PUBLIC_SITE_URL` | `https://tudominio.vercel.app` |
| `VITE_PUBLIC_APP_URL` | `https://tudominio.vercel.app` |
| `VITE_PUBLIC_WHATSAPP` | `51999888777` |
| `VITE_CART_ENABLED` | `false` |

> **⚠️ Importante:** Las variables de Vite necesitan el prefijo `VITE_` para estar disponibles en el cliente. Asegúrate de que estén configuradas en el entorno de **Production**, no solo en Development.

#### 9A.3 Dominio personalizado en Vercel

1. Ve a **Settings → Domains**
2. Agrega tu dominio: `inventario.qawaylab.com`
3. Configura el DNS de tu dominio:
   - Si usas Vercel DNS: automático
   - Si usas otro proveedor: agrega un registro CNAME apuntando a `cname.vercel-dns.com`

---

### Opción B: Netlify

#### 9B.1 Configurar Netlify

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Agrega las **Environment Variables**
6. Click **"Deploy site"**

#### 9B.2 Redirects para SPA

Crea el archivo `public/_redirects` (o `netlify.toml`):

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

> Esto es necesario para que React Router funcione correctamente. Sin esto, recargar una página directa (ej: `/ventas/nueva`) dará error 404.

---

### Opción C: Cloudflare Pages

#### 9C.1 Configurar

1. Ve a [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages → Create → Pages**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. Agrega las variables de entorno
6. Click **"Save and Deploy"**

---

## 10. Verificación post-despliegue

### 10.1 Checklist de verificación

Abrir la URL de producción y verificar:

| # | Verificar | Cómo | Estado |
|---|---|---|---|
| 1 | **Página carga** | Abrir la URL — no debe mostrar pantalla blanca | ⬜ |
| 2 | **Login funciona** | Crear cuenta o login con credenciales | ⬜ |
| 3 | **Dashboard carga** | Ver métricas, gráficos, acciones rápidas | ⬜ |
| 4 | **Productos** | Crear un producto, editarlo, ver la lista | ⬜ |
| 5 | **Categorías** | Crear categoría, asignar a producto | ⬜ |
| 6 | **Clientes** | Crear cliente con DNI/RUC | ⬜ |
| 7 | **Venta** | Crear una venta desde el POS | ⬜ |
| 8 | **Stock se actualiza** | Después de vender, verificar stock en productos | ⬜ |
| 9 | **Reportes** | Verificar que cargan sin errores | ⬜ |
| 10 | **Exportar** | Probar CSV y PDF | ⬜ |
| 11 | **Gráficos** | Verificar que Recharts renderiza correctamente | ⬜ |
| 12 | **Responsive** | Probar en móvil (abrir en celular) | ⬜ |
| 13 | **Branding** | Cambiar colores/logo en Configuración | ⬜ |
| 14 | **Consulta SUNAT** | Probar buscar RUC desde nuevo cliente | ⬜ |

### 10.2 Verificar en la consola del navegador

1. Abrir la app → F12 (Developer Tools)
2. Pestaña **Console** — no debe haber errores rojos
3. Pestaña **Network** — verificar que las llamadas a Supabase responden 200
4. Pestaña **Application** → **Service Workers** — verificar que no haya cache obsoleto

### 10.3 Probar en diferentes navegadores

- ✅ Chrome (desktop y mobile)
- ✅ Firefox
- ✅ Safari (si tienes Mac)
- ✅ Edge

---

## 11. Configurar dominio personalizado

### 11.1 Opciones de dominio

| Dominio | Ejemplo | Cuándo usar |
|---|---|---|
| Subdominio | `inventario.qawaylab.com` | Producto principal |
| Subdominio cliente | `tienda-cliente.qawaylab.com` | White-label |
| Dominio propio | `sistema.micomercio.com` | Cliente premium |

### 11.2 Configurar DNS

En tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.):

**Para Vercel:**
```
Tipo: CNAME
Nombre: inventario
Valor: cname.vercel-dns.com
TTL: Auto
```

**Para Netlify:**
```
Tipo: CNAME
Nombre: inventario
Valor: tu-sitio.netlify.app
TTL: Auto
```

### 11.3 SSL/TLS

Tanto Verc como Netlify y Cloudflare Pages generan certificados SSL automáticamente. No necesitas configurar nada adicional.

---

## 12. Mantenimiento y backups

### 12.1 Backups de la base de datos

**Automático (Supabase):**
- Supabase hace backups diarios automáticos (plan gratuito: 7 días de retención)
- Plan Pro: backups diarios + point-in-time recovery

**Manual (recomendado antes de cambios grandes):**

```bash
# Exportar toda la base de datos
supabase db dump > backup_$(date +%Y%m%d).sql

# O exportar solo las tablas públicas
supabase db dump --data-only > backup_datos_$(date +%Y%m%d).sql
```

**Desde el dashboard:**
1. Ve a **Settings → Database**
2. Sección **Backups**
3. Click **"Create a backup"** (plan Pro)

### 12.2 Monitoreo

En el dashboard de Supabase:

| Sección | Qué monitorear |
|---|---|
| **Database → SQL Editor** | Queries lentas |
| **Edge Functions → Logs** | Errores en funciones |
| **Auth → Users** | Usuarios activos |
| **Storage → Usage** | Espacio usado |
| **Settings → Usage** | Límites del plan gratuito |

### 12.3 Actualizaciones

```bash
# Actualizar dependencias (cada 3 meses según el estándar)
npm outdated
npm update

# Verificar que todo sigue funcionando
npm run typecheck
npm run test:run
npm run build
```

### 12.4 Escalar cuando sea necesario

| Límite del plan gratuito | Cuándo escalar | Plan recomendado |
|---|---|---|
| 500 MB de base de datos | Cuando tengas ~100K productos con imágenes | Pro ($25/mes) |
| 1 GB de Storage | Cuando subas ~500 imágenes de productos | Pro ($25/mes) |
| 500K Edge invocations | Cuando tengas ~500 usuarios activos | Pro ($25/mes) |
| 2 GB de bandwidth | Cuando tengas ~10K visitas/mes | Pro ($25/mes) |

---

## 🔧 Troubleshooting (Problemas comunes)

### La app muestra pantalla blanca

```bash
# Verificar que .env tiene las credenciales correctas
cat .env | grep VITE_SUPABASE

# Rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### Las imágenes no cargan

1. Verificar que el bucket `product-images` existe en Storage
2. Verificar que las políticas de Storage están configuradas
3. Verificar que la imagen es pública

### Login no funciona

1. Verificar que Auth está habilitado en Supabase
2. Verificar que el usuario fue creado
3. Verificar que RLS no está bloqueando la inserción de roles
4. Revisar la consola del navegador (F12) para errores

### Vite no encuentra `@qawaylab/pago`

Este es un paquete local. En producción necesitas:

```bash
# Opción 1: Publicar como paquete npm privado
# Opción 2: Copiar el código al build
# Opción 3: Usar un monorepo (turborepo/nx)
```

### Las variables de entorno no funcionan en Vercel

1. Verificar que las variables tienen el prefijo `VITE_`
2. Verificar que están configuradas para el entorno **Production**
3. **Redesplegar** después de cambiar variables (Vite las inyecta en build time)

### Edge Function retorna error 404

```bash
# Verificar que la función está desplegada
supabase functions list

# Redesplegar
supabase functions deploy consulta-ruc-dni
```

---

## 📊 Resumen de costos estimados

### Plan gratuito (para empezar)

| Servicio | Costo mensual |
|---|---|
| Supabase Free | $0 |
| Vercel Free | $0 |
| Dominio | $0 (usando .vercel.app) |
| **Total** | **$0/mes** |

### Cuando crezcas (100+ clientes)

| Servicio | Costo mensual |
|---|---|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Dominio propio | ~$1 |
| **Total** | **~$46/mes** |

---

## 📝 Notas para white-label (clientes)

Cuando vendas la app a un cliente con su propia marca:

1. **Supabase:** Crear un proyecto separado por cliente (aislamiento de datos)
2. **Dominio:** Configurar subdominio o dominio propio del cliente
3. **Branding:** El cliente configura colores y logo desde Configuración
4. **Datos:** El cliente empieza con base de datos limpia
5. **Migraciones:** Las mismas migraciones SQL se aplican a cada nuevo proyecto
6. **Costo:** Si vendes SaaS, tú absorbes el costo de Supabase/Vercel y lo incluyes en la mensualidad

---

*Documento generado para QawayLab — Inventario v0.1.0*
