export type DirectionId = 'DEI' | 'DEP' | 'DISER' | 'DEBA' | 'DEBE' | 'DES';

export interface Casuistica {
  id: string;
  number: string;
  title: string;
  criterioTitle: string;
  criterioDesc: string;
  desarrollo: string;
  accion: string;
  solucion: string;
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
