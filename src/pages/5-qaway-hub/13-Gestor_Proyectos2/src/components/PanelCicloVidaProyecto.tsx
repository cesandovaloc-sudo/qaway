/**
 * PanelCicloVidaProyecto.tsx — Etapa 6.3 (Paso 3)
 * ===============================================
 * Panel de DIRECCIÓN del proyecto: chip de estado + menú de acciones
 * (iniciar / pausar / reanudar / completar / cancelar / reabrir) + modal de
 * confirmación con motivo obligatorio según la acción.
 *
 * Decisión aprobada (6.2 §4.2 / 6.3 §2.B):
 *   · El estado se cambia DESDE LA FICHA (Resumen) con este menú — NO desde
 *     Configuración, donde el estado es solo lectura (uso `soloLectura`).
 *   · Menú generado por TRANSICIONES VÁLIDAS (núcleo del servicio) filtradas
 *     por las CAPACIDADES del rol resuelto con la identidad REAL del Hub
 *     (contextoSesion + gp_rol_proyecto_actual). Fail-closed: sin verificación
 *     de permiso ⇒ solo consulta.
 *   · El cambio se ejecuta con la RPC atómica `gp_cambiar_estado_proyecto`
 *     (SQL 20261115_0010): UPDATE + auditoría en UNA transacción del servidor.
 *     Sin RPC aplicada ⇒ error honesto con el SQL pendiente; NADA local.
 *   · Al confirmar, `onEstadoCambiado` permite a la app actualizar su modelo
 *     de proyecto (transición ya persistida en Supabase por la RPC).
 *
 * Integración visual: estilos inline coherentes con el sistema actual
 * (botones `btn`, chips, modales con overlay), sin paneles nuevos.
 */

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Flag, Pause, Play, RotateCcw, CheckCircle2, XCircle, Info } from 'lucide-react';
import CicloVidaEstadoChip from './CicloVidaEstadoChip';
import {
  ETIQUETA_ACCION,
  SIN_CLASIFICAR,
  TRANSICIONES_VALIDAS,
  cambiarEstado,
  capacidadesDeProyecto,
  validarAccion,
  type AccionCicloVida,
  type CapacidadesCicloVida,
  type EstadoProyecto,
  type ResultadoCambioEstado,
  type ValidacionAccion,
  etiquetaDesdeCatalogo,
} from '../services/gpCicloVidaService';
import { listarCatalogo, TABLA_ESTADOS_PROYECTO, type ValorCatalogo } from '../services/gpCatalogosService';


export interface ProyectoCicloVida {
  id: string;
  name?: string;
  code?: string;
  estadoCodigo?: string | null;
  tipoProyectoCodigo?: string | null;
}

interface Props {
  proyecto: ProyectoCicloVida;
  /** Tras un cambio exitoso (la persistencia ya ocurrió en Supabase). */
  onEstadoCambiado?: (proyectoId: string, estadoNuevo: string) => void;
  notify?: (m: string) => void;
  /** Modo Configuración: chip de solo lectura + enlace a la ficha. */
  soloLectura?: boolean;
  onIrAFicha?: () => void;
}

const ICONO_ACCION: Record<AccionCicloVida, typeof Play> = {
  iniciar: Play,
  pausar: Pause,
  reanudar: Play,
  completar: CheckCircle2,
  cancelar: XCircle,
  reabrir: RotateCcw,
};

/** Acciones ordenadas para el menú. */
const ORDEN_ACCIONES: AccionCicloVida[] = ['iniciar', 'pausar', 'reanudar', 'completar', 'cancelar', 'reabrir'];

interface ModalAccion {
  accion: AccionCicloVida;
  estadoDestino: EstadoProyecto;
  motivoObligatorio: boolean;
}

