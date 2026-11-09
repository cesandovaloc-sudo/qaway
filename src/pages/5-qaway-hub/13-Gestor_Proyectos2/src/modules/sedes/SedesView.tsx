import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Search,
  Download,
  PanelRightOpen,
  X,
  CheckCircle2,
  LayoutGrid,
  List,
  Map,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';
import {
  ProjectShellHeader,
  ProjectShellWorkspace,
  ProjectShellTabs,
  ProjectShellFilters,
} from '../../shared/project-shell';
import {
  fetchEquipoSedesFromSupabase,
  fetchIntegrantesPorSede,
} from '../../services/gestorEquipoService';
import type { SedeFrente, Integrante } from '../equipo/types';
import MapaTerritorialView from './MapaTerritorialView';
import '../cronograma-gantt/gantt.css';
import './sedes.css';

export interface SedesViewProps {
  activeProject?: any;
  activeProjectId?: string;
  onActions?: (h: { notify: (m: string) => void }) => void;
  isActive?: boolean;
}

export default function SedesView({
  activeProject,
  onActions,
  isActive = true,
}: SedesViewProps) {
  const [sedes, setSedes] = useState<SedeFrente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [tab, setTab] = useState<'todas' | 'dre' | 'ugel' | 'junin'>('todas');
  const [regionFilter, setRegionFilter] = useState<string>('todas');
  const [tipoFilter, setTipoFilter] = useState<'todos' | 'dre' | 'ugel'>('todos');
  const [viewMode, setViewMode] = useState<'directorio' | 'tarjetas' | 'mapa'>('directorio');
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [comiteIntegrantes, setComiteIntegrantes] = useState<Integrante[]>([]);
  const [loadingComite, setLoadingComite] = useState<boolean>(false);

  const notify = useCallback(
    (msg: string) => {
      if (onActions) {
        onActions({ notify: () => {} });
      }
    },
    [onActions]
  );

  // Carga reactiva y desvinculada de sedes desde Supabase (Fase E)
  useEffect(() => {
    if (!isActive) return;
    let isMounted = true;
    setLoading(true);

    fetchEquipoSedesFromSupabase()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setSedes(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[SedesView] Error cargando sedes territoriales:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isActive]);

  // Carga de integrantes del comité al seleccionar una sede en el drawer
  const selectedSede = useMemo(() => {
    if (!selectedSedeId) return null;
    return sedes.find((s) => s.id === selectedSedeId) || null;
  }, [selectedSedeId, sedes]);

  useEffect(() => {
    if (!selectedSede) {
      setComiteIntegrantes([]);
      return;
    }
    let isMounted = true;
    setLoadingComite(true);

    fetchIntegrantesPorSede(selectedSede.id)
      .then((members) => {
        if (isMounted) {
          setComiteIntegrantes(members);
          setLoadingComite(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingComite(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSede]);

  // Lista de regiones únicas para el selector de filtro
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    sedes.forEach((s) => {
      if (s.region) set.add(s.region);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [sedes]);

  // Conteo de métricas de pestañas
  const tabCounts = useMemo(() => {
    const dre = sedes.filter((s) => s.tipoEntidad === 'dre').length;
    const ugel = sedes.filter((s) => s.tipoEntidad === 'ugel').length;
    const junin = sedes.filter((s) => (s.region || '').toLowerCase().includes('jun')).length;
    return { todas: sedes.length, dre, ugel, junin };
  }, [sedes]);

  // Filtrado de sedes en memoria para respuesta en 0ms
  const filteredSedes = useMemo(() => {
    return sedes.filter((s) => {
      // Filtro pestaña superior
      if (tab === 'dre' && s.tipoEntidad !== 'dre') return false;
      if (tab === 'ugel' && s.tipoEntidad !== 'ugel') return false;
      if (tab === 'junin' && !(s.region || '').toLowerCase().includes('jun')) return false;

      // Filtro por tipo desplegable
      if (tipoFilter === 'dre' && s.tipoEntidad !== 'dre') return false;
      if (tipoFilter === 'ugel' && s.tipoEntidad !== 'ugel') return false;

      // Filtro por región
      if (regionFilter !== 'todas' && s.region !== regionFilter) return false;

      // Filtro por búsqueda de texto
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = s.nombre.toLowerCase().includes(q);
        const matchCode = s.codigo.toLowerCase().includes(q);
        const matchRegion = (s.region || '').toLowerCase().includes(q);
        const matchResp = (s.responsableNombre || '').toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchRegion && !matchResp) return false;
      }

      return true;
    });
  }, [sedes, tab, tipoFilter, regionFilter, search]);

  const handleExportCSV = () => {
    const headers = ['Código', 'Sede / Unidad', 'Tipo', 'Región', 'Ámbito', 'Responsable', 'Dotación Requerida'];
    const rows = filteredSedes.map((s) => [
      s.codigo,
      `"${s.nombre}"`,
      s.tipoEntidad.toUpperCase(),
      `"${s.region || ''}"`,
      `"${s.ambito}"`,
      `"${s.responsableNombre || ''}"`,
      s.dotacionRequerida,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `directorio-sedes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app sedes-app-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* 1. Header Oficial (Fase D / E) */}
      <ProjectShellHeader
        perspective="territorial"
        title={`Sedes · ${activeProject?.name || 'MINEDU · Dotación 2027'}`}
        description="Directorio territorial, seguimiento operativo y cobertura de UGEL y DRE a nivel nacional."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn secondary"
              onClick={handleExportCSV}
              title="Descargar directorio completo en formato CSV / Excel"
            >
              <Download size={14} />
              <span>Exportar Sedes ({filteredSedes.length})</span>
            </button>
          </div>
        }
      />

      {/* 2. Workspace Contenedor con Tabs, Filtros y Tabla */}
      <ProjectShellWorkspace>
        {/* Pestañas Superiores con Switcher de Modos */}
        <ProjectShellTabs
          tabsList={
            <>
              <button
                type="button"
                className={tab === 'todas' ? 'active' : ''}
                onClick={() => setTab('todas')}
              >
                Todas <span>({tabCounts.todas})</span>
              </button>
              <button
                type="button"
                className={tab === 'dre' ? 'active' : ''}
                onClick={() => setTab('dre')}
              >
                DRE <span>({tabCounts.dre})</span>
              </button>
              <button
                type="button"
                className={tab === 'ugel' ? 'active' : ''}
                onClick={() => setTab('ugel')}
              >
                UGEL <span>({tabCounts.ugel})</span>
              </button>
              <button
                type="button"
                className={tab === 'junin' ? 'active' : ''}
                onClick={() => setTab('junin')}
              >
                Junín (Piloto) <span>({tabCounts.junin})</span>
              </button>
            </>
          }
          viewSwitcher={
            <>
              <button
                type="button"
                className={viewMode === 'directorio' ? 'active' : ''}
                onClick={() => setViewMode('directorio')}
                title="Vista de lista y tabla detallada"
              >
                <List size={14} />
                <span>Directorio</span>
              </button>
              <button
                type="button"
                className={viewMode === 'tarjetas' ? 'active' : ''}
                onClick={() => setViewMode('tarjetas')}
                title="Vista de tarjetas territoriales"
              >
                <LayoutGrid size={14} />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                className={viewMode === 'mapa' ? 'active' : ''}
                onClick={() => setViewMode('mapa')}
                title="Vista en mapa de calor geográfico"
              >
                <Map size={14} />
                <span>Mapa</span>
              </button>
            </>
          }
        />

        {/* Filtros Contextuales Estilo Notion / Excel */}
        <ProjectShellFilters>
          <div className="filter-group" style={{ flex: 1, minWidth: 260 }}>
            <div className="search-box" style={{ width: '100%' }}>
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por sede, UGEL, DRE, región o responsable..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearch('')}
                  title="Limpiar búsqueda"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <select
              className="select-filter"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="todas">Todas las regiones ({availableRegions.length})</option>
              {availableRegions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="select-filter"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as any)}
              style={{ minWidth: 140 }}
            >
              <option value="todos">Todos los tipos</option>
              <option value="dre">Solo DRE ({tabCounts.dre})</option>
              <option value="ugel">Solo UGEL ({tabCounts.ugel})</option>
            </select>
          </div>

          {(search || regionFilter !== 'todas' || tipoFilter !== 'todos' || tab !== 'todas') && (
            <button
              type="button"
              className="btn secondary"
              style={{ fontSize: 12, padding: '4px 10px', height: 32 }}
              onClick={() => {
                setSearch('');
                setRegionFilter('todas');
                setTipoFilter('todos');
                setTab('todas');
              }}
            >
              <X size={12} />
              <span>Limpiar filtros</span>
            </button>
          )}
        </ProjectShellFilters>

        {/* Contenido según el modo de vista */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12, color: '#64748b' }}>
              <div className="spinner-border" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Sincronizando sedes territoriales desde Supabase...</span>
            </div>
          ) : viewMode === 'mapa' ? (
            <div style={{ flex: 1, minHeight: 0, padding: 16 }}>
              <MapaTerritorialView />
            </div>
          ) : viewMode === 'tarjetas' ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <div className="sd-grid-container">
                {filteredSedes.map((sede) => (
                  <div
                    key={sede.id}
                    className={`sd-card ${selectedSedeId === sede.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSedeId(sede.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="sd-card-top">
                      <div>
                        <h4 className="sd-card-title">{sede.nombre}</h4>
                        <span className="sd-card-sub">
                          <MapPin size={12} />
                          {sede.region || 'Ámbito Nacional'} · {sede.codigo}
                        </span>
                      </div>
                      <span className={`badge ${sede.tipoEntidad === 'dre' ? 'blue' : 'gray'}`}>
                        {sede.tipoEntidad.toUpperCase()}
                      </span>
                    </div>

                    <div className="sd-team-strip">
                      <div className="sd-team-line" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UserCheck size={14} style={{ color: '#0284c7' }} />
                        <span style={{ fontSize: 12, color: '#334155' }}>
                          <strong>Titular:</strong> {sede.responsableNombre || 'Director designado'}
                        </span>
                      </div>
                      <div className="sd-team-line" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={14} style={{ color: '#64748b' }} />
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          Comité acreditado: <strong>{sede.dotacionRequerida} integrantes</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                      <span className="badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={11} /> En funciones
                      </span>
                      <button
                        type="button"
                        className="btn secondary"
                        style={{ fontSize: 11, padding: '3px 8px', height: 26 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSedeId(sede.id);
                        }}
                      >
                        Ver Comité
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Vista Directorio / Tabla Principal */
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <table className="gantt-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontSize: 12 }}>
                    <th style={{ width: 40, padding: '10px 14px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '10px 14px', minWidth: 260 }}>Sede / Unidad Territorial</th>
                    <th style={{ padding: '10px 14px', width: 90 }}>Tipo</th>
                    <th style={{ padding: '10px 14px', minWidth: 140 }}>Región</th>
                    <th style={{ padding: '10px 14px', minWidth: 200 }}>Responsable / Director</th>
                    <th style={{ padding: '10px 14px', width: 140 }}>Comité Local</th>
                    <th style={{ padding: '10px 14px', width: 120 }}>Estado</th>
                    <th style={{ padding: '10px 14px', width: 110, textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSedes.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                        No se encontraron sedes territoriales con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredSedes.map((sede, idx) => (
                      <tr
                        key={sede.id}
                        onClick={() => setSelectedSedeId(sede.id)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: selectedSedeId === sede.id ? '#f0fdf4' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, padding: '10px 14px' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: sede.tipoEntidad === 'dre' ? '#e0e7ff' : '#e0f2fe',
                                color: sede.tipoEntidad === 'dre' ? '#3730a3' : '#0369a1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Building2 size={15} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{sede.nombre}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{sede.codigo}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            className="badge"
                            style={{
                              background: sede.tipoEntidad === 'dre' ? '#1e293b' : '#f1f5f9',
                              color: sede.tipoEntidad === 'dre' ? '#ffffff' : '#334155',
                              padding: '2px 8px',
                              fontSize: 11,
                              borderRadius: 4,
                            }}
                          >
                            {sede.tipoEntidad.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <MapPin size={12} style={{ color: '#94a3b8' }} />
                            {sede.region || 'Nacional'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', color: '#1e293b' }}>
                          <strong>{sede.responsableNombre || 'Director designado'}</strong>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: 12, color: '#0369a1', background: '#f0f9ff', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>
                            {sede.dotacionRequerida} especialistas
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className="badge green" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={11} /> En funciones
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ fontSize: 11, padding: '4px 10px', height: 28 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSedeId(sede.id);
                            }}
                          >
                            Ver Comité
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Footer Paginación y Resumen */}
        <footer className="footer" style={{ borderTop: '1px solid #e2e8f0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', fontSize: 12, color: '#64748b' }}>
          <span>
            Mostrando 1-{filteredSedes.length} de {sedes.length} sedes territoriales registradas
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn secondary"
              style={{ minHeight: '30px', fontSize: '12px' }}
              onClick={() => {
                if (selectedSedeId) {
                  setSelectedSedeId(null);
                } else if (filteredSedes[0]) {
                  setSelectedSedeId(filteredSedes[0].id);
                }
              }}
            >
              <PanelRightOpen size={14} />
              <span>{selectedSedeId ? 'Ocultar Detalle' : 'Ver Detalle'}</span>
            </button>
          </div>
        </footer>
      </ProjectShellWorkspace>

      {/* 4. Drawer Lateral Desvinculado: Ficha y Comité de la Sede */}
      {selectedSede && (
        <aside
          className="equipo-drawer"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 440,
            maxWidth: '90vw',
            background: '#ffffff',
            boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.12)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #e2e8f0',
          }}
        >
          {/* Header del Drawer */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{selectedSede.nombre}</h3>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {selectedSede.codigo} · Región {selectedSede.region || 'Nacional'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="qm-btn-icon"
              onClick={() => setSelectedSedeId(null)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Cuerpo del Drawer con información de la sede e integrantes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {/* Tarjeta Titular */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ShieldCheck size={18} style={{ color: '#0284c7' }} />
                <strong style={{ fontSize: 13, color: '#0369a1' }}>Director / Responsable Titular</strong>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                {selectedSede.responsableNombre || 'Director designado'}
              </div>
              <div style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={12} />
                <span>{selectedSede.ambito}</span>
              </div>
            </div>

            {/* Lista del Comité Local de Distribución (Supabase) */}
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                Comité de Distribución de Materiales
              </h4>
              <span style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: 999 }}>
                {comiteIntegrantes.length} registrados
              </span>
            </div>

            {loadingComite ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: 13 }}>
                Consultando directorio de la sede en Supabase...
              </div>
            ) : comiteIntegrantes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: 12 }}>
                No se registraron integrantes adicionales para esta sede en Supabase.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comiteIntegrantes.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: '10px 12px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
                          {member.nombreCompleto}
                        </div>
                        <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 500 }}>
                          {member.cargo}
                        </div>
                      </div>
                      <span className="badge green" style={{ fontSize: 10 }}>
                        {member.estadoOperativo}
                      </span>
                    </div>

                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#64748b' }}>
                      {member.telefono && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} /> {member.telefono}
                        </span>
                      )}
                      {member.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Mail size={11} /> {member.email}
                        </span>
                      )}
                      {member.documentoIdentidad && (
                        <span>DNI: {member.documentoIdentidad}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
