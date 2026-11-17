/**
 * organizacionSeguridad.test.ts
 * =============================
 * PRUEBAS UNITARIAS SIMULADAS (Etapa 4): los 13 escenarios de seguridad del
 * encargo, con cliente Supabase FALSO (vi.hoisted + getter) y adaptador
 * in-memory fiel al DDL. Sin red. Valida el cableado fail-closed del módulo.
 *
 * IMPORTANTE (honestidad): estas pruebas NO validan RLS de Postgres. Las
 * pruebas de RLS REAL con identidades vivas son un procedimiento manual en
 * Supabase (doc2/3.9 §6.2). El cliente falso incluye un método `upsert` que
 * LANZA: si cualquier servicio volviera a usar upsert para crear, la prueba
 * falla (aserción implícita de INSERT puro).
 *
 * Detalle técnico: el cliente falso se crea UNA sola vez y lee el estado
 * (`estado`/`grab`/`filasUnidades`) por referencia en cada llamada. Motivo:
 * `obtenerAdaptadorPorDefecto()` cachea un singleton del adaptador; si cada
 * prueba fabricara un cliente nuevo, los tramos runtime quedarían atados al
 * cliente de la primera prueba (estado viejo). Con un cliente estable + estado
 * mutable, el singleton queda coherente y cada prueba parte de filas frescas.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ErrorBD,
  TABLA_UNIDADES,
  listarUnidadesParaJerarquia,
  type AdaptadorBD,
  type ConsultaSeleccion,
} from './organizacionJerarquiaLectura';
import {
  ErrorSesion,
  invalidarContexto,
  resolverContextoSesion,
  verificarAutorizacionSesion,
} from './contextoSesion';
import { listGestorUnits, createGestorUnit } from './gestorOrganizacionService';
import {
  crearEstructuraDesdePlantilla,
  crearUnidad,
  renombrarUnidad,
  reordenarHermanos,
} from './organizacionEscritura';
import type { GestorUnitBorrador } from './organizacionPlantillas';

// ---------------------------------------------------------------------------
// Mock del cliente (getter: permite alternar null / cliente falso por prueba)
// ---------------------------------------------------------------------------

const h = vi.hoisted(() => ({ cliente: null as unknown | null }));
vi.mock('./supabaseClient', () => ({
  get supabase() {
    return h.cliente;
  },
}));

// ---------------------------------------------------------------------------
// Identidades y estado mutable (leído EN VIVO por el cliente falso)
// ---------------------------------------------------------------------------

const TENANT_A = 'aaaaaaaa-1111-1111-1111-111111111111';
const TENANT_B = 'bbbbbbbb-2222-2222-2222-222222222222';

interface EstadoSesion {
  userId: string;
  email: string;
  perfil: { tenant_id: string | null; is_platform_admin: boolean } | null;
  rolApp: string | null;
  puedeUsarApp: boolean;
  /** Fuerza un error de BD en el INSERT del cliente falso. */
  falloInsert: boolean;
}

let estado: EstadoSesion = {
  userId: '',
  email: '',
  perfil: null,
  rolApp: null,
  puedeUsarApp: false,
  falloInsert: false,
};

interface Grabaciones {
  inserts: Array<Record<string, unknown>>;
  upserts: number;
  filtrosOr: string[];
  filtrosEq: Array<readonly [string, unknown]>;
}

let grab: Grabaciones = { inserts: [], upserts: 0, filtrosOr: [], filtrosEq: [] };

/** Filas vigentes de gestor_unidades en el cliente falso (recreadas por prueba). */
let filasUnidades: Array<Record<string, unknown>> = [];

// ---------------------------------------------------------------------------
// Cliente Supabase falso (ESTABLE): auth.getUser/onAuthStateChange, users,
// gestor_unidades select/insert/update/delete, RPCs de autorización
// ---------------------------------------------------------------------------