export default function PanelCicloVidaProyecto({ proyecto, onEstadoCambiado, notify, soloLectura = false, onIrAFicha }: Props) {
  const [capacidades, setCapacidades] = useState<CapacidadesCicloVida | null>(null);
  const [resolucion, setResolucion] = useState<{ estado: string; mensaje: string }>({ estado: 'resolviendo', mensaje: '' });
  const [valoresEstado, setValoresEstado] = useState<ValorCatalogo[] | undefined>(undefined);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modal, setModal] = useState<ModalAccion | null>(null);
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Resolución de capacidades con la identidad REAL del Hub (fail-closed) + etiquetas.
  useEffect(() => {
    let vigente = true;
    setCapacidades(null);
    setMenuAbierto(false);
    capacidadesDeProyecto(proyecto.id).then((r) => {
      if (!vigente) return;
      setCapacidades(r.capacidades);
      setResolucion({ estado: r.estado, mensaje: r.estado === 'ok' ? '' : ('mensaje' in r ? r.mensaje : '') });
    });
    listarCatalogo(TABLA_ESTADOS_PROYECTO).then((r) => {
      if (vigente && r.estado === 'lista') setValoresEstado(r.valores);
    });
    return () => {
      vigente = false;
    };
  }, [proyecto.id]);

  // Cerrar menú con clic fuera (patrón de la vista).
  useEffect(() => {
    if (!menuAbierto) return;
    const cerrar = () => setMenuAbierto(false);
    window.addEventListener('click', cerrar);
    return () => window.removeEventListener('click', cerrar);
  }, [menuAbierto]);

  const estadoActual = proyecto.estadoCodigo ?? null;

  /** Acciones ofrecidas por el menú: transición válida ∧ capacidad del rol. */
  const accionesDisponibles = ORDEN_ACCIONES.filter((accion) => {
    if (!capacidades || !estadoActual) return false;
    const validacion = validarAccion({
      estadoActual,
      accion,
      motivo: 'motivo-provisional',
      capacidades,
    });
    return validacion.ok || validacion.codigo === 'MOTIVO_REQUERIDO';
  });

  const abrirModal = (accion: AccionCicloVida) => {
    if (!estadoActual) return;
    const validacion = validarAccion({ estadoActual, accion, motivo: 'motivo-provisional', capacidades: capacidades! });
    if (!validacion.ok) return;
    setMenuAbierto(false);
    setMotivo('');
    setErrorModal(null);
    setModal({ accion, estadoDestino: validacion.estadoDestino, motivoObligatorio: validacion.motivoObligatorio });
  };

  const confirmarAccion = async () => {
    if (!modal) return;
    // Doble validación en cliente (la barrera real es la RPC del servidor).
    const validacion: ValidacionAccion = validarAccion({
      estadoActual,
      accion: modal.accion,
      motivo,
      capacidades: capacidades!,
    });
    if (!validacion.ok) {
      setErrorModal(validacion.mensaje);
      return;
    }
    setEnviando(true);
    setErrorModal(null);
    const resultado: ResultadoCambioEstado = await cambiarEstado({
      proyectoId: proyecto.id,
      estadoDestino: validacion.estadoDestino,
      motivo: modal.motivoObligatorio ? motivo : motivo.trim() !== '' ? motivo : null,
    });
    setEnviando(false);
    if (resultado.ok) {
      setModal(null);
      notify?.(
        `Proyecto "${proyecto.name ?? proyecto.code ?? ''}": estado actualizado a "${etiquetaDesdeCatalogo(resultado.estadoNuevo, valoresEstado)}"${
          modal.motivoObligatorio ? ' (cambio registrado en la auditoría)' : ''
        }.`,
      );
      onEstadoCambiado?.(proyecto.id, resultado.estadoNuevo);
    } else {
      setErrorModal(resultado.mensaje);
    }
  };

  const etiquetaTipo = proyecto.tipoProyectoCodigo ?? null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <CicloVidaEstadoChip codigo={estadoActual} compacto />
      {!soloLectura && etiquetaTipo !== undefined && (
        <span
          style={{
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#475569',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '3px 10px',
          }}
          title="Tipo del proyecto (gp_tipos_proyecto_c) — clasificación administrativa, no afecta EDT/cronograma"
        >
          Tipo: {etiquetaTipo ? etiquetaDesdeCatalogo(etiquetaTipo, undefined) : SIN_CLASIFICAR}
        </span>
      )}

      {!soloLectura && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (accionesDisponibles.length === 0) return;
              setMenuAbierto((v) => !v);
            }}
            disabled={accionesDisponibles.length === 0}
            title={
              accionesDisponibles.length === 0
                ? estadoActual
                  ? resolucion.estado === 'ok'
                    ? 'Tu rol permite solo consulta del estado'
                    : `Acciones de dirección no disponibles: ${resolucion.mensaje}`
                  : 'Proyecto "Sin clasificar": requiere clasificación antes de acciones de dirección'
                : 'Acciones de dirección del proyecto'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: accionesDisponibles.length === 0 ? '#f8fafc' : '#ffffff',
              color: accionesDisponibles.length === 0 ? '#94a3b8' : '#334155',
              fontSize: '12px',
              fontWeight: 700,
              cursor: accionesDisponibles.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <Flag size={13} />
            <span>Acciones</span>
            {menuAbierto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {menuAbierto && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                zIndex: 60,
                minWidth: '240px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.16)',
                padding: '6px',
              }}
            >
              <div style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.6px', color: '#94a3b8', padding: '6px 10px 4px' }}>
                ACCIONES DE DIRECCIÓN
              </div>
              {accionesDisponibles.map((accion) => {
                const Icono = ICONO_ACCION[accion];
                const destino = TRANSICIONES_VALIDAS[estadoActual as EstadoProyecto]?.[accion] ?? null;
                return (
                  <button
                    key={accion}
                    type="button"
                    onClick={() => abrirModal(accion)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      width: '100%',
                      padding: '8px 10px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    title={destino ? `El estado pasará a "${destino}"` : ''}
                  >
                    <Icono size={14} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <span>{ETIQUETA_ACCION[accion]}</span>
                  </button>
                );
              })}
              <div style={{ fontSize: '10.5px', color: '#94a3b8', padding: '6px 10px 4px', borderTop: '1px solid #f1f5f9' }}>
                Cada cambio queda registrado en la auditoría (actor, fecha, motivo).
              </div>
            </div>
          )}
        </div>
      )}

      {soloLectura && onIrAFicha && (
        <button
          type="button"
          onClick={onIrAFicha}
          title="Las acciones de dirección se realizan desde la ficha del proyecto"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Info size={13} />
          <span>Acciones en la ficha Resumen</span>
        </button>
      )}

      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !enviando) setModal(null);
          }}
        >
          <div
            style={{
              width: 'min(470px, 100%)',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.28)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '9px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {(() => {
                  const Icono = ICONO_ACCION[modal.accion];
                  return <Icono size={18} />;
                })()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{ETIQUETA_ACCION[modal.accion]}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  El estado pasará de <b>{etiquetaDesdeCatalogo(estadoActual, valoresEstado)}</b> a{' '}
                  <b>{etiquetaDesdeCatalogo(modal.estadoDestino, valoresEstado)}</b>
                  {modal.accion === 'reabrir' ? ' (reapertura autorizada)' : ''}.
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 22px 20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Motivo {modal.motivoObligatorio && <span style={{ color: '#dc2626' }}>* (obligatorio — queda en la auditoría)</span>}
                {!modal.motivoObligatorio && <span style={{ color: '#94a3b8', fontWeight: 500 }}> (opcional)</span>}
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                autoFocus
                placeholder={
                  modal.accion === 'completar'
                    ? 'Ej. Cierre formal con acta de recepción del cliente…'
                    : modal.accion === 'cancelar'
                    ? 'Ej. Desactivación decidida por el patrocinador…'
                    : modal.accion === 'reabrir'
                    ? 'Ej. El cliente reactivó el alcance pendiente…'
                    : 'Contexto opcional del cambio…'
                }
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '9px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />

              {errorModal && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: 1.45,
                  }}
                >
                  {errorModal}
                </div>
              )}

              {errorModal && errorModal.includes('20261115_0010') && (
                <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                  La capa de ciclo de vida vive en <code>gp_proyectos</code> + RPC atómica. Aplica (en orden) los SQL
                  <b> 0008 → 0009 → 0010</b> y la cadena de prerrequisitos <b>0006a → 0005 → 0006b → 0004</b> para activarla.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  disabled={enviando}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: enviando ? 'wait' : 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAccion}
                  disabled={enviando}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #1d4ed8',
                    background: enviando ? '#93c5fd' : '#2563eb',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: enviando ? 'wait' : 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  {enviando ? 'Registrando…' : `Confirmar: ${ETIQUETA_ACCION[modal.accion].toLowerCase()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

