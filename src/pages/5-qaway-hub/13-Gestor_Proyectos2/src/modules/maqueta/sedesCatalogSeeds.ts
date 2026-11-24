import type { OfficialEdtReferenceRow } from './edtPmbokModel';
import { MINEDU_UNIDADES } from '../../../Bases de Datos/geocoding/New/mineduUnidades';

export interface SedeEdtItem extends OfficialEdtReferenceRow {
  region: string;
  gestor: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Con retraso' | 'Pendiente' | 'Completado';
}

const REGION_GESTORES: Record<string, string> = {
  'AMAZONAS': 'Wilson Valqui',
  'ANCASH': 'Roberto Méndez',
  'APURÍMAC': 'Edwin Palomino',
  'AREQUIPA': 'Gabriel Delgado',
  'AYACUCHO': 'Jorge Huamán',
  'CAJAMARCA': 'Segundo Díaz',
  'CALLAO': 'Jorge Barreto',
  'CUSCO': 'Ronald Quispe',
  'HUANCAVELICA': 'Elena Rojas',
  'HUÁNUCO': 'Patricia Vela',
  'ICA': 'Julio Morales',
  'JUNÍN': 'Javier Ruiz',
  'LA LIBERTAD': 'Víctor Chávez',
  'LAMBAYEQUE': 'Miguel Benites',
  'LIMA METROPOLITANA': 'César Farfán',
  'LIMA PROVINCIAS': 'Hernán Castro',
  'LORETO': 'Marcos Reátegui',
  'MADRE DE DIOS': 'Néstor Rengifo',
  'MOQUEGUA': 'Daniel Condori',
  'PASCO': 'Luis Ccori',
  'PIURA': 'Carlos Vílchez',
  'PUNO': 'Walter Mamani',
  'SAN MARTÍN': 'Dante Arévalo',
  'TACNA': 'Óscar Calizaya',
  'TUMBES': 'Pedro Morán',
  'UCAYALI': 'Renzo Tapia',
};

function getJuninGestor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('dre junín') || n.includes('dre junin')) return 'María Salazar';
  if (
    n.includes('chanchamayo') ||
    n.includes('pichanaki') ||
    n.includes('perené') ||
    n.includes('perene') ||
    n.includes('satipo') ||
    n.includes('pangoa') ||
    n.includes('río tambo') ||
    n.includes('rio tambo')
  ) {
    return 'Lucía Ramos';
  }
  return 'Javier Ruiz';
}

function normalizeRegionName(reg?: string): string {
  if (!reg) return '';
  const r = reg.trim().toUpperCase();
  const map: Record<string, string> = {
    'AMAZONAS': 'Amazonas',
    'ANCASH': 'Áncash',
    'APURÍMAC': 'Apurímac',
    'AREQUIPA': 'Arequipa',
    'AYACUCHO': 'Ayacucho',
    'CAJAMARCA': 'Cajamarca',
    'CALLAO': 'Callao',
    'CUSCO': 'Cusco',
    'HUANCAVELICA': 'Huancavelica',
    'HUÁNUCO': 'Huánuco',
    'ICA': 'Ica',
    'JUNÍN': 'Junín',
    'LA LIBERTAD': 'La Libertad',
    'LAMBAYEQUE': 'Lambayeque',
    'LIMA METROPOLITANA': 'Lima Metropolitana',
    'LIMA PROVINCIAS': 'Lima Provincias',
    'LORETO': 'Loreto',
    'MADRE DE DIOS': 'Madre de Dios',
    'MOQUEGUA': 'Moquegua',
    'PASCO': 'Pasco',
    'PIURA': 'Piura',
    'PUNO': 'Puno',
    'SAN MARTÍN': 'San Martín',
    'TACNA': 'Tacna',
    'TUMBES': 'Tumbes',
    'UCAYALI': 'Ucayali',
  };
  return map[r] || reg;
}