function filasGestorUnidades(): Array<Record<string, unknown>> {
  return [
    {
      id: 'propia-1', tenant_id: TENANT_A, parent_unit_id: null, name: 'Sede Central A',
      code: 'SEDE-CENTRAL-A-AA01', unit_type: 'central', region: 'LIMA', macroregion: null,
      address: null, status: 'active', metadata: { progress: 40 }, orden: 1,
    },
    {
      id: 'propia-2', tenant_id: TENANT_A, parent_unit_id: 'propia-1', name: 'Obra A1',
      code: 'OBRA-A1-AA02', unit_type: 'obra', region: 'LIMA', macroregion: null,
      address: null, status: 'active', metadata: {}, orden: 1,
    },
    {
      id: 'unit-001', tenant_id: null, parent_unit_id: null, name: 'DRE AMAZONAS',
      code: 'DRE-AMAZONAS', unit_type: 'dre', region: 'AMAZONAS', macroregion: null,
      address: null, status: 'active', metadata: { source: 'catalogo' }, orden: null,
    },
    {
      id: 'unit-002', tenant_id: null, parent_unit_id: null, name: 'UGEL BAGUA',
      code: 'UGEL-BAGUA', unit_type: 'ugel', region: 'AMAZONAS', macroregion: null,
      address: null, status: 'active', metadata: { source: 'catalogo' }, orden: null,
    },
    {
      id: 'ajena-1', tenant_id: TENANT_B, parent_unit_id: null, name: 'Sede Central B',
      code: 'SEDE-CENTRAL-B-BB01', unit_type: 'central', region: 'CUSCO', macroregion: null,
      address: null, status: 'active', metadata: {}, orden: 1,
    },
  ];
}

let clienteFalso: SupabaseClient | null = null;

function asegurarClienteFalso(): SupabaseClient {
  if (clienteFalso) return clienteFalso;

  const aplicarEq = (
    filas: Array<Record<string, unknown>>,
    eqs: Array<readonly [string, unknown]>,
  ): Array<Record<string, unknown>> =>
    filas.filter((fila) => eqs.every(([col, valor]) => fila[col] === valor));

  const aplicarOr = (
    filtro: string | undefined,
    filas: Array<Record<string, unknown>>,
  ): Array<Record<string, unknown>> => {
    if (!filtro) return filas;
    const partes = filtro.split(',').map((p) => p.trim());
    return filas.filter((fila) =>
      partes.some((parte) => {
        const m = /^([a-z_]+)\.(eq|is)\.(.*)$/.exec(parte);
        if (!m) return false;
        const col = m[1];
        const op = m[2];
        const valor = m[3];
        if (col === undefined || op === undefined || valor === undefined) return false;
        if (op === 'is') return valor === 'null' && fila[col] === null;
        return fila[col] === valor;
      }),
    );
  };

  const desde = (tabla: string): unknown => {
    if (tabla === 'users') {
      const u: Record<string, unknown> = {
        select: () => u,
        eq: () => u,
        single: () => Promise.resolve({ data: estado.perfil, error: null }),
      };
      return u;
    }
    if (tabla === 'gestor_unidades') {
      const st: {
        or?: string;
        eqs: Array<readonly [string, unknown]>;
        filaInsert?: Record<string, unknown>;
        parche?: Record<string, unknown>;
        eliminar: boolean;
        single: boolean;
      } = { eqs: [], eliminar: false, single: false };
      const b: Record<string, unknown> = {
        select: () => b,
        or: (filtro: string) => {
          st.or = filtro;
          grab.filtrosOr.push(filtro);
          return b;
        },
        eq: (col: string, valor: unknown) => {
          st.eqs = [...st.eqs, [col, valor] as const];
          grab.filtrosEq.push([col, valor] as const);
          return b;
        },
        is: () => b,
        in: () => b,
        order: () => b,
        limit: () => b,
        insert: (fila: Record<string, unknown>) => {
          st.filaInsert = { ...fila };
          return b;
        },
        update: (parche: Record<string, unknown>) => {
          st.parche = { ...parche };
          return b;
        },
        delete: () => {
          st.eliminar = true;
          return b;
        },
        // Aserción implícita: si alguien reintroduce upsert, ESTO revienta la prueba.
        upsert: () => {
          grab.upserts += 1;
          throw new Error('UPSERT PROHIBIDO (Etapa 4: creación = INSERT puro)');
        },
        single: () => {
          st.single = true;
          return b;
        },
        then: (
          onok: (v: { data: unknown; error: unknown }) => unknown,
          onrej?: (x: unknown) => unknown,
        ) =>
          Promise.resolve()
            .then(() => {
              if (st.eliminar) {
                const objetivo = aplicarEq(filasUnidades, st.eqs);
                filasUnidades = filasUnidades.filter((f) => !objetivo.includes(f));
                return { data: objetivo.map((f) => ({ ...f })), error: null };
              }
              if (st.filaInsert !== undefined) {
                const fila = st.filaInsert;
                if (estado.falloInsert) {
                  return { data: null, error: { message: 'Fallo simulado de persistencia (cliente falso)' } };
                }
                if (filasUnidades.some((f) => f['id'] === fila['id'])) {
                  return { data: null, error: { message: '[23505] duplicate key value: id' } };
                }
                if (filasUnidades.some((f) => f['code'] === fila['code'])) {
                  return { data: null, error: { message: '[23505] duplicate key value: uq_gestor_unidades_code' } };
                }
                grab.inserts.push({ ...fila });
                filasUnidades.push({ ...fila, created_at: new Date().toISOString() });
                const filaGuardada = filasUnidades[filasUnidades.length - 1] ?? fila;
                return { data: st.single ? { ...filaGuardada } : [{ ...filaGuardada }], error: null };
              }
              if (st.parche !== undefined) {
                const objetivo = aplicarEq(filasUnidades, st.eqs);
                for (const fila of objetivo) Object.assign(fila, st.parche);
                return { data: objetivo.map((f) => ({ ...f })), error: null };
              }
              return { data: aplicarOr(st.or, aplicarEq(filasUnidades, st.eqs)).map((f) => ({ ...f })), error: null };
            })
            .then(onok, onrej),
      };
      return b;
    }
    throw new Error(`tabla no mockeada en pruebas: ${tabla}`);
  };

  clienteFalso = {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: estado.userId ? { id: estado.userId, email: estado.email } : null },
          error: null,
        }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
    from: (tabla: string) => desde(tabla),
    rpc: (fn: string) => {
      if (fn === 'user_app_role') return Promise.resolve({ data: estado.rolApp, error: null });
      if (fn === 'user_can_use_app') return Promise.resolve({ data: estado.puedeUsarApp, error: null });
      return Promise.resolve({ data: null, error: { message: `rpc no mockeado: ${fn}` } });
    },
  } as unknown as SupabaseClient;
  return clienteFalso;
}

