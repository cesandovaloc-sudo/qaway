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
  TABLA_PRIORIDADES,
  type FetchCatalogo,
} from './gpCatalogosService';

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
      expect(r.valores[0]).toEqual({ codigo: 'ok', nombre: 'Ok', nivel: null, orden: 2 });
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
