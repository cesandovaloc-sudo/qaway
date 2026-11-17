/**
 * CicloVidaEstadoChip.tsx — Etapa 6.3 (Paso 3/4)
 * =============================================
 * Chip de ESTADO GENERAL del proyecto (solo lectura), para la ficha Resumen y
 * para Configuración (donde el estado aparece ÚNICAMENTE como información —
 * las acciones de dirección viven en la ficha, decisión aprobada 6.2 §4.2).
 *
 * La etiqueta se resuelve con el catálogo VIVO `gp_estados_proyecto_c`
 * (gpCatalogosService, con caché de sesión); estado NULL ⇒ "Sin clasificar"
 * (bucket explícito B-8 — PROHIBIDO coercionar a 'planificacion').
 */

import { useEffect, useState } from 'react';
import { listarCatalogo, TABLA_ESTADOS_PROYECTO, type ValorCatalogo } from '../services/gpCatalogosService';
import { etiquetaDesdeCatalogo } from '../services/gpCicloVidaService';

interface Props {
  codigo: string | null | undefined;
  /** Tamaño compacto para cabeceras. */
  compacto?: boolean;
}

/** Colores institucionales por estado (semántica coherente con la app). */
const COLOR_POR_CODIGO: Record<string, { fondo: string; texto: string; borde: string }> = {
  planificacion: { fondo: '#eff6ff', texto: '#1d4ed8', borde: '#bfdbfe' },
  en_curso: { fondo: '#ecfdf5', texto: '#047857', borde: '#a7f3d0' },
  pausado: { fondo: '#fffbeb', texto: '#b45309', borde: '#fde68a' },
  completado: { fondo: '#f0fdfa', texto: '#0f766e', borde: '#99f6e4' },
  cancelado: { fondo: '#fef2f2', texto: '#b91c1c', borde: '#fecaca' },
};

const GRIS = { fondo: '#f1f5f9', texto: '#475569', borde: '#e2e8f0' };

export default function CicloVidaEstadoChip({ codigo, compacto = false }: Props) {
  const [valores, setValores] = useState<ValorCatalogo[] | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    listarCatalogo(TABLA_ESTADOS_PROYECTO).then((r) => {
      if (vigente && r.estado === 'lista') setValores(r.valores);
    });
    return () => {
      vigente = false;
    };
  }, []);

  const color = (codigo && COLOR_POR_CODIGO[codigo]) || GRIS;
  const etiqueta = etiquetaDesdeCatalogo(codigo, valores);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: compacto ? '3px 10px' : '5px 12px',
        borderRadius: '999px',
        background: color.fondo,
        color: color.texto,
        border: `1px solid ${color.borde}`,
        fontSize: compacto ? '11px' : '12px',
        fontWeight: 700,
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
      }}
      title={codigo ? `Estado del proyecto: ${etiqueta} (gp_estados_proyecto_c)` : 'Estado del proyecto: Sin clasificar (NULL — B-8)'}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          background: color.texto,
          flexShrink: 0,
        }}
      />
      {etiqueta}
    </span>
  );
}
