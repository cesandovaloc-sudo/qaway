# Guía Maestra de Arquitectura Visual y Encapsulado · Qaway Lab

Este documento define el **Estándar Maestro de Diseño y Maquetación** consolidado a partir del **Cronograma Maestro** y el **Módulo Equipo**. Cualquier módulo operativo del Gestor de Proyectos (incluyendo Tareas, Hitos, Reuniones, etc.) debe replicar esta especificación con exactitud milimétrica para evitar discrepancias visuales, desalineaciones o elementos huérfanos.

---

## 1. Estructura Jerárquica del Canvas

Todo módulo debe seguir estrictamente este árbol de contenedores:

```html
<div class="gantt-v2">
  <div class="app">
    <!-- 1. Cabecera Oficial -->
    <header class="header"> ... </header>

    <!-- 2. Tarjetas KPI Directivas -->
    <section class="metrics"> ... </section>

    <!-- 3. La Cápsula Central Unificada -->
    <main class="workspace">
      <!-- 3.1. Navegación Superior y Conmutador de Vistas -->
      <nav class="tabs"> ... </nav>

      <!-- 3.2. Barra de Filtros Homologada -->
      <div class="filters"> ... </div>

      <!-- 3.3. Contenido Principal (Lista / Tablero / Canvas) -->
      <div class="cronograma-lista-table-wrap"> ... </div>

      <!-- 3.4. Cierre Inferior de la Cápsula -->
      <footer class="footer"> ... </footer>
    </main>
  </div>
</div>
```

---

## 2. Especificación de Componentes

### 2.1. Contenedor Maestro (`.gantt-v2 .app`)
* **Fondo general**: `#f0f4f9` (Grisáceo perimetral suave de cabina directiva).
* **Padding perimetral**: `16px 24px 16px` exactos.
* **Separación vertical (`gap`)**: `12px` entre cabecera, métricas y workspace.
* **Prohibición**: Nunca reemplazar `.app` por `main` ni envoltorios personalizados sin clases de `gantt.css`.

---

### 2.2. Cabecera Oficial (`<header class="header">`)
```tsx
<header className="header">
  <div className="heading">
    <span className="heading-icon">
      <IconoSeccion size={26} />
    </span>
    <div>
      <h1>Título del Módulo · {projectName}</h1>
      <p>Descripción clara y funcional del propósito operativo.</p>
    </div>
  </div>
  <div className="head-actions">
    <button className="btn secondary" onClick={onConfigurar}>
      <SlidersHorizontal size={15} />
      <span>Acción Secundaria</span>
    </button>
    <button className="btn primary" onClick={onCrearNuevo}>
      <Plus size={16} />
      <span>Crear Registro</span>
    </button>
  </div>
</header>
```
* **Icono cuadrado azul (`.heading-icon`)**: 50x50px, `background: #0066ff`, `color: white`, `border-radius: 10px`, sombra `0 4px 12px rgba(0, 102, 255, 0.25)`.
* **Título (`h1`)**: 24px, peso 800, color `#0f172a`.
* **Subtítulo (`p`)**: 13.5px, color `#64748b`.
* **Acciones (`.head-actions`)**: Flexbox a la derecha con botones `.btn secondary` (fondo blanco, borde `#cbd5e1`) y `.btn primary` (fondo azul `#0066ff`).

---

### 2.3. Métricas Directivas (`<section class="metrics">`)
Se utilizan 4 o 5 tarjetas cromáticas con la física y tipografía estándar:

