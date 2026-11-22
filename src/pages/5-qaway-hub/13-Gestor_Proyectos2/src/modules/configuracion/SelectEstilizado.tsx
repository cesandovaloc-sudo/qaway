import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectEstilizadoProps {
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  saved?: boolean;
}

function normalizarBusqueda(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const SelectEstilizado: React.FC<SelectEstilizadoProps> = ({
  value,
  placeholder = 'Seleccionar...',
  options,
  onChange,
  disabled = false,
  saved = false,
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bufferRef = useRef('');
  const bufferTimerRef = useRef<number | null>(null);

  const centrarOpcion = (idx: number) => {
    const lista = listRef.current;
    const item = optionRefs.current[idx];
    if (!lista || !item) return;
    const targetTop = item.offsetTop - lista.clientHeight / 2 + item.offsetHeight / 2;
    lista.scrollTop = Math.max(0, targetTop);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => () => {
    if (bufferTimerRef.current) window.clearTimeout(bufferTimerRef.current);
  }, []);

  // Al abrir, resaltar y desplazar la lista hasta la opción actualmente seleccionada
  useEffect(() => {
    if (!open) return;
    const activeIdx = options.findIndex((o) => o.value === value);
    const idx = activeIdx >= 0 ? activeIdx : 0;
    setHighlightedIdx(idx);
    requestAnimationFrame(() => centrarOpcion(idx));
  }, [open, value, options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || options.length === 0) return;

    if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const next = highlightedIdx < options.length - 1 ? highlightedIdx + 1 : 0;
      setHighlightedIdx(next);
      centrarOpcion(next);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const prev = highlightedIdx > 0 ? highlightedIdx - 1 : options.length - 1;
      setHighlightedIdx(prev);
      centrarOpcion(prev);
      return;
    }

    if (e.key === 'Enter' && open && highlightedIdx >= 0 && options[highlightedIdx]) {
      e.preventDefault();
      onChange(options[highlightedIdx].value);
      setOpen(false);
      return;
    }

    // Búsqueda por teclado (ej. escribir "call" salta a "Callao")
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const char = normalizarBusqueda(e.key);
      if (!char) return;
      e.preventDefault();
      if (bufferTimerRef.current) window.clearTimeout(bufferTimerRef.current);
      bufferRef.current += char;
      bufferTimerRef.current = window.setTimeout(() => {
        bufferRef.current = '';
      }, 700);

      const q = bufferRef.current;
      let idx = options.findIndex((o) => normalizarBusqueda(o.label).startsWith(q));
      if (idx < 0) {
        idx = options.findIndex((o) => normalizarBusqueda(o.label).includes(q));
      }
      if (idx >= 0) {
        if (open) {
          setHighlightedIdx(idx);
          centrarOpcion(idx);
        } else {
          onChange(options[idx].value);
        }
      }
    }
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapRef} onKeyDown={handleKeyDown} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          width: '100%',
          padding: '9px 12px',
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f8fafc' : (saved ? '#f1f5f9' : '#ffffff'),
          color: selected ? (saved ? '#475569' : '#0f172a') : '#94a3b8',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: '#64748b',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1200,
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
            padding: '4px',
          }}
        >
          {options.map((opt, idx) => {
            const active = opt.value === value;
            const highlighted = idx === highlightedIdx;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  optionRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: '7px',
                  backgroundColor: active ? '#eff6ff' : (highlighted ? '#f1f5f9' : 'transparent'),
                  color: active ? '#1d4ed8' : '#334155',
                  fontSize: '13.5px',
                  fontWeight: active ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={() => setHighlightedIdx(idx)}
              >
                <span>{opt.label}</span>
                {active && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectEstilizado;
