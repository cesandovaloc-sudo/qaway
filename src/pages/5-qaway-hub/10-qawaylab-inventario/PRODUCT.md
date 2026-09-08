# PRODUCT.md — Sistema de Inventario + Liquidación

## Nombre del producto
**Inventario Qaway** (interno: `10-qawaylab-inventario`)

## Tipo de producto
Aplicación web operativa (dashboard/panel administrativo)

## Propósito
Sistema modular para organizar, valorar, gestionar y comercializar inventario. Su primer caso de validación es la liquidación de inventario de proyectos terminados, pero la arquitectura debe permitir convertirse en un producto revendible.

## Usuario principal
- Administrador/CEO de negocios pequeños-medianos
- Equipo de operaciones que gestiona productos, stock y precios
- Futuro: clientes externos consultando catálogos de liquidación

## Módulos implementados

### 1. Dashboard
- Métricas reales de inventario
- Acciones rápidas
- Actividad reciente
- Productos destacados
- Alertas de stock bajo

### 2. Inventario
- **Productos**: CRUD completo con tabla y grid
- **Detalle de producto**: Galería, información, precios, historial
- **Categorías**: Árbol jerárquico
- **Ubicaciones**: Almacenes, zonas, estantes
- **Movimientos**: Entradas, salidas, transferencias, ajustes

### 3. Captura IA
- Subir/tomar foto
- Análisis automático con IA
- Borrador editable
- Confirmación y guardado

### 4. Precios
- **Listas de precios**: Normal, mayorista, oferta, liquidación
- **Precios por producto**: Múltiples listas
- **Reglas de precio**: Descuentos por cantidad, fecha, cliente

### 5. Paquetes (Bundles)
- Agrupación de productos
- Precio individual vs precio paquete
- Cálculo automático de stock disponible

### 6. Liquidación
- **Campañas**: Crear, editar, gestionar estados
- **Selección de productos**: Del inventario existente
- **Precios especiales**: Precio de liquidación
- **Estados**: Borrador → Preparando → Activa → Finalizada

### 7. Catálogo
- **Generación de PDF**: Con diseño profesional
- **Código QR**: Para compartir
- **URL pública**: `/remates/:slug`
- **Compartir WhatsApp**: Texto predefinido

### 8. Comercial
- **Clientes**: CRUD con tipos (particular, empresa, mayorista, revendedor)
- **Cotizaciones**: Crear con selección de productos, estados, totales

### 9. Seguridad
- **Usuarios**: Roles (admin, editor, viewer, guest)
- **Permisos granulares**: 28 permisos configurables
- **Enlaces compartidos**: Acceso invitado con tokens

## Flujo principal (MVP)
```
TOMAR FOTO → IA ANALIZA → CONFIRMAR → INVENTARIO → PRECIO → PAQUETE → LIQUIDACIÓN → CATÁLOGO → COMPARTIR
```

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router
- Supabase (Auth + Postgres + RLS + Storage)
- Lucide icons
- jsPDF + html2canvas (generación de PDF)

## Arquitectura de datos
```
UI → Feature → Service → Repository/Adapter → Supabase
```

## Propiedad de datos
| Entidad | Propietario |
|---------|-------------|
| products, categories, variants | inventory |
| price_lists, product_prices | pricing |
| bundles, bundle_items | pricing |
| liquidation_campaigns | liquidation |
| customers | commerce |
| quotations | commerce |
| catalogs | commerce/liquidation |
| users, shared_access_links | auth |

## Rutas principales
| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard |
| `/inventario` | Lista de productos |
| `/inventario/:id` | Detalle de producto |
| `/inventario/categorias` | Categorías |
| `/inventario/ubicaciones` | Ubicaciones |
| `/inventario/movimientos` | Movimientos |
| `/precios` | Listas de precios |
| `/paquetes` | Paquetes/Bundles |
| `/liquidacion` | Campañas de liquidación |
| `/liquidacion/catalogos` | Catálogos |
| `/clientes` | Clientes |
| `/cotizaciones` | Cotizaciones |
| `/captura` | Captura con IA |
| `/config` | Configuración |
| `/config/enlaces` | Enlaces compartidos |
| `/acceso/:token` | Acceso invitado (público) |
| `/remates/:slug` | Catálogo público |

## White-label
Desde el inicio: nombre, logo, favicon, colores, contacto, WhatsApp, dominio — todo configurable, nada hardcodeado.

## No construir en MVP
- Ecommerce completo
- Facturación
- CRM completo
- Multi-tenant complejo
- 50 dashboards

## Commits recientes
```
23756f5 feat: dashboard con metricas reales
c685c96 feat: formulario cotizacion
4a6ce8f feat(fase-8): comercial
db0bd0d feat: enlaces compartidos
a4b449f feat: pagina detalle producto
d988924 feat(fase-7): catalogo
00cd7f3 feat(fase-6): liquidacion
ae35750 feat(fase-4-5): precios + paquetes
44a074a feat(fase-4): precios
aefa2c8 feat(fase-3): captura ia
fc5d96a feat(fase-2): inventario basico
3d9b450 feat(fase-1): foundation
78c1053 chore: baseline
```
