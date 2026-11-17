/**
 * gpCicloVidaService.test.ts — Etapa 6.3
 * =====================================
 * PRUEBAS SIN RED del núcleo del servicio de ciclo de vida: transiciones válidas
 * y prohibidas, matriz de permisos por rol, motivo obligatorio, reapertura,
 * mapeo del historial (auditoría), manejo de errores/ausencia de sesión y la
 * regla anti-cambios-parciales (única vía RPC atómica). El cliente Supabase REAL
 * no participa (fakes); la validación viva de RLS/RPC es procedimiento manual
 * (doc 6.3) — nunca se declara validada aquí.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: null }));

import {
  ACCIONES_MOTIVO_OBLIGATORIO,
  ALIAS_ROL_PROYECTO,
  TRANSICIONES_VALIDAS,
  derivarCapacidades,
  cambiarEstadoCicloVida,
  etiquetaDesdeCatalogo,
  mapearFilasHistorial,
  normalizarTipoSeleccion,
  resolverCapacidadesProyecto,
  rolFuncionalDesdeCodigo,
  validarAccion,
  type ClienteCicloVida,
  type RespuestaRpc,
} from './gpCicloVidaService';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function clienteFalso(): { cliente: ClienteCicloVida; rpcMock: ReturnType<typeof vi.fn> } {
  const rpcMock = vi.fn();
  const cliente: ClienteCicloVida = {
    rpc: rpcMock,
    from: vi.fn() as unknown as ClienteCicloVida['from'],
  };
  return { cliente, rpcMock };
}

const TODOS_LOS_ESTADOS = ['planificacion', 'en_curso', 'pausado', 'completado', 'cancelado'] as const;
const TODAS_LAS_ACCIONES = ['iniciar', 'pausar', 'reanudar', 'completar', 'cancelar', 'reabrir'] as const;

// ---------------------------------------------------------------------------
// 1-2 · Tipo de proyecto: selección, persistencia y recuperación
// ---------------------------------------------------------------------------

describe('tipo de proyecto (normalizarTipoSeleccion + etiquetaDesdeCatalogo)', () => {
  it('selección vacía ⇒ NULL "Sin clasificar" (B-8: nunca se coerciona a un valor)', () => {
    for (const v of ['', '   ', null, undefined, 'null']) {
      const r = normalizarTipoSeleccion(v);
      expect(r.codigo).toBeNull();
      expect(r.etiqueta).toBe('Sin clasificar');
    }
  });

  it('selección de un valor del catálogo ⇒ persiste el CÓDIGO (gp_proyectos.tipo_proyecto_codigo)', () => {
    const r = normalizarTipoSeleccion('obra_publica');
    expect(r.codigo).toBe('obra_publica');
    expect(r.etiqueta).toBe('obra_publica');
  });

  it('recuperación al abrir: el código guardado se resuelve con el catálogo vivo', () => {
    const catalogo = [
      { codigo: 'obra_publica', nombre: 'Obra pública', nivel: null, orden: 1 },
      { codigo: 'inversion', nombre: 'Inversión', nivel: null, orden: 2 },
    ];
    expect(etiquetaDesdeCatalogo('inversion', catalogo)).toBe('Inversión');
    expect(etiquetaDesdeCatalogo(null, catalogo)).toBe('Sin clasificar');
    // Código desconocido (catálogo desincronizado) ⇒ muestra el código, no se inventa.
    expect(etiquetaDesdeCatalogo('otro', catalogo)).toBe('otro');
  });
});

// ---------------------------------------------------------------------------
// 3 · Transiciones permitidas y prohibidas (núcleo puro)
// ---------------------------------------------------------------------------

describe('validarAccion — transiciones', () => {
  it('mapa de transiciones aprobado (Etapa 6.3 §2.B) completo', () => {
    expect(TRANSICIONES_VALIDAS.planificacion).toEqual({ iniciar: 'en_curso', cancelar: 'cancelado' });
    expect(TRANSICIONES_VALIDAS.en_curso).toEqual({ pausar: 'pausado', completar: 'completado', cancelar: 'cancelado' });
    expect(TRANSICIONES_VALIDAS.pausado).toEqual({ reanudar: 'en_curso', completar: 'completado', cancelar: 'cancelado' });
    expect(TRANSICIONES_VALIDAS.completado).toEqual({ reabrir: 'en_curso' });
    expect(TRANSICIONES_VALIDAS.cancelado).toEqual({ reabrir: 'planificacion' });
  });

  const gerente = derivarCapacidades({ esPlataforma: true });

  const VALIDAS: Array<[string, string]> = [
    ['planificacion', 'iniciar'],
    ['en_curso', 'pausar'],
    ['en_curso', 'completar'],
    ['en_curso', 'cancelar'],
    ['pausado', 'reanudar'],
    ['pausado', 'completar'],
    ['pausado', 'cancelar'],
    ['planificacion', 'cancelar'],
    ['completado', 'reabrir'],
    ['cancelado', 'reabrir'],
  ];
  VALIDAS.forEach(([estado, accion]) => {
    it(`permite ${estado} --${accion}--> (con motivo si exige)`, () => {
      const r = validarAccion({
        estadoActual: estado,
        accion: accion as never,
        motivo: ACCIONES_MOTIVO_OBLIGATORIO.includes(accion as never) ? 'motivo de prueba' : null,
        capacidades: gerente,
      });
      expect(r.ok).toBe(true);
    });
  });

  it('rechaza todas las combinaciones NO listadas (el catálogo no es el menú)', () => {
    TODOS_LOS_ESTADOS.forEach((estado) => {
      TODAS_LAS_ACCIONES.forEach((accion) => {
        const lista = Object.keys(TRANSICIONES_VALIDAS[estado]);
        if (!lista.includes(accion)) {
          const r = validarAccion({
            estadoActual: estado,
            accion,
            motivo: 'motivo de prueba',
            capacidades: gerente,
          });
          expect(r.ok).toBe(false);
          if (!r.ok) expect(r.codigo).toBe('TRANSICION_INVALIDA');
        }
      });
    });
  });

  it('estado sin clasificar (NULL) no transiciona — B-8, se rechaza con mensaje explícito', () => {
    for (const estado of [null, undefined, '']) {
      const r = validarAccion({ estadoActual: estado, accion: 'iniciar', motivo: null, capacidades: gerente });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.codigo).toBe('ESTADO_SIN_CLASIFICAR');
    }
  });
});

// ---------------------------------------------------------------------------
// 4 · Permisos por rol (matriz aprobada)
// ---------------------------------------------------------------------------

describe('derivarCapacidades — matriz por rol', () => {
  it('gerente (administrador de proyecto): todas las acciones + editar tipo', () => {
    const c = derivarCapacidades({ rolProyecto: 'gerente' });
    expect(c).toEqual({ iniciar: true, pausar: true, reanudar: true, completar: true, cancelar: true, reabrir: true, editarTipo: true, verHistorial: true });
  });

  it('jefe/responsable (gestor): iniciar, pausar, reanudar, completar; NO cancelar ni reabrir', () => {
    const c = derivarCapacidades({ rolProyecto: 'jefe' });
    expect(c.iniciar).toBe(true);
    expect(c.pausar).toBe(true);
    expect(c.reanudar).toBe(true);
    expect(c.completar).toBe(true);
    expect(c.cancelar).toBe(false);
    expect(c.reabrir).toBe(false);
    expect(c.editarTipo).toBe(false);
  });

  it('coordinador / colaborador / lector / sin rol: SOLO consulta (la pertenencia no otorga admin)', () => {
    for (const rol of ['coordinador', 'colaborador', 'lector', 'sin_rol'] as const) {
      const c = derivarCapacidades({ rolProyecto: rol });
      expect(c.iniciar).toBe(false);
      expect(c.completar).toBe(false);
      expect(c.cancelar).toBe(false);
      expect(c.reabrir).toBe(false);
      expect(c.editarTipo).toBe(false);
    }
  });

  it('admin de empresa (rol de app "admin") y plataforma: facultades completas del Hub', () => {
    expect(derivarCapacidades({ rolApp: 'admin' }).cancelar).toBe(true);
    expect(derivarCapacidades({ esPlataforma: true }).reabrir).toBe(true);
  });

  it('rol de app editor/viewer SIN rol de proyecto: consulta (sin actos de dirección)', () => {
    for (const rolApp of ['editor', 'viewer', 'guest'] as const) {
      const c = derivarCapacidades({ rolApp });
      expect(c.iniciar).toBe(false);
      expect(c.completar).toBe(false);
      expect(c.editarTipo).toBe(false);
    }
  });

  it('mapeo de códigos del seed planificado (tracker 5.2, fila 5) — sin inventar roles', () => {
    expect(rolFuncionalDesdeCodigo('administrador')).toBe('gerente');
    expect(rolFuncionalDesdeCodigo('gestor')).toBe('jefe');
    expect(rolFuncionalDesdeCodigo('coordinador')).toBe('coordinador');
    expect(rolFuncionalDesdeCodigo('supervisor')).toBe('coordinador');
    expect(rolFuncionalDesdeCodigo('colaborador')).toBe('colaborador');
    expect(rolFuncionalDesdeCodigo('lector')).toBe('lector');
    expect(rolFuncionalDesdeCodigo(null)).toBe('sin_rol');
    expect(rolFuncionalDesdeCodigo('rol_desconocido')).toBe('sin_rol');
  });
});

// ---------------------------------------------------------------------------
// 5 · Motivos obligatorios (completar, cancelar, reabrir)
// ---------------------------------------------------------------------------

describe('motivos obligatorios', () => {
  it('conjunto aprobado: completar, cancelar y reabrir exigen motivo; iniciar/pausar/reanudar no', () => {
    expect([...ACCIONES_MOTIVO_OBLIGATORIO].sort()).toEqual(['cancelar', 'completar', 'reabrir']);
  });

  it('sin motivo ⇒ MOTIVO_REQUERIDO (con permiso y transición válida)', () => {
    const casos: Array<{ estadoActual: string; accion: 'completar' | 'cancelar' | 'reabrir' }> = [
      { estadoActual: 'en_curso', accion: 'completar' },
      { estadoActual: 'en_curso', accion: 'cancelar' },
      { estadoActual: 'completado', accion: 'reabrir' },
    ];
    for (const caso of casos) {
      const r = validarAccion({ ...caso, motivo: null, capacidades: derivarCapacidades({ esPlataforma: true }) });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.codigo).toBe('MOTIVO_REQUERIDO');
    }
  });

  it('motivo solo espacios ⇒ MOTIVO_REQUERIDO; con texto ⇒ ok', () => {
    const c = derivarCapacidades({ esPlataforma: true });
    const r1 = validarAccion({ estadoActual: 'en_curso', accion: 'completar', motivo: '    ', capacidades: c });
    expect(r1.ok).toBe(false);
    const r2 = validarAccion({ estadoActual: 'en_curso', accion: 'completar', motivo: 'Cierre formal con acta', capacidades: c });
    expect(r2.ok).toBe(true);
  });

  it('iniciar y pausar NO exigen motivo', () => {
    const c = derivarCapacidades({ esPlataforma: true });
    expect(validarAccion({ estadoActual: 'planificacion', accion: 'iniciar', motivo: null, capacidades: c }).ok).toBe(true);
    expect(validarAccion({ estadoActual: 'en_curso', accion: 'pausar', motivo: null, capacidades: c }).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6 · Reapertura (destinos aprobados)
// ---------------------------------------------------------------------------

describe('reapertura', () => {
  it('reabrir completado ⇒ destino en_curso', () => {
    expect(TRANSICIONES_VALIDAS.completado.reabrir).toBe('en_curso');
    const r = validarAccion({ estadoActual: 'completado', accion: 'reabrir', motivo: 'Faltó acta de cierre', capacidades: derivarCapacidades({ esPlataforma: true }) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.estadoDestino).toBe('en_curso');
  });

  it('reabrir cancelado ⇒ destino planificacion', () => {
    expect(TRANSICIONES_VALIDAS.cancelado.reabrir).toBe('planificacion');
    const r = validarAccion({ estadoActual: 'cancelado', accion: 'reabrir', motivo: 'El cliente reactivó el contrato', capacidades: derivarCapacidades({ esPlataforma: true }) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.estadoDestino).toBe('planificacion');
  });

  it('jefe/responsable NO puede reabrir (permiso reservado a gerente+)', () => {
    const jefe = derivarCapacidades({ rolProyecto: 'jefe' });
    const r = validarAccion({ estadoActual: 'completado', accion: 'reabrir', motivo: 'motivo', capacidades: jefe });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('PERMISO_INSUFICIENTE');
  });
});

// ---------------------------------------------------------------------------
// 7 · Registro de auditoría (gp_eventos_auditoria, sin tablas nuevas)
// ---------------------------------------------------------------------------

describe('historial de auditoría (mapearFilasHistorial)', () => {
  it('mapea payload antes/después → evento con motivo, actor y fecha', () => {
    const r = mapearFilasHistorial(
      [
        {
          id: 'e1',
          accion: 'STATE_CHANGE',
          payload_antes: { estado_codigo: 'en_curso' },
          payload_despues: { estado_codigo: 'pausado', motivo: 'Suspensión del cliente', accion: 'pausar' },
          actor_user_id: 'u-1',
          actor_persona_id: 'p-1',
          ocurrido_at: '2026-11-15T10:00:00Z',
        },
      ],
      null,
    );
    expect(r.estado).toBe('lista');
    if (r.estado === 'lista') {
      expect(r.eventos[0]).toEqual({
        id: 'e1',
        ocurridoAt: '2026-11-15T10:00:00Z',
        accion: 'pausar',
        estadoAnterior: 'en_curso',
        estadoNuevo: 'pausado',
        motivo: 'Suspensión del cliente',
        actorPersonaId: 'p-1',
        actorUserId: 'u-1',
      });
    }
  });

  it('sin filas ⇒ vacío honesto; con error ⇒ error (nada inventado)', () => {
    expect(mapearFilasHistorial([], null).estado).toBe('vacio');
    const e = mapearFilasHistorial(null, 'RLS sin política (0004 sin aplicar)');
    expect(e.estado).toBe('error');
    if (e.estado === 'error') expect(e.mensaje).toContain('historial');
  });
});

// ---------------------------------------------------------------------------
// 8 · Manejo de errores y ausencia de sesión (fail-closed)
// ---------------------------------------------------------------------------

describe('resolverCapacidadesProyecto — fail-closed', () => {
  it('sin sesión ⇒ sin_sesion con capacidades nulas', async () => {
    const { cliente } = clienteFalso();
    const r = await resolverCapacidadesProyecto({ cliente, resolverContexto: () => Promise.resolve(null) }, 'p1');
    expect(r.estado).toBe('sin_sesion');
    expect(r.capacidades.completar).toBe(false);
    expect(r.capacidades.iniciar).toBe(false);
  });

  it('error de infraestructura del Hub ⇒ indisponible (nada se falsea)', async () => {
    const { cliente } = clienteFalso();
    const r = await resolverCapacidadesProyecto(
      { cliente, resolverContexto: () => Promise.reject(new Error('RPC user_app_role no disponible')) },
      'p1',
    );
    expect(r.estado).toBe('indisponible');
    expect(r.capacidades.iniciar).toBe(false);
  });

  it('RPC gp_rol_proyecto_actual no aplicada (PGRST202) ⇒ indisponible con mensaje del SQL pendiente', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'Could not find the function gp_rol_proyecto_actual' } } as RespuestaRpc);
    const r = await resolverCapacidadesProyecto(
      { cliente, resolverContexto: () => Promise.resolve({ userId: 'u', email: 'x', tenantId: 't', esPlataforma: false, rolApp: 'editor', puedeUsarApp: true }) },
      'p1',
    );
    expect(r.estado).toBe('indisponible');
    if (r.estado === 'indisponible') expect(r.mensaje).toContain('20261115_0010');
  });

  it('con rol "gestor" en la RPC ⇒ capacidades de jefe/responsable', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({ data: 'gestor', error: null } as RespuestaRpc);
    const r = await resolverCapacidadesProyecto(
      { cliente, resolverContexto: () => Promise.resolve({ userId: 'u', email: 'x', tenantId: 't', esPlataforma: false, rolApp: 'viewer', puedeUsarApp: true }) },
      'p1',
    );
    expect(r.estado).toBe('ok');
    if (r.estado === 'ok') {
      expect(r.rolProyecto).toBe('jefe');
      expect(r.capacidades.completar).toBe(true);
      expect(r.capacidades.cancelar).toBe(false);
    }
  });

  it('plataforma/admin de empresa no necesita RPC de rol: capacidades completas inmediatas', async () => {
    const { cliente, rpcMock } = clienteFalso();
    const r = await resolverCapacidadesProyecto(
      { cliente, resolverContexto: () => Promise.resolve({ userId: 'u', email: 'x', tenantId: null, esPlataforma: true, rolApp: null, puedeUsarApp: true }) },
      'p1',
    );
    expect(r.estado).toBe('ok');
    expect(r.capacidades.cancelar).toBe(true);
    expect(rpcMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 9 · Protección contra cambios parciales (única vía: RPC atómica)
// ---------------------------------------------------------------------------

describe('cambiarEstadoCicloVida — RPC atómica, sin escrituras parciales', () => {
  it('sin cliente ⇒ SIN_CLIENTE y NINGUNA llamada de red', async () => {
    const r = await cambiarEstadoCicloVida({ cliente: null }, { proyectoId: 'p1', estadoDestino: 'en_curso', motivo: null });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('SIN_CLIENTE');
  });

  it('éxito: UNA sola llamada RPC (UPDATE + auditoría en una transacción del servidor)', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({
      data: { estado_anterior: 'planificacion', estado_nuevo: 'en_curso', accion: 'iniciar' },
      error: null,
    } as RespuestaRpc);
    const r = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'en_curso', motivo: null });
    expect(r.ok).toBe(true);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('gp_cambiar_estado_proyecto', {
      p_proyecto_id: 'p1',
      p_estado_nuevo: 'en_curso',
      p_motivo: null,
    });
    // No existe ruta de escritura directa (from().update()) en el servicio: la
    // atomicidad UPDATE+auditoría es responsabilidad del servidor (0010).
  });

  it('motivo con espacios se recorta; cadena vacía se envía como NULL', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({ data: { estado_anterior: 'en_curso' }, error: null } as RespuestaRpc);
    await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'completado', motivo: '  Cierre con acta  ' });
    expect(rpcMock.mock.calls[0]?.[1]).toEqual({ p_proyecto_id: 'p1', p_estado_nuevo: 'completado', p_motivo: 'Cierre con acta' });
  });

  it('RPC no aplicada (PGRST202) ⇒ RPC_NO_APLICADA con el SQL pendiente en el mensaje', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({ data: null, error: { code: 'PGRST202', message: 'Could not find the function gp_cambiar_estado_proyecto' } } as RespuestaRpc);
    const r = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'en_curso', motivo: null });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.codigo).toBe('RPC_NO_APLICADA');
      expect(r.mensaje).toContain('20261115_0010');
    }
  });

  it('denegación del servidor (PERMISO_INSUFICIENTE) se propaga como PERMISO sin locura', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'PERMISO_INSUFICIENTE: el rol "lector" no permite la acción "completar" (gp_roles_proyecto_c.permisos)' },
    } as RespuestaRpc);
    const r = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'completado', motivo: 'motivo' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.codigo).toBe('PERMISO');
  });

  it('TRANSICION_INVALIDA y MOTIVO_REQUERIDO del servidor se mapean a su código', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'TRANSICION_INVALIDA: no válida' } } as RespuestaRpc);
    const r1 = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'completado', motivo: null });
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.codigo).toBe('TRANSICION');

    rpcMock.mockResolvedValue({ data: null, error: { code: 'P0001', message: 'MOTIVO_REQUERIDO: falta el motivo' } } as RespuestaRpc);
    const r2 = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'cancelado', motivo: null });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.codigo).toBe('MOTIVO');
  });

  it('error genérico ⇒ ERROR con el mensaje original (nada silenciado)', async () => {
    const { cliente, rpcMock } = clienteFalso();
    rpcMock.mockRejectedValue(new Error('network down'));
    const r = await cambiarEstadoCicloVida({ cliente }, { proyectoId: 'p1', estadoDestino: 'pausado', motivo: null });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.codigo).toBe('ERROR');
      expect(r.mensaje).toContain('network down');
    }
  });

  it('alias del seed: administrador→gerente y gestor→jefe están en el mapa (contrato con 0008)', () => {
    expect(ALIAS_ROL_PROYECTO['administrador']).toBe('gerente');
    expect(ALIAS_ROL_PROYECTO['gestor']).toBe('jefe');
  });
});
