# Auditoría Técnica de Capacidades y Alcance del Super Administrador (Multi-Tenant)

> **Documento de Auditoría y Referencia de Arquitectura**  
> **Fecha de Elaboración:** 2026-09-29  
> **Módulo:** Qaway Hub / 10-QawayLab-Inventario  
> **Modo de Operación:** Solo Lectura (Inspección de Esquema, RLS, Adaptadores y Estado de Sesión)

---

## 1. Resumen Ejecutivo y Diagnóstico del Incidente

Durante las pruebas de creación de productos en el módulo **Inventario** (`/hub/inventario/productos`) autenticado con la cuenta de **Super Administrador**, se presentó el siguiente error de base de datos en Supabase:

```text
null value in column "tenant_id" of relation "products" violates not-null constraint
```

Para mitigar temporalmente la ruptura de la interfaz, se introdujo un fallback en `supabaseProductAdapter.ts`:
```typescript
payload.tenant_id = userData?.tenant_id || '00000000-0000-0000-0000-000000000001'
```

La presente auditoría analiza la legalidad técnica, los riesgos de aislamiento multi-tenant y las implicancias operativas de dicha asignación, documentando en detalle el funcionamiento real del Super Administrador en la plataforma Qaway Lab.

---

## 2. Desarrollo de los 9 Puntos de Auditoría

### 2.1. Identificación del Super Administrador y Permisos Efectivos
- **Hecho Verificado en Base de Datos:**
  - En la tabla `public.users`, la condición técnica que define a un Super Administrador de plataforma es:
    $$\text{role} = \text{'admin'} \quad \land \quad \text{is\_platform\_admin} = \text{true}$$
    *(Migración `20260921133000_platform_vs_brand_admin.sql`, líneas 15-29).*
  - Las funciones SQL autoritativas de seguridad son:
    - `public.is_platform_admin()`: Retorna `true` si el usuario autenticado tiene rol `admin` y bandera `is_platform_admin = true`.
    - `public.is_admin()`: Redefinida formalmente para invocar a `public.is_platform_admin()`. Ya **no** otorga privilegios de plataforma a administradores de marcas específicas.
    - `public.is_tenant_admin()`: Retorna `true` si `role = 'admin'` y `tenant_id IS NOT NULL`.
- **Hecho Verificado en Frontend:**
  - En el Shell del Hub (`HubPanelPage.jsx`, líneas 2200-2204), se evalúa:
    ```javascript
    const dbIsPlatform = Boolean(me.is_platform_admin)
    const metaIsPlatform = Boolean(session.user?.user_metadata?.is_platform_admin)
    const isPlatformAdmin = dbIsPlatform || metaIsPlatform
    ```
  - En el servicio de usuario de Inventario (`userService.ts`, líneas 50-60):
    Detecta `isPlatformAdmin = data.is_platform_admin === true`.
  - Permisos RLS: `is_platform_admin` permite omitir las cláusulas `tenant_id = get_auth_tenant_id()` en SELECT, INSERT, UPDATE y DELETE en prácticamente todas las tablas.
  - Protección de roles: En el trigger `prevent_role_escalation()`, si `public.is_platform_admin()` es verdadero, se omiten todas las restricciones de escalamiento de privilegios.

### 2.2. Creación de Clientes, Empresas, Tenants y Marcas
- **Hecho Verificado:**
  - En el modelo de Qaway Lab, **Tenant = Empresa = Marca**. Cada fila en la tabla `public.tenants` representa un cliente corporativo (o la matriz Qaway Lab).
  - La creación se realiza desde el módulo de administración global de empresas (`HubSuperEmpresasModule.jsx`, líneas 480-511):
    - Genera un nuevo UUID (`crypto.randomUUID()`), slug saneado, nombre, sector/industria y estado `active`.
    - Inserta directamente en la tabla `public.tenants`:
      ```javascript
      await supabase.from("tenants").insert(payload).select().single()
      ```
  - Permiso RLS: La tabla `tenants` cuenta con política restrictiva que permite inserción y borrado únicamente a `public.is_admin()`.
  - Los clientes finales de cada empresa (clientes de e-commerce o facturación) se registran en la tabla `public.customers`, vinculados obligatoriamente al `tenant_id` de la empresa correspondiente.