/** Instala la sesión/estado indicado y refresca filas + grabaciones + caché. */
function instalarSesion(parche: Partial<EstadoSesion> = {}): void {
  estado = {
    userId: 'user-a',
    email: 'a@test.com',
    perfil: { tenant_id: TENANT_A, is_platform_admin: false },
    rolApp: 'editor',
    puedeUsarApp: true,
    falloInsert: false,
    ...parche,
  };
  grab = { inserts: [], upserts: 0, filtrosOr: [], filtrosEq: [] };
  filasUnidades = filasGestorUnidades();
  h.cliente = asegurarClienteFalso(); // MISMO objeto siempre (singleton del adaptador)
  invalidarContexto();
}

// ---------------------------------------------------------------------------
// AlmacenFalso (adaptador in-memory fiel al DDL; patrón de organizacionEscritura.test)
// ---------------------------------------------------------------------------

class AlmacenFalso implements AdaptadorBD {
  filas: Array<Record<string, unknown>>;
  columnaOrden = true;
  /** Número de llamada a insertar (1-based) que falla; null = ninguna. */
  falloEnInsert: number | null = null;
  private contadorInsert = 0;
  private reloj = 900;

  constructor() {
    this.filas = [
      ...Array.from({ length: 251 }, (_, i) => {
        const n = String(i + 1).padStart(3, '0');
        return {
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
          orden: null,
          created_at: `2025-01-01T00:00:00.${n}Z`,
        } as Record<string, unknown>;
      }),
      {
        id: 'ajena-b', tenant_id: TENANT_B, parent_unit_id: null, name: 'Sede B',
        code: 'SEDE-B-BB01', unit_type: 'central', region: null, macroregion: null,
        address: null, status: 'active', metadata: {}, orden: 1,
        created_at: '2025-02-01T00:00:00.000Z',
      },
    ];
  }

