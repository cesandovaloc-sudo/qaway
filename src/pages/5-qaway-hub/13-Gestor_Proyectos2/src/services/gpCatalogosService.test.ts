/**
 * gpCatalogosService.test.ts
 * =========================
 * PRUEBAS UNITARIAS SIN RED del núcleo de gpCatalogosService.ts (Etapa 6):
 * evaluación de la respuesta cruda, orden de presentación, caché de sesión,
 * dedup en vuelo y la regla "el error NO se cachea". El cliente Supabase REAL
 * no participa (fetcher falso); la lectura real con RLS es un procedimiento
 * manual en Supabase (doc 6.1 §SQL/producción) — nunca se declara validada aquí.
 */

import { describe, it, expect, vi } from 'vitest';

import {
  crearListadorCatalogo,
  evaluarFilasCatalogo,
  TABLA_ESTADOS_REUNION,
  TABLA_PRIORIDADES,
  TABLA_TIPOS_ARCHIVO,
  TABLA_TIPOS_AVANCE,
  TABLA_TIPOS_REUNION,
  type FetchCatalogo,
} from './gpCatalogosService';

// Seeds vivos del BLOQUE A (000022/000023), en el orden de `orden` de cada tabla.
const SEED_TIPOS_REUNION = [
  { codigo: 'KICKOFF', nombre: 'Kickoff meeting', alias: 'Reunión de inicio', orden: 1, activo: true },
  { codigo: 'SEGUIMIENTO', nombre: 'Status meeting', alias: 'Reunión de seguimiento', orden: 2, activo: true },
  { codigo: 'COMITE', nombre: 'Steering committee', alias: 'Comité directivo', orden: 3, activo: true },
  { codigo: 'PLANIFICACION', nombre: 'Planning session', alias: 'Sesión de planificación', orden: 4, activo: true },
  { codigo: 'REVISION', nombre: 'Review meeting', alias: 'Reunión de revisión', orden: 5, activo: true },
  { codigo: 'RETROSPECTIVA', nombre: 'Retrospective', alias: 'Retrospectiva', orden: 6, activo: true },
  { codigo: 'CIERRE', nombre: 'Closure meeting', alias: 'Reunión de cierre', orden: 7, activo: true },
  { codigo: 'DAILY', nombre: 'Daily standup', alias: 'Reunión diaria', orden: 8, activo: true },
];

const SEED_ESTADOS_REUNION = [
  { codigo: 'PROGRAMADA', nombre: 'Scheduled', alias: 'Programada', orden: 1, activo: true },
  { codigo: 'EN_CURSO', nombre: 'In progress', alias: 'En curso', orden: 2, activo: true },
  { codigo: 'REALIZADA', nombre: 'Completed', alias: 'Realizada', orden: 3, activo: true },
  { codigo: 'CANCELADA', nombre: 'Cancelled', alias: 'Cancelada', orden: 4, activo: true },
  { codigo: 'POSPUESTA', nombre: 'Postponed', alias: 'Pospuesta', orden: 5, activo: true },
  { codigo: 'REPROGRAMADA', nombre: 'Rescheduled', alias: 'Reprogramada', orden: 6, activo: true },
];

const SEED_TIPOS_AVANCE = [
  { codigo: 'FISICO', nombre: 'Physical progress', alias: 'Avance físico', orden: 1, activo: true },
  { codigo: 'FINANCIERO', nombre: 'Financial progress', alias: 'Avance financiero', orden: 2, activo: true },
  { codigo: 'HITO', nombre: 'Milestone', alias: 'Hito alcanzado', orden: 3, activo: true },
  { codigo: 'CRONOGRAMA', nombre: 'Schedule progress', alias: 'Avance de cronograma', orden: 4, activo: true },
  { codigo: 'COSTO', nombre: 'Cost progress', alias: 'Avance de costo', orden: 5, activo: true },
  { codigo: 'CALIDAD', nombre: 'Quality progress', alias: 'Avance de calidad', orden: 6, activo: true },
];

const SEED_TIPOS_ARCHIVO = [
  { codigo: 'PLANO', nombre: 'Drawing', alias: 'Plano', orden: 1, activo: true },
  { codigo: 'CONTRATO', nombre: 'Contract', alias: 'Contrato', orden: 2, activo: true },
  { codigo: 'FOTO', nombre: 'Photo', alias: 'Fotografía', orden: 3, activo: true },
  { codigo: 'ACTA', nombre: 'Minutes', alias: 'Acta', orden: 4, activo: true },
  { codigo: 'INFORME', nombre: 'Report', alias: 'Informe', orden: 5, activo: true },
  { codigo: 'CORRESPONDENCIA', nombre: 'Correspondence', alias: 'Correspondencia', orden: 6, activo: true },
  { codigo: 'OTRO', nombre: 'Other', alias: 'Otro', orden: 7, activo: true },
];

