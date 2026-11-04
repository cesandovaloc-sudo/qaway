import React, { useState } from 'react';
import { X, Check, Eye, EyeOff, BookmarkPlus, SlidersHorizontal } from 'lucide-react';

interface EquipoColumnasModalProps {
  isOpen: boolean;
  onClose: () => void;
  allColumns: { id: string; label: string }[];
  visibleColumns: string[];
  onToggleColumn: (colId: string) => void;
  onSavePreset?: (nombre: string) => void;
}

export default function EquipoColumnasModal({
  isOpen,
  onClose,
  allColumns,
  visibleColumns,
  onToggleColumn,
  onSavePreset,
}: EquipoColumnasModalProps) {
  const [nuevoPresetNombre, setNuevoPresetNombre] = useState('');
  const [mostrarGuardar, setMostrarGuardar] = useState(false);

  if (!isOpen) return null;

  const handleGuardarPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPresetNombre.trim() || !onSavePreset) return;
    onSavePreset(nuevoPresetNombre.trim());
    setNuevoPresetNombre('');
    setMostrarGuardar(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '420px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInPop 0.2s ease-out',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SlidersHorizontal size={18} color="#0284c7" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              Personalizar Columnas del Directorio
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Lista de Columnas */}
        <div style={{ padding: '16px 20px', maxHeight: '320px', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#64748b' }}>
            Selecciona las columnas que deseas mostrar u ocultar en la tabla maestra:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {allColumns.map((col) => {
              const isVisible = visibleColumns.includes(col.id);
              const isCore = col.id === 'integrante';
              return (
                <div
                  key={col.id}
                  onClick={() => {
                    if (!isCore) onToggleColumn(col.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isVisible ? '#f0f9ff' : '#f8fafc',
                    border: isVisible ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                    cursor: isCore ? 'not-allowed' : 'pointer',
                    opacity: isCore ? 0.8 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isVisible ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        background: isVisible ? '#0284c7' : '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#ffffff',
                      }}
                    >
                      {isVisible && <Check size={12} strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: isVisible ? 600 : 500, color: '#1e293b' }}>
                      {col.label}
                    </span>
                  </div>

                  {isVisible ? (
                    <Eye size={15} color="#0284c7" />
                  ) : (
                    <EyeOff size={15} color="#94a3b8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Guardar Preset */}
        {onSavePreset && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {!mostrarGuardar ? (
              <button
                onClick={() => setMostrarGuardar(true)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#ffffff',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <BookmarkPlus size={14} />
                Guardar esta combinación como nueva vista
              </button>
            ) : (
              <form onSubmit={handleGuardarPreset} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Nombre de la vista..."
                  autoFocus
                  value={nuevoPresetNombre}
                  onChange={(e) => setNuevoPresetNombre(e.target.value)}
                  style={{
                    flex: 1,
                    height: '32px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '0 10px',
                    fontSize: '12px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 650,
                    cursor: 'pointer',
                  }}
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarGuardar(false)}
                  style={{
                    height: '32px',
                    padding: '0 10px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        )}

        {/* Pie */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#ffffff',
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: '34px',
              padding: '0 18px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Aplicar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
