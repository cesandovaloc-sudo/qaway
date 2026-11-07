import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPinned, RefreshCw } from 'lucide-react';
import { MINEDU_UNIDADES } from '../../data/mineduUnidades';

type Status = 'Cumple' | 'En proceso' | 'No cumple';

const REGION_COORDS: Record<string, [number, number]> = {
  AMAZONAS: [-5.0, -78.0], ANCASH: [-9.4, -77.5], 'APURÍMAC': [-14.0, -73.0], AREQUIPA: [-16.4, -71.5],
  AYACUCHO: [-13.2, -74.2], CAJAMARCA: [-7.2, -78.5], CALLAO: [-12.05, -77.13], CUSCO: [-13.52, -71.97],
  HUANCAVELICA: [-12.8, -74.9], 'HUÁNUCO': [-9.9, -76.2], ICA: [-14.1, -75.7], 'JUNÍN': [-11.5, -75.0],
  'LA LIBERTAD': [-8.1, -78.9], LAMBAYEQUE: [-6.7, -79.9], 'LIMA METROPOLITANA': [-12.05, -77.04],
  'LIMA PROVINCIAS': [-11.8, -76.8], LORETO: [-3.75, -73.25], 'MADRE DE DIOS': [-12.6, -69.2],
  MOQUEGUA: [-17.2, -70.9], PASCO: [-10.7, -76.3], PIURA: [-5.2, -80.6], PUNO: [-15.5, -70.1],
  'SAN MARTÍN': [-6.5, -76.4], TACNA: [-18.0, -70.25], TUMBES: [-3.6, -80.45], UCAYALI: [-8.4, -74.6],
};

const key = (value: string | undefined) => String(value || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export default function MapaTerritorialView({ items }: { items: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const [region, setRegion] = useState('Todas');
  const [status, setStatus] = useState<'Todos' | Status>('Todos');
  const [refresh, setRefresh] = useState(0);

  const rows = useMemo(() => MINEDU_UNIDADES.map((unit) => {
    const related = items.filter((item) => {
      const unitName = key(unit.name);
      return key(item.sede) === unitName || key(item.distrito) === unitName || key(item.name).includes(unitName);
    });
    const progress = related.length ? Math.round(related.reduce((sum, item) => sum + Number(item.progress || 0), 0) / related.length) : 0;
    const state: Status = progress >= 80 ? 'Cumple' : progress > 0 ? 'En proceso' : 'No cumple';
    return { ...unit, progress, state, coords: REGION_COORDS[key(unit.region)] || [-9.2, -75.0] as [number, number] };
  }), [items]);

  const visible = rows.filter((row) => (region === 'Todas' || key(row.region) === key(region)) && (status === 'Todos' || row.state === status));

  useEffect(() => {
    let disposed = false;
    void import('leaflet').then(({ default: L }) => {
      if (disposed || !mapRef.current) return;
      leafletRef.current?.remove();
      const map = L.map(mapRef.current, { scrollWheelZoom: true, zoomControl: true }).setView([-9.2, -75], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      visible.forEach((row) => {
        const jitter = ((row.id?.charCodeAt?.(0) || 0) % 9 - 4) * 0.035;
        const color = row.state === 'Cumple' ? '#16a36a' : row.state === 'En proceso' ? '#e9aa2b' : '#df3f48';
        const icon = L.divIcon({ className: 'ugel-map-marker', html: `<span style="background:${color}"></span>`, iconSize: [18, 18], iconAnchor: [9, 9] });
        L.marker([row.coords[0] + jitter, row.coords[1] + jitter], { icon })
          .addTo(map)
          .bindPopup(`<strong>${row.name}</strong><br/>${row.region}<br/><b>${row.state}</b> · ${row.progress}%`);
      });
      leafletRef.current = map;
    });
    return () => { disposed = true; leafletRef.current?.remove(); leafletRef.current = null; };
  }, [visible, refresh]);

  const counts = rows.reduce((acc, row) => { acc[row.state] += 1; return acc; }, { Cumple: 0, 'En proceso': 0, 'No cumple': 0 } as Record<Status, number>);
  const regions = Array.from(new Set(MINEDU_UNIDADES.map((unit) => unit.region))).sort((a, b) => a.localeCompare(b, 'es'));

  return <section className="territory-map-view">
    <div className="territory-map-head">
      <div><div className="territory-map-kicker"><MapPinned size={14} /> VISTA TERRITORIAL</div><h2>Mapa de cumplimiento por UGEL</h2><p>Consulta la ubicación operativa y el avance registrado en el cronograma.</p></div>
      <button className="territory-map-refresh" type="button" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={15} /> Actualizar mapa</button>
    </div>
    <div className="territory-map-filters"><label>Región<select value={region} onChange={(event) => setRegion(event.target.value)}><option>Todas</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></label><label>Estado<select value={status} onChange={(event) => setStatus(event.target.value as 'Todos' | Status)}><option>Todos</option><option>Cumple</option><option>En proceso</option><option>No cumple</option></select></label></div>
    <div className="territory-map-summary"><span><i className="map-dot green" /> Cumple <b>{counts.Cumple}</b></span><span><i className="map-dot amber" /> En proceso <b>{counts['En proceso']}</b></span><span><i className="map-dot red" /> No cumple <b>{counts['No cumple']}</b></span><small>{visible.length} UGEL visibles</small></div>
    <div ref={mapRef} className="territory-map-canvas" aria-label="Mapa interactivo de UGEL" />
    <p className="territory-map-note">La vista utiliza ubicaciones regionales operativas. Los límites territoriales detallados se incorporarán cuando se valide el GeoJSON oficial de UGEL.</p>
  </section>;
}
