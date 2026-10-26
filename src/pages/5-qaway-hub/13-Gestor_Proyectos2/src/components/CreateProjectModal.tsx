// @ts-nocheck
import React, { useState } from 'react';
import { Building2, Calendar, Check, FolderKanban, Layers, MapPin, UserCheck, X } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: {
    id: string;
    code: string;
    name: string;
    region: string;
    entidad: string;
    metodologia: string;
  }) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [code, setCode] = useState('PRJ-REG-2027-02');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Selva Central (Junín - Pasco)');
  const [entidad, setEntidad] = useState('MINEDU - DIGERE');
  const [metodologia, setMetodologia] = useState('Híbrido: Hitos Rectores + Tareas Ágiles');
  const [responsable, setResponsable] = useState('Carlos Mendoza (Coordinador General)');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-06-30');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      id: 'proj-' + Date.now(),
      code: code.trim(),
      name: name.trim(),
      region,
      entidad,
      metodologia,
    });
    setName('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 'min(580px, 100%)',
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Crear Nuevo Proyecto Regional
              </h2>
              <small style={{ fontSize: '12px', color: '#64748b' }}>
                Exclusivo de Coordinación General · Gobernanza Institucional
              </small>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Código Oficial
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Nombre del Proyecto *
              <input
                required
                autoFocus
                placeholder="Ej. Dotación de Materiales Educativos Selva Central 2027"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Región / Ámbito
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Entidad Rectora
              <input
                type="text"
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Metodología de Monitoreo
              <select
                value={metodologia}
                onChange={(e) => setMetodologia(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                <option>Híbrido: Hitos Rectores + Tareas Ágiles</option>
                <option>Hitos Contractuales Estrictos (MINEDU)</option>
                <option>Gestión Territorial por Indicador de Cumplimiento</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Fecha Inicio Planificada
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Fecha Fin Planificada
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              />
            </label>
          </div>

          <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', marginBottom: '20px' }}>
            ℹ️ El proyecto creado se activará en tu panel de Coordinador con su propio cronograma Gantt y quedará listo para asignarle gestores territoriales.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '9px 18px',
                border: 'none',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Check size={16} />
              <span>Crear Proyecto Regional</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
