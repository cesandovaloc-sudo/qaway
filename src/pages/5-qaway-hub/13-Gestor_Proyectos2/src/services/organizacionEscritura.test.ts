/**
 * organizacionEscritura.test.ts
 * =============================
 * Pruebas del servicio de escritura (Etapa 2b). Sin red: AdaptadorBD inyectado
 * (AlmacenFalso) con 251 semillas `unit-001..251` (tenant NULL) que replican el
 * DDL real: unicidad GLOBAL de `code`, PK de `id` (rechazo a duplicados ⇒
 * garantía de "nunca upsert"), created_at determinista.
 *
 * Determinismo: `generarId` y `generarSufijo` inyectados (secuencias fijas);
 * jamás depende del crypto del entorno ni del orden de iteración.
 *
 * Cobertura exigida en la aprobación:
 *   · fallo en cualquier inserción ⇒ detiene el lote y compensa;
 *   · compensación elimina TODAS las filas o informa exactamente las pendientes;
 *   · un tenant no puede operar sobre otro;
 *   · los codes no colisionan (pre-vuelo global + regeneración de sufijo +
 *     colisión "en vivo" 23505 por carrera TOCTOU);
 *   · las 251 semillas permanecen intactas (snapshot profundo antes/después).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ErrorBD,
  crearAdaptadorSupabase,
  listarUnidadesParaJerarquia,
  aNodosJerarquia,
  fallbackInsercionDesde,
  TABLA_UNIDADES,
  type AdaptadorBD,
  type ConsultaSeleccion,
} from './organizacionJerarquiaLectura';
import {
  crearEstructuraDesdePlantilla,
  crearUnidad,
  crearHija,
  reordenarHermanos,
  moverUnidad,
  renombrarUnidad,
  validarBorradoresLote,
  normalizarBase,
  ErrorOrganizacion,
  LIMITE_LOTE,
  DOMINIO_UNIT_TYPE,
} from './organizacionEscritura';
import {
  construirBorradoresPlantilla,
  type GestorUnitBorrador,
} from './organizacionPlantillas';

// ---------------------------------------------------------------------------
// AlmacenFalso: BD in-memory fiel al DDL (sin upsert, unicidad real)
// ---------------------------------------------------------------------------

type FilaAlmacen = {
  id: string;
  tenant_id: string | null;
  parent_unit_id: string | null;
  name: string;
  code: string;
  unit_type: string;
  region: string | null;
  macroregion: string | null;
  address: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  orden: number | null;
  created_at: string;
  updated_at?: string;
};

function timestamp(ordinal: number): string {
  // Milisegundos de 3 dígitos: comparación lexicográfica = orden de inserción.
  return `2026-01-01T00:00:00.${String(ordinal).padStart(3, '0')}Z`;
}

function crearSemillas251(): FilaAlmacen[] {
  const semillas: FilaAlmacen[] = [];
  for (let i = 1; i <= 251; i++) {
    const n = String(i).padStart(3, '0');
    semillas.push({
      id: `unit-${n}`,
      tenant_id: null,
      parent_unit_id: null,
      name: `Semilla ${n}`,
      code: `SEED-${n}`,
      unit_type: i % 2 === 0 ? 'ugel' : 'dre',
      region: null,
      macroregion: null,
      address: null,
      status: 'active',
      metadata: { source: 'catalogo_inicial' },
      orden: null, // 0005 rellena NULL para filas pre-existentes
      created_at: `2025-01-01T00:00:00.${String(i).padStart(3, '0')}Z`,
    });
  }
  return semillas;
}

class AlmacenFalso implements AdaptadorBD {
  filas: FilaAlmacen[];
  columnaOrden = true;
  /** Número de llamada a insertar (1-based) que falla; null = ninguna. */
  falloEnInsert: number | null = null;
  /** Números de llamada a eliminar (1-based) que fallan. */
  fallosDeDelete = new Set<number>();
  /** Carrera TOCTOU: antes de la llamada N, aparece una fila ajena con este code. */
  codeIntruso: string | null = null;
  insertDelIntruso: number | null = null;

  insertsRealizados: FilaAlmacen[] = [];
  deletesRealizados: Array<Array<readonly [string, unknown]>> = [];
  private contadorInsert = 0;
  private contadorDelete = 0;
  private reloj = 251; // created_at de inserts: posteriores a las 251 semillas

  constructor(seeds: FilaAlmacen[] = crearSemillas251()) {
    this.filas = seeds.map((s) => ({ ...s }));
  }

  snapshotSeeds(): FilaAlmacen[] {
    return this.filas
      .filter((f) => f.tenant_id === null)
      .map((f) => JSON.parse(JSON.stringify(f)) as FilaAlmacen);
  }

  private buscar(filtros: { eq: Array<readonly [string, unknown]> }): FilaAlmacen[] {
    return this.filas.filter((fila) =>
      filtros.eq.every(([col, valor]) => {
        const actual = (fila as Record<string, unknown>)[col];
        if (valor === null) return actual === null;
        return actual === valor;
      }),
    );
  }

  async seleccionar(tabla: string, consulta: ConsultaSeleccion): Promise<FilaBDf[]> {
    if (tabla !== TABLA_UNIDADES) throw new ErrorBD({ message: `Tabla desconocida: ${tabla}` });
    // La columna `orden` (migración 0005) puede NO existir todavía: se pide por
    // token EXACTO de la lista de columnas (no por regex de palabra).
    const pideColumnaOrden = consulta.columnas.split(',').some((c) => c.trim() === 'orden');
    if (this.columnaOrden === false && pideColumnaOrden) {
      throw new ErrorBD({
        code: '42703',
        message: 'column gestor_unidades.orden does not exist',
      });
    }
    let resultado = this.filas.filter((fila) => {
      for (const [col, valor] of consulta.eq ?? []) {
        const actual = (fila as Record<string, unknown>)[col];
        if (valor === null ? actual !== null : actual !== valor) return false;
      }
      for (const col of consulta.isNull ?? []) {
        if ((fila as Record<string, unknown>)[col] !== null) return false;
      }
      for (const [col, valores] of consulta.in ?? []) {
        if (!valores.includes((fila as Record<string, unknown>)[col])) return false;
      }
      return true;
    });
    if (consulta.limit !== undefined) resultado = resultado.slice(0, consulta.limit);
    return resultado.map((f) => ({ ...f }));
  }

  async insertar(tabla: string, fila: FilaBDf): Promise<FilaBDf> {
    if (tabla !== TABLA_UNIDADES) throw new ErrorBD({ message: `Tabla desconocida: ${tabla}` });
    this.contadorInsert += 1;
    // Carrera simulada: una fila ajena aparece justo antes del INSERT.
    if (this.insertDelIntruso !== null && this.contadorInsert === this.insertDelIntruso) {
      this.filas.push({
        id: 'intruso-concurrente',
        tenant_id: 'empresa-x', // escritor concurrente de OTRA empresa (no es semilla)
        parent_unit_id: null,
        name: 'Intruso',
        code: this.codeIntruso ?? 'INTRUSO-XXXX',
        unit_type: 'other',
        region: null,
        macroregion: null,
        address: null,
        status: 'active',
        metadata: { nota: 'escritor concurrente (sin plantilla.lote)' },
        orden: null,
        created_at: timestamp(999),
      });
    }
    // PK: id duplicado ⇒ 23505 (jamás upsert: el INSERT no absorbe nada).
    if (this.filas.some((f) => f.id === fila.id)) {
      throw new ErrorBD({
        code: '23505',
        message: 'duplicate key value violates unique constraint "gestor_unidades_pkey"',
      });
    }
    // uq_code GLOBAL (incluye semillas): code duplicado ⇒ 23505.
    if (this.filas.some((f) => f.code === fila.code)) {
      throw new ErrorBD({
        code: '23505',
        message: 'duplicate key value violates unique constraint "uq_gestor_unidades_code"',
      });
    }
    if (this.falloEnInsert !== null && this.contadorInsert === this.falloEnInsert) {
      throw new ErrorBD({ code: 'XX000', message: `Fallo simulado en el INSERT #${this.contadorInsert}` });
    }
    const nueva: FilaAlmacen = {
      region: null,
      macroregion: null,
      address: null,
      status: 'active',
      metadata: null,
      orden: null,
      created_at: timestamp(++this.reloj),
      ...fila,
    } as FilaAlmacen;
    this.filas.push(nueva);
    this.insertsRealizados.push({ ...nueva });
    return { ...nueva };
  }

  async actualizar(
    tabla: string,
    parche: FilaBDf,
    filtros: { eq: Array<readonly [string, unknown]> },
  ): Promise<FilaBDf[]> {
    if (tabla !== TABLA_UNIDADES) throw new ErrorBD({ message: `Tabla desconocida: ${tabla}` });
    const afectadas = this.buscar(filtros);
    for (const fila of afectadas) Object.assign(fila, parche);
    return afectadas.map((f) => ({ ...f }));
  }

  async eliminar(
    tabla: string,
    filtros: { eq: Array<readonly [string, unknown]> },
  ): Promise<FilaBDf[]> {
    if (tabla !== TABLA_UNIDADES) throw new ErrorBD({ message: `Tabla desconocida: ${tabla}` });
    this.contadorDelete += 1;
    this.deletesRealizados.push(filtros.eq.map((p) => [...p] as const));
    if (this.fallosDeDelete.has(this.contadorDelete)) {
      throw new ErrorBD({ code: 'XX000', message: `DELETE simulado falló (llamada #${this.contadorDelete})` });
    }
    const objetivo = this.buscar(filtros);
    this.filas = this.filas.filter((f) => !objetivo.includes(f));
    return objetivo.map((f) => ({ ...f }));
  }
}

