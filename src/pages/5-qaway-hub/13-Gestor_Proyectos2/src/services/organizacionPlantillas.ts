/**
 * organizacionPlantillas.ts
 * =========================
 * Plantillas iniciales de estructura organizacional (referencia EDITABLE).
 * Módulo PURO: sin Supabase, sin React. El único acople con el proyecto es el
 * `import type { GestorUnitType }` — borrado en runtime, por lo que jamás carga
 * supabaseClient. Dominio `unit_type` REUTILIZADO tal cual (9 valores,
 * gestorOrganizacionService.ts L3-12); no se introducen valores nuevos.
 *
 * Fuentes (informe de investigación A-K, 2026-11):
 *   · Público: DS 054-2018-PCM (arts. 9/10/13/14, DCF Cuarta), SERVIR (ROF/RRHH),
 *     MINEDU (DRE/UGEL).
 *   · Privado: Cosapi (Directorio + Gerencia General + gerencias; Auditoría
 *     Interna reporta al Directorio = enlace matricial) y Ferreycorp
 *     (holding con filiales/sucursales y red de tiendas).
 *   · Los nodos sin evidencia externa declarada llevan
 *     fuente = 'Referencia editable…' para que la empresa los ajuste.
 *
 * REGLAS DE COPIA POR VALOR (decisión sustentada 2026-11):
 *   · Cada selección produce borradores NUEVOS propios del tenant; la plantilla
 *     vive solo en código (como los modelos estándar del DS 054 / DCF Novena).
 *     Actualizaciones futuras de la plataforma jamás sobrescriben datos copiados.
 *   · `metadata.plantilla` sella trazabilidad: {origen, version, nombre_original,
 *     key_plantilla}. Renombrar = mutar `name`; `nombre_original` queda sellado.
 *   · Los borradores NO se insertan en BD en esta etapa (el flujo de inserción
 *     vía createGestorUnit y la pantalla de selección son etapa posterior).
 */

import type { GestorUnitType } from './gestorOrganizacionService';

export type PlantillaSector = 'publico' | 'privado';

/**
 * Nodos que representan sedes externas (no áreas de la sede central).
 * Se excluyen cuando la empresa declara una sola sede. Se excluye el padre
 * junto a sus hijos para que la re-resolución de padres no cree raíces sueltas
 * (p. ej. UGEL sin DRE).
 */
export const CLAVES_SEDES_EXTERNAS: ReadonlySet<string> = new Set([
  'dre', 'ugel-principal', 'ugel-secundaria',
  'obra-1', 'obra-2', 'tienda-1', 'tienda-2', 'sucursal-provincia',
]);

/** Versión de las plantillas: se sella en metadata.plantilla.version al copiar. */
export const VERSION_PLANTILLAS = '2026-11';

export interface PlantillaNodoDef {
  /** Clave ESTABLE dentro de la plantilla ('entidad', 'gerencia-general'…). */
  key: string;
  /** Denominación de referencia; editable por la empresa en la copia. */
  nombre: string;
  /** Tipo del dominio existente GestorUnitType (9 valores; sin nuevos). */
  unitType: GestorUnitType;
  /** Padre dentro de la plantilla (key) o null si es raíz. */
  parentKey: string | null;
  /** false = rama opcional (OCI, Directorio, obra adicional…): se copia solo si se pide. */
  activadaPorDefecto: boolean;
  /** Cargo sugerido del responsable (texto editable; catálogo diferido). */
  cargoResponsable?: string;
  /** Trazabilidad de la fuente del informe A-K (o marca de referencia editable). */
  fuente?: string;
}

export interface GestorUnitBorrador {
  key: string;
  name: string;
  unitType: GestorUnitType;
  parentKey: string | null;
  metadata: {
    plantilla: {
      origen: PlantillaSector | 'mixta' | 'ninguna';
      version: string;
      nombre_original: string;
      key_plantilla: string;
    };
  };
}

