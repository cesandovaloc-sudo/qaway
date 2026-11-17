/**
 * EstadoEjecucionCatalogoSelect.tsx (tareas-2)
 * ============================================
 * Selector de ESTADO DE EJECUCIÓN alimentado por el catálogo real
 * `gp_estados_ejecucion_c` de Supabase (solo valores con `activo = true`:
 * Pendiente · En proceso · Completado). Los estados inactivos (`en_revision`,
 * `bloqueada`, `cancelada`) no aparecen hasta que sean activados en BD.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import {
  listarEstadosEjecucionGestor,
  type ValorCatalogo,
} from '../../services/gpCatalogosService';

interface Props {
  value: string;
  onChange: (valor: string) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const OPCIONES_FALLBACK: { valor: string; etiqueta: string }[] = [
  { valor: 'Pendiente', etiqueta: 'Pendiente' },
  { valor: 'En proceso', etiqueta: 'En proceso' },
  { valor: 'Completado', etiqueta: 'Completado' },
];

const ESTILO_SELECT_DEFAULT: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13.5px',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
  backgroundColor: '#ffffff',
};

type Fuente =
  | { estado: 'cargando' }
  | { estado: 'lista'; valores: ValorCatalogo[] }
  | { estado: 'vacio' }
  | { estado: 'error' };

export default function EstadoEjecucionCatalogoSelect({
  value,
  onChange,
  disabled = false,
  className,
  style,
}: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    listarEstadosEjecucionGestor()
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
  let title = 'Estado de ejecución';

  if (fuente.estado === 'lista' && fuente.valores.length > 0) {
    opciones = fuente.valores.map((v) => ({
      valor: v.nombre,
      etiqueta: v.nombre,
    }));
    title = 'Fuente: gp_estados_ejecucion_c · Supabase (catálogo real)';
  } else if (fuente.estado === 'error') {
    title = 'Catálogo gp_estados_ejecucion_c no disponible — usando vocabulario local';
  }

  // Si el ítem tiene un estado heredado o calculado (ej. 'Con retraso' o 'Cumple'),
  // lo preservamos como opción visible para no perder su valor actual al editar.
  const valorNormalizado = value || 'Pendiente';
  const existeEnLista = opciones.some((o) => o.valor === valorNormalizado);
  const opcionesFinales = existeEnLista
    ? opciones
    : [{ valor: valorNormalizado, etiqueta: valorNormalizado }, ...opciones];

  return (
    <select
      value={valorNormalizado}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || fuente.estado === 'vacio'}
      title={title}
      className={className}
      style={className ? style : { ...ESTILO_SELECT_DEFAULT, ...style }}
    >
      {opcionesFinales.map((op) => (
        <option key={op.valor} value={op.valor}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}
