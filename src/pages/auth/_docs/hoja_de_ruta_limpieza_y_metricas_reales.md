# Hoja de Ruta: Limpieza de Marcas Demo, Carga Masiva Real y Conexión de Métricas Supabase

## 📌 Principios de Desarrollo y Calidad
- **Análisis a profundidad en código**: No se asumen errores ni comportamientos sin inspeccionar el código fuente.
- **Investigación fundamentada**: Validado con el patrón de exportación nativa CSV/UTF-8 BOM de la plataforma.
- **Soluciones reales, cero parches**: Ninguna solución superficial ni parches temporales.
- **Candado Visual Restricto**: No se altera el diseño, responsive ni maquetación.
- **Entorno seguro**: Se trabaja dentro de la rama principal (`main-web`) y directorio raíz.

---

## 🚀 Fases de Ejecución Paso a Paso

### FASE 1: Verificación de Módulos y Nomenclatura ("Empresas" vs "Marcas")
- **Diagnóstico del hallazgo**:
  - En `HubPanelPage.jsx`, la barra de navegación del Super Administrador (`SUPER_ADMIN_NAV`) registra el ícono de empresas con el nombre literal **"Empresas"** (`id: 'Empresas'`, `label: 'Empresas'`).
  - Para los Administradores de marca (`TENANT_ADMIN_NAV`), esta opción se oculta automáticamente mediante `SUPER_ADMIN_NAV.filter((nav) => nav.id !== 'Empresas')`.
- **Acción**:
  - Renombrar o ajustar la etiqueta en el menú lateral de **"Empresas"** a **"Marcas (Empresas)"** o **"Marcas"** si el usuario lo prefiere para alinearlo con el vocabulario comercial.

---

### FASE 2: Descarga de Marcas Ficticias a Excel (Exportación CSV / BOM)
- **Lógica probada en el proyecto**:
  - Utilizar el mecanismo estándar de exportación de la plataforma (`Blob` con codificación `UTF-8 BOM` `\uFEFF` para apertura directa e impecable en Microsoft Excel).
- **Campos a exportar desde la tabla `tenants`**:
  - `id`, `name` (Nombre Comercial), `slug`, `status` (activa, prueba, inactiva), `created_at`, `contact_email`, `plan_id`.
- **Botón de Descarga**:
  - Ubicado en la cabecera de `HubSuperEmpresasModule.jsx` ("Exportar Marcas a Excel").

---

### FASE 3: Limpieza Segura de Datos Demo y Subida de Marcas Reales
- **Paso 3.1: Limpieza en Supabase**:
  - Ejecutar script SQL de borrado seguro o API `supabase.from('tenants').delete()` para eliminar las marcas demo (*CoraVet*, *EPC Contable*, *Vallet Inmobiliaria*, *Mesa Selecta*, etc.).
- **Paso 3.2: Plantilla de Carga Masiva (CSV / XLSX)**:
  - Formato estandarizado para la inserción de las empresas/marcas oficiales del cliente.
- **Paso 3.3: Inserción y Vinculación de Tenants**:
  - Carga masiva mediante Supabase Client o script de importación con sus respectivos administradores asignados.

---

### FASE 4: Reemplazo de Tarjetas y Métricas Mock por Queries Reales de Supabase
Reemplazar los valores estáticos de las plantillas por consultas reactivas reales a la base de datos:

1. **Dashboard Inicio (`HubPanelPage.jsx`)**:
   - `Empresas Activas`: `supabase.from('tenants').select('*', { count: 'exact' }).eq('status', 'active')`
   - `MRR Total`: `supabase.from('subscriptions').select('mrr')` (Suma total real).
   - `Suscripciones Activas`: Conteo directo en `subscriptions`.
2. **Panel de Configuración (`HubSuperConfiguracionPanel.jsx`)**:
   - Reemplazar valores estáticos ("24 parámetros", "12 empresas", "6 integraciones") por:
     - `Marcas Configuradas`: Conteo dinámico de `tenants`.
     - `Integraciones Activas`: Estado dinámico del array de integraciones configuradas en `system_settings`.
     - `Estado del Sistema`: Health check dinámico de conexión Supabase (`supabase.auth.getSession()`).
3. **Paneles de Pagos, Soporte y Reportes**:
   - Vincular los gráficos de dona y barras a las sumatorias reales por plan y por estado de ticket.

---

### 📊 Matriz de Verificación y Entregables
- [ ] Verificación de visibilidad de ítem "Marcas" para Super Admin.
- [ ] Exportación exitosa de CSV compatible con Excel.
- [ ] Limpieza de base de datos sin huérfanos RLS.
- [ ] Inserción de marcas reales de Qaway Lab.
- [ ] Métricas en vivo 100% conectadas a Supabase.
- [ ] Auditoría de compilación `npx oxlint` + `npm run build`.
