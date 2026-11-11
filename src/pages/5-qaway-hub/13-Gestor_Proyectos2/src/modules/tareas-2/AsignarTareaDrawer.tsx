import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  X,
  UserCheck,
  User,
  Calendar,
  Link2,
  FileText,
  CheckSquare,
  Bell,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import type { Item } from './Tareas2View';
import { MACROREGIONES, REGIONES_PROYECTO } from './regionalCoordinationModel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onAssign: (newTask: any) => void;
  allSubprocesos?: Item[];
  initialRole?: string | undefined;
}

export default function AsignarTareaDrawer({
  isOpen,
  onClose,
  item,
  onAssign,
  allSubprocesos = [],
  initialRole,
}: Props) {
  if (!isOpen) return null;

  const fallbackItem: Item = {
    id: 'sp-default',
    code: 'SP-01',
    name: 'Planificación de la distribución',
    start: '2026-09-01',
    end: '2026-11-30',
    progress: 0,
    status: 'Pendiente',
    kind: 'subproceso',
    gestor: 'Carlos Sandoval',
    region: 'Nacional',
  };

  const currentItem = item || fallbackItem;
  const itemTitle = `${currentItem.code ? (currentItem.code.endsWith('.') ? currentItem.code : `${currentItem.code} `) : ''}${currentItem.name || ''}`.trim();

  // Estados del formulario
  const [taskTitle, setTaskTitle] = useState('');
  const [assigneeType, setAssigneeType] = useState<'macro' | 'gestor'>(() => (initialRole === 'gestor' ? 'gestor' : 'macro'));
  const [selectedPerson, setSelectedPerson] = useState('');
  const [dueDate, setDueDate] = useState(currentItem.end || '2026-11-30');
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [expectedResult, setExpectedResult] = useState('');

  // Más opciones
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(true);
  const [linkedSubprocesoId, setLinkedSubprocesoId] = useState(currentItem.id);
  const [requireEvidence, setRequireEvidence] = useState(true);
  const [addChecklist, setAddChecklist] = useState(false);
  const [notifyAssignee, setNotifyAssignee] = useState(true);

  // Inicializar campos con datos del item
  useEffect(() => {
    if (currentItem) {
      setTaskTitle(`Elaborar y validar ${currentItem.name.toLowerCase()}`);
      setDueDate(currentItem.end || '2026-11-30');
      setExpectedResult(`${currentItem.name} validado y registrado con la evidencia correspondiente.`);
      setLinkedSubprocesoId(currentItem.id);
      if (initialRole === 'gestor') {
        setAssigneeType('gestor');
        setSelectedPerson(REGIONES_PROYECTO[0]?.coordinadorRegional || 'María Salazar');
      } else {
        setAssigneeType('macro');
        setSelectedPerson(MACROREGIONES[0]?.coordinador || 'Carlos Sandoval');
      }
    }
  }, [currentItem?.id, initialRole]);

  const handleTypeChange = (type: 'macro' | 'gestor') => {
    setAssigneeType(type);
    if (type === 'macro') {
      setSelectedPerson(MACROREGIONES[0]?.coordinador || 'Carlos Sandoval');
    } else {
      setSelectedPerson(REGIONES_PROYECTO[0]?.coordinadorRegional || 'Carlos Sandoval');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedPerson) return;

    const newTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      milestone: itemTitle,
      wbsId: item?.id,
      owner: selectedPerson,
      assignedBy: 'Carlos Sandoval (Coordinador General)',
      due: dueDate,
      status: 'En proceso',
      priority,
      origin: 'Coordinación directa',
      kind: 'Vinculada al cronograma',
      description: expectedResult.trim(),
      requireEvidence,
      notifyAssignee,
      checklist: addChecklist ? [{ text: 'Revisión técnica inicial', done: false }] : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAssign(newTask);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <aside
        style={{
          width: '450px',
          maxWidth: '100vw',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-6px 0 28px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10000,
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del panel */}
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <CalendarDays size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Asignar tarea
              </h2>
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '3px 0 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '300px',
                }}
                title={itemTitle}
              >
                A partir de: <strong style={{ color: '#334155' }}>{itemTitle}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </header>

        {/* Cuerpo del formulario */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Título de la tarea */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Título de la tarea <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ej: Elaborar y validar plan de distribución"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Asignar a */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Asignar a <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('macro')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: assigneeType === 'macro' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: assigneeType === 'macro' ? '#eff6ff' : '#ffffff',
                  color: assigneeType === 'macro' ? '#1d4ed8' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                <UserCheck size={15} />
                <span>Por Nivel / Cargo</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('gestor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: assigneeType === 'gestor' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: assigneeType === 'gestor' ? '#eff6ff' : '#ffffff',
                  color: assigneeType === 'gestor' ? '#1d4ed8' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                <User size={15} />
                <span>Individual</span>
              </button>
            </div>
          </div>

          {/* Responsable */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Responsable <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <select
                required
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                {assigneeType === 'macro'
                  ? MACROREGIONES.map((m) => (
                      <option key={m.id} value={m.coordinador}>
                        {m.coordinador} ({m.name})
                      </option>
                    ))
                  : REGIONES_PROYECTO.map((r) => (
                      <option key={r.name} value={r.coordinadorRegional}>
                        {r.coordinadorRegional} ({r.name} - {r.dre})
                      </option>
                    ))}
              </select>
              <User
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Fecha Límite y Prioridad en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Fecha límite <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '6px',
                }}
              >
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Media</option>
                <option value="Baja">⚪ Baja</option>
              </select>
            </div>
          </div>

          {/* Resultado esperado */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              Resultado esperado
            </label>
            <textarea
              rows={3}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="Describa el entregable técnico o evidencia requerida..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                color: '#0f172a',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Sección colapsable: Más opciones */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '4px 0',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <span>Más opciones</span>
              {moreOptionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {moreOptionsOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                {/* Vincular al subproceso */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: '#475569',
                      fontWeight: 600,
                      marginBottom: '5px',
                    }}
                  >
                    <Link2 size={14} className="text-blue-600" />
                    <span>Vincular al subproceso</span>
                  </label>
                  <select
                    value={linkedSubprocesoId}
                    onChange={(e) => setLinkedSubprocesoId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value={item?.id ?? ''}>{itemTitle}</option>
                    {allSubprocesos
                      .filter((s) => s.id !== item?.id)
                      .slice(0, 10)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code ? `${s.code} ` : ''}{s.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Switch: Solicitar evidencias */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={15} color="#2563eb" />
                    <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: 500 }}>
                      Solicitar evidencias
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireEvidence}
                    onChange={(e) => setRequireEvidence(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                {/* Switch: Agregar checklist */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={15} color="#64748b" />
                    <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: 500 }}>
                      Agregar checklist
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={addChecklist}
                    onChange={(e) => setAddChecklist(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                {/* Switch: Notificar al asignar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={15} color="#2563eb" />
                    <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: 500 }}>
                      Notificar al asignar
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyAssignee}
                    onChange={(e) => setNotifyAssignee(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer de botones */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Check size={16} />
              <span>Asignar tarea</span>
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