### 2.3. Creación y Asignación de Usuarios a cada Empresa
- **Hecho Verificado:**
  - En el flujo de invitación (`InvitarPage.jsx`, líneas 31-42):
    - Si el usuario es `is_platform_admin = true`, el sistema consulta la lista de todas las empresas activas (`supabase.from('tenants').select('id, name, status')`) y presenta un selector desplegable (`tenantOptions`) para elegir a qué empresa vincular al invitado.
    - Si el usuario es un administrador de empresa convencional (`is_tenant_admin`), no existe selector y el nuevo usuario se bloquea a su propio `tenant_id`.
  - En la base de datos, la asignación formal se realiza mediante el procedimiento almacenado seguro:
    ```sql
    public.admin_assign_user_tenant(p_user_id uuid, p_tenant_id uuid, p_role text)
    ```
    - Si `public.is_platform_admin()`: Puede reasignar a cualquier usuario a cualquier tenant con cualquier rol (incluyendo `admin`).
    - Si `public.is_tenant_admin()`: Solo puede asignar a usuarios dentro de su propio `public.get_auth_tenant_id()` y tiene terminantemente prohibido otorgar el rol `admin`.
  - Trigger `handle_new_user()`: Al registrarse un usuario en `auth.users`, lee `raw_user_meta_data ->> 'tenant_id'` para poblar `public.users.tenant_id`.

### 2.4. Identificación del Tenant Activo y Selección de Marca
- **Hecho Verificado en Usuarios Estándar:**
  - Para usuarios regulares y administradores de marca, el tenant activo es **estático e inmutable** en la base de datos: reside en la columna `public.users.tenant_id`.
  - Toda consulta en Supabase ejecuta la función RLS `public.get_auth_tenant_id()`, aislando sus datos automáticamente.
- **Hecho Verificado en Super Administrador (Hub Central):**
  - En el panel general (`HubPanelPage.jsx`, líneas 2297-2309), el Super Administrador cuenta con la funcionalidad "Ver como [Marca]":
    - Se consulta la lista completa de marcas: `supabase.from('tenants').select('id, name, client_code')`.
    - Al seleccionar una marca, se guarda en almacenamiento de sesión:
      ```javascript
      sessionStorage.setItem('qaway.scopedTenant', JSON.stringify(scopedTenant))
      ```
    - Se computa:
      ```javascript
      const actingAsBrand = isPlatformAdmin && Boolean(scopedTenant)
      const effectiveTenantId = panelAuth ? (actingAsBrand ? scopedTenant.id : panelAuth.tenantId) : null
      ```
- **Falla Arquitectónica / Brecha Identificada en Inventario:**
  - El módulo Inventario (`10-qawaylab-inventario`) se monta a través de su propio router (`AppRouter.jsx`) y contexto de autenticación independiente (`src/context/AuthContext.tsx`).
  - **No lee `sessionStorage.getItem('qaway.scopedTenant')`**.
  - No expone selector de marca en su barra de navegación ni inyecta el `tenant_id` seleccionado en las mutaciones de productos.

### 2.5. Operaciones CRUD de Productos y Recursos
- **Hecho Verificado en `products` (`supabaseProductAdapter.ts`):**
  - **Lectura (`getProducts`):**
    Ejecuta `supabase.from('products').select('*', { count: 'exact' })` sin cláusula `.eq('tenant_id', ...)`.
    - Para un Tenant Admin, la política RLS `products_tenant_all` filtra transparentemente por `get_auth_tenant_id()`.
    - Para el Super Administrador, como `public.is_admin() = true`, la política RLS **no filtra nada**: el Super Administrador recibe los productos de **todas las empresas registradas en la base de datos**.
  - **Creación (`createProduct`):**
    Inserta en `public.products`.
    - Restricción de base de datos: `products.tenant_id` tiene restricción `NOT NULL` y clave foránea `REFERENCES public.tenants(id)`.
    - Si el Super Administrador tiene `users.tenant_id = null`, la inserción falla de inmediato por violación de restricción `NOT NULL`.
  - **Actualización y Eliminación (`updateProduct`, `deleteProduct`):**
    Ejecutan por `id`. El Super Administrador puede modificar o eliminar cualquier producto de cualquier empresa gracias a `public.is_admin() = true`.
- **Hecho Verificado en Tablas Secundarias de Inventario (`inventario_schema_central.sql`):**
  - Tablas como `inventory_locations`, `categories`, `product_variants`, `sales`, `customers`, etc., fueron configuradas con:
    ```sql
    tenant_id uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
    ```
  - Las políticas RLS en todas ellas siguen el patrón:
    ```sql
    USING (public.is_admin() or tenant_id = public.get_auth_tenant_id())
    WITH CHECK (public.is_admin() or tenant_id = public.get_auth_tenant_id())
    ```

### 2.6. Operaciones Globales del Super Administrador (Sin Tenant Específico)
El Super Administrador puede y debe operar a nivel de plataforma en:
1. Listado maestro y auditoría de todas las empresas y planes contratados.
2. Alta, baja y suspensión de empresas (`tenants`).
3. Auditoría y gestión global del directorio de usuarios de todas las marcas.
4. Asignación de roles de plataforma y movimiento de personal entre empresas.
5. Supervisión de métricas financieras globales (MRR, volumen de facturación agregado, suscripciones).
6. Supervisión y observabilidad de agentes autónomos y consumos de IA globales.

