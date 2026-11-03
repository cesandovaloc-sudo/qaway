# 🔎 Auditoría de Desacoplamiento — Nomenclatura Estatal / Educación Pública Peruana Hardcodeada

**Producto:** Gestor de Proyectos 2 (HubPro · Qaway Lab)
**Carpeta auditada:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2`
**Alcance:** `**/src/**/*.{ts,tsx,css,json}` (app principal + 6 micro-apps prototipo)
**Fecha de auditoría:** 2026-11-03
**Objetivo:** eliminar todo acoplamiento a la marca/sector «MINEDU · Dotación 2027» (ministerio, UGEL, DRE, SIGA, SIAGIE, PECOSA, II.EE., marco legal peruano, regiones, moneda) para que el producto sea **100% universal** (construcción, retail, servicios técnicos, empresas privadas).
**Naturaleza del informe:** solo lectura. **No se modificó ningún archivo fuente.**

> **Nota sobre fragmentos:** donde el archivo está minificado (una sola línea larga, p. ej. varias vistas y los `.css` minificados), se cita un fragmento exacto contiguo de esa línea con marcadores «…». La ruta citada es siempre relativa a la raíz del proyecto (`13-Gestor_Proyectos2/`).

---

## 1. Metodología

- Escaneo regex (ripgrep, case-insensitive) sobre todos los `.ts/.tsx/.css` bajo `*/src/` con el diccionario:
  `minedu · ugel · dre(j) · digere · siga · siagie · pecosa(s) · II.EE./IIEE · instituci* · educat* · rectores · AGP · CDL · NEA · DEI · RAR · BIAE · VMGP · matrícula · aplicativo · gob.pe · Perú · Junín/Huancayo y sedes provinciales · Dotación · S/ (soles)`
- Lectura de contexto (líneas exactas) para eliminar falsos positivos (p. ej. «directo**R**», numerales romanos «II.», el campo genérico `estado`).
- Cruce con el patrón visual/CSS (clases `.ugel-*`) y con cadenas de UI (placeholders, breadcrumbs, KPI, CSV exportados).

---

## 2. Resumen ejecutivo

| Término / familia | Referencias aprox. *(por línea referenciada; una línea puede contener varios)* | Archivos afectados | Severidad |
|---|---:|---|---|
| **MINEDU** (incl. código `PRJ-MIN`, correos `@minedu.gob.pe`) | ≈ 75 | 20 archivos (`src/**` y micro-apps) + `supabase/*.sql` (anexo) | 🔴 Alta |
| **UGEL** | ≈ 200 | 22 archivos, incl. clases CSS `.ugel-*` | 🔴 Alta |
| **DRE / DREJ** | ≈ 32 | 7 archivos | 🔴 Alta |
| **DIGERE** | 10 | 4 archivos | 🔴 Alta |
| **SIGA / MC SIGA** (incl. `residente SIGA`) | ≈ 57 | 10 archivos | 🔴 Alta |
| **SIAGIE** (incl. «SIAGIE ME») | 4 | 2 archivos | 🟠 Media |
| **PECOSA / pecosas** | 6 | 3 archivos | 🟠 Media |
| **II.EE. / IIEE / instituciones educativas** | 8 | 4 archivos | 🔴 Alta |
| **Nomenclatura sectorial educativa** (CDL, NEA, DEI, RAR, matrícula, códigos modulares, «hitos rectores», Resolución Directoral, padrón, Oficio Múltiple, AGP, BIAE, «unidad ejecutora») | ≈ 110 | 14 archivos | 🟠 Media |
| **Acoplamiento de país** (Perú, zona horaria, leyes 31814/29733, regiones Junín/Huancayo/…, moneda `S/`) | ≈ 30 | 9 archivos | 🟠 Media |
| **Proyecto demo «Dotación 2027» / «MINEDU · Dotación 2027»** | ≈ 45 | 12 archivos | 🟠 Media |

**Veredicto:** la aplicación hereda literalmente el proceso de dotación de materiales educativos del MINEDU (semillas, textos de UI, prompts de IA, nombres de archivo exportados y clases CSS). Para convertirse en producto multi-industria requiere: (1) diccionario i18n/tenant, (2) semillas a base de datos, (3) renombrado de clases CSS y constantes.

---

## 3. Diccionario maestro de reemplazo (propuesto)

| Hardcode actual | Propuesta agnóstica / privada |
|---|---|
| `MINEDU` (entidad) | `Cliente` / `Entidad Patrocinadora` (nombre desde config de tenant) |
| `MINEDU · Dotación 2027` (nombre proyecto) | `{project.name}` dinámico, p. ej. «Proyecto 2027 · {Cliente}» o «Cliente · Programa 2027» |
| `UGEL` (sede territorial) | `Sede` / `Local` / `Punto de atención` |
| `DRE` (rectora regional) | `Unidad Regional` / `Cluster Regional` |
| `DRE Junín`, `UGEL Huancayo`, etc. (semillas) | Mover a BED/config del tenant, no hardcodear |
| `DIGERE` | `Coordinación Logística Central` / `Dirección de Operaciones` |
| `SIGA / MC SIGA / aplicativo MC SIGA` | `Sistema de Gestión del Cliente` / `ERP` / `OMS` (plataforma operativa) |
| `SIAGIE / SIAGIE Materiales Educativos` | `Plataforma de registro del cliente` |
| `PECOSA / actas PECOSA` | `Acta de Entrega` / `Acta de Conformidad` |
| `II.EE. / II. EE. / IIEE / instituciones educativas` | `Puntos de atención` / `Instalaciones` / `Establecimientos del cliente` |
| `CDL (Cuadro de Distribución Local)` | `Plan maestro de distribución` |
| `NEA` (materiales) | `Lotes` / `SKUs` |
| `DEI – Nivel Inicial` | `Etapa 3` / `Segmento A` (etapa configurable) |
| `RAR (archivo RAR)` | `Paquete de datos de intercambio` |
| `Resolución Directoral (RD)` | `Resolución / aprobación corporativa` |
| `códigos modulares` | `Código único de local` / `ID de establecimiento` |
| `BIAE` | `Módulo de registro del cliente` |
| `hitos rectores / Hito Rector` | `Hitos clave` / `Hito principal` |
| `AGP (Jefe de AGP)` | `Jefe de área pedagógica → Jefe de área funcional` |
| `Oficio Múltiple N.º …` | `Oficio / Carta formal N.º …` (neutral) |
| `unidad ejecutora` | `Unidad operativa` |
| `@minedu.gob.pe / @ugel*.gob.pe` | Correo real de BD; placeholder neutral `nombre@cliente.com` |
| `Perú` / `America/Lima · Hora Oficial de Perú` | `Zona horaria del tenant` (config, default configurable) |
| `Ley Peruana Nº 31814`, `Ley 29733` | `Marco normativo aplicable del cliente` (config) |
| `Junín / Huancayo / Tarma / …` (mapa, regiones) | Datos del tenant; `Región A/B`, distritos desde BED |
| `S/` (soles) | `currencySymbol` del tenant (`$`, `€`, `S/`, …) |
| `Equipo UGEL` (tipo de usuario) | `Equipo del cliente` / `Equipo en campo` |
| `Especialista SIGA / residente SIGA` | `Especialista de sistema` / `Coordinador técnico` |
| Clases CSS `.ugel-*`, `.UGEL` | `.unit-*` / `.sede-*` / `.territory-*` |
| Código `PRJ-MIN-2027-01` | Prefijo configurable: `PRJ-{tenantCode}-{year}-01` |

---

## 4. Hallazgos detallados

### 4.1 `src/App.tsx` (app principal)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| APP-01 | L42–L45 | `code: 'PRJ-MIN-2027-01', name: 'MINEDU · Dotación 2027', region: 'Junín', budget: 'S/ 850,000'` | MINEDU, MIN, Junín, S/ | Proyecto semilla desde BD o JSON de tenant; código con prefijo configurable; moneda configurable |
| APP-02 | L107–L114 | `const minedu = DEFAULT_PROJECTS[0]; … const twoOnly = [userProject, minedu]; … return [minedu];` | MINEDU (variable de lógica) | Renombrar a `defaultProject` y derivar de config; no acoplar lógica de módulos al proyecto demo |

> **Sin hallazgo:** L242/L253 (`entidad`) y `CreateProjectModal.tsx` ya usan etiqueta agnóstica «Cliente / Empresa Contratante» con placeholder «Ej. Inmobiliaria Qaway, Grupo Constructor…» ✅ (L435–L440). Mantener ese patrón.

### 4.2 `src/components/Sidebar.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| SID-01 | L53 | `{ id: 'p1', code: 'PRJ-MIN-2027-01', name: 'MINEDU · Dotación 2027', region: 'Junín', … }` | MINEDU, Junín | Idem APP-01 |
| SID-02 | L102 | `<b>{activeProject?.name \|\| 'MINEDU · Dotación 2027'}</b>` | MINEDU | Fallback neutro: `'Proyecto activo'` o nombre de tenant |

### 4.3 `src/components/Topbar.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| TOP-01 | L39 | `hitos: 'Hitos rectores'` | Hito rector (nomenclatura MINEDU) | `hitos: 'Hitos clave'` |

### 4.4 `src/components/FloatingChatAssistant.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| FCH-01 | L136 | `'🌐 Configuración de zona horaria Perú (UTC-5)'` | Perú | `'🌐 Configuración de zona horaria'` + valor desde tenant (`Intl` / config) |

### 4.5 `src/services/geminiRAGService.ts` — ⚠️ acoplamiento total del asistente IA

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| GEM-01 | L4 | `Módulo: Gestor de Proyectos Territoriales · Qaway Lab (Dotación 2027)` | Dotación 2027 | Sin year/sector: `Gestor de Proyectos · Qaway Lab` |
| GEM-02 | L74 | `desc: 'Visión estratégica, seguimiento macro de hitos MINEDU, articulación con DRE y UGEL.'` | MINEDU, DRE, UGEL | `…seguimiento macro de hitos del cliente, articulación con la unidad regional y sedes.` |
| GEM-03 | L75 | `'Actúas como el Coordinador Territorial General del Proyecto de Dotación 2027 en Perú. … articulación entre DRE, UGEL y MINEDU, supervisando los comités…'` | Perú, DRE, UGEL, MINEDU, Dotación | Persona parametrizada: `Coordinador Operativo del proyecto {projectName}` con niveles de org desde config |
| GEM-04 | L80 | `…citando normativas peruanas aplicables.` | Perú (marco legal) | `…citando el marco normativo del cliente cuando aplique.` |
| GEM-05 | L85 | `…formulas proyecciones de entregas por UGEL…` | UGEL | `…proyecciones de entregas por sede…` |
| GEM-06 | L96 | `'Usa lenguaje técnico administrativo oficial del sector educación peruano (SIGA, UGEL, DRE, Oficios Múltiples, entregables).'` | Sector educación peruano, SIGA, UGEL, DRE | Tono neutro: `Usa el lenguaje técnico administrativo del sector del cliente (`orgLexicon` del tenant).` |
| GEM-07 | L226 | `// Ensamblado del System Instruction con Marco de Gobernanza Peruana` | Gobernanza peruana | Comentario neutro: `Marco de gobernanza del tenant` |
| GEM-08 | L231 | `ERES: Qaway Copilot · Asistente de IA para la Gestión de Proyectos Regionales de Qaway Lab y MINEDU.` | MINEDU | `…para la Gestión de Proyectos de {tenantName}.` |
| GEM-09 | L232 | `MARCO LEGAL: Cumplimiento estricto de la Ley Peruana Nº 31814 … y Ley 29733 de Protección de Datos Personales.` | Leyes peruanas | `MARCO LEGAL: {legalFramework} del tenant (carga desde config; p. ej. LOPD/GDPR/Ley 29733).` |
| GEM-10 | L241 | Proyecto activo: `${params.projectName \|\| 'MINEDU · Dotación de Materiales Educativos 2027'}` | MINEDU | Fallback neutro: `'Proyecto del tenant'` |
| GEM-11 | L242 | `- Región de operación prioritaria: DRE Junín (13 UGEL: Huancayo, Concepción, Chupaca, Jauja, Tarma, Yauli, Junín, Chanchamayo, Satipo, Pichanaki, Pangoa, Río Tambo, Río Ene Mantaro).` | DRE, UGEL, regiones | `- Unidad de operaciones: {regionName} ({n} sedes: …)` desde datos reales |
| GEM-12 | L244 | `Fecha operativa del sistema: 28 de Octubre de 2026.` | Fecha fija | `new Date()` o `cutoffDate` inyectada |

### 4.6 `src/modules/actas/ActasAcuerdosView.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| ACT-01 | L34, L45 | `ugel: string;` / `dre: string;` (tipos `Agreement`, `Acta`) | UGEL, DRE | `scope: string;` / `regionUnit: string;` |
| ACT-02 | L58, L116 | `ugel: 'UGEL Huancavelica'` | UGEL | Semilla a BD: `scope: 'Sede Huancavelica'` |
| ACT-03 | L67–L69 | `ugel: 'UGEL Maynas'`, `description: 'Completar subsanación de inconsistencias en 14 códigos modulares observados en MC SIGA.'`, `responsible: 'Ing. Lucía Ramos (Especialista SIGA)'` | UGEL, códigos modulares, MC SIGA, SIGA | `Sede Maynas` · `14 códigos de local observados en el sistema del cliente` · `Especialista de sistema` |
| ACT-04 | L76–L77 | `ugel: 'UGEL Satipo'`, `…transporte fluvial para instituciones de cuenca.` | UGEL (instituciones de cuenca es neutro) | `Sede Satipo`; mantener «instituciones de cuenca» o → `clientes de cuenca` |
| ACT-05 | L85 | `ugel: 'UGEL Cusco'` | UGEL | `Sede Cusco` |
| ACT-06 | L94–L95 | `ugel: 'UGEL Tarma'`, `description: 'Carga definitiva de matriz RAR en el aplicativo MC SIGA con firmas de conformidad.'` | UGEL, RAR, MC SIGA, aplicativo | `Sede Tarma` · `Carga definitiva de la matriz de intercambio en la plataforma del cliente…` |
| ACT-07 | L103–L105 | `ugel: 'UGEL Condorcanqui'`, `…equipo de gestión de riesgos y desastres de DRE.` , `responsible: 'Equipo Territorial DIGERE'` | UGEL, DRE, DIGERE | `Sede Condorcanqui` · `…equipo de gestión de riesgos de la unidad regional` · `Equipo Territorial Central` |
| ACT-08 | L117, L129, L141, L200 | `dre: 'DRE Huancavelica' / 'DRE Loreto' / 'DRE Junín'` | DRE | `'Unidad Regional {X}'` desde BED |
| ACT-09 | L130 | `activity: 'Asistencia técnica MC SIGA'` | MC SIGA | `Asistencia técnica del sistema` |
| ACT-10 | L158 | `{ id: 'ugel', label: 'UGEL / \u00c1mbito', … accessor: (r) => r.ugel }` | UGEL | `label: 'Sede / Ámbito'`, `id:'scope'` |
| ACT-11 | L168 | `{ id: 'ugel', label: 'Instancia / UGEL', … }` | UGEL | `label: 'Instancia / Sede'` |
| ACT-12 | L187, L241–L247 | `const [ugelFilter, setUgelFilter] = useState('todas');`, `a.ugel.toLowerCase()…`, `const matchUgel = ugelFilter…` | UGEL (estado/lógica) | Renombrar `scopeFilter`, `item.scope`, `matchScope` |
| ACT-13 | L200–L205 | `dre:'DRE Junín'`, `ugel:'UGEL Huancayo'`, `participants: 'Director de UGEL, Jefe de AGP, Especialista SIGA, Monitor Territorial DIGERE'`, agenda `'Resolución Directoral…'`, `'Cuadros de Distribución Local (CDL)'` | DRE/UGEL/AGP/SIGA/DIGERE/RD/CDL | `Director de sede, Jefe de área funcional, Especialista de sistema, Monitor territorial`, `Aprobación corporativa…`, `Planes maestros de distribución (PMD)` |
| ACT-14 | L209 | `'Concluir validación del 100% de registros en MC SIGA antes del 30 de octubre.'` | MC SIGA | `…registros en la plataforma del cliente…` |
| ACT-15 | L267 | `Entidad / Ámbito: ${form.dre} — ${form.ugel}` (plantilla de acta) | DRE, UGEL | `Entidad / Ámbito: ${form.regionUnit} — ${form.scope}` |
| ACT-16 | L289 | `link.download = \`Acta_Institucional_${form.ugel.replace(/\s+/g,'_')}_${form.date}.txt\`` | UGEL (nombre de archivo) | `Acta_${form.scope}_…` |
| ACT-17 | L332 | `…seguimiento exhaustivo de compromisos por UGEL.` | UGEL | `…compromisos por sede.` |
| ACT-18 | L427 | `placeholder="Buscar acuerdo, responsable o UGEL..."` | UGEL | `…or sede...` |
| ACT-19 | L439–L445 | `<option value="todas">Todas las UGEL</option>` + opciones `UGEL Huancavelica/Maynas/Satipo/Cusco/Tarma/Condorcanqui` | UGEL (6) | `<option>Todas las sedes</option>` + sedes desde BD |
| ACT-20 | L482 | `<ColumnHeader … label="UGEL / Ámbito" />` | UGEL | `label="Sede / Ámbito"` |
| ACT-21 | L497, L733–L734 | `{item.ugel}` / `UGEL identificada` | UGEL | `item.scope` / `Sede identificada` |
| ACT-22 | L549 | `Plantilla Institucional MINEDU` | MINEDU | `Plantilla institucional del cliente` |
| ACT-23 | L592, L600 | `<label>DRE / Entidad Rectora</label>` / `<label>UGEL / Instancia de Gestión</label>` | DRE, UGEL, Entidad rectora | `Unidad Regional / Entidad supervisora` · `Sede / Instancia de gestión` |
| ACT-24 | L773, L788–L789 | `label="Instancia / UGEL"`, `<strong>{act.ugel}</strong>…{act.dre}` | UGEL, DRE | `Instancia / Sede` + campos renombrados |

### 4.7 `src/modules/usuarios/UsuariosView.tsx` (+ `usuarios.css`)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| USR-01 | L14, L53, L67, L71, L224, L461, L888, L892 | `type UserType = 'Equipo interno' \| 'Gestor' \| 'Coordinador' \| 'Equipo UGEL';` y uso repetido (filtros/selects/`'Equipo UGEL': 'ugel'`) | UGEL (tipo de usuario) | `'Equipo del cliente'` / `'Equipo en campo'`; clase CSS `co-field` (ver USR-13) |
| USR-02 | L35–L46 (semillas 12 usuarios) | `email: 'm.jara@minedu.gob.pe'` (×7: L35,36,37,40,42,44,46) y `org: 'DRE Junín'`, `'UGEL Chanchamayo/Jauja/Concepción/Satipo/Tarma'`, correos `@ugelchanchamayo.gob.pe, @ugeljauja.gob.pe, @ugelconcepcion.gob.pe, @ugelsatipo.gob.pe, @ugeltarma.gob.pe`, `role:'Especialista SIGA'`, `role:'Especialista de Datos MC SIGA'`, `role:'Coordinadora Pedagógica'`, `area:'Gestión pedagógica'`, `area:'Materiales educativos'`, `location:'Lima, Perú / Huancayo, Junín / …'` | MINEDU, UGEL, DRE, SIGA, .gob.pe, Perú, pedagogía | Semillas a BD; dominio neutro `@cliente.com`; roles/áreas del tenant |
| USR-03 | L77 | `{ id:'org', label:'DRE / UGEL / Área', type:'select', accessor:(p)=>p.org }` | DRE, UGEL | `label: 'Sede / Área'` |
| USR-04 | L217 | ``const email = findVal(...) \|\| `${name.toLowerCase().replace(/\s+/g,'.')}@minedu.gob.pe`;`` | MINEDU | Fallback `@cliente.com` (o campo obligatorio de BD) |
| USR-05 | L219–L224 | `rawType \|\| 'Equipo UGEL'`, `@org … \|\| 'DRE Junín'`, `type: 'Equipo UGEL'` | UGEL, DRE | Defaults neutros desde config |
| USR-06 | L251, L820 | `location: org.includes('Lima') ? 'Lima, Perú' : 'Junín, Perú'` | Perú, Junín (lógica) | Ubicación real del registro (BD) |
| USR-07 | L269 | `['Nombre','Correo','Cargo','Tipo','DRE / UGEL / Área','Estado','Último acceso','Teléfono']` (export CSV) | DRE, UGEL | Cabecera `Sede / Área` |
| USR-08 | L276 | `a.download = 'directorio-equipo-minedu.csv';` | MINEDU | `directorio-equipo.csv` (o `${projectCode}-equipo.csv`) |
| USR-09 | L283 | `subject=…'Coordinación de actividades · Dotación 2027'` | Dotación 2027 | `${projectName}` |
| USR-10 | L301, L304 | `Proyecto ▸ **MINEDU · Dotación 2027** ▸ Equipo y Usuarios` / `notify('Directorio vinculado al marco operativo MINEDU / DRE Junín.')` | MINEDU, DRE | Breadcrumb con nombre de proyecto real; toast neutro |
| USR-11 | L320 | `Directorio institucional de coordinadores, especialistas SIGA y responsables de las 13 UGEL de Junín.` | SIGA, UGEL, Junín | `…especialistas del sistema y responsables de las {n} sedes de {region}…` |
| USR-12 | L480, L506 | `<small>DRE / UGEL / Área</small>` / `label="DRE / UGEL / Área"` | DRE, UGEL | `Sede / Área` |
| USR-13 | L632 | `<option value="territorial">Por Jurisdicción Territorial (DRE / 13 UGEL)</option>` | DRE, UGEL | `Por jurisdicción (Región / sedes)` |
| USR-14 | L743 | `['MINEDU · Dotación 2027','Hito 1.6 · Elaboración del CDL','Seguimiento regional Junín','Validación de entregables'][i % 4]` | MINEDU, CDL, Junín | Tareas semilla a BD o textos neutros («Plan de distribución») |
| USR-15 | L839 | `'Registra personal interno o especialistas de las UGEL.'` | UGEL | `…o especialistas de las sedes.` |
| USR-16 | L860, L866 | `Correo institucional` / `placeholder="c.valdivia@minedu.gob.pe"` | MINEDU | `Correo` + placeholder `nombre@cliente.com` |
| USR-17 | L896–L900 | `<span>DRE / UGEL / Entidad</span>`, `defaultValue={editingUser?.org \|\| 'DRE Junín'}`, `placeholder="Ej. UGEL Huancayo"` | DRE, UGEL | `Sede / Entidad`, default desde config, placeholder `Ej. Sede Central Sur` |
| USR-18 | L783 | `const org = … \|\| 'DRE Junín';` | DRE | Default neutro |

**CSS — `src/modules/usuarios/usuarios.css`**

| ID | Línea | Fragmento | Término | Propuesta |
|---|---|---|---|---|
| USR-CSS-01 | L445 | `.usr-v1 .type-badge.ugel { background:#ecfdf5; … }` | UGEL (clase) | `.type-badge.field` |

### 4.8 `src/modules/hitos/HitosView.tsx` — módulo «Hitos rectores»

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| HIT-01 | L33 | `ugel: string;` (tipo `OperatingTask`) | UGEL | `scope: string` |
| HIT-02 | L62 | `deliverable: 'Oficio con directorio, características y responsables a materialesdigere@minedu.gob.pe'` | DIGERE, MINEDU | `…correo del módulo de logística del cliente` |
| HIT-03 | L72 | `title: 'Solicitud de Ajustes de Códigos Modulares en MC SIGA'` | Códigos modulares, MC SIGA | `Solicitud de ajustes de IDs de local en la plataforma` |
| HIT-04 | L75 | `deliverable: 'Oficio titular UGEL + Informe técnico + Formato Excel sustentatorio'` | UGEL | `Carta formal de la sede + informe técnico + formato sustentatorio` |
| HIT-05 | L85 | `title: 'Conformación del Comité de Distribución en las UGEL'` | UGEL | `…en las sedes` |
| HIT-06 | L111–L114 | `title:'Elaboración y Validación del Cuadro de Distribución Local (CDL)'`, `deliverable:'Registro y validación completa del CDL en el aplicativo MC SIGA'` | CDL, MC SIGA | `Plan Maestro de Distribución (PMD)` + `plataforma del cliente` |
| HIT-07 | L118–L119, L131, L144, L157, L170 *(patrón en h1–h10)* | `totalUgels: 220, completedUgels: 136/99/66/0/…` (todas las filas de hitos) | UGELs (dato) | `totalUnits/completedUnits` desde datos reales (no 220 UGEL nacionales) |
| HIT-08 | L127 | `deliverable: 'Oficio múltiple de la UGEL a directores de II.EE. solicitando terna de 3 personas'` | UGEL, II.EE., Oficio múltiple | `Carta formal de la sede a los responsables de los puntos de atención…` |
| HIT-09 | L153 | `deliverable: 'Resolución Directoral que aprueba padrón de apoyo para recepción en II.EE.'` | RD, II.EE., padrón | `Resolución/aprobación corporativa que valida el listado de apoyo en los puntos de atención` |
| HIT-10 | L166 | `deliverable: 'Contrato suscrito de transporte a II.EE. y registrado en MC SIGA (plazo 15/02/2027)'` | II.EE., MC SIGA | `Contrato de transporte hacia los puntos de atención…` |
| HIT-11 | L176 | `title: 'Registro de Asignación y Recepción en Módulo SIAGIE ME (BIAE)'` | SIAGIE, BIAE | `Registro de asignación y recepción en la plataforma del cliente` |
| HIT-12 | L179 | `deliverable: '100% de actas PECOSA registradas en la plataforma SIAGIE Materiales Educativos'` | PECOSA, SIAGIE | `100% de actas de entrega/conformidad registradas en la plataforma` |
| HIT-13 | L191 | `title: 'Consolidar padrón de miembros del comité UGEL Huancavelica vía Excel'` | UGEL, padrón | `Consolidar roster del comité de la Sede Huancavelica…` |
| HIT-14 | L193–L270 (8 tareas de contacto) | 7 correos semilla `@minedu.gob.pe` (L195, 207, 221, 233, 245, 257, 269), `ugel: 'UGEL Huancavelica/Maynas/03 Lima Metropolitana/Cusco/Condorcanqui/Satipo/Nauta'` (L196, 208, 222, 234, 246, 258, 270), `gestor: 'Roberto Farfán (Especialista SIGA Lima)'` (L219), `blockReason: '…comunicación con director de UGEL'` (L213), títulos con `UGEL` (L229, L241, L253, L265) | UGEL, MINEDU, SIGA | Semillas a BD con `@cliente.com`, `scope: 'Sede …'`, `Especialista de sistema` |
| HIT-15 | L322 | `` `Estimado ${task.gestor}, recordatorio MINEDU-DIGERE sobre ${task.ugel}: …` `` | MINEDU, DIGERE, UGEL | `Recordatorio del proyecto sobre ${task.scope}…` |
| HIT-16 | L328 | `const headers = ['Código','Hito Rector','Subproceso', …,'Avance UGEL','Conformidad','Entregable Oficial'];` | Hito Rector, UGEL | `'Hito clave'`, `'Avance por sede'` |
| HIT-17 | L343 | `link.setAttribute('download', \`Hitos_Rectores_MINEDU_Dotacion_2027_${…}.csv\`)` | MINEDU, Hito rector, Dotación | `` `${projectCode}_hitos_${date}.csv` `` |
| HIT-18 | L347 | `notify('Matriz de Hitos exportada correctamente a formato CSV institucional')` | (low) institucional | Texto neutro (OK dejar) |
| HIT-19 | L356–L358 | `OFICIO MÚLTIPLE N.º 00032-2026-MINEDU/VMGP-DIGERE` | MINEDU, VMGP, DIGERE, Oficio múltiple | Referencia documental del tenant: `Oficio N.º 00032-2026-{CLIENTE}/{UNIDAD}` (o genérico «Oficio N.º…») |
| HIT-20 | L360 | `<h1 className="hit-title">Hitos Rectores y Matriz Contractual</h1>` | Hitos rectores | `Hitos clave y matriz de compromisos` |
| HIT-21 | L370–L372 | `notify('Sincronización con MC SIGA completada con éxito')` / `<span>Actualizar SIGA</span>` | MC SIGA | `Sincronización con la plataforma del cliente` / `Actualizar plataforma` |
| HIT-22 | L385 | `<div className="hit-kpi-label">Hitos Rectores Oficiales</div>` | Hitos rectores | `Hitos clave del proyecto` |
| HIT-23 | L514 | `<span>{hito.completedUgels}/{hito.totalUgels} UGEL</span>` | UGEL | `{completed}/{total} sedes` |
| HIT-24 | L576–L577 | `<strong>Ámbito / UGEL:</strong><span>{task.ugel}</span>` | UGEL | `Ámbito / Sede:` |
| HIT-25 | L620 | `…vinculadas directamente a este hito rector.` | Hito rector | `…a este hito clave.` |
| HIT-CSS | hitos.css | *(sin hallazgos)* | — | — |

### 4.9 `src/modules/reporteador/ReporteadorView.tsx` (+ `reporteador.css`)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| REP-01 | L46 | `name: 'Conformación de comités UGEL'` | UGEL | `…de comités de sede` |
| REP-02 | L52–L53 | `name:'Elaboración del CDL en MC SIGA'`, `description:'Corte DRE Junín: Fase 1, Fase 2 y validación DEI'` | CDL, MC SIGA, DRE, DEI | `Plan de distribución — plataforma del cliente`, `Corte {region}: …` |
| REP-03 | L61, L66–L67 | `'Fase 1 · Planificación y CDL preliminar'`, `'Conformar comité UGEL'`, `'Remitir CDL preliminar'` | CDL, UGEL | `Plan preliminar`, `Conformar comité de sede` |
| REP-04 | L73, L79 | `'Fase 2 · Registro en MC SIGA (RAR / NEA)'`, `'Registro de NEA por UGEL'` | MC SIGA, RAR, NEA, UGEL | `Fase 2 · Registro en plataforma (lotes / SKUs)`, `…por sede` |
| REP-05 | L85, L90 | `'Fase 3 · Validación DEI – Nivel Inicial'`, `'Validación de matrícula inicial'` | DEI, matrícula | `Fase 3 · Validación del segmento inicial`, `Validación de altas` |
| REP-06 | L91 | `'Registro final en MC SIGA'` | MC SIGA | `Registro final en plataforma` |
| REP-07 | L98–L99 | `name:'Gestión de Almacenes y Recepción RAR / NEA'`, `description:'Control de recepción física y pecosas de materiales'` | RAR, NEA, pecosa | `Almacenes y recepción de lotes` · `…recepción física y actas de entrega` |
| REP-08 | L106 | `'Registro de NEA en almacén'` | NEA | `Registro de lotes en almacén` |
| REP-09 | L111 | `name: 'Distribución a Instituciones Educativas'` | Instituciones educativas | `Distribución a puntos de atención` |
| REP-10 | L124–L125, L131 | `'Cierre y Consolidado Regional Junín'`, `'Auditoría de consistencia de pecosas…'`, `'Validación de actas y pecosas'` | Junín, pecosa | `Cierre y consolidado {region}`, `…actas de entrega` |
| REP-11 | L132 | `'Consolidación regional DRE'` | DRE | `Consolidación de unidad regional` |
| REP-12 | L138, L145 | `'Remisión de informe de cumplimiento al MINEDU'`, `'Remisión formal al MINEDU'` | MINEDU | `…al cliente / sponsor` |
| REP-13 | L159 | `'Elaboración del oficio múltiple UGEL'` | UGEL, Oficio múltiple | `Elaboración de la carta formal de la sede` |
| REP-14 | L161 | `'Registro de respuestas y CDL en MC SIGA'` | CDL, MC SIGA | `Registro de respuestas y plan en plataforma` |
| REP-15 | L163 | `'Cierre del hito y conformidad DRE'` | DRE | `…conformidad de la unidad regional` |
| REP-16 | L167–L179 | Lista semilla: `UGEL Huancayo/Concepción/Chupaca/Jauja/Tarma/Yauli/Junín/Chanchamayo/Satipo/Pichanaki/Pangoa/Río Tambo/Perené` | UGEL ×13 | `Sedes` desde BED (mismo componente) |
| REP-17 | L297–L298 | `useState('Región Junín (13 UGEL)')` ×2 | Junín, UGEL | Filtros desde config de proyecto |
| REP-18 | L355 | `a.download = 'reporte-hitos-minedu-2027.csv';` | MINEDU | `` `${projectCode}_hitos.csv` `` |
| REP-19 | L363–L364, L372 | `['UGEL','Estado','Avance %','Región']`, `...juninUgels.map(...)`, `notify('Cumplimiento por UGEL exportado en CSV')` | UGEL, Junín | `['Sede','Estado',…]`, `…por sede exportado…` |
| REP-20 | L390 | `Proyecto ▸ **MINEDU · Dotación 2027** ▸ Reporteador` | MINEDU | Nombre de proyecto real |
| REP-21 | L394 | `notify('Reporteador conectado al marco territorial MINEDU.')` | MINEDU | `…al marco del proyecto.` |
| REP-22 | L412, L415 | `Monitoreo del avance de los hitos del proyecto Dotación 2027…` / `<span className="tag">13 UGEL · Región Junín</span>` | Dotación, UGEL, Junín | `{project.name}` + `{n} sedes · {region}` |
| REP-23 | L427, L790 | `options={['Región Junín (13 UGEL)','Todas las regiones']}` / `…'Filtrar por sede provincial'` | Junín, UGEL | Options desde tenant |
| REP-24 | L464 | `<small>en el proyecto Dotación</small>` | Dotación | `en el proyecto` |
| REP-25 | L498 | `Porcentaje promedio de cumplimiento en las 13 UGEL.` | UGEL | `…en las {n} sedes` |
| REP-26 | L505 | `{ id:'1.6', name:'CDL SIGA', v:67 }` | CDL, SIGA | `Plan de distribución` |
| REP-27 | L741 | `Mostrando {filteredMilestones.length} de {milestones.length} hitos rectores` | Hitos rectores | `hitos clave` |
| REP-28 | L761 | `<div className="eyebrow">REPORTE DETALLADO DE CUMPLIMIENTO POR UGEL</div>` | UGEL | `…POR SEDE` |
| REP-29 | L810, L832 | `…evidencias de las UGEL.` / `…'11/13' : '0/13'} UGEL` | UGEL | `sedes` |
| REP-30 | L839–L860 | `{/* Grilla de Cumplimiento por UGEL */}`, `<section className="box ugel-strip">`, `.ugel-grid`, `.ugel-card`, `.ugel-dot` | UGEL (marcado + clases) | Comentario y clases → `.unit-strip/.unit-grid/.unit-card/.unit-dot` |
| REP-31 | L843, L849, L880, L886 | `Cumplimiento en las 13 UGEL de Junín`, `placeholder="Buscar UGEL..."`, `Estado de atención de las 13 UGEL.`, `<small>UGEL</small>` | UGEL, Junín | `sedes` / `{region}` |
| REP-32 | L912, L923 | `Evolución temporal del registro en MC SIGA.` / `Line name="Etapa 3 · CDL MC SIGA"` | MC SIGA, CDL | `…registro en plataforma` / `Etapa 3 · Plan de distribución` |

**CSS — `src/modules/reporteador/reporteador.css`**

| ID | Líneas | Fragmento | Término | Propuesta |
|---|---|---|---|---|
| REP-CSS-01 | L814 | `/* Grilla territorial de UGEL */` | UGEL | Comentario → `Unit grid` |
| REP-CSS-02 | L815, L828, L834, L844, L849–L851, L853, L860, L870–L872, L874, L880, L890, L895–L897 | `.rep-v1 .ugel-strip { … }`, `.ugel-grid`, `.ugel-card(:done/.work/.none)`, `.ugel-dot`, `.ugel-card-top` | UGEL (≈19 selectores) | `.unit-strip/.unit-grid/.unit-card/.unit-dot` |

### 4.10 `src/modules/resumen/ResumenProyectoView.tsx` (+ `resumen.css`)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| RES-01 | L12–L24 | Semillas `DEMO_UGEL`: `UGEL Chupaca/Concepción/Huancayo/Jauja/Junín/Satipo/Tarma/Chanchamayo/Yauli/Pichanaki/Río Tambo/Pangoa/Perené` con `hito:'Registro MC SIGA'/'Validación DEI'/'Carga RAR'` | UGEL ×13, MC SIGA, DEI, RAR | Datos a BD; `hito` → `Registro en plataforma` / `Validación de etapa` |
| RES-02 | L28–L31 | `Carga de archivo RAR en MC SIGA / Registro de NEA en MC SIGA / Validación de inconsistencias CDL` (eventos) | RAR, MC SIGA, NEA, CDL | `Carga de paquete de datos`, `Registro de lotes`, `Validación de plan` |
| RES-03 | L35–L37 | `Fase 1 — Planificación y CDL`, `Fase 2 — Registro MC SIGA (RAR / NEA)`, `DEI — Validación Nivel Inicial` | CDL, MC SIGA, RAR, NEA, DEI | Idem REP-04/REP-05 |
| RES-04 | L47, L383 | `{ id:'nombre', label:'UGEL', … }` / `label="UGEL"` | UGEL | `label:'Sede'` |
| RES-05 | L62 | `useTableEngine<…>({ tableId:'resumen-ugel', … })` | UGEL (id técnico) | `tableId:'resumen-units'` |
| RES-06 | L64, L78, L85, L209 | `const [ugel,setUgel]=useState('Todas')`, `matchesUgel`, `value={ugel}` | UGEL (estado) | `unitFilter` |
| RES-07 | L81 | `fase==='Fase 2' ? row.fase2 : row.dei` | DEI (lógica) | Renombrar `row.stage3` |
| RES-08 | L101 | `Proyecto ▸ **MINEDU · Dotación 2027** ▸ Resumen del proyecto` | MINEDU | Nombre real |
| RES-09 | L104 | `notify('Panel de Resumen Regional conectado a MC SIGA.')` | MC SIGA | `…conectado a la plataforma del cliente.` |
| RES-10 | L152 | `…puedes crear nuevos proyectos para otras DRE/UGEL y subir su cronograma maestro…` | DRE, UGEL | `…para otras unidades/sedes…` |
| RES-11 | L181 | `<div className="eyebrow">DRE JUNÍN <span>•</span> DOTACIÓN 2027</div>` | DRE, Junín, Dotación | `{region} • {project.name}` |
| RES-12 | L183, L280 | `Monitoreo ejecutivo de la subida del Cuadro de Distribución Local (CDL) en MC SIGA · Actividad 1.6` / `Progreso reportado de subida de archivos en MC SIGA` | CDL, MC SIGA | `Plan maestro de distribución en plataforma` |
| RES-13 | L204 | `<option>DEI</option>` | DEI | `<option>Etapa 3</option>` |
| RES-14 | L244, L246 | `<span>UGEL monitoreadas</span>`, `<small>En la región Junín</small>` | UGEL, Junín | `Sedes monitoreadas` / `{region}` |
| RES-15 | L308, L363, L367 | `{/* Grid Inferior: … + UGEL de Atención */}`, `{/* UGEL que requieren atención */}`, `<h2>UGEL en atención</h2>` | UGEL | `Sedes en atención` |

**CSS — `src/modules/resumen/resumen.css`**

| ID | Línea | Fragmento | Término | Propuesta |
|---|---|---|---|---|
| RES-CSS-01 | L431 | `/* Tabla de UGEL de Atención */` | UGEL | `/* Tabla de unidades de atención */` |

### 4.11 `src/modules/cronograma/CronogramaView.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| CRV-01 | L12 | `name:'MINEDU · Dotación 2027' … unit:'Todas las UGEL' … description:'Distribución nacional de materiales educativos. …'` | MINEDU, UGEL, educativos | Proyecto neutro `unit:'Todas las unidades'` |
| CRV-02 | L14 | `name:'1.6 Elaboración del Cuadro de Distribución Local en el MC SIGA' … description:'…Cuadro de Distribución de Locales en MC SIGA.'` | CDL, MC SIGA | `1.6 Plan maestro de distribución en la plataforma` |
| CRV-03 | L15–L18 | `Fase 1 · Planificación y CDL preliminar`, `loaders 'Responsables de UGEL'`, `unit:'UGEL Chupaca/Concepción'`, `Esp. CDL Chupaca/Concepción/Satipo/Huancayo/Tarma`, `'Comité conformado y CDL preliminar remitido'` | UGEL ×n, CDL ×n | `Fase 1 · Planificación y plan preliminar`, `Responsables de sede`, `Owner por sede` |
| CRV-04 | L19–L25 | `Fase 2 · Registro en MC SIGA (RAR/NEA)`, `Cargar archivo RAR en MC SIGA`, `Registro de NEA … según archivo proporcionado por el residente SIGA`, fases `Registro MC SIGA` ×n, `Confirmar 100% de NEA registradas` | MC SIGA ×9, RAR, NEA, SIGA | `Fase 2 · Registro en plataforma (lotes)`, `Cargar paquete de datos`, `…por el coordinador técnico` |
| CRV-05 | L26–L28 | `Fase 3 · Validación DEI y Nivel Inicial`, `Validación de matrícula`, `Registro DEI en MC SIGA`, `Referencias 'Matrícula validada'` | DEI, matrícula, MC SIGA | `Validación de altas del segmento inicial` |
| CRV-06 | L29 | `name:'II. Gestión de almacenes y recepción RAR / NEA'` | RAR/NEA (el «II.» es numeral, no II.EE.) | `Almacenes y recepción de lotes` |
| CRV-07 | L30 | `unit:'UGEL Chupaca'` (f4) | UGEL | `Sede Chupaca` |
| CRV-08 | L32 | `const units=['Todas las unidades','UGEL Chupaca','UGEL Concepción','UGEL Huancayo','UGEL Jauja','UGEL Junín','UGEL Satipo','UGEL Tarma','UGEL Chanchamayo','UGEL Yauli','UGEL Pichanaki','UGEL Río Tambo','UGEL Perené'];` | UGEL ×12 | Lista desde BED (misma lista con `Sede …`) |
| CRV-09 | L47 | `'Todas las UGEL'` (filtro lógico) | UGEL | `'Todas las unidades'` |
| CRV-10 | L62 | `<b>MINEDU · Dotación 2027</b>` + `placeholder="Buscar proyectos, UGEL, tareas..."` | MINEDU, UGEL | Nombre real + `…sedes…` |
| CRV-11 | L63 | `breadcrumb … MINEDU · Dotación 2027 …` | MINEDU | Nombre real |
| CRV-12 | L64 | `MINEDU · Dotación 2027 · Planificación, seguimiento territorial y avance por unidad ejecutora en MC SIGA` | MINEDU, unidad ejecutora, MC SIGA | `…avance por unidad operativa en la plataforma` |
| CRV-13 | L67 | filtro `<label><span>UGEL</span><select …>{units…}` + fases `'Registro MC SIGA','DEI','Elaboración del CDL'` | UGEL, MC SIGA, DEI, CDL | `Sede` + fases neutras |
| CRV-14 | L72 | `Consulta la ejecución de las actividades aplicables a cada UGEL.` | UGEL | `…cada sede.` |
| CRV-15 | L73 | hitos card `Registro MC SIGA completado`, `DEI – Nivel Inicial validado`, fases REF | MC SIGA, DEI | Neutro |
| CRV-16 | L75 | `<th>UGEL</th>` (matriz) | UGEL | `<th>Sede</th>` |
| CRV-17 | L78 | modal nuevo elemento: `<label>UGEL<select …>{units…}` | UGEL | `<label>Sede…` |

