/**
 * Pruebas de jerarquía y plantillas (Etapa 1 · módulo Unidades y Organigrama).
 * Runner: vitest del workspace raíz (1-qawaylab-web), mismo patrón que
 * src/modules/equipo/organigrama/organigrama.test.ts. Sin dependencias nuevas.
 */
import { describe, expect, it } from 'vitest';
import {
  calcularNumeracion,
  detectarCiclos,
  detectarHuerfanos,
  type FallbackInsercion,
  type NodoJerarquia,
  type NumeracionNodo,
} from './organizacionJerarquia';
import {
  construirBorradoresPlantilla,
  construirDesdeCero,
  PLANTILLA_SECTOR_PRIVADO,
  PLANTILLA_SECTOR_PUBLICO,
  VERSION_PLANTILLAS,
} from './organizacionPlantillas';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const n = (id: string, parentUnitId: string | null, orden?: number | null): NodoJerarquia =>
  orden === undefined ? { id, parentUnitId } : { id, parentUnitId, orden };

function compararTexto(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function serializar(m: Map<string, NumeracionNodo>): string {
  return JSON.stringify([...m.entries()].sort((a, b) => compararTexto(a[0], b[0])));
}

/** PRNG con semilla: barajados reproducibles (nada de Math.random en el test). */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barajar<T>(origen: T[], rng: () => number): T[] {
  const arr = [...origen];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1)) % (i + 1);
    const temp = arr[i];
    const otro = arr[j];
    if (temp !== undefined && otro !== undefined) {
      arr[i] = otro;
      arr[j] = temp;
    }
  }
  return arr;
}

/** Espejo de runtime del enum GestorUnitType (gestorOrganizacionService.ts L3-12). */
const DOMINIO_UNIT_TYPE = [
  'central',
  'dre',
  'ugel',
  'obra',
  'jefatura',
  'tienda',
  'oficina',
  'departamento',
  'other',
];

// ---------------------------------------------------------------------------
// Numeración jerárquica determinista
// ---------------------------------------------------------------------------

