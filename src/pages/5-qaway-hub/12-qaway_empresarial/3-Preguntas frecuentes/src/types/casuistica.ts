export type DirectionId = 'DEI' | 'DEP' | 'DISER' | 'DEBA' | 'DEBE' | 'DES' | 'DEIB';

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
