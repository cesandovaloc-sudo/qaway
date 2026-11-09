import type { OfficialEdtReferenceRow } from './edtPmbokModel';
import { MINEDU_UNIDADES } from '../../data/mineduUnidades';

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

function getDeterministicProgress(
  index: number,
  offset: number = 0
): { progress: number; status: 'Cumple' | 'En proceso' | 'Con retraso' | 'Pendiente' } {
  const mod = (index + offset) % 12;
  switch (mod) {
    case 0:
      return { progress: 100, status: 'Cumple' };
    case 1:
      return { progress: 85, status: 'En proceso' };
    case 2:
      return { progress: 100, status: 'Cumple' };
    case 3:
      return { progress: 70, status: 'En proceso' };
    case 4:
      return { progress: 30, status: 'Con retraso' };
    case 5:
      return { progress: 50, status: 'En proceso' };
    case 6:
      return { progress: 100, status: 'Cumple' };
    case 7:
      return { progress: 20, status: 'Con retraso' };
    case 8:
      return { progress: 65, status: 'En proceso' };
    case 9:
      return { progress: 0, status: 'Pendiente' };
    case 10:
      return { progress: 90, status: 'En proceso' };
    case 11:
      return { progress: 0, status: 'Pendiente' };
    default:
      return { progress: 50, status: 'En proceso' };
  }
}

interface OperationalProductConfig {
  id: string;
  code: string;
  name: string;
  scope: 'dre' | 'ugel' | 'all';
  start: string;
  end: string;
  deliverableName: string;
}

