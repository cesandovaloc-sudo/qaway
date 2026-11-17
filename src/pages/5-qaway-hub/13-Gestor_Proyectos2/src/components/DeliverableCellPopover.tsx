/**
 * DeliverableCellPopover.tsx
 * ==========================
 * Editor inline en celda para uno o múltiples entregables en la tabla del Gantt.
 * Permite:
 *   · Ver y quitar los entregables actuales de la fila.
 *   · Agregar entregables desde los catálogos reales (gp_categorias_entregable_c
 *     + gp_tipos_entregable_c) con GEN primero y las 23 categorías colapsadas.
 *   · Agregar un entregable personalizado por texto libre si hace falta.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { DeliverableItem } from '../modules/cronograma-core/types';
import TipoEntregableCatalogoSelect from './TipoEntregableCatalogoSelect';

interface Props {
  deliverables?: DeliverableItem[];
  deliverableText?: string;
  itemId: string;
  onChange: (nextDeliverables: DeliverableItem[], summaryText: string) => void;
  onClose: () => void;
}

function normalizeList(deliverables?: DeliverableItem[], deliverableText?: string, itemId?: string): DeliverableItem[] {
  if (deliverables && deliverables.length > 0) return deliverables;
  const raw = (deliverableText || '').trim();
  if (!raw) return [];
  return raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name, idx) => ({
      id: `deliv-${itemId || 'item'}-${idx}`,
      name,
      type: 'document' as const,
    }));
}

export function DeliverableCellPopover({
  deliverables,
  deliverableText,
  itemId,
  onChange,
  onClose,
}: Props) {
  const [customName, setCustomName] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  const listaActual = useMemo(
    () => normalizeList(deliverables, deliverableText, itemId),
    [deliverables, deliverableText, itemId]
  );

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const emit = (next: DeliverableItem[]) => {
    const summary = next.map((d) => d.name).join(', ');
    onChange(next, summary);
  };

  const handleAdd = (name: string, tipoCodigo?: string) => {
    const clean = name.trim();
    if (!clean) return;
    const existe = listaActual.some(
      (d) => d.name.trim().toLowerCase() === clean.toLowerCase() && (!tipoCodigo || d.tipoCodigo === tipoCodigo)
    );
    if (existe) return;
    const nuevo: DeliverableItem = {
      id: `deliv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: clean,
      type: 'document',
      ...(tipoCodigo ? { tipoCodigo } : {}),
    };
    emit([...listaActual, nuevo]);
  };

  const handleRemove = (id: string) => {
    emit(listaActual.filter((d) => d.id !== id));
  };

  return (
    <div
      ref={wrapRef}
      className="filter-card-popover"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        width: '320px',
        zIndex: 9999,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        boxShadow: '0 14px 32px -6px rgba(15, 23, 42, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
        padding: '10px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Entregables ({listaActual.length})
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: 'none',
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Listo
        </button>
      </div>

      {listaActual.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', maxHeight: '110px', overflowY: 'auto' }}>
          {listaActual.map((d) => (
            <div
              key={d.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                padding: '4px 8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0f172a',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {d.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(d.id)}
                title="Quitar entregable"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <TipoEntregableCatalogoSelect
        onChange={(sel) => {
          if (sel) handleAdd(sel.nombre, sel.codigo);
        }}
      />

      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customName.trim()) {
              e.preventDefault();
              handleAdd(customName);
              setCustomName('');
            }
          }}
          placeholder="O escribir otro entregable..."
          style={{
            flex: 1,
            height: '30px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            padding: '0 8px',
            fontSize: '12px',
            color: '#0f172a',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!customName.trim()) return;
            handleAdd(customName);
            setCustomName('');
          }}
          title="Agregar entregable"
          style={{
            height: '30px',
            padding: '0 9px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '11.5px',
            fontWeight: 600,
          }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

export default DeliverableCellPopover;
