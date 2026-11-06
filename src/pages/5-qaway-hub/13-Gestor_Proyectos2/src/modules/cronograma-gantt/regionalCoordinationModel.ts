/**
 * QAWAY LAB · Modelo de Cobertura Territorial y Coordinación Macro-regional
 * Proyecto MINEDU · Dotación 2027
 *
 * Jerarquía de cargos territoriales:
 *  - Coordinador General (nivel proyecto)
 *  - Coordinador Macro-regional (supervisa 2 regiones / DRE)
 *  - Coordinador Regional (1 región / DRE)
 *
 * Junín mantiene el desglose detallado DRE + 13 UGEL; las demás regiones se
 * registran a nivel de DRE (Sede Regional) dentro del Cuadro de Distribución Local (1.6).
 */

import type { OfficialEdtReferenceRow } from './edtPmbokModel';

/** Valor de región para registros transversales que aplican a todas las regiones del proyecto */
export const MULTI_REGION_VALUE = 'Todas las Regiones';

export interface RegionProyecto {
  name: string;
  dre: string;
  macroId: string;
  coordinadorRegional: string;
}

export interface Macroregion {
  id: string;
  name: string;
  coordinador: string;
  regiones: string[];
}

export const MACROREGIONES: Macroregion[] = [
  { id: 'macro-centro', name: 'Macro Centro', coordinador: 'Rosa Quispe', regiones: ['Junín', 'Pasco'] },
  { id: 'macro-centro-sur', name: 'Macro Centro Sur', coordinador: 'Ana Torres', regiones: ['Huancavelica', 'Ayacucho'] },
  { id: 'macro-oriente', name: 'Macro Oriente', coordinador: 'Miguel Paredes', regiones: ['Huánuco', 'Ucayali'] },
];

export const REGIONES_PROYECTO: RegionProyecto[] = [
  { name: 'Junín', dre: 'DRE Junín', macroId: 'macro-centro', coordinadorRegional: 'María Salazar' },
  { name: 'Pasco', dre: 'DRE Pasco', macroId: 'macro-centro', coordinadorRegional: 'Luis Ccori' },
  { name: 'Huancavelica', dre: 'DRE Huancavelica', macroId: 'macro-centro-sur', coordinadorRegional: 'Elena Rojas' },
  { name: 'Ayacucho', dre: 'DRE Ayacucho', macroId: 'macro-centro-sur', coordinadorRegional: 'Jorge Huamán' },
  { name: 'Huánuco', dre: 'DRE Huánuco', macroId: 'macro-oriente', coordinadorRegional: 'Patricia Vela' },
  { name: 'Ucayali', dre: 'DRE Ucayali', macroId: 'macro-oriente', coordinadorRegional: 'Renzo Tapia' },
];

export interface RegionalNodeSeed {
  row: OfficialEdtReferenceRow;
  region: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Pendiente' | 'Con retraso';
}

const dreNode = (
  slug: string,
  code: string,
  region: string,
  start: string,
  end: string,
  progress: number,
  status: RegionalNodeSeed['status']
): RegionalNodeSeed => ({
  region,
  progress,
  status,
  row: {
    id: `pt-1.6-dre-${slug}`,
    code,
    name: `DRE ${region} (Sede Regional)`,
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start,
    end,
    entidadResponsable: 'DRE',
    entregableVerificable: `Matriz CDL regional consolidada y registrada en MC SIGA - DRE ${region}`,
  },
});

/** Paquetes de trabajo regionales (CDL a nivel DRE) para las regiones fuera de Junín */
export const REGIONAL_NODE_SEEDS: RegionalNodeSeed[] = [
  dreNode('pasco', '1.6.14', 'Pasco', '2026-09-30', '2026-10-16', 60, 'En proceso'),
  dreNode('huancavelica', '1.6.15', 'Huancavelica', '2026-10-01', '2026-10-19', 25, 'Con retraso'),
  dreNode('ayacucho', '1.6.16', 'Ayacucho', '2026-09-30', '2026-10-14', 100, 'Cumple'),
  dreNode('huanuco', '1.6.17', 'Huánuco', '2026-10-02', '2026-10-20', 40, 'En proceso'),
  dreNode('ucayali', '1.6.18', 'Ucayali', '2026-10-05', '2026-10-20', 0, 'Pendiente'),
];

const REGIONAL_SEED_MAP = new Map(REGIONAL_NODE_SEEDS.map((s) => [s.row.id, s]));

export const getRegionalSeed = (id: string): RegionalNodeSeed | undefined => REGIONAL_SEED_MAP.get(id);

/** Resuelve la región de un registro del cronograma oficial */
export const resolveItemRegion = (id: string): string => {
  const seed = REGIONAL_SEED_MAP.get(id);
  if (seed) return seed.region;
  // Desglose territorial detallado de Junín (DRE Junín + 13 UGEL)
  if (id.startsWith('pt-1.6-')) return 'Junín';
  return MULTI_REGION_VALUE;
};

export const getRegionCoordinador = (region: string): string | undefined =>
  REGIONES_PROYECTO.find((r) => r.name === region)?.coordinadorRegional;

export const getMacroById = (id: string): Macroregion | undefined => MACROREGIONES.find((m) => m.id === id);
