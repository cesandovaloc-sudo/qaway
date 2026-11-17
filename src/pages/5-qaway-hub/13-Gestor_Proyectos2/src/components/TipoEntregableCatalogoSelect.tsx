/**
 * TipoEntregableCatalogoSelect.tsx — Catálogos 7 y 7.1
 * ====================================================
 * Selector jerárquico de TIPO DE ENTREGABLE alimentado en vivo por:
 *   · gp_categorias_entregable_c (Tabla 7.1 · 24 categorías, GEN primero)
 *   · gp_tipos_entregable_c (Tabla 7 · 261 tipos vinculados por categoria_codigo)
 *
 * Comportamiento ergonómico:
 *   1. La categoría "Generales y gestión cotidiana" (GEN) aparece primero y
 *      expandida por defecto.
 *   2. Las 23 categorías restantes aparecen debajo colapsadas por defecto,
 *      como acordeones desplegables con su ícono y contador.
 *   3. Incluye filtro rápido para ubicar cualquier tipo al instante.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  Database,
  DraftingCompass,
  FileCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Handshake,
  HardHat,
  ListChecks,
  Megaphone,
  MessagesSquare,
  MonitorCog,
  Package,
  Scale,
  Search,
  SearchCheck,
  ShieldCheck,
  ShoppingCart,
  Target,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import {
  listarCategoriasEntregableGestor,
  listarTiposEntregableGestor,
  type ValorCatalogo,
} from '../services/gpCatalogosService';

const ICONOS_CATEGORIA: Record<string, LucideIcon> = {
  'folder-open': FolderOpen,
  'briefcase-business': BriefcaseBusiness,
  'search-check': SearchCheck,
  'list-checks': ListChecks,
  'drafting-compass': DraftingCompass,
  scale: Scale,
  'shopping-cart': ShoppingCart,
  'hard-hat': HardHat,
  'monitor-cog': MonitorCog,
  'badge-check': BadgeCheck,
  'shield-check': ShieldCheck,
  wallet: Wallet,
  'graduation-cap': GraduationCap,
  workflow: Workflow,
  'chart-no-axes-combined': ChartNoAxesCombined,
  'file-check': FileCheck,
  megaphone: Megaphone,
  target: Target,
  handshake: Handshake,
  'messages-square': MessagesSquare,
  users: Users,
  'calendar-days': CalendarDays,
  package: Package,
  database: Database,
};

export interface TipoEntregableSeleccionado {
  codigo: string;
  nombre: string;
  categoriaCodigo: string | null;
}

export interface Props {
  value?: string;
  onChange: (seleccion: TipoEntregableSeleccionado | null) => void;
  disabled?: boolean;
}

export function TipoEntregableCatalogoSelect({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categorias, setCategorias] = useState<ValorCatalogo[]>([]);
  const [tipos, setTipos] = useState<ValorCatalogo[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<'cargando' | 'lista' | 'error'>('cargando');
  const [expandidas, setExpandidas] = useState<Set<string>>(() => new Set(['GEN']));
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vigente = true;
    Promise.all([listarCategoriasEntregableGestor(), listarTiposEntregableGestor()])
      .then(([resCats, resTipos]) => {
        if (!vigente) return;
        if (resCats.estado === 'lista' && resTipos.estado === 'lista') {
          setCategorias(resCats.valores);
          setTipos(resTipos.valores);
          setEstadoCarga('lista');
        } else {
          setEstadoCarga('error');
        }
      })
      .catch(() => {
        if (vigente) setEstadoCarga('error');
      });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const onDocClick = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [abierto]);

  const tipoActual = useMemo(
    () => (value ? tipos.find((t) => t.codigo === value) || null : null),
    [tipos, value]
  );

  const grupos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const porCat = new Map<string, ValorCatalogo[]>();

    for (const t of tipos) {
      const cat = t.categoriaCodigo || 'GEN';
      if (q) {
        const texto = `${t.alias || t.nombre} ${t.codigo}`.toLowerCase();
        if (!texto.includes(q)) continue;
      }
      const lista = porCat.get(cat) || [];
      lista.push(t);
      porCat.set(cat, lista);
    }

    const catsOrdenadas = [...categorias].sort((a, b) => {
      if (a.codigo === 'GEN') return -1;
      if (b.codigo === 'GEN') return 1;
      return (a.orden ?? 999) - (b.orden ?? 999);
    });

    return catsOrdenadas
      .map((cat) => ({
        categoria: cat,
        items: porCat.get(cat.codigo) || [],
      }))
      .filter((g) => g.items.length > 0);
  }, [categorias, tipos, busqueda]);

  const toggleCategoria = (codigo: string) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const etiquetaBoton = tipoActual
    ? tipoActual.alias || tipoActual.nombre
    : estadoCarga === 'cargando'
    ? 'Cargando catálogo de entregables...'
    : estadoCarga === 'error'
    ? 'Catálogo no disponible'
    : 'Tipo de entregable (opcional · 261 tipos)';

  return (
    <div ref={contenedorRef} className="filter-dropdown-wrap" style={{ position: 'relative', marginBottom: '8px' }}>
      <button
        type="button"
        disabled={disabled || estadoCarga === 'error'}
        className={`filter-card-btn ${abierto ? 'active' : ''}`}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          background: '#ffffff',
          height: '34px',
          fontSize: '12px',
          padding: '0 10px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          color: tipoActual ? '#0f172a' : '#64748b',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setAbierto((v) => !v);
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {etiquetaBoton}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: abierto ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
            color: '#64748b',
            flexShrink: 0,
            marginLeft: 6,
          }}
        />
      </button>

      {abierto && estadoCarga === 'lista' && (
        <div
          className="filter-card-popover"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: '4px',
            maxHeight: '320px',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
            padding: '8px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              marginBottom: '6px',
            }}
          >
            <Search size={13} color="#64748b" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar entregable (ej. Acta, Informe, Plan...)"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                width: '100%',
                color: '#0f172a',
              }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {value && (
              <button
                type="button"
                className="filter-item-btn"
                style={{ width: '100%', textAlign: 'left', fontSize: '11.5px', color: '#64748b', marginBottom: '4px' }}
                onClick={() => {
                  onChange(null);
                  setAbierto(false);
                }}
              >
                Limpiar tipo seleccionado
              </button>
            )}

            {grupos.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                Sin coincidencias para "{busqueda}"
              </div>
            )}

            {grupos.map(({ categoria, items }) => {
              const IconoCat = (categoria.icono && ICONOS_CATEGORIA[categoria.icono]) || FileText;
              const estaAbierta = busqueda.trim().length > 0 || expandidas.has(categoria.codigo);

              return (
                <div key={categoria.codigo} style={{ marginBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => toggleCategoria(categoria.codigo)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: categoria.codigo === 'GEN' ? '#eff6ff' : '#f8fafc',
                      color: categoria.codigo === 'GEN' ? '#1e40af' : '#334155',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      {estaAbierta ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <IconoCat size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {categoria.alias || categoria.nombre}
                      </span>
                    </span>
                    <span style={{ fontSize: '10.5px', opacity: 0.75, marginLeft: 6, flexShrink: 0 }}>
                      {items.length}
                    </span>
                  </button>

                  {estaAbierta && (
                    <div style={{ paddingLeft: '14px', marginTop: '2px' }}>
                      {items.map((tipo) => {
                        const seleccionado = value === tipo.codigo;
                        return (
                          <button
                            key={tipo.codigo}
                            type="button"
                            className={`filter-item-btn ${seleccionado ? 'selected' : ''}`}
                            onClick={() => {
                              onChange({
                                codigo: tipo.codigo,
                                nombre: tipo.alias || tipo.nombre,
                                categoriaCodigo: tipo.categoriaCodigo || null,
                              });
                              setAbierto(false);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              padding: '5px 8px',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tipo.alias || tipo.nombre}
                            </span>
                            {seleccionado && <Check size={13} style={{ color: '#0284c7', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TipoEntregableCatalogoSelect;