### 4.12 `src/modules/cronograma-gantt/` (Gantt Maestro, Calendario, Kanban)

**`CronogramaGanttView.tsx`**

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| GAN-01 | L163–L340 (semillas de hitos/sedes) | `region:'Junín'`, `sede:'UGEL Tarma/Concepción/Huancayo/01 San Juan/10 Huaral/Tumbes/Zarumilla/Maynas/Tayacaja/Todas las UGEL/03 Breña'`, `distrito:'Huancayo/Concepción/…'` | UGEL ×15, Junín | `sede:'Sede …'` desde BED |
| GAN-02 | L172 | `name:'Conformación de comités UGEL'` | UGEL | `…de sede` |
| GAN-03 | L211 | `description:'Organización de almacenes territoriales y control de recepción de materiales educativos.'` | educativos | `…de los productos del proyecto.` |
| GAN-04 | L237 | `name:'Registro de recepción de materiales (RAR / NEA)'` | RAR, NEA | `(lotes / SKUs)` |
| GAN-05 | L259 | `description:'Coordinación y contratación de transporte para distribución de materiales a instituciones educativas.'` | instituciones educativas | `…a los puntos de atención del cliente.` |
| GAN-06 | L314, L321 | `name:'Cierre, PECOSA y Consolidado Regional'`, `description:'Validación de actas PECOSA y consolidación regional en SIAGIE.'` | PECOSA ×2, SIAGIE | `Cierre, actas de entrega y consolidado regional`, `…en la plataforma del cliente.` |
| GAN-07 | L325 | `sede:'Todas las UGEL'` | UGEL | `'Todas las sedes'` |
| GAN-08 | L331 | `name:'Validación y registro de PECOSA en SIAGIE'` | PECOSA, SIAGIE | `Validación y registro de actas de entrega en plataforma` |
| GAN-09 | L361, L372 | `name:'Informe Técnico Final MINEDU - DIGERE'`, `sede:'MINEDU - DIGERE'` | MINEDU, DIGERE | `Informe técnico final del cliente`, `sede:'Oficina central'` |
| GAN-10 | L368 | `description:'…del informe final de cumplimiento normativo Dotación 2027.'` | Dotación | `…del proyecto {name}.` |
| GAN-11 | L387 | `sede:'Sede Central MINEDU'` | MINEDU | `Sede Central` |
| GAN-12 | L393, L402 | `name:'Elevación de informe a DIGERE y cierre de ciclo'`, `sede:'DIGERE - MINEDU'` | DIGERE, MINEDU | `Elevación de informe a coordinación central…`, `sede:'Central - Cliente'` |
| GAN-13 | L443–L478 (mapa) | `{ name:'Junín', distrito:'Tarma', sede:'UGEL Tarma', count:8 } … 'UGEL Concepción','UGEL Huancayo','UGEL 01 San Juan','UGEL 10 Huaral','UGEL Tumbes','UGEL Zarumilla','UGEL Maynas','UGEL Tayacaja'` | UGEL ×m, Junín | Territorios reales desde BED |
| GAN-14 | L485 | `{ value:'Junín', label:'Junín' }` | Junín | Regiones desde BED |
| GAN-15 | L588 | `{ key:'name', label:'Hito Rector / Subproceso Oficial', fixed:true }` | Hito rector | `Hito clave / Subproceso` |
| GAN-16 | L601, L644 | `label:'UGEL / Sede'` ×2 | UGEL | `label:'Sede / Local'` |
| GAN-17 | L850 | `/* Línea "Hoy" dinámica calibrada con zona horaria o fecha de corte operativa MINEDU */` | MINEDU | `…del tenant` |
| GAN-18 | L3004, L4465, L4678, L4682, L5319, L5353–L5372 | `'Nuevo hito rector'`, `…primer hito rector o importa un cronograma oficial…`, `title="Hito Rector Oficial"`, `…agregar un nuevo Hito Rector…` | Hito rector ×6 | `Hito principal` |
| GAN-19 | L4754, L4779, L6181, L6210 | `title="Clic para cambiar la fecha … con calendario institucional"` | (low) institucional | Opcional: `calendario del proyecto` |
| GAN-20 | L7055, L7134 | `/* Modal Institucional: … */` | (low) | Comentarios neutros |
| GAN-21 | L7503 | `El archivo se vinculará como sustento rector visible para los gestores.` | sustento rector | `sustento oficial del hito` |

