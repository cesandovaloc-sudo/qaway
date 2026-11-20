// @ts-nocheck
import React, { useMemo, useState, useEffect, useRef } from 'react';
import './usuarios.css';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import { usePerfilVisible } from '../../services/perfilVisibleService';
import { formatearTelefono, linkWhatsApp, telefonoDeContacto } from '../../services/comunicacionesService';
import {
  Bell, BriefcaseBusiness, Building2, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, ContactRound, Copy, Download, History, Mail, MapPin, MoreVertical,
  Phone, Plus, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Trash2, Upload, UserRound,
  UserRoundCheck, UserRoundX, Users, Wrench, X, Clock3, Network, Table, GitFork, Layers, Workflow
} from 'lucide-react';

export type UserBinds = { notify: (m: string) => void };

type UserType = 'Equipo interno' | 'Gestor' | 'Coordinador' | 'Equipo UGEL';
type UserStatus = 'Activo' | 'Pendiente' | 'Inactivo';

type Person = {
  id: number;
  name: string;
  email: string;
  role: string;
  type: UserType;
  org: string;
  status: UserStatus;
  lastAccess: string;
  phone: string;
  area: string;
  location: string;
  initials: string;
  avatar?: string;
  assignments: number;
};

const initialPeople: Person[] = [
  { id: 1, name: 'Carlos Sandoval', email: 'csandoval.digere@gmail.com', role: 'Coordinador General', type: 'Coordinador', org: 'MINEDU', status: 'Pendiente', lastAccess: '—', phone: '—', area: 'Coordinación General', location: 'Lima, Perú', initials: 'CS', assignments: 0 },
  { id: 3, name: 'Lucía Flores', email: 'l.flores@minedu.gob.pe', role: 'Especialista SIGA', type: 'Gestor', org: 'DRE Junín', status: 'Activo', lastAccess: '25 oct. 2026 · 16:45', phone: '', area: 'Distribución de materiales', location: 'Huancayo, Junín', initials: 'LF', assignments: 6, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces' },
  { id: 4, name: 'Juan Pérez', email: 'j.perez@ugelchanchamayo.gob.pe', role: 'Responsable de Logística', type: 'Equipo UGEL', org: 'UGEL Chanchamayo', status: 'Pendiente', lastAccess: '—', phone: '', area: 'Logística y almacén', location: 'Chanchamayo, Junín', initials: 'JP', assignments: 2 },
  { id: 5, name: 'Ana Torres', email: 'a.torres@ugeljauja.gob.pe', role: 'Especialista de Materiales', type: 'Equipo UGEL', org: 'UGEL Jauja', status: 'Activo', lastAccess: '25 oct. 2026 · 14:30', phone: '', area: 'Materiales educativos', location: 'Jauja, Junín', initials: 'AT', assignments: 3, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces' },
  { id: 6, name: 'Luis Ramírez', email: 'l.ramirez@minedu.gob.pe', role: 'Analista de Seguimiento', type: 'Equipo interno', org: 'Unidad de Seguimiento', status: 'Inactivo', lastAccess: '15 oct. 2026 · 09:12', phone: '', area: 'Seguimiento de campo', location: 'Lima, Perú', initials: 'LR', assignments: 1 },
  { id: 7, name: 'Sofía Huamán', email: 's.huaman@ugelconcepcion.gob.pe', role: 'Coordinadora Pedagógica', type: 'Equipo UGEL', org: 'UGEL Concepción', status: 'Activo', lastAccess: '24 oct. 2026 · 11:08', phone: '', area: 'Gestión pedagógica', location: 'Concepción, Junín', initials: 'SH', assignments: 5, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
  { id: 8, name: 'Diego Castro', email: 'd.castro@minedu.gob.pe', role: 'Especialista de Datos MC SIGA', type: 'Gestor', org: 'Unidad de Información', status: 'Pendiente', lastAccess: '—', phone: '', area: 'Información y datos', location: 'Lima, Perú', initials: 'DC', assignments: 2 },
  { id: 9, name: 'Elena Rojas', email: 'e.rojas@ugelsatipo.gob.pe', role: 'Responsable de Almacén', type: 'Equipo UGEL', org: 'UGEL Satipo', status: 'Activo', lastAccess: '24 oct. 2026 · 15:42', phone: '', area: 'Almacén central', location: 'Satipo, Junín', initials: 'ER', assignments: 3 },
  { id: 10, name: 'Miguel Salazar', email: 'm.salazar@minedu.gob.pe', role: 'Gestor de Proyecto', type: 'Gestor', org: 'Equipo de implementación', status: 'Activo', lastAccess: '23 oct. 2026 · 09:20', phone: '', area: 'Gestión de proyectos', location: 'Lima, Perú', initials: 'MS', assignments: 7 },
  { id: 11, name: 'Patricia León', email: 'p.leon@ugeltarma.gob.pe', role: 'Especialista de Distribución', type: 'Equipo UGEL', org: 'UGEL Tarma', status: 'Inactivo', lastAccess: '10 oct. 2026 · 12:11', phone: '', area: 'Distribución local', location: 'Tarma, Junín', initials: 'PL', assignments: 1 },
  { id: 12, name: 'Roberto Vega', email: 'r.vega@minedu.gob.pe', role: 'Coordinador Operativo DRE', type: 'Coordinador', org: 'DRE Junín', status: 'Activo', lastAccess: '26 oct. 2026 · 08:41', phone: '', area: 'Operaciones de campo', location: 'Huancayo, Junín', initials: 'RV', assignments: 4 }
];

const typeClass: Record<UserType, string> = {
  'Equipo interno': 'internal',
  'Gestor': 'manager',
  'Coordinador': 'coordinator',
  'Equipo UGEL': 'ugel',
};

const statusClass: Record<UserStatus, string> = {
  'Activo': 'active',
  'Pendiente': 'pending',
  'Inactivo': 'inactive',
};

const tabs: { label: string; type?: UserType }[] = [
  { label: 'Todos' },
  { label: 'Equipo interno', type: 'Equipo interno' },
  { label: 'Gestores', type: 'Gestor' },
  { label: 'Coordinadores', type: 'Coordinador' },
  { label: 'Equipo UGEL', type: 'Equipo UGEL' },
];

const USER_STATUS_FLOW: UserStatus[] = ['Activo', 'Pendiente', 'Inactivo'];
const USER_TYPES: UserType[] = ['Equipo interno', 'Gestor', 'Coordinador', 'Equipo UGEL'];

const USER_COLUMNS: ColumnDef<Person>[] = [
  { id: 'user', label: 'Usuario', type: 'person', accessor: (p) => `${p.name} ${p.email}` },
  { id: 'role', label: 'Cargo / rol', type: 'text', accessor: (p) => p.role },
  { id: 'type', label: 'Tipo de usuario', type: 'select', accessor: (p) => p.type, options: USER_TYPES.map((t) => ({ value: t, label: t })) },
  { id: 'org', label: 'Sede / Área', type: 'select', accessor: (p) => p.org },
  { id: 'status', label: 'Estado', type: 'processState', accessor: (p) => p.status, options: USER_STATUS_FLOW.map((s) => ({ value: s, label: s })) },
  { id: 'lastAccess', label: 'Último acceso', type: 'text', accessor: (p) => p.lastAccess },
];

export default function UsuariosView({ onActions }: { onActions?: (h: UserBinds) => void }) {
  const { perfil: visible } = usePerfilVisible();
  const [currentMode, setCurrentMode] = useState<'directorio' | 'organigrama'>('directorio');
  const [organigramaTipo, setOrganigramaTipo] = useState<'tradicional' | 'matricial' | 'territorial' | 'circular'>('tradicional');
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const engine = useTableEngine<Person>({ tableId: 'usuarios-directorio', columns: USER_COLUMNS, rows: people });
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState('Todos');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [orgFilter, setOrgFilter] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);
  const [drawerTab, setDrawerTab] = useState('Información');
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<Person | null>(null);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  };

  useEffect(() => {
    onActions?.({ notify });
  }, [onActions]);

  // Los teléfonos visibles vienen de public.users. Si la persona no tiene
  // número registrado, queda vacío: nunca se muestra un número inventado.
  useEffect(() => {
    const contactos = visible?.contactos || [];
    setPeople((prev) => prev.map((p) => {
      const real = telefonoDeContacto(contactos, { email: p.email, nombre: p.name });
      return { ...p, phone: real ? formatearTelefono(real) : '' };
    }));
  }, [visible?.contactos]);

  const selected = people.find((p) => p.id === selectedId) ?? null;
  const organizations = useMemo(() => Array.from(new Set(people.map((p) => p.org))).sort(), [people]);

  const filtered = useMemo(
    () =>
      people.filter((p) => {
        const tabType = tabs.find((t) => t.label === activeTab)?.type;
        const matchesTab = !tabType || p.type === tabType;
        const matchesQuery = `${p.name} ${p.email} ${p.role} ${p.org}`.toLowerCase().includes(query.toLowerCase());
        return (
          matchesTab &&
          matchesQuery &&
          (typeFilter === 'Todos' || p.type === typeFilter) &&
          (statusFilter === 'Todos' || p.status === statusFilter) &&
          (orgFilter === 'Todas' || p.org === orgFilter)
        );
      }),
    [people, activeTab, query, typeFilter, statusFilter, orgFilter]
  );

  const pageSize = 8;
  const tableItems = useMemo(() => engine.apply(filtered), [engine.apply, filtered]);
  const pages = Math.max(1, Math.ceil(tableItems.length / pageSize));
  const shown = tableItems.slice((page - 1) * pageSize, page * pageSize);

  const count = (s?: UserStatus) => people.filter((p) => !s || p.status === s).length;
  const countType = (t?: UserType) => people.filter((p) => !t || p.type === t).length;

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('Todos');
    setStatusFilter('Todos');
    setOrgFilter('Todas');
    setActiveTab('Todos');
    engine.clearAllFilters();
    setPage(1);
  };

  const updatePerson = (id: number, patch: Partial<Person>) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const deletePerson = (id: number) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
    setEditingUser(null);
    setShowCreate(false);
    notify('Usuario eliminado del directorio');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();
      let importedRows: any[] = [];

      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          notify('El archivo CSV no contiene registros.');
          return;
        }

        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine
          .split(delimiter)
          .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

        for (let i = 1; i < lines.length; i++) {
          const rawCols = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim());
          if (rawCols.length === 0 || !rawCols[0]) continue;
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = rawCols[idx] || '';
          });
          importedRows.push(rowObj);
        }
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        importedRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      } else {
        notify('Formato no soportado. Selecciona un archivo .xlsx, .xls o .csv');
        return;
      }

      if (importedRows.length === 0) {
        notify('No se encontraron filas con datos en el archivo.');
        return;
      }

      const newPeople: Person[] = importedRows.map((r, index) => {
        const findVal = (keys: string[]) => {
          const foundKey = Object.keys(r).find((k) =>
            keys.some((cand) => k.toLowerCase().includes(cand))
          );
          return foundKey ? String(r[foundKey]).trim() : '';
        };

        const name = findVal(['nombre', 'usuario', 'personal', 'name']) || `Usuario Importado ${index + 1}`;
        const email = findVal(['correo', 'email', 'mail']) || `${name.toLowerCase().replace(/\s+/g, '.')}@minedu.gob.pe`;
        const role = findVal(['cargo', 'rol', 'puesto', 'role']) || 'Especialista';
        const rawType = findVal(['tipo', 'type']) || 'Equipo UGEL';
        const org = findVal(['dre', 'ugel', 'área', 'area', 'entidad', 'sede', 'org']) || 'DRE Junín';
        const phone = findVal(['teléfono', 'telefono', 'celular', 'phone', 'whatsapp']) || '';
        const statusRaw = findVal(['estado', 'status']) || 'Activo';

        let type: UserType = 'Equipo UGEL';
        if (/coordinador/i.test(rawType)) type = 'Coordinador';
        else if (/gestor/i.test(rawType)) type = 'Gestor';
        else if (/interno|central|sede/i.test(rawType)) type = 'Equipo interno';

        let status: UserStatus = 'Activo';
        if (/pendiente/i.test(statusRaw)) status = 'Pendiente';
        else if (/inactiv/i.test(statusRaw)) status = 'Inactivo';

        const initials = name
          .split(/\s+/)
          .slice(0, 2)
          .map((n) => n[0])
          .join('')
          .toUpperCase() || 'US';

        return {
          id: Date.now() + index,
          name,
          email,
          role,
          type,
          org,
          status,
          lastAccess: 'Recién importado',
          phone,
          area: org,
          location: org.includes('Lima') ? 'Lima, Perú' : 'Junín, Perú',
          initials,
          assignments: Math.floor(Math.random() * 4) + 1,
        };
      });

      setPeople((prev) => [...newPeople, ...prev]);
      notify(`¡Éxito! Se importaron ${newPeople.length} usuarios al directorio.`);
    } catch (err: any) {
      console.error(err);
      notify(`Error al procesar el archivo: ${err?.message || 'Formato inválido'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const exportCsv = () => {
    const csv = [
      ['Nombre', 'Correo', 'Cargo', 'Tipo', 'Sede / Área', 'Estado', 'Último acceso', 'Teléfono'],
      ...filtered.map((p) => [p.name, p.email, p.role, p.type, p.org, p.status, p.lastAccess, p.phone]),
    ]
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'directorio-equipo.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Directorio exportado en CSV');
  };

  const sendEmail = (p: Person) => {
    window.location.href = `mailto:${p.email}?subject=${encodeURIComponent('Coordinación de actividades · Distribución de Materiales DOT 2027')}`;
  };

  const sendWhatsApp = (p: Person) => {
    const real = telefonoDeContacto(visible?.contactos || [], { email: p.email, nombre: p.name });
    const href = linkWhatsApp(real || p.phone, `Hola ${p.name}, te contacto desde el Gestor de Proyectos.`);
    if (!href) {
      notify(`${p.name} no tiene un teléfono registrado en su perfil.`);
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const deactivate = (p: Person) => {
    updatePerson(p.id, { status: p.status === 'Inactivo' ? 'Activo' : 'Inactivo' });
    notify(`Estado actualizado para ${p.name}: ${p.status === 'Inactivo' ? 'Activo' : 'Inactivo'}`);
  };

  return (
    <div className="usr-v1">
      {/* Topbar unificada del Canvas */}
      <header className="topbar">
        <div>
          Proyecto <ChevronRight size={13} /> <b>Distribución de Materiales DOT 2027</b> <ChevronRight size={13} /> <b>Equipo y Usuarios</b>
        </div>
        <div className="top-actions">
          <button className="iconbtn" onClick={() => notify('Directorio vinculado al marco operativo MINEDU / DRE Junín.')}>
            <ShieldCheck size={18} />
          </button>
          <button className="iconbtn" onClick={() => notify('Sin alertas de acceso en esta demostración.')}>
            <Bell size={18} />
          </button>
          <div className="avatar">CM</div>
        </div>
      </header>

      <section className="page">
        {/* Cabecera */}
        <div className="page-heading">
          <div className="heading-copy">
            <div className="eyebrow"><Users size={14} /> DIRECTORIO Y ESTRUCTURA DEL EQUIPO</div>
            <h1>Gestión de equipo y usuarios</h1>
            <p>Directorio institucional de coordinadores, especialistas SIGA y responsables de las 13 UGEL de Junín.</p>
          </div>
          <div className="heading-buttons">
            {/* Selector de Vista: Directorio vs Organigrama */}
            <div className="view-mode-toggle" style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '3px', marginRight: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentMode('directorio')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: currentMode === 'directorio' ? '#ffffff' : 'transparent',
                  color: currentMode === 'directorio' ? '#0f172a' : '#64748b',
                  boxShadow: currentMode === 'directorio' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Table size={14} /> Directorio
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('organigrama')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: currentMode === 'organigrama' ? '#ffffff' : 'transparent',
                  color: currentMode === 'organigrama' ? '#0f172a' : '#64748b',
                  boxShadow: currentMode === 'organigrama' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Network size={14} /> Organigrama
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
            />
            <button className="button secondary" onClick={() => fileInputRef.current?.click()} title="Carga masiva desde archivo Excel (.xlsx) o CSV">
              <Upload size={15} /> Importar Excel / CSV
            </button>
            <button className="button secondary" onClick={exportCsv} title="Descargar listado en formato CSV">
              <Download size={15} /> Exportar CSV
            </button>
            <button
              className="button primary"
              onClick={() => {
                setEditingUser(null);
                setShowCreate(true);
              }}
            >
              <Plus size={16} /> Agregar usuario
            </button>
          </div>
        </div>

        {/* Métricas estilo Power BI / Trello */}
        <section className="metrics">
          <article className="metric blue">
            <span className="metric-icon blue"><Users size={22} /></span>
            <div className="metric-copy">
              <b>{String(people.length)}</b>
              <strong>Usuarios registrados</strong>
              <small>Directorio del proyecto</small>
            </div>
          </article>
          <article className="metric green">
            <span className="metric-icon green"><UserRoundCheck size={22} /></span>
            <div className="metric-copy">
              <b>{String(count('Activo'))}</b>
              <strong>Activos</strong>
              <small>{Math.round((count('Activo') / Math.max(1, people.length)) * 100)}% del total</small>
            </div>
          </article>
          <article className="metric amber">
            <span className="metric-icon amber"><Clock3 size={22} /></span>
            <div className="metric-copy">
              <b>{String(count('Pendiente'))}</b>
              <strong>Pendientes de activación</strong>
              <small>Requieren seguimiento</small>
            </div>
          </article>
          <article className="metric red">
            <span className="metric-icon red"><UserRoundX size={22} /></span>
            <div className="metric-copy">
              <b>{String(count('Inactivo'))}</b>
              <strong>Inactivos</strong>
              <small>Sin acceso habilitado</small>
            </div>
          </article>
        </section>

        {/* Directorio de Usuarios */}
        {currentMode === 'directorio' ? (
        <div className="directory">
          <div className="tabbar">
            {tabs.map((t) => (
              <button
                key={t.label}
                className={activeTab === t.label ? 'tab active' : 'tab'}
                onClick={() => { setActiveTab(t.label); setPage(1); }}
              >
                {t.label}
                <span>{t.type ? countType(t.type) : people.length}</span>
              </button>
            ))}
          </div>

          <div className="filters">
            <label className="search-field">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Buscar por nombre, correo o cargo..."
              />
              {query && <button onClick={() => setQuery('')}><X size={14} /></button>}
            </label>

            <label className="select-field">
              <small>Tipo de usuario</small>
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option>Todos</option>
                {(['Equipo interno', 'Gestor', 'Coordinador', 'Equipo UGEL'] as UserType[]).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <label className="select-field">
              <small>Estado</small>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option>Todos</option>
                <option>Activo</option>
                <option>Pendiente</option>
                <option>Inactivo</option>
              </select>
              <ChevronDown size={14} />
            </label>

            <label className="select-field">
              <small>Sede / Área</small>
              <select value={orgFilter} onChange={(e) => { setOrgFilter(e.target.value); setPage(1); }}>
                <option>Todas</option>
                {organizations.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>

            <button className="button secondary" onClick={clearFilters}>
              <RefreshCw size={14} /> Limpiar
            </button>
          </div>

          <div className="table-wrap">
            <TableEngineStatus engine={engine} />
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', paddingLeft: '20px' }}>
                    <input type="checkbox" aria-label="Seleccionar todos" />
                  </th>
                  <th><ColumnHeader engine={engine} columnId="user" label="Usuario" /></th>
                  <th><ColumnHeader engine={engine} columnId="role" label="Cargo / rol" /></th>
                  <th><ColumnHeader engine={engine} columnId="type" label="Tipo de usuario" /></th>
                  <th><ColumnHeader engine={engine} columnId="org" label="Sede / Área" /></th>
                  <th><ColumnHeader engine={engine} columnId="status" label="Estado" /></th>
                  <th><ColumnHeader engine={engine} columnId="lastAccess" label="Último acceso" /></th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr
                    key={p.id}
                    className={selectedId === p.id ? 'selected-row' : ''}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <td style={{ paddingLeft: '20px' }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Seleccionar ${p.name}`} />
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="avatar">
                          {p.avatar ? <img src={p.avatar} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span>{p.initials}</span>}
                        </span>
                        <div>
                          <b>{p.name}</b>
                          <small>{p.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span>{p.role}</span></td>
                    <td><span className={`type-badge ${typeClass[p.type]}`}>{p.type}</span></td>
                    <td><span>{p.org}</span></td>
                    <td><span className={`status-badge ${statusClass[p.status]}`}><i />{p.status}</span></td>
                    <td><span style={{ fontSize: '13px', color: '#64748b' }}>{p.lastAccess}</span></td>
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="action-icon" title={`Enviar correo a ${p.name}`} onClick={() => sendEmail(p)}>
                        <Mail size={16} />
                      </button>
                      <button className="action-icon whatsapp" title={`WhatsApp con ${p.name}`} onClick={() => sendWhatsApp(p)}>
                        <Phone size={16} />
                      </button>
                      <div className="menu-anchor">
                        <button className="action-icon" onClick={() => setShowMenu(showMenu === p.id ? null : p.id)}>
                          <MoreVertical size={16} />
                        </button>
                        {showMenu === p.id && (
                          <div className="row-menu">
                            <button onClick={() => { setSelectedId(p.id); setDrawerTab('Información'); setShowMenu(null); }}>
                              <UserRound size={14} /> Ver ficha
                            </button>
                            <button onClick={() => { setEditingUser(p); setShowCreate(false); setShowMenu(null); }}>
                              <Wrench size={14} /> Modificar datos
                            </button>
                            <button onClick={() => { navigator.clipboard?.writeText(p.email); notify('Correo copiado'); setShowMenu(null); }}>
                              <Copy size={14} /> Copiar correo
                            </button>
                            <button className="danger-text" onClick={() => { deactivate(p); setShowMenu(null); }}>
                              <UserRoundX size={14} /> {p.status === 'Inactivo' ? 'Activar' : 'Desactivar'}
                            </button>
                            <button className="danger-text" onClick={() => { deletePerson(p.id); setShowMenu(null); }}>
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No se encontraron usuarios con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Mostrando {tableItems.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, tableItems.length)} de {tableItems.length} usuarios
            </span>
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} className={page === i + 1 ? 'current' : ''} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === pages} onClick={() => setPage((v) => Math.min(pages, v + 1))}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        ) : (
          /* Maqueta Simple: Vista Organigrama */
          <div className="directory" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Organigrama del Proyecto</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Estructura jerárquica de responsabilidades y líneas de reporte para la dotación regional.
                </p>
              </div>

              {/* Selector de tipo de organigrama */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Tipo de organigrama:</span>
                <select
                  value={organigramaTipo}
                  onChange={(e) => setOrganigramaTipo(e.target.value as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <option value="tradicional">Jerárquico Tradicional (Vertical)</option>
                  <option value="matricial">Estructura Matricial (Funcional / Territorial)</option>
                  <option value="territorial">Por Jurisdicción Territorial (DRE / 13 UGEL)</option>
                  <option value="circular">Estructura Circular / Red Radial</option>
                </select>
              </div>
            </div>

            {/* Espacio reservado para el canvas de organigrama */}
            <div
              style={{
                minHeight: '360px',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', marginBottom: '14px' }}>
                <Network size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                Vista Organigrama: {organigramaTipo === 'tradicional' ? 'Jerárquico Tradicional' : organigramaTipo === 'matricial' ? 'Estructura Matricial' : organigramaTipo === 'territorial' ? 'Por Jurisdicción Territorial' : 'Estructura Circular'}
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b', maxWidth: '440px' }}>
                Espacio maquetado listo para la renderización de la estructura de cargos y dependencias.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Drawer Lateral de Detalle */}
      {selected && (
        <aside className="detail-panel">
          <div className="detail-head">
            <button className="close-panel" onClick={() => setSelectedId(null)}>
              <X size={18} />
            </button>
            <div className="profile-head" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className="avatar large">
                {selected.avatar ? <img src={selected.avatar} alt="" /> : <span>{selected.initials}</span>}
              </span>
              <div className="profile-title">
                <h2>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ color: '#2563eb', fontSize: '13px' }}>{selected.email}</a>
                <div style={{ marginTop: '4px' }}>
                  <span className={`status-badge ${statusClass[selected.status]}`}><i />{selected.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-tabs">
            {['Información', `Asignaciones (${selected.assignments})`, 'Historial'].map((t) => (
              <button key={t} className={drawerTab === t ? 'active' : ''} onClick={() => setDrawerTab(t)}>
                {t}
              </button>
            ))}
          </div>

          <div className="detail-content">
            {drawerTab === 'Información' ? (
              <>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 12px', marginBottom: '16px' }}>
                  <div className="info-row"><BriefcaseBusiness size={14} /><span className="info-label">Cargo</span><span className="info-value">{selected.role}</span></div>
                  <div className="info-row"><ContactRound size={14} /><span className="info-label">Tipo</span><span className="info-value"><span className={`type-badge ${typeClass[selected.type]}`}>{selected.type}</span></span></div>
                  <div className="info-row"><Building2 size={14} /><span className="info-label">Entidad</span><span className="info-value">{selected.org}</span></div>
                  <div className="info-row"><History size={14} /><span className="info-label">Último acceso</span><span className="info-value">{selected.lastAccess}</span></div>
                  <div className="info-row"><Phone size={14} /><span className="info-label">Teléfono</span><span className="info-value">{selected.phone}</span></div>
                  <div className="info-row"><MapPin size={14} /><span className="info-label">Sede</span><span className="info-value">{selected.location}</span></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <button className="button secondary" style={{ width: '100%' }} onClick={() => sendEmail(selected)}>
                    <Mail size={14} /> Correo
                  </button>
                  <button className="button secondary" style={{ width: '100%' }} onClick={() => sendWhatsApp(selected)}>
                    <Phone size={14} /> WhatsApp
                  </button>
                </div>

                <button
                  className="button secondary"
                  style={{ width: '100%', marginBottom: '10px' }}
                  onClick={() => {
                    setEditingUser(selected);
                    setShowCreate(false);
                  }}
                >
                  <Wrench size={14} /> Modificar datos de este usuario
                </button>

                <button
                  className="button secondary"
                  style={{ width: '100%', borderColor: selected.status === 'Inactivo' ? '#86efac' : '#fca5a5', color: selected.status === 'Inactivo' ? '#15803d' : '#b91c1c' }}
                  onClick={() => deactivate(selected)}
                >
                  {selected.status === 'Inactivo' ? <UserRoundCheck size={15} /> : <UserRoundX size={15} />}
                  {selected.status === 'Inactivo' ? 'Habilitar usuario' : 'Desactivar usuario'}
                </button>
              </>
            ) : drawerTab.startsWith('Asignaciones') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>Hitos y tareas vinculadas</h3>
                {Array.from({ length: selected.assignments }, (_, i) => (
                  <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                      {['Distribución de Materiales DOT 2027', 'Hito 1.6 · Elaboración del CDL', 'Seguimiento regional Junín', 'Validación de entregables'][i % 4]}
                    </b>
                    <small style={{ color: '#64748b' }}>{i % 2 === 0 ? 'Responsable principal' : 'Colaborador técnico'}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px' }}>Bitácora de actividad</h3>
                <div style={{ fontSize: '13px', color: '#64748b', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <b style={{ color: '#0f172a', display: 'block' }}>Perfil sincronizado</b>
                  <span>Última validación de credenciales registrada.</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Modal Agregar / Modificar Usuario */}
      {(showCreate || editingUser) && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
              setEditingUser(null);
            }
          }}
        >
          <form
            key={editingUser ? `edit-${editingUser.id}` : 'new-user'}
            className="create-modal"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = (formData.get('name') as string)?.trim();
              const email = (formData.get('email') as string)?.trim();
              const role = (formData.get('role') as string)?.trim();
              const type = formData.get('type') as UserType;
              const org = (formData.get('org') as string)?.trim() || 'DRE Junín';
              // No se captura aquí: se conserva el valor real ya hidratado
              // desde users.phone. El alta/edición del número es en Mi Perfil.
              const phone = editingUser?.phone || '';
              const status = (formData.get('status') as UserStatus) || (editingUser?.status ?? 'Activo');

              const initials = name
                .split(/\s+/)
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'US';

              if (editingUser) {
                updatePerson(editingUser.id, {
                  name,
                  email,
                  role,
                  type,
                  org,
                  phone,
                  status,
                  initials,
                });
                setEditingUser(null);
                notify(`Datos de ${name} modificados correctamente`);
              } else {
                setPeople((prev) => [
                  {
                    id: Math.max(0, ...prev.map((p) => p.id)) + 1,
                    name,
                    email,
                    role,
                    type,
                    org,
                    status,
                    lastAccess: '—',
                    phone,
                    area: org,
                    location: org.includes('Lima') ? 'Lima, Perú' : 'Junín, Perú',
                    initials,
                    assignments: 1,
                  },
                  ...prev,
                ]);
                setShowCreate(false);
                notify('Usuario añadido al directorio del proyecto');
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {editingUser ? 'Modificar datos del usuario' : 'Agregar usuario al directorio'}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  {editingUser
                    ? `Actualizando información institucional de ${editingUser.name}.`
                    : 'Registra personal interno o especialistas de las UGEL.'}
                </p>
              </div>
              <button
                type="button"
                className="action-icon"
                onClick={() => {
                  setShowCreate(false);
                  setEditingUser(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label className="form-field wide">
                <span>Nombre completo *</span>
                <input name="name" required defaultValue={editingUser?.name || ''} placeholder="Ej. Carlos Valdivia" />
              </label>
              <label className="form-field">
                <span>Correo institucional *</span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={editingUser?.email || ''}
                  placeholder="c.valdivia@minedu.gob.pe"
                />
              </label>
              <div className="form-field">
                <span>Teléfono / WhatsApp</span>
                <div style={{ minHeight: '36px', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '6px 10px' }}>
                  Se registra en Mi Perfil → Teléfono / WhatsApp
                </div>
              </div>
              <label className="form-field">
                <span>Cargo o rol *</span>
                <input
                  name="role"
                  required
                  defaultValue={editingUser?.role || ''}
                  placeholder="Ej. Especialista de Distribución"
                />
              </label>
              <label className="form-field">
                <span>Tipo de usuario</span>
                <select name="type" defaultValue={editingUser?.type || 'Equipo UGEL'}>
                  <option>Equipo interno</option>
                  <option>Gestor</option>
                  <option>Coordinador</option>
                  <option>Equipo UGEL</option>
                </select>
              </label>
              <label className="form-field">
                <span>Sede / Entidad</span>
                <input
                  name="org"
                  defaultValue={editingUser?.org || 'Sede Central'}
                  placeholder="Ej. Sede Central"
                />
              </label>
              {editingUser && (
                <label className="form-field">
                  <span>Estado</span>
                  <select name="status" defaultValue={editingUser.status}>
                    <option>Activo</option>
                    <option>Pendiente</option>
                    <option>Inactivo</option>
                  </select>
                </label>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingUser ? (
                <button
                  type="button"
                  className="button danger"
                  onClick={() => deletePerson(editingUser.id)}
                >
                  <Trash2 size={15} /> Eliminar usuario
                </button>
              ) : <div />}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingUser(null);
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="button primary">
                  {editingUser ? <Check size={15} /> : <Plus size={15} />}
                  {editingUser ? 'Guardar cambios' : 'Guardar usuario'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {notice && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 18px', borderRadius: '8px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <Check size={16} className="text-green-400" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
