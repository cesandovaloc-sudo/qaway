export type DirectionId = 'DEI' | 'DEP' | 'DISER' | 'DEBA' | 'DEBE' | 'DES' | 'DEIB';

export type EducationalLevel = 'Inicial' | 'Primaria' | 'Secundaria' | 'Transversal';

export type CommonCategory =
  | 'DEP – DISER'
  | 'DEIB – DISER'
  | 'Banco de Libros'
  | 'Lenguas Originarias'
  | 'Bibliotecas y Fungibles'
  | 'Matrícula y Traslados'
  | 'General';

export interface Casuistica {
  id: string;
  number: string;
  title: string;
  criterioTitle: string;
  criterioDesc: string;
  desarrollo: string;
  solucion: string;
  ejemplo: string;
  normativa?: string;
  accion?: string;
  casoEspecifico?: string;
  isOpen?: boolean;
  nivel?: EducationalLevel;
  categoriaComun?: CommonCategory;
}

export interface DirectionData {
  id: DirectionId;
  code: string;
  name: string;
  cases: Casuistica[];
}

export interface ScoredCasuistica extends Casuistica {
  dirId: DirectionId;
  dirCode: string;
  dirName: string;
  score: number;
}
