import React, { useState } from 'react';
import {
  X,
  Check,
  CheckSquare,
  Video,
  FileText,
  Headphones,
  ClipboardCheck,
  Layers,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import type { Item } from './Tareas2View';
import type { DeliverableType } from '../../shared/deliverableTypes';

export type TaskNature = 'Tarea EDT' | 'Tarea Operativa';
export type { DeliverableType };

interface TareaNuevaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nueva: {
    title: string;
    taskNature: TaskNature;
    parentId?: string;
    deliverable: string;
    deliverableType: DeliverableType;
    owner: string;
    end: string;
    priority: 'Alta' | 'Media' | 'Baja';
    description?: string;
  }) => void;
  componentesEdt?: Item[];
  gestoresDisponibles?: string[];
}

const DELIVERABLE_TYPES: Array<{
  id: DeliverableType;
  label: string;
  icon: typeof Video;
  color: string;
  bg: string;
  border: string;
  placeholder: string;
}> = [
  {
    id: 'Videoconferencia',
    label: 'Videoconferencia',
    icon: Video,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    placeholder: 'Ej. Grabación de sesión, enlace Meet y acta de acuerdos',
  },
  {
    id: 'Documento',
    label: 'Documento / Informe',
    icon: FileText,
    color: '#0284c7',
    bg: '#eff6ff',
    border: '#bfdbfe',
    placeholder: 'Ej. Informe técnico de avance, oficio o resolución aprobada',
  },
  {
    id: 'Asistencia técnica',
    label: 'Asistencia técnica',
    icon: Headphones,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    placeholder: 'Ej. Taller de capacitación, inducción o soporte directo a sede',
  },
  {
    id: 'Acta/Registro',
    label: 'Acta / Registro',
    icon: ClipboardCheck,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    placeholder: 'Ej. Padrón validado, checklist de verificación o acta de entrega',
  },
];

export default function TareaNuevaModal({
  isOpen,
  onClose,
  onSave,
  componentesEdt = [],
  gestoresDisponibles = [
    'Carlos Sandoval',
    'María Salazar',
    'Javier Ruiz',
    'Juan Pérez',
    'Ana Beltrán',
    'Lucía Flores',
    'Carlos Mendoza',
  ],
}: TareaNuevaModalProps) {
  const [taskNature, setTaskNature] = useState<TaskNature>('Tarea EDT');
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState<string>(() => componentesEdt[0]?.id || '');
  const [deliverableType, setDeliverableType] = useState<DeliverableType>('Documento');
  const [deliverable, setDeliverable] = useState('');
  const [owner, setOwner] = useState(gestoresDisponibles[0] || 'Carlos Sandoval');
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const currentDelivConfig = DELIVERABLE_TYPES.find((d) => d.id === deliverableType) || DELIVERABLE_TYPES[1]!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      taskNature,
      ...(taskNature === 'Tarea EDT' && parentId ? { parentId } : {}),
      deliverable: deliverable.trim() || currentDelivConfig.label,
      deliverableType,
      owner: owner.trim() || 'Sin asignar',
      end: endDate,
      priority,
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInPop 0.2s ease-out',
        }}
      >
        {/* Cabecera oficial del pop-up */}
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
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              <CheckSquare size={18} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Crear Nueva Tarea
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                Asigna una tarea operativa o vinculada a la EDT del proyecto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '6px',
            }}
            title="Cerrar ventana"
          >
            <X size={17} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Bloque 1: Selector de Naturaleza (Solo las 2 opciones oficiales) */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Tipo de Tarea *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Opción 1: Tarea EDT */}
              <button
                type="button"
                onClick={() => setTaskNature('Tarea EDT')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: taskNature === 'Tarea EDT' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: taskNature === 'Tarea EDT' ? '#eff6ff' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '6px',
                    background: taskNature === 'Tarea EDT' ? '#2563eb' : '#f1f5f9',
                    color: taskNature === 'Tarea EDT' ? '#ffffff' : '#64748b',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Layers size={13} />
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: taskNature === 'Tarea EDT' ? '#1d4ed8' : '#1e293b' }}>
                    Tarea EDT
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px', lineHeight: 1.3 }}>
                    Vinculada formalmente a la estructura EDT del cronograma.
                  </div>
                </div>
              </button>

              {/* Opción 2: Tarea Operativa */}
              <button
                type="button"
                onClick={() => setTaskNature('Tarea Operativa')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: taskNature === 'Tarea Operativa' ? '2px solid #475569' : '1px solid #e2e8f0',
                  background: taskNature === 'Tarea Operativa' ? '#f8fafc' : '#ffffff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '6px',
                    background: taskNature === 'Tarea Operativa' ? '#475569' : '#f1f5f9',
                    color: taskNature === 'Tarea Operativa' ? '#ffffff' : '#64748b',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <CheckSquare size={13} />
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: taskNature === 'Tarea Operativa' ? '#0f172a' : '#1e293b' }}>
                    Tarea Operativa
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px', lineHeight: 1.3 }}>
                    Labor de control, soporte o rutina independiente (no altera la EDT).
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bloque 2: Vinculación con Componente EDT (Solo si es Tarea EDT) */}
          {taskNature === 'Tarea EDT' ? (
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Componente EDT Asociado *
              </label>
              <select
                required
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              >
                {componentesEdt.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
              <AlertCircle size={14} color="#64748b" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                Esta tarea se registrará como actividad operativa independiente sin vincularse a la EDT del proyecto.
              </span>
            </div>
          )}

          {/* Bloque 3: Título / Nombre de la Tarea */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Nombre de la Tarea / Qué se ha pedido *
            </label>
            <input
              required
              type="text"
              placeholder={taskNature === 'Tarea EDT' ? 'Ej. Videoconferencia de coordinación de cronograma' : 'Ej. Elaborar matriz operativa de control de incidencias'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Bloque 4: Formato del Entregable (4 Tipos con Iconos Lucide) */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Formato del Entregable *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {DELIVERABLE_TYPES.map((dt) => {
                const IconComp = dt.icon;
                const isSelected = deliverableType === dt.id;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDeliverableType(dt.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? `2px solid ${dt.color}` : '1px solid #e2e8f0',
                      background: isSelected ? dt.bg : '#ffffff',
                      color: isSelected ? dt.color : '#334155',
                      fontSize: '12px',
                      fontWeight: isSelected ? 650 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      textAlign: 'left',
                    }}
                  >
                    <IconComp size={14} style={{ color: dt.color, flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bloque 5: Descripción del Entregable Específico */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Producto o Evidencia Verificable Esperada *
            </label>
            <input
              required
              type="text"
              placeholder={currentDelivConfig.placeholder}
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12.5px',
                color: '#0f172a',
              }}
            />
          </div>

          {/* Bloque 6: Responsable y Fecha Límite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                <User size={13} color="#0284c7" />
                <span>Responsable Asignado *</span>
              </label>
              <select
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  background: '#ffffff',
                }}
              >
                {gestoresDisponibles.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                <Calendar size={13} color="#0284c7" />
                <span>Fecha Límite (Fin) *</span>
              </label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* Bloque 7: Prioridad */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Nivel de Prioridad
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Alta', 'Media', 'Baja'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    height: '32px',
                    borderRadius: '6px',
                    border: priority === p ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: priority === p ? '#eff6ff' : '#ffffff',
                    color: priority === p ? '#1d4ed8' : '#475569',
                    fontSize: '12px',
                    fontWeight: priority === p ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Botones de acción del pie */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '36px',
                padding: '0 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                height: '36px',
                padding: '0 20px',
                background: '#2563eb',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 650,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Check size={15} />
              <span>Crear Tarea</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