// Alias local para no re-exportar FilaBD (el fake la usa en firmas).
type FilaBDf = { [columna: string]: unknown };

// ---------------------------------------------------------------------------
// Generadores inyectables (determinismo total)
// ---------------------------------------------------------------------------

function crearGeneradorId(): () => string {
  let n = 0;
  return () => {
    n += 1;
    return `id-${n}`;
  };
}

/** Generador que arranca desde un ordinal dado (para lotes sobre almacenes ya poblados). */
function crearGeneradorIdDesde(inicio: number): () => string {
  let n = inicio;
  return () => {
    n += 1;
    return `id-${n}`;
  };
}

function crearGeneradorSufijo(sufijos: string[]): () => string {
  let i = 0;
  return () => {
    const s = sufijos[i];
    i += 1;
    return s ?? `S${i}`;
  };
}

function borrador(
  key: string,
  name: string,
  unitType: string,
  parentKey: string | null,
): GestorUnitBorrador {
  return {
    key,
    name,
    unitType: unitType as GestorUnitBorrador['unitType'],
    parentKey,
    metadata: {
      plantilla: { origen: 'ninguna', version: 'test', nombre_original: name, key_plantilla: key },
    },
  };
}

const CODIGO_ERROR = {
  TENANT_INVALIDO: 'TENANT_INVALIDO',
  AUTORIZACION_DENEGADA: 'AUTORIZACION_DENEGADA',
  MIGRACION_0005_PENDIENTE: 'MIGRACION_0005_PENDIENTE',
  BORRADORES_INVALIDOS: 'BORRADORES_INVALIDOS',
  FUERA_DE_TENANT: 'FUERA_DE_TENANT',
  CICLO_ORGANIZACIONAL: 'CICLO_ORGANIZACIONAL',
  INSERCION_LOTE: 'INSERCION_LOTE',
  COMPENSACION_INCOMPLETA: 'COMPENSACION_INCOMPLETA',
  CODE_COLISION: 'CODE_COLISION',
  ID_COLISION: 'ID_COLISION',
  ORDEN_ACTUALIZACION: 'ORDEN_ACTUALIZACION',
} as const;

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
});

async function expectErrorOrganizacion(
  promesa: Promise<unknown>,
  codigo: string,
): Promise<ErrorOrganizacion> {
  const error = await promesa.then(
    () => {
      throw new Error(`Se esperaba ${codigo} pero la operación tuvo éxito`);
    },
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ErrorOrganizacion);
  const eo = error as ErrorOrganizacion;
  expect(eo.codigoError).toBe(codigo);
  return eo;
}