const SEED_PRIORIDADES = [
  { codigo: 'baja', nombre: 'Baja', nivel: 1, orden: 0, activo: true },
  { codigo: 'media', nombre: 'Media', nivel: 2, orden: 0, activo: true },
  { codigo: 'alta', nombre: 'Alta', nivel: 3, orden: 0, activo: true },
  { codigo: 'urgente', nombre: 'Urgente', nivel: 4, orden: 0, activo: true },
];

describe('evaluarFilasCatalogo (núcleo puro)', () => {
  it('error ⇒ estado error (nada se inventa)', () => {
    const r = evaluarFilasCatalogo(null, 'PGRST205: relation no existe');
    expect(r.estado).toBe('error');
    if (r.estado === 'error') expect(r.mensaje).toContain('PGRST205');
  });

  it('sin filas ⇒ vacio (p. ej. gp_tipos_proyecto_c vacía por diseño)', () => {
    expect(evaluarFilasCatalogo([], null).estado).toBe('vacio');
    expect(evaluarFilasCatalogo(null, null).estado).toBe('vacio');
  });

  it('seed de gp_prioridades_c ⇒ lista ordenada por nivel (baja→urgente)', () => {
    const r = evaluarFilasCatalogo(SEED_PRIORIDADES, null);
    expect(r.estado).toBe('lista');
    if (r.estado === 'lista') {
      expect(r.valores.map((v) => v.codigo)).toEqual(['baja', 'media', 'alta', 'urgente']);
      expect(r.valores.map((v) => v.nivel)).toEqual([1, 2, 3, 4]);
    }
  });

  it('filas inválidas se descartan; filas sin nivel/orden se normalizan a null', () => {
    const r = evaluarFilasCatalogo(
      [null, { codigo: '', nombre: 'X' }, { codigo: 'ok', nombre: 'Ok', orden: 2 }, { foo: 1 }],
      null,
    );
    expect(r.estado).toBe('lista');
    if (r.estado === 'lista') {
      expect(r.valores).toHaveLength(1);
      expect(r.valores[0]).toEqual({
        codigo: 'ok',
        nombre: 'Ok',
        alias: null,
        icono: null,
        categoriaCodigo: null,
        alcance: null,
        nivel: null,
        orden: 2,
      });
    }
  });

  it('estados sin nivel conservan el orden de llegada (orden todos 0)', () => {
    const r = evaluarFilasCatalogo(
      [
        { codigo: 'pendiente', nombre: 'Pendiente', orden: 0 },
        { codigo: 'en_proceso', nombre: 'En proceso', orden: 0 },
      ],
      null,
    );
    expect(r.estado).toBe('lista');
    if (r.estado === 'lista') {
      expect(r.valores.map((v) => v.codigo)).toEqual(['pendiente', 'en_proceso']);
      expect(r.valores.every((v) => v.nivel === null)).toBe(true);
    }
  });

  it('orden de presentación: mayor orden va al final aunque llegue primero', () => {
    const r = evaluarFilasCatalogo(
      [
        { codigo: 'b', nombre: 'B', orden: 5 },
        { codigo: 'a', nombre: 'A', orden: 1 },
      ],
      null,
    );
    if (r.estado === 'lista') expect(r.valores.map((v) => v.codigo)).toEqual(['a', 'b']);
    else throw new Error('esperaba lista');
  });
});

describe('BLOQUE A · catálogos 9–12 (núcleo y enrutado por tabla)', () => {
  it('tipos de reunión: 8 códigos en orden de presentación (KICKOFF→DAILY)', () => {
    const r = evaluarFilasCatalogo(SEED_TIPOS_REUNION, null);
    expect(r.estado).toBe('lista');
    if (r.estado !== 'lista') throw new Error('esperaba lista');
    expect(r.valores.map((v) => v.codigo)).toEqual([
      'KICKOFF',
      'SEGUIMIENTO',
      'COMITE',
      'PLANIFICACION',
      'REVISION',
      'RETROSPECTIVA',
      'CIERRE',
      'DAILY',
    ]);
    expect(r.valores[0]?.alias).toBe('Reunión de inicio');
  });

  it('estados de reunión: 6 códigos y alias en español', () => {
    const r = evaluarFilasCatalogo(SEED_ESTADOS_REUNION, null);
    expect(r.estado).toBe('lista');
    if (r.estado !== 'lista') throw new Error('esperaba lista');
    expect(r.valores.map((v) => v.codigo)).toEqual([
      'PROGRAMADA',
      'EN_CURSO',
      'REALIZADA',
      'CANCELADA',
      'POSPUESTA',
      'REPROGRAMADA',
    ]);
    expect(r.valores.map((v) => v.alias)).toContain('En curso');
  });

  it('tipos de avance (6) y tipos de archivo (7) llegan completos', () => {
    const avance = evaluarFilasCatalogo(SEED_TIPOS_AVANCE, null);
    const archivo = evaluarFilasCatalogo(SEED_TIPOS_ARCHIVO, null);
    expect(avance.estado).toBe('lista');
    expect(archivo.estado).toBe('lista');
    if (avance.estado !== 'lista' || archivo.estado !== 'lista') throw new Error('esperaba lista');
    expect(avance.valores).toHaveLength(6);
    expect(archivo.valores).toHaveLength(7);
    expect(archivo.valores.map((v) => v.codigo)).toContain('CORRESPONDENCIA');
  });

  it('cada constante de tabla 9–12 se enruta a su propio catálogo (sin colisión de caché)', async () => {
    const POR_TABLA: Record<string, unknown> = {
      [TABLA_TIPOS_REUNION]: SEED_TIPOS_REUNION,
      [TABLA_ESTADOS_REUNION]: SEED_ESTADOS_REUNION,
      [TABLA_TIPOS_AVANCE]: SEED_TIPOS_AVANCE,
      [TABLA_TIPOS_ARCHIVO]: SEED_TIPOS_ARCHIVO,
    };
    const pedidas: string[] = [];
    const { listar } = crearListadorCatalogo((tabla) => {
      pedidas.push(tabla);
      return Promise.resolve({ filas: POR_TABLA[tabla] ?? null, error: null });
    });

    const reunion = await listar(TABLA_TIPOS_REUNION);
    const estado = await listar(TABLA_ESTADOS_REUNION);
    const avance = await listar(TABLA_TIPOS_AVANCE);
    const archivo = await listar(TABLA_TIPOS_ARCHIVO);

    expect(pedidas).toEqual([TABLA_TIPOS_REUNION, TABLA_ESTADOS_REUNION, TABLA_TIPOS_AVANCE, TABLA_TIPOS_ARCHIVO]);
    expect(reunion.estado).toBe('lista');
    if (reunion.estado === 'lista') expect(reunion.valores).toHaveLength(8);
    if (estado.estado === 'lista') expect(estado.valores).toHaveLength(6);
    if (avance.estado === 'lista') expect(avance.valores).toHaveLength(6);
    if (archivo.estado === 'lista') expect(archivo.valores).toHaveLength(7);
  });
});