### 2.7. Políticas RLS y su Impacto en el Super Administrador
- Cláusula estándar:
  ```sql
  create policy "nombre_tenant_all" on public.tabla
    for all
    using (public.is_admin() or tenant_id = public.get_auth_tenant_id())
    with check (public.is_admin() or tenant_id = public.get_auth_tenant_id());
  ```
- **Impacto Real:**
  - **Permisividad Total:** La política RLS nunca bloquea a un Super Administrador (no arroja error `42501 Insufficient Privileges`).
  - **Falsa Sensación de Aislamiento:** RLS desactiva la protección de aislamiento cuando `public.is_admin() = true`. Por tanto, la responsabilidad de aislar los datos (filtrar por tenant específico) se traslada **completamente al código de la aplicación (Frontend y Adaptadores)**.
  - Si el frontend no aplica `.eq('tenant_id', selectedTenant)`, el Super Administrador visualiza y mezcla datos cruzados de múltiples marcas.

### 2.8. Rol y Registro de Qaway Lab en la Arquitectura
- **Hecho Verificado:**
  - En la migración fundacional `20260917130000_create_tenants_multi_tenant.sql` (líneas 182-194):
    - `id`: `'00000000-0000-0000-0000-000000000001'`
    - `client_code`: `'QW-00001'`
    - `slug`: `'qaway-lab'`
    - `name`: `'Qaway Lab'`
    - `legal_name`: `'Qaway Lab Digital S.A.C.'`
    - `features`: `{"ecommerce": true, "inventory": true, "crm": true, "agenda": true}`
  - **Propósito Arquitectónico:**
    - Como establece la regla en `20260921133000_platform_vs_brand_admin.sql` (línea 10):
      *"Qaway Lab opera como tenant normal (sin excepciones) para sus propias operaciones comerciales."*
    - Es el tenant matriz donde Qaway Lab vende sus propios cursos, servicios de software, suscripciones e inventario interno.
    - También sirve como contenedor seguro para semillas demo iniciales y registros de contacto no asignados.

### 2.9. Dependencias Críticas entre Mecanismos
1. **Dependencia de Identidad de Sesión:** `userService.getCurrentUser()` depende de `supabase.auth.getUser()`, el cual consulta `public.users` y evalúa `is_platform_admin`.
2. **Dependencia de Integridad Referencial:** Ninguna fila en `products`, `sales`, o `inventory_locations` puede crearse sin un `tenant_id` válido existente en `public.tenants`.
3. **Desconexión entre Shell y Micro-módulo:** El panel superior (`HubPanelPage.jsx`) maneja `scopedTenant`, pero los adaptadores de datos en sub-carpetas (`supabaseProductAdapter.ts`) operan de manera aislada sin inyección de dependencias de dicho contexto.

---

## 3. Matriz Operativa del Super Administrador

| Operación | Archivo / Módulo | Permiso Requerido | Tenant Usado | Comportamiento Actual | Riesgo o Dependencia Detectada |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Crear Empresa** | `HubSuperEmpresasModule.jsx` | `public.is_admin()` | N/A (Inserta en `tenants`) | Inserta exitosamente nuevo tenant con UUID generado. | Dependencia de validación de slug único. |
| **Listar Usuarios** | `HubSuperUsersModule.jsx` | `public.is_admin()` | Global (todos) | Carga todos los usuarios de la plataforma y enriquece nombre de empresa. | Alto volumen de registros sin paginación backend estricta. |
| **Invitar Usuario** | `InvitarPage.jsx` | `public.is_admin()` | Seleccionado en Dropdown | Permite elegir la empresa destino antes de crear la invitación. | **Flujo modelo correcto**: Requiere selección explícita de empresa. |
| **Reasignar Rol / Tenant** | `userService.ts` / RPC `admin_assign_user_tenant` | `public.is_admin()` | El especificado en parámetro | Modifica `tenant_id` y `role` en `public.users`. | Riesgo crítico si se ejecuta por error sobre usuarios clave. |
| **Visualizar Inventario** | `supabaseProductAdapter.ts` (`getProducts`) | `public.is_admin()` | No filtrado (retorna global) | Retorna los productos de **todas** las empresas del sistema mezclados. | **Riesgo Alto**: Falta de aislamiento visual para el Super Admin. |
| **Crear Producto** | `supabaseProductAdapter.ts` (`createProduct`) | `public.is_admin()` | `userData?.tenant_id \|\| Master Tenant` | Si el Super Admin no tiene tenant propio, se guarda en Qaway Lab Matriz (`00000001`). | **Riesgo Crítico**: El producto queda invisible para la marca cliente. |
| **Editar / Eliminar Producto**| `supabaseProductAdapter.ts` | `public.is_admin()` | El `tenant_id` original de la fila | Modifica o borra cualquier fila por `id` sin importar a qué marca pertenece. | Riesgo de mutación accidental sobre catálogos de terceros. |
| **Cambiar Contexto ("Ver como")**| `HubPanelPage.jsx` | `isPlatformAdmin` en UI | Guarda en `sessionStorage.qaway.scopedTenant` | Cambia la barra de navegación del Hub a la vista de la marca elegida. | **Desacoplado**: Inventario no lee este almacenamiento. |