**`CronogramaCalendarioView.tsx`**

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| CAL-01 | L51 | `// Programación Oficial de Hitos Rectores y Subprocesos · MINEDU Dotación 2027 (Octubre 2026)` | Hito rector, MINEDU, Dotación | `// Programación de hitos clave · {proyecto}` |
| CAL-02 | L69, L87, L103, L153, L171, L187 | `region:'Junín'` (6 semillas) | Junín | BED |
| CAL-03 | L108 | `name:'Gestión de Almacenes y Recepción en MC SIGA'` | MC SIGA | `…en la plataforma del cliente` |
| CAL-04 | L515–L516, L558, L560, L689, L706, L754, L805–L807 | `title="Hito Rector MINEDU"` (L560), `it.kind==='hito' ? 'Hito Rector' : 'Subproceso'` (L689, L754), `Hito Rector` en leyenda (L807) | Hito rector, MINEDU | `Hito principal` (5 refs) |
| CAL-05 | L470, L706 | `/* Cabecera Limpia Institucional… */`, `/* Barra Lateral Derecha Institucional… */` | (low) | Neutro |

**`CronogramaKanbanView.tsx`**

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| KAN-01 | L173–L184 | `{/* Hito Rector Padre (si es subproceso) */}`, `title={\`Hito rector: ${parentHito.name}\`}`, `title="Hito Rector Principal"`, `<span>Hito Rector Oficial</span>` | Hito rector ×4 | `Hito principal` |