/** Sector público (12 nodos). Ramas opcionales: OCI, asesorías, planeamiento, TI, 2ª UGEL. */
export const PLANTILLA_SECTOR_PUBLICO: PlantillaNodoDef[] = [
  {
    key: 'entidad',
    nombre: 'Entidad (raíz)',
    unitType: 'central',
    parentKey: null,
    activadaPorDefecto: true,
    cargoResponsable: 'Titular de la entidad',
    fuente: 'DS 054-2018-PCM art. 9: la entidad se organiza en órganos de dirección, ejecución, asesoramiento y control',
  },
  {
    key: 'despacho',
    nombre: 'Despacho de Alta Dirección',
    unitType: 'jefatura',
    parentKey: 'entidad',
    activadaPorDefecto: true,
    fuente: 'DS 054-2018-PCM art. 10 (órganos de alta dirección)',
  },
  {
    key: 'oci',
    nombre: 'Órgano de Control Institucional (OCI)',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: false,
    fuente: 'DS 054-2018-PCM art. 14 + Ley 27785 (reporta funcionalmente fuera de la línea: enlace matricial típico)',
  },
  {
    key: 'asesoria-juridica',
    nombre: 'Asesoría Jurídica',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: false,
    fuente: 'DS 054-2018-PCM art. 13.2 (órganos de asesoramiento)',
  },
  {
    key: 'planeamiento',
    nombre: 'Oficina de Planeamiento y Presupuesto',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: false,
    fuente: 'DS 054-2018-PCM art. 13.2 + DCF Cuarta (planeamiento y presupuesto)',
  },
  {
    key: 'recursos-humanos',
    nombre: 'Oficina de Recursos Humanos',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: true,
    fuente: 'SERVIR RRHH + DS 054-2018-PCM art. 13.2 (órganos de apoyo)',
  },
  {
    key: 'administracion',
    nombre: 'Oficina de Administración',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: true,
    fuente: 'DS 054-2018-PCM art. 13.2 (apoyo: abastecimiento, tesorería, logística)',
  },
  {
    key: 'ti',
    nombre: 'Oficina de Tecnologías de la Información',
    unitType: 'oficina',
    parentKey: 'entidad',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (sin evidencia externa específica en el informe A-K)',
  },
  {
    key: 'dre',
    nombre: 'Dirección Regional de Educación (DRE)',
    unitType: 'dre',
    parentKey: 'entidad',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §C · MINEDU (dirección de línea regional)',
  },
  {
    key: 'ugel-principal',
    nombre: 'UGEL (unidad desconcentrada)',
    unitType: 'ugel',
    parentKey: 'dre',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §C · MINEDU (UGEL bajo su DRE)',
  },
  {
    key: 'ugel-secundaria',
    nombre: 'UGEL adicional',
    unitType: 'ugel',
    parentKey: 'dre',
    activadaPorDefecto: false,
    fuente: 'Informe A-K §C · MINEDU (segunda UGEL, opcional)',
  },
  {
    key: 'unidad-otra',
    nombre: 'Unidad sin clasificar (editable)',
    unitType: 'other',
    parentKey: 'entidad',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (dominio unit_type: other)',
  },
];

/**
 * Sector privado (15 nodos). Cosapi + Ferreycorp.
 * `directorio` es OPCIONAL al copiar: si se excluye, la Gerencia General (que
 * sí viene activada) pasa a raíz por la re-resolución de padres del filtro.
 */
export const PLANTILLA_SECTOR_PRIVADO: PlantillaNodoDef[] = [
  {
    key: 'grupo-holding',
    nombre: 'Grupo / Holding (raíz)',
    unitType: 'central',
    parentKey: null,
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Ferreycorp (estructura holding con filiales y sucursales)',
  },
  {
    key: 'directorio',
    nombre: 'Directorio',
    unitType: 'jefatura',
    parentKey: 'grupo-holding',
    activadaPorDefecto: false,
    cargoResponsable: 'Director',
    fuente: 'Informe A-K §D · Cosapi (gobierno corporativo). Opcional al copiar: si se excluye, la Gerencia General pasa a raíz',
  },
  {
    key: 'gerencia-general',
    nombre: 'Gerencia General',
    unitType: 'jefatura',
    parentKey: 'directorio',
    activadaPorDefecto: true,
    cargoResponsable: 'Gerente General',
    fuente: 'Informe A-K §D · Cosapi (Gerencia General + gerencias)',
  },
  {
    key: 'auditoria-interna',
    nombre: 'Auditoría Interna',
    unitType: 'oficina',
    parentKey: 'directorio',
    activadaPorDefecto: false,
    fuente: 'Informe A-K §D · Cosapi (reporta al Directorio: enlace matricial respecto a la línea)',
  },
  {
    key: 'gerencia-comercial',
    nombre: 'Gerencia Comercial',
    unitType: 'jefatura',
    parentKey: 'gerencia-general',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Cosapi (gerencias funcionales)',
  },
  {
    key: 'gerencia-operaciones',
    nombre: 'Gerencia de Operaciones',
    unitType: 'jefatura',
    parentKey: 'gerencia-general',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Cosapi (gerencias de operación)',
  },
  {
    key: 'gerencia-administracion',
    nombre: 'Gerencia de Administración y Finanzas',
    unitType: 'jefatura',
    parentKey: 'gerencia-general',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Cosapi (gerencias de apoyo)',
  },
  {
    key: 'pmo',
    nombre: 'Oficina de Proyectos (PMO)',
    unitType: 'oficina',
    parentKey: 'gerencia-operaciones',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (sin evidencia externa específica en el informe A-K)',
  },
  {
    key: 'obra-1',
    nombre: 'Obra (unidad de ejecución)',
    unitType: 'obra',
    parentKey: 'gerencia-operaciones',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Cosapi (ejecución de obras)',
  },
  {
    key: 'obra-2',
    nombre: 'Obra adicional',
    unitType: 'obra',
    parentKey: 'gerencia-operaciones',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (segunda obra, opcional)',
  },
  {
    key: 'tienda-1',
    nombre: 'Tienda (punto de venta)',
    unitType: 'tienda',
    parentKey: 'gerencia-comercial',
    activadaPorDefecto: true,
    fuente: 'Informe A-K §D · Ferreycorp (red comercial de tiendas/sucursales)',
  },
  {
    key: 'tienda-2',
    nombre: 'Tienda adicional',
    unitType: 'tienda',
    parentKey: 'gerencia-comercial',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (segunda tienda, opcional)',
  },
  {
    key: 'sucursal-provincia',
    nombre: 'Sucursal de provincia',
    unitType: 'oficina',
    parentKey: 'gerencia-comercial',
    activadaPorDefecto: false,
    fuente: 'Informe A-K §D · Ferreycorp (sucursal regional, opcional)',
  },
  {
    key: 'departamento-rrhh',
    nombre: 'Departamento de Gestión Humana',
    unitType: 'departamento',
    parentKey: 'gerencia-administracion',
    activadaPorDefecto: true,
    fuente: 'Referencia editable (área de apoyo; dominio unit_type: departamento)',
  },
  {
    key: 'departamento-ti',
    nombre: 'Departamento de TI',
    unitType: 'departamento',
    parentKey: 'gerencia-administracion',
    activadaPorDefecto: false,
    fuente: 'Referencia editable (área de apoyo; dominio unit_type: departamento)',
  },
];

