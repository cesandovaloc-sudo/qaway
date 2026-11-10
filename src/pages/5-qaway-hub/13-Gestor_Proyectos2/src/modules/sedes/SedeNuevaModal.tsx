import React, { useState, useMemo } from 'react';
import { X, Building2, Building, ShieldCheck, MapPin, User, Check, Layers } from 'lucide-react';
import { createGestorUnit, type GestorUnit, type GestorUnitType } from '../../services/gestorOrganizacionService';

interface SedeNuevaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (nueva: GestorUnit) => void;
  unidadesExistentes?: Array<{ id?: string; name: string; region?: string; unitType?: string }>;
}

const REGIONES_PERU = [
  'AMAZONAS', 'ANCASH', 'APURÍMAC', 'AREQUIPA', 'AYACUCHO',
  'CAJAMARCA', 'CALLAO', 'CUSCO', 'HUANCAVELICA', 'HUÁNUCO',
  'ICA', 'JUNÍN', 'LA LIBERTAD', 'LAMBAYEQUE', 'LIMA METROPOLITANA',
  'LIMA PROVINCIAS', 'LORETO', 'MADRE DE DIOS', 'MOQUEGUA', 'PASCO',
  'PIURA', 'PUNO', 'SAN MARTÍN', 'TACNA', 'TUMBES', 'UCAYALI'
];

function resolveMacroregion(reg: string): 'norte' | 'centro' | 'sur' {
  const r = reg.toUpperCase();
  if (['TUMBES', 'PIURA', 'LAMBAYEQUE', 'LA LIBERTAD', 'CAJAMARCA', 'AMAZONAS', 'SAN MARTÍN', 'LORETO'].includes(r)) {
    return 'norte';
  }
  if (['ANCASH', 'LIMA METROPOLITANA', 'LIMA PROVINCIAS', 'CALLAO', 'ICA', 'HUÁNUCO', 'PASCO', 'JUNÍN', 'HUANCAVELICA', 'AYACUCHO', 'UCAYALI'].includes(r)) {
    return 'centro';
  }
  return 'sur';
}