**`CronogramaListaView.tsx`** — ✅ sin hallazgos.
**`gantt.css`** — ver 4.12-CSS.

**CSS — `src/modules/cronograma-gantt/gantt.css`**

| ID | Líneas | Fragmento | Término | Propuesta |
|---|---|---|---|---|
| GAN-CSS-01 | L3896 | `/* TABS HEADER ROW & PERSPECTIVE SWITCH (GANTT MAESTRO VS POR UGEL) */` | UGEL | `…POR SEDE` |
| GAN-CSS-02 | L3951–L4158 (≈19 selectores) | `/* VISTA TERRITORIAL POR UGEL (13 UNIDADES EJECUTORAS) */`, `.gantt-v2 .ugel-grid-layout/.ugel-grid-header/.ugel-grid-title/.ugel-grid-desc/.ugel-summary-chips/.ugel-chip/.ugel-cards-grid/.ugel-card/.ugel-card-top/.ugel-name/.ugel-sede/.ugel-status-badge/.ugel-card-metrics/.ugel-progress-track/.ugel-progress-fill/.ugel-card-action/.ugel-inspect-btn` | UGEL, unidad ejecutora | `.unit-grid-*`, `.unit-card-*`, `.unit-chip`… (~19 clases) |

### 4.13 `src/modules/tareas/TareasView.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| TAR-01 | L10 | `title:'Consolidar información de distribución de materiales educativos'`, `description:'Verificar la información recibida de las UGEL…'` | UGEL, educativos | `…de las sedes…`, `productos del proyecto` |
| TAR-02 | L38 | `MINEDU ▸ **Dotación 2027** ▸ Tareas` | MINEDU, Dotación | `${project.name}` |
| TAR-03 | L43 | `<small>MINEDU · DOTACIÓN 2027</small>` (drawer nueva tarea) | MINEDU, Dotación | `<small>{project.name}</small>` |
| TAR-04 | L44 | `TAREA QW-T-0001 · MINEDU · DOTACIÓN 2027` (ficha detalle) | MINEDU, Dotación | ``${projectCode}`` |
| TAR-05 | L45 | `<small>Dotación 2027 · #{String(t.id).padStart(3,'0')}</small>` (filas) | Dotación | `{project.name} · #…` |

