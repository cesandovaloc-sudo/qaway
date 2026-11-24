import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Info } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  parentValue?: string | null;
  nivel?: number;
  badge?: string;
  description?: string;
  infoTooltip?: string;
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
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [popoverWidth, setPopoverWidth] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bufferRef = useRef('');
  const bufferTimerRef = useRef<number | null>(null);

  const esJerarquico = useMemo(
    () => options.some((o) => o.nivel !== undefined || o.parentValue !== undefined),
    [options],
  );

  const padresConHijos = useMemo(() => {
    const set = new Set<string>();
    for (const o of options) {
      if (o.parentValue) set.add(o.parentValue);
    }
    return set;
  }, [options]);

  const opcionesVisibles = useMemo(() => {
    if (!esJerarquico) return options;
    const padreDe = new Map<string, string | null | undefined>();
    for (const o of options) padreDe.set(o.value, o.parentValue);
    return options.filter((o) => {
      let cur = o.parentValue;
      const visitados = new Set<string>();
      while (cur) {
        if (visitados.has(cur)) break;
        visitados.add(cur);
        if (!expandidos[cur]) return false;
        cur = padreDe.get(cur) ?? null;
      }
      return true;
    });
  }, [esJerarquico, options, expandidos]);

  const iniciarRedimension = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const popoverEl = e.currentTarget.parentElement;
    const startWidth = popoverEl ? popoverEl.getBoundingClientRect().width : 280;
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(680, Math.max(240, startWidth + (ev.clientX - startX)));
      setPopoverWidth(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

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
    const activeIdx = opcionesVisibles.findIndex((o) => o.value === value);
    const idx = activeIdx >= 0 ? activeIdx : 0;
    setHighlightedIdx(idx);
    requestAnimationFrame(() => centrarOpcion(idx));
  }, [open, value, opcionesVisibles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || opcionesVisibles.length === 0) return;

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
      const next = highlightedIdx < opcionesVisibles.length - 1 ? highlightedIdx + 1 : 0;
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
      const prev = highlightedIdx > 0 ? highlightedIdx - 1 : opcionesVisibles.length - 1;
      setHighlightedIdx(prev);
      centrarOpcion(prev);
      return;
    }

    if (e.key === 'Enter' && open && highlightedIdx >= 0 && opcionesVisibles[highlightedIdx]) {
      e.preventDefault();
      onChange(opcionesVisibles[highlightedIdx].value);
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
      let idx = opcionesVisibles.findIndex((o) => normalizarBusqueda(o.label).startsWith(q));
      if (idx < 0) {
        idx = opcionesVisibles.findIndex((o) => normalizarBusqueda(o.label).includes(q));
      }
      if (idx >= 0) {
        if (open) {
          setHighlightedIdx(idx);
          centrarOpcion(idx);
        } else {
          onChange(opcionesVisibles[idx].value);
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
          height: '38px',
          padding: '0 12px',
          fontSize: '13.5px',
          lineHeight: '1',
          boxSizing: 'border-box',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f8fafc' : (saved ? '#f1f5f9' : '#ffffff'),
          color: selected ? (saved ? '#475569' : '#0f172a') : '#94a3b8',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? (selected.badge ? `${selected.badge} · ${selected.label}` : selected.label) : placeholder}
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
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: esJerarquico ? 'auto' : 0,
            minWidth: esJerarquico ? '340px' : '100%',
            width: popoverWidth ? `${popoverWidth}px` : undefined,
            maxWidth: '680px',
            zIndex: 1200,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            ref={listRef}
            style={{
              maxHeight: '290px',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: esJerarquico ? '8px 14px 8px 8px' : '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {opcionesVisibles.map((opt, idx) => {
              const active = opt.value === value;
              const highlighted = idx === highlightedIdx;
              const tieneHijos = padresConHijos.has(opt.value);
              const estaExpandido = Boolean(expandidos[opt.value]);
              const nivel = opt.nivel ?? 1;
              const indentPx = esJerarquico && opt.value !== '' ? Math.max(0, nivel - 1) * 18 : 0;
              const esOpcionNeutra = esJerarquico && opt.value === '';
              return (
                <React.Fragment key={opt.value}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: `${indentPx}px`,
                      minWidth: 0,
                    }}
                  >
                    {esJerarquico && !esOpcionNeutra && (
                      tieneHijos ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandidos((prev) => ({ ...prev, [opt.value]: !prev[opt.value] }));
                          }}
                          title={estaExpandido ? 'Contraer subáreas' : 'Desplegar subáreas'}
                          style={{
                            width: '24px',
                            height: '24px',
                            flexShrink: 0,
                            border: 'none',
                            background: 'transparent',
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            marginRight: '2px',
                          }}
                        >
                          <ChevronRight
                            size={14}
                            style={{
                              transform: estaExpandido ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.15s ease',
                            }}
                          />
                        </button>
                      ) : (
                        <span style={{ width: '26px', flexShrink: 0 }} />
                      )
                    )}
                    <button
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                      title={opt.badge ? `${opt.badge} · ${opt.label}` : opt.label}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '8px 10px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: active ? '#eff6ff' : (highlighted ? '#f8fafc' : 'transparent'),
                        color: active ? '#1d4ed8' : '#334155',
                        fontSize: '13.5px',
                        lineHeight: 1.35,
                        fontWeight: active ? 600 : (nivel === 1 && esJerarquico && !esOpcionNeutra ? 600 : 400),
                        cursor: 'pointer',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={() => setHighlightedIdx(idx)}
                    >
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.label}</span>
                          {opt.badge && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: active ? '#1d4ed8' : '#0369a1',
                                background: active ? '#dbeafe' : '#e0f2fe',
                                borderRadius: '5px',
                                padding: '2px 7px',
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </span>
                        {opt.description && (
                          <span style={{ fontSize: '11.5px', fontWeight: 400, color: '#64748b', whiteSpace: 'normal', lineHeight: 1.35 }}>
                            {opt.description}
                          </span>
                        )}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {opt.infoTooltip && (
                          <span
                            title={opt.infoTooltip}
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'inline-flex', alignItems: 'center', color: '#64748b', cursor: 'help' }}
                          >
                            <Info size={13} />
                          </span>
                        )}
                        {active && <Check size={14} style={{ flexShrink: 0 }} />}
                      </span>
                    </button>
                  </div>
                  {esOpcionNeutra && (
                    <div
                      style={{
                        margin: '4px 6px 2px',
                        paddingTop: '6px',
                        borderTop: '1px solid #f1f5f9',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                      }}
                    >
                      Estructura organizacional
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {esJerarquico && (
            <div
              onMouseDown={iniciarRedimension}
              title="Arrastrar para ajustar ancho del desplegable"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '8px',
                cursor: 'ew-resize',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SelectEstilizado;
