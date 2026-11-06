// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './actas.css';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  ListChecks,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';

interface AgreementItem {
  id: string;
  actCode: string;
  ugel: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'cumplido' | 'proceso' | 'pendiente';
}

interface ActRecord {
  id: string;
  code: string;
  date: string;
  ugel: string;
  dre: string;
  activity: string;
  modality: 'Virtual' | 'Presencial';
  participantsCount: number;
  agreementsCount: number;
  status: 'Aprobada' | 'Borrador' | 'En revisión';
}

const INITIAL_AGREEMENTS: AgreementItem[] = [
  {
    id: 'ACU-001',
    actCode: 'ACT-2026-089',
    ugel: 'UGEL Huancavelica',
    description: 'Remitir resolución directoral de conformación del comité de distribución 2027 visada.',
    responsible: 'Prof. Carlos Sandoval (Punto Focal)',
    deadline: '25/09/2026',
    status: 'cumplido',
  },
  {
    id: 'ACU-002',
    actCode: 'ACT-2026-092',
    ugel: 'UGEL Maynas',
    description: 'Completar subsanación de inconsistencias en 14 códigos modulares observados en MC SIGA.',
    responsible: 'Ing. Lucía Ramos (Especialista SIGA)',
    deadline: '18/10/2026',
    status: 'proceso',
  },
  {
    id: 'ACU-003',
    actCode: 'ACT-2026-095',
    ugel: 'UGEL Satipo',
    description: 'Presentar expediente de contratación de transporte fluvial para instituciones de cuenca.',
    responsible: 'Lic. Javier Ruiz (Abastecimiento)',
    deadline: '30/10/2026',
    status: 'pendiente',
  },
  {
    id: 'ACU-004',
    actCode: 'ACT-2026-098',
    ugel: 'UGEL Cusco',
    description: 'Ejecutar réplica de asistencia técnica a 35 directores de red sobre pre-distribución BIAE.',
    responsible: 'Lic. Ana Paola Quispe (Monitora)',
    deadline: '12/11/2026',
    status: 'proceso',
  },
  {
    id: 'ACU-005',
    actCode: 'ACT-2026-101',
    ugel: 'UGEL Tarma',
    description: 'Carga definitiva de matriz RAR en el aplicativo MC SIGA con firmas de conformidad.',
    responsible: 'Roberto Farfán (Especialista)',
    deadline: '20/10/2026',
    status: 'cumplido',
  },
  {
    id: 'ACU-006',
    actCode: 'ACT-2026-104',
    ugel: 'UGEL Condorcanqui',
    description: 'Validar rutas críticas fluviales con el equipo de gestión de riesgos y desastres de DRE.',
    responsible: 'Equipo Territorial DIGERE',
    deadline: '15/11/2026',
    status: 'pendiente',
  },
];

const INITIAL_ACTS: ActRecord[] = [
  {
    id: 'act-1',
    code: 'ACT-2026-089',
    date: '2026-09-22',
    ugel: 'UGEL Huancavelica',
    dre: 'DRE Huancavelica',
    activity: 'Monitoreo y seguimiento de distribución',
    modality: 'Virtual',
    participantsCount: 14,
    agreementsCount: 3,
    status: 'Aprobada',
  },
  {
    id: 'act-2',
    code: 'ACT-2026-092',
    date: '2026-10-05',
    ugel: 'UGEL Maynas',
    dre: 'DRE Loreto',
    activity: 'Asistencia técnica MC SIGA',
    modality: 'Virtual',
    participantsCount: 18,
    agreementsCount: 4,
    status: 'Aprobada',
  },
  {
    id: 'act-3',
    code: 'ACT-2026-095',
    date: '2026-10-14',
    ugel: 'UGEL Satipo',
    dre: 'DRE Junín',
    activity: 'Mesa de trabajo sobre transporte y rutas',
    modality: 'Presencial',
    participantsCount: 9,
    agreementsCount: 2,
    status: 'En revisión',
  },
];

const AGREEMENT_STATUS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'proceso', label: 'En proceso' },
  { value: 'cumplido', label: 'Cumplido' },
];

