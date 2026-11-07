import React, { useState } from 'react';
import CronogramaGanttView from '../cronograma-gantt/CronogramaGanttView';
import { MINEDU_UNIDADES } from '../../data/mineduUnidades';
import MapaTerritorialView from './MapaTerritorialView';

export default function SedesView({
  activeProject,
  activeProjectId,
  onActions,
}: {
  activeProject?: any;
  activeProjectId?: string;
  onActions?: (h: any) => void;
}) {
  const [view, setView] = useState<'cronograma' | 'mapa'>('cronograma');
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <strong style={{ color: '#0f172a' }}>Unidades de supervisión · MINEDU</strong>
          <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>Catálogo preparado desde REGION_UGEL.xlsx · sin usuarios asignados todavía</div>
        </div>
        <div style={{ color: '#475569', fontSize: 13, whiteSpace: 'nowrap' }}>
          {MINEDU_UNIDADES.length} DRE/UGEL · {new Set(MINEDU_UNIDADES.map((unit) => unit.region)).size} regiones
        </div>
      </div>
      <div className="sedes-module-tabs" role="tablist" aria-label="Vistas de sedes">
        <button type="button" className={view === 'cronograma' ? 'active' : ''} onClick={() => setView('cronograma')}>Cronograma territorial</button>
        <button type="button" className={view === 'mapa' ? 'active' : ''} onClick={() => setView('mapa')}>Mapa territorial</button>
      </div>
      {view === 'cronograma' ? <CronogramaGanttView activeProject={activeProject} perspective="territorial" onActions={onActions} /> : <MapaTerritorialView items={[]} />}
    </>
  );
}