### 4.14 `src/modules/configuracion/ConfiguracionView.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| CFG-01 | L65 | `{ id:'America/Lima', label:'America/Lima (UTC-05:00) · Hora Oficial de Perú' }` | Perú, Lima | Zonas horarias genéricas; etiqueta del tenant |
| CFG-02 | L102–L103 | `name:'MINEDU · Dotación 2027', region:'Junín'` | MINEDU, Junín | Datos de proyecto reales |
| CFG-03 | L720 | `<p>Parámetros de trazabilidad para cambios de cronograma por directores regionales y coordinadores UGEL.</p>` | UGEL | `…por coordinadores de sede.` |
| CFG-04 | L951 | `<p>Añade reglas de negocio regionales (ej. nombres de UGEL prioritarias, formatos de actas, directivas MINEDU).</p>` | UGEL, MINEDU | `(ej. sedes prioritarias, formatos de actas, directivas del cliente)` |

> Nota: L179/321/719/724/1172 usan «institucional» como adjetivo genérico — aceptable, sin acoplamiento estatal.

### 4.15 `src/modules/reuniones/ReunionesView.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| REU-01 | L24 | `project:'Dotación 2027' … coordinación con la DRE.` | Dotación, DRE | `{project.name}` · `…con la unidad regional.` |
| REU-02 | L25, L26, L29 | `project:'Dotación 2027'`, `site:'UGEL Huancayo'`, `address:'Huancayo, Junín, Perú'`; `site:'UGEL Concepción'`, `address:'Concepción, Junín, Perú'`; `site:'UGEL Chupaca'`, `address:'Chupaca, Junín, Perú'` | UGEL ×3, Perú, Junín | Lugares reales de BD |
| REU-03 | L27, L28 | `project:'Dotación 2027' / 'Visitas territoriales'` | Dotación | Nombre real |
| REU-04 | L73, L89 | `setForm(… project:'Dotación 2027', region:'Junín' …)` ×2 | Dotación, Junín | Defaults desde proyecto activo |
| REU-05 | L102 | `const regions=['Todas las regiones','Junín','Nacional','Pasco','Huancavelica','Ayacucho'];` | Junín… | Regiones desde BED |
| REU-06 | L112 | `breadcrumbs: MINEDU – Dotación 2027 ▸ Gestión operativa ▸ Reuniones` | MINEDU, Dotación | `${project.name}` |
| REU-07 | L126 | etiquetas de mapa `HUANCAYO / CONCEPCIÓN / CHUPACA / TARMA / JAUJA` + `title={m.site}` `m.site.replace('UGEL ','')` | Huancayo…, UGEL | Mapa territorial dinámico; `replace('UGEL ')` → replace por config (`'Sede '`) |
| REU-08 | L25–L29 | semillas de attendees/nombres demo | (datos demo) | BD |