const OPERATIONAL_PRODUCTS_CONFIG: OperationalProductConfig[] = [
  // COMPONENTE 1: PLANIFICACIÓN DE LA DISTRIBUCIÓN
  { id: 'pt-1.1', code: '1.1', name: 'Conformación del Comité Regional para el Seguimiento y Monitoreo a la distribución del ME', scope: 'dre', start: '2026-09-04', end: '2026-09-25', deliverableName: 'Resolución Directoral Regional de conformación del Comité' },
  { id: 'pt-1.2', code: '1.2', name: 'Conformación del Comité de Distribución de ME en las UGEL', scope: 'ugel', start: '2026-09-04', end: '2026-09-25', deliverableName: 'Resolución Directoral UGEL de conformación del Comité Local' },
  { id: 'pt-1.3', code: '1.3', name: 'Elaboración y aprobación del Plan de Monitoreo Regional de la Distribución', scope: 'dre', start: '2026-09-04', end: '2026-09-25', deliverableName: 'Resolución Directoral y Plan de Monitoreo Regional aprobado' },
  { id: 'pt-1.4', code: '1.4', name: 'Elaboración y aprobación del Plan de Distribución Local en las UGEL', scope: 'ugel', start: '2026-09-04', end: '2026-09-25', deliverableName: 'Resolución Directoral y Plan de Distribución Local aprobado' },
  { id: 'pt-1.5', code: '1.5', name: 'Solicitud de habilitación de códigos modulares en el MC SIGA', scope: 'ugel', start: '2026-09-04', end: '2026-09-14', deliverableName: 'Oficio de solicitud de habilitación de códigos modulares' },
  { id: 'pt-1.6', code: '1.6', name: 'Elaboración, revisión, validación y actualización del Cuadro de Distribución Local (CDL) en MC SIGA', scope: 'all', start: '2026-09-30', end: '2026-10-20', deliverableName: 'Cuadro de Distribución Local registrado y validado en MC SIGA' },

  // COMPONENTE 2: GESTIÓN DE ALMACENES
  { id: 'pt-2.1', code: '2.1', name: 'Habilitación y acondicionamiento de almacenes o centros de acopio temporal', scope: 'all', start: '2026-09-04', end: '2026-10-05', deliverableName: 'Ficha de inspección técnica y verificación de almacén aprobada' },
  { id: 'pt-2.2', code: '2.2', name: 'Comunicación oficial del directorio de almacenes y responsables a MINEDU', scope: 'all', start: '2026-09-15', end: '2026-10-15', deliverableName: 'Directorio institucional validado de almacenes y jefes de almacén' },

  // COMPONENTE 3: RECEPCIÓN DE MATERIAL EDUCATIVO EN DRE / UGEL
  { id: 'pt-3.1', code: '3.1', name: 'Carga de archivos RAR en el MC SIGA para la generación de NEA', scope: 'all', start: '2026-10-01', end: '2026-11-15', deliverableName: 'Reporte de carga de archivos RAR en MC SIGA sin inconsistencias' },
  { id: 'pt-3.2', code: '3.2', name: 'Verificación física de llegada del ME a almacén UGEL', scope: 'all', start: '2026-10-10', end: '2026-11-30', deliverableName: 'Acta de verificación física y conformidad de recepción en almacén' },
  { id: 'pt-3.3', code: '3.3', name: 'Registro inmediato de las Notas de Entrada de Almacén (NEA) en MC SIGA', scope: 'all', start: '2026-10-15', end: '2026-12-05', deliverableName: 'Notas de Entrada de Almacén (NEA) generadas y firmadas en SIGA' },

  // COMPONENTE 4: GESTIÓN DE CONTRATOS PARA EL SERVICIO DE DISTRIBUCIÓN DE UGEL A II.EE.
  { id: 'pt-4.2', code: '4.2', name: 'Procedimiento de selección / contratación del servicio de distribución a II.EE.', scope: 'ugel', start: '2026-09-20', end: '2026-11-10', deliverableName: 'Contrato suscrito y orden de servicio con empresa transportista' },
  { id: 'pt-4.3', code: '4.3', name: 'Registro oportuno de contratos del servicio de distribución en MC SIGA', scope: 'ugel', start: '2026-10-05', end: '2026-11-20', deliverableName: 'Registro contractual formalizado y cronograma de despacho en SIGA' },
  { id: 'pt-4.4', code: '4.4', name: 'Ejecución contractual, supervisión de rutas y cumplimiento de plazos de entrega', scope: 'ugel', start: '2026-11-01', end: '2027-01-15', deliverableName: 'Informes de supervisión en ruta y actas de monitoreo de transporte' },

  // COMPONENTE 5: REGISTRO DE PERSONAL DE APOYO PARA LA RECEPCIÓN EN II.EE.
  { id: 'pt-5.2', code: '5.2', name: 'Emisión de Resolución Directoral de reconocimiento de directores y personal de apoyo', scope: 'ugel', start: '2026-11-15', end: '2026-12-20', deliverableName: 'Resolución Directoral de reconocimiento formal del personal de apoyo' },
  { id: 'pt-5.4', code: '5.4', name: 'Registro en el MC SIGA del personal de apoyo para la recepción en II.EE.', scope: 'ugel', start: '2026-12-01', end: '2027-01-10', deliverableName: 'Padrón nominal del personal de apoyo cargado y habilitado en MC SIGA' },

  // COMPONENTE 6: DESPACHO DE ME DE UGEL A LAS II.EE.
  { id: 'pt-6.1', code: '6.1', name: 'Atención a nuevos servicios educativos (CM creados recientemente)', scope: 'ugel', start: '2026-11-01', end: '2027-01-20', deliverableName: 'Padrón de nuevos servicios educativos validados y atendidos con ME' },
  { id: 'pt-6.2', code: '6.2', name: 'Generación y emisión de PECOSA mediante el MC SIGA por cada IE', scope: 'ugel', start: '2026-11-15', end: '2027-02-10', deliverableName: 'PECOSAs oficiales generadas, suscritas y archivadas en MC SIGA' },
  { id: 'pt-6.3', code: '6.3', name: 'Modulado, embalaje y rotulado del ME según criterios técnicos de embalaje', scope: 'ugel', start: '2026-11-20', end: '2027-02-15', deliverableName: 'Kits pedagógicos por IE modulados, embalados y rotulados conforme a norma' },
  { id: 'pt-6.4', code: '6.4', name: 'Orientaciones e inducción al proveedor del servicio sobre protocolo de entrega', scope: 'ugel', start: '2026-12-01', end: '2027-01-15', deliverableName: 'Acta de inducción y protocolo de entrega suscrito con el transportista' },
  { id: 'pt-6.5', code: '6.5', name: 'Comunicación y difusión a las II.EE. y comunidad educativa sobre cronograma de llegada', scope: 'ugel', start: '2026-12-01', end: '2027-02-28', deliverableName: 'Oficios circulares y canales digitales de difusión comunitaria acreditados' },

  // COMPONENTE 7: RECEPCIÓN DE ME EN LA IE
  { id: 'pt-7.1', code: '7.1', name: 'Recepción física, verificación y suscripción de PECOSA por el Director o responsable de IE', scope: 'ugel', start: '2027-01-05', end: '2027-02-28', deliverableName: 'PECOSAs originales suscritas y selladas por el Director de IE' },
  { id: 'pt-7.2', code: '7.2', name: 'Tratamiento, formulación y reporte de Actas de Inconsistencia cuando corresponda', scope: 'ugel', start: '2027-01-10', end: '2027-03-05', deliverableName: 'Actas de inconsistencia formuladas, procesadas y cargadas en el sistema' },

  // COMPONENTE 8: CONFORMIDAD DE ENTREGA DE ME A LAS II.EE. A CARGO DE LA UGEL
  { id: 'pt-8.1', code: '8.1', name: 'Verificación y control de firmas de PECOSAs de retorno', scope: 'ugel', start: '2027-01-20', end: '2027-03-10', deliverableName: 'Cuadro de control y archivo digitalizado de PECOSAs de retorno' },
  { id: 'pt-8.2', code: '8.2', name: 'Registro sistemático y progresivo de la conformidad en el MC SIGA', scope: 'ugel', start: '2027-02-01', end: '2027-03-15', deliverableName: 'Conformidades de recepción registradas al 100% en MC SIGA' },

  // COMPONENTE 9: ENTREGA DE ME A BENEFICIARIOS Y REGISTRO EN EL MÓDULO MATERIALES SIAGIE
  { id: 'pt-9.3', code: '9.3', name: 'Entrega efectiva de cuadernos y textos a beneficiarios (estudiantes)', scope: 'ugel', start: '2027-03-01', end: '2027-03-31', deliverableName: 'Padrones nominales de entrega de textos firmados por padres y tutores' },

  // COMPONENTE 10: REDISTRIBUCIÓN Y DISTRIBUCIÓN LOCAL DE ME PARA ALCANZAR SUFICIENCIA
  { id: 'pt-10.1', code: '10.1', name: 'Cálculo y validación del cuadro de déficit y excedente por IE', scope: 'ugel', start: '2027-03-15', end: '2027-04-15', deliverableName: 'Cuadro consolidado de balance de materiales, déficit y superávit por IE' },
  { id: 'pt-10.4', code: '10.4', name: 'Redistribución Regional inter-UGEL mediante generación de PECOSAs', scope: 'ugel', start: '2027-03-25', end: '2027-04-30', deliverableName: 'PECOSAs de redistribución interinstitucional emitidas y material trasladado' },

  // COMPONENTE 11: BALANCE Y CIERRE DEL PROCESO DE DISTRIBUCIÓN Y REDISTRIBUCIÓN
  { id: 'pt-11.1', code: '11.1', name: 'Balance general y evaluación de lecciones aprendidas del proceso', scope: 'all', start: '2027-04-01', end: '2027-05-15', deliverableName: 'Informe evaluativo regional y matriz de lecciones aprendidas' },
  { id: 'pt-11.2', code: '11.2', name: 'Elaboración y remisión del Informe Final de Cierre a MINEDU-DIGERE', scope: 'all', start: '2027-04-15', end: '2027-05-30', deliverableName: 'Informe Final de Cierre elevado formalmente a DIGERE con oficio' },
];

