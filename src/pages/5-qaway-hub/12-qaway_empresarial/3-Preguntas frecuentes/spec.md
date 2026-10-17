# 📋 SPEC: Banco de Casuísticas y Preguntas Frecuentes (MINEDU • DIGERE)

## 1. Visión General y Propósito
El módulo **Banco de Casuísticas y Preguntas Frecuentes** es una herramienta oficial interactiva diseñada para especialistas, directores de UGEL y coordinadores del monitoreo del Cuadro de Distribución de Materiales Educativos en el marco del **MC SIGA** (MINEDU • DIGERE).

Su propósito es centralizar, indexar y resolver de forma inmediata incidencias recurrentes de distribución en las 6 Direcciones de Educación:
- **DEI**: Dirección de Educación Inicial
- **DEP**: Dirección de Educación Primaria
- **DISER**: Dirección de Servicios Educativos en el Ámbito Rural
- **DEBA**: Dirección de Educación Básica Alternativa
- **DEBE**: Dirección de Educación Básica Especial
- **DES**: Dirección de Educación Secundaria

El módulo opera de manera **100% nativa en Qaway Lab** (sin iframes ni incrustaciones lentas), con diseño institucional de alta fidelidad, soporte para búsqueda difusa (Fuzzy Search), administración de casos y sincronización de datos dual (Caché Local / Supabase Cloud).

---

## 2. Requerimientos Funcionales y Casos de Uso

### CU-01: Navegación y Filtrado por Dirección
* El usuario visualiza una cuadrícula superior con las 6 direcciones oficiales.
* Cada tarjeta muestra:
  - Ícono semántico Lucide (`GraduationCap`, `BookOpen`, `Compass`, `Building2`, `Sparkles`, `Layers`).
  - Código oficial (DEI, DEP, DISER, DEBA, DEBE, DES) con badge distinguible.
  - Nombre completo de la dirección y contador dinámico de casuísticas registradas.
* Al hacer clic en una dirección, se filtra la vista principal para mostrar exclusivamente sus casos, con marcado visual activo en rojo institucional (`#b91c1c`).

### CU-02: Búsqueda Inteligente con Tolerancia Difusa (Fuzzy Search)
* **Entrada**: Campo de búsqueda accesible con altura ergonómica (`h-12`).
* **Algoritmo**:
  - Normalización de acentos y caracteres (`normalize('NFD')`).
  - Coincidencia exacta de frase y tokens ponderados por campo (Título: 24, Criterio: 16, Solución: 12, Acción: 10, Desarrollo: 8, Código de Dirección: 10, Número: 14).
  - Tolerancia difusa Levenshtein (distancia 1-2 para palabras largas).
* **Resaltado**: Las coincidencias se iluminan dinámicamente con `<mark class="search-highlight">`.
* **Atajos de Búsqueda**:
  - Botón **"Limpiar búsqueda"**: restablece el filtro instantáneamente.
  - Botón **"Colapsar todo / Expandir todo"**: conmutación masiva del estado de los acordeones.
  - Botón **"Primera coincidencia"**: expande automáticamente el primer caso relevante y hace scroll asistido con animación sutil de pulso.

### CU-03: Visualización Estructurada de Casuísticas (Acordeón)
Cada caso se renderiza en una tarjeta colapsable con información de alta legibilidad:
1. **Encabezado**: Número `#01`, Dirección de origen, Título de la problemática, Score de relevancia (en modo búsqueda) y flecha indicadora de estado.
2. **Cuerpo Desplegable**:
   - **Criterio Pedagógico / Normativo**: Título del criterio y descripción oficial (conservado en el modelo de datos y accesible).
   - **Desarrollo / Casuística**: Descripción detallada del escenario observado en la UGEL o IE.
   - **Acción Sugerida**: Pasos técnicos y operativos inmediatos a seguir.
   - **Solución Referencial**: Resolución final, pecosa, reasignación o regularización oficial en el MC SIGA.

### CU-04: Modo Administrador y Gestión de Casos
* Conmutador en el footer (`admin=true` o toggle interactivo).
* **Acciones disponibles**:
  - Botón `+ Nueva Pregunta` en el header y en la sección activa.
  - Botones de edición (`Pencil`) y eliminación (`Trash2`) en cada tarjeta de casuística.
  - Modal de gestión de 3 pestañas:
    - **Tab 1: Formulario**: Alta y modificación de casuísticas con validación de campos obligatorios.
    - **Tab 2: Inventario**: Tabla/lista de todas las casuísticas con filtro por dirección y buscador para edición rápida.
    - **Tab 3: Supabase Cloud**: Conexión con base de datos en tiempo real mediante Project URL y Anon Key.

### CU-05: Almacenamiento y Persistencia Dual
* **Modo Offline / Local**: Almacena y sincroniza en `localStorage` con la clave `qaway_minedu_casuisticas_v1`.
* **Modo Supabase Cloud**: Si se configuran credenciales, sincroniza lecturas y mutaciones con la tabla `casuisticas` de Supabase en tiempo real.
* **Fallback Garantizado**: Si no hay datos en caché ni en Supabase, inicializa de forma inmediata con las 14 casuísticas canónicas oficiales sin pantallas en blanco.
