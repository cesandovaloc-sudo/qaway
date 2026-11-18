/**
 * EstadoReunionCatalogoSelect.tsx (reuniones)
 * ===========================================
 * Selector de ESTADO de reunión alimentado por el catálogo real
 * `gp_estados_reunion_c` de Supabase (lectura vía gpCatalogosService con el
 * cliente COMPARTIDO del Hub).
 *
 * Comportamiento por estado (mismo contrato que PrioridadCatalogoSelect):
 *   · cargando → opciones locales mientras llega el catálogo (sin parpadeo).
 *   · lista    → opciones DEL CATÁLOGO en su `orden` (codigo + alias español).
 *   · vacio    → selector deshabilitado con mensaje honesto.
 *   · error    → fallback local (el vocabulario alineado de `estadoReunion.ts`)
 *     + title en hover + console.warn del servicio.
 *
 * El valor que emite SIEMPRE es un código del catálogo (PROGRAMADA, EN_CURSO,
 * REALIZADA, CANCELADA, POSPUESTA, REPROGRAMADA), no la etiqueta.
 */

import { useEffect, useState } from 'react';
import { listarEstadosReunionGestor } from '../../services/gpCatalogosService';
import { ESTADOS_REUNION, normalizarEstadoReunion, type EstadoReunionCodigo } from './estadoReunion';

interface Props {
  value: string;
  onChange: (valor: EstadoReunionCodigo) => void;
  disabled?: boolean;
}

type Fuente =
  | { estado: 'local' }
  | { estado: 'catalogo'; opciones: { codigo: string; etiqueta: string }[] }
  | { estado: 'vacio' };

export function EstadoReunionCatalogoSelect({ value, onChange, disabled = false }: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'local' });

  useEffect(() => {
    let vigente = true;
    listarEstadosReunionGestor()
      .then((resultado) => {
        if (!vigente) return;
        if (resultado.estado === 'lista') {
          setFuente({
            estado: 'catalogo',
            opciones: resultado.valores.map((v) => ({
              codigo: v.codigo,
              etiqueta: v.alias || v.nombre || v.codigo,
            })),
          });
        } else if (resultado.estado === 'vacio') {
          setFuente({ estado: 'vacio' });
        } else {
          setFuente({ estado: 'local' });
        }
      })
      .catch(() => {
        if (vigente) setFuente({ estado: 'local' });
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (fuente.estado === 'vacio') {
    return (
      <select disabled value="" title="gp_estados_reunion_c no tiene valores activos">
        <option value="">Sin valores en el catálogo (Supabase)</option>
      </select>
    );
  }

  const opciones =
    fuente.estado === 'catalogo'
      ? fuente.opciones
      : ESTADOS_REUNION.map((e) => ({ codigo: e.codigo, etiqueta: e.etiqueta }));

  const title =
    fuente.estado === 'catalogo'
      ? 'Fuente: gp_estados_reunion_c · Supabase (catálogo real)'
      : 'Catálogo gp_estados_reunion_c no disponible — usando vocabulario local (ver consola)';

  return (
    <select
      value={normalizarEstadoReunion(value)}
      onChange={(e) => onChange(normalizarEstadoReunion(e.target.value))}
      title={title}
      disabled={disabled}
    >
      {opciones.map((op) => (
        <option key={op.codigo} value={op.codigo}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}

export default EstadoReunionCatalogoSelect;