### 4.16 `src/modules/sedes/SedesView.tsx` — 🟡 ya renombrado a «Sede» (bien) pero con acoplamiento territorial/moneda

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| SED-01 | L38–L170 | `INITIAL_SEDES`: `Sede Chupaca/Concepción/Huancayo Central/Jauja/Tarma/Chanchamayo/Yauli-Satipo/Pichanaki/Río Tambo` + `sedeFisica:'Chupaca Centro','Concepción Norte','Huancayo Metropolitano','Jauja Aeropuerto','Tarma Alta','La Merced','La Oroya Antigua','Satipo Urbano','Pichanaki Eje Cafetero','Puerto Prado'` | Junín (semillas) | Limpiar: semillas por BD; `La Merced`, `Jauja Aeropuerto`… son ubicaciones reales de Junín |
| SED-02 | L224–L227 | `newSedeZona='Valle del Mantaro'`, `newSedeCoord='Carlos Mendoza'`, `newSedeGestor='María Salazar'`, `newSedePresupuesto='S/ 60,000'` | Junín, S/ | Defaults vacíos o de config; moneda del tenant |
| SED-03 | L283 | `presupuesto: newSedePresupuesto.trim() \|\| 'S/ 50,000'` | S/ | `${currencySymbol} 50,000` |