/** Valida integridad estructural de una plantilla (keys únicas + parentKey resoluble). */
function validarPlantilla(defs: PlantillaNodoDef[], sector: PlantillaSector): void {
  const claves = new Set<string>();
  for (const def of defs) claves.add(def.key);
  if (claves.size !== defs.length) {
    throw new Error(`[organizacionPlantillas] claves duplicadas en plantilla "${sector}"`);
  }
  for (const def of defs) {
    if (def.parentKey !== null && !claves.has(def.parentKey)) {
      throw new Error(
        `[organizacionPlantillas] parentKey "${def.parentKey}" del nodo "${def.key}" no existe en la plantilla "${sector}"`,
      );
    }
  }
}

/**
 * Construye los borradores de unidades a copiar POR VALOR al tenant.
 *
 * @param sector 'publico' | 'privado'.
 * @param opts.soloActivadas Si true, copia solo las ramas activadas por defecto.
 *        Re-resolución de padres: si el padre del nodo quedó excluido por el
 *        filtro, el nodo pasa a RAÍZ (permite p. ej. Directorio opcional con
 *        Gerencia General como raíz, o plantear estructuras más planas).
 * @param opts.incluirSedesExternas Por defecto true. Si false, se omiten las
 *        sedes externas (CLAVES_SEDES_EXTERNAS) y queda solo la jerarquía de la
 *        sede central. No crea ni cambia tipos: solo filtra la copia.
 * @returns Borradores NUEVOS en cada llamada (sin referencias compartidas con
 *          la plantilla ni entre llamadas); no se insertan en BD aquí.
 */
export function construirBorradoresPlantilla(
  sector: PlantillaSector,
  opts?: { soloActivadas?: boolean; incluirSedesExternas?: boolean },
): GestorUnitBorrador[] {
  const defs = sector === 'publico' ? PLANTILLA_SECTOR_PUBLICO : PLANTILLA_SECTOR_PRIVADO;
  validarPlantilla(defs, sector);

  const soloActivadas = opts?.soloActivadas === true;
  const sinSedesExternas = opts?.incluirSedesExternas === false;
  const aplicarFiltro = soloActivadas || sinSedesExternas;
  const presentes = aplicarFiltro
    ? new Set(
        defs
          .filter((d) => (!soloActivadas || d.activadaPorDefecto) && (!sinSedesExternas || !CLAVES_SEDES_EXTERNAS.has(d.key)))
          .map((d) => d.key),
      )
    : null;

  const borradores: GestorUnitBorrador[] = [];
  for (const def of defs) {
    if (presentes && !presentes.has(def.key)) continue;
    // Re-resolución de parentKey: padre excluido por el filtro → nodo raíz.
    const parentKey =
      presentes && def.parentKey !== null && !presentes.has(def.parentKey)
        ? null
        : def.parentKey;
    borradores.push({
      key: def.key,
      name: def.nombre, // copia por valor: renombrar muta `name`, nunca la plantilla
      unitType: def.unitType,
      parentKey,
      metadata: {
        plantilla: {
          origen: sector,
          version: VERSION_PLANTILLAS,
          nombre_original: def.nombre, // sellado para trazabilidad
          key_plantilla: def.key,
        },
      },
    });
  }
  return borradores;
}

/**
 * Opción "desde cero": NO es una plantilla, es la ausencia de copia.
 * Devuelve un bosque vacío; la empresa crea su raíz manualmente.
 */
export function construirDesdeCero(): GestorUnitBorrador[] {
  return [];
}
