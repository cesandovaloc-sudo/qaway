import React, { useMemo, useState } from 'react';
import {
  CircleAlert,
  Navigation,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import type { Item, Status } from './Reuniones2View';

export interface VisitDraft {
  id?: string;
  name: string;
  site: string;
  region: string;
  address: string;
  date: string;
  startTime: string;
  endTime: string;
  travel: number;
  buffer: number;
  status: Status;
}

interface ItinerarioViewProps {
  items: Item[];
  formatDatePE: (iso: string) => string;
  onSaveVisit: (draft: VisitDraft, editingId: string | null) => void;
  onNotify?: (msg: string) => void;
}

const calcDurationMin = (start?: string, end?: string): number => {
  if (!start || !end || !start.includes(':') || !end.includes(':')) return 60;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh! * 60 + em!) - (sh! * 60 + sm!);
  return diff > 0 ? diff : 60;
};

const getStatusBadgeStyle = (status: Status) => {
  if (status === 'Completado' || status === 'Cumple') {
    return { bg: '#ecfdf5', color: '#047857', dot: '#10b981' };
  }
  if (status === 'En proceso' || status === 'En curso') {
    return { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' };
  }
  if (status === 'Con retraso') {
    return { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' };
  }
  return { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' };
};

export default function ItinerarioView({
  items,
  formatDatePE,
  onSaveVisit,
  onNotify,
}: ItinerarioViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VisitDraft>({
    name: '',
    site: 'Sede Huancayo',
    region: 'Junín',
    address: '',
    date: '2026-10-26',
    startTime: '09:00',
    endTime: '10:00',
    travel: 30,
    buffer: 15,
    status: 'Pendiente',
  });

  const visits = useMemo(() => {
    return items
      .filter((it) => (it as any).modality === 'Presencial')
      .slice()
      .sort((a, b) => {
        const dA = (a.start || '').slice(0, 10);
        const dB = (b.start || '').slice(0, 10);
        if (dA !== dB) return dA.localeCompare(dB);
        const tA = (a as any).meetingTime || '09:00';
        const tB = (b as any).meetingTime || '09:00';
        return tA.localeCompare(tB);
      });
  }, [items]);

  const totalTravel = useMemo(
    () => visits.reduce((acc, v) => acc + (Number((v as any).travel) || 0), 0),
    [visits]
  );

  const totalBuffer = useMemo(
    () => visits.reduce((acc, v) => acc + (Number((v as any).buffer) || 15), 0),
    [visits]
  );

  const firstTime = visits.length > 0 ? ((visits[0] as any).meetingTime || '09:00') : '—';

  const openCreateVisit = () => {
    setEditingId(null);
    setForm({
      name: '',
      site: 'Sede Huancayo',
      region: 'Junín',
      address: '',
      date: '2026-10-26',
      startTime: '09:00',
      endTime: '10:00',
      travel: 30,
      buffer: 15,
      status: 'Pendiente',
    });
    setModalOpen(true);
  };

  const openEditVisit = (it: Item) => {
    setEditingId(it.id);
    setForm({
      id: it.id,
      name: it.name,
      site: (it as any).site || `Sede ${it.region || 'Junín'}`,
      region: it.region || 'Junín',
      address: (it as any).address || '',
      date: (it.start || '2026-10-26').slice(0, 10),
      startTime: (it as any).meetingTime || '09:00',
      endTime: (it as any).meetingEndTime || '10:00',
      travel: Number((it as any).travel) || 30,
      buffer: Number((it as any).buffer) || 15,
      status: it.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date) {
      onNotify?.('Completa el título y la fecha de la visita');
      return;
    }
    if (form.endTime <= form.startTime) {
      onNotify?.('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }
    onSaveVisit({ ...form, name: form.name.trim() }, editingId);
    setModalOpen(false);
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '18px 22px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
            Plan de visitas presenciales
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
            Ordena la jornada, revisa tiempos estimados y deja margen entre sedes.
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={openCreateVisit}
          style={{ height: '36px', padding: '0 14px', fontSize: '12.5px' }}
        >
          <Plus size={15} />
          <span>Añadir visita</span>
        </button>
      </div>

      {/* 4 Tarjetas KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '12px',
          padding: '0 22px 18px',
        }}
      >
        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
            Visitas en lista
          </span>
          <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{visits.length}</b>
        </div>
        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
            Traslado estimado acumulado
          </span>
          <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            {totalTravel} <small style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>min</small>
          </b>
        </div>
        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
            Margen de preparación
          </span>
          <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            {totalBuffer} <small style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>min</small>
          </b>
        </div>
        <div style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '10px', padding: '14px 16px' }}>
          <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginBottom: '6px' }}>
            Primera visita
          </span>
          <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{firstTime}</b>
        </div>
      </div>

      {/* Tabla de visitas presenciales */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '11px 22px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Orden / visita
              </th>
              <th style={{ padding: '11px 14px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Fecha
              </th>
              <th style={{ padding: '11px 14px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Horario
              </th>
              <th style={{ padding: '11px 14px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Traslado previo
              </th>
              <th style={{ padding: '11px 14px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Margen
              </th>
              <th style={{ padding: '11px 14px', fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>
                Estado
              </th>
              <th style={{ padding: '11px 22px', width: '52px' }} />
            </tr>
          </thead>
          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px 22px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No hay visitas presenciales registradas aún. Haz clic en <strong>+ Añadir visita</strong> para planificar tu itinerario.
                </td>
              </tr>
            ) : (
              visits.map((v, idx) => {
                const startT = (v as any).meetingTime || '09:00';
                const endT = (v as any).meetingEndTime || '10:00';
                const dur = calcDurationMin(startT, endT);
                const travelMin = Number((v as any).travel) || 0;
                const bufferMin = Number((v as any).buffer) || 15;
                const siteLabel = (v as any).site || `Sede ${v.region || 'Junín'}`;
                const badge = getStatusBadgeStyle(v.status);

                return (
                  <tr
                    key={v.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => openEditVisit(v)}
                  >
                    <td style={{ padding: '14px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '7px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 800,
                            fontSize: '12px',
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <b style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {siteLabel}
                          </b>
                          <small style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {v.name}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12.5px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {formatDatePE(v.start)}
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <b style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                        {startT}–{endT}
                      </b>
                      <small style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {dur} min de reunión
                      </small>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Navigation size={13} color="#d97706" />
                        {travelMin > 0 ? `${travelMin} min` : 'No definido'}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {bufferMin} min
                    </td>
                    <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: badge.dot }} />
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 22px', textAlign: 'right' }}>
                      <button
                        type="button"
                        aria-label="Editar visita"
                        title="Editar visita presencial"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditVisit(v);
                        }}
                        style={{
                          border: 0,
                          background: 'transparent',
                          color: '#64748b',
                          width: '30px',
                          height: '30px',
                          borderRadius: '7px',
                          display: 'inline-grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Banner inferior de validación */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          margin: '18px 22px',
          padding: '13px 16px',
          border: '1px solid #f0dfb8',
          borderRadius: '9px',
          background: '#fffaf0',
          color: '#956c22',
        }}
      >
        <CircleAlert size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <b style={{ display: 'block', fontSize: '12px', marginBottom: '3px' }}>Validación antes de salir</b>
          <span style={{ display: 'block', fontSize: '11.5px', lineHeight: 1.5, color: '#8a7b5f' }}>
            Los tiempos de traslado son estimaciones manuales. Confirma las condiciones de ruta, disponibilidad del equipo y dirección exacta antes de aprobar el itinerario.
          </span>
        </div>
      </div>

      {/* Pop-up Modal del Lápiz / Añadir Visita */}
      {modalOpen && (
        <div className="r2-modal-overlay" onMouseDown={() => setModalOpen(false)}>
          <div className="r2-day-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="r2-day-modal-head">
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
                  ITINERARIO TERRITORIAL
                </span>
                <h3>{editingId ? 'Editar visita presencial' : 'Nueva visita presencial'}</h3>
              </div>
              <button
                type="button"
                className="cal-minical-nav"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>
            <form className="r2-day-modal-body" onSubmit={handleSubmit}>
              <div className="r2-quick-field">
                <label>Título de la reunión / visita *</label>
                <input
                  type="text"
                  placeholder="Ej. Revisión de avances con equipo territorial"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  autoFocus
                />
              </div>

              <div className="r2-quick-grid-2">
                <div className="r2-quick-field">
                  <label>Sede / Lugar</label>
                  <input
                    type="text"
                    placeholder="Ej. Sede Huancayo"
                    value={form.site}
                    onChange={(e) => setForm((p) => ({ ...p, site: e.target.value }))}
                  />
                </div>
                <div className="r2-quick-field">
                  <label>Región</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm((p) => ({ ...p, region: e.target.value }))}
                  >
                    <option value="Junín">Junín</option>
                    <option value="Pasco">Pasco</option>
                    <option value="Huancavelica">Huancavelica</option>
                    <option value="Ayacucho">Ayacucho</option>
                    <option value="Todas las Regiones">Todas las Regiones</option>
                  </select>
                </div>
              </div>

              <div className="r2-quick-grid-2">
                <div className="r2-quick-field">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="r2-quick-field">
                  <label>Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Status }))}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="En curso">En curso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>

              <div className="r2-quick-grid-2">
                <div className="r2-quick-field">
                  <label>Hora inicio</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  />
                </div>
                <div className="r2-quick-field">
                  <label>Hora fin</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="r2-quick-grid-2">
                <div className="r2-quick-field">
                  <label>Traslado previo (min)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={form.travel}
                    onChange={(e) => setForm((p) => ({ ...p, travel: Number(e.target.value) }))}
                  />
                </div>
                <div className="r2-quick-field">
                  <label>Margen de preparación (min)</label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={form.buffer}
                    onChange={(e) => setForm((p) => ({ ...p, buffer: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="r2-quick-footer">
                <button type="button" className="r2-btn-cancel" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="r2-btn-save">
                  {editingId ? 'Guardar visita' : 'Añadir visita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
