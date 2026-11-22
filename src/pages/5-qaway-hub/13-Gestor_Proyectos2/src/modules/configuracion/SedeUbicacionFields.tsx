import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { PAISES } from '@/config/paises';
import SelectEstilizado from './SelectEstilizado';
import {
  buscarDireccionesNominatim,
  datosDistritoPeru,
  datosPorUbigeoPeru,
  esPaisPeru,
  geocodificarInversaNominatim,
  obtenerDepartamentosPeru,
  obtenerDistritosPeru,
  obtenerProvinciasPeru,
  resolverUbicacionDesdeAddress,
  type NominatimSugerencia,
} from './ubicacionGeoHelper';

export interface DatosUbicacionSede {
  nombre: string;
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  direccion: string;
  referencia: string;
  latitud: string;
  longitud: string;
}

interface MapaUbicacionProps {
  latitud: string;
  longitud: string;
  onCambio: (latitud: string, longitud: string) => void;
}

const MapaUbicacion: React.FC<MapaUbicacionProps> = ({ latitud, longitud, onCambio }) => {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<any>(null);
  const marcadorRef = useRef<any>(null);
  const onCambioRef = useRef(onCambio);
  onCambioRef.current = onCambio;

  useEffect(() => {
    let cancelado = false;

    void (async () => {
      const L = (await import('leaflet')).default;
      const el = contenedorRef.current;
      if (cancelado || !el || mapaRef.current) return;

      const lat = Number(latitud);
      const lng = Number(longitud);
      const tieneCoords = latitud.trim() !== '' && longitud.trim() !== '' && Number.isFinite(lat) && Number.isFinite(lng);
      const centro: [number, number] = tieneCoords ? [lat, lng] : [-12.0464, -77.0428];

      const mapa = L.map(el, { scrollWheelZoom: false }).setView(centro, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(mapa);

      const icono = L.divIcon({
        className: 'gp-mapa-pin',
        html: '<span style="display:block;width:14px;height:14px;background:#2563eb;border:3px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marcador = L.marker(centro, { icon: icono, draggable: true }).addTo(mapa);

      marcador.on('dragend', () => {
        const p = marcador.getLatLng();
        onCambioRef.current(p.lat.toFixed(6), p.lng.toFixed(6));
      });
      mapa.on('click', (ev: any) => {
        marcador.setLatLng(ev.latlng);
        onCambioRef.current(ev.latlng.lat.toFixed(6), ev.latlng.lng.toFixed(6));
      });

      mapaRef.current = mapa;
      marcadorRef.current = marcador;
      requestAnimationFrame(() => mapa.invalidateSize());
    })();

    return () => {
      cancelado = true;
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
        marcadorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    const marcador = marcadorRef.current;
    if (!mapa || !marcador || latitud.trim() === '' || longitud.trim() === '') return;
    const lat = Number(latitud);
    const lng = Number(longitud);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    marcador.setLatLng([lat, lng]);
    mapa.panTo([lat, lng]);
  }, [latitud, longitud]);

  return <div ref={contenedorRef} style={{ height: 210, width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }} aria-label="Mapa de ubicación" />;
};

interface SedeUbicacionFieldsProps {
  valor: DatosUbicacionSede;
  onChange: (patch: Partial<DatosUbicacionSede>) => void;
  placeholderNombre?: string;
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '13.5px',
  width: '100%',
  backgroundColor: '#ffffff',
  color: '#0f172a',
};

export const SedeUbicacionFields: React.FC<SedeUbicacionFieldsProps> = ({ valor, onChange, placeholderNombre }) => {
  const [sugerencias, setSugerencias] = useState<NominatimSugerencia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [resolviendoMapa, setResolviendoMapa] = useState(false);
  const [enfocado, setEnfocado] = useState(false);
  const ultimaSeleccionRef = useRef('');
  const blurTimerRef = useRef<number | null>(null);
  const reversaTimerRef = useRef<number | null>(null);
  const reversaAbortRef = useRef<AbortController | null>(null);

  const paisEfectivo = valor.pais.trim() || 'Perú';
  const enPeru = esPaisPeru(paisEfectivo);

  const opcionesPais = useMemo(
    () => PAISES.map((p: any) => ({ value: p.nombre, label: p.nombre })),
    [],
  );

  const opcionesDepto = useMemo(
    () => (enPeru ? obtenerDepartamentosPeru().map((d) => ({ value: d.name, label: d.name })) : []),
    [enPeru],
  );

  const opcionesProv = useMemo(
    () => (enPeru && valor.departamento ? obtenerProvinciasPeru(valor.departamento).map((p) => ({ value: p.name, label: p.name })) : []),
    [enPeru, valor.departamento],
  );

  const opcionesDist = useMemo(
    () => (enPeru && valor.departamento && valor.provincia
      ? obtenerDistritosPeru(valor.departamento, valor.provincia).map((d) => ({ value: d.name, label: d.name }))
      : []),
    [enPeru, valor.departamento, valor.provincia],
  );

  useEffect(() => () => {
    if (blurTimerRef.current) window.clearTimeout(blurTimerRef.current);
    if (reversaTimerRef.current) window.clearTimeout(reversaTimerRef.current);
    reversaAbortRef.current?.abort();
  }, []);

  // Autocompletado de dirección contextualizado al país y división elegida
  useEffect(() => {
    const q = valor.direccion.trim();
    if (!enfocado || q.length < 4 || q === ultimaSeleccionRef.current) {
      setSugerencias([]);
      setBuscando(false);
      return;
    }

    const controlador = new AbortController();
    const temporizador = window.setTimeout(async () => {
      setBuscando(true);
      try {
        const contexto = [valor.distrito, valor.provincia, valor.departamento]
          .filter((x) => x && !q.toLowerCase().includes(x.toLowerCase()))
          .join(', ');
        const datos = await buscarDireccionesNominatim(q, {
          pais: paisEfectivo,
          contexto: contexto || undefined,
          signal: controlador.signal,
        });
        if (!controlador.signal.aborted) setSugerencias(datos);
      } catch {
        if (!controlador.signal.aborted) setSugerencias([]);
      } finally {
        if (!controlador.signal.aborted) setBuscando(false);
      }
    }, 650);

    return () => {
      controlador.abort();
      window.clearTimeout(temporizador);
    };
  }, [valor.direccion, valor.distrito, valor.provincia, valor.departamento, paisEfectivo, enfocado]);

  const aplicarSugerencia = (s: NominatimSugerencia) => {
    const resuelto = resolverUbicacionDesdeAddress(s.address, paisEfectivo);
    ultimaSeleccionRef.current = s.display_name;
    onChange({
      direccion: s.display_name,
      latitud: Number(s.lat).toFixed(6),
      longitud: Number(s.lon).toFixed(6),
      pais: resuelto.pais || paisEfectivo,
      departamento: resuelto.departamento ?? valor.departamento,
      provincia: resuelto.provincia ?? valor.provincia,
      distrito: resuelto.distrito ?? valor.distrito,
      ubigeo: resuelto.ubigeo ?? valor.ubigeo,
    });
    setSugerencias([]);
    setBuscando(false);
  };

  const resolverPuntoMapa = (latitud: string, longitud: string) => {
    onChange({ latitud, longitud });
    if (reversaTimerRef.current) window.clearTimeout(reversaTimerRef.current);
    reversaAbortRef.current?.abort();

    reversaTimerRef.current = window.setTimeout(async () => {
      const ctrl = new AbortController();
      reversaAbortRef.current = ctrl;
      setResolviendoMapa(true);
      try {
        const res = await geocodificarInversaNominatim(latitud, longitud, ctrl.signal);
        if (!ctrl.signal.aborted && res) {
          const resuelto = resolverUbicacionDesdeAddress(res.address, paisEfectivo);
          ultimaSeleccionRef.current = res.display_name;
          onChange({
            latitud,
            longitud,
            direccion: res.display_name,
            pais: resuelto.pais || paisEfectivo,
            departamento: resuelto.departamento ?? valor.departamento,
            provincia: resuelto.provincia ?? valor.provincia,
            distrito: resuelto.distrito ?? valor.distrito,
            ubigeo: resuelto.ubigeo ?? valor.ubigeo,
          });
        }
      } catch {
        // Silencioso si fue abortado o falló la red
      } finally {
        if (!ctrl.signal.aborted) setResolviendoMapa(false);
      }
    }, 450);
  };

  const usarMiUbicacion = () => {
    if (!navigator.geolocation) return;
    setResolviendoMapa(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolverPuntoMapa(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
      },
      () => {
        setResolviendoMapa(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Fila 1: Nombre de la sede + País */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={valor.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder={placeholderNombre || 'Nombre de la sede'}
          style={{ ...inputStyle, flex: 2, minWidth: '180px', width: 'auto' }}
        />
        <div style={{ flex: 1, minWidth: '150px' }}>
          <SelectEstilizado
            value={paisEfectivo}
            placeholder="País"
            options={opcionesPais}
            onChange={(nuevoPais) => {
              onChange({
                pais: nuevoPais,
                departamento: '',
                provincia: '',
                distrito: '',
                ubigeo: '',
              });
              setSugerencias([]);
            }}
          />
        </div>
      </div>

      {/* Fila 2 y 3: Jerarquía vinculada (Perú INEI) o texto adaptable (otros países) */}
      {enPeru ? (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <SelectEstilizado
                value={valor.departamento}
                placeholder="Departamento"
                options={opcionesDepto}
                onChange={(depto) => {
                  onChange({
                    pais: 'Perú',
                    departamento: depto,
                    provincia: '',
                    distrito: '',
                    ubigeo: '',
                  });
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <SelectEstilizado
                value={valor.provincia}
                placeholder="Provincia"
                options={opcionesProv}
                disabled={!valor.departamento}
                onChange={(prov) => {
                  onChange({
                    provincia: prov,
                    distrito: '',
                    ubigeo: '',
                  });
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <SelectEstilizado
                value={valor.distrito}
                placeholder="Distrito"
                options={opcionesDist}
                disabled={!valor.provincia}
                onChange={(dist) => {
                  const info = datosDistritoPeru(valor.departamento, valor.provincia, dist);
                  onChange({
                    distrito: dist,
                    ubigeo: info?.ubigeo || '',
                    ...(info && !valor.direccion.trim()
                      ? { latitud: info.lat.toFixed(6), longitud: info.lng.toFixed(6) }
                      : {}),
                  });
                }}
              />
            </div>
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              value={valor.ubigeo}
              onChange={(e) => {
                const limpio = e.target.value.replace(/\D/g, '').slice(0, 6);
                const info = datosPorUbigeoPeru(limpio);
                if (info) {
                  onChange({
                    pais: 'Perú',
                    ubigeo: info.ubigeo,
                    departamento: info.department,
                    provincia: info.province,
                    distrito: info.district,
                    ...(!valor.direccion.trim()
                      ? { latitud: info.lat.toFixed(6), longitud: info.lng.toFixed(6) }
                      : {}),
                  });
                } else {
                  onChange({ ubigeo: limpio });
                }
              }}
              placeholder="Ubigeo (6 dígitos)"
              style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
            />
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={valor.departamento}
              onChange={(e) => onChange({ departamento: e.target.value })}
              placeholder="Departamento / Estado"
              style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
            />
            <input
              type="text"
              value={valor.provincia}
              onChange={(e) => onChange({ provincia: e.target.value })}
              placeholder="Provincia / Ciudad"
              style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={valor.distrito}
              onChange={(e) => onChange({ distrito: e.target.value })}
              placeholder="Distrito / Localidad"
              style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
            />
            <input
              type="text"
              value={valor.ubigeo}
              onChange={(e) => onChange({ ubigeo: e.target.value })}
              placeholder="Código Postal"
              style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
            />
          </div>
        </>
      )}

      {/* Fila 4: Dirección con autocompletado */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={valor.direccion}
          onChange={(e) => {
            ultimaSeleccionRef.current = '';
            onChange({ direccion: e.target.value });
          }}
          onFocus={() => setEnfocado(true)}
          onBlur={() => {
            setEnfocado(false);
            blurTimerRef.current = window.setTimeout(() => setSugerencias([]), 150);
          }}
          placeholder="Escribe la dirección exacta (ej. Av. Arequipa 1230)"
          style={inputStyle}
        />
        {(sugerencias.length > 0 || buscando) && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: 200,
            overflowY: 'auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
          }}>
            {buscando && (
              <div style={{ padding: '8px 10px', fontSize: '12.5px', color: '#64748b' }}>Buscando direcciones...</div>
            )}
            {sugerencias.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => aplicarSugerencia(s)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  borderTop: '1px solid #f1f5f9',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                }}
              >
                {s.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="text"
        value={valor.referencia}
        onChange={(e) => onChange({ referencia: e.target.value })}
        placeholder="Referencia (ej. frente al parque, piso 3)"
        style={inputStyle}
      />

      {/* Fila 5: Barra de mapa + Mapa interactivo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {resolviendoMapa ? 'Obteniendo dirección del punto...' : 'Haz clic o arrastra el marcador en el mapa para actualizar la dirección.'}
        </span>
        <button
          type="button"
          onClick={usarMiUbicacion}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <LocateFixed size={13} />
          <span>Usar mi ubicación</span>
        </button>
      </div>

      <MapaUbicacion
        latitud={valor.latitud}
        longitud={valor.longitud}
        onCambio={resolverPuntoMapa}
      />

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          inputMode="decimal"
          value={valor.latitud}
          onChange={(e) => onChange({ latitud: e.target.value })}
          placeholder="Latitud"
          style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
        />
        <input
          type="text"
          inputMode="decimal"
          value={valor.longitud}
          onChange={(e) => onChange({ longitud: e.target.value })}
          placeholder="Longitud"
          style={{ ...inputStyle, flex: 1, minWidth: '120px', width: 'auto' }}
        />
      </div>
    </div>
  );
};
