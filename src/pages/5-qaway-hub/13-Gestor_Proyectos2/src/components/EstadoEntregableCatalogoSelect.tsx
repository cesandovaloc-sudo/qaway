/**
 * EstadoEntregableCatalogoSelect.tsx — Catálogo 8 (gp_estados_entregable_c)
 * =========================================================================
 * Selector compacto de estado del entregable alimentado en vivo por
 * `gp_estados_entregable_c` (solo activos: pendiente, en_proceso, aprobado,
 * rechazado, completado).
 */

import { useEffect, useState } from 'react';
import {
  listarEstadosEntregableGestor,
  type ValorCatalogo,
} from '../services/gpCatalogosService';

export interface Props {
  value?: string;
  onChange: (codigo: string) => void;
  disabled?: boolean;
}

const OPCIONES_FALLBACK: { codigo: string; etiqueta: string }[] = [
  { codigo: 'pendiente', etiqueta: 'Pendiente' },
  { codigo: 'en_proceso', etiqueta: 'En proceso' },
  { codigo: 'aprobado', etiqueta: 'Aprobado' },
  { codigo: 'rechazado', etiqueta: 'Rechazado' },
  { codigo: 'completado', etiqueta: 'Completado' },
];

const ESTILO_POR_ESTADO: Record<string, { bg: string; border: string; color: string }> = {
  pendiente: { bg: '#f8fafc', border: '#cbd5e1', color: '#475569' },
  en_proceso: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
  aprobado: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  rechazado: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  completado: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
};

export function EstadoEntregableCatalogoSelect({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [valores, setValores] = useState<ValorCatalogo[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<'cargando' | 'lista' | 'error'>('cargando');

  useEffect(() => {
    let vigente = true;
    listarEstadosEntregableGestor()
      .then((res) => {
        if (!vigente) return;
        if (res.estado === 'lista') {
          setValores(res.valores);
          setEstadoCarga('lista');
        } else {
          setEstadoCarga('error');
        }
      })
      .catch(() => {
        if (vigente) setEstadoCarga('error');
      });
    return () => {
      vigente = false;
    };
  }, []);

  const opciones =
    estadoCarga === 'lista' && valores.length > 0
      ? valores.map((v) => ({ codigo: v.codigo, etiqueta: v.alias || v.nombre }))
      : OPCIONES_FALLBACK;

  const actual = value || 'pendiente';
  const paleta = ESTILO_POR_ESTADO[actual] || ESTILO_POR_ESTADO.pendiente;

  return (
    <select
      value={actual}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      title={
        estadoCarga === 'lista'
          ? 'Estado del entregable (gp_estados_entregable_c)'
          : 'Estado del entregable'
      }
      style={{
        height: '25px',
        padding: '0 6px',
        borderRadius: '6px',
        border: `1px solid ${paleta.border}`,
        background: paleta.bg,
        color: paleta.color,
        fontSize: '11px',
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {opciones.map((op) => (
        <option key={op.codigo} value={op.codigo} style={{ background: '#ffffff', color: '#0f172a' }}>
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}

export default EstadoEntregableCatalogoSelect;