// ---------------------------------------------------------------------------
// crearEstructuraDesdePlantilla
// ---------------------------------------------------------------------------

describe('crearEstructuraDesdePlantilla', () => {
  it('crea la plantilla pública: 14 nodos, BFS, orden 1..n por definición, codes y numeración', async () => {
    const almacen = new AlmacenFalso();
    const semillasAntes = almacen.snapshotSeeds();

    const resultado = await crearEstructuraDesdePlantilla({
      origen: 'publico',
      tenantId: 'empresa-a',
      db: almacen,
      generarId: crearGeneradorId(),
      generarSufijo: crearGeneradorSufijo([
        'AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF', 'GGGG',
        'HHHH', 'IIII', 'JJJJ', 'KKKK', 'LLLL', 'MMMM', 'NNNN',
      ]),
    });

    expect(resultado.tenantId).toBe('empresa-a');
    expect(resultado.autorizacionVerificada).toBe(false); // sin callback ⇒ NO segura
    expect(warnSpy).toHaveBeenCalled();
    expect(resultado.insertadas).toHaveLength(14);

    // Orden de inserción BFS: raíz, hijos de entidad, luego los demás niveles.
    expect(resultado.insertadas.map((u) => u.key)).toEqual([
      'entidad', 'asesoramiento', 'apoyo', 'linea', 'oci',
      'planeamiento', 'asesoria-juridica', 'administracion', 'linea-a', 'linea-b',
      'recursos-humanos', 'finanzas', 'logistica', 'ti',
    ]);
    // normalizarBase se prueba aparte; aquí se verifica el sufijo inyectado en orden.
    expect(resultado.insertadas.map((u) => u.code.slice(-4))).toEqual([
      'AAAA', 'BBBB', 'CCCC', 'DDDD', 'EEEE', 'FFFF', 'GGGG',
      'HHHH', 'IIII', 'JJJJ', 'KKKK', 'LLLL', 'MMMM', 'NNNN',
    ]);

    const porKey = new Map(resultado.insertadas.map((u) => [u.key, u]));
    // `orden` 1..n entre hermanos según el ORDEN DE DEFINICIÓN de la plantilla.
    expect(porKey.get('entidad')?.orden).toBe(1);
    expect(porKey.get('asesoramiento')?.orden).toBe(1);
    expect(porKey.get('apoyo')?.orden).toBe(2);
    expect(porKey.get('linea')?.orden).toBe(3);
    expect(porKey.get('oci')?.orden).toBe(4);
    expect(porKey.get('planeamiento')?.orden).toBe(1);
    expect(porKey.get('asesoria-juridica')?.orden).toBe(2);
    expect(porKey.get('administracion')?.orden).toBe(1);
    expect(porKey.get('linea-a')?.orden).toBe(1);
    expect(porKey.get('linea-b')?.orden).toBe(2);
    expect(porKey.get('recursos-humanos')?.orden).toBe(1);
    expect(porKey.get('finanzas')?.orden).toBe(2);
    expect(porKey.get('logistica')?.orden).toBe(3);
    expect(porKey.get('ti')?.orden).toBe(4);

    expect(porKey.get('asesoramiento')?.parentUnitId).toBe(porKey.get('entidad')?.id);
    expect(porKey.get('planeamiento')?.parentUnitId).toBe(porKey.get('asesoramiento')?.id);
    expect(porKey.get('entidad')?.parentUnitId).toBeNull();

    // Numeración de presentación calculada del árbol real.
    expect(resultado.numeracionPorKey['entidad']).toBe('1');
    expect(resultado.numeracionPorKey['asesoramiento']).toBe('1.1');
    expect(resultado.numeracionPorKey['planeamiento']).toBe('1.1.1');
    expect(resultado.numeracionPorKey['asesoria-juridica']).toBe('1.1.2');
    expect(resultado.numeracionPorKey['apoyo']).toBe('1.2');
    expect(resultado.numeracionPorKey['administracion']).toBe('1.2.1');
    expect(resultado.numeracionPorKey['recursos-humanos']).toBe('1.2.1.1');
    expect(resultado.numeracionPorKey['finanzas']).toBe('1.2.1.2');
    expect(resultado.numeracionPorKey['logistica']).toBe('1.2.1.3');
    expect(resultado.numeracionPorKey['ti']).toBe('1.2.1.4');
    expect(resultado.numeracionPorKey['linea']).toBe('1.3');
    expect(resultado.numeracionPorKey['linea-a']).toBe('1.3.1');
    expect(resultado.numeracionPorKey['linea-b']).toBe('1.3.2');
    expect(resultado.numeracionPorKey['oci']).toBe('1.4');

    // Sello de trazabilidad + lote en metadata de TODAS las filas insertadas.
    const loteId = resultado.loteId;
    for (const fila of almacen.insertsRealizados) {
      expect(fila.tenant_id).toBe('empresa-a');
      const plantilla = (fila.metadata?.plantilla ?? {}) as Record<string, unknown>;
      expect(plantilla['origen']).toBe('publico');
      expect(plantilla['version']).toBe('2026-11');
      expect(plantilla['lote']).toBe(loteId);
      expect(typeof plantilla['nombre_original']).toBe('string');
    }

    // Las 251 semillas quedaron intactas.
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });

  it('bloquea la creación si la columna orden no existe (0005 pendiente) sin insertar nada', async () => {
    const almacen = new AlmacenFalso();
    almacen.columnaOrden = false;
    const semillasAntes = almacen.snapshotSeeds();

    const error = await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'publico',
        tenantId: 'empresa-a',
        db: almacen,
        generarId: crearGeneradorId(),
        generarSufijo: crearGeneradorSufijo(['AAAA']),
      }),
      CODIGO_ERROR.MIGRACION_0005_PENDIENTE,
    );
    expect(error.message).toContain('20261114_0005');
    expect(almacen.insertsRealizados).toHaveLength(0);
    expect(almacen.deletesRealizados).toHaveLength(0);
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });

  it('fallo en el INSERT #5 ⇒ detiene el lote y compensa las 4 filas insertadas (verificadas)', async () => {
    const almacen = new AlmacenFalso();
    almacen.falloEnInsert = 5; // 5ª llamada = OCI; previas: entidad, asesoramiento, apoyo, línea
    const semillasAntes = almacen.snapshotSeeds();

    const error = await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'publico',
        tenantId: 'empresa-a',
        db: almacen,
        generarId: crearGeneradorId(),
        generarSufijo: crearGeneradorSufijo(['AAAA', 'BBBB', 'CCCC', 'DDDD']),
      }),
      CODIGO_ERROR.INSERCION_LOTE,
    );

    const detalle = (error.detalle ?? {}) as Record<string, unknown>;
    expect(typeof detalle['loteId']).toBe('string');
    expect(detalle['insertadasAntes']).toEqual(['id-2', 'id-3', 'id-4', 'id-5']);
    expect(error.message).toContain('revertido por completo');
    expect(error.message).toContain('Fallo simulado en el INSERT #5');

    // 4 inserts almacenados, 4 deletes ejecutados y verificados (1 fila c/u).
    expect(almacen.insertsRealizados).toHaveLength(4);
    expect(almacen.deletesRealizados).toHaveLength(4);
    for (const borrado of almacen.deletesRealizados) {
      const mapa = new Map(borrado);
      expect(mapa.get('tenant_id')).toBe('empresa-a'); // siempre acotado por tenant
    }
    // El lote quedó revertido: ninguna fila del tenant permanece.
    expect(almacen.filas.filter((f) => f.tenant_id === 'empresa-a')).toHaveLength(0);
    // Las 251 semillas intactas.
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });

  it('DELETE #2 y #3 fallan ⇒ COMPENSACION_INCOMPLETA con lote y pendientes EXACTAS', async () => {
    const almacen = new AlmacenFalso();
    almacen.falloEnInsert = 4; // "línea" falla; quedan entidad, asesoramiento, apoyo
    almacen.fallosDeDelete = new Set([2, 3]); // delete de asesoramiento y de apoyo
    const semillasAntes = almacen.snapshotSeeds();

    const error = await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'publico',
        tenantId: 'empresa-a',
        db: almacen,
        generarId: crearGeneradorId(),
        generarSufijo: crearGeneradorSufijo(['AAAA', 'BBBB', 'CCCC']),
      }),
      CODIGO_ERROR.COMPENSACION_INCOMPLETA,
    );

    const detalle = (error.detalle ?? {}) as Record<string, unknown>;
    expect(typeof detalle['loteId']).toBe('string');
    expect(detalle['limpiadas']).toEqual(['id-2']); // entidad: delete verificado
    const pendientes = detalle['pendientes'] as Array<{ id: string; code: string | null; motivo: string }>;
    expect(pendientes.map((p) => p.id)).toEqual(['id-3', 'id-4']); // asesoramiento, apoyo
    expect(pendientes[0]?.code).toBe('ORGANOS-DE-ASESORAMIENTO-BBBB');
    expect(pendientes[1]?.code).toBe('ORGANOS-DE-APOYO-CCCC');
    expect(pendientes.every((p) => p.motivo.includes('DELETE'))).toBe(true);
    expect(error.message).toContain('pendientes de limpieza');
    expect(error.message).toContain('Lote:');

    // Exactamente esas 2 filas siguen en el almacén (resto compensado).
    const restantes = almacen.filas.filter((f) => f.tenant_id === 'empresa-a');
    expect(restantes.map((f) => f.id)).toEqual(['id-3', 'id-4']);
    expect(almacen.deletesRealizados).toHaveLength(3); // #4 jamás se alcanzó
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });

  it('colisión de code en pre-vuelo ⇒ regenera sufijo; mismo nombre ×2 ⇒ codes distintos', async () => {
    const almacen = new AlmacenFalso();
    // Colisión GLOBAL: un code existente (semilla/otro tenant) ya usa AAAA.
    almacen.filas.push({
      id: 'unit-999', tenant_id: 'empresa-z', parent_unit_id: null,
      name: 'Titular / Alta Dirección de la Entidad',
      code: 'TITULAR-ALTA-DIRECCION-DE-LA-AAAA', unit_type: 'central',
      region: null, macroregion: null, address: null, status: 'active',
      metadata: null, orden: 1, created_at: '2025-06-01T00:00:00.000Z',
    });
    const semillasAntes = almacen.snapshotSeeds();

    const resultado = await crearEstructuraDesdePlantilla({
      origen: 'desde-cero',
      tenantId: 'empresa-a',
      db: almacen,
      borradoresPersonalizados: [
        borrador('raiz', 'Titular / Alta Dirección de la Entidad', 'central', null),
        borrador('raiz2', 'Titular / Alta Dirección de la Entidad', 'central', null), // mismo nombre
      ],
      generarId: crearGeneradorId(),
      generarSufijo: crearGeneradorSufijo(['AAAA', 'BBBB', 'CCCC']),
    });

    // 'AAAA' chocó con la fila global ⇒ regenerado; el segundo sufijo libre fue BBBB…
    // (la secuencia compartida asigna: raiz → BBBB tras descartar AAAA, raiz2 → CCCC).
    expect(resultado.insertadas.map((u) => u.code)).toEqual([
      'TITULAR-ALTA-DIRECCION-DE-LA-BBBB',
      'TITULAR-ALTA-DIRECCION-DE-LA-CCCC',
    ]);
    const codes = new Set(resultado.insertadas.map((u) => u.code));
    expect(codes.size).toBe(2); // sin colisiones entre hermanos
    // La fila ajena (empresa-z) no fue tocada.
    expect(almacen.filas.filter((f) => f.tenant_id === 'empresa-z')).toHaveLength(1);
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });

  it('colisión EN VIVO (23505 por escritor concurrente) ⇒ lote detenido, compensado y sin tocar al intruso', async () => {
    const almacen = new AlmacenFalso();
    // TOCTOU: el intruso aparece ANTES del INSERT #2 con SU code.
    almacen.codeIntruso = 'ORGANOS-DE-ASESORAMIENTO-BBBB';
    almacen.insertDelIntruso = 2;
    const semillasAntes = almacen.snapshotSeeds();

    const error = await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'publico',
        tenantId: 'empresa-a',
        db: almacen,
        generarId: crearGeneradorId(),
        generarSufijo: crearGeneradorSufijo(['AAAA', 'BBBB', 'CCCC', 'DDDD']),
      }),
      CODIGO_ERROR.INSERCION_LOTE,
    );

    const detalle = (error.detalle ?? {}) as Record<string, unknown>;
    expect(String(detalle['causaOriginal'])).toContain('uq_gestor_unidades_code');
    expect(detalle['insertadasAntes']).toEqual(['id-2']);
    // La entidad (única insertada) fue compensada y verificada.
    expect(almacen.deletesRealizados).toHaveLength(1);
    expect(almacen.filas.filter((f) => f.tenant_id === 'empresa-a' && f.id === 'id-2')).toHaveLength(0);
    // El intruso del escritor concurrente NO fue eliminado (solo se limpia el lote propio).
    const intruso = almacen.filas.find((f) => f.id === 'intruso-concurrente');
    expect(intruso?.code).toBe('ORGANOS-DE-ASESORAMIENTO-BBBB');
    expect(almacen.snapshotSeeds()).toEqual(semillasAntes);
  });
});