const AGREEMENT_COLUMNS: ColumnDef<AgreementItem>[] = [
  { id: 'code', label: 'Código / Acta', type: 'text', accessor: (r) => `${r.id} ${r.actCode}` },
  { id: 'ugel', label: 'Sede / Ámbito', type: 'select', accessor: (r) => r.ugel },
  { id: 'description', label: 'Acuerdo / Compromiso', type: 'text', accessor: (r) => r.description },
  { id: 'responsible', label: 'Responsable Acreditado', type: 'person', accessor: (r) => r.responsible },
  { id: 'deadline', label: 'Plazo Límite', type: 'date', accessor: (r) => r.deadline },
  { id: 'status', label: 'Estado', type: 'processState', accessor: (r) => r.status, options: AGREEMENT_STATUS },
];

const ACT_COLUMNS: ColumnDef<ActRecord>[] = [
  { id: 'code', label: 'Código', type: 'text', accessor: (r) => r.code },
  { id: 'date', label: 'Fecha', type: 'date', accessor: (r) => r.date },
  { id: 'ugel', label: 'Sede / Instancia', type: 'select', accessor: (r) => r.ugel },
  { id: 'activity', label: 'Tipo de Actividad', type: 'select', accessor: (r) => r.activity },
  { id: 'modality', label: 'Modalidad', type: 'select', accessor: (r) => r.modality },
  { id: 'agreementsCount', label: 'Acuerdos', type: 'number', accessor: (r) => r.agreementsCount },
  {
    id: 'status',
    label: 'Estado Documental',
    type: 'processState',
    accessor: (r) => r.status,
    options: ['Borrador', 'En revisión', 'Aprobada'].map((s) => ({ value: s, label: s })),
  },
];