```tsx
<section className="metrics">
  {/* Tarjeta Azul */}
  <article className="metric blue">
    <span className="metric-icon"><ListChecks size={22} /></span>
    <div className="metric-copy">
      <b>{total}</b>
      <strong>Total Registros</strong>
      <small>en este proyecto</small>
    </div>
    <ChartNoAxesColumnIncreasing className="bars" />
  </article>

  {/* Tarjeta Verde */}
  <article className="metric green">
    <span className="metric-icon"><CheckCircle2 size={22} /></span>
    <div className="metric-copy">
      <b>{activos}</b>
      <strong>En Proceso</strong>
      <small>con trabajo activo</small>
    </div>
    <ChartNoAxesColumnIncreasing className="bars" />
  </article>

  {/* Tarjeta Ámbar */}
  <article className="metric amber">
    <span className="metric-icon"><Clock3 size={22} /></span>
    <div className="metric-copy">
      <b>{pendientes}</b>
      <strong>Por Vencer / En Consulta</strong>
      <small>requieren seguimiento</small>
    </div>
    <ChartNoAxesColumnIncreasing className="bars" />
  </article>

  {/* Tarjeta Roja */}
  <article className="metric red">
    <span className="metric-icon"><AlertTriangle size={22} /></span>
    <div className="metric-copy">
      <b>{vencidas}</b>
      <strong>Vencidas / Alerta</strong>
      <small>atención inmediata</small>
    </div>
    <ChartNoAxesColumnIncreasing className="bars" />
  </article>

  {/* Tarjeta Medidor Radial (Opcional si hay porcentaje global) */}
  <article className="metric overall">
    <div className="ring" style={{ '--p': `${porcentaje}%` } as React.CSSProperties}>
      <b>{porcentaje}%</b>
    </div>
    <div>
      <strong>Cumplimiento</strong>
      <small>balance de ejecución</small>
    </div>
    <ChartNoAxesColumnIncreasing className="bars" />
  </article>
</section>
```
* **Tipografía interna obligatoria**:
  - `<b>`: 24px, peso 800 (cifra principal).
  - `<strong>`: 13px, peso 700 (título de métrica).
  - `<small>`: 11px, color atenuado (leyenda inferior).
  - `<ChartNoAxesColumnIncreasing className="bars" />`: Gráfico SVG a la derecha con animación de escala en hover.

---

### 2.4. La Cápsula Workspace (`<main class="workspace">`)
* **Dimensiones**: `height: calc(100vh - 275px)`, `border-radius: 12px`, `background: #ffffff`, borde `1px solid #e2e8f0`, sombra `0 4px 14px rgba(15, 23, 42, 0.04)`.
* **Prohibición**: Jamás crear cajas independientes debajo o fragmentar el canvas en sub-tarjetas. Todo el contenido operativo vive dentro de `.workspace`.

#### A. Barra Superior (`<nav class="tabs">`)
Divide las píldoras de filtrado a la izquierda del conmutador de modos a la derecha:
```tsx
<nav className="tabs">
  {/* Izquierda: Filtros rápidos con contadores */}
  <div className="tabs-list">
    {pills.map((p) => (
      <button
        key={p.id}
        type="button"
        className={activePill === p.id ? 'active' : ''}
        onClick={() => setActivePill(p.id)}
      >
        {p.label} <span>({p.count})</span>
      </button>
    ))}
  </div>

  {/* Derecha: Conmutador de modos con fondo azul activo */}
  <div className="view-mode-switcher" role="tablist">
    <button
      type="button"
      className={`view-mode-btn ${viewMode === 'lista' ? 'active' : ''}`}
      onClick={() => setViewMode('lista')}
    >
      <List size={14} />
      <span>Lista</span>
    </button>
    <button
      type="button"
      className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
      onClick={() => setViewMode('kanban')}
    >
      <LayoutDashboard size={14} />
      <span>Tablero</span>
    </button>
  </div>
</nav>
```

#### B. Barra de Filtros Homologada (`<div class="filters">`)
Prohibido el uso de `<select>` nativos del navegador y cápsulas de colores improvisadas (`#dcfce7`, etc.). Todos los selectores son botones tipo tarjeta con popover flotante:

```tsx
<div className="filters">
  {/* Buscador */}
  <label className="search">
    <Search size={16} />
    <input
      placeholder="Buscar por texto, código, responsable..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    {searchQuery && (
      <button onClick={() => setSearchQuery('')}><X size={14} /></button>
    )}
  </label>

  {/* Selector Tipo Tarjeta con Popover Flotante */}
  <div className="filter-dropdown-wrap">
    <button
      type="button"
      className={`filter-card-btn ${openMenu === 'estado' ? 'active' : ''} ${filtroEstado !== 'todos' ? 'filtered' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setOpenMenu(openMenu === 'estado' ? null : 'estado');
      }}
    >
      <div className="filter-card-copy">
        <small>Estado</small>
        <span>{labelEstadoSeleccionado}</span>
      </div>
      <ChevronDown size={14} className="filter-chevron" />
    </button>

    {openMenu === 'estado' && (
      <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
        <div className="filter-popover-title">Filtrar por Estado</div>
        <div className="filter-popover-list">
          {opciones.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`filter-item-btn ${filtroEstado === opt.id ? 'selected' : ''}`}
              onClick={() => {
                setFiltroEstado(opt.id);
                setOpenMenu(null);
              }}
            >
              <span>{opt.label}</span>
              {filtroEstado === opt.id && <Check size={14} className="item-check" />}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Botón Limpiar condicional */}
  {hayFiltrosActivos && (
    <button className="clear-btn" onClick={onLimpiarFiltros}>
      Limpiar
    </button>
  )}

  <div style={{ flex: 1 }} />

  {/* Botones de acción derecha (Columnas / Exportar) */}
  <button className="btn secondary" style={{ height: '34px', fontSize: '12px' }} onClick={onExportar}>
    <Download size={13} />
    <span>Exportar</span>
  </button>
</div>
```

#### C. Tipografía y Estilo de Tabla
* **Nombres de registros**:
  - `fontSize: 13px`, `fontWeight: 650`, color `#0f172a`.
  - **CERO subrayados toscos (`text-decoration: underline` prohibido de forma fija)**.
  - Interacción hover: transición suave a azul institucional (`#0066ff`).
* **Insignias de Estado**:
  - Utilizar exclusivamente las clases canónicas de Cronograma:
    - `.status-pill.badge-progress` (En proceso: fondo azul claro, texto azul `#0284c7`).
    - `.status-pill.badge-complete` (Cumple / Completado: fondo menta, texto verde `#059669`).
    - `.status-pill.badge-late` (Con retraso / Bloqueada: fondo rosa suave, texto rojo `#dc2626`).
    - `.status-pill.badge-pending` (Pendiente: fondo gris `#f1f5f9`, texto pizarra `#64748b`).

#### D. Cierre de Cápsula (`<footer class="footer">`)
```tsx
<footer className="footer">
  <span>Mostrando 1-{registrosVisibles} de {totalRegistros} registros</span>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <button className="btn secondary" style={{ minHeight: '30px', fontSize: '12px' }} onClick={onDescargar}>
      Descargar Listado
    </button>
  </div>
</footer>
```

---

## 3. Neutralidad Institucional Obligatoria

* Prohibido codificar nombres de organismos estatales ("MINEDU", "DRE", "UGEL", "PRONABEC", etc.) o regiones geográficas como textos fijos en cabeceras, botones, pestañas o toolbars.
* Toda referencia institucional debe ser dinámica, genérica o provenir exclusivamente de los datos cargados por el usuario.

---

## 4. Hoja de Ruta para el Módulo Tareas

Para aplicar este estándar al módulo de Tareas:
1. **Paso 1**: Refactorizar [TareasView.tsx](file:///c:/LEO/EMPRESAS\QAWAY%20LAB\1-QawayLab-Digital\1-qawaylab-web\src\pages\5-qaway-hub\13-Gestor_Proyectos2\src\modules\tareas\TareasView.tsx) para adoptar el envoltorio `<div className="gantt-v2"><div className="app">`.
2. **Paso 2**: Reemplazar la cabecera actual y las 4 cajitas blancas por `<header className="header">` (con icono `<ListChecks size={26} />`) y `<section className="metrics">` con `.metric blue`, `.green`, `.amber`, `.red`.
3. **Paso 3**: Encapsular la vista de tabla y el tablero Kanban dentro de `<main className="workspace">`, vinculando las vistas al `.view-mode-switcher` oficial.
4. **Paso 4**: Convertir los filtros desplegables de Tareas a `.filter-card-btn` con popover.
5. **Paso 5**: Homologar las filas de la tabla y eliminar toda referencia dura a "MINEDU" en el drawer y la barra superior.