// ---------------------------------------------------------------------------
// No-upsert e identidad
// ---------------------------------------------------------------------------

describe('Garantía de no-upsert', () => {
  it('ningún adaptador expone upsert; el INSERT rechaza ids y codes duplicados (23505)', async () => {
    const almacen = new AlmacenFalso();
    expect('upsert' in almacen).toBe(false);
    const adaptadorSupabase = crearAdaptadorSupabase({} as unknown as SupabaseClient);
    expect('upsert' in adaptadorSupabase).toBe(false);

    // id duplicado (PK) ⇒ 23505: jamás absorbe/sobrescribe una fila existente.
    await expect(
      almacen.insertar(TABLA_UNIDADES, {
        id: 'unit-001', tenant_id: 'empresa-a', parent_unit_id: null,
        name: 'Intento de upsert', code: 'NUEVO-CODE-AAAA', unit_type: 'other',
        orden: 1, metadata: null,
      }),
    ).rejects.toMatchObject({ codigo: '23505' });

    // code duplicado contra uq_code GLOBAL (semilla) ⇒ 23505.
    await expect(
      almacen.insertar(TABLA_UNIDADES, {
        id: 'id-fresco', tenant_id: 'empresa-a', parent_unit_id: null,
        name: 'Duplicado', code: 'SEED-001', unit_type: 'other',
        orden: 1, metadata: null,
      }),
    ).rejects.toMatchObject({ codigo: '23505' });

    // La semilla siguió intacta y con SU nombre original.
    const semilla = almacen.filas.find((f) => f.id === 'unit-001');
    expect(semilla?.name).toBe('Semilla 001');
    expect(semilla?.tenant_id).toBeNull();
  });

  it('generarId que repite ids existentes ⇒ ID_COLISION tras los reintentos, sin insertar', async () => {
    const almacen = new AlmacenFalso();
    await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'desde-cero',
        tenantId: 'empresa-a',
        db: almacen,
        borradoresPersonalizados: [
          borrador('raiz', 'Titular / Alta Dirección de la Entidad', 'central', null),
        ],
        generarId: () => 'unit-001', // constante: colisiona con la semilla
        generarSufijo: crearGeneradorSufijo(['AAAA']),
      }),
      CODIGO_ERROR.ID_COLISION,
    );
    expect(almacen.insertsRealizados).toHaveLength(0);
    expect(almacen.deletesRealizados).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Validaciones previas
// ---------------------------------------------------------------------------

describe('Validaciones previas (nada toca la BD)', () => {
  it('normalizarBase: sin acentos, mayúsculas, guiones limpios y acotado a 28', () => {
    expect(normalizarBase('Titular / Alta Dirección de la Entidad')).toBe('TITULAR-ALTA-DIRECCION-DE-LA');
    expect(normalizarBase('Órgano de Control')).toBe('ORGANO-DE-CONTROL');
    expect(normalizarBase('  Dirección  Regional--2026  ')).toBe('DIRECCION-REGIONAL-2026');
    expect(normalizarBase('Oficina de Tecnologías de la Información')).toBe('OFICINA-DE-TECNOLOGIAS-DE-LA');
    expect(normalizarBase('///')).toBe('');
  });

  it('borradores: vacío, parentKey externa, ciclo, keys duplicadas, unitType y nombre inválidos', () => {
    const almacen = new AlmacenFalso();
    const sinEfectosBD = () =>
      expect(almacen.insertsRealizados.length + almacen.deletesRealizados.length).toBe(0);

    expect(() => validarBorradoresLote([])).toThrow();
    expect(() => validarBorradoresLote([borrador('a', 'A', 'central', 'fantasma')])).toThrow();

    let codigoCiclo = '';
    try {
      validarBorradoresLote([borrador('a', 'A', 'central', 'b'), borrador('b', 'B', 'oficina', 'a')]);
    } catch (e) {
      codigoCiclo = e instanceof ErrorOrganizacion ? e.codigoError : '';
    }
    expect(codigoCiclo).toBe(CODIGO_ERROR.CICLO_ORGANIZACIONAL);

    expect(() => validarBorradoresLote([
      borrador('x', 'X', 'central', null),
      borrador('x', 'X2', 'oficina', 'x'),
    ])).toThrow();
    expect(() => validarBorradoresLote([borrador('a', 'A', 'tipo-inexistente', null)])).toThrow();
    expect(() => validarBorradoresLote([borrador('a', '   ', 'central', null)])).toThrow();

    // Las plantillas reales pasan la validación estructural sin tocar la BD.
    expect(() => validarBorradoresLote(construirBorradoresPlantilla('publico'))).not.toThrow();
    expect(() => validarBorradoresLote(construirBorradoresPlantilla('privado', { soloActivadas: true }))).not.toThrow();
    sinEfectosBD();
  });

  it('límite de lote: 200 pasan, 201 ⇒ BORRADORES_INVALIDOS; dominio unit_type con 9 valores', () => {
    const lote: GestorUnitBorrador[] = [];
    for (let i = 0; i < LIMITE_LOTE; i++) lote.push(borrador(`k${i}`, `Unidad ${i}`, 'other', null));
    expect(() => validarBorradoresLote(lote)).not.toThrow();
    lote.push(borrador('extra', 'Extra', 'other', null));
    expect(() => validarBorradoresLote(lote)).toThrow(/excede el límite 200/);
    expect(DOMINIO_UNIT_TYPE).toHaveLength(9);
    expect(DOMINIO_UNIT_TYPE).toContain('ugel');
  });

  it('rechaza "desde cero" sin borradores, tenant inválido y autorización denegada (sin llamadas BD)', async () => {
    const almacen = new AlmacenFalso();

    await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({ origen: 'desde-cero', tenantId: 'empresa-a', db: almacen }),
      CODIGO_ERROR.BORRADORES_INVALIDOS,
    );
    await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({ origen: 'publico', tenantId: '   ', db: almacen }),
      CODIGO_ERROR.TENANT_INVALIDO,
    );
    await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'publico', tenantId: 'empresa-a', db: almacen,
        verificarAutorizacion: () => false,
      }),
      CODIGO_ERROR.AUTORIZACION_DENEGADA,
    );
    await expectErrorOrganizacion(
      crearUnidad({
        tenantId: 'empresa-a', name: 'X', unitType: 'other',
        db: almacen, verificarAutorizacion: async () => false,
      }),
      CODIGO_ERROR.AUTORIZACION_DENEGADA,
    );

    expect(almacen.insertsRealizados).toHaveLength(0);
    expect(almacen.deletesRealizados).toHaveLength(0);
    expect(almacen.snapshotSeeds()).toHaveLength(251);
  });
});