export default function ActasAcuerdosView({ onActions }: { onActions?: (h: any) => void }) {
  const [activeTab, setActiveTab] = useState<'acuerdos' | 'generador' | 'historial'>('acuerdos');
  const [agreements, setAgreements] = useState<AgreementItem[]>(INITIAL_AGREEMENTS);
  const [acts, setActs] = useState<ActRecord[]>(INITIAL_ACTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ugelFilter, setUgelFilter] = useState('todas');
  const [openDropdown, setOpenDropdown] = useState<'ugel' | 'status' | null>(null);
  const [notice, setNotice] = useState('');

  const agEngine = useTableEngine<AgreementItem>({ tableId: 'actas-acuerdos', columns: AGREEMENT_COLUMNS, rows: agreements });
  const actsEngine = useTableEngine<ActRecord>({ tableId: 'actas-historial', columns: ACT_COLUMNS, rows: acts });

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Form State para Generador de Acta
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    activity: 'Monitoreo y seguimiento',
    modality: 'Virtual' as 'Virtual' | 'Presencial',
    dre: 'DRE Junín',
    ugel: 'UGEL Huancayo',
    participants: 'Director de UGEL, Jefe de AGP, Especialista SIGA, Monitor Territorial DIGERE',
    agenda: [
      'Balance de cumplimiento de la Resolución Directoral de conformación de comités.',
      'Revisión del avance de carga de Cuadros de Distribución Local (CDL).',
      'Definición de plan de mitigación para retrasos en contratación de transporte.',
    ],
    newAgreements: [
      { text: 'Concluir validación del 100% de registros en MC SIGA antes del 30 de octubre.', deadline: '30/10/2026' },
      { text: 'Remitir informe situacional de almacenes con condiciones de seguridad aptas.', deadline: '05/11/2026' },
    ],
    observations: 'Se contó con la participación de los responsables de las áreas involucradas, logrando consenso en los plazos fijados.',
  });

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  useEffect(() => {
    onActions?.({
      notify,
      setActiveTab,
      exportDoc: handleExportDoc,
    });
  }, [onActions]);

  const cycleAgreementStatus = (id: string) => {
    setAgreements((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === 'pendiente'
            ? 'proceso'
            : item.status === 'proceso'
            ? 'cumplido'
            : 'pendiente';
        return { ...item, status: nextStatus };
      })
    );
    notify('Estado del acuerdo actualizado');
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter((a) => {
      const matchSearch =
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.responsible.toLowerCase().includes(search.toLowerCase()) ||
        a.ugel.toLowerCase().includes(search.toLowerCase()) ||
        a.actCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
      const matchUgel = ugelFilter === 'todas' || a.ugel === ugelFilter;
      return matchSearch && matchStatus && matchUgel;
    });
  }, [agreements, search, statusFilter, ugelFilter]);

  const agreementsView = useMemo(() => agEngine.apply(filteredAgreements), [agEngine.apply, filteredAgreements]);
  const actsView = useMemo(() => actsEngine.apply(acts), [actsEngine.apply, acts]);

  const kpis = useMemo(() => {
    const total = agreements.length;
    const cumplidos = agreements.filter((a) => a.status === 'cumplido').length;
    const proceso = agreements.filter((a) => a.status === 'proceso').length;
    const pendientes = agreements.filter((a) => a.status === 'pendiente').length;
    return { total, cumplidos, proceso, pendientes };
  }, [agreements]);

  const handleExportDoc = () => {
    const actText = `
ACTA DE REUNIÓN DE TRABAJO ESTRATÉGICO
======================================
Código Referencial: ACT-2026-${Math.floor(100 + Math.random() * 900)}
Fecha: ${form.date} | Horario: ${form.startTime} - ${form.endTime}
Modalidad: ${form.modality}
Entidad / Ámbito: ${form.dre} — ${form.ugel}
Actividad: ${form.activity}

PARTICIPANTES:
${form.participants}

PUNTOS DE AGENDA TRATADOS:
${form.agenda.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}

ACUERDOS Y COMPROMISOS ADOPTADOS:
${form.newAgreements.map((a, idx) => `${idx + 1}. [Plazo: ${a.deadline}] ${a.text}`).join('\n')}

OBSERVACIONES Y CONCLUSIONES:
${form.observations}

Conformidad institucional registrada en plataforma Qaway Lab.
    `.trim();

    const blob = new Blob([actText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_Institucional_${form.ugel.replace(/\s+/g, '_')}_${form.date}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Documento de Acta generado y descargado correctamente');
  };

  const handleAddAgendaPoint = () => {
    setForm((prev) => ({ ...prev, agenda: [...prev.agenda, ''] }));
  };

  const handleRemoveAgendaPoint = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== idx),
    }));
  };

  const handleAddAgreementRow = () => {
    setForm((prev) => ({
      ...prev,
      newAgreements: [...prev.newAgreements, { text: '', deadline: '' }],
    }));
  };

  const handleRemoveAgreementRow = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      newAgreements: prev.newAgreements.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="gantt-v2">
      <div className="app act-v1">
        {/* Cabecera Principal Oficial (Estándar Cronograma Maestro) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <FileCheck2 size={26} />
            </span>
            <div>
              <span className="super">GESTIÓN DOCUMENTAL Y MONITOREO DE COMPROMISOS · DOTACIÓN 2027</span>
              <h1>Actas y Acuerdos Institucionales</h1>
              <p>
                Registro formal de reuniones territoriales, validación técnica de acuerdos y trazabilidad de compromisos por UGEL.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => window.print()}
              title="Imprimir vista de actas y compromisos"
            >
              <Printer size={15} />
              <span>Imprimir Vista Oficial</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                setActiveTab('generador');
                notify('Formulario de nueva acta desplegado');
              }}
              title="Crear y formalizar una nueva acta"
            >
              <Plus size={16} />
              <span>Nueva Acta</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setActiveTab('acuerdos');
              setStatusFilter('todos');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <ListChecks size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.total).padStart(2, '0')}</b>
              <strong>Compromisos Registrados</strong>
              <small>acuerdos territoriales activos</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setActiveTab('acuerdos');
              setStatusFilter('cumplido');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.cumplidos).padStart(2, '0')}</b>
              <strong>Cumplidos ({kpis.total > 0 ? Math.round((kpis.cumplidos / kpis.total) * 100) : 0}%)</strong>
              <small>conforme a acta firmada</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setActiveTab('acuerdos');
              setStatusFilter('proceso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Clock size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.proceso).padStart(2, '0')}</b>
              <strong>En Proceso ({kpis.total > 0 ? Math.round((kpis.proceso / kpis.total) * 100) : 0}%)</strong>
              <small>seguimiento territorial activo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setActiveTab('acuerdos');
              setStatusFilter('pendiente');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertCircle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.pendientes).padStart(2, '0')}</b>
              <strong>Pendientes ({kpis.total > 0 ? Math.round((kpis.pendientes / kpis.total) * 100) : 0}%)</strong>
              <small>alerta de vencimiento próxima</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Modos */}
          <nav className="tabs">
            <div className="tabs-list">
              <button
                type="button"
                className={activeTab === 'acuerdos' ? 'active' : ''}
                onClick={() => setActiveTab('acuerdos')}
              >
                Tablero de Acuerdos <span>({agreements.length})</span>
              </button>
              <button
                type="button"
                className={activeTab === 'generador' ? 'active' : ''}
                onClick={() => setActiveTab('generador')}
              >
                Generador de Acta
              </button>
              <button
                type="button"
                className={activeTab === 'historial' ? 'active' : ''}
                onClick={() => setActiveTab('historial')}
              >
                Historial de Actas <span>({acts.length})</span>
              </button>
            </div>

            {/* Switcher Rápido */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${activeTab === 'acuerdos' ? 'active' : ''}`}
                onClick={() => setActiveTab('acuerdos')}
                title="Ver Tablero de Acuerdos"
              >
                <ListChecks size={14} />
                <span>Acuerdos</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${activeTab === 'historial' ? 'active' : ''}`}
                onClick={() => setActiveTab('historial')}
                title="Ver Historial de Actas"
              >
                <History size={14} />
                <span>Historial</span>
              </button>
            </div>
          </nav>

          {/* =====================================================================
              TAB 1: TABLERO DE ACUERDOS
             ===================================================================== */}
          {activeTab === 'acuerdos' && (
            <>
              {/* Barra de Filtros Homologada */}
              <div className="filters">
                {/* Buscador reactivo */}
                <label className="search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Buscar por acuerdo, responsable, sede o código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </label>

                {/* Filtro Sede / Ámbito */}
                <div className="filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`filter-card-btn ${openDropdown === 'ugel' ? 'active' : ''} ${
                      ugelFilter !== 'todas' ? 'filtered' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'ugel' ? null : 'ugel');
                    }}
                    title="Filtrar por sede territorial"
                  >
                    <div className="filter-card-copy">
                      <small>Sede / Ámbito</small>
                      <span>{ugelFilter === 'todas' ? 'Todas las sedes' : ugelFilter}</span>
                    </div>
                    <ChevronDown size={14} className="filter-chevron" />
                  </button>

                  {openDropdown === 'ugel' && (
                    <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                      <div className="filter-popover-title">Filtrar por Sede</div>
                      <div className="filter-popover-list">
                        {[
                          { id: 'todas', label: 'Todas las sedes' },
                          { id: 'UGEL Huancavelica', label: 'UGEL Huancavelica' },
                          { id: 'UGEL Maynas', label: 'UGEL Maynas' },
                          { id: 'UGEL Satipo', label: 'UGEL Satipo' },
                          { id: 'UGEL Cusco', label: 'UGEL Cusco' },
                          { id: 'UGEL Tarma', label: 'UGEL Tarma' },
                          { id: 'UGEL Condorcanqui', label: 'UGEL Condorcanqui' },
                        ].map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            className={`filter-item-btn ${ugelFilter === u.id ? 'selected' : ''}`}
                            onClick={() => {
                              setUgelFilter(u.id);
                              setOpenDropdown(null);
                            }}
                          >
                            <span>{u.label}</span>
                            {ugelFilter === u.id && <Check size={14} className="item-check" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtro Estado del Compromiso */}
                <div className="filter-dropdown-wrap">
                  <button
                    type="button"
                    className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                      statusFilter !== 'todos' ? 'filtered' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'status' ? null : 'status');
                    }}
                    title="Filtrar por estado del compromiso"
                  >
                    <div className="filter-card-copy">
                      <small>Estado del Compromiso</small>
                      <span>
                        {statusFilter === 'todos'
                          ? 'Todos los estados'
                          : statusFilter === 'cumplido'
                          ? 'Cumplidos'
                          : statusFilter === 'proceso'
                          ? 'En proceso'
                          : 'Pendientes'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="filter-chevron" />
                  </button>

                  {openDropdown === 'status' && (
                    <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                      <div className="filter-popover-title">Filtrar por Estado</div>
                      <div className="filter-popover-list">
                        {[
                          { id: 'todos', label: 'Todos los estados' },
                          { id: 'cumplido', label: 'Cumplidos' },
                          { id: 'proceso', label: 'En proceso' },
                          { id: 'pendiente', label: 'Pendientes' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className={`filter-item-btn ${statusFilter === s.id ? 'selected' : ''}`}
                            onClick={() => {
                              setStatusFilter(s.id);
                              setOpenDropdown(null);
                            }}
                          >
                            <span>{s.label}</span>
                            {statusFilter === s.id && <Check size={14} className="item-check" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge de Sincronización */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Calendar size={14} className="text-blue-600" />
                  <span>Control de Compromisos: <b>Validez Oficial Activa</b></span>
                </div>
              </div>

              {/* Tabla de Acuerdos Homologada */}
              <div className="cronograma-lista-table" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Compromisos y Acuerdos Acreditados</h2>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                      Haz clic sobre la píldora de estado para alternar: Cumplido → En Proceso → Pendiente.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('todos');
                        setUgelFilter('todas');
                        notify('Filtros restablecidos');
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                </div>

                <div className="table-scroll" style={{ overflowX: 'auto' }}>
                  <TableEngineStatus engine={agEngine} />
                  <table className="act-table">
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: '20px' }}>
                          <ColumnHeader engine={agEngine} columnId="code" label="Código / Acta" />
                        </th>
                        <th><ColumnHeader engine={agEngine} columnId="ugel" label="Sede / Ámbito" /></th>
                        <th><ColumnHeader engine={agEngine} columnId="description" label="Acuerdo / Compromiso" /></th>
                        <th><ColumnHeader engine={agEngine} columnId="responsible" label="Responsable Acreditado" /></th>
                        <th><ColumnHeader engine={agEngine} columnId="deadline" label="Plazo Límite" /></th>
                        <th style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <ColumnHeader engine={agEngine} columnId="status" label="Estado (Click para cambiar)" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreementsView.map((item) => (
                        <tr key={item.id}>
                          <td style={{ paddingLeft: '20px' }}>
                            <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{item.id}</strong>
                            <small style={{ color: '#64748b', fontSize: '11.5px' }}>{item.actCode}</small>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>{item.ugel}</span>
                          </td>
                          <td style={{ maxWidth: 380, lineHeight: 1.45, fontSize: '13px', color: '#1e293b' }}>{item.description}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12.5px', color: '#475569' }}>
                              <Users size={14} color="#64748b" />
                              <span>{item.responsible}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '12.5px', color: '#0f172a' }}>
                              <Calendar size={14} color="#64748b" />
                              <span>{item.deadline}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                            <button
                              type="button"
                              className={`act-status-pill ${item.status}`}
                              onClick={() => cycleAgreementStatus(item.id)}
                              title="Click para alternar estado: Cumplido / En Proceso / Pendiente"
                              style={{ cursor: 'pointer', border: 'none', font: 'inherit' }}
                            >
                              {item.status === 'cumplido' && '✓ Cumplido'}
                              {item.status === 'proceso' && '● En Proceso'}
                              {item.status === 'pendiente' && '○ Pendiente'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredAgreements.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                            No se encontraron acuerdos con los criterios seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* =====================================================================
              TAB 2: FORMULARIO GENERADOR DE ACTA
             ===================================================================== */}
          {activeTab === 'generador' && (
            <div className="act-form-container" style={{ marginTop: '4px' }}>
              <div>
                {/* Sección 1: Información General */}
                <div className="act-panel">
                  <div className="act-panel-head">
                    <div className="act-panel-title">
                      <FileCheck2 size={18} color="#2563eb" />
                      <span>01. Información General del Acta</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Plantilla Corporativa Oficial</span>
                  </div>
                  <div className="act-panel-body">
                    <div className="act-form-grid">
                      <div className="act-field">
                        <label>Fecha de la Sesión</label>
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                      </div>
                      <div className="act-field">
                        <label>Tipo de Actividad</label>
                        <select
                          value={form.activity}
                          onChange={(e) => setForm({ ...form, activity: e.target.value })}
                        >
                          <option>Monitoreo y seguimiento</option>
                          <option>Asistencia técnica</option>
                          <option>Balance y rendición</option>
                          <option>Reunión extraordinaria</option>
                        </select>
                      </div>
                      <div className="act-field">
                        <label>Hora de Inicio</label>
                        <input
                          type="text"
                          value={form.startTime}
                          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                          placeholder="Ej. 09:00"
                        />
                      </div>
                      <div className="act-field">
                        <label>Hora de Cierre</label>
                        <input
                          type="text"
                          value={form.endTime}
                          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                          placeholder="Ej. 11:30"
                        />
                      </div>
                      <div className="act-field">
                        <label>DRE / Entidad Rectora</label>
                        <input
                          type="text"
                          value={form.dre}
                          onChange={(e) => setForm({ ...form, dre: e.target.value })}
                        />
                      </div>
                      <div className="act-field">
                        <label>UGEL / Instancia de Gestión</label>
                        <input
                          type="text"
                          value={form.ugel}
                          onChange={(e) => setForm({ ...form, ugel: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="act-field">
                      <label>Participantes Oficiales (Cargos e Instancias)</label>
                      <textarea
                        rows={2}
                        value={form.participants}
                        onChange={(e) => setForm({ ...form, participants: e.target.value })}
                        placeholder="Indique los participantes acreditados..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 2: Agenda y Acuerdos */}
                <div className="act-panel">
                  <div className="act-panel-head">
                    <div className="act-panel-title">
                      <ListChecks size={18} color="#2563eb" />
                      <span>02. Puntos de Agenda y Compromisos</span>
                    </div>
                  </div>
                  <div className="act-panel-body">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                      Puntos de Agenda Tratados
                    </label>
                    {form.agenda.map((item, idx) => (
                      <div key={idx} className="act-dynamic-row">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const next = [...form.agenda];
                            next[idx] = e.target.value;
                            setForm({ ...form, agenda: next });
                          }}
                          placeholder={`Punto ${idx + 1}`}
                        />
                        {form.agenda.length > 1 && (
                          <button
                            type="button"
                            className="act-btn-icon-del"
                            onClick={() => handleRemoveAgendaPoint(idx)}
                            title="Eliminar punto"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ marginBottom: 20, fontSize: '12px' }}
                      onClick={handleAddAgendaPoint}
                    >
                      + Agregar Punto de Agenda
                    </button>

                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                      Acuerdos y Compromisos con Plazo Límite
                    </label>
                    {form.newAgreements.map((item, idx) => (
                      <div key={idx} className="act-dynamic-row">
                        <textarea
                          rows={2}
                          value={item.text}
                          onChange={(e) => {
                            const next = [...form.newAgreements];
                            next[idx].text = e.target.value;
                            setForm({ ...form, newAgreements: next });
                          }}
                          placeholder={`Acuerdo ${idx + 1}`}
                        />
                        <input
                          type="text"
                          style={{ width: '130px', flex: 'none' }}
                          value={item.deadline}
                          onChange={(e) => {
                            const next = [...form.newAgreements];
                            next[idx].deadline = e.target.value;
                            setForm({ ...form, newAgreements: next });
                          }}
                          placeholder="Plazo: dd/mm/aaaa"
                        />
                        {form.newAgreements.length > 1 && (
                          <button
                            type="button"
                            className="act-btn-icon-del"
                            onClick={() => handleRemoveAgreementRow(idx)}
                            title="Eliminar acuerdo"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ marginBottom: 20, fontSize: '12px' }}
                      onClick={handleAddAgreementRow}
                    >
                      + Agregar Acuerdo
                    </button>

                    <div className="act-field">
                      <label>Observaciones y Conclusiones Finales</label>
                      <textarea
                        rows={3}
                        value={form.observations}
                        onChange={(e) => setForm({ ...form, observations: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar lateral de Validación Técnica */}
              <div className="act-summary-side">
                <div className="act-summary-card" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                  <h3 className="act-summary-title" style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#16a34a" />
                    <span>Validación Técnica</span>
                  </h3>
                  <div className="act-check-item">
                    <span className={`act-check-dot ${form.date ? 'ready' : 'waiting'}`}>✓</span>
                    <span>Fecha registrada</span>
                  </div>
                  <div className="act-check-item">
                    <span className={`act-check-dot ${form.ugel ? 'ready' : 'waiting'}`}>✓</span>
                    <span>Sede identificada</span>
                  </div>
                  <div className="act-check-item">
                    <span className={`act-check-dot ${form.participants ? 'ready' : 'waiting'}`}>✓</span>
                    <span>Participantes confirmados</span>
                  </div>
                  <div className="act-check-item">
                    <span className={`act-check-dot ${form.agenda.some((a) => a.trim()) ? 'ready' : 'waiting'}`}>✓</span>
                    <span>Agenda estructurada</span>
                  </div>
                  <div className="act-check-item">
                    <span className={`act-check-dot ${form.newAgreements.some((a) => a.text.trim()) ? 'ready' : 'waiting'}`}>✓</span>
                    <span>{form.newAgreements.filter((a) => a.text.trim()).length} acuerdos con plazo</span>
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      type="button"
                      className="btn primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleExportDoc}
                    >
                      <Download size={16} />
                      <span>Descargar Acta (.txt)</span>
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={() => window.print()}
                    >
                      <Printer size={16} />
                      <span>Imprimir Vista Oficial</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: HISTORIAL DE ACTAS FORMALIZADAS
             ===================================================================== */}
          {activeTab === 'historial' && (
            <div className="cronograma-lista-table" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Historial de Actas Formalizadas</h2>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                    Registro histórico de sesiones de coordinación territorial con validez técnica y firmas acreditadas.
                  </p>
                </div>
              </div>

              <div className="table-scroll" style={{ overflowX: 'auto' }}>
                <TableEngineStatus engine={actsEngine} />
                <table className="act-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '20px' }}><ColumnHeader engine={actsEngine} columnId="code" label="Código" /></th>
                      <th><ColumnHeader engine={actsEngine} columnId="date" label="Fecha" /></th>
                      <th><ColumnHeader engine={actsEngine} columnId="ugel" label="Sede / Instancia" /></th>
                      <th><ColumnHeader engine={actsEngine} columnId="activity" label="Tipo de Actividad" /></th>
                      <th><ColumnHeader engine={actsEngine} columnId="modality" label="Modalidad" /></th>
                      <th><ColumnHeader engine={actsEngine} columnId="agreementsCount" label="Acuerdos" /></th>
                      <th style={{ textAlign: 'right', paddingRight: '20px' }}>
                        <ColumnHeader engine={actsEngine} columnId="status" label="Estado Documental" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {actsView.map((act) => (
                      <tr key={act.id}>
                        <td style={{ paddingLeft: '20px' }}>
                          <strong style={{ color: '#2563eb', fontSize: '13.5px' }}>{act.code}</strong>
                        </td>
                        <td style={{ fontSize: '13px', color: '#475569' }}>{act.date}</td>
                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{act.ugel}</strong>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>{act.dre}</div>
                        </td>
                        <td style={{ fontSize: '13px', color: '#334155' }}>{act.activity}</td>
                        <td>
                          <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#475569', fontWeight: 500 }}>
                            {act.modality}
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a', fontSize: '13px' }}>{act.agreementsCount} acuerdos</strong>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                          <span className="act-status-pill cumplido">✓ {act.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Oficial de la Cápsula Workspace */}
          <footer className="footer">
            <span>
              Mostrando {activeTab === 'acuerdos' ? filteredAgreements.length : activeTab === 'historial' ? acts.length : 1} registros institucionales
            </span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginRight: 4 }} /> Cumplido</span>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563eb', marginRight: 4 }} /> En Proceso</span>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginRight: 4 }} /> Pendiente / Alerta</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Toast Notificación */}
      {notice && (
        <div
          className="act-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <CheckCircle2 size={16} className="text-green-400" />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
