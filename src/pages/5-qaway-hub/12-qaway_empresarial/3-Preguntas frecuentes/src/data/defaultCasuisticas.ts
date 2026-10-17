import { DirectionData } from '../types/casuistica';

export const DEFAULT_DIRECTIONS_DATA: DirectionData[] = [
  {
    id: 'DEI',
    code: 'DEI',
    name: 'Ed. Inicial',
    cases: [
      {
        id: 'dei-01',
        number: '01',
        title: 'Material asignado que no corresponde a la característica del servicio',
        criterioTitle: 'Pertinencia',
        criterioDesc: 'El material debe corresponder a la característica del servicio educativo.',
        desarrollo: 'Se asignó material de inicial ciclo II a una IE que atiende ciclo I, generando inconsistencias con la población matriculada.',
        accion: 'Verificar el nivel y ciclo de atención de la IE y solicitar el reajuste de materiales según corresponda.',
        solucion: 'Procede el reajuste con el material correspondiente al ciclo de atención registrado en el SIAGIE.',
        isOpen: false
      },
      {
        id: 'dei-02',
        number: '02',
        title: 'Cantidad de materiales menor a la matrícula atendida',
        criterioTitle: 'Suficiencia / Cobertura',
        criterioDesc: 'La dotación debe cubrir el 100% de niños y niñas matriculados en el aula.',
        desarrollo: 'La IE recibió cuadernos de trabajo en una cantidad inferior a los estudiantes registrados en las nóminas vigentes del ciclo II.',
        accion: 'Identificar la brecha en el acta de recepción y reportar el déficit al especialista de material educativo de la UGEL.',
        solucion: 'Redistribución de excedentes disponibles en el almacén de la UGEL o modulación entre II.EE. cercanas de la jurisdicción.',
        isOpen: false
      }
    ]
  },
  {
    id: 'DEP',
    code: 'DEP',
    name: 'Ed. Primaria',
    cases: [
      {
        id: 'dep-01',
        number: '01',
        title: 'Cuadernos de trabajo entregados en grado distinto al solicitado',
        criterioTitle: 'Concordancia de grado',
        criterioDesc: 'El material distribuido debe coincidir con la matrícula por grado del nivel primaria.',
        desarrollo: 'Durante el monitoreo se detectaron paquetes de 4.° grado entregados en secciones multigrado que únicamente atienden de 1.° a 3.° grado.',
        accion: 'Registrar la observación en el sistema de seguimiento y coordinar con el área de Abastecimiento de la UGEL el recojo y canje.',
        solucion: 'Reasignación inmediata mediante pecosa complementaria con cargo al stock de contingencia de la UGEL.',
        isOpen: false
      },
      {
        id: 'dep-02',
        number: '02',
        title: 'Retraso en la recepción de bibliotecas de aula para el III ciclo',
        criterioTitle: 'Oportunidad',
        criterioDesc: 'Los materiales deben encontrarse en la IE antes del inicio o durante el primer bimestre escolar.',
        desarrollo: 'La ruta de transporte programada presentó incidencias climáticas, postergando la llegada de los módulos de lectura a 5 II.EE.',
        accion: 'Reprogramar la ruta priorizada en coordinación con el transportista y notificar al director de la IE la nueva fecha de entrega.',
        solucion: 'Suscripción del acta de entrega reprogramada y actualización del estado de recepción en el módulo SIGA.',
        isOpen: false
      },
      {
        id: 'dep-03',
        number: '03',
        title: 'Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?',
        criterioTitle: 'Pertinencia y suficiencia',
        criterioDesc: 'En el marco del numeral 1.6 «Elaboración del Cuadro de Distribución Local en el MC SIGA», la dotación de materiales educativos debe responder a la característica de servicio validada en el padrón oficial.',
        desarrollo: 'La UGEL identifica una institución educativa que ha cambiado de característica o modalidad en su servicio (ej. multigrado a polidocente completo, o primaria regular a servicio rural/EIB). Se consulta qué dirección pedagógica (DEP o DISER) debe asumir la dotación y asignación de materiales educativos en el MC SIGA.',
        accion: 'Verificar el reporte actualizado en SIAGIE y coordinar entre especialistas de DEP y DISER para validar la matrícula real y la nómina oficial antes de la emisión de la pecosa.',
        solucion: 'Corresponde a la dirección pedagógica que atiende la nueva característica validada en el padrón oficial MINEDU. La UGEL emite el informe técnico y efectúa la reasignación en el MC SIGA.',
        isOpen: false
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
        title: 'Material EIB asignado en lengua originaria distinta a la de la comunidad',
        criterioTitle: 'Pertinencia lingüística',
        criterioDesc: 'Los cuadernos EIB deben corresponder a la lengua originaria y variante registrada en el RNIIEE-EIB.',
        desarrollo: 'Una IE bilingüe de revitalización cultural recibió cuadernos en variante quechua chanka cuando su registro corresponde a quechua collao.',
        accion: 'Contrastación con el padrón EIB vigente y comunicación inmediata con el especialista EIB de la UGEL.',
        solucion: 'Transferencia de material adecuado desde el lote de reserva regional y actualización de la caracterización lingüística.',
        isOpen: false
      },
      {
        id: 'diser-02',
        number: '02',
        title: 'Fichas de autoaprendizaje incompletas para aulas multigrado monolingües',
        criterioTitle: 'Integralidad del módulo',
        criterioDesc: 'El kit rural multigrado requiere guías docentes y fichas para todas las edades agrupadas.',
        desarrollo: 'Se evidenció la llegada de fichas de Matemática sin sus respectivas guías metodológicas para el docente rural.',
        accion: 'Facilitar temporalmente el repositorio digital oficial y gestionar el envío físico de los ejemplares faltantes.',
        solucion: 'Entrega complementaria en el siguiente tramo de distribución rural y descarga asistida de guías en tableta.',
        isOpen: false
      },
      {
        id: 'diser-03',
        number: '03',
        title: 'Cambio de característica de una IE a servicio rural o EIB: asignación de materiales en MC SIGA',
        criterioTitle: 'Pertinencia y suficiencia',
        criterioDesc: 'En el marco del numeral 1.6 «Elaboración del Cuadro de Distribución Local en el MC SIGA», la dotación de materiales educativos debe responder a la característica de servicio validada en el padrón oficial.',
        desarrollo: 'La UGEL identifica una institución educativa que ha transitado a servicio educativo rural o EIB. Se consulta el procedimiento de asignación entre DEP y DISER en el MC SIGA.',
        accion: 'Contrastar con el padrón RIE/RNIIEE-EIB y coordinar entre especialistas de DEP y DISER para conciliar la nómina oficial en SIAGIE.',
        solucion: 'Corresponde a DISER asumir la dotación de los materiales pertinentes a la nueva característica. La UGEL formaliza la reasignación en el MC SIGA según el numeral 1.6.',
        isOpen: false
      }
    ]
  },
  {
    id: 'DEBA',
    code: 'DEBA',
    name: 'Básica Alternativa',
    cases: [
      {
        id: 'deba-01',
        number: '01',
        title: 'Portafolios y textos del ciclo avanzado sin entrega en periféricos del CEBA',
        criterioTitle: 'Alcance de atención',
        criterioDesc: 'El material debe llegar tanto a la sede central del CEBA como a sus aulas periféricas autorizadas.',
        desarrollo: 'El material permaneció almacenado en la sede central del CEBA sin distribuirse a los dos centros periféricos de turno nocturno.',
        accion: 'Orientar al director del CEBA sobre el cronograma interno de reparto y verificar las actas de entrega a los docentes responsables.',
        solucion: 'Distribución interna validada mediante acta firmada por los coordinadores de aulas periféricas.',
        isOpen: false
      },
      {
        id: 'deba-02',
        number: '02',
        title: 'Variación de matrícula por periodos promocionales semestrales',
        criterioTitle: 'Flexibilidad de dotación',
        criterioDesc: 'La asignación debe prever la matrícula por periodos de atención propios de la modalidad EBA.',
        desarrollo: 'Incremento de estudiantes jóvenes y adultos en el segundo periodo promocional supera el stock inicial remitido.',
        accion: 'Consolidar el reporte de matrícula actualizada en SIAGIE y solicitar dotación adicional a la UGEL.',
        solucion: 'Asignación de módulos disponibles en el stock de reserva de la modalidad EBA.',
        isOpen: false
      }
    ]
  },
  {
    id: 'DEBE',
    code: 'DEBE',
    name: 'Básica Especial',
    cases: [
      {
        id: 'debe-01',
        number: '01',
        title: 'Material concreto adaptado pendiente de distribución a PRITE y CEBE',
        criterioTitle: 'Accesibilidad y adaptación',
        criterioDesc: 'Los recursos educativos deben responder a las necesidades educativas especiales asociadas a discapacidad.',
        desarrollo: 'Kits sensoriales y material en relieve llegaron al almacén de la UGEL pero no contaban con cuadro de distribución actualizado para el PRITE.',
        accion: 'Elaborar el cuadro de distribución junto con el especialista de EBE según la nómina de atención temprana.',
        solucion: 'Emisión de pecosas específicas y entrega priorizada a los centros de Educación Básica Especial.',
        isOpen: false
      },
      {
        id: 'debe-02',
        number: '02',
        title: 'Requerimiento de textos en formato macrotipo o sistema Braille para II.EE. inclusivas',
        criterioTitle: 'Inclusión educativa',
        criterioDesc: 'Los estudiantes incluidos en EBR con baja visión o ceguera requieren formatos accesibles oportunos.',
        desarrollo: 'Se identificó a dos estudiantes con discapacidad visual matriculados en EBR que aún no cuentan con material adaptado a su condición.',
        accion: 'Articular con el SAANEE y reportar el requerimiento nominal al equipo de materiales de la DRE/MINEDU.',
        solucion: 'Envío personalizado del paquete en sistema Braille y macrotipo a través del servicio de apoyo SAANEE.',
        isOpen: false
      }
    ]
  },
  {
    id: 'DES',
    code: 'DES',
    name: 'Ed. Secundaria',
    cases: [
      {
        id: 'des-01',
        number: '01',
        title: 'Desbalance de fichas de Matemática y Comunicación en 1.° y 2.° de secundaria',
        criterioTitle: 'Proporcionalidad por sección',
        criterioDesc: 'Cada estudiante de nivel secundaria debe contar con su ejemplar individual para el trabajo pedagógico.',
        desarrollo: 'Incremento de dos secciones adicionales en 1.° de secundaria generó un faltante de 60 ejemplares en la IE.',
        accion: 'Verificar la resolución de ampliación de secciones y contrastar con el padrón de modulación de la UGEL.',
        solucion: 'Atención del déficit con el saldo de contingencia de la UGEL y registro en el aplicativo de monitoreo.',
        isOpen: false
      },
      {
        id: 'des-02',
        number: '02',
        title: 'Módulos de laboratorio de Ciencia y Tecnología sin recepción conforme en modelos JEC',
        criterioTitle: 'Conformidad técnica',
        criterioDesc: 'La recepción de equipamiento y material pedagógico requiere verificación de componentes completos.',
        desarrollo: 'El director de la IE JEC reportó cajas con precinto observado antes de la firma de la pecosa correspondiente.',
        accion: 'Levantar acta de verificación conjunta entre el responsable de almacén de la IE y el representante de la UGEL.',
        solucion: 'Reposición de los insumos observados por parte del proveedor dentro del plazo de garantía contractual.',
        isOpen: false
      }
    ]
  }
];