export default function SedeNuevaModal({
  isOpen,
  onClose,
  onSave,
  unidadesExistentes = [],
}: SedeNuevaModalProps) {
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [unitType, setUnitType] = useState<GestorUnitType>('dre');
  const [parentUnitId, setParentUnitId] = useState<string>('');
  const [region, setRegion] = useState('JUNÍN');
  const [responsable, setResponsable] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Lista de sedes superiores elegibles (matrices regionales o sedes centrales)
  const sedesSuperiores = useMemo(() => {
    return unidadesExistentes.filter((u) => u.unitType === 'central' || u.unitType === 'dre' || !u.unitType);
  }, [unidadesExistentes]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSaving(true);
    const macro = resolveMacroregion(region);
    const generatedCode = (codigo.trim() || `${unitType.toUpperCase()}-${nombre.trim().replace(/\s+/g, '-').toUpperCase()}`).slice(0, 30);

    const payload: Partial<GestorUnit> = {
      name: nombre.trim(),
      code: generatedCode,
      unitType: unitType,
      parentUnitId: parentUnitId ? parentUnitId : null,
      region: region,
      macroregion: macro,
      address: direccion.trim() || null,
      status: 'active',
      gestor: responsable.trim() || undefined,
      progress: 0,
      complianceStatus: 'En proceso',
      metadata: {
        responsable: responsable.trim() || null,
        created_via: 'SedeNuevaModal',
        tipo_oficial: unitType === 'central' ? 'Sede Central Matriz' : unitType === 'dre' ? 'Sede Regional / DRE' : 'Unidad Operativa / UGEL',
      },
    };

    try {
      const saved = await createGestorUnit(payload);
      if (onSave) onSave(saved);
      onClose();
    } catch (err) {
      console.error('Error al guardar nueva sede:', err);
      // Fallback local
      if (onSave) {
        onSave({
          id: `unit-local-${Date.now()}`,
          tenantId: null,
          parentUnitId: parentUnitId || null,
          name: nombre.trim(),
          code: generatedCode,
          unitType: unitType,
          region: region,
          macroregion: macro,
          address: direccion.trim() || null,
          status: 'active',
          gestor: responsable.trim() || undefined,
          progress: 0,
          complianceStatus: 'En proceso',
          metadata: {},
        });
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInPop 0.2s ease-out',
        }}
      >
        {/* Cabecera Institucional Slate/Navy */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1e40af',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Building2 size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#0f172a' }}>
                Registrar Nueva Sede / Unidad Territorial
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                Configuración de entidad, matriz regional o frente de intervención territorial.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Nivel / Tipo de Sede */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Tipo de Sede / Nivel Jerárquico *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setUnitType('dre')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: unitType === 'dre' ? '#1e40af' : '#e2e8f0',
                  background: unitType === 'dre' ? '#eff6ff' : '#ffffff',
                  color: unitType === 'dre' ? '#1e40af' : '#475569',
                  fontWeight: 650,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Building2 size={15} color={unitType === 'dre' ? '#1e40af' : '#64748b'} />
                <span>Sede Regional (DRE)</span>
              </button>

              <button
                type="button"
                onClick={() => setUnitType('ugel')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: unitType === 'ugel' ? '#0284c7' : '#e2e8f0',
                  background: unitType === 'ugel' ? '#f0f9ff' : '#ffffff',
                  color: unitType === 'ugel' ? '#0284c7' : '#475569',
                  fontWeight: 650,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Building size={15} color={unitType === 'ugel' ? '#0284c7' : '#64748b'} />
                <span>Mini-sede (UGEL / Local)</span>
              </button>

              <button
                type="button"
                onClick={() => setUnitType('central')}
                style={{
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid',
                  borderColor: unitType === 'central' ? '#0f172a' : '#e2e8f0',
                  background: unitType === 'central' ? '#f1f5f9' : '#ffffff',
                  color: unitType === 'central' ? '#0f172a' : '#475569',
                  fontWeight: 650,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Layers size={15} color={unitType === 'central' ? '#0f172a' : '#64748b'} />
                <span>Sede Central Matriz</span>
              </button>
            </div>
          </div>

          {/* Nombre de la Sede */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Nombre oficial de la sede / entidad *
            </label>
            <input
              required
              type="text"
              placeholder={unitType === 'dre' ? 'Ej. DRE Junín (Sede Regional Matriz)' : unitType === 'central' ? 'Ej. Sede Central MINEDU' : 'Ej. UGEL Satipo'}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Región y Dependencia Superior */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Región / Ámbito *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 10px',
                  fontSize: '12.5px',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                }}
              >
                {REGIONES_PERU.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Sede Superior / Depende de
              </label>
              <select
                value={parentUnitId}
                onChange={(e) => setParentUnitId(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 10px',
                  fontSize: '12.5px',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                }}
              >
                <option value="">(Ninguna / Es Sede Matriz)</option>
                {sedesSuperiores.map((s, idx) => (
                  <option key={s.id || idx} value={s.id || s.name}>
                    {s.name} ({s.region || 'Nacional'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Responsable y Código */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Responsable / Gestor Territorial
              </label>
              <input
                type="text"
                placeholder="Ej. Javier Ruiz o Gestor Territorial"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Código / Sigla identificadora
              </label>
              <input
                type="text"
                placeholder="Ej. DRE-JUN / UGEL-SAT"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Dirección o Ubicación */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Dirección o Referencia Territorial (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Av. Ferrocarril 1234, El Tambo, Huancayo"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0 12px',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Footer de Acciones */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '14px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                padding: '8px 16px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !nombre.trim()}
              style={{
                padding: '8px 20px',
                borderRadius: '7px',
                border: 'none',
                background: isSaving || !nombre.trim() ? '#94a3b8' : '#1e40af',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 650,
                cursor: isSaving || !nombre.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(30, 64, 175, 0.25)',
              }}
            >
              <Check size={15} />
              <span>{isSaving ? 'Guardando en Supabase...' : 'Guardar Sede'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