  conteoSemillas(): number {
    return this.filas.filter((f) => f['tenant_id'] === null && String(f['id']).startsWith('unit-')).length;
  }

  async seleccionar(tabla: string, consulta: ConsultaSeleccion): Promise<Array<Record<string, unknown>>> {
    if (tabla !== TABLA_UNIDADES) throw new Error(`tabla no mockeada: ${tabla}`);
    const pideOrden = consulta.columnas.split(',').some((c) => c.trim() === 'orden');
    if (!this.columnaOrden && pideOrden) {
      throw new ErrorBD({ code: '42703', message: 'column gestor_unidades.orden does not exist' });
    }
    let resultado = this.filas.filter((fila) => {
      for (const [col, valor] of consulta.eq ?? []) {
        if (valor === null ? fila[col] !== null : fila[col] !== valor) return false;
      }
      for (const col of consulta.isNull ?? []) {
        if (fila[col] !== null) return false;
      }
      for (const [col, valores] of consulta.in ?? []) {
        if (!valores.includes(fila[col])) return false;
      }
      return true;
    });
    if (consulta.limit !== undefined) resultado = resultado.slice(0, consulta.limit);
    return resultado.map((f) => ({ ...f }));
  }

  async insertar(tabla: string, fila: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (tabla !== TABLA_UNIDADES) throw new Error(`tabla no mockeada: ${tabla}`);
    this.contadorInsert += 1;
    if (this.filas.some((f) => f['id'] === fila['id'])) {
      throw new ErrorBD({ code: '23505', message: 'duplicate key value violates unique constraint "gestor_unidades_pkey"' });
    }
    if (this.filas.some((f) => f['code'] === fila['code'])) {
      throw new ErrorBD({ code: '23505', message: 'duplicate key value violates unique constraint "uq_gestor_unidades_code"' });
    }
    if (this.falloEnInsert !== null && this.contadorInsert === this.falloEnInsert) {
      throw new ErrorBD({ code: 'XX000', message: `Fallo simulado en el INSERT #${this.contadorInsert}` });
    }
    const nueva: Record<string, unknown> = {
      region: null,
      macroregion: null,
      address: null,
      status: 'active',
      metadata: null,
      orden: null,
      created_at: `2026-06-01T00:00:00.${String(++this.reloj).padStart(4, '0')}Z`,
      ...fila,
    };
    this.filas.push(nueva);
    return { ...nueva };
  }

  async actualizar(
    tabla: string,
    parche: Record<string, unknown>,
    filtros: { eq: Array<readonly [string, unknown]> },
  ): Promise<Array<Record<string, unknown>>> {
    if (tabla !== TABLA_UNIDADES) throw new Error(`tabla no mockeada: ${tabla}`);
    const afectadas = this.filas.filter((fila) =>
      filtros.eq.every(([col, valor]) => fila[col] === valor),
    );
    for (const fila of afectadas) Object.assign(fila, parche);
    return afectadas.map((f) => ({ ...f }));
  }

  async eliminar(
    tabla: string,
    filtros: { eq: Array<readonly [string, unknown]> },
  ): Promise<Array<Record<string, unknown>>> {
    if (tabla !== TABLA_UNIDADES) throw new Error(`tabla no mockeada: ${tabla}`);
    const objetivo = this.filas.filter((fila) =>
      filtros.eq.every(([col, valor]) => fila[col] === valor),
    );
    this.filas = this.filas.filter((f) => !objetivo.includes(f));
    return objetivo.map((f) => ({ ...f }));
  }
}

// ---------------------------------------------------------------------------
// Los 13 escenarios
// ---------------------------------------------------------------------------

beforeEach(() => {
  h.cliente = asegurarClienteFalso(); // objeto ESTABLE; instalarSesion resetea el estado
  invalidarContexto();
});

