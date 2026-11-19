import React, { useState, useEffect, useMemo } from 'react';
import { Building2, CheckCircle2, Globe2, Layers, MapPin, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { construirBorradoresPlantilla, type PlantillaSector } from '../../services/organizacionPlantillas';
import { crearEstructuraDesdePlantilla } from '../../services/organizacionEscritura';

interface SedeRow {
  id: string;
  nombre: string;
  tipo_codigo: string | null;
  es_principal: boolean;
  departamento: string | null;
}

interface UnidadRow {
  id: string;
  codigo_jerarquico: string | null;
  nombre_estandar: string;
  alias: string | null;
  nivel: number;
}

export const OrganizacionTab: React.FC = () => {
  const [sector, setSector] = useState<PlantillaSector>('publico');
  const [unidades, setUnidades] = useState<UnidadRow[]>([]);
  const [sedes, setSedes] = useState<SedeRow[]>([]);
  const [vinculosCount, setVinculosCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Formulario rápido para Sede Central
  const [sedeCentralNombre, setSedeCentralNombre] = useState('Sede Central Lima');
  const [sedeCentralDepto, setSedeCentralDepto] = useState('Lima');

  const plantillaPreview = useMemo(() => construirBorradoresPlantilla(sector), [sector]);
  const sedePrincipal = useMemo(() => sedes.find((s) => s.es_principal), [sedes]);

  const cargarEstado = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [uRes, sRes, vRes] = await Promise.all([
        supabase
          .from('gp_unidades_organizacionales')
          .select('id, codigo_jerarquico, nombre_estandar, alias, nivel')
          .order('codigo_jerarquico', { ascending: true })
          .limit(200),
        supabase
          .from('gp_sedes')
          .select('id, nombre, tipo_codigo, es_principal, departamento')
          .order('es_principal', { ascending: false })
          .limit(300),
        supabase.from('gp_sede_unidades_r').select('id', { count: 'exact', head: true }),
      ]);

      if (!uRes.error && Array.isArray(uRes.data)) setUnidades(uRes.data as UnidadRow[]);
      if (!sRes.error && Array.isArray(sRes.data)) setSedes(sRes.data as SedeRow[]);
      if (!vRes.error && typeof vRes.count === 'number') setVinculosCount(vRes.count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEstado();
  }, []);

  const handlePrecargarPlantilla = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await crearEstructuraDesdePlantilla(sector);
      if (res && (res as any).ok === false) {
        setFeedback({ type: 'err', text: (res as any).error || 'No se pudo precargar la plantilla.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `Estructura "${sector === 'publico' ? 'Pública' : 'Privada'}" aplicada correctamente.`,
        });
        await cargarEstado();
      }
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Error al aplicar la plantilla.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCrearSedeCentral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !sedeCentralNombre.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.from('gp_sedes').insert({
        nombre: sedeCentralNombre.trim(),
        tipo_codigo: 'sede_principal',
        es_principal: true,
        departamento: sedeCentralDepto.trim() || 'Lima',
        activo: true,
      });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setFeedback({ type: 'ok', text: 'Sede Central registrada en gp_sedes (es_principal = true).' });
        await cargarEstado();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cards-grid">
      {feedback && (
        <div
          className="cfg-card"
          style={{
            gridColumn: '1 / -1',
            borderColor: feedback.type === 'ok' ? '#10b981' : '#ef4444',
            background: feedback.type === 'ok' ? '#ecfdf5' : '#fef2f2',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 size={18} color="#059669" />
          ) : (
            <ShieldAlert size={18} color="#dc2626" />
          )}
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{feedback.text}</span>
        </div>
      )}

      {/* Bloque 1: Tipo de Organización y Estructura */}
      <div className="cfg-card">
        <div className="card-header">
          <div className="card-icon">
            <Building2 size={18} />
          </div>
          <div>
            <h2>Tipo de Organización y Estructura</h2>
            <p>Define si la institución es Pública o Privada para precargar el árbol de unidades.</p>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className={`tab-item ${sector === 'publico' ? 'active' : ''}`}
              onClick={() => setSector('publico')}
              style={{ flex: 1, justifyContent: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <Globe2 size={15} />
              <span>Sector Público</span>
            </button>
            <button
              type="button"
              className={`tab-item ${sector === 'privado' ? 'active' : ''}`}
              onClick={() => setSector('privado')}
              style={{ flex: 1, justifyContent: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
            >
              <Building2 size={15} />
              <span>Sector Privado</span>
            </button>
          </div>

          <div style={{ fontSize: '13.5px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Unidades activas en BD:</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{loading ? 'Cargando...' : unidades.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Nodos en plantilla ({sector}):</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{plantillaPreview.length}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-save"
            disabled={saving}
            onClick={handlePrecargarPlantilla}
            style={{ alignSelf: 'flex-start' }}
          >
            <RefreshCw size={15} />
            <span>{unidades.length > 0 ? 'Re-sincronizar Plantilla' : 'Precargar Estructura Base'}</span>
          </button>
        </div>
      </div>

      {/* Bloque 2: Sede Central y Sedes */}
      <div className="cfg-card">
        <div className="card-header">
          <div className="card-icon">
            <MapPin size={18} />
          </div>
          <div>
            <h2>Sede Central y Sedes Operativas</h2>
            <p>Registra la Sede Principal (es_principal = true) y supervisa las sedes cargadas en gp_sedes.</p>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '13.5px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Sedes registradas (gp_sedes):</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{loading ? 'Cargando...' : sedes.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Sede Principal:</span>{' '}
              {sedePrincipal ? (
                <span style={{ color: '#059669', fontWeight: 500 }}>{sedePrincipal.nombre}</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 500 }}>No registrada aún</span>
              )}
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Vínculos Sede ↔ Unidad (gp_sede_unidades_r):</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{vinculosCount}</span>
            </div>
          </div>

          {!sedePrincipal && (
            <form onSubmit={handleCrearSedeCentral} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Registrar Sede Central
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={sedeCentralNombre}
                  onChange={(e) => setSedeCentralNombre(e.target.value)}
                  placeholder="Nombre de la Sede Central"
                  style={{ flex: 2, minWidth: '180px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <input
                  type="text"
                  value={sedeCentralDepto}
                  onChange={(e) => setSedeCentralDepto(e.target.value)}
                  placeholder="Departamento"
                  style={{ flex: 1, minWidth: '120px', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <button type="submit" className="btn-save" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                <Plus size={15} />
                <span>Crear Sede Central</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bloque 3: Vista rápida de Unidades */}
      <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <div className="card-icon">
            <Layers size={18} />
          </div>
          <div>
            <h2>Árbol de Unidades Organizacionales ({unidades.length})</h2>
            <p>Estructura interna vigente en gp_unidades_organizacionales.</p>
          </div>
        </div>
        <div className="card-body">
          {unidades.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Aún no hay unidades organizacionales cargadas. Usa "Precargar Estructura Base" arriba.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
              {unidades.slice(0, 24).map((u) => (
                <div
                  key={u.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '13.5px',
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>{u.codigo_jerarquico || '—'}</strong>{' '}
                  <span style={{ color: '#334155' }}>{u.alias || u.nombre_estandar}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizacionTab;
