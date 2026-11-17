/**
 * PrioridadCatalogoSelect.tsx (tareas-2) — Etapa 6
 * ===============================================
 * Selector de PRIORIDAD de tarea alimentado por el catálogo real
 * `gp_prioridades_c` de Supabase (lectura vía gpCatalogosService con el cliente
 * COMPARTIDO del Hub). Reemplaza al <select> estático de AsignarTareaDrawer
 * SIN cambiar el diseño visual: en la ruta exitosa las opciones son exactamente
 * las mismas ("🔴 Alta / 🟡 Media / ⚪ Baja") porque el catálogo vivo define
 * baja/media/alta/urgente (ajuste 15-nov) y la pantalla mapea sus etiquetas.
 *
 * Comportamiento por estado (exigido por la Etapa 6 §3):
 *   · cargando → se muestran las opciones vigentes mientras llega el catálogo
 *     (sin parpadeo ni layout shift).
 *   · lista    → opciones DEL CATÁLOGO (filtradas al vocabulario operativo
 *     vigente 'Alta|Media|Baja'; 'urgente' queda mapeado para el cutover a
 *     gp_tareas, donde el modelo se amplía — doc 6.1).
 *   · vacio    → selector deshabilitado con mensaje honesto (sin valores).
 *   · error    → vocabulario operativo vigente como FALLBACK (misma funcionalidad
 *     de siempre, no datos inventados) + title en hover + console.warn del
 *     servicio. Con prerrequisitos aplicados (0007/0004) la ruta normal es
 *     'lista' y el hover confirma la fuente.
 *
 * Es un COMPONENTE HIJO propio a propósito: AsignarTareaDrawer retorna null
 * antes de sus hooks (patrón preexistente); este componente monta fresco con
 * cada apertura y su orden de hooks es estable. NO toca el Gantt.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import {
  listarPrioridadesGestor,
  type ValorCatalogo,
} from '../../services/gpCatalogosService';

/** Vocabulario operativo vigente del modelo de tareas (sin 'urgente' aún). */
type PrioridadOperativa = 'Alta' | 'Media' | 'Baja';

interface Props {
  value: PrioridadOperativa;
  onChange: (valor: PrioridadOperativa) => void;
  disabled?: boolean;
}

/** Icono por código del catálogo (identico al select estático original). */
const ICONO_POR_CODIGO: Record<string, string> = {
  alta: '🔴',
  media: '🟡',
  baja: '⚪',
};

/** Vocabulario vigente que el modelo acepta hoy (cutover a gp_tareas ampliará). */
const CODIGOS_OPERATIVOS = ['alta', 'media', 'baja'];

const OPCIONES_FALLBACK: { valor: PrioridadOperativa; etiqueta: string }[] = [
  { valor: 'Alta', etiqueta: '🔴 Alta' },
  { valor: 'Media', etiqueta: '🟡 Media' },
  { valor: 'Baja', etiqueta: '⚪ Baja' },
];

const ESTILO_SELECT: CSSProperties = {
  width: '100%',
  padding: '9px 10px',
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

export default function PrioridadCatalogoSelect({ value, onChange, disabled = false }: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    listarPrioridadesGestor()
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

  // Opciones desde el catálogo real (solo codigos aceptados por el modelo hoy).
  let opciones = OPCIONES_FALLBACK;
  let title = 'Prioridad de la tarea';
  if (fuente.estado === 'lista') {
    const delCatalogo = fuente.valores
      .filter((v) => CODIGOS_OPERATIVOS.includes(v.codigo))
      .map((v) => ({
        valor: v.codigo as PrioridadOperativa,
        etiqueta: `${ICONO_POR_CODIGO[v.codigo] ?? '⚪'} ${v.nombre}`,
      }));
    if (delCatalogo.length > 0) {
      opciones = delCatalogo;
      title = 'Fuente: gp_prioridades_c · Supabase (catálogo real)';
    } else {
      title = 'Catálogo gp_prioridades_c sin valores compatibles — usando vocabulario local';
    }
  } else if (fuente.estado === 'error') {
    title = 'Catálogo gp_prioridades_c no disponible — usando vocabulario local (ver consola)';
  }

  if (fuente.estado === 'vacio') {
    return (
      <select disabled style={ESTILO_SELECT} value="" title="gp_prioridades_c no tiene valores activos">
        <option value="">Sin valores en el catálogo (Supabase)</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as PrioridadOperativa)}
      style={ESTILO_SELECT}
      title={title}
      disabled={disabled}
    >
      {opciones.map((op) => (
        <option key={op.valor} value={op.valor}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}