describe('1 · Usuario SIN sesión', () => {
  it('resuelve contexto null y BLOQUEA lectura, escritura y verificación', async () => {
    instalarSesion({ userId: '' });
    await expect(resolverContextoSesion()).resolves.toBeNull();
    await expect(listGestorUnits()).rejects.toMatchObject({ codigo: 'SIN_SESION' });
    await expect(createGestorUnit({ name: 'X', unitType: 'central' })).rejects.toMatchObject({ codigo: 'SIN_SESION' });
    expect(await verificarAutorizacionSesion(TENANT_A)).toBe(false);
  });

  it('vía 2b runtime sin sesión ⇒ AUTORIZACION_DENEGADA (jamás continúa)', async () => {
    instalarSesion({ userId: '' });
    await expect(
      renombrarUnidad({ tenantId: TENANT_A, unidadId: 'propia-1', nuevoNombre: 'Y' }),
    ).rejects.toMatchObject({ codigoError: 'AUTORIZACION_DENEGADA' });
  });
});

describe('2 · Usuario SIN acceso a la app (sin rol ni suscripción)', () => {
  it('lectura y escritura denegadas (SIN_ACCESO_APP)', async () => {
    instalarSesion({ puedeUsarApp: false, rolApp: null });
    await expect(listGestorUnits()).rejects.toMatchObject({ codigo: 'SIN_ACCESO_APP' });
    await expect(createGestorUnit({ name: 'X', unitType: 'central' })).rejects.toMatchObject({ codigo: 'SIN_ACCESO_APP' });
    expect(grab.inserts).toHaveLength(0);
  });
});

describe('3 · Usuario con rol viewer', () => {
  it('puede LEER lo propio + catálogo nacional (filtro or verificado), nunca lo ajeno', async () => {
    instalarSesion({ rolApp: 'viewer' });
    const unidades = await listGestorUnits();
    const ids = unidades.map((u) => u.id).sort();
    expect(ids).toEqual(['propia-1', 'propia-2', 'unit-001', 'unit-002']);
    expect(grab.filtrosOr).toEqual([`tenant_id.is.null,tenant_id.eq.${TENANT_A}`]);
  });

  it('NO puede escribir (ROL_INSUFICIENTE en servicio y vía 2b runtime)', async () => {
    instalarSesion({ rolApp: 'viewer' });
    await expect(createGestorUnit({ name: 'X', unitType: 'central' })).rejects.toMatchObject({ codigo: 'ROL_INSUFICIENTE' });
    expect(grab.inserts).toHaveLength(0);
    expect(await verificarAutorizacionSesion(TENANT_A)).toBe(false);
    await expect(
      renombrarUnidad({ tenantId: TENANT_A, unidadId: 'propia-1', nuevoNombre: 'Y' }),
    ).rejects.toMatchObject({ codigoError: 'AUTORIZACION_DENEGADA' });
  });
});

describe('4 · Usuario con rol editor', () => {
  it('lee lo propio + nacional y crea con tenant AUTENTICADO (INSERT puro, sin upsert)', async () => {
    instalarSesion({ rolApp: 'editor' });
    const unidades = await listGestorUnits();
    expect(unidades.map((u) => u.id)).not.toContain('ajena-1');

    const creada = await createGestorUnit({ name: 'Nueva Sede Editor', unitType: 'central' });
    expect(creada.name).toBe('Nueva Sede Editor');
    expect(grab.inserts).toHaveLength(1);
    expect(grab.inserts[0]?.['tenant_id']).toBe(TENANT_A); // identidad real, jamás otro tenant
    expect(grab.upserts).toBe(0); // el upsert falso LANZA: haberlo llamado rompería la prueba
  });

  it('un tenantId de parámetro ajeno ⇒ TENANT_AJENO sin tocar BD', async () => {
    instalarSesion({ rolApp: 'editor' });
    await expect(
      createGestorUnit({ name: 'X', unitType: 'central', tenantId: TENANT_B }),
    ).rejects.toMatchObject({ codigo: 'TENANT_AJENO' });
    expect(grab.inserts).toHaveLength(0);
  });
});

