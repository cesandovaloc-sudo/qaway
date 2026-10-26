// @ts-nocheck
import React, { useMemo, useState } from 'react';
import './actas.css';
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
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
  Users
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
    responsible: 'Prof. Carlos Mendoza (Punto Focal)',
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

export default function ActasAcuerdosView({ onActions }: { onActions?: (h: any) => void }) {
  const [activeTab, setActiveTab] = useState<'acuerdos' | 'generador' | 'historial'>('acuerdos');
  const [agreements, setAgreements] = useState<AgreementItem[]>(INITIAL_AGREEMENTS);
  const [acts, setActs] = useState<ActRecord[]>(INITIAL_ACTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ugelFilter, setUgelFilter] = useState('todas');
  const [notice, setNotice] = useState('');

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
    <div className="act-v1">
      <div className="act-workspace">
        {/* Header */}
        <div className="act-header">
          <div>
            <div className="act-eyebrow">
              <span className="act-eyebrow-line" />
              GESTIÓN DOCUMENTAL Y MONITOREO DE COMPROMISOS
            </div>
            <h1 className="act-title">Actas y Acuerdos Institucionales</h1>
            <p className="act-subtitle">
              Registro formal de reuniones, generación de actas con validez técnica y seguimiento exhaustivo de compromisos por UGEL.
            </p>
          </div>
          <div className="act-header-actions">
            <button className="act-btn-secondary" onClick={() => window.print()}>
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
            <button
              className="act-btn-primary"
              onClick={() => {
                setActiveTab('generador');
                notify('Formulario de nueva acta desplegado');
              }}
            >
              <Plus size={16} />
              <span>Nueva Acta</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Vista */}
        <div className="act-nav-tabs">
          <button
            className={`act-tab-btn ${activeTab === 'acuerdos' ? 'active' : ''}`}
            onClick={() => setActiveTab('acuerdos')}
          >
            <ListChecks size={16} />
            <span>Tablero de Acuerdos ({agreements.length})</span>
          </button>
          <button
            className={`act-tab-btn ${activeTab === 'generador' ? 'active' : ''}`}
            onClick={() => setActiveTab('generador')}
          >
            <FileText size={16} />
            <span>Generador de Acta</span>
          </button>
          <button
            className={`act-tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <History size={16} />
            <span>Historial de Actas ({acts.length})</span>
          </button>
        </div>

        {/* KPIs Flotantes */}
        <div className="act-kpis">
          <div className="act-kpi-card">
            <div className="act-kpi-icon blue">
              <ListChecks size={22} />
            </div>
            <div className="act-kpi-content">
              <div className="act-kpi-val">{kpis.total}</div>
              <div className="act-kpi-label">Compromisos Registrados</div>
            </div>
          </div>
          <div className="act-kpi-card">
            <div className="act-kpi-icon green">
              <CheckCircle2 size={22} />
            </div>
            <div className="act-kpi-content">
              <div className="act-kpi-val">{kpis.cumplidos}</div>
              <div className="act-kpi-label">Compromisos Cumplidos</div>
            </div>
          </div>
          <div className="act-kpi-card">
            <div className="act-kpi-icon amber">
              <Clock size={22} />
            </div>
            <div className="act-kpi-content">
              <div className="act-kpi-val">{kpis.proceso}</div>
              <div className="act-kpi-label">En Proceso / Seguimiento</div>
            </div>
          </div>
          <div className="act-kpi-card">
            <div className="act-kpi-icon rose">
              <AlertCircle size={22} />
            </div>
            <div className="act-kpi-content">
              <div className="act-kpi-val">{kpis.pendientes}</div>
              <div className="act-kpi-label">Pendientes / Alerta Próxima</div>
            </div>
          </div>
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA */}
        {activeTab === 'acuerdos' && (
          <>
            {/* Barra de Filtros */}
            <div className="act-filter-bar">
              <div className="act-search-box">
                <Search size={17} color="#64748b" />
                <input
                  type="text"
                  placeholder="Buscar acuerdo, responsable o UGEL..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="act-filter-group">
                <select
                  className="act-filter-select"
                  value={ugelFilter}
                  onChange={(e) => setUgelFilter(e.target.value)}
                >
                  <option value="todas">Todas las UGEL</option>
                  <option value="UGEL Huancavelica">UGEL Huancavelica</option>
                  <option value="UGEL Maynas">UGEL Maynas</option>
                  <option value="UGEL Satipo">UGEL Satipo</option>
                  <option value="UGEL Cusco">UGEL Cusco</option>
                  <option value="UGEL Tarma">UGEL Tarma</option>
                  <option value="UGEL Condorcanqui">UGEL Condorcanqui</option>
                </select>

                <button
                  className={`act-pill ${statusFilter === 'todos' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('todos')}
                >
                  Todos
                </button>
                <button
                  className={`act-pill ${statusFilter === 'cumplido' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('cumplido')}
                >
                  Cumplidos
                </button>
                <button
                  className={`act-pill ${statusFilter === 'proceso' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('proceso')}
                >
                  En Proceso
                </button>
                <button
                  className={`act-pill ${statusFilter === 'pendiente' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('pendiente')}
                >
                  Pendientes
                </button>
              </div>
            </div>

            {/* Tabla de Acuerdos */}
            <div className="act-table-card">
              <table className="act-table">
                <thead>
                  <tr>
                    <th>Código / Acta</th>
                    <th>UGEL / Ámbito</th>
                    <th>Acuerdo / Compromiso</th>
                    <th>Responsable Acreditado</th>
                    <th>Plazo Límite</th>
                    <th>Estado (Click para cambiar)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgreements.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{item.id}</strong>
                        <small style={{ color: '#64748b' }}>{item.actCode}</small>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{item.ugel}</span>
                      </td>
                      <td style={{ maxWidth: 380, lineHeight: 1.45 }}>{item.description}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={14} color="#64748b" />
                          <span>{item.responsible}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <Calendar size={14} color="#64748b" />
                          <span>{item.deadline}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`act-status-pill ${item.status}`}
                          onClick={() => cycleAgreementStatus(item.id)}
                          title="Click para alternar estado: Cumplido / En Proceso / Pendiente"
                        >
                          {item.status === 'cumplido' && '✓ Cumplido'}
                          {item.status === 'proceso' && '● En Proceso'}
                          {item.status === 'pendiente' && '○ Pendiente'}
                        </span>
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
          </>
        )}

        {/* FORMULARIO GENERADOR DE ACTA */}
        {activeTab === 'generador' && (
          <div className="act-form-container">
            <div>
              {/* Sección 1: Información General */}
              <div className="act-panel">
                <div className="act-panel-head">
                  <div className="act-panel-title">
                    <FileCheck2 size={18} color="#0284c7" />
                    <span>01. Información General del Acta</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Plantilla Institucional MINEDU</span>
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
                    <ListChecks size={18} color="#0284c7" />
                    <span>02. Puntos de Agenda y Compromisos</span>
                  </div>
                </div>
                <div className="act-panel-body">
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 8 }}>
                    Puntos de Agenda
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
                    className="act-btn-secondary"
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
                    className="act-btn-secondary"
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

            {/* Sidebar lateral de Resumen y Acciones */}
            <div className="act-summary-side">
              <div className="act-summary-card">
                <h3 className="act-summary-title">
                  <ShieldCheck size={18} color="#16a34a" />
                  <span>Validación Técnica</span>
                </h3>
                <div className="act-check-item">
                  <span className={`act-check-dot ${form.date ? 'ready' : 'waiting'}`}>✓</span>
                  <span>Fecha registrada</span>
                </div>
                <div className="act-check-item">
                  <span className={`act-check-dot ${form.ugel ? 'ready' : 'waiting'}`}>✓</span>
                  <span>UGEL identificada</span>
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
                  <button className="act-btn-primary" style={{ width: '100%' }} onClick={handleExportDoc}>
                    <Download size={16} />
                    <span>Descargar Acta (.txt)</span>
                  </button>
                  <button className="act-btn-secondary" style={{ width: '100%' }} onClick={() => window.print()}>
                    <Printer size={16} />
                    <span>Imprimir Vista Oficial</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL DE ACTAS */}
        {activeTab === 'historial' && (
          <div className="act-table-card">
            <table className="act-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Instancia / UGEL</th>
                  <th>Tipo de Actividad</th>
                  <th>Modalidad</th>
                  <th>Acuerdos</th>
                  <th>Estado Documental</th>
                </tr>
              </thead>
              <tbody>
                {acts.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <strong style={{ color: '#0284c7' }}>{act.code}</strong>
                    </td>
                    <td>{act.date}</td>
                    <td>
                      <strong>{act.ugel}</strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{act.dre}</div>
                    </td>
                    <td>{act.activity}</td>
                    <td>
                      <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: 4 }}>
                        {act.modality}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{act.agreementsCount} acuerdos</strong>
                    </td>
                    <td>
                      <span className="act-status-pill cumplido">✓ {act.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Toast */}
        {notice && (
          <div className="act-toast">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
