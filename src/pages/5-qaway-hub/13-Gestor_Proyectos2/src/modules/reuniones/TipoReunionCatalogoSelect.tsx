/**
 * TipoReunionCatalogoSelect.tsx (reuniones)
 * =========================================
 * Selector de TIPO de reunión alimentado por el catálogo real
 * `gp_tipos_reunion_c` de Supabase (lectura vía gpCatalogosService con el
 * cliente COMPARTIDO del Hub).
 *
 * Contrato igual que EstadoReunionCatalogoSelect, con UNA diferencia honesta:
 * los TIPOS no tienen vocabulario local vigente (estadoReunion.ts es de
 * estados), así que en 'error' el selector queda deshabilitado con mensaje
 * honesto — la regla de la casa es no inventar valores de catálogo.
 *
 * Comportamiento por estado:
 *   · cargando → se muestra vacío mientras llega el catálogo (sin parpadeo).
 *   · lista    → opciones DEL CATÁLOGO en su `orden` (etiqueta = alias español).
 *   · vacio    → selector deshabilitado con mensaje honesto.
 *   · error    → selector deshabilitado con mensaje honesto + console.warn del servicio.
 *
 * El valor que emite SIEMPRE es un código del catálogo (KICKOFF, SEGUIMIENTO,
 * COMITE, PLANIFICACION, REVISION, RETROSPECTIVA, CIERRE, DAILY) — el que
 * persistirá en gp_reuniones.tipo_codigo en el cutover (Etapa 7).
 */

import { useEffect, useState } from 'react';
import { listarTiposReunionGestor } from '../../services/gpCatalogosService';

interface Props {
  value: string;
  onChange: (codigo: string) => void;
  disabled?: boolean;
}

type Fuente =
  | { estado: 'local' }
  | { estado: 'catalogo'; opciones: { codigo: string; etiqueta: string }[] }
  | { estado: 'vacio' };

export default function TipoReunionCatalogoSelect({ value, onChange, disabled = false }: Props) {
  const [fuente, setFuente] = useState<Fuente>({ estado: 'local' });

  useEffect(() => {
    let vigente = true;
    listarTiposReunionGestor()
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

  if (fuente.estado === 'vacio' || fuente.estado === 'local') {
    const title =
      fuente.estado === 'vacio'
        ? 'gp_tipos_reunion_c no tiene valores activos'
        : 'Catálogo gp_tipos_reunion_c no disponible — sin vocabulario local (ver consola)';
    return (
      <select disabled value="" title={title}>
        <option value="">Tipo no disponible ahora</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title="Fuente: gp_tipos_reunion_c · Supabase (catálogo real)"
      disabled={disabled}
    >
      <option value="">Sin clasificar</option>
      {fuente.opciones.map((o) => (
        <option key={o.codigo} value={o.codigo}>
          {o.etiqueta}
        </option>
      ))}
    </select>
  );
}