> «Sedes de Supervisión» y el índice del módulo (`sedes`) ya son agnósticos ✅.

### 4.17 Micro-app `qaway-cronograma/src/App.tsx` (prototipo cronograma)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| QC-01 | L8 | `name:'MINEDU · Dotación 2027' … unit:'Todas las UGEL' … Distribución nacional de materiales educativos…` | MINEDU, UGEL, educativos | Idem CRV-01 |
| QC-02 | L10–L28 | Copia casi idéntica de la seed del cronograma (1.6 CDL en MC SIGA, fases RAR/NEA, DEI, matrícula, comités UGEL ×~14 refs, `Esp. CDL …`, `unit:'UGEL …'`) | UGEL, MC SIGA, CDL, RAR, NEA, DEI, matrícula | Sincronizar con la versión limpia del módulo principal |
| QC-03 | L28 | `units=['Todas las unidades','UGEL Chupaca',…,'UGEL Perené']` (12) | UGEL ×12 | BED |
| QC-04 | L35, L37 | `'Todas las UGEL'` (defaults/lógica) | UGEL | `'Todas las unidades'` |
| QC-05 | L49 | sidebar `PROYECTO ACTIVO **MINEDU · Dotación 2027**` | MINEDU | Nombre real |
| QC-06 | L50 | `<b>MINEDU · Dotación 2027</b>` + `placeholder="Buscar proyectos, UGEL, tareas..."` | MINEDU, UGEL | Nombre real + `sedes` |
| QC-07 | L51–L52 | breadcrumb + `<p>MINEDU · Dotación 2027 · Distribución nacional de materiales educativos</p>` | MINEDU, educativos | `${project.name}` |
| QC-08 | L55 | etiqueta `Unidad ejecutora` + fases `Registro MC SIGA/DEI/Elaboración del CDL` | unidad ejecutora, MC SIGA, DEI, CDL | `Unidad operativa` + fases neutras |
| QC-09 | L60, L61 | `aplicables a cada UGEL`, hitos `Registro MC SIGA completado / DEI – Nivel Inicial validado` | UGEL, MC SIGA, DEI | Neutro |

### 4.18 Micro-app `hubpro-cronograma-gantt-v2/src/App.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| HG-01 | L12 | `{id:'h3', name:'Distribución a IIEE', description:'Coordinación de la distribución de materiales a instituciones educativas.'}` | IIEE, instituciones educativas ×2 | `Distribución a puntos de atención` |
| HG-02 | L14 | `{id:'s32', name:'Coordinación con UGEL', …}` | UGEL | `Coordinación con sedes` |
| HG-03 | L30 | `attachment = useState('Cronograma_Oficial_MINEDU.pdf')` | MINEDU | `Cronograma_Oficial.pdf` / `${projectCode}.pdf` |
| HG-04 | L55 | `<small>Definir cómo se presenta este hito a las UGEL</small>` | UGEL | `…a las sedes` |

### 4.19 Micro-app `hubpro-gestion-usuarios-v1/src/App.tsx` (+ styles)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| HGU-01 | L10, L31, L35, L105 | `type UserType = … \| 'Equipo UGEL'`, `'Equipo UGEL':'ugel'`, `{label:'Equipo UGEL'…}`, options select | UGEL ×4 | `'Equipo del cliente'` |
| HGU-02 | L18–L29 (12 semillas) | 7 correos `@minedu.gob.pe` (L18,19,20,23,25,27,29), 5 correos `@ugeljunin.gob.pe` (L21,22,24,26,28), `org:'DRE Junín'` ×3, `org:'UGEL Chanchamayo/Jauja/Concepción/Satipo/Tarma'`, roles `Especialista SIGA`, `Coordinadora pedagógica`, `Materiales educativos`, `Gestión pedagógica`, ubicaciones `Lima, Perú / …, Junín` | MINEDU, UGEL, DRE, SIGA, pérou, .gob.pe, pedagogía | Idem USR-02 |
| HGU-03 | L66 | `['Nombre','Correo','Cargo','Tipo','DRE / UGEL / Área','Estado',…]` | DRE, UGEL | `Sede / Área` |
| HGU-04 | L85 | sidebar `**MINEDU · Dotación 2027**`, `Región Junín`, `**13 UGEL**` | MINEDU, UGEL, Junín | Reemplazar por datos reales del proyecto |
| HGU-05 | L89 | `<b>MINEDU - Dotación 2027</b>` (project-switch) | MINEDU | Nombre real |
| HGU-06 | L90 | `placeholder="Buscar proyectos, UGEL, tareas..."` | UGEL | `sedes` |
| HGU-07 | L107, L112 | `<small>DRE / UGEL / Área</small>` / `<th>…DRE / UGEL / Área</th>` | DRE, UGEL ×2 | `Sede / Área` |
| HGU-08 | L111 | `<option>Personal externo de UGEL</option>` | UGEL | `Personal externo del cliente` |
| HGU-09 | L132 | `<p>Registra personal interno o contactos de las UGEL.</p>` + `placeholder="nombre@institucion.gob.pe"` | UGEL, .gob.pe | `…contactos de las sedes.` + `nombre@cliente.com` |
| HGU-CSS | styles.css (L3, minificado) | `.type-badge.ugel{background:#d8f6ed;…}` | UGEL (clase) | `.type-badge.field` |

### 4.20 Micro-app `qaway-reporteador-v2/qaway-reporteador-v2/src/App.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| RV2-01 | L7 | `{id:'1.6', name:'Elaboración del CDL en MC SIGA', description:'Corte DRE Junín: Fase 1, Fase 2 y DEI'}` + children: `Conformar comité UGEL`, `Remitir CDL preliminar`, `Fase 2 – Registro en MC SIGA`, `Carga de archivo RAR`, `Registro de NEA`, `DEI – Nivel Inicial`, `Validación de matrícula`, `Registro en MC SIGA` | CDL, MC SIGA ×2, DRE, Junín, UGEL, RAR, NEA, DEI, matrícula | Copia del diccionario §3 |
| RV2-02 | L8 | `{id:'2.1', name:'Gestión de Almacenes y Recepción RAR / NEA' … 'Registro de NEA'}` | RAR, NEA ×2 | `…Recepción de lotes` |
| RV2-03 | L21 | `PROYECTO ACTIVO **MINEDU · Dotación 2027**`, `13 UGEL ▸` | MINEDU, UGEL | Reemplazar por datos reales |
| RV2-04 | L22 | `MINEDU - Dotación 2027 ▾` + `placeholder="Buscar hitos, UGEL, documentos..."` | MINEDU, UGEL | `${project.name}` + `sedes` |
| RV2-05 | L23 | `<span className="tag">13 UGEL · Región Junín</span>` | UGEL, Junín | `{n} sedes · {region}` |
| RV2-06 | L24 | `<option>Junín</option>` (filtro Región) | Junín | BED |
| RV2-07 | L26 | `{id:'1.6', name:'CDL', …}` (gráfico) | CDL | `Plan` |
| RV2-08 | L29 | `<th>Presentación para UGEL</th>` | UGEL | `…para Sedes` |
| RV2-09 | L38 | `PRESENTACIÓN DEL INDICADOR PARA UGEL` (eyebrow) + `Región Junín`, `Consulta local por UGEL`, `Vista de presentación para UGEL` | UGEL, Junín | `…PARA SEDES`, `Consulta local por sede` |

