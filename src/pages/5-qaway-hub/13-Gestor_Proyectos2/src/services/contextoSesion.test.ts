/**
 * contextoSesion.test.ts
 * ======================
 * PRUEBAS UNITARIAS SIMULADAS (sin red) de los evaluadores y del cableado de
 * contextoSesion.ts (Etapa 4). El cliente Supabase se sustituye por `null`
 * (vi.mock): así se prueba el modo fail-closed puro (sin sesión ⇒ denegado).
 * Las pruebas REALES de RLS con identidades vivas son un procedimiento manual
 * en Supabase (doc2/3.9 §6.2) — NUNCA se declara RLS validado por este archivo.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: null }));

import {
  APP_SLUG,
  ErrorSesion,
  evaluarEscritura,
  evaluarLectura,
  invalidarContexto,
  resolverContextoSesion,
  verificarAutorizacionSesion,
  exigirContextoEscritura,
  exigirContextoLectura,
  type ContextoSesion,
} from './contextoSesion';

const TENANT_A = '11111111-1111-1111-1111-111111111111';

function ctxParcial(parche: Partial<ContextoSesion>): ContextoSesion {
  return {
    userId: 'user-1',
    email: 'u@test.com',
    tenantId: TENANT_A,
    esPlataforma: false,
    rolApp: 'editor',
    puedeUsarApp: true,
    ...parche,
  };
}

describe('APP_SLUG', () => {
  it('es exactamente el slug registrado en app_catalog (0006a)', () => {
    expect(APP_SLUG).toBe('gestor-proyectos');
  });
});

describe('evaluarLectura (puro)', () => {
  it('sin contexto ⇒ SIN_SESION (fail-closed)', () => {
    const r = evaluarLectura(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_SESION');
  });

  it('plataforma ⇒ lectura de todo, incluso sin tenant ni rol', () => {
    const r = evaluarLectura(ctxParcial({ tenantId: null, rolApp: null, esPlataforma: true, puedeUsarApp: false }));
    expect(r.ok).toBe(true);
  });

  it('empresa sin acceso a la app ⇒ SIN_ACCESO_APP', () => {
    const r = evaluarLectura(ctxParcial({ puedeUsarApp: false }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_ACCESO_APP');
  });

  it('empresa con acceso pero sin tenant asignado ⇒ SIN_ACCESO_APP', () => {
    const r = evaluarLectura(ctxParcial({ tenantId: null }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_ACCESO_APP');
  });

  it('empresa autorizada ⇒ ok (rol no basta para leer: puedeUsarApp sí)', () => {
    const r = evaluarLectura(ctxParcial({ rolApp: 'viewer' }));
    expect(r.ok).toBe(true);
  });
});

describe('evaluarEscritura (puro)', () => {
  it('sin contexto ⇒ SIN_SESION', () => {
    const r = evaluarEscritura(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_SESION');
  });

  it('plataforma ⇒ escritura permitida sobre cualquier tenant pedido o ninguno', () => {
    expect(evaluarEscritura(ctxParcial({ esPlataforma: true, tenantId: null, rolApp: null }), TENANT_A).ok).toBe(true);
    expect(evaluarEscritura(ctxParcial({ esPlataforma: true, tenantId: null, rolApp: null }), null).ok).toBe(true);
  });

  it('empresa sin acceso a la app ⇒ SIN_ACCESO_APP aunque tenga rol', () => {
    const r = evaluarEscritura(ctxParcial({ puedeUsarApp: false }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_ACCESO_APP');
  });

  it('viewer y guest ⇒ ROL_INSUFICIENTE', () => {
    const viewer = evaluarEscritura(ctxParcial({ rolApp: 'viewer' }));
    if (!viewer.ok) expect(viewer.codigo).toBe('ROL_INSUFICIENTE');
    else expect.unreachable('viewer no debe escribir');

    const guest = evaluarEscritura(ctxParcial({ rolApp: 'guest' }));
    if (!guest.ok) expect(guest.codigo).toBe('ROL_INSUFICIENTE');
    else expect.unreachable('guest no debe escribir');
  });

  it('sin rol de app ⇒ ROL_INSUFICIENTE', () => {
    const r = evaluarEscritura(ctxParcial({ rolApp: null }));
    if (!r.ok) expect(r.codigo).toBe('ROL_INSUFICIENTE');
    else expect.unreachable('sin rol no debe escribir');
  });

  it('empresa sin tenant asignado ⇒ SIN_ACCESO_APP', () => {
    const r = evaluarEscritura(ctxParcial({ tenantId: null }));
    if (!r.ok) expect(r.codigo).toBe('SIN_ACCESO_APP');
    else expect.unreachable('sin tenant no debe escribir');
  });

  it('editor/admin de la empresa ⇒ ok (con o sin tenant del parámetro)', () => {
    expect(evaluarEscritura(ctxParcial({ rolApp: 'editor' }), null).ok).toBe(true);
    expect(evaluarEscritura(ctxParcial({ rolApp: 'editor' }), TENANT_A).ok).toBe(true);
    expect(evaluarEscritura(ctxParcial({ rolApp: 'admin' }), TENANT_A).ok).toBe(true);
  });

  it('tenant del parámetro ≠ empresa autenticada ⇒ TENANT_AJENO (el parámetro jamás sustituye a la identidad)', () => {
    const r = evaluarEscritura(ctxParcial({ rolApp: 'admin' }), '22222222-2222-2222-2222-222222222222');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('TENANT_AJENO');
  });
});

describe('cableado fail-closed con cliente Supabase NULO', () => {
  beforeEach(() => {
    invalidarContexto();
  });

  it('resolverContextoSesion ⇒ null (sin cliente no hay sesión real)', async () => {
    expect(await resolverContextoSesion()).toBeNull();
  });

  it('exigirContextoLectura ⇒ ErrorSesion SIN_SESION', async () => {
    await expect(exigirContextoLectura()).rejects.toMatchObject({ name: 'ErrorSesion', codigo: 'SIN_SESION' });
  });

  it('exigirContextoEscritura ⇒ ErrorSesion SIN_SESION', async () => {
    await expect(exigirContextoEscritura(TENANT_A)).rejects.toMatchObject({ name: 'ErrorSesion', codigo: 'SIN_SESION' });
  });

  it('verificarAutorizacionSesion ⇒ false (denegado, jamás true sin sesión)', async () => {
    expect(await verificarAutorizacionSesion(TENANT_A)).toBe(false);
  });

  it('la caché no rescata un contexto que nunca existió tras invalidar', async () => {
    expect(await resolverContextoSesion()).toBeNull();
    invalidarContexto();
    expect(await resolverContextoSesion()).toBeNull();
  });
});

describe('ErrorSesion', () => {
  it('conserva el código y es un Error normal', () => {
    const e = new ErrorSesion('TENANT_AJENO', 'mensaje');
    expect(e).toBeInstanceOf(Error);
    expect(e.codigo).toBe('TENANT_AJENO');
    expect(e.message).toBe('mensaje');
  });
});
