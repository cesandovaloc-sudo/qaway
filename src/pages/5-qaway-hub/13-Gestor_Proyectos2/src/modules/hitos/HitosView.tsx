// @ts-nocheck
import React, { useMemo, useState } from 'react';
import './hitos.css';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileCheck,
  FileText,
  Filter,
  Flag,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';

interface OperationalTask {
  id: string;
  title: string;
  hitoId: string;
  gestor: string;
  phone: string;
  email: string;
  ugel: string;
  dueDate: string;
  status: 'done' | 'in_progress' | 'todo';
  priority: 'URGENTE' | 'ALTA' | 'MEDIA';
  isBlocked?: boolean;
  blockReason?: string;
}

interface HitoRector {
  id: string;
  code: string;
  title: string;
  subproceso: string;
  dueDate: string;
  deliverable: string;
  conformityRequired: boolean;
  status: 'cumple' | 'proceso' | 'riesgo' | 'programado';
  progress: number;
  totalUgels: number;
  completedUgels: number;
}

const OFFICIAL_HITOS: HitoRector[] = [
  {
    id: 'h1',
    code: 'H1',
    title: 'Comunicación de Directorio de Almacenes',
    subproceso: '2.2',
    dueDate: '11/09/2026',
    deliverable: 'Oficio con directorio, características y responsables a materialesdigere@minedu.gob.pe',
    conformityRequired: true,
    status: 'cumple',
    progress: 100,
    totalUgels: 220,
    completedUgels: 220,
  },
  {
    id: 'h2',
    code: 'H2',
    title: 'Solicitud de Ajustes de Códigos Modulares en MC SIGA',
    subproceso: '1.5',
    dueDate: '14/09/2026',
    deliverable: 'Oficio titular UGEL + Informe técnico + Formato Excel sustentatorio',
    conformityRequired: true,
    status: 'cumple',
    progress: 100,
    totalUgels: 220,
    completedUgels: 220,
  },
  {
    id: 'h3',
    code: 'H3',
    title: 'Conformación del Comité de Distribución en las UGEL',
    subproceso: '1.2',
    dueDate: '25/09/2026',
    deliverable: 'Resolución Directoral de conformación del comité y designación de punto focal',
    conformityRequired: true,
    status: 'proceso',
    progress: 84,
    totalUgels: 220,
    completedUgels: 185,
  },
  {
    id: 'h4',
    code: 'H4',
    title: 'Aprobación del Plan de Distribución Local y Monitoreo',
    subproceso: '1.3 - 1.4',
    dueDate: '25/09/2026',
    deliverable: 'Resolución Directoral que aprueba el Plan de Distribución Local (cronograma y rutas)',
    conformityRequired: true,
    status: 'proceso',
    progress: 78,
    totalUgels: 220,
    completedUgels: 172,
  },
  {
    id: 'h5',
    code: 'H5',
    title: 'Elaboración y Validación del Cuadro de Distribución Local (CDL)',
    subproceso: '1.6',
    dueDate: '22/10/2026',
    deliverable: 'Registro y validación completa del CDL en el aplicativo MC SIGA',
    conformityRequired: true,
    status: 'riesgo',
    progress: 62,
    totalUgels: 220,
    completedUgels: 136,
  },
  {
    id: 'h6',
    code: 'H6',
    title: 'Oficio de Requerimiento de Personal de Apoyo Vacacional',
    subproceso: '5.1',
    dueDate: '30/10/2026',
    deliverable: 'Oficio múltiple de la UGEL a directores de II.EE. solicitando terna de 3 personas',
    conformityRequired: false,
    status: 'proceso',
    progress: 45,
    totalUgels: 220,
    completedUgels: 99,
  },
  {
    id: 'h7',
    code: 'H7',
    title: 'Culminación de Actuaciones Preparatorias para Transporte',
    subproceso: '4.1',
    dueDate: '30/11/2026',
    deliverable: 'Expediente de contratación aprobado y bases para proceso de selección',
    conformityRequired: true,
    status: 'programado',
    progress: 30,
    totalUgels: 220,
    completedUgels: 66,
  },
  {
    id: 'h8',
    code: 'H8',
    title: 'Reconocimiento de Personas de Apoyo a COGECO (Vacaciones)',
    subproceso: '5.2',
    dueDate: '18/12/2026',
    deliverable: 'Resolución Directoral que aprueba padrón de apoyo para recepción en II.EE.',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
  {
    id: 'h9',
    code: 'H9',
    title: 'Adjudicación y Contrato del Servicio de Distribución (Transporte)',
    subproceso: '4.2 - 4.3',
    dueDate: '05/02/2027',
    deliverable: 'Contrato suscrito de transporte a II.EE. y registrado en MC SIGA (plazo 15/02/2027)',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
  {
    id: 'h10',
    code: 'H10',
    title: 'Registro de Asignación y Recepción en Módulo SIAGIE ME (BIAE)',
    subproceso: '9.2 - 9.4',
    dueDate: '30/04/2027',
    deliverable: '100% de actas PECOSA registradas en la plataforma SIAGIE Materiales Educativos',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
];

const OPERATIONAL_TASKS: OperationalTask[] = [
  {
    id: 'TSK-M01',
    title: 'Consolidar padrón de miembros del comité UGEL Huancavelica vía Excel',
    hitoId: 'h3',
    gestor: 'Carlos Mendoza (Monitor Sierra Centro)',
    phone: '+51987654321',
    email: 'cmendoza@minedu.gob.pe',
    ugel: 'UGEL Huancavelica',
    dueDate: '20/09/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
  {
    id: 'TSK-M02',
    title: 'Emitir alerta por retraso en firma de RD de comité en UGEL Maynas',
    hitoId: 'h3',
    gestor: 'Lucía Ramos (Monitor Loreto)',
    phone: '+51976543210',
    email: 'lramos@minedu.gob.pe',
    ugel: 'UGEL Maynas',
    dueDate: '22/09/2026',
    status: 'todo',
    priority: 'URGENTE',
    isBlocked: true,
    blockReason: 'Paro fluvial dificulta comunicación con director de UGEL',
  },
  {
    id: 'TSK-M03',
    title: 'Validar consistencia de Excel de códigos modulares de UGEL 03 Lima',
    hitoId: 'h2',
    gestor: 'Roberto Farfán (Especialista SIGA Lima)',
    phone: '+51965432109',
    email: 'rfarfan@minedu.gob.pe',
    ugel: 'UGEL 03 Lima Metropolitana',
    dueDate: '12/09/2026',
    status: 'done',
    priority: 'MEDIA',
  },
  {
    id: 'TSK-M04',
    title: 'Asistencia técnica virtual a estadísticos UGEL Cusco sobre aplicativo MC SIGA',
    hitoId: 'h5',
    gestor: 'Ana Paola Quispe (Capacitadora UAD)',
    phone: '+51954321098',
    email: 'aquispe@minedu.gob.pe',
    ugel: 'UGEL Cusco',
    dueDate: '15/10/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
  {
    id: 'TSK-M05',
    title: 'Revisar Términos de Referencia de transporte para ruta fluvial UGEL Condorcanqui',
    hitoId: 'h7',
    gestor: 'Javier Ruiz (Especialista en Contrataciones)',
    phone: '+51943210987',
    email: 'jruiz@minedu.gob.pe',
    ugel: 'UGEL Condorcanqui',
    dueDate: '20/11/2026',
    status: 'todo',
    priority: 'URGENTE',
  },
  {
    id: 'TSK-M06',
    title: 'Comprobar recepción de directorio de almacén UGEL Satipo con personal acreditado',
    hitoId: 'h1',
    gestor: 'Carlos Mendoza (Monitor Sierra Centro)',
    phone: '+51987654321',
    email: 'cmendoza@minedu.gob.pe',
    ugel: 'UGEL Satipo',
    dueDate: '10/09/2026',
    status: 'done',
    priority: 'MEDIA',
  },
  {
    id: 'TSK-M07',
    title: 'Revisión y visado del plan de contingencia de transporte fluvial UGEL Nauta',
    hitoId: 'h4',
    gestor: 'Lucía Ramos (Monitor Loreto)',
    phone: '+51976543210',
    email: 'lramos@minedu.gob.pe',
    ugel: 'UGEL Nauta',
    dueDate: '24/09/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
];

export default function HitosView({ onActions }: { onActions?: (h: any) => void }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [openHitos, setOpenHitos] = useState<Record<string, boolean>>({
    h3: true,
    h5: true,
  });
  const [notice, setNotice] = useState<string>('');

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const toggleHito = (id: string) => {
    setOpenHitos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredHitos = useMemo(() => {
    return OFFICIAL_HITOS.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.code.toLowerCase().includes(search.toLowerCase()) ||
        h.subproceso.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'todos' || h.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [search, filterStatus]);

  const kpis = useMemo(() => {
    const total = OFFICIAL_HITOS.length;
    const cumplidos = OFFICIAL_HITOS.filter((h) => h.status === 'cumple').length;
    const riesgo = OFFICIAL_HITOS.filter((h) => h.status === 'riesgo').length;
    const proceso = OFFICIAL_HITOS.filter((h) => h.status === 'proceso').length;
    const programado = OFFICIAL_HITOS.filter((h) => h.status === 'programado').length;
    return { total, cumplidos, riesgo, proceso, programado };
  }, []);

  const getHitoTasks = (hitoId: string) => {
    return OPERATIONAL_TASKS.filter((t) => t.hitoId === hitoId);
  };

  const buildWhatsAppLink = (task: OperationalTask) => {
    const cleanPhone = task.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Estimado ${task.gestor}, recordatorio MINEDU-DIGERE sobre ${task.ugel}: La tarea "${task.title}" vence el ${task.dueDate}. Favor remitir estado urgente.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const exportCSV = () => {
    const headers = ['Código', 'Hito Rector', 'Subproceso', 'Fecha Límite', 'Estado', 'Avance UGEL', 'Conformidad', 'Entregable Oficial'];
    const rows = OFFICIAL_HITOS.map((h) => [
      `"${h.code}"`,
      `"${h.title}"`,
      `"${h.subproceso}"`,
      `"${h.dueDate}"`,
      `"${h.status}"`,
      `"${h.progress}% (${h.completedUgels}/${h.totalUgels})"`,
      `"${h.conformityRequired ? 'Requerida' : 'No requerida'}"`,
      `"${h.deliverable.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hitos_Rectores_MINEDU_Dotacion_2027_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Matriz de Hitos exportada correctamente a formato CSV institucional');
  };

  return (
    <div className="hit-v1">
      <div className="hit-workspace">
        {/* Cabecera del Módulo */}
        <div className="hit-header">
          <div>
            <div className="hit-eyebrow">
              <span className="hit-eyebrow-line" />
              OFICIO MÚLTIPLE N.º 00032-2026-MINEDU/VMGP-DIGERE
            </div>
            <h1 className="hit-title">Hitos Rectores y Matriz Contractual</h1>
            <p className="hit-subtitle">
              Monitoreo nacional de cumplimiento por hito normativo, validación documental y tareas operativas de gestores territoriales.
            </p>
          </div>
          <div className="hit-header-actions">
            <button className="hit-btn-secondary" onClick={exportCSV}>
              <Download size={16} />
              <span>Exportar Matriz</span>
            </button>
            <button className="hit-btn-primary" onClick={() => notify('Sincronización con MC SIGA completada con éxito')}>
              <RefreshCw size={16} />
              <span>Actualizar SIGA</span>
            </button>
          </div>
        </div>

        {/* Tarjetas KPI Flotantes (Power BI / Trello) */}
        <div className="hit-kpis">
          <div className="hit-kpi-card">
            <div className="hit-kpi-icon blue">
              <Flag size={22} />
            </div>
            <div className="hit-kpi-content">
              <div className="hit-kpi-val">{kpis.total}</div>
              <div className="hit-kpi-label">Hitos Rectores Oficiales</div>
            </div>
          </div>
          <div className="hit-kpi-card">
            <div className="hit-kpi-icon green">
              <CheckCircle2 size={22} />
            </div>
            <div className="hit-kpi-content">
              <div className="hit-kpi-val">{kpis.cumplidos}</div>
              <div className="hit-kpi-label">Conformidad 100% Alcanzada</div>
            </div>
          </div>
          <div className="hit-kpi-card">
            <div className="hit-kpi-icon amber">
              <AlertTriangle size={22} />
            </div>
            <div className="hit-kpi-content">
              <div className="hit-kpi-val">{kpis.riesgo + kpis.proceso}</div>
              <div className="hit-kpi-label">En Curso y Alerta Preventiva</div>
            </div>
          </div>
          <div className="hit-kpi-card">
            <div className="hit-kpi-icon slate">
              <Clock size={22} />
            </div>
            <div className="hit-kpi-content">
              <div className="hit-kpi-val">{kpis.programado}</div>
              <div className="hit-kpi-label">Hitos Programados (2026-2027)</div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="hit-filter-bar">
          <div className="hit-search-box">
            <Search size={17} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar por nombre, código de hito (ej. H3) o subproceso..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="hit-filter-pills">
            <button
              className={`hit-pill ${filterStatus === 'todos' ? 'active' : ''}`}
              onClick={() => setFilterStatus('todos')}
            >
              Todos ({OFFICIAL_HITOS.length})
            </button>
            <button
              className={`hit-pill ${filterStatus === 'cumple' ? 'active' : ''}`}
              onClick={() => setFilterStatus('cumple')}
            >
              Cumplidos ({kpis.cumplidos})
            </button>
            <button
              className={`hit-pill ${filterStatus === 'proceso' ? 'active' : ''}`}
              onClick={() => setFilterStatus('proceso')}
            >
              En Proceso ({kpis.proceso})
            </button>
            <button
              className={`hit-pill ${filterStatus === 'riesgo' ? 'active' : ''}`}
              onClick={() => setFilterStatus('riesgo')}
            >
              En Riesgo ({kpis.riesgo})
            </button>
            <button
              className={`hit-pill ${filterStatus === 'programado' ? 'active' : ''}`}
              onClick={() => setFilterStatus('programado')}
            >
              Programados ({kpis.programado})
            </button>
          </div>
        </div>

        {/* Lista de Hitos (Acordeón con Tareas Operativas) */}
        <div className="hit-list">
          {filteredHitos.map((hito) => {
            const isOpen = !!openHitos[hito.id];
            const tasks = getHitoTasks(hito.id);

            const getFillClass = () => {
              if (hito.status === 'cumple') return 'green';
              if (hito.status === 'riesgo') return 'red';
              if (hito.status === 'proceso') return 'amber';
              return 'slate';
            };

            const getStatusBadge = () => {
              switch (hito.status) {
                case 'cumple':
                  return <span className="hit-status-badge cumple">✓ Cumple (100%)</span>;
                case 'riesgo':
                  return <span className="hit-status-badge riesgo">⚠ En riesgo ({hito.progress}%)</span>;
                case 'proceso':
                  return <span className="hit-status-badge proceso">● En proceso ({hito.progress}%)</span>;
                default:
                  return <span className="hit-status-badge programado">○ Programado</span>;
              }
            };

            return (
              <div key={hito.id} className={`hit-card ${isOpen ? 'open' : ''}`}>
                <div className="hit-row-head" onClick={() => toggleHito(hito.id)}>
                  <div className="hit-code-badge">{hito.code}</div>
                  <div className="hit-info-main">
                    <div className="hit-info-top">
                      <span className="hit-name">{hito.title}</span>
                      <span className="hit-subproc">Subproceso {hito.subproceso}</span>
                      {hito.conformityRequired ? (
                        <span className="hit-conformity-tag">
                          <ShieldCheck size={12} /> Conformidad Requerida
                        </span>
                      ) : (
                        <span className="hit-conformity-tag no-req">Informativo</span>
                      )}
                    </div>
                  </div>

                  <div className="hit-due-box">
                    <Calendar size={15} />
                    <span>Límite: {hito.dueDate}</span>
                  </div>

                  <div className="hit-progress-box">
                    <div className="hit-progress-labels">
                      <span>Avance Nacional</span>
                      <span>{hito.completedUgels}/{hito.totalUgels} UGEL</span>
                    </div>
                    <div className="hit-progress-track">
                      <div
                        className={`hit-progress-fill ${getFillClass()}`}
                        style={{ width: `${hito.progress}%` }}
                      />
                    </div>
                  </div>

                  <div>{getStatusBadge()}</div>

                  <ChevronDown size={19} className={`hit-chevron ${isOpen ? 'open' : ''}`} />
                </div>

                {isOpen && (
                  <div className="hit-body">
                    {/* Entregable Oficial */}
                    <div className="hit-deliverable-box">
                      <div className="hit-deliverable-title">
                        <FileText size={14} />
                        Entregable Oficial y Sustento Normativo Requerido
                      </div>
                      <p className="hit-deliverable-text">{hito.deliverable}</p>
                    </div>

                    {/* Tareas Operativas del Hito */}
                    <div className="hit-tasks-header">
                      <div className="hit-tasks-title">
                        <Users size={16} />
                        <span>Tareas Operativas y Micro-Gestión de Gestores</span>
                        <span className="hit-tasks-count">{tasks.length} vinculadas</span>
                      </div>
                      <button
                        className="hit-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => notify(`Añadir tarea vinculada a ${hito.code}`)}
                      >
                        + Vincular Tarea
                      </button>
                    </div>

                    {tasks.length > 0 ? (
                      <div className="hit-tasks-grid">
                        {tasks.map((task) => (
                          <div key={task.id} className={`hit-task-card ${task.isBlocked ? 'blocked' : ''}`}>
                            <div className="hit-task-top">
                              <span className="hit-task-id">{task.id}</span>
                              <span className={`hit-priority-tag ${task.priority}`}>{task.priority}</span>
                            </div>

                            <div className="hit-task-title">{task.title}</div>

                            {task.isBlocked && (
                              <div className="hit-task-blocked-msg">
                                <ShieldAlert size={14} />
                                <span>Bloqueo: {task.blockReason}</span>
                              </div>
                            )}

                            <div className="hit-task-meta">
                              <div className="hit-task-meta-row">
                                <strong>Ámbito / UGEL:</strong>
                                <span>{task.ugel}</span>
                              </div>
                              <div className="hit-task-meta-row">
                                <strong>Gestor:</strong>
                                <span>{task.gestor}</span>
                              </div>
                              <div className="hit-task-meta-row">
                                <strong>Seguimiento:</strong>
                                <span>{task.dueDate}</span>
                              </div>
                            </div>

                            <div className="hit-task-actions">
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: task.status === 'done' ? '#16a34a' : task.status === 'in_progress' ? '#0284c7' : '#e11d48',
                                }}
                              >
                                {task.status === 'done'
                                  ? '✓ Completada'
                                  : task.status === 'in_progress'
                                  ? '● En progreso'
                                  : '○ Pendiente'}
                              </span>

                              <a
                                href={buildWhatsAppLink(task)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hit-wa-btn"
                                title="Enviar recordatorio inteligente por WhatsApp en 1 clic"
                              >
                                <MessageCircle size={14} />
                                <span>WhatsApp 1-Clic</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="hit-empty-tasks">
                        No hay tareas operativas en curso vinculadas directamente a este hito rector.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {notice && (
          <div className="hit-toast">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