function regionToSlug(reg: string): string {
  return reg
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

interface ComponentMeta {
  id: string;
  code: string;
  name: string;
  faseId: string;
  start: string;
  end: string;
}

const OFFICIAL_COMPONENTS_META: ComponentMeta[] = [
  { id: 'comp-1', code: '1.', name: 'PLANIFICACIÓN DE LA DISTRIBUCIÓN', faseId: 'FASE-PLANIFICACION', start: '2026-09-04', end: '2026-12-01' },
  { id: 'comp-2', code: '2.', name: 'GESTIÓN DE ALMACENES', faseId: 'FASE-PLANIFICACION', start: '2026-09-04', end: '2026-10-15' },
  { id: 'comp-3', code: '3.', name: 'RECEPCIÓN DE MATERIAL EDUCATIVO EN DRE / UGEL', faseId: 'FASE-EJECUCION', start: '2026-10-01', end: '2026-12-05' },
  { id: 'comp-4', code: '4.', name: 'GESTIÓN DE CONTRATOS PARA EL SERVICIO DE DISTRIBUCIÓN DE UGEL A II.EE.', faseId: 'FASE-PLANIFICACION', start: '2026-09-20', end: '2027-01-15' },
  { id: 'comp-5', code: '5.', name: 'REGISTRO DE PERSONAL DE APOYO PARA LA RECEPCIÓN EN II.EE. (PERÍODO VACACIONAL)', faseId: 'FASE-PLANIFICACION', start: '2026-11-15', end: '2027-01-10' },
  { id: 'comp-6', code: '6.', name: 'DESPACHO DE ME DE UGEL A LAS II.EE.', faseId: 'FASE-EJECUCION', start: '2026-11-01', end: '2027-02-28' },
  { id: 'comp-7', code: '7.', name: 'RECEPCIÓN DE ME EN LA IE', faseId: 'FASE-EJECUCION', start: '2027-01-05', end: '2027-03-05' },
  { id: 'comp-8', code: '8.', name: 'CONFORMIDAD DE ENTREGA DE ME A LAS II.EE. A CARGO DE LA UGEL', faseId: 'FASE-EJECUCION', start: '2027-01-20', end: '2027-03-15' },
  { id: 'comp-9', code: '9.', name: 'ENTREGA DE ME A BENEFICIARIOS Y REGISTRO EN EL MÓDULO MATERIALES SIAGIE', faseId: 'FASE-EJECUCION', start: '2027-03-01', end: '2027-03-31' },
  { id: 'comp-10', code: '10.', name: 'REDISTRIBUCIÓN Y DISTRIBUCIÓN LOCAL DE ME PARA ALCANZAR SUFICIENCIA', faseId: 'FASE-EJECUCION', start: '2027-03-15', end: '2027-04-30' },
  { id: 'comp-11', code: '11.', name: 'BALANCE Y CIERRE DEL PROCESO DE DISTRIBUCIÓN Y REDISTRIBUCIÓN', faseId: 'FASE-CIERRE', start: '2027-04-01', end: '2027-05-30' },
];

/**
 * Genera el catálogo territorial estructurado en 3 niveles jerárquicos:
 * - Nivel 1: Componentes Rectores (11 componentes).
 * - Nivel 2: DRE / GRE Sedes Regionales Matrices (hijas del componente, colapsadas por defecto).
 * - Nivel 3: UGELs Locales (hijas de cada DRE, ocultas dentro del desplegable de cada DRE).
 */
function generateTerritorialHierarchy(): SedeEdtItem[] {
  const result: SedeEdtItem[] = [];

  // 1. Agrupar unidades por región identificando su sede matriz (DRE o GRE) y sus UGELs
  interface RegionData {
    dre: (typeof MINEDU_UNIDADES)[number] | null;
    ugels: Array<(typeof MINEDU_UNIDADES)[number]>;
  }
  const regionMap: Record<string, RegionData> = {};

  MINEDU_UNIDADES.forEach((u) => {
    const reg = u.region || 'OTRA';
    const current = regionMap[reg] || (regionMap[reg] = { dre: null, ugels: [] });
    const isMatrix = u.unitType === 'dre' || u.name.startsWith('DRE') || u.name.startsWith('GRE');
    if (isMatrix && !current.dre) {
      current.dre = u;
    } else {
      current.ugels.push(u);
    }
  });

  // 2. Construir nodos territoriales para cada uno de los 11 componentes
  OFFICIAL_COMPONENTS_META.forEach((comp, cIdx) => {
    let rIdx = 0;

    Object.entries(regionMap).forEach(([regKey, data]) => {
      const dre = data.dre;
      if (!dre) return;

      const normReg = normalizeRegionName(regKey);
      const gestor =
        regKey === 'JUNÍN'
          ? getJuninGestor(dre.name)
          : REGION_GESTORES[regKey] || 'Gestor Territorial';
      const dreNodeId = `${comp.id}-dre-${regionToSlug(regKey)}`;

      // Nivel 2: Sede Regional Matriz (DRE/GRE), hija directa del componente
      result.push({
        id: dreNodeId,
        code: '', // Sin numeración artificial
        name: `${dre.name} (Sede Regional Matriz)`,
        edtType: 'PRODUCTO',
        kind: 'subproceso',
        faseId: comp.faseId,
        parentId: comp.id, // Hija del componente
        subprocesoGroup: 'Seguimiento Territorial',
        start: comp.start,
        end: comp.end,
        entidadResponsable: 'DRE',
        entregableVerificable: `Seguimiento territorial de ${comp.name} - ${dre.name}`,
        region: normReg,
        gestor: gestor,
        progress: 50,
        status: 'En proceso',
      });

      // Nivel 3: UGELs locales, hijas directas de la DRE (ocultas en su desplegable)
      data.ugels.forEach((ugel, uIdx) => {
        const mod = (uIdx + rIdx + cIdx) % 5;
        let progress = 50;
        let status: SedeEdtItem['status'] = 'En proceso';
        if (mod === 0) { progress = 100; status = 'Cumple'; }
        else if (mod === 1) { progress = 85; status = 'En proceso'; }
        else if (mod === 2) { progress = 30; status = 'Con retraso'; }
        else if (mod === 3) { progress = 0; status = 'Pendiente'; }
        else { progress = 70; status = 'En proceso'; }

        const ugelGestor = regKey === 'JUNÍN' ? getJuninGestor(ugel.name) : gestor;

        result.push({
          id: `${comp.id}-${ugel.id}`,
          code: '', // Sin numeración artificial
          name: ugel.name,
          edtType: 'PAQUETE_TRABAJO',
          kind: 'subproceso',
          faseId: comp.faseId,
          parentId: dreNodeId, // ¡Hija de su DRE regional!
          subprocesoGroup: 'Distribución Local',
          start: comp.start,
          end: comp.end,
          entidadResponsable: 'UGEL',
          entregableVerificable: `Entregable operativo verificado - ${ugel.name}`,
          region: normReg,
          gestor: ugelGestor,
          progress: progress,
          status: status,
        });
      });

      rIdx++;
    });
  });

  return result;
}

export const ALL_SEDES_EDT_ITEMS: SedeEdtItem[] = generateTerritorialHierarchy();