function generateAllSedesItems(): SedeEdtItem[] {
  const result: SedeEdtItem[] = [];

  OPERATIONAL_PRODUCTS_CONFIG.forEach((prod, pIdx) => {
    const applicableUnits = MINEDU_UNIDADES.filter((u) => {
      if (prod.scope === 'dre') return u.unitType === 'dre';
      if (prod.scope === 'ugel') return u.unitType === 'ugel';
      return true; // 'all'
    });

    applicableUnits.forEach((u, uIdx) => {
      const regUpper = (u.region || '').toUpperCase();
      const gestor =
        regUpper === 'JUNÍN'
          ? getJuninGestor(u.name)
          : REGION_GESTORES[regUpper] || 'Gestor Territorial';
      const normReg = normalizeRegionName(regUpper);
      const metric = getDeterministicProgress(uIdx, pIdx * 3);

      result.push({
        id: `${prod.id}-${u.id}`,
        code: '', // Limpio, sin numeraciones artificiales como .153
        name: u.name,
        edtType: 'PAQUETE_TRABAJO',
        kind: 'subproceso',
        faseId: 'FASE-PLANIFICACION',
        parentId: prod.id,
        subprocesoGroup: 'Planificación',
        start: prod.start,
        end: prod.end,
        entidadResponsable: u.unitType === 'dre' ? 'DRE' : 'UGEL',
        entregableVerificable: `${prod.deliverableName} - ${u.name}`,
        region: normReg,
        gestor: gestor,
        progress: metric.progress,
        status: metric.status,
      });
    });
  });

  return result;
}

export const ALL_SEDES_EDT_ITEMS: SedeEdtItem[] = generateAllSedesItems();