describe('5 · Usuario con rol admin', () => {
  it('autorización verdadera por callback de sesión y escritura runtime completa', async () => {
    instalarSesion({ rolApp: 'admin' });
    expect(await verificarAutorizacionSesion(TENANT_A)).toBe(true);
    expect(await verificarAutorizacionSesion(TENANT_B)).toBe(false);

    // Escritura runtime completa (sin db inyectada: adaptador por defecto sobre el cliente falso)
    const unidad = await crearUnidad({ tenantId: TENANT_A, name: 'Sede Admin', unitType: 'ugel' });
    expect(unidad.name).toBe('Sede Admin');
    expect(grab.inserts).toHaveLength(1);
    expect(grab.inserts[0]?.['tenant_id']).toBe(TENANT_A);
    expect(grab.upserts).toBe(0);
  });

  it('renombrar runtime verifica sesión y actualiza con id+tenant (1 fila)', async () => {
    instalarSesion({ rolApp: 'admin' });
    const r = await renombrarUnidad({ tenantId: TENANT_A, unidadId: 'propia-1', nuevoNombre: 'Renombrada' });
    expect(r.name).toBe('Renombrada');
    expect(grab.upserts).toBe(0);
  });
});

describe('6 · Administrador de plataforma', () => {
  it('lee TODAS las unidades sin filtro de tenant', async () => {
    instalarSesion({
      perfil: { tenant_id: null, is_platform_admin: true },
      rolApp: null,
      puedeUsarApp: false,
    });
    const unidades = await listGestorUnits();
    expect(unidades.map((u) => u.id).sort()).toEqual(
      ['ajena-1', 'propia-1', 'propia-2', 'unit-001', 'unit-002'],
    );
    expect(grab.filtrosOr).toHaveLength(0);
    expect(grab.filtrosEq).toHaveLength(0);
  });

  it('puede crear unidad de catálogo nacional (tenant NULL) y de cualquier empresa', async () => {
    instalarSesion({
      perfil: { tenant_id: null, is_platform_admin: true },
      rolApp: null,
      puedeUsarApp: false,
    });
    const nacional = await createGestorUnit({ name: 'Nueva GRE', unitType: 'dre' });
    expect(grab.inserts[0]?.['tenant_id']).toBeNull();

    const deB = await createGestorUnit({ name: 'Sede B Plataforma', unitType: 'central', tenantId: TENANT_B });
    expect(grab.inserts[1]?.['tenant_id']).toBe(TENANT_B);
    expect(nacional.tenantId).toBeNull();
    expect(deB.tenantId).toBe(TENANT_B);
    expect(grab.upserts).toBe(0);
  });
});

describe('7 · Empresa A consultando unidades de B', () => {
  it('parámetro de otra empresa ⇒ TENANT_AJENO; lectura normal jamás incluye filas de B', async () => {
    instalarSesion({ rolApp: 'viewer' });
    await expect(listGestorUnits(TENANT_B)).rejects.toMatchObject({ codigo: 'TENANT_AJENO' });

    const unidades = await listGestorUnits(null);
    expect(unidades.map((u) => u.id)).not.toContain('ajena-1');
  });

  it('lectura jerárquica runtime: SOLO filas propias (el catálogo nacional no contamina la numeración)', async () => {
    instalarSesion({ rolApp: 'editor' });
    const propias = await listarUnidadesParaJerarquia({ tenantId: TENANT_A });
    expect(propias.map((u) => u.id).sort()).toEqual(['propia-1', 'propia-2']);
  });
});

