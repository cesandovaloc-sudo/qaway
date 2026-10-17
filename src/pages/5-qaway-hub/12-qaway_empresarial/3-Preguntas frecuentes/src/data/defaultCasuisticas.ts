import { DirectionData, Casuistica } from '../types/casuistica';
import rawCases from './casuisticas_veedores_2026-09-28.json';

const ALL_PARSED_CASES: Casuistica[] = (rawCases as any[]).map((c) => ({
  id: c.id,
  number: c.number,
  title: c.title,
  criterioTitle: c.criterioTitle,
  criterioDesc: c.criterioDesc,
  desarrollo: c.desarrollo,
  solucion: c.solucion,
  ejemplo: c.ejemplo,
  normativa: c.normativa || '',
  accion: c.accion || '',
  casoEspecifico: c.casoEspecifico || '',
  isOpen: false
}));

// Clasificación oficial de las 52 casuísticas por Dirección Pedagógica
const DEI_NUMBERS = new Set(['01', '06', '07', '12', '13']);
const DEP_NUMBERS = new Set(['11', '16', '19', '20', '23', '27', '35', '40', '52']);
const DES_NUMBERS = new Set(['14', '15', '17', '18', '21', '31', '38']);
const DISER_NUMBERS = new Set(['08', '32', '33', '34', '36', '37', '39', '42', '43', '44', '45']);
const DEBE_NUMBERS = new Set(['02', '04', '10']);
const DEIB_NUMBERS = new Set([
  '03',
  '05',
  '09',
  '22',
  '24',
  '25',
  '26',
  '28',
  '29',
  '30',
  '41',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51'
]);

export const DEFAULT_DIRECTIONS_DATA: DirectionData[] = [
  {
    id: 'DEI',
    code: 'DEI',
    name: 'Ed. Inicial',
    cases: ALL_PARSED_CASES.filter((c) => DEI_NUMBERS.has(c.number))
  },
  {
    id: 'DEP',
    code: 'DEP',
    name: 'Ed. Primaria',
    cases: [
      {
        id: 'dep-01',
        number: '00',
        title: 'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?',
        criterioTitle: 'DEP – DISER',
        criterioDesc: 'Asignación de materiales educativos por cambio de característica de la institución educativa en el MC SIGA.',
        desarrollo: 'La UGEL identifica una institución educativa que ha cambiado de característica (ya envió la solicitud de habilitación de códigos modulares) y tiene dudas sobre a qué dirección debe asignar los materiales educativos: si debe considerar la característica registrada por el MINEDU o la información actualizada que maneja la UGEL.',
        solucion: 'La UGEL debe verificar la característica actual que corresponde a la institución educativa y efectuar la asignación de materiales según corresponda. Al finalizar, en el MC SIGA, solo debe quedar asignado el material correspondiente a dicha institución educativa.',
        ejemplo: 'Por ejemplo, un mismo código modular no puede tener asignados materiales educativos de DEP y DISER a la vez. Asimismo, se debe verificar que la reasignación de los recursos no deje desabastecidas a las II. EE. que anteriormente tenían otra característica.',
        normativa: 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.\nOficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Orientaciones para el monitoreo y asignación de materiales en el MC SIGA según característica de la IE.',
        accion: '',
        casoEspecifico: '',
        isOpen: false
      },
      ...ALL_PARSED_CASES.filter((c) => DEP_NUMBERS.has(c.number))
    ]
  },
  {
    id: 'DES',
    code: 'DES',
    name: 'Ed. Secundaria',
    cases: ALL_PARSED_CASES.filter((c) => DES_NUMBERS.has(c.number))
  },
  {
    id: 'DISER',
    code: 'DISER',
    name: 'Servicios Rurales',
    cases: [
      {
        id: 'diser-01',
        number: '00',
        title: 'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?',
        criterioTitle: 'DEP – DISER',
        criterioDesc: 'Asignación de materiales educativos por cambio de característica de la institución educativa en el MC SIGA.',
        desarrollo: 'La UGEL identifica una institución educativa que ha cambiado de característica (ya envió la solicitud de habilitación de códigos modulares) y tiene dudas sobre a qué dirección debe asignar los materiales educativos: si debe considerar la característica registrada por el MINEDU o la información actualizada que maneja la UGEL.',
        solucion: 'La UGEL debe verificar la característica actual que corresponde a la institución educativa y efectuar la asignación de materiales según corresponda. Al finalizar, en el MC SIGA, solo debe quedar asignado el material correspondiente a dicha institución educativa.',
        ejemplo: 'Por ejemplo, un mismo código modular no puede tener asignados materiales educativos de DEP y DISER a la vez. Asimismo, se debe verificar que la reasignación de los recursos no deje desabastecidas a las II. EE. que anteriormente tenían otra característica.',
        normativa: 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.\nOficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Orientaciones para el monitoreo y asignación de materiales en el MC SIGA según característica de la IE.',
        accion: '',
        casoEspecifico: '',
        isOpen: false
      },
      ...ALL_PARSED_CASES.filter((c) => DISER_NUMBERS.has(c.number))
    ]
  },
  {
    id: 'DEIB',
    code: 'DEIB',
    name: 'Intercultural Bilingüe',
    cases: ALL_PARSED_CASES.filter((c) => DEIB_NUMBERS.has(c.number))
  },
  {
    id: 'DEBE',
    code: 'DEBE',
    name: 'Básica Especial',
    cases: ALL_PARSED_CASES.filter((c) => DEBE_NUMBERS.has(c.number))
  },
  {
    id: 'DEBA',
    code: 'DEBA',
    name: 'Básica Alternativa',
    cases: []
  }
];