---

## 4. Análisis Técnico de Consecuencias y Respuestas Clave

### 4.1. Consecuencias de Asignar Automáticamente el Master Tenant al Super Administrador
1. **Contaminación del Catálogo Matriz:** Si el Super Administrador entra a probar o registrar un producto destinado a un cliente (ej. *CoraVet*, *Vallet*, o *Panadería Josué*), el producto se almacena con `tenant_id = '00000000-0000-0000-0000-000000000001'`. El catálogo oficial de Qaway Lab queda contaminado con productos ajenos.
2. **Invisibilidad para los Clientes Reales:** Los usuarios legítimos del cliente tienen `users.tenant_id = '<uuid-cliente>'`. Como sus políticas RLS son estrictas (`tenant_id = get_auth_tenant_id()`), **nunca verán el producto creado por el Super Administrador**. Para el cliente, el producto simplemente no existe.
3. **Colisión de Unicidad de Slugs:** La base de datos tiene una restricción única compuesta:
   ```sql
   UNIQUE (tenant_id, slug)
   ```
   Si se crean varios productos con nombres comunes bajo el Master Tenant, generará conflictos de slug único innecesarios en la matriz.
4. **Desconexión con Bodegas y Stock:** Las bodegas (`inventory_locations`) y movimientos de inventario pertenecen a un tenant específico. Un producto registrado en el Master Tenant no podrá vincularse coherentemente a bodegas pertenecientes a una marca cliente.

### 4.2. ¿Debe un Super Administrador Crear Productos en el Master Tenant o Bajo Contexto?
- **Definición de Arquitectura:**
  - El Super Administrador **SOLO** debe registrar productos en el Master Tenant (`00000000-0000-0000-0000-000000000001`) cuando el producto pertenezca genuinamente a **Qaway Lab** (ej. "Auditoría de Agentes IA", "Curso Next.js", "Licencia SaaS").
  - Para cualquier producto de un cliente o marca, el Super Administrador **DEBE operar siempre bajo el contexto de una empresa/marca seleccionada**.
  - La plataforma no debe asumir que el Super Administrador es dueño de los productos que está manipulando en pantallas operativas; debe exigir o inferir la marca de trabajo activa.

---

## 5. Cambios Requeridos para una Solución Segura y Mantenible

Para corregir la causa raíz de forma definitiva respetando los principios de aislamiento SaaS de Qaway Lab, se recomiendan las siguientes acciones técnicas (a ejecutar en la siguiente etapa coordinada):

1. **Lectura del `scopedTenant` en Inventario:**
   Hacer que `InventarioAppPage.jsx` y su contexto capturen el tenant activo desde `sessionStorage.getItem('qaway.scopedTenant')` (mismo mecanismo que ya utiliza exitosamente `HubPanelPage.jsx`).
2. **Selector de Empresa para Super Administrador en Inventario:**
   Al igual que se implementó en `InvitarPage.jsx`, si el usuario autenticado tiene `is_platform_admin = true`:
   - Mostrar una barra contextual superior en Inventario:  
     *"Operando como: [ Selector de Empresas / Marcas ]"*.
   - Si no ha seleccionado ninguna empresa, deshabilitar la creación de productos y mostrar una advertencia: *"Selecciona una empresa para gestionar su catálogo de inventario"*.
3. **Inyección en `supabaseProductAdapter.ts`:**
   - En `getProducts`: Cuando sea Super Administrador con empresa seleccionada, añadir `.eq('tenant_id', selectedTenantId)` a la consulta para que solo vea los productos de esa marca.
   - En `createProduct`: Asignar estrictamente `payload.tenant_id = activeScopedTenantId || userData?.tenant_id`. Si no hay ningún tenant resuelto, arrojar un error explícito de validación antes de contactar a Supabase.
4. **Respeto a la Matriz Qaway Lab:**
   Permitir seleccionar "Qaway Lab (Matriz)" en el selector para aquellos casos donde deliberadamente se creen productos y servicios propios de la empresa matriz.

---
*Fin de la Auditoría Técnica — Documento generado en modo Solo Lectura sin alteración de lógica de negocio ni migraciones en base de datos.*