describe('8 · Empresa A modificando/eliminando unidades de B', () => {
  it('runtime: sesión de A no autoriza operar sobre B (AUTORIZACION_DENEGADA, BD intacta)', async () => {
    instalarSesion({ rolApp: 'admin' });
    await expect(
      renombrarUnidad({ tenantId: TENANT_B, unidadId: 'ajena-1', nuevoNombre: 'Hack' }),
    ).rejects.toMatchObject({ codigoError: 'AUTORIZACION_DENEGADA' });
    expect(grab.inserts).toHaveLength(0);
  });

  it('contrato 2b con callback explícito en false ⇒ AUTORIZACION_DENEGADA', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    await expect(
      crearUnidad({
        tenantId: TENANT_B,
        name: 'Unidad pirata',
        unitType: 'ugel',
        db: almacen,
        verificarAutorizacion: () => false,
      }),
    ).rejects.toMatchObject({ codigoError: 'AUTORIZACION_DENEGADA' });
  });

  it('crearHija bajo una unidad de B ⇒ FUERA_DE_TENANT (padre verificado)', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    await expect(
      crearUnidad({
        tenantId: TENANT_A,
        name: 'Hija pirata',
        unitType: 'ugel',
        parentUnitId: 'ajena-b',
        db: almacen,
      }),
    ).rejects.toMatchObject({ codigoError: 'FUERA_DE_TENANT' });
  });
});

describe('9 · Intento de modificar las 251 unidades nacionales (tenant NULL)', () => {
  it('renombrar una semilla desde una cuenta de empresa ⇒ FUERA_DE_TENANT y semillas intactas', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    const antes = almacen.conteoSemillas();
    await expect(
      renombrarUnidad({ tenantId: TENANT_A, unidadId: 'unit-001', nuevoNombre: 'Semilla Hack', db: almacen }),
    ).rejects.toMatchObject({ codigoError: 'FUERA_DE_TENANT' });
    expect(almacen.conteoSemillas()).toBe(antes);
    expect(antes).toBe(251);
  });

  it('colgar empresa bajo semilla ⇒ rechazado (sin hijos de empresa bajo el catálogo)', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    await expect(
      crearUnidad({
        tenantId: TENANT_A,
        name: 'Hija de semilla',
        unitType: 'ugel',
        parentUnitId: 'unit-002',
        db: almacen,
      }),
    ).rejects.toMatchObject({ codigoError: 'FUERA_DE_TENANT' });
  });
});

describe('10 · Insert sin tenant', () => {
  it('empresa sin tenantId en el payload ⇒ se estampa el tenant AUTENTICADO (obligatorio)', async () => {
    instalarSesion({ rolApp: 'editor' });
    await createGestorUnit({ name: 'Sede sin tenant', unitType: 'central' });
    expect(grab.inserts[0]?.['tenant_id']).toBe(TENANT_A);
  });

  it('vía 2b: tenantId vacío ⇒ TENANT_INVALIDO (jamás NULL)', async () => {
    instalarSesion({ rolApp: 'editor' });
    const almacen = new AlmacenFalso();
    await expect(
      crearUnidad({ tenantId: '   ', name: 'X', unitType: 'ugel', db: almacen }),
    ).rejects.toMatchObject({ codigoError: 'TENANT_INVALIDO' });
  });
});

describe('11 · Sesión compartida con Qaway Hub (cableado)', () => {
  it('el módulo usa el MISMO proyecto y la MISMA storageKey por defecto que el Hub (sin key propia)', async () => {
    const modulo = (await vi.importActual('./supabaseClient')) as {
      supabase: { supabaseUrl: string; auth: { storageKey: string } } | null;
    };
    const hub = (await vi.importActual('../../../../../config/supabase')) as {
      supabase: { supabaseUrl: string; auth: { storageKey: string } };
    };
    expect(modulo.supabase).not.toBeNull();
    expect(hub.supabase).not.toBeNull();
    expect(modulo.supabase?.supabaseUrl).toBe(hub.supabase.supabaseUrl);
    expect(modulo.supabase?.auth.storageKey).toBe(hub.supabase.auth.storageKey);
    // storageKey por defecto ⇒ formato sb-<ref>-auth-token (una sola sesión compartida)
    const ref = new URL(hub.supabase.supabaseUrl).hostname.split('.')[0];
    expect(hub.supabase.auth.storageKey).toBe(`sb-${ref}-auth-token`);
  });
});

