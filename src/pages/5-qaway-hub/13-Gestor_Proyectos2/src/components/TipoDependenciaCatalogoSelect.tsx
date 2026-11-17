/**
 * TipoDependenciaCatalogoSelect.tsx — Catálogo 6 (gp_tipos_dependencia_c)
 * =====================================================================
 * Selector de TIPO DE DEPENDENCIA entre tareas y nodos EDT alimentado por
 * el catálogo real `gp_tipos_dependencia_c` de Supabase (lectura vía
 * gpCatalogosService con el cliente compartido del Hub).
 *
 * Opciones canónicas (PMI/PMBOK con alias en español):
 *   · FS: Fin a comienzo (Finish-to-Start, predeterminado)
 *   · SS: Comienzo a comienzo (Start-to-Start)
 *   · FF: Fin a fin (Finish-to-Finish)
 *   · SF: Comienzo a fin (Start-to-Finish)
 */

import { useEffect, useState, type CSSProperties } from 'react';
import {
  listarTiposDependenciaGestor,
  type ValorCatalogo,
} from '../services/gpCatalogosService';

export interface Props {
  value: string;
  onChange: (codigo: string) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const OPCIONES_FALLBACK: { codigo: string; etiqueta: string }[] = [
  { codigo: 'FS', etiqueta: 'FS · Fin a comienzo' },
  { codigo: 'SS', etiqueta: 'SS · Comienzo a comienzo' },
  { codigo: 'FF', etiqueta: 'FF · Fin a fin' },
  { codigo: 'SF', etiqueta: 'SF · Comienzo a fin' },
];

const ESTILO_SELECT_DEFAULT: CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '12px',
  fontWeight: 600,
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
  cursor: 'pointer',
};

type Fuente =
  | { estado: 'cargando' }
  | { estado: 'lista'; valores: ValorCatalogo[] }
  | { estado: 'vacio' }
  | { estado: 'error' };

export function TipoDependenciaCatalogoSelect({
  value,
  onChange,
  disabled = false,
  className,
  style,
}: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    listarTiposDependenciaGestor()
      .then((resultado) => {
        if (!vigente) return;
        if (resultado.estado === 'lista') {
          setFuente({ estado: 'lista', valores: resultado.valores });
        } else if (resultado.estado === 'vacio') {
          setFuente({ estado: 'vacio' });
        } else {
          setFuente({ estado: 'error' });
        }
      })
      .catch(() => {
        if (vigente) setFuente({ estado: 'error' });
      });
    return () => {
      vigente = false;
    };
  }, []);

  let opciones = OPCIONES_FALLBACK;
  let title = 'Tipo de dependencia (PMI/PMBOK)';

  if (fuente.estado === 'lista' && fuente.valores.length > 0) {
    opciones = fuente.valores.map((v) => ({
      codigo: v.codigo,
      etiqueta: `${v.codigo} · ${v.alias || v.nombre}`,
    }));
    title = 'Fuente: gp_tipos_dependencia_c · Supabase (catálogo real)';
  } else if (fuente.estado === 'error') {
    title = 'Catálogo gp_tipos_dependencia_c no disponible — usando valores locales';
  }

  const valorActual = value || 'FS';

  return (
    <select
      value={valorActual}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || fuente.estado === 'vacio'}
      title={title}
      className={className}
      style={className ? style : { ...ESTILO_SELECT_DEFAULT, ...style }}
    >
      {opciones.map((op) => (
        <option key={op.codigo} value={op.codigo}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}

export default TipoDependenciaCatalogoSelect;
