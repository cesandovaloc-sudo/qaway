# Reglas Oficiales de la EDT (WBS) · Qaway Lab

Este documento establece la normativa conceptual, metodológica y técnica para la **Estructura Desglosada del Trabajo (EDT / WBS)** en el Gestor de Proyectos de Qaway Lab, fundamentada en los estándares del **Banco Interamericano de Desarrollo (BID / INDES)** y la **Guía del PMBOK® (6ª Edición)**.

---

## 1. Fundamentos Metodológicos (BID / PMBOK)

> **Mala mía, asumí que estabas mostrándome las reglas de tu sistema en lugar de un caso de prueba para confrontar con el documento. Volvamos estrictamente a la teoría del PDF:**
> 
> Según el documento del BID, tu nivel 2 que quedó solo es un paquete de trabajo.
> El texto define explícitamente las reglas que contradicen la jerarquía rígida por niveles fijos:
> 
> • **Regla del 100% de la EDT:** La EDT es una descomposición jerárquica orientada a entregables, no una tabla de niveles fijos.
> 
> • **Definición de Paquete de Trabajo:** El documento dice textualmente en la página 46: *"El paquete de trabajo, último nivel de desglose de la EDT, es aquel cuya duración y costo pueden ser estimados..."*. No dice que deba ser obligatoriamente nivel 4 o 5; dice que es el último nivel de desglose de su respectiva rama.
> 
> • **Asimetría de la estructura:** El documento aclara en la página 46 que *"no existe una regla que indique cuántos niveles debe tener una EDT"*. Las ramas se desglosan de forma independiente según su complejidad. Si una línea de trabajo es simple y en el nivel 2 ya puedes estimar su costo, tiempo y asignarle un responsable, el desglose se detiene ahí y ese nodo se vuelve tu paquete de trabajo.

---

## 2. Comparativa: Teoría del BID vs. Lógica Anterior del Código

| Aspecto | Según el documento del BID / PMBOK | Según la lógica anterior del código | Resolución en Qaway Lab |
| :--- | :--- | :--- | :--- |
| **¿Qué define a un Paquete de Trabajo?** | Ser el **último nivel de una rama** (nodo hoja), independiente de su profundidad. | Estar estrictamente en el Nivel 4 / Profundidad 3. | **Regla BID:** Si un nodo no tiene hijos (`!hasChildren`), es un **Paquete de Trabajo** ejecutable. |
| **Estructura de niveles** | **Asimétrica.** Unas ramas pueden tener 2 niveles y otras 3, 4 o 5 según su complejidad. | Simétrica/Rígida. Todos los elementos del mismo nivel numérico debían llamarse igual. | **Regla BID:** Estructura asimétrica dinámica según el árbol de dependencias. |
| **El nodo nivel 2 que quedó solo** (ej. 1.1 al 1.6) | Es un **Paquete de Trabajo** porque ahí terminó su desglose y es estimable/asignable. | Forzado como "Producto" o "Subcomponente" artificial. | **Paquete de Trabajo**, con responsable, fechas y entregable verificable. |
| **El nodo nivel 2 con desglose** (ej. 1.7) | Es un **Producto** (agrupador de entregables de esa rama). | Llamado erróneamente *"Subcomponente"*. | **Producto**, agrupador de entregables. Se erradica el término "Subcomponente". |
| **Puntuación y códigos WBS** | **Decimal jerárquico estricto:** `1` $\rightarrow$ `1.1` $\rightarrow$ `1.7.1` $\rightarrow$ `1.7.1.1`. | Mezcla de letras: `1.7a`, `1.7b`. | **Estricto decimal:** Prohibido el uso de letras en la codificación EDT. |

---

## 3. Implementación Operativa en el Sistema

### 3.1. Reglas de Determinación de Tipo (`resolveEdtNodeType` / `getEdtNodeDisplayLabel`)
```text
SI el nodo no tiene parentId:
   -> COMPONENTE (Nivel 1, raíz del alcance)

SI el nodo tiene hijos (hasChildren == true):
   -> PRODUCTO (Agrupador intermedio del entregable de esa rama)

SI el nodo NO tiene hijos (hasChildren == false):
   SI start == end O tipo HITO:
      -> HITO (Punto de control de duración cero)
   EN OTRO CASO:
      -> PAQUETE DE TRABAJO (Nodo hoja terminal de su rama)
```

### 3.2. Regla de Puntuación Decimal
* **Componente:** `1.`, `2.`, `3.`...
* **Hijos de Componente:** `1.1`, `1.2`, `1.3`...
* **Sub-hijos (desglose de 1.7):** `1.7.1`, `1.7.2` (reemplazo oficial de `1.7a` y `1.7b`).
* **Sub-sub-hijos:** `1.7.1.1`, `1.7.1.2`...

### 3.3. Aislamiento Visual en Módulo Proyecto
* Los paquetes de trabajo y productos en el módulo **Proyecto** (`perspective="maestro"`) utilizan iconografía de entregables/tareas (`<ListChecks />`, `<Package />`, `<Flag />`), nunca iconos de edificios ni sedes institucionales.