describe('Numeración jerárquica (organizacionJerarquia)', () => {
  it('numera un bosque con múltiples raíces (1, 2, 3)', () => {
    const fallback: FallbackInsercion = new Map([
      ['r3', 0],
      ['r1', 1],
      ['r2', 2],
    ]);
    // A pesar del orden del arreglo y del fallback, `orden` explícito manda.
    const nodos = [n('r3', null, 3), n('r1', null, 1), n('r2', null, 2)];
    const res = calcularNumeracion(nodos, fallback);
    expect(res.get('r1')).toEqual({ ruta: '1', nivel: 1, posicionHermano: 1 });
    expect(res.get('r2')).toEqual({ ruta: '2', nivel: 1, posicionHermano: 2 });
    expect(res.get('r3')).toEqual({ ruta: '3', nivel: 1, posicionHermano: 3 });
  });

  it('numera varios niveles: 1, 1.1, 1.1.1, 1.1.1.1', () => {
    const nodos = [
      n('b1', 'n1'),
      n('n1', 'h1'),
      n('h1', 'r'),
      n('r', null),
    ];
    const res = calcularNumeracion(nodos);
    expect(res.get('r')).toEqual({ ruta: '1', nivel: 1, posicionHermano: 1 });
    expect(res.get('h1')).toEqual({ ruta: '1.1', nivel: 2, posicionHermano: 1 });
    expect(res.get('n1')).toEqual({ ruta: '1.1.1', nivel: 3, posicionHermano: 1 });
    expect(res.get('b1')).toEqual({ ruta: '1.1.1.1', nivel: 4, posicionHermano: 1 });
  });

  it('rompe empates de igual orden con el fallback de inserción', () => {
    const nodos = [
      n('h-a', 'p', 5),
      n('h-b', 'p', 5),
      n('p', null),
    ];
    const fbA: FallbackInsercion = new Map([
      ['h-a', 1],
      ['h-b', 0],
      ['p', 2],
    ]);
    const fbB: FallbackInsercion = new Map([
      ['h-a', 0],
      ['h-b', 1],
      ['p', 2],
    ]);
    expect(calcularNumeracion(nodos, fbA).get('h-b')?.ruta).toBe('1.1');
    expect(calcularNumeracion(nodos, fbA).get('h-a')?.ruta).toBe('1.2');
    expect(calcularNumeracion(nodos, fbB).get('h-a')?.ruta).toBe('1.1');
    expect(calcularNumeracion(nodos, fbB).get('h-b')?.ruta).toBe('1.2');
  });

  it('coloca los orden NULL al final (NULLS LAST) aunque el fallback los ponga primero', () => {
    const nodos = [
      n('h1', 'p', null), // sin orden
      n('h2', 'p', 2),
      n('h3', 'p', 1),
      n('p', null),
    ];
    const fallback: FallbackInsercion = new Map([
      ['h1', 0], // insertado primero, pero NULL → va al final
      ['h2', 1],
      ['h3', 2],
      ['p', 3],
    ]);
    const res = calcularNumeracion(nodos, fallback);
    expect(res.get('h3')?.ruta).toBe('1.1');
    expect(res.get('h2')?.ruta).toBe('1.2');
    expect(res.get('h1')?.ruta).toBe('1.3');
  });

  it('usa el desempate final por id (UTF-16) cuando no hay orden ni fallback', () => {
    const nodos = [n('u2', null), n('u10', null), n('u1', null)];
    const res = calcularNumeracion(nodos);
    // Lexicográfico por unidad de código: 'u1' < 'u10' < 'u2' (no numérico).
    expect(res.get('u1')?.ruta).toBe('1');
    expect(res.get('u10')?.ruta).toBe('2');
    expect(res.get('u2')?.ruta).toBe('3');
  });

  it('trata huérfanos como raíces y los lista en detectarHuerfanos', () => {
    const nodos = [
      n('r1', null),
      n('orfe1', 'no-existe'),
      n('hijo-orfe', 'orfe1'), // su padre existe (es el huérfano) → hijo normal
    ];
    expect(detectarHuerfanos(nodos)).toEqual(['orfe1']);
    const res = calcularNumeracion(nodos);
    // Sin orden ni fallback: raíces por id (UTF-16) → 'orfe1' < 'r1'.
    expect(res.get('orfe1')?.ruta).toBe('1'); // raíz por huérfano
    expect(res.get('orfe1')?.nivel).toBe(1);
    expect(res.get('r1')?.ruta).toBe('2');
    expect(res.get('hijo-orfe')?.ruta).toBe('1.1'); // hijo del huérfano (orfe1 = '1')
  });

  it('excluye ciclos: auto-padre, ciclo de 2 nodos y descendiente atrapado', () => {
    const nodos = [
      n('r1', null),
      n('r1a', 'r1'),
      n('x', 'x'), // auto-padre
      n('y', 'z'),
      n('z', 'y'), // ciclo de 2
      n('w', 'y'), // descendiente atrapado bajo el ciclo
    ];
    expect(detectarCiclos(nodos)).toEqual(['w', 'x', 'y', 'z']);
    expect(detectarHuerfanos(nodos)).toEqual([]);
    const res = calcularNumeracion(nodos);
    expect([...res.keys()].sort()).toEqual(['r1', 'r1a']);
    expect(res.get('r1')?.ruta).toBe('1');
    expect(res.get('r1a')?.ruta).toBe('1.1');
  });

  it('produce el mismo resultado con la entrada barajada (determinismo)', () => {
    const construir = (): NodoJerarquia[] => [
      n('a1', null, null),
      n('a2', null, 1),
      n('a3', null, null),
      n('b1', 'a1', 2),
      n('b2', 'a1', 2),
      n('c1', 'b1'),
      n('d1', 'a2'),
      n('orfe', 'fantasma'),
      n('x', 'y'),
      n('y', 'x'),
      n('z', 'y'),
    ];
    const fallback: FallbackInsercion = new Map([
      ['a1', 0],
      ['a2', 1],
      ['a3', 2],
      ['b1', 0],
      ['b2', 1],
      ['c1', 0],
      ['d1', 0],
      ['orfe', 3],
      ['x', 0],
      ['y', 1],
      ['z', 2],
    ]);

    const base = calcularNumeracion(construir(), fallback);
    const esperado = serializar(base);
    // Estructura esperada (raíces por orden/fallback; orfe como 4ª raíz).
    expect(esperado).toBe(
      JSON.stringify(
        Object.entries({
          a2: { ruta: '1', nivel: 1, posicionHermano: 1 },
          a1: { ruta: '2', nivel: 1, posicionHermano: 2 },
          a3: { ruta: '3', nivel: 1, posicionHermano: 3 },
          orfe: { ruta: '4', nivel: 1, posicionHermano: 4 },
          d1: { ruta: '1.1', nivel: 2, posicionHermano: 1 },
          b1: { ruta: '2.1', nivel: 2, posicionHermano: 1 },
          b2: { ruta: '2.2', nivel: 2, posicionHermano: 2 },
          c1: { ruta: '2.1.1', nivel: 3, posicionHermano: 1 },
        }).sort((a, b) => compararTexto(a[0], b[0])),
      ),
    );
    expect([...base.keys()].sort()).toEqual(
      ['a1', 'a2', 'a3', 'b1', 'b2', 'c1', 'd1', 'orfe'].sort(),
    );

    // 8 barajados con semilla + reversa + reversa doble: mismo Map siempre.
    for (let semilla = 1; semilla <= 8; semilla++) {
      const barajado = barajar(construir(), mulberry32(semilla));
      expect(serializar(calcularNumeracion(barajado, fallback))).toBe(esperado);
      expect(serializar(calcularNumeracion(barajado))).toBe(
        serializar(calcularNumeracion(construir())),
      );
    }
    const reversa = [...construir()].reverse();
    expect(serializar(calcularNumeracion(reversa, fallback))).toBe(esperado);
  });

  it('no muta la entrada y devuelve Map vacío ante entrada vacía', () => {
    const nodos = [n('r', null), n('h', 'r', 2), n('i', 'r', 1)];
    const copiaOrden = [...nodos];
    calcularNumeracion(nodos);
    expect(nodos.map((x) => x.id)).toEqual(copiaOrden.map((x) => x.id));
    expect(calcularNumeracion([]).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Plantillas organizacionales
// ---------------------------------------------------------------------------

describe('Plantillas organizacionales (organizacionPlantillas)', () => {
  it('expone público (14) y privado (15) con claves únicas y parentKey resuelto', () => {
    for (const defs of [PLANTILLA_SECTOR_PUBLICO, PLANTILLA_SECTOR_PRIVADO]) {
      const claves = new Set(defs.map((d) => d.key));
      expect(claves.size).toBe(defs.length);
      for (const def of defs) {
        expect(def.parentKey === null || claves.has(def.parentKey)).toBe(true);
      }
    }
    expect(PLANTILLA_SECTOR_PUBLICO).toHaveLength(14);
    expect(PLANTILLA_SECTOR_PRIVADO).toHaveLength(15);
  });

  it('usa solo unit_type del dominio existente (sin valores nuevos)', () => {
    const todos = [...PLANTILLA_SECTOR_PUBLICO, ...PLANTILLA_SECTOR_PRIVADO];
    for (const def of todos) {
      expect(DOMINIO_UNIT_TYPE).toContain(def.unitType);
    }
  });

  it('sella trazabilidad: origen, version, nombre_original y key_plantilla', () => {
    const borradores = construirBorradoresPlantilla('publico');
    const entidad = borradores.find((b) => b.key === 'entidad');
    expect(entidad?.metadata.plantilla).toEqual({
      origen: 'publico',
      version: VERSION_PLANTILLAS,
      nombre_original: 'Titular / Alta Dirección de la Entidad',
      key_plantilla: 'entidad',
    });
    const privada = construirBorradoresPlantilla('privado');
    expect(privada[0]?.metadata.plantilla.origen).toBe('privado');
  });

  it('copia por valor: dos llamadas no comparten referencias', () => {
    const copia1 = construirBorradoresPlantilla('publico');
    const copia2 = construirBorradoresPlantilla('publico');
    const primero1 = copia1[0];
    const primero2 = copia2[0];
    expect(primero1).toBeDefined();
    expect(primero2).toBeDefined();
    if (!primero1 || !primero2) return;
    const nombreOriginal = primero1.name;

    expect(primero1).not.toBe(primero2);
    expect(primero1.metadata).not.toBe(primero2.metadata);

    primero1.name = 'MUTADO';
    primero1.metadata.plantilla.nombre_original = 'MUTADO';
    expect(primero2.name).toBe(nombreOriginal);
    expect(primero2.metadata.plantilla.nombre_original).toBe(nombreOriginal);
    expect(PLANTILLA_SECTOR_PUBLICO[0]?.nombre).toBe(nombreOriginal); // plantilla intacta
  });

  it('construirDesdeCero devuelve bosque vacío', () => {
    expect(construirDesdeCero()).toEqual([]);
  });

  it('soloActivadas filtra ramas opcionales (público: 9 nodos coherentes)', () => {
    const activos = construirBorradoresPlantilla('publico', { soloActivadas: true });
    expect(activos.map((b) => b.key).sort()).toEqual([
      'administracion', 'apoyo', 'asesoramiento', 'asesoria-juridica', 'entidad',
      'linea', 'linea-a', 'planeamiento', 'recursos-humanos',
    ].sort());
    // Padres activados conservan sus enlaces; DRE/UGEL no están en la plantilla.
    expect(activos.find((b) => b.key === 'recursos-humanos')?.parentKey).toBe('administracion');
    expect(activos.find((b) => b.key === 'linea-a')?.parentKey).toBe('linea');
    expect(activos.find((b) => b.key === 'oci')).toBeUndefined();
    expect(activos.some((b) => b.key === 'dre' || b.key === 'ugel-principal')).toBe(false);
  });

  it('soloActivadas re-resuelve padres excluidos a raíz (privado: Directorio opcional)', () => {
    const activos = construirBorradoresPlantilla('privado', { soloActivadas: true });
    expect(activos).toHaveLength(8);
    expect(activos.find((b) => b.key === 'directorio')).toBeUndefined();
    expect(activos.find((b) => b.key === 'auditoria-interna')).toBeUndefined();
    // gerencia-general quedó sin padre (directorio excluido) → pasa a raíz.
    expect(activos.find((b) => b.key === 'gerencia-general')?.parentKey).toBeNull();
    // Padres activados conservan sus enlaces.
    expect(activos.find((b) => b.key === 'obra-1')?.parentKey).toBe('gerencia-operaciones');
    expect(activos.find((b) => b.key === 'tienda-1')?.parentKey).toBe('gerencia-comercial');
  });

  it('compone con la jerarquía: la plantilla privada completa se numera sin ciclos', () => {
    const borradores = construirBorradoresPlantilla('privado');
    const nodos: NodoJerarquia[] = borradores.map((b) => ({
      id: b.key,
      parentUnitId: b.parentKey,
      orden: null,
    }));
    expect(detectarCiclos(nodos)).toEqual([]);
    expect(detectarHuerfanos(nodos)).toEqual([]);
    const res = calcularNumeracion(nodos);
    expect(res.size).toBe(15);
    expect(res.get('grupo-holding')?.ruta).toBe('1');
    expect(res.get('directorio')?.ruta).toBe('1.1');
    // Hermanos del Directorio sin orden → desempate por id (UTF-16).
    expect(res.get('auditoria-interna')?.ruta).toBe('1.1.1');
    expect(res.get('gerencia-general')?.ruta).toBe('1.1.2');
  });
});