### 4.21 Micro-app `qaway-reporteador-hito-v1_2/qaway-reporteador-hito-v1/src/App.tsx` (+ styles)

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| RH-01 | L6 | `{name:'Elaboración del oficio múltiple UGEL', …}` | UGEL, Oficio múltiple | `Elaboración de la carta formal de la sede` |
| RH-02 | L7 | `{name:'Envío a las II. EE.', …}` | II. EE. | `Envío a los puntos de atención` |
| RH-03 | L8 | `{name:'Registro de respuestas UGEL', …}` | UGEL | `Registro de respuestas por sede` |
| RH-04 | L12 | semillas `Chanchamayo, Chupaca, Concepción, Huancayo, Jauja, Junín, Pangoa, Pichanaqui, Río Ene, Río Tambo, Satipo, Tarma, Yauli` | Junín (13 territorios) | BED |
| RH-05 | L16 | `csv=[['UGEL','Estado','Avance %'],…]`, `a.download='seguimiento-ugel-demo.csv'` | UGEL ×2 | `['Sede',…]`, `seguimiento-por-sede.csv` |
| RH-06 | L17 | sidebar `PROYECTO ACTIVO **Dotación 2027**`, `Región Junín` | Dotación, Junín | Nombre real |
| RH-07 | L18 | topbar `MINEDU · Dotación 2027 ▾` + `Buscar proyectos, UGEL, tareas, documentos...` | MINEDU, Dotación, UGEL | Nombre real + `sedes` |
| RH-08 | L19 | crumb `MINEDU · Dotación 2027`, `**Seguimiento del hito por UGEL**`, `p: 'Solicitar a las II. EE. el listado de personal de apoyo…'`, `meta: 'Oficio Múltiple N.º 00032-2026-MINEDU/VMGP-DIGERE'` | MINEDU, UGEL, II. EE., VMGP, DIGERE, Oficio múltiple | El bloque con mayor densidad de referencias oficiales; usar datos reales del proyecto |
| RH-09 | L20 | `…consultar el cumplimiento de las UGEL.` | UGEL | `sedes` |
| RH-10 | L20–L21 | `<b>v='13' / '8' / '0'/>UGEL</span>`, `…(s.s==='done'?13:s.s==='active'?8:0)/13 UGEL` ×2 | UGEL | `/13 sedes` |
| RH-11 | L21 | `<input placeholder="Buscar UGEL"/>`, `'Mostrar todas las UGEL'`, `<h2>Cumplimiento por UGEL</h2>`, `'Ver resumen' [Total UGEL]` | UGEL ×4 | `Buscar sede`… |
| RH-12 | L22 | `Kpi label="Total de UGEL" value="13" detail="Región Junín"` | UGEL, Junín | `Total de sedes` |
| RH-13 | L23 | `sub="Cantidad de UGEL por estado en cada subproceso"` | UGEL | `sedes` |
| RH-14 | L24 | `sub="Situación actual de las 13 UGEL en la etapa actual"`, donut `<b>13</b><small>UGEL</small>` | UGEL | `13 sedes` |

**CSS — `qaway-reporteador-hito-v1_2/…/src/styles.css` (minificado, L2–L6)**

| ID | Líneas | Fragmento (selectores) | Término | Propuesta |
|---|---|---|---|---|
| RH-CSS-01 | L2 | `.ugel-strip{padding:15px 16px 17px…}.ugel-grid{…repeat(13…)} .ugel{min-width:0…} .ugel.done … .ugel.work … .ugel.none … .ugel-top … .ugel-progress …` | UGEL (≈30 selectores/reglas) | `.unit-strip .unit-grid .unit .unit-top .unit-progress` |
| RH-CSS-02 | L3–L6 | `@media(min-width:1600px){… .ugel{padding:10px} …} @media(max-width:1400px){… .ugel-grid{grid-template-columns:repeat(7,…)} …} @media(max-width:950px){… .ugel-grid{…repeat(5,…)} …} @media(max-width:620px){… .ugel-strip{…} .ugel-grid{…repeat(3,…)} .ugel{padding:8px 6px} .ugel-top b{…} .ugel>strong{…}}` | UGEL | Idem (los mismos nombres en los 4 breakpoints) |

### 4.22 Micro-app `qaway-tareas-v2-completo/qaway-tareas/src/App.tsx`

| ID | Línea | Texto / código actual | Término | Propuesta |
|---|---|---|---|---|
| QT-01 | L15, L16, L21, L22, L23 | `**Dotación 2027**` (project activo), `Proyecto ▸ Dotación 2027 ▸ Tareas`, `DOTACIÓN 2027` (drawer), `TAREA QW-T-… · DOTACIÓN 2027`, `<small>Dotación 2027 · #…</small>` | Dotación 2027 (sin MINEDU/UGEL) 🟢 | `{project.name}` — esta micro-app es la más limpia del grupo |

---

## 5. Archivos del alcance revisados **sin hallazgos**

- `src/main.tsx`, `src/types.ts`, `src/styles.css`
- `src/components/CreateProjectModal.tsx` ✅ (ya usa fields «Cliente / Empresa Contratante», entidad con default «Qaway Lab»)
- `src/services/supabaseClient.ts`, `src/services/gestorCronogramaService.ts`
- `src/shared/table-engine/*` (engine, types, dateUtils, columnTypes, engine.test, useTableEngine, ColumnHeaderMenu, tableEngine.css)
- `src/modules/cronograma-gantt/CronogramaListaView.tsx`, `scheduleMetrics.ts` (+ test)
- `src/modules/sedes/sedes.css`, `actas.css`, `hitos.css`, `reuniones.css`, `configuracion.css`, `cronograma.css`, `tareas.css`, `floating-chat.css`
- Todas las `main.tsx` e `index.html` de las micro-apps *(títulos neutros: «HubPro · X», «Qaway · X», «Tareas | Qaway» — sin marca estatal)*
- `tareas-v2.scoped.css`, `cronograma.scoped.css` (raíz)
- `TareasV2AppPage.jsx` (fuera del alcance {.ts/.tsx}, sin coincidencias de términos)

---

## 6. Anexo — Coincidencias fuera del alcance `src/**` (referencial)

| Ruta | Línea | Fragmento | Término |
|---|---|---|---|
| `supabase/01_gestor_cronograma.sql` | L71 | `-- Semilla inicial del proyecto MINEDU Dotación 2027` | MINEDU |
| `supabase/01_gestor_cronograma.sql` | L76 | `'MINEDU · Dotación 2027'` (INSERT) | MINEDU |
| raíz | archivo | `OFICIO_MULTIPLE-00106-2026-MINEDU-VMGP-DIGEBR (1) (1).pdf` | Oficio múltiple, MINEDU, VMGP, DIGEBR (documento del cliente; renombrar/retirar del repo gonna publicar builds) |
| raíz | `index.html` L8 | `<title>Reuniones · Qaway Gestor de Proyectos</title>` | Título desalineado con el módulo por defecto (Tareas) — actualizar a `Qaway · Gestor de Proyectos` |
| `agents.md`, `README.md` | — | Documentación con narrativa MINEDU (revisar al migrar) | — |

---

## 7. Riesgos de negocio

1. **Mercado:** un prospect de construcción/retail verá «MINEDU», «UGEL», «PECOSA» en cada pantalla → percepción de vertical-only.
2. **Licenciamiento dorsal:** el nombre y el marco legal de un ministerio impreso en la UI puede ser incompatible con políticas de branding de clientes privados.
3. **Contaminación de datos:** las semillas y “13 UGEL / 220 II.EE.” se filtran a los reportes reales de los clientes (CSVs exportados `reporte-hitos-minedu-2027.csv`, `directorio-equipo-minedu.csv`, `Hitos_Rectores_MINEDU_Dotacion_2027_*.csv`, `seguimiento-ugel-demo.csv`, `Cronograma_Oficial_MINEDU.pdf`).
4. **IA:** el system-prompt de Gemini enseña al asistente a hablar «en lenguaje del sector educación peruano» para TODA industria (GEM-06).
5. **Mantenabilidad:** los términos están replicados en 6 micro-apps + módulo principal + CSS sin fuente única de verdad.

---

## 8. Recomendaciones de arquitectura (para desacoplar)

1. **Crear `tenantConfig.ts`** (o config por tenant en BD): `clientName`, `projectName`, `regionName`, `currencySymbol`, `defaultTimezone`, `legalFramework`, `orgLexicon: { sponsor, regionUnit, unit, centralOffice, logisticUnit, platformName, deliveryAct, attentionPoints, distributionPlan, lotTerm, … }`, `demoSeeds`.
2. **Diccionario de UI único** (`strings/{es}.ts` o i18n): ningún texto atado a MINEDU/UGEL en componentes.
3. **Semillas → Supabase:** usuarios, sedes, hitos, cronograma y actas demo deben salir del `*.tsx` (los arrays `USERS_SEED`, `DEMO_UGEL`, `INITIAL_SEDES`, `seedItems`…).
4. **Renombrar clases CSS** `.ugel-*` → `.unit-*` (16 archivos CSS/TSX con selectores). Riesgo bajo, grep de verificación incluido en §9.
5. **Limpieza del servicio Gemini**: quitar MINEDU/junín del `systemInstruction`; mantener solo `params.projectName` + marco legal configurable.
6. **Nombres de export parametrizados** con `${projectCode}`.
7. **`index.html`** títulos neutros (ya lo están en micro-apps, ajustar el título raíz).
8. **Git: retirar el PDF `OFICIO_MULTIPLE-…MINEDU…pdf`** del repositorio (documento gubernamental de un cliente real no debería seguir el código).

---

## 9. Checklist de verificación post-migración (grep de aceptación)

```txt
(?i)minedu              → 0 coincidencias en src/**
(?i)ugel                → 0 coincidencias (incl. .css)
\b(dre|drej)\b          → 0 coincidencias
(?i)digere              → 0 coincidencias
(?i)siga                → 0 coincidencias
(?i)siagie              → 0 coincidencias
(?i)pecosa              → 0 coincidencias
(?i)(ii\.?\s?ee|iiee)   → 0 coincidencias
(?i)instituciones educativas → 0 coincidencias
(?i)gob\.pe             → 0 coincidencias
(?i)dotaci[oó]n 2027    → 0 coincidencias
Junín|Huancayo          → solo en datos de tenant/BD, no en código
```

---

*Informe generado por auditoría estática. No se realizó ningún cambio en el código fuente.*
