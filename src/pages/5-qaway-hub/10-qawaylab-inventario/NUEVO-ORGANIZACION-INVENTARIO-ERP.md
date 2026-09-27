# Organización de Inventario & ERP Comercial Qaway

## 1. Objetivo

Organizar la estructura física y operativa de las empresas dentro de Qaway, permitiendo gestionar múltiples sedes, almacenes y ubicaciones sin confundir sus funciones.

La propuesta busca que el sistema pueda evolucionar hacia una gestión multisede y multialmacén, manteniendo una navegación clara y coherente.

---

## 2. Estructura del menú lateral

Se incorpora una sección independiente denominada **Organización**.

```text
ORGANIZACIÓN
├── Sedes
├── Almacenes
└── Usuarios
```

### Función de cada módulo

| Módulo        | Función                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **Sedes**     | Gestionar los establecimientos de la empresa, como oficinas, sucursales y puntos de venta.             |
| **Almacenes** | Administrar los almacenes asociados a las sedes y organizar sus espacios de almacenamiento.            |
| **Usuarios**  | Gestionar los usuarios de la organización y su acceso a las operaciones, según los permisos definidos. |

---

## 3. Selector de sede en el topbar

La barra superior debe incluir un **selector de contexto de sede** que permita cambiar el establecimiento desde el que se trabaja.

### Opciones

* Sede activa.
* Otras sedes disponibles.
* Todas las sedes.
* Acceso a la gestión de sedes.

### Comportamiento esperado

Al seleccionar una sede, el sistema debe adaptar la información operativa al contexto elegido.

Por ejemplo, al seleccionar una sede, el usuario podrá consultar los productos, almacenes, movimientos y operaciones comerciales asociados a ella, según sus permisos.

La opción **Todas las sedes** permitirá consultar información consolidada cuando el usuario tenga autorización.

> El selector no debe ser únicamente visual: el contexto de sede debe aplicarse en las consultas y validaciones del sistema.

---

## 4. Relación entre sedes, almacenes y ubicaciones

La estructura conceptual será:

```text
Empresa
│
├── Sede Lima
│   ├── Almacén Principal
│   │   ├── Zona de alimentos
│   │   │   ├── Pasillo A
│   │   │   └── Estante A1
│   │   └── Zona de bebidas
│   │       └── Estante B1
│   │
│   └── Tienda Lima
│
└── Sede Arequipa
    └── Almacén Regional
        ├── Zona A
        └── Zona B
```

Esta estructura es conceptual y deberá adaptarse al modelo de datos definitivo.

### Diferencia entre conceptos

* **Sede:** establecimiento donde opera la empresa.
* **Almacén:** espacio destinado al almacenamiento de productos.
* **Ubicación:** espacio específico dentro de un almacén, como una zona, pasillo o estante.

---

## 5. ¿Dónde queda el módulo Ubicaciones?

**Ubicaciones deja de ser una opción independiente del menú principal y pasa a formar parte de la gestión de Almacenes.**

El flujo de navegación será:

```text
Organización
    └── Almacenes
         └── Seleccionar almacén
              └── Ubicaciones
                   ├── Zonas
                   ├── Pasillos
                   └── Estantes
```

Dentro de cada almacén, el usuario podrá consultar y organizar sus ubicaciones internas.

La funcionalidad de ubicaciones se conserva; cambia su posición dentro de la navegación.

---

## 6. Relación con los módulos de inventario

| Módulo      | Responsabilidad                                                          |
| ----------- | ------------------------------------------------------------------------ |
| Productos   | Gestionar el catálogo de productos y sus características.                |
| Sedes       | Administrar los establecimientos de la empresa.                          |
| Almacenes   | Gestionar los espacios de almacenamiento asociados a las sedes.          |
| Ubicaciones | Organizar los espacios físicos dentro de los almacenes.                  |
| Movimientos | Registrar las entradas, salidas, transferencias y ajustes de inventario. |

Estos módulos deben trabajar de forma integrada para mantener la coherencia entre las existencias y su ubicación física.

---

## 7. Criterios de diseño

* Mantener la identidad visual propia de Inventario & ERP Comercial, diferenciada de la marca Qaway Lab.
* Conservar una interfaz minimalista, clara y orientada a operaciones.
* Mantener el selector de sede en el topbar.
* Presentar Sedes, Almacenes y Usuarios dentro de Organización.
* Gestionar las ubicaciones desde el módulo Almacenes.
* Evitar duplicar funciones entre los módulos.
* Mantener la navegación coherente con el resto del sistema.

---

## 8. Consideraciones técnicas

Según la auditoría compartida, Qaway ya cuenta con:

* La tabla `inventory_locations`, con estructura jerárquica mediante `parent_id`.
* Un campo `type` para distinguir tipos de ubicación.
* La relación `products.location_id` para asociar productos con ubicaciones.

Sin embargo, no se ha confirmado una entidad independiente para gestionar sedes.

Por tanto, antes de implementar esta estructura, será necesario definir:

1. El modelo de datos de sedes.
2. La relación entre sedes, almacenes y ubicaciones.
3. La asignación de productos y existencias a cada almacén.
4. El contexto de sede en las operaciones comerciales.
5. Los permisos de acceso por sede.
6. El aislamiento de datos entre empresas.

---

## 9. Estructura final acordada

```text
TOPBAR
├── Selector de sede
├── Buscador global
├── Notificaciones
└── Perfil de usuario

MENÚ LATERAL
├── Resumen
├── Productos
├── Categorías
├── Movimientos
├── Clientes
├── Cotizaciones
├── Ventas
├── Compras
├── Precios
├── Paquetes / Kits
├── Promociones
├── Liquidaciones
├── Catálogos
│
├── ORGANIZACIÓN
│   ├── Sedes
│   ├── Almacenes
│   └── Usuarios
│
└── Configuración
```

**Decisión de diseño:** Sedes, Almacenes y Usuarios serán módulos independientes dentro de Organización. Ubicaciones se gestionará dentro de Almacenes y el topbar permitirá cambiar el contexto de sede.