describe('12 · Fallos de persistencia y compensación de lotes', () => {
  it('fallo de INSERT en createGestorUnit ⇒ se PROPAGA (sin fallback local silencioso)', async () => {
    instalarSesion({ rolApp: 'editor', falloInsert: true });
    await expect(
      createGestorUnit({ name: 'Sede fantasma', unitType: 'central' }),
    ).rejects.toThrow(/No se pudo crear la unidad/);
    expect(grab.inserts).toHaveLength(0); // el fallo llegó al cliente: nada se "fingió" guardado
  });

  it('fallo a mitad de lote ⇒ INSERCION_LOTE con compensación verificada (0 restos, 251 semillas intactas)', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    almacen.falloEnInsert = 2; // el 2º INSERT del lote falla
    const borradores: GestorUnitBorrador[] = [
      {
        key: 'raiz', name: 'Sede Lote Prueba', unitType: 'central', parentKey: null,
        metadata: { plantilla: { origen: 'ninguna', version: 'test-1', nombre_original: 'Prueba', key_plantilla: 'prueba' } },
      },
      {
        key: 'hija', name: 'Obra Lote Prueba', unitType: 'obra', parentKey: 'raiz',
        metadata: { plantilla: { origen: 'ninguna', version: 'test-1', nombre_original: 'Prueba', key_plantilla: 'prueba' } },
      },
    ];
    await expect(
      crearEstructuraDesdePlantilla({ origen: 'desde-cero', tenantId: TENANT_A, borradoresPersonalizados: borradores, db: almacen }),
    ).rejects.toMatchObject({ codigoError: 'INSERCION_LOTE' });
    expect(almacen.filas.filter((f) => f['tenant_id'] === TENANT_A)).toHaveLength(0); // lote revertido
    expect(almacen.conteoSemillas()).toBe(251);
    expect(grab.upserts).toBe(0);
  });

  it('el bloqueo MIGRACION_0005_PENDIENTE se MANTIENE hasta aplicar 0005', async () => {
    instalarSesion({ rolApp: 'admin' });
    const almacen = new AlmacenFalso();
    almacen.columnaOrden = false;
    await expect(
      reordenarHermanos({ tenantId: TENANT_A, parentUnitId: null, idsEnNuevoOrden: ['x'], db: almacen }),
    ).rejects.toMatchObject({ codigoError: 'MIGRACION_0005_PENDIENTE' });
  });
});

describe('13 · Regresión de los consumidores existentes', () => {
  it('listGestorUnits() (sin argumento) mantiene el contrato de las 4 vistas/Sidebar/equipo', async () => {
    instalarSesion({ rolApp: 'viewer' });
    const unidades = await listGestorUnits();
    for (const u of unidades) {
      expect(typeof u.name).toBe('string');
      expect(u.unitType).toBeTruthy();
      expect(u.status).toBeTruthy();
      expect('region' in u).toBe(true);
      expect('metadata' in u).toBe(true);
    }
    // la vista de tareas filtra archived y mapea name/region/unitType/status
    const mapeoVista = unidades
      .filter((u) => u.status !== 'archived')
      .map((u) => ({ name: u.name, region: u.region, unitType: u.unitType, status: u.status }));
    expect(mapeoVista.length).toBeGreaterThan(0);
  });

  it('el ErrorSesion es un Error normal: los try/catch existentes lo toleran sin romperse', async () => {
    instalarSesion({ userId: '' });
    try {
      await listGestorUnits();
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(ErrorSesion);
      expect((e as Error).message.length).toBeGreaterThan(0);
    }
  });

  it('contrato 2b con adaptador inyectado NO cambia (vista global del adaptador incluye semillas)', async () => {
    instalarSesion({ rolApp: 'editor' });
    const almacen = new AlmacenFalso();
    const globales = await listarUnidadesParaJerarquia({ db: almacen });
    expect(globales.some((u) => u.id === 'unit-001')).toBe(true);
    expect(globales.some((u) => u.id === 'ajena-b')).toBe(true);
    const propias = await listarUnidadesParaJerarquia({ tenantId: TENANT_A, db: almacen });
    expect(propias.every((u) => u.tenantId === TENANT_A || u.tenantId === null)).toBe(true);
    expect(propias).toHaveLength(0); // el almacen de este test no tiene filas de A
  });
});