describe('crearListadorCatalogo (caché + dedup + error sin caché)', () => {
  function fetcherFalso(respuesta: FetchCatalogo, alLlamar?: () => void) {
    let llamadas = 0;
    return (tabla: string): Promise<FetchCatalogo> => {
      llamadas += 1;
      alLlamar?.();
      void tabla;
      return Promise.resolve(respuesta);
    };
  }

  it('cachea lista/vacio: la 2ª llamada no re-consulta', async () => {
    let llamadas = 0;
    const { listar } = crearListadorCatalogo(
      fetcherFalso({ filas: SEED_PRIORIDADES, error: null }, () => {
        llamadas += 1;
      }),
    );
    const r1 = await listar(TABLA_PRIORIDADES);
    const r2 = await listar(TABLA_PRIORIDADES);
    expect(llamadas).toBe(1);
    expect(r1.estado).toBe('lista');
    expect(r2.estado).toBe('lista');
  });

  it('deduplica peticiones en vuelo (misma promesa compartida)', async () => {
    let llamadas = 0;
    let liberar!: (f: FetchCatalogo) => void;
    const pendiente = new Promise<FetchCatalogo>((resolve) => {
      liberar = resolve;
    });
    const { listar } = crearListadorCatalogo(() => {
      llamadas += 1;
      return pendiente;
    });
    const p1 = listar(TABLA_PRIORIDADES);
    const p2 = listar(TABLA_PRIORIDADES);
    liberar({ filas: SEED_PRIORIDADES, error: null });
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(llamadas).toBe(1);
    expect(r1.estado).toBe('lista');
    expect(r2.estado).toBe('lista');
  });

  it('error NO se cachea: la siguiente llamada re-consulta (reintento natural)', async () => {
    let llamadas = 0;
    const { listar } = crearListadorCatalogo(() => {
      llamadas += 1;
      return llamadas === 1
        ? Promise.resolve({ filas: null, error: 'PGRST205 (gp_prioridades_c sin 0007)' })
        : Promise.resolve({ filas: SEED_PRIORIDADES, error: null });
    });
    const r1 = await listar(TABLA_PRIORIDADES);
    expect(r1.estado).toBe('error');
    const r2 = await listar(TABLA_PRIORIDADES);
    expect(llamadas).toBe(2);
    expect(r2.estado).toBe('lista');
  });

  it('invalidar() fuerza re-consulta aunque haya lista cacheada', async () => {
    let llamadas = 0;
    const instancia = crearListadorCatalogo(
      fetcherFalso({ filas: SEED_PRIORIDADES, error: null }, () => {
        llamadas += 1;
      }),
    );
    await instancia.listar(TABLA_PRIORIDADES);
    instancia.invalidar();
    await instancia.listar(TABLA_PRIORIDADES);
    expect(llamadas).toBe(2);
  });

  it('registra console.warn cuando el catálogo no está disponible', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { listar } = crearListadorCatalogo(() =>
      Promise.resolve({ filas: null, error: 'RLS sin política de lectura (0004 sin aplicar)' }),
    );
    await listar(TABLA_PRIORIDADES);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain(TABLA_PRIORIDADES);
    warn.mockRestore();
  });
});
