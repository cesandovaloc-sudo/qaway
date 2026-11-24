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

import { useEffect, useState } from 'react';
import {
  listarCatalogo,
  TABLA_TIPOS_PROYECTO,
  type ValorCatalogo,
} from '../services/gpCatalogosService';
import { SIN_CLASIFICAR } from '../services/gpCicloVidaService';
import SelectEstilizado, { type SelectOption } from '../modules/configuracion/SelectEstilizado';

interface Props {
  /** Código persistido (gp_proyectos.tipo_proyecto_codigo). null = "Sin clasificar". */
  value: string | null;
  onChange: (codigo: string | null) => void;
  disabled?: boolean;
  /** Texto del option nulo (por defecto "Sin clasificar"). */
  etiquetaNula?: string;
}

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
        if (vigente) setFuente({ estado: 'error', mensaje: 'No se pudo cargar el catálogo de tipos.' });
      });
    return () => {
      vigente = false;
    };
  }, []);

  if (fuente.estado === 'vacio') {
    return (
      <SelectEstilizado
        value=""
        placeholder={`${etiquetaNula} (catálogo vacío)`}
        options={[{ value: '', label: `${etiquetaNula} (catálogo vacío)` }]}
        onChange={() => {}}
        disabled
      />
    );
  }

  if (fuente.estado === 'error') {
    return (
      <SelectEstilizado
        value=""
        placeholder={`${etiquetaNula} (catálogo no disponible)`}
        options={[{ value: '', label: `${etiquetaNula} (catálogo no disponible)` }]}
        onChange={() => {}}
        disabled
      />
    );
  }

  if (fuente.estado === 'cargando') {
    return (
      <SelectEstilizado
        value=""
        placeholder="Cargando tipos de proyecto…"
        options={[{ value: '', label: 'Cargando tipos de proyecto…' }]}
        onChange={() => {}}
        disabled
      />
    );
  }

  const valorActualEnCatalogo = value ? fuente.valores.some((v) => v.codigo === value) : true;
  const opciones: SelectOption[] = [
    { value: '', label: etiquetaNula },
    ...(!valorActualEnCatalogo && value ? [{ value, label: value }] : []),
    ...fuente.valores.map((v) => ({ value: v.codigo, label: v.nombre })),
  ];

  return (
    <SelectEstilizado
      value={value ?? ''}
      placeholder={etiquetaNula}
      options={opciones}
      disabled={disabled}
      onChange={(val) => onChange(val === '' ? null : val)}
    />
  );
}
