/**
 * gpPermisosService.test.ts — Etapa 6-B
 * ====================================
 * PRUEBAS SIN RED de la capa PURA del servicio de permisos granulares:
 * normalización del jsonb permissions (shape objeto vivo y array), matriz de
 * capacidades del modelo del responsable (plataforma, admin tenant, editor con
 * y sin llaves, operativo, visor/viewer/guest, rol nulo/desconocido, sin
 * sesión) y la regla "llaves delicadas nunca por rol grueso". El cliente
 * Supabase REAL no participa (vi.mock); la validación viva de RLS es
 * procedimiento manual (doc 3.9 §6.2) — nunca se declara validada aquí.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: null }));

import {
  LLAVES_V1,
  permisosDesdeJsonb,
  capacidadesDe,
  type CapacidadesGp,
} from './gpPermisosService';

const TODAS = LLAVES_V1 as unknown as string[];

function vacias(): CapacidadesGp {
  return {
    crearProyecto: false,
    editarProyecto: false,
    eliminarProyecto: false,
    administrarEdt: false,
    registrarPersonas: false,
    crearTarea: false,
    editarTareaAjena: false,
    editarPropio: false,
    administrarPermisos: false,
  };
}

describe('permisosDesdeJsonb', () => {
  it('shape objeto (vivo hoy): devuelve las llaves con valor verdadero', () => {
    expect(permisosDesdeJsonb({ 'gp.crear_proyecto': true, 'gp.editar_proyecto': false })).toEqual([
      'gp.crear_proyecto',
    ]);
  });

  it('objeto vacío ({} como el vivo) ⇒ sin llaves', () => {
    expect(permisosDesdeJsonb({})).toEqual([]);
  });

  it('acepta array de strings por robustez; descarta no-strings', () => {
    expect(permisosDesdeJsonb(['gp.crear_proyecto', 5, null, 'gp.administrar_edt'])).toEqual([
      'gp.crear_proyecto',
      'gp.administrar_edt',
    ]);
  });

  it('null / string / número ⇒ sin llaves (nunca se inventan)', () => {
    expect(permisosDesdeJsonb(null)).toEqual([]);
    expect(permisosDesdeJsonb('gp.crear_proyecto')).toEqual([]);
    expect(permisosDesdeJsonb(42)).toEqual([]);
  });
});

describe('capacidadesDe — matriz del modelo del responsable', () => {
  it('sin sesión ⇒ nada (fail-closed), aunque sea admin', () => {
    expect(capacidadesDe('admin', TODAS, false, false)).toEqual(vacias());
  });

  it('plataforma ⇒ todo (accede a todo, incluso administrarPermisos)', () => {
    expect(capacidadesDe(null, [], true, true)).toEqual({
      crearProyecto: true,
      editarProyecto: true,
      eliminarProyecto: true,
      administrarEdt: true,
      registrarPersonas: true,
      crearTarea: true,
      editarTareaAjena: true,
      editarPropio: true,
      administrarPermisos: true,
    });
  });

  it('tenant admin ⇒ todo aunque permissions esté vacío ({} vivo)', () => {
    expect(capacidadesDe('admin', [], false, true)).toEqual({
      ...vacias(),
      crearProyecto: true,
      editarProyecto: true,
      eliminarProyecto: true,
      administrarEdt: true,
      registrarPersonas: true,
      crearTarea: true,
      editarTareaAjena: true,
      editarPropio: true,
      administrarPermisos: true,
    });
  });

  it('editor SIN llaves ⇒ solo tareas (proyecto/eliminar/EDT/personas delicados: NO)', () => {
    const c = capacidadesDe('editor', [], false, true);
    expect(c.crearProyecto).toBe(false);
    expect(c.editarProyecto).toBe(false);
    expect(c.eliminarProyecto).toBe(false);
    expect(c.administrarEdt).toBe(false);
    expect(c.registrarPersonas).toBe(false);
    expect(c.crearTarea).toBe(true);
    expect(c.editarTareaAjena).toBe(true);
    expect(c.editarPropio).toBe(true);
    expect(c.administrarPermisos).toBe(false);
  });

  it('editor con TODAS las llaves ⇒ "totales" salvo administrarPermisos', () => {
    const c = capacidadesDe('editor', TODAS, false, true);
    expect(c.crearProyecto).toBe(true);
    expect(c.editarProyecto).toBe(true);
    expect(c.eliminarProyecto).toBe(true);
    expect(c.administrarEdt).toBe(true);
    expect(c.registrarPersonas).toBe(true);
    expect(c.crearTarea).toBe(true);
    expect(c.editarTareaAjena).toBe(true);
    expect(c.editarPropio).toBe(true);
    expect(c.administrarPermisos).toBe(false); // solo el admin curó permisos
  });

  it('editor con UNA llave ⇒ solo esa capacidad delicada + tareas', () => {
    const c = capacidadesDe('editor', ['gp.administrar_edt'], false, true);
    expect(c.administrarEdt).toBe(true);
    expect(c.crearProyecto).toBe(false);
    expect(c.editarProyecto).toBe(false);
    expect(c.registrarPersonas).toBe(false);
    expect(c.crearTarea).toBe(true);
  });

  it('operativo SIN llaves ⇒ tareas propias; ajenas NO; delicados NO', () => {
    const c = capacidadesDe('operativo', [], false, true);
    expect(c.crearTarea).toBe(true);
    expect(c.editarPropio).toBe(true);
    expect(c.editarTareaAjena).toBe(false);
    expect(c.crearProyecto).toBe(false);
    expect(c.editarProyecto).toBe(false);
    expect(c.administrarEdt).toBe(false);
    expect(c.registrarPersonas).toBe(false);
    expect(c.administrarPermisos).toBe(false);
  });

  it('operativo CON llaves curadas por el admin ⇒ la llave manda (deliberado); ajenas sigue NO', () => {
    const c = capacidadesDe('operativo', TODAS, false, true);
    expect(c.crearProyecto).toBe(true);
    expect(c.editarProyecto).toBe(true);
    expect(c.administrarEdt).toBe(true);
    expect(c.registrarPersonas).toBe(true);
    expect(c.crearTarea).toBe(true);
    expect(c.editarPropio).toBe(true);
    expect(c.editarTareaAjena).toBe(false);
    expect(c.administrarPermisos).toBe(false);
  });

  it('visor / viewer / guest ⇒ nada (solo lectura)', () => {
    expect(capacidadesDe('visor', TODAS, false, true)).toEqual(vacias());
    expect(capacidadesDe('viewer', TODAS, false, true)).toEqual(vacias());
    expect(capacidadesDe('guest', TODAS, false, true)).toEqual(vacias());
  });

  it('rol nulo o desconocido con sesión ⇒ fail-closed (solo lectura)', () => {
    expect(capacidadesDe(null, TODAS, false, true)).toEqual(vacias());
    expect(capacidadesDe('superusuario', TODAS, false, true)).toEqual(vacias());
  });
});
