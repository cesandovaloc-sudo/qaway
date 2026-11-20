import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Check, CheckCircle2, Globe2, Layers, MapPin, Pencil, Plus, ShieldAlert, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
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
  const { perfil } = usePerfilGp();
  const [sector, setSector] = useState<PlantillaSector>('publico');
  const [unidades, setUnidades] = useState<UnidadRow[]>([]);
  const [sedes, setSedes] = useState<SedeRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasDraft, setAliasDraft] = useState<string>('');

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
      const [uRes, sRes] = await Promise.all([
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
      ]);

      if (!uRes.error && Array.isArray(uRes.data)) setUnidades(uRes.data as UnidadRow[]);
      if (!sRes.error && Array.isArray(sRes.data)) setSedes(sRes.data as SedeRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEstado();
  }, []);

  const handlePrecargarPlantilla = async () => {
    if (!perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await crearEstructuraDesdePlantilla({
        origen: sector,
        tenantId: perfil.tenantId,
      });
      if (res && (res as any).ok === false) {
        setFeedback({ type: 'err', text: (res as any).error || 'No se pudo aplicar la estructura inicial.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `Estructura de ${sector === 'publico' ? 'Sector Público' : 'Sector Privado'} creada correctamente.`,
        });
        await cargarEstado();
      }
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Error al aplicar la estructura.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarAlias = async (unidadId: string) => {
    if (!supabase) return;
    setSaving(true);
    try {
      const nuevoAlias = aliasDraft.trim() || null;
      const { error } = await supabase
        .from('gp_unidades_organizacionales')
        .update({ alias: nuevoAlias })
        .eq('id', unidadId);
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setUnidades((prev) => prev.map((u) => (u.id === unidadId ? { ...u, alias: nuevoAlias } : u)));
        setEditingId(null);
        setFeedback({ type: 'ok', text: 'Nombre del área actualizado.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCrearSedeCentral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !sedeCentralNombre.trim()) return;
    if (!perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.from('gp_sedes').insert({
        tenant_id: perfil.tenantId,
        nombre: sedeCentralNombre.trim(),
        tipo_codigo: 'sede_principal',
        es_principal: true,
        departamento: sedeCentralDepto.trim() || 'Lima',
        activo: true,
      });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setFeedback({ type: 'ok', text: 'Sede Central registrada correctamente.' });
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
          <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Cerrar alerta"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Bloque 1: Solo para tenants nuevos sin estructura */}
      {!loading && unidades.length === 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon">
              <Building2 size={18} />
            </div>
            <div>
              <h2>Elige tu Estructura Inicial</h2>
              <p>Selecciona el tipo de institución para ver cómo organizaremos tus áreas (luego podrás renombrar cada una).</p>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', overflowX: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '14px' }}>
                Vista previa tipo organigrama ({sector === 'publico' ? 'Sector Público' : 'Sector Privado'}):
              </div>
              {(() => {
                const raices = plantillaPreview.filter((n) => !n.parentKey);
                const hijosDe = (key: string) => plantillaPreview.filter((n) => n.parentKey === key);
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    {raices.map((raiz) => {
                      const nivel2 = hijosDe(raiz.key);
                      return (
                        <div key={raiz.key} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ padding: '10px 18px', borderRadius: '10px', background: '#0f172a', color: '#ffffff', fontSize: '13.5px', fontWeight: 600, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)', textAlign: 'center' }}>
                            {raiz.name}
                          </div>
                          {nivel2.length > 0 && (
                            <>
                              <div style={{ width: '2px', height: '16px', background: '#cbd5e1' }} />
                              <div style={{ width: '100%', borderTop: '2px solid #cbd5e1', paddingTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px' }}>
                                {nivel2.map((n2) => {
                                  const nivel3 = hijosDe(n2.key);
                                  return (
                                    <div key={n2.key} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '10px', padding: '10px 12px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{n2.name}</div>
                                      {nivel3.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid #e2e8f0', marginTop: '2px' }}>
                                          {nivel3.map((n3) => (
                                            <div key={n3.key} style={{ fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px' }}>
                                              {n3.name}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <button
              type="button"
              className="btn-save"
              disabled={saving}
              onClick={handlePrecargarPlantilla}
              style={{ alignSelf: 'flex-start' }}
            >
              <Check size={15} />
              <span>{saving ? 'Aplicando...' : 'Aplicar esta estructura inicial'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bloque 2: Estructura ya configurada (con edición de alias) */}
      {unidades.length > 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon">
              <Layers size={18} />
            </div>
            <div>
              <h2>Estructura Organizacional ({unidades.length} áreas)</h2>
              <p>Haz clic en el lápiz para personalizar el nombre (alias) de cualquier área según tu institución.</p>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {unidades.map((u) => {
              const isEditing = editingId === u.id;
              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '8px 12px',
                    paddingLeft: `${12 + Math.max(0, (u.nivel - 1) * 18)}px`,
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '13.5px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <span style={{ color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{u.codigo_jerarquico || '—'}</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={aliasDraft}
                        onChange={(e) => setAliasDraft(e.target.value)}
                        placeholder={u.nombre_estandar}
                        autoFocus
                        style={{ flex: 1, padding: '5px 8px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '13.5px' }}
                      />
                    ) : (
                      <span style={{ color: '#0f172a', fontWeight: u.nivel === 1 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.alias || u.nombre_estandar}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleGuardarAlias(u.id)}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(u.id);
                          setAliasDraft(u.alias || u.nombre_estandar);
                        }}
                        title="Personalizar nombre"
                        style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex' }}
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bloque 3: Sede Central y Sedes */}
      <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <div className="card-icon">
            <MapPin size={18} />
          </div>
          <div>
            <h2>Sede Central y Sedes Operativas</h2>
            <p>Administra la sede principal de tu organización y el total de sedes activas.</p>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '13.5px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Sedes registradas:</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{loading ? 'Cargando...' : sedes.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Sede Principal:</span>{' '}
              {sedePrincipal ? (
                <span style={{ color: '#059669', fontWeight: 500 }}>{sedePrincipal.nombre}</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 500 }}>Pendiente de registrar</span>
              )}
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
    </div>
  );
};

export default OrganizacionTab;