// ---------------------------------------------------------------------------
// Aislamiento de tenant
// ---------------------------------------------------------------------------

describe('Aislamiento de tenant (un tenant no opera sobre otro)', () => {
  it('todas las operaciones cross-tenant fallan y las filas de la empresa A quedan intactas', async () => {
    const almacen = new AlmacenFalso();
    const creacion = await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'empresa-a', db: almacen,
      generarId: crearGeneradorId(),
      generarSufijo: crearGeneradorSufijo(['AAAA']),
    });
    const porKey = new Map(creacion.insertadas.map((u) => [u.key, u]));
    const idAsesoramiento = porKey.get('asesoramiento')?.id ?? '';
    const idLinea = porKey.get('linea')?.id ?? '';
    const idOci = porKey.get('oci')?.id ?? '';
    const filasA = () =>
      almacen.filas.filter((f) => f.tenant_id === 'empresa-a').map((f) => JSON.parse(JSON.stringify(f)));
    const antes = filasA();

    // Renombrar una unidad de A desde B ⇒ FUERA_DE_TENANT (update de 0 filas).
    await expectErrorOrganizacion(
      renombrarUnidad({ tenantId: 'empresa-b', unidadId: idAsesoramiento, nuevoNombre: 'Hack', db: almacen }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    // Crear hija bajo una unidad de A desde B ⇒ FUERA_DE_TENANT.
    await expectErrorOrganizacion(
      crearHija({
        tenantId: 'empresa-b', name: 'Infiltrada', unitType: 'other',
        parentUnitId: idLinea, db: almacen,
      }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    // Mover una unidad de A desde B ⇒ FUERA_DE_TENANT.
    await expectErrorOrganizacion(
      moverUnidad({ tenantId: 'empresa-b', unidadId: idAsesoramiento, nuevoPadreId: idOci, db: almacen }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    // Colgar/mover bajo una SEMILLA (tenant NULL) ⇒ FUERA_DE_TENANT (decisión pendiente).
    await expectErrorOrganizacion(
      crearHija({
        tenantId: 'empresa-a', name: 'Bajo semilla', unitType: 'other',
        parentUnitId: 'unit-001', db: almacen,
      }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    await expectErrorOrganizacion(
      moverUnidad({ tenantId: 'empresa-a', unidadId: idAsesoramiento, nuevoPadreId: 'unit-002', db: almacen }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    // Reordenar desde B con ids de A ⇒ rechazo (lista ≠ hermanos de B).
    const idsHijosEntidad = creacion.insertadas
      .filter((u) => u.parentUnitId === (porKey.get('entidad')?.id ?? ''))
      .map((u) => u.id);
    await expect(
      reordenarHermanos({
        tenantId: 'empresa-b', parentUnitId: null,
        idsEnNuevoOrden: idsHijosEntidad, db: almacen,
      }),
    ).rejects.toBeInstanceOf(ErrorOrganizacion);
    // Desde A pero con un id ajeno mezclado ⇒ rechazo SIN actualizar nada.
    await expect(
      reordenarHermanos({
        tenantId: 'empresa-a', parentUnitId: null,
        idsEnNuevoOrden: [...idsHijosEntidad, 'unit-001'], db: almacen,
      }),
    ).rejects.toBeInstanceOf(ErrorOrganizacion);

    expect(filasA()).toEqual(antes);
    expect(almacen.filas.filter((f) => f.tenant_id === 'empresa-b')).toHaveLength(0);
    expect(almacen.filas.find((f) => f.id === 'unit-001')?.orden).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// moverUnidad
// ---------------------------------------------------------------------------

describe('moverUnidad', () => {
  it('previene ciclos (auto-padre y subárbol propio) sin mutar la jerarquía', async () => {
    const almacen = new AlmacenFalso();
    const creacion = await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'emp-m', db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['AAAA']),
    });
    const porKey = new Map(creacion.insertadas.map((u) => [u.key, u]));
    const idLinea = porKey.get('linea')?.id ?? '';
    const idLineaA = porKey.get('linea-a')?.id ?? '';
    const idEntidad = porKey.get('entidad')?.id ?? '';

    await expectErrorOrganizacion(
      moverUnidad({ tenantId: 'emp-m', unidadId: idLinea, nuevoPadreId: idLinea, db: almacen }),
      CODIGO_ERROR.CICLO_ORGANIZACIONAL,
    );
    await expectErrorOrganizacion(
      moverUnidad({ tenantId: 'emp-m', unidadId: idLinea, nuevoPadreId: idLineaA, db: almacen }),
      CODIGO_ERROR.CICLO_ORGANIZACIONAL,
    );
    const linea = almacen.filas.find((f) => f.id === idLinea);
    expect(linea?.parent_unit_id).toBe(idEntidad);
    expect(linea?.orden).toBe(3);
  });

  it('movimiento válido: identidad intacta, orden en destino y re-pack de hermanos', async () => {
    const almacen = new AlmacenFalso();
    const creacion = await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'emp-m', db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['AAAA']),
    });
    const porKey = new Map(creacion.insertadas.map((u) => [u.key, u]));
    const idLinea = porKey.get('linea')?.id ?? '';

    // 1) OCI → dentro de Línea (al final: orden 3 tras las 2 direcciones de línea).
    const movido = await moverUnidad({
      tenantId: 'emp-m', unidadId: porKey.get('oci')?.id ?? '', nuevoPadreId: idLinea, db: almacen,
    });
    expect(movido.parentUnitId).toBe(idLinea);
    expect(movido.orden).toBe(3);
    expect(movido.ruta).toBe('1.3.3');
    // Destino y origen ya quedan consecutivos: no hay que reempaquetar.
    expect(movido.ordenesRepack).toBe(0);

    const ociFila = almacen.filas.find((f) => f.id === porKey.get('oci')?.id);
    expect(ociFila?.parent_unit_id).toBe(idLinea);
    expect(ociFila?.orden).toBe(3);
    expect(ociFila?.id).toBe(porKey.get('oci')?.id);
    expect(ociFila?.code).toBe(porKey.get('oci')?.code); // identidad: code intacto
    expect((ociFila?.metadata?.plantilla as Record<string, unknown>)['key_plantilla']).toBe('oci');

    // 2) Apoyo → raíz en posición 1: la entidad se reempaqueta a orden 2.
    const movidoApoyo = await moverUnidad({
      tenantId: 'emp-m', unidadId: porKey.get('apoyo')?.id ?? '', nuevoPadreId: null, posicion: 1, db: almacen,
    });
    expect(movidoApoyo.orden).toBe(1);
    expect(movidoApoyo.ruta).toBe('1');
    // 1 re-pack en destino (entidad 1→2); los hermanos de origen ya están corridos.
    expect(movidoApoyo.ordenesRepack).toBe(1);
    const entidad = almacen.filas.find((f) => f.id === porKey.get('entidad')?.id);
    expect(entidad?.orden).toBe(2);
    expect(entidad?.parent_unit_id).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// crearHija + reordenarHermanos
// ---------------------------------------------------------------------------

describe('crearHija y reordenarHermanos', () => {
  it('crearHija usa max+1; reordenar actualiza SOLO lo cambiado y es idempotente', async () => {
    const almacen = new AlmacenFalso();
    const creacion = await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'emp-r', db: almacen,
      verificarAutorizacion: () => true,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['AAAA']),
    });
    const porKey = new Map(creacion.insertadas.map((u) => [u.key, u]));
    const idEntidad = porKey.get('entidad')?.id ?? '';
    const idOci = porKey.get('oci')?.id ?? '';

    const hija = await crearHija({
      tenantId: 'emp-r', name: 'Nueva Área', unitType: 'oficina',
      parentUnitId: idEntidad, db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['ZZZZ']),
    });
    expect(hija.orden).toBe(5); // max+1 tras los 4 hijos de entidad
    expect(hija.code).toBe('NUEVA-AREA-ZZZZ');
    expect(hija.parentUnitId).toBe(idEntidad);

    const idsHijos = creacion.insertadas
      .filter((u) => u.parentUnitId === idEntidad)
      .map((u) => u.id);
    expect(idsHijos).toHaveLength(4);
    const pedidos = [hija.id, ...[...idsHijos].reverse()];

    const primera = await reordenarHermanos({
      tenantId: 'emp-r', parentUnitId: idEntidad, idsEnNuevoOrden: pedidos, db: almacen,
      verificarAutorizacion: () => true,
    });
    expect(primera.actualizadas).toBe(5);
    expect(primera.numeracion[hija.id]).toBe('1.1');
    expect(primera.numeracion[idOci]).toBe('1.2');

    const segunda = await reordenarHermanos({
      tenantId: 'emp-r', parentUnitId: idEntidad, idsEnNuevoOrden: pedidos, db: almacen,
    });
    expect(segunda.actualizadas).toBe(0);

    const ordenes = almacen.filas
      .filter((f) => f.tenant_id === 'emp-r' && f.parent_unit_id === idEntidad)
      .map((f) => f.orden ?? 0)
      .sort((a, b) => a - b);
    expect(ordenes).toEqual([1, 2, 3, 4, 5]);
  });
});

// ---------------------------------------------------------------------------
// renombrarUnidad
// ---------------------------------------------------------------------------

describe('renombrarUnidad', () => {
  it('cambia SOLO el name; id, code, sello de plantilla, padre y orden intactos', async () => {
    const almacen = new AlmacenFalso();
    const creacion = await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'emp-n', db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['AAAA']),
    });
    const area = creacion.insertadas.find((u) => u.key === 'asesoramiento');
    const idArea = area?.id ?? '';
    const antes = { ...almacen.filas.find((f) => f.id === idArea)! };

    const resultado = await renombrarUnidad({
      tenantId: 'emp-n', unidadId: idArea, nuevoNombre: 'Área Ejecutiva', db: almacen,
    });
    expect(resultado.name).toBe('Área Ejecutiva');

    const fila = almacen.filas.find((f) => f.id === idArea)!;
    expect(fila.name).toBe('Área Ejecutiva');
    expect(fila.id).toBe(antes.id);
    expect(fila.code).toBe(antes.code);
    expect(fila.parent_unit_id).toBe(antes.parent_unit_id);
    expect(fila.orden).toBe(antes.orden);
    expect((fila.metadata?.plantilla as Record<string, unknown>)['nombre_original'])
      .toBe('Órganos de Asesoramiento');
    expect(typeof fila.updated_at).toBe('string');

    await expectErrorOrganizacion(
      renombrarUnidad({ tenantId: 'emp-n', unidadId: idArea, nuevoNombre: '   ', db: almacen }),
      CODIGO_ERROR.BORRADORES_INVALIDOS,
    );
    await expectErrorOrganizacion(
      renombrarUnidad({ tenantId: 'otro', unidadId: idArea, nuevoNombre: 'X', db: almacen }),
      CODIGO_ERROR.FUERA_DE_TENANT,
    );
    expect(almacen.filas.find((f) => f.id === idArea)?.name).toBe('Área Ejecutiva');
  });
});

// ---------------------------------------------------------------------------
// Lectura jerárquica
// ---------------------------------------------------------------------------

describe('Lectura jerárquica (degradación explícita, nunca silenciosa)', () => {
  it('sin columna orden: ordenDisponible=false en todas las filas y fallback por created_at', async () => {
    const almacen = new AlmacenFalso();
    almacen.columnaOrden = false;
    await almacen.insertar(TABLA_UNIDADES, {
      id: 't-1', tenant_id: 'emp-l', parent_unit_id: null, name: 'Raíz L',
      code: 'RAIZ-L-AAAA', unit_type: 'central', orden: null, metadata: null,
    });
    await almacen.insertar(TABLA_UNIDADES, {
      id: 't-2', tenant_id: 'emp-l', parent_unit_id: 't-1', name: 'Hija L',
      code: 'HIJA-L-AAAA', unit_type: 'oficina', orden: null, metadata: null,
    });

    const unidades = await listarUnidadesParaJerarquia({ tenantId: 'emp-l', db: almacen });
    expect(unidades).toHaveLength(2);
    for (const u of unidades) {
      expect(u.ordenDisponible).toBe(false);
      expect(u.orden).toBeNull();
    }
    const fallback = fallbackInsercionDesde(unidades);
    expect(fallback.get('t-1')).toBe(0);
    expect(fallback.get('t-2')).toBe(1);
    expect(aNodosJerarquia(unidades).map((n) => n.id)).toEqual(['t-1', 't-2']);

    const globales = await listarUnidadesParaJerarquia({ db: almacen });
    expect(globales).toHaveLength(253);
    expect(globales.every((u) => u.ordenDisponible === false)).toBe(true);
  });

  it('con columna orden: lectura normal, semillas con orden NULL y fallback (created_at, id)', async () => {
    const almacen = new AlmacenFalso();
    const unidades = await listarUnidadesParaJerarquia({ db: almacen });
    expect(unidades).toHaveLength(251);
    expect(unidades.every((u) => u.ordenDisponible === true)).toBe(true);
    const primera = unidades.find((u) => u.id === 'unit-001');
    expect(primera?.orden).toBeNull();
    expect(primera?.tenantId).toBeNull();
    const fallback = fallbackInsercionDesde(unidades);
    expect(fallback.get('unit-001')).toBe(0);
    expect(fallback.get('unit-251')).toBe(250);
  });
});

// ---------------------------------------------------------------------------
// Integridad de las 251 semillas tras un ciclo de vida completo
// ---------------------------------------------------------------------------

describe('Integridad de las 251 semillas', () => {
  it('crear, fallar+compensar, crear hija, mover y renombrar: semillas byte a byte', async () => {
    const semillasIniciales = crearSemillas251();
    const almacen = new AlmacenFalso();

    // 1) Creación exitosa (14 filas del tenant).
    await crearEstructuraDesdePlantilla({
      origen: 'publico', tenantId: 'emp-f', db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['AAAA']),
    });

    // 2) Segundo lote que falla en su 2º INSERT (llamada #16 global) y compensa.
    almacen.falloEnInsert = 16;
    await expectErrorOrganizacion(
      crearEstructuraDesdePlantilla({
        origen: 'desde-cero', tenantId: 'emp-f', db: almacen,
        borradoresPersonalizados: [
          borrador('raiz', 'Entidad F', 'central', null),
          borrador('hijo', 'Hijo F', 'oficina', 'raiz'),
        ],
        generarId: crearGeneradorIdDesde(100), // evita los ids id-1..id-14 ya ocupados
        generarSufijo: crearGeneradorSufijo(['AAAA']),
      }),
      CODIGO_ERROR.INSERCION_LOTE,
    );

    // 3) Vida posterior: hija, movimiento y renombrado (sin deletes).
    const filasEmpF = () => almacen.filas.filter((f) => f.tenant_id === 'emp-f');
    const porNombre = (nombre: string) => filasEmpF().find((f) => f.name === nombre);
    const idEntidad = porNombre('Titular / Alta Dirección de la Entidad')?.id ?? '';
    const idLinea = porNombre('Órganos de Línea')?.id ?? '';
    const idLineaA = porNombre('Dirección de Línea A')?.id ?? '';
    const idOci = porNombre('Órgano de Control Institucional')?.id ?? '';

    await crearHija({
      tenantId: 'emp-f', name: 'Área Nueva', unitType: 'oficina',
      parentUnitId: idEntidad, db: almacen,
      generarId: crearGeneradorId(), generarSufijo: crearGeneradorSufijo(['QQQQ']),
    });
    await moverUnidad({ tenantId: 'emp-f', unidadId: idLineaA, nuevoPadreId: idLinea, db: almacen });
    await renombrarUnidad({ tenantId: 'emp-f', unidadId: idOci, nuevoNombre: 'Control Renombrado', db: almacen });

    expect(filasEmpF()).toHaveLength(15); // 14 del lote + hija (el lote fallido quedó compensado)
    expect(almacen.deletesRealizados).toHaveLength(1); // solo la compensación del lote fallido

    // Ningún DELETE apuntó jamás a una semilla (siempre id del lote + tenant).
    for (const borrado of almacen.deletesRealizados) {
      const par = borrado.find(([col]) => col === 'id');
      expect(String(par?.[1])).not.toMatch(/^unit-\d{3}$/);
      expect(borrado.some(([col, valor]) => col === 'tenant_id' && valor === 'emp-f')).toBe(true);
    }

    // Las 251 semillas permanecen intactas byte a byte.
    expect(almacen.snapshotSeeds()).toEqual(semillasIniciales);
  });
});

