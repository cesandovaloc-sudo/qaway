import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  CircleHelp,
  Link2,
  MapPin,
  Navigation,
  Video,
  X,
} from 'lucide-react';
import '../reuniones/reuniones.css';
import { EstadoReunionCatalogoSelect } from '../reuniones/EstadoReunionCatalogoSelect';
import { TipoReunionCatalogoSelect } from '../reuniones/TipoReunionCatalogoSelect';

export interface MeetingFormData {
  id?: string;
  title: string;
  project: string;
  owner: string;
  purpose: string;
  modality: 'Google Meet' | 'Presencial';
  region: string;
  site: string;
  address: string;
  travel: number;
  buffer: number;
  meetUrl: string;
  date: string;
  status: string;
  tipoCodigo: string;
  start: string;
  end: string;
  attendees: string[];
  agenda: string;
  notes: string;
}

interface MeetingFormModalProps {
  open: boolean;
  isEdit: boolean;
  initialData: MeetingFormData;
  onClose: () => void;
  onSave: (data: MeetingFormData) => void;
  onNotify?: (msg: string) => void;
}

export default function MeetingFormModal({
  open,
  isEdit,
  initialData,
  onClose,
  onSave,
  onNotify,
}: MeetingFormModalProps) {
  const [form, setForm] = useState<MeetingFormData>(initialData);

  React.useEffect(() => {
    if (open) {
      setForm(initialData);
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleSave = () => {
    if (!form.title.trim() || !form.date) {
      onNotify?.('Completa el título y la fecha de la reunión.');
      return;
    }
    if (form.modality === 'Presencial' && !form.site.trim()) {
      onNotify?.('Indica la sede o institución para la visita presencial.');
      return;
    }
    if (form.end <= form.start) {
      onNotify?.('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="rm-v1" style={{ minHeight: 0, background: 'transparent' }}>
      <div
        className="modal-overlay"
        role="presentation"
        style={{ zIndex: 99995 }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <section className="meeting-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-form-title">
          <div className="modal-header">
            <div>
              <span className="drawer-kicker">REGISTRO OPERATIVO</span>
              <h2 id="meeting-form-title">{isEdit ? 'Editar reunión' : 'Nueva reunión'}</h2>
              <p>Registra la sesión antes de realizarla para centralizar agenda, participantes y seguimiento.</p>
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar formulario">
              <X size={19} />
            </button>
          </div>
          <div className="modal-progress">
            <span />
            <span />
            <span />
          </div>
          <div className="form-body">
            <div className="form-section">
              <div className="form-section-heading">
                <span>01</span>
                <div>
                  <b>Información de la reunión</b>
                  <small>Datos principales y objetivo de la sesión</small>
                </div>
              </div>
              <label className="field full">
                <span>
                  Título de la reunión <i>*</i>
                </span>
                <input
                  autoFocus
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Coordinación de planificación regional"
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Proyecto</span>
                  <input
                    value={form.project || ''}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    placeholder="Nombre del proyecto"
                  />
                </label>
                <label className="field">
                  <span>Responsable</span>
                  <input
                    value={form.owner || ''}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    placeholder="Persona responsable"
                  />
                </label>
              </div>
              <label className="field full">
                <span>Objetivo / motivo</span>
                <textarea
                  rows={2}
                  value={form.purpose || ''}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="¿Qué se busca lograr con la reunión?"
                />
              </label>
            </div>

            <div className="form-section">
              <div className="form-section-heading">
                <span>02</span>
                <div>
                  <b>Modalidad y ubicación</b>
                  <small>Define dónde se realizará la sesión</small>
                </div>
              </div>
              <div className="modality-options">
                <button
                  type="button"
                  className={`modality-option ${form.modality === 'Google Meet' ? 'option-selected' : ''}`}
                  onClick={() =>
                    setForm({ ...form, modality: 'Google Meet', site: 'Reunión virtual', address: '' })
                  }
                >
                  <div className="option-icon virtual">
                    <Video size={19} />
                  </div>
                  <div>
                    <b>Google Meet</b>
                    <small>Reunión virtual existente</small>
                  </div>
                  {form.modality === 'Google Meet' && <CheckCircle2 size={17} />}
                </button>
                <button
                  type="button"
                  className={`modality-option ${form.modality === 'Presencial' ? 'option-selected' : ''}`}
                  onClick={() => setForm({ ...form, modality: 'Presencial', site: form.site || '', meetUrl: '' })}
                >
                  <div className="option-icon inperson">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <b>Presencial</b>
                    <small>Sede o visita territorial</small>
                  </div>
                  {form.modality === 'Presencial' && <CheckCircle2 size={17} />}
                </button>
              </div>
              {form.modality === 'Presencial' ? (
                <>
                  <div className="form-grid">
                    <label className="field">
                      <span>Región</span>
                      <select
                        value={form.region || 'Junín'}
                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                      >
                        <option>Junín</option>
                        <option>Pasco</option>
                        <option>Huancavelica</option>
                        <option>Ayacucho</option>
                        <option>Lima</option>
                        <option>Lima Metropolitana</option>
                        <option>Cusco</option>
                        <option>Arequipa</option>
                        <option>La Libertad</option>
                        <option>Piura</option>
                        <option>Nacional</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>
                        Sede / institución <i>*</i>
                      </span>
                      <input
                        value={form.site || ''}
                        onChange={(e) => setForm({ ...form, site: e.target.value })}
                        placeholder="Ej. Sede Central Huancayo"
                      />
                    </label>
                  </div>
                  <label className="field full">
                    <span>Dirección de la sede</span>
                    <input
                      value={form.address || ''}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Dirección, distrito, referencia"
                    />
                  </label>
                  <div className="form-grid">
                    <label className="field">
                      <span>Traslado previo (min)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.travel ?? 0}
                        onChange={(e) => setForm({ ...form, travel: Number(e.target.value) })}
                      />
                    </label>
                    <label className="field">
                      <span>Margen de preparación (min)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.buffer ?? 0}
                        onChange={(e) => setForm({ ...form, buffer: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="inline-hint">
                    <Navigation size={15} /> Registra una estimación de traslado; no se calcula automáticamente.
                  </div>
                </>
              ) : (
                <label className="field full">
                  <span>Enlace de Google Meet</span>
                  <div className="input-with-icon">
                    <Link2 size={16} />
                    <input
                      value={form.meetUrl || ''}
                      onChange={(e) => setForm({ ...form, meetUrl: e.target.value })}
                      placeholder="https://meet.google.com/…"
                    />
                  </div>
                  <small className="field-help">
                    Pega el enlace de una reunión existente. Este formulario no crea una sala de Meet.
                  </small>
                </label>
              )}
            </div>

            <div className="form-section">
              <div className="form-section-heading">
                <span>03</span>
                <div>
                  <b>Fecha, horario y participantes</b>
                  <small>Organiza el tiempo y las personas convocadas</small>
                </div>
              </div>
              <div className="form-grid">
                <label className="field">
                  <span>
                    Fecha <i>*</i>
                  </span>
                  <input
                    type="date"
                    value={form.date || ''}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>Estado inicial</span>
                  <EstadoReunionCatalogoSelect
                    value={form.status || 'PROGRAMADA'}
                    onChange={(status) => setForm({ ...form, status })}
                  />
                  <small className="field-help">
                    Catálogo gp_estados_reunion_c (Supabase): Programada · En curso · Realizada ·
                    Cancelada · Pospuesta · Reprogramada.
                  </small>
                </label>
                <label className="field">
                  <span>Tipo de reunión</span>
                  <TipoReunionCatalogoSelect
                    value={form.tipoCodigo || ''}
                    onChange={(tipoCodigo) => setForm({ ...form, tipoCodigo })}
                  />
                  <small className="field-help">
                    Catálogo gp_tipos_reunion_c (Supabase, 8 tipos PMI): Reunión de inicio ·
                    Seguimiento · Comité directivo · Planificación · Revisión · Retrospectiva ·
                    Cierre · Diaria.
                  </small>
                </label>
                <label className="field">
                  <span>
                    Hora de inicio <i>*</i>
                  </span>
                  <input
                    type="time"
                    value={form.start || ''}
                    onChange={(e) => setForm({ ...form, start: e.target.value })}
                  />
                </label>
                <label className="field">
                  <span>
                    Hora de fin <i>*</i>
                  </span>
                  <input
                    type="time"
                    value={form.end || ''}
                    onChange={(e) => setForm({ ...form, end: e.target.value })}
                  />
                </label>
              </div>
              <label className="field full">
                <span>
                  Participantes <small>(separa los nombres con comas)</small>
                </span>
                <input
                  value={(form.attendees || []).join(', ')}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      attendees: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Ej. María Rojas, Luis Salazar"
                />
              </label>
              <label className="field full">
                <span>Agenda propuesta</span>
                <textarea
                  rows={3}
                  value={form.agenda || ''}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  placeholder={'Un punto por línea\n1. Revisión de avances\n2. Acuerdos y responsables'}
                />
              </label>
              <label className="field full">
                <span>Notas de preparación</span>
                <textarea
                  rows={2}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Materiales, confirmaciones, contexto…"
                />
              </label>
            </div>

            <div className="privacy-note">
              <CircleHelp size={16} />
              <span>Los datos se guardan en el almacenamiento local de este navegador.</span>
            </div>
          </div>
          <div className="modal-footer">
            <span>
              <i>*</i> Campos obligatorios
            </span>
            <div>
              <button type="button" className="button secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="button primary" onClick={handleSave}>
                <Check size={16} />
                {isEdit ? 'Guardar cambios' : 'Registrar reunión'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
