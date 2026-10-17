import { DirectionData, Casuistica } from '../types/casuistica';
import rawDeiCases from './casuisticas_veedores_2026-09-28.json';

const DEI_CASES: Casuistica[] = (rawDeiCases as any[]).map((c) => ({
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

export const DEFAULT_DIRECTIONS_DATA: DirectionData[] = [
  {
    id: 'DEI',
    code: 'DEI',
    name: 'Ed. Inicial',
    cases: DEI_CASES
  },
  {
    id: 'DEP',
    code: 'DEP',
    name: 'Ed. Primaria',
    cases: [
      {
        id: 'dep-01',
        number: '01',
        title: 'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?',
        criterioTitle: 'DEP – DISER',
        criterioDesc: 'Asignación de materiales educativos por cambio de característica de la institución educativa en el MC SIGA.',
        desarrollo: 'La UGEL identifica una institución educativa que ha cambiado de característica (ya envió la solicitud de habilitación de códigos modulares) y tiene dudas sobre a qué dirección debe asignar los materiales educativos: si debe considerar la característica registrada por el MINEDU o la información actualizada que maneja la UGEL.',
        solucion: 'La UGEL debe verificar la característica actual que corresponde a la institución educativa y efectuar la asignación de materiales según corresponda. Al finalizar, en el MC SIGA, solo debe quedar asignado el material correspondiente a dicha institución educativa.',
        ejemplo: 'Por ejemplo, un mismo código modular no puede tener asignados materiales educativos de DEP y DISER a la vez. Asimismo, se debe verificar que la reasignación de los recursos no deje desabastecidas a las II. EE. que anteriormente tenían otra característica.',
        normativa: 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.\nOficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Orientaciones para el monitoreo y asignación de materiales en el MC SIGA según característica de la IE.',
        accion: '',
        casoEspecifico: '',
        isOpen: true
      }
    ]
  },
  {
    id: 'DISER',
    code: 'DISER',
    name: 'Servicios Rurales',
    cases: [
      {
        id: 'diser-01',
        number: '01',
        title: 'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?',
        criterioTitle: 'DEP – DISER',
        criterioDesc: 'Asignación de materiales educativos por cambio de característica de la institución educativa en el MC SIGA.',
        desarrollo: 'La UGEL identifica una institución educativa que ha cambiado de característica (ya envió la solicitud de habilitación de códigos modulares) y tiene dudas sobre a qué dirección debe asignar los materiales educativos: si debe considerar la característica registrada por el MINEDU o la información actualizada que maneja la UGEL.',
        solucion: 'La UGEL debe verificar la característica actual que corresponde a la institución educativa y efectuar la asignación de materiales según corresponda. Al finalizar, en el MC SIGA, solo debe quedar asignado el material correspondiente a dicha institución educativa.',
        ejemplo: 'Por ejemplo, un mismo código modular no puede tener asignados materiales educativos de DEP y DISER a la vez. Asimismo, se debe verificar que la reasignación de los recursos no deje desabastecidas a las II. EE. que anteriormente tenían otra característica.',
        normativa: 'RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.\nOficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Orientaciones para el monitoreo y asignación de materiales en el MC SIGA según característica de la IE.',
        accion: '',
        casoEspecifico: '',
        isOpen: true
      }
    ]
  },
  {
    id: 'DEBA',
    code: 'DEBA',
    name: 'Básica Alternativa',
    cases: []
  },
  {
    id: 'DEBE',
    code: 'DEBE',
    name: 'Básica Especial',
    cases: []
  },
  {
    id: 'DES',
    code: 'DES',
    name: 'Ed. Secundaria',
    cases: []
  }
];
