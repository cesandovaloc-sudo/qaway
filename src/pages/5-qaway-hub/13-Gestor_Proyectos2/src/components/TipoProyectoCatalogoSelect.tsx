/**
 * TipoProyectoCatalogoSelect.tsx — Etapa 6.3 (Paso 1)
 * ==================================================
 * Selector de TIPO DE PROYECTO alimentado por el catálogo real
 * `gp_tipos_proyecto_c` de Supabase (lectura vía gpCatalogosService con el
 * cliente COMPARTIDO del Hub). Persistencia definitiva:
 * `gp_proyectos.tipo_proyecto_codigo` (0002 L38, FK por código) — la columna
 * vive en el modelo local `ProjectItem.tipoProyectoCodigo` de forma
 * TRANSICIONAL hasta el cutover (SQL 0002/0004 pendientes), sin sustituirla.
 *
 * Estados honestos (Etapa 6 §3 / 6.3):
 *   · cargando → opciones mínimas mientras llega el catálogo.
 *   · lista    → "Sin clasificar" (NULL, B-8) + valores activos del catálogo.
 *   · vacio    → catálogo sin valores (gp_tipos_proyecto_c está VACÍA por
 *     diseño hoy; seed pendiente SQL 0009): selector deshabilitado con mensaje,
 *     la creación del proyecto NO se bloquea.
 *   · error    → deshabilitado con mensaje + title de diagnóstico (nada se
 *     inventa como sustituto del catálogo).
 *
 * COMPONENTE HIJO con hooks estables (mismo patrón de PrioridadCatalogoSelect,
 * Etapa 6): puede montarse dentro de formularios que renderizan condicionalmente.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import {
  listarCatalogo,
  TABLA_TIPOS_PROYECTO,
  type ValorCatalogo,
} from '../services/gpCatalogosService';
import { SIN_CLASIFICAR } from '../services/gpCicloVidaService';

interface Props {
  /** Código persistido (gp_proyectos.tipo_proyecto_codigo). null = "Sin clasificar". */
  value: string | null;
  onChange: (codigo: string | null) => void;
  disabled?: boolean;
  /** Texto del option nulo (por defecto "Sin clasificar"). */
  etiquetaNula?: string;
}

const ESTILO_SELECT: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '9px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#ffffff',
};

type Fuente =
  | { estado: 'cargando' }
  | { estado: 'lista'; valores: ValorCatalogo[] }
  | { estado: 'vacio' }
  | { estado: 'error'; mensaje: string };

export default function TipoProyectoCatalogoSelect({
  value,
  onChange,
  disabled = false,
  etiquetaNula = SIN_CLASIFICAR,
}: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'cargando' });

  useEffect(() => {
    let vigente = true;
    listarCatalogo(TABLA_TIPOS_PROYECTO)
      .then((resultado) => {
        if (!vigente) return;
        if (resultado.estado === 'lista') {
          setFuente({ estado: 'lista', valores: resultado.valores });
        } else if (resultado.estado === 'vacio') {
          setFuente({ estado: 'vacio' });
        } else {
          setFuente({ estado: 'error', mensaje: resultado.mensaje });
        }
      })
      .catch(() => {
        if (vigente) setFuente({ estado: 'error', mensaje: 'Fallo al leer gp_tipos_proyecto_c.' });
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (fuente.estado === 'vacio') {
    return (
      <select disabled style={{ ...ESTILO_SELECT, color: '#64748b' }} value={value ?? ''} title="gp_tipos_proyecto_c sin valores activos — seed pendiente (SQL 20261115_0009)">
        <option value={value ?? ''}>{value ? value : `${etiquetaNula} — catálogo de tipos vacío (SQL 0009 pendiente)`}</option>
      </select>
    );
  }

  if (fuente.estado === 'error') {
    return (
      <select disabled style={{ ...ESTILO_SELECT, color: '#64748b' }} value={value ?? ''} title={`gp_tipos_proyecto_c no disponible: ${fuente.mensaje}`}>
        <option value={value ?? ''}>{value ? value : `${etiquetaNula} — catálogo no disponible (ver consola)`}</option>
      </select>
    );
  }

  if (fuente.estado === 'cargando') {
    return (
      <select style={ESTILO_SELECT} value={value ?? ''} title="Cargando gp_tipos_proyecto_c…" onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}>
        <option value={value ?? ''}>{value ? `${value} (cargando catálogo…)` : `${etiquetaNula} (cargando catálogo…)`}</option>
      </select>
    );
  }

  // Lista: opción nula + valores activos del catálogo real.
  const valorActualEnCatalogo = value ? fuente.valores.some((v) => v.codigo === value) : true;
  return (
    <select
      style={ESTILO_SELECT}
      value={value ?? ''}
      title="Fuente: gp_tipos_proyecto_c · Supabase (catálogo real)"
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
    >
      <option value="">{etiquetaNula}</option>
      {!valorActualEnCatalogo && value && <option value={value}>{value} (valor guardado no activo)</option>}
      {fuente.valores.map((v) => (
        <option key={v.codigo} value={v.codigo}>
          {v.nombre}
        </option>
      ))}
    </select>
  );
}
