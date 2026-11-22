import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Check, CheckCircle2, Globe2, Layers, MapPin, Pencil, Plus, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { construirBorradoresPlantilla, type PlantillaSector } from '../../services/organizacionPlantillas';
import { crearEstructuraDesdePlantilla } from '../../services/organizacionEscritura';
import SelectEstilizado from './SelectEstilizado';

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

interface ConfigGestionRow {
  id: string;
  unidad_responsable_id: string | null;
  alcance_asignacion_tareas: 'ninguna' | 'autorizadas' | 'todas';
  puede_dar_seguimiento: boolean;
  puede_programar_reuniones: boolean;
  puede_gestionar_participantes: boolean;
  puede_solicitar_informacion: boolean;
}

type ModoSedes = '' | 'una' | 'varias' | 'sin_sede';

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
  const [arbolExpandido, setArbolExpandido] = useState<boolean>(false);
  const [editandoSector, setEditandoSector] = useState<boolean>(false);

  const [sedeCentralNombre, setSedeCentralNombre] = useState('Sede Central Lima');
  const [sedeCentralDepto, setSedeCentralDepto] = useState('Lima');

  // Pasos 4 y 5: gobernanza de la gestion de proyectos (tabla ya existente).
  const [configGestion, setConfigGestion] = useState<ConfigGestionRow | null>(null);
  const [unidadResponsableId, setUnidadResponsableId] = useState('');
  const [alcanceAsignacion, setAlcanceAsignacion] = useState<'ninguna' | 'autorizadas' | 'todas'>('ninguna');
  const [puedeDarSeguimiento, setPuedeDarSeguimiento] = useState(true);
  const [puedeProgramarReuniones, setPuedeProgramarReuniones] = useState(true);
  const [puedeGestionarParticipantes, setPuedeGestionarParticipantes] = useState(true);
  const [puedeSolicitarInformacion, setPuedeSolicitarInformacion] = useState(true);
  const [guardandoGestion, setGuardandoGestion] = useState(false);

  // Paso 1: cardinalidad de sedes. La sede central siempre tiene jerarquia
  // propia; "varias" significa que ademas hay sedes externas. No crea columnas.
  const [modoSedes, setModoSedes] = useState<ModoSedes>('');

  // Misma plantilla para la vista previa y para la escritura: asi lo que se
  // muestra coincide exactamente con lo que se guarda.
  const plantillaPreview = useMemo(
    () => construirBorradoresPlantilla(sector, { incluirSedesExternas: modoSedes === 'varias' }),
    [sector, modoSedes],
  );
  const sedePrincipal = useMemo(() => sedes.find((s) => s.es_principal), [sedes]);

  const cargarEstado = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [uRes, sRes, gRes] = await Promise.all([
        supabase
          .from('gp_unidades_organizacionales')
          .select('id, codigo_jerarquico, nombre_estandar, alias, nivel')
          .order('codigo_jerarquico', { ascending: true })
          .limit(200),
        supabase
          .from('gp_sedes')
          .select('id, nombre, tipo_codigo, es_principal, departamento')
          .eq('empresa_id', perfil?.tenantId ?? '')
          .order('es_principal', { ascending: false })
          .limit(300),
        supabase
          .from('gp_config_gestion_proyectos')
          .select('id, unidad_responsable_id, alcance_asignacion_tareas, puede_dar_seguimiento, puede_programar_reuniones, puede_gestionar_participantes, puede_solicitar_informacion')
          .eq('empresa_id', perfil?.tenantId ?? '')
          .maybeSingle(),
      ]);

      if (!uRes.error && Array.isArray(uRes.data) && uRes.data.length > 0) {
        setUnidades(uRes.data as UnidadRow[]);
      } else if (perfil?.tenantId) {
        const gUnits = await supabase
          .from('gestor_unidades')
          .select('id, code, name, parent_unit_id, orden')
          .eq('tenant_id', perfil.tenantId)
          .order('orden', { ascending: true })
          .limit(200);
        if (!gUnits.error && Array.isArray(gUnits.data)) {
          setUnidades(
            gUnits.data.map((u: any) => ({
              id: u.id,
              codigo_jerarquico: u.code || null,
              nombre_estandar: u.name,
              alias: null,
              nivel: u.parent_unit_id ? 2 : 1,
            }))
          );
        }
      }
      if (!sRes.error && Array.isArray(sRes.data)) {
        const filas = sRes.data as SedeRow[];
        setSedes(filas);
        setModoSedes((prev) => prev || (filas.length === 0 ? '' : filas.length === 1 ? 'una' : 'varias'));
      }
      if (!gRes.error && gRes.data) {
        const g = gRes.data as ConfigGestionRow;
        setConfigGestion(g);
        setUnidadResponsableId(g.unidad_responsable_id || '');
        setAlcanceAsignacion(g.alcance_asignacion_tareas || 'ninguna');
        setPuedeDarSeguimiento(g.puede_dar_seguimiento !== false);
        setPuedeProgramarReuniones(g.puede_programar_reuniones !== false);
        setPuedeGestionarParticipantes(g.puede_gestionar_participantes !== false);
        setPuedeSolicitarInformacion(g.puede_solicitar_informacion !== false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEstado();
  }, [perfil?.tenantId]);

  const handlePrecargarPlantilla = async () => {
    if (!perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    if (modoSedes === '') {
      setFeedback({ type: 'err', text: 'Responde primero si tienes una sola sede o varias.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await crearEstructuraDesdePlantilla({
        origen: sector,
        tenantId: perfil.tenantId,
        borradoresPersonalizados: plantillaPreview,
      });
      if (res && (res as any).ok === false) {
        setFeedback({ type: 'err', text: (res as any).error || 'No se pudo aplicar la estructura inicial.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `Estructura de ${sector === 'publico' ? 'Sector Público' : 'Sector Privado'} para ${modoSedes === 'una' ? 'una sola sede' : 'sede central con sedes externas'} creada correctamente.`,
        });
        setEditandoSector(false);
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

  const handleGuardarGestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    if (!unidadResponsableId) {
      setFeedback({ type: 'err', text: 'Selecciona el área encargada de dirigir los proyectos.' });
      return;
    }
    setGuardandoGestion(true);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('gp_config_gestion_proyectos')
        .upsert({
          empresa_id: perfil.tenantId,
          unidad_responsable_id: unidadResponsableId,
          alcance_asignacion_tareas: alcanceAsignacion,
          puede_dar_seguimiento: puedeDarSeguimiento,
          puede_programar_reuniones: puedeProgramarReuniones,
          puede_gestionar_participantes: puedeGestionarParticipantes,
          puede_solicitar_informacion: puedeSolicitarInformacion,
          activo: true,
        }, { onConflict: 'empresa_id' });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setFeedback({ type: 'ok', text: 'Área encargada y facultades guardadas.' });
        setEditandoSector(false);
        await cargarEstado();
      }
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'No se pudo guardar la configuración de gestión.' });
    } finally {
      setGuardandoGestion(false);
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
        empresa_id: perfil.tenantId,
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
        setEditandoSector(false);
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

      {/* Bloque 1: Paso 1: sede central con jerarquia propia + sedes externas */}
      <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <div className="card-icon">
            <MapPin size={18} />
          </div>
          <div>
            <h2>Paso 1 · Alcance de Sedes</h2>
            <p>Define si tu organización opera únicamente desde su sede principal o también con sedes externas.</p>
          </div>
        </div>

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Modalidad operativa de sedes</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {([
                { value: 'una' as ModoSedes, label: 'Solo la sede central' },
                { value: 'varias' as ModoSedes, label: 'Sede central + sedes externas' },
                { value: 'sin_sede' as ModoSedes, label: 'Sin sede física' },
              ]).map((op) => (
                <button
                  key={op.value}
                  type="button"
                  className={`tab-item ${modoSedes === op.value ? 'active' : ''}`}
                  onClick={() => setModoSedes(op.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {modoSedes === 'una' && (
            <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
              Operación centralizada: la estructura se configurará únicamente con las áreas de tu sede principal.
            </div>
          )}

          {modoSedes === 'varias' && (
            <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
              Varias sedes: la plantilla incluye la sede central y las sedes externas que correspondan a tu sector.
            </div>
          )}

          {modoSedes === 'sin_sede' && (
            <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
              Sin sede física: tu organización puede operar con una modalidad operativa sin sede asignada. No es necesario registrar una sede.
            </div>
          )}

          <div style={{ fontSize: '13.5px', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Sedes registradas:</span>{' '}
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{loading ? 'Cargando...' : sedes.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Sede Central:</span>{' '}
              {sedePrincipal ? (
                <span style={{ color: '#059669', fontWeight: 500 }}>{sedePrincipal.nombre}</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 500 }}>Pendiente de registrar</span>
              )}
            </div>
          </div>

          {!sedePrincipal && modoSedes !== '' && modoSedes !== 'sin_sede' && (
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

      {/* Bloque 2: Paso 2: sector público / privado */}
      {!loading && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon">
              <Building2 size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h2>Paso 2 · Sector Institucional</h2>
              <p>Selecciona el sector de la institución para previsualizar su estructura base.</p>
            </div>
            {unidades.length > 0 && (
              <button
                type="button"
                onClick={() => setEditandoSector((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {editandoSector ? <X size={13} /> : <Pencil size={13} />}
                <span>{editandoSector ? 'Cancelar' : 'Editar'}</span>
              </button>
            )}
          </div>

          {unidades.length > 0 && !editandoSector ? (
            <div className="card-body">
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Sector configurado: </span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>
                    {sector === 'publico' ? 'Sector Público' : 'Sector Privado'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: 500 }}>Guardado</span>
              </div>
            </div>
          ) : (
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(() => {
                const nodosOrdenados: Array<{ key: string; name: string; nivel: number; codigo: string }> = [];
                const visitar = (parentKey: string | null, prefijo: string, nivel: number) => {
                  const hijos = plantillaPreview.filter((n) => n.parentKey === parentKey);
                  hijos.forEach((h, i) => {
                    const codigo = prefijo ? `${prefijo}.${i + 1}` : `${i + 1}`;
                    nodosOrdenados.push({ key: h.key, name: h.name, nivel, codigo });
                    visitar(h.key, codigo, nivel + 1);
                  });
                };
                visitar(null, '', 1);
                return nodosOrdenados.map((nodo) => (
                  <div
                    key={nodo.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      paddingLeft: `${12 + Math.max(0, (nodo.nivel - 1) * 18)}px`,
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: '13.5px',
                    }}
                  >
                    <span style={{ color: '#64748b', fontWeight: 500, flexShrink: 0 }}>{nodo.codigo}</span>
                    <span style={{ color: '#0f172a', fontWeight: nodo.nivel === 1 ? 600 : 400 }}>{nodo.name}</span>
                  </div>
                ));
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
          )}
        </div>
      )}

      {/* Bloque 3: Estructura ya configurada (con edición de alias) */}
      {unidades.length > 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon">
              <Layers size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h2>Paso 3 · Estructura Organizacional ({unidades.length} áreas)</h2>
              <p>Personaliza la denominación (alias) de cada área según la estructura interna de tu institución.</p>
            </div>
            <button
              type="button"
              onClick={() => setArbolExpandido((v) => !v)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {arbolExpandido ? 'Ocultar áreas' : 'Ver áreas'}
            </button>
          </div>
          {arbolExpandido && (
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
          )}
        </div>
      )}

      {/* Bloque 4: Pasos 4 y 5: gobernanza de la gestion de proyectos */}
      {unidades.length > 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2>Paso 4 · Unidad Responsable de Proyectos</h2>
              <p>Selecciona el área responsable de liderar la gestión de proyectos en tu organización.</p>
            </div>
          </div>

          <form onSubmit={handleGuardarGestion} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              Unidad responsable
              <SelectEstilizado
                value={unidadResponsableId}
                placeholder="Selecciona un área"
                options={unidades.map((u) => ({
                  value: u.id,
                  label: `${u.codigo_jerarquico ? `${u.codigo_jerarquico} · ` : ''}${u.alias || u.nombre_estandar}`,
                }))}
                onChange={(val) => setUnidadResponsableId(val)}
              />
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Paso 5 · Gobernanza y Asignación de Tareas</span>
              <label style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                Alcance de asignación de tareas a otras dependencias o sedes
                <SelectEstilizado
                  value={alcanceAsignacion}
                  options={[
                    { value: 'ninguna', label: 'No asignar tareas a otras sedes ni dependencias' },
                    { value: 'autorizadas', label: 'Solo a sedes y dependencias autorizadas' },
                    { value: 'todas', label: 'A todas las sedes y dependencias' },
                  ]}
                  onChange={(val) => setAlcanceAsignacion(val as 'ninguna' | 'autorizadas' | 'todas')}
                />
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#475569' }}>
                <label><input type="checkbox" checked={puedeDarSeguimiento} onChange={(e) => setPuedeDarSeguimiento(e.target.checked)} /> Dar seguimiento</label>
                <label><input type="checkbox" checked={puedeProgramarReuniones} onChange={(e) => setPuedeProgramarReuniones(e.target.checked)} /> Programar reuniones</label>
                <label><input type="checkbox" checked={puedeGestionarParticipantes} onChange={(e) => setPuedeGestionarParticipantes(e.target.checked)} /> Gestionar participantes</label>
                <label><input type="checkbox" checked={puedeSolicitarInformacion} onChange={(e) => setPuedeSolicitarInformacion(e.target.checked)} /> Solicitar información</label>
              </div>
            </div>

            <button type="submit" className="btn-save" disabled={guardandoGestion} style={{ alignSelf: 'flex-start' }}>
              <Check size={15} />
              <span>{guardandoGestion ? 'Guardando...' : configGestion ? 'Actualizar gobernanza' : 'Guardar gobernanza'}</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default OrganizacionTab;
