import React, { useState, useEffect, useMemo } from 'react';
import { Building, Building2, Check, CheckCircle2, ChevronDown, ChevronRight, CornerDownRight, Globe2, Landmark, Layers, MapPin, Pencil, Plus, Search, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { construirBorradoresPlantilla, type GestorUnitBorrador, type PlantillaSector } from '../../services/organizacionPlantillas';
import { crearEstructuraDesdePlantilla } from '../../services/organizacionEscritura';
import { calcularNumeracion } from '../../services/organizacionJerarquia';
import { aNodosJerarquia, fallbackInsercionDesde, listarUnidadesParaJerarquia } from '../../services/organizacionJerarquiaLectura';
import SelectEstilizado from './SelectEstilizado';
import { SedeUbicacionFields, type DatosUbicacionSede } from './SedeUbicacionFields';

interface SedeRow {
  id: string;
  nombre: string;
  tipo_codigo: string | null;
  es_principal: boolean;
  sede_padre_id: string | null;
  pais: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  ubigeo: string | null;
  direccion: string | null;
  referencia_ubicacion: string | null;
  latitud: number | string | null;
  longitud: number | string | null;
}

interface UnidadRow {
  id: string;
  codigo_jerarquico: string | null;
  nombre_estandar: string;
  alias: string | null;
  nivel: number;
  ruta?: string;
}

interface ConfigGestionRow {
  id: string;
  unidad_responsable_id: string | null;
  alcance_asignacion_tareas: 'ninguna' | 'autorizadas' | 'todas';
  puede_dar_seguimiento: boolean;
  puede_programar_reuniones: boolean;
  puede_gestionar_participantes: boolean;
  puede_solicitar_informacion: boolean;
  activo: boolean;
  metadata: Record<string, unknown> | null;
}

type ModoSedes = '' | 'una' | 'varias' | 'sin_sede';

export const OrganizacionTab: React.FC<{ onSedePrincipalStatusChange?: (falta: boolean) => void }> = ({
  onSedePrincipalStatusChange,
}) => {
  const { perfil } = usePerfilGp();
  const [sector, setSector] = useState<PlantillaSector>('publico');
  const [unidades, setUnidades] = useState<UnidadRow[]>([]);
  const [sedes, setSedes] = useState<SedeRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasDraft, setAliasDraft] = useState<string>('');
  const [arbolExpandido, setArbolExpandido] = useState<boolean>(false);
  const [editandoSector, setEditandoSector] = useState<boolean>(false);
  const [editandoSedes, setEditandoSedes] = useState<boolean>(false);
  const [editandoGobernanza, setEditandoGobernanza] = useState<boolean>(false);

  const [sedeCentral, setSedeCentral] = useState<DatosUbicacionSede>({
    nombre: 'Sede Principal',
    pais: 'Perú',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    ubigeo: '',
    direccion: '',
    referencia: '',
    latitud: '',
    longitud: '',
  });
  const [cantidadSedes, setCantidadSedes] = useState('1');
  const [cantidadGuardada, setCantidadGuardada] = useState<number | null>(null);
  const [registrandoExternas, setRegistrandoExternas] = useState(false);
  const [externas, setExternas] = useState<DatosUbicacionSede[]>([]);
  const [sucursalActivaIdx, setSucursalActivaIdx] = useState(0);
  // Sólo "central + externas": el mapa se pliega al guardar la principal y el
  // aviso de registro de externas se puede dejar para después.
  const [mapaSedeCentralAbierto, setMapaSedeCentralAbierto] = useState(false);
  const [omitirRegistroExternas, setOmitirRegistroExternas] = useState(false);
  const [sedeExternaEditId, setSedeExternaEditId] = useState<string | null>(null);
  const [sedeExternaDraft, setSedeExternaDraft] = useState<DatosUbicacionSede | null>(null);
  const [sedesAbiertas, setSedesAbiertas] = useState<Record<string, boolean>>({});
  const [editandoPaso4, setEditandoPaso4] = useState<boolean>(false);
  const [filtroSedeTexto, setFiltroSedeTexto] = useState('');
  const [filtroSedeDepto, setFiltroSedeDepto] = useState('');
  const [filtroSedeDistrito, setFiltroSedeDistrito] = useState('');
  const [limiteSedesVisibles, setLimiteSedesVisibles] = useState(8);

  // Pasos 4 y 5: gobernanza de la gestion de proyectos (tabla ya existente).
  const [configGestion, setConfigGestion] = useState<ConfigGestionRow | null>(null);
  const [unidadResponsableId, setUnidadResponsableId] = useState('');
  const [alcanceAsignacion, setAlcanceAsignacion] = useState<'ninguna' | 'autorizadas' | 'todas'>('ninguna');
  const [puedeDarSeguimiento, setPuedeDarSeguimiento] = useState(true);
  const [puedeProgramarReuniones, setPuedeProgramarReuniones] = useState(true);
  const [puedeGestionarParticipantes, setPuedeGestionarParticipantes] = useState(true);
  const [puedeSolicitarInformacion, setPuedeSolicitarInformacion] = useState(true);
  const [guardandoGestion, setGuardandoGestion] = useState(false);

  // Paso 1: cardinalidad de sedes. La sede central siempre tiene jerarquia
  // propia; "varias" significa que ademas hay sedes externas. No crea columnas.
  const [modoSedes, setModoSedes] = useState<ModoSedes>('');

  // Misma plantilla para la vista previa y para la escritura: asi lo que se
  // muestra coincide exactamente con lo que se guarda.
  const plantillaPreview = useMemo(
    () => construirBorradoresPlantilla(sector, { incluirSedesExternas: modoSedes === 'varias' }),
    [sector, modoSedes],
  );
  const [borradores, setBorradores] = useState<GestorUnitBorrador[]>(plantillaPreview);
  const [colapsadosBorrador, setColapsadosBorrador] = useState<Record<string, boolean>>({});
  const [aliasEdits, setAliasEdits] = useState<Record<string, string>>({});
  const [confirmandoReinicio, setConfirmandoReinicio] = useState<boolean>(false);

  useEffect(() => {
    setBorradores(plantillaPreview);
    setColapsadosBorrador({});
  }, [plantillaPreview]);
  const sedePrincipal = useMemo(() => sedes.find((s) => s.es_principal), [sedes]);
  const sedesExternas = useMemo(() => sedes.filter((s) => !s.es_principal), [sedes]);

  const sedeADatos = (s: SedeRow): DatosUbicacionSede => ({
    nombre: s.nombre || '',
    pais: s.pais || 'Perú',
    departamento: s.departamento || '',
    provincia: s.provincia || '',
    distrito: s.distrito || '',
    ubigeo: s.ubigeo || '',
    direccion: s.direccion || '',
    referencia: s.referencia_ubicacion || '',
    latitud: s.latitud == null ? '' : String(s.latitud),
    longitud: s.longitud == null ? '' : String(s.longitud),
  });

  const nuevaSedeVacia = (): DatosUbicacionSede => ({
    nombre: '',
    pais: 'Perú',
    departamento: '',
    provincia: '',
    distrito: '',
    ubigeo: '',
    direccion: '',
    referencia: '',
    latitud: '',
    longitud: '',
  });

  const aCoordenada = (valor: string): number | null => {
    if (!valor.trim()) return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : null;
  };

  const guardarConfiguracionSedes = async (modalidad: ModoSedes, cantidad: number) => {
    if (!supabase || !perfil?.tenantId) {
      return { ok: false, error: 'No se detectó una empresa activa en tu sesión.' };
    }
    const metadata = (configGestion?.metadata && typeof configGestion.metadata === 'object' ? configGestion.metadata : {}) as Record<string, unknown>;
    const base = configGestion
      ? {
          unidad_responsable_id: configGestion.unidad_responsable_id,
          alcance_asignacion_tareas: configGestion.alcance_asignacion_tareas,
          puede_dar_seguimiento: configGestion.puede_dar_seguimiento,
          puede_programar_reuniones: configGestion.puede_programar_reuniones,
          puede_gestionar_participantes: configGestion.puede_gestionar_participantes,
          puede_solicitar_informacion: configGestion.puede_solicitar_informacion,
          activo: configGestion.activo,
        }
      : {};
    const { error } = await supabase
      .from('gp_config_gestion_proyectos')
      .upsert({
        empresa_id: perfil.tenantId,
        ...base,
        metadata: { ...metadata, modalidad_sedes: modalidad, cantidad_sedes: cantidad },
      }, { onConflict: 'empresa_id' });
    return error ? { ok: false, error: error.message } : { ok: true, error: '' };
  };

  const handleSeleccionarModo = async (valor: ModoSedes) => {
    setModoSedes(valor);
    if (valor === 'una') {
      setCantidadSedes('1');
      setRegistrandoExternas(false);
      return;
    }
    if (valor === 'varias') {
      setCantidadSedes((prev) => (Number(prev) < 2 ? '2' : prev));
      setRegistrandoExternas(false);
      setMapaSedeCentralAbierto(false);
      setOmitirRegistroExternas(false);
      if (modoSedes !== 'varias') setCantidadGuardada(null);
      return;
    }
    const res = await guardarConfiguracionSedes(valor, 0);
    if (!res.ok) {
      setFeedback({ type: 'err', text: res.error });
      return;
    }
    setCantidadSedes('0');
    setCantidadGuardada(0);
    setRegistrandoExternas(false);
    setFeedback({ type: 'ok', text: 'Modalidad guardada.' });
    await cargarEstado();
  };

  const cargarEstado = async () => {
    if (!supabase || !perfil?.tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sRes, gRes, jerarquia] = await Promise.all([
        supabase
          .from('gp_sedes')
          .select('id, nombre, tipo_codigo, es_principal, sede_padre_id, pais, departamento, provincia, distrito, ubigeo, direccion, referencia_ubicacion, latitud, longitud')
          .eq('empresa_id', perfil.tenantId)
          .order('es_principal', { ascending: false })
          .order('nombre', { ascending: true })
          .limit(300),
        supabase
          .from('gp_config_gestion_proyectos')
          .select('id, unidad_responsable_id, alcance_asignacion_tareas, puede_dar_seguimiento, puede_programar_reuniones, puede_gestionar_participantes, puede_solicitar_informacion, activo, metadata')
          .eq('empresa_id', perfil.tenantId)
          .maybeSingle(),
        listarUnidadesParaJerarquia({ tenantId: perfil.tenantId }).catch(() => []),
      ]);

      const numeracionMap = jerarquia.length > 0
        ? calcularNumeracion(aNodosJerarquia(jerarquia), fallbackInsercionDesde(jerarquia))
        : null;

      const comparadorRuta = (ra: string, rb: string) => {
        const pa = ra.split('.').map(Number);
        const pb = rb.split('.').map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
          if (diff !== 0) return diff;
        }
        return 0;
      };

      const filasUnidades: UnidadRow[] = jerarquia
        .map((u) => {
          const num = numeracionMap?.get(u.id);
          return {
            id: u.id,
            codigo_jerarquico: u.code || null,
            nombre_estandar: u.name,
            alias: null,
            nivel: num?.nivel ?? (u.parentUnitId ? 2 : 1),
            ruta: num?.ruta ?? '',
          };
        })
        .sort((a, b) => {
          if (a.ruta && b.ruta) return comparadorRuta(a.ruta, b.ruta);
          if (a.ruta) return -1;
          if (b.ruta) return 1;
          return 0;
        });

      setUnidades(filasUnidades);
      const meta = (gRes.data?.metadata && typeof gRes.data.metadata === 'object' ? gRes.data.metadata : {}) as Record<string, unknown>;
      if (!sRes.error && Array.isArray(sRes.data)) {
        const filas = sRes.data as SedeRow[];
        setSedes(filas);
        const principal = filas.find((s) => s.es_principal);
        if (principal) {
          setSedeCentral({
            nombre: principal.nombre,
            pais: principal.pais || 'Perú',
            departamento: principal.departamento || '',
            provincia: principal.provincia || '',
            distrito: principal.distrito || '',
            ubigeo: principal.ubigeo || '',
            direccion: principal.direccion || '',
            referencia: principal.referencia_ubicacion || '',
            latitud: principal.latitud != null ? String(principal.latitud) : '',
            longitud: principal.longitud != null ? String(principal.longitud) : '',
          });
        }
        const modalidadGuardada = (meta.modalidad_sedes as ModoSedes) || '';
        const cantidadDb = Number(meta.cantidad_sedes);
        const cantidadValida = Number.isFinite(cantidadDb) && cantidadDb >= 0;
        setModoSedes((prev) => prev || modalidadGuardada || (filas.length === 0 ? '' : filas.length === 1 ? 'una' : 'varias'));
        setCantidadSedes(String(cantidadValida ? cantidadDb : filas.length));
        setCantidadGuardada(cantidadValida ? cantidadDb : filas.length > 0 ? filas.length : null);
        setMapaSedeCentralAbierto(false);
        setOmitirRegistroExternas(false);
      }
      if (!gRes.error && gRes.data) {
        const g = gRes.data as ConfigGestionRow;
        setConfigGestion(g);
        setUnidadResponsableId(g.unidad_responsable_id || '');
        setAlcanceAsignacion(g.alcance_asignacion_tareas || 'ninguna');
        setPuedeDarSeguimiento(g.puede_dar_seguimiento !== false);
        setPuedeProgramarReuniones(g.puede_programar_reuniones !== false);
        setPuedeGestionarParticipantes(g.puede_gestionar_participantes !== false);
        setPuedeSolicitarInformacion(g.puede_solicitar_informacion !== false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarEstado();
  }, [perfil?.tenantId]);

  const handlePrecargarPlantilla = async () => {
    if (!perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    if (modoSedes === '') {
      setFeedback({ type: 'err', text: 'Responde primero si tienes una sola sede o varias.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const res = await crearEstructuraDesdePlantilla({
        origen: sector,
        tenantId: perfil.tenantId,
        borradoresPersonalizados: borradores,
      });
      if (res && (res as any).ok === false) {
        setFeedback({ type: 'err', text: (res as any).error || 'No se pudo aplicar la estructura inicial.' });
      } else {
        setFeedback({
          type: 'ok',
          text: `Estructura de ${sector === 'publico' ? 'Sector Público' : 'Sector Privado'} para ${modoSedes === 'una' ? 'sede única' : 'múltiples sedes'} creada correctamente.`,
        });
        setEditandoSector(false);
        setEditandoSedes(false);
        setEditandoGobernanza(false);
        setEditandoPaso4(false);
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Error al aplicar la estructura.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReiniciarEstructura = async () => {
    if (!supabase || !perfil?.tenantId) return;
    setSaving(true);
    setFeedback(null);
    setConfirmandoReinicio(false);
    try {
      const { data: borradas, error: delErr } = await supabase
        .from('gestor_unidades')
        .delete()
        .eq('tenant_id', perfil.tenantId)
        .select('id');
      if (delErr) {
        setFeedback({ type: 'err', text: `No se pudo limpiar la estructura en Supabase: ${delErr.message}` });
        return;
      }
      if (!borradas || borradas.length === 0) {
        setFeedback({ type: 'err', text: 'Supabase no permitió eliminar las filas (revisa política DELETE/RLS en gestor_unidades).' });
        return;
      }
      setUnidades([]);
      setUnidadResponsableId('');
      setEditingId(null);
      setEditandoSector(true);
      setFeedback({ type: 'ok', text: 'Estructura anterior limpiada. Ahora selecciona tu sector y aplica la estructura inicial.' });
      await cargarEstado();
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarAliasesLote = async () => {
    if (!supabase) return;
    const cambios = Object.entries(aliasEdits).filter(([id, val]) => {
      const u = unidades.find((x) => x.id === id);
      if (!u) return false;
      const actual = u.alias || u.nombre_estandar;
      return val.trim() !== '' && val.trim() !== actual;
    });
    if (cambios.length === 0) {
      setEditandoSector(false);
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const resultados = await Promise.all(
        cambios.map(([id, val]) =>
          supabase!
            .from('gestor_unidades')
            .update({ name: val.trim() })
            .eq('id', id)
            .eq('tenant_id', perfil?.tenantId ?? ''),
        ),
      );
      const err = resultados.find((r) => r.error)?.error;
      if (err) {
        setFeedback({ type: 'err', text: err.message });
      } else {
        setAliasEdits({});
        setEditandoSector(false);
        setFeedback({ type: 'ok', text: 'Nombres de áreas actualizados.' });
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarGestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    if (!unidadResponsableId) {
      setFeedback({ type: 'err', text: 'Selecciona el área encargada de dirigir los proyectos.' });
      return;
    }
    setGuardandoGestion(true);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('gp_config_gestion_proyectos')
        .upsert({
          empresa_id: perfil.tenantId,
          unidad_responsable_id: unidadResponsableId,
          alcance_asignacion_tareas: alcanceAsignacion,
          puede_dar_seguimiento: puedeDarSeguimiento,
          puede_programar_reuniones: puedeProgramarReuniones,
          puede_gestionar_participantes: puedeGestionarParticipantes,
          puede_solicitar_informacion: puedeSolicitarInformacion,
          activo: true,
        }, { onConflict: 'empresa_id' });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setFeedback({ type: 'ok', text: 'Área encargada y facultades guardadas.' });
        setEditandoSector(false);
        setEditandoSedes(false);
        setEditandoGobernanza(false);
        setEditandoPaso4(false);
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'No se pudo guardar la configuración de gestión.' });
    } finally {
      setGuardandoGestion(false);
    }
  };

  const handleCrearSedeCentral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !sedeCentral.nombre.trim()) return;
    if (!perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    const cantidad = parseInt(cantidadSedes, 10);
    const cantidadFinal = Number.isFinite(cantidad) && cantidad >= 1 ? cantidad : 1;
    setSaving(true);
    setFeedback(null);
    try {
      // En "central + externas" la cantidad ya se guardó en el paso anterior.
      const cantidadYaGuardada = modoSedes === 'varias' && cantidadGuardada === cantidadFinal;
      if (!cantidadYaGuardada) {
        const cfg = await guardarConfiguracionSedes(modoSedes, cantidadFinal);
        if (!cfg.ok) {
          setFeedback({ type: 'err', text: cfg.error });
          return;
        }
      }
      const datos = {
        nombre: sedeCentral.nombre.trim(),
        pais: sedeCentral.pais.trim() || null,
        departamento: sedeCentral.departamento.trim() || null,
        provincia: sedeCentral.provincia.trim() || null,
        distrito: sedeCentral.distrito.trim() || null,
        ubigeo: sedeCentral.ubigeo.trim() || null,
        direccion: sedeCentral.direccion.trim() || null,
        referencia_ubicacion: sedeCentral.referencia.trim() || null,
        latitud: aCoordenada(sedeCentral.latitud),
        longitud: aCoordenada(sedeCentral.longitud),
      };
      const { error } = sedePrincipal
        ? await supabase.from('gp_sedes').update(datos).eq('id', sedePrincipal.id)
        : await supabase.from('gp_sedes').insert({
            empresa_id: perfil.tenantId,
            ...datos,
            tipo_codigo: 'sede_principal',
            es_principal: true,
            activo: true,
          });
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        // Si cambió a "Sede única", eliminar las sucursales sobrantes de gp_sedes
        if (modoSedes === 'una' && sedesExternas.length > 0) {
          const { data: borradas, error: delErr } = await supabase
            .from('gp_sedes')
            .delete()
            .eq('empresa_id', perfil.tenantId)
            .eq('es_principal', false)
            .select('id');
          if (delErr) {
            setFeedback({ type: 'err', text: `Sede guardada, pero no se pudieron eliminar las sucursales: ${delErr.message}` });
            await cargarEstado();
            return;
          }
          if (!borradas || borradas.length === 0) {
            setFeedback({ type: 'err', text: 'Sede guardada, pero Supabase no permitió eliminar las sucursales (revisa política DELETE/RLS en gp_sedes).' });
            await cargarEstado();
            return;
          }
          setSedeExternaEditId(null);
          setSedeExternaDraft(null);
        }

        setCantidadSedes(String(cantidadFinal));
        setCantidadGuardada(cantidadFinal);
        setFeedback({ type: 'ok', text: sedePrincipal ? 'Sede Principal actualizada correctamente.' : 'Sede Principal registrada correctamente.' });
        setEditandoSector(false);
        setEditandoGobernanza(false);
        if (modoSedes === 'varias') {
          // Se pliega el mapa y queda a la vista la pregunta de las externas.
          setMapaSedeCentralAbierto(false);
          setOmitirRegistroExternas(false);
        } else {
          setEditandoSedes(false);
        }
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarCantidad = async (registrarAhora: boolean) => {
    const cantidad = parseInt(cantidadSedes, 10);
    if (!Number.isFinite(cantidad) || cantidad < 1) {
      setFeedback({ type: 'err', text: 'Indica la cantidad de sedes.' });
      return;
    }
    if (modoSedes === 'varias' && cantidad < 2) {
      setFeedback({ type: 'err', text: 'En "Múltiples sedes" indica al menos 2 sedes.' });
      return;
    }
    const modalidadFinal: ModoSedes = modoSedes === 'varias' ? 'varias' : cantidad === 1 ? 'una' : 'varias';
    setSaving(true);
    setFeedback(null);
    try {
      const cfg = await guardarConfiguracionSedes(modalidadFinal, cantidad);
      if (!cfg.ok) {
        setFeedback({ type: 'err', text: cfg.error });
        return;
      }
      setModoSedes(modalidadFinal);
      setCantidadSedes(String(cantidad));
      setCantidadGuardada(cantidad);
      setOmitirRegistroExternas(false);
      if (registrarAhora) {
        setRegistrandoExternas(true);
        setExternas((prev) => prev.length ? prev : Array.from({ length: Math.max(0, cantidad - sedes.length) }, nuevaSedeVacia));
      } else {
        setRegistrandoExternas(false);
        setFeedback({ type: 'ok', text: 'Cantidad de sedes guardada.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleContinuarDespues = () => {
    setOmitirRegistroExternas(true);
    setRegistrandoExternas(false);
    setFeedback({ type: 'ok', text: 'Podrás registrar las sucursales cuando lo necesites.' });
  };

  const handleGuardarSedesExternas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !perfil?.tenantId) {
      setFeedback({ type: 'err', text: 'No se detectó una empresa activa en tu sesión.' });
      return;
    }
    const filas = externas
      .filter((s) => s.nombre.trim())
      .map((s) => ({
        empresa_id: perfil.tenantId,
        nombre: s.nombre.trim(),
        tipo_codigo: 'sede_operativa',
        es_principal: false,
        pais: s.pais.trim() || null,
        departamento: s.departamento.trim() || null,
        provincia: s.provincia.trim() || null,
        distrito: s.distrito.trim() || null,
        ubigeo: s.ubigeo.trim() || null,
        direccion: s.direccion.trim() || null,
        referencia_ubicacion: s.referencia.trim() || null,
        latitud: aCoordenada(s.latitud),
        longitud: aCoordenada(s.longitud),
        activo: true,
      }));
    if (filas.length === 0) {
      setFeedback({ type: 'err', text: 'Indica el nombre de las sucursales.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase.from('gp_sedes').insert(filas);
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setRegistrandoExternas(false);
        setExternas([]);
        setFeedback({ type: 'ok', text: 'Sucursales registradas correctamente.' });
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
      } finally {
      setSaving(false);
    }
  };

  const handleActualizarSedeExterna = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !sedeExternaEditId || !sedeExternaDraft?.nombre.trim()) {
      setFeedback({ type: 'err', text: 'Indica el nombre de la sucursal.' });
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('gp_sedes')
        .update({
          nombre: sedeExternaDraft.nombre.trim(),
          pais: sedeExternaDraft.pais.trim() || null,
          departamento: sedeExternaDraft.departamento.trim() || null,
          provincia: sedeExternaDraft.provincia.trim() || null,
          distrito: sedeExternaDraft.distrito.trim() || null,
          ubigeo: sedeExternaDraft.ubigeo.trim() || null,
          direccion: sedeExternaDraft.direccion.trim() || null,
          referencia_ubicacion: sedeExternaDraft.referencia.trim() || null,
          latitud: aCoordenada(sedeExternaDraft.latitud),
          longitud: aCoordenada(sedeExternaDraft.longitud),
        })
        .eq('id', sedeExternaEditId);
      if (error) {
        setFeedback({ type: 'err', text: error.message });
      } else {
        setSedeExternaEditId(null);
        setSedeExternaDraft(null);
        setFeedback({ type: 'ok', text: 'Sucursal actualizada correctamente.' });
        await cargarEstado();
        window.dispatchEvent(new CustomEvent('gp:organizacion-actualizada'));
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    const falta = modoSedes !== 'sin_sede' && !sedePrincipal && (modoSedes === 'una' || modoSedes === 'varias' || sedes.length > 0);
    onSedePrincipalStatusChange?.(falta);
  }, [loading, modoSedes, sedePrincipal, sedes.length, onSedePrincipalStatusChange]);

  const { sedesRaiz, hijosPorSede } = useMemo(() => {
    const idsExternos = new Set(sedesExternas.map((s) => s.id));
    const map = new Map<string, SedeRow[]>();
    const raices: SedeRow[] = [];
    for (const s of sedesExternas) {
      if (s.sede_padre_id && idsExternos.has(s.sede_padre_id)) {
        const arr = map.get(s.sede_padre_id) ?? [];
        arr.push(s);
        map.set(s.sede_padre_id, arr);
      } else {
        raices.push(s);
      }
    }
    return { sedesRaiz: raices, hijosPorSede: map };
  }, [sedesExternas]);

  const deptosDisponibles = useMemo(
    () => Array.from(new Set(sedesExternas.map((s) => (s.departamento || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')),
    [sedesExternas],
  );

  const distritosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(
          sedesExternas
            .filter((s) => !filtroSedeDepto || (s.departamento || '').trim() === filtroSedeDepto)
            .map((s) => (s.distrito || '').trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'es')),
    [sedesExternas, filtroSedeDepto],
  );

  const hayFiltroSedeActivo = Boolean(filtroSedeTexto.trim() || filtroSedeDepto || filtroSedeDistrito);

  const coincideSede = (s: SedeRow): boolean => {
    if (filtroSedeDepto && (s.departamento || '').trim() !== filtroSedeDepto) return false;
    if (filtroSedeDistrito && (s.distrito || '').trim() !== filtroSedeDistrito) return false;
    const q = filtroSedeTexto.trim().toLowerCase();
    if (!q) return true;
    const texto = [s.nombre, s.departamento, s.provincia, s.distrito, s.direccion, s.referencia_ubicacion]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return texto.includes(q);
  };

  const tieneDescendienteCoincidente = (id: string): boolean => {
    const hijos = hijosPorSede.get(id) ?? [];
    return hijos.some((h) => coincideSede(h) || tieneDescendienteCoincidente(h.id));
  };

  const sedesRaizFiltradas = useMemo(() => {
    if (!hayFiltroSedeActivo) return sedesRaiz;
    return sedesRaiz.filter((r) => coincideSede(r) || tieneDescendienteCoincidente(r.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedesRaiz, hijosPorSede, filtroSedeTexto, filtroSedeDepto, filtroSedeDistrito]);

  const sedesRaizVisibles = hayFiltroSedeActivo
    ? sedesRaizFiltradas
    : sedesRaizFiltradas.slice(0, limiteSedesVisibles);

  const renderBarraFiltroSedes = () => {
    if (sedesRaiz.length <= 4) return null;
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={filtroSedeTexto}
            onChange={(e) => setFiltroSedeTexto(e.target.value)}
            placeholder="Buscar sede, región, distrito o dirección..."
            style={{ width: '100%', height: '36px', padding: '0 10px 0 32px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12.5px', color: '#0f172a' }}
          />
        </div>
        {deptosDisponibles.length > 1 && (
          <div style={{ flex: '0 1 200px', minWidth: '160px' }}>
            <SelectEstilizado
              value={filtroSedeDepto}
              placeholder="Todos los departamentos"
              options={[{ value: '', label: 'Todos los departamentos' }, ...deptosDisponibles.map((d) => ({ value: d, label: d }))]}
              onChange={(val) => {
                setFiltroSedeDepto(val);
                setFiltroSedeDistrito('');
              }}
            />
          </div>
        )}
        {distritosDisponibles.length > 1 && (
          <div style={{ flex: '0 1 190px', minWidth: '150px' }}>
            <SelectEstilizado
              value={filtroSedeDistrito}
              placeholder="Todos los distritos"
              options={[{ value: '', label: 'Todos los distritos' }, ...distritosDisponibles.map((d) => ({ value: d, label: d }))]}
              onChange={(val) => setFiltroSedeDistrito(val)}
            />
          </div>
        )}
        {hayFiltroSedeActivo && (
          <button
            type="button"
            onClick={() => {
              setFiltroSedeTexto('');
              setFiltroSedeDepto('');
              setFiltroSedeDistrito('');
            }}
            style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
          >
            Limpiar
          </button>
        )}
      </div>
    );
  };

  const renderPaginadorSedes = () => {
    const restantes = sedesRaizFiltradas.length - sedesRaizVisibles.length;
    if (restantes <= 0) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '4px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          Mostrando {sedesRaizVisibles.length} de {sedesRaizFiltradas.length} sedes principales de nivel 1
        </span>
        <div style={{ display: 'inline-flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setLimiteSedesVisibles((n) => n + 10)}
            style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
          >
            Mostrar más ({Math.min(10, restantes)})
          </button>
          <button
            type="button"
            onClick={() => setLimiteSedesVisibles(sedesRaizFiltradas.length)}
            style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
          >
            Ver todas ({sedesRaizFiltradas.length})
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="cards-grid">
      {feedback && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#ffffff',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          padding: '10px 18px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '13px',
          fontWeight: 600,
        }}>
          {feedback.type === 'ok' ? (
            <CheckCircle2 size={16} color="#00b96b" />
          ) : (
            <ShieldAlert size={16} color="#dc2626" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Bloque 1: Paso 1: sede central con jerarquia propia + sedes externas */}
      <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Building2 size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h2>Paso 1 · Alcance de Sedes</h2>
            <p>Define si tu organización opera desde una sede única o múltiples sedes.</p>
          </div>
          {sedes.length > 0 && (
            <button
              type="button"
              onClick={() => setEditandoSedes((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {editandoSedes ? <X size={13} /> : <Pencil size={13} />}
              <span>{editandoSedes ? 'Cancelar' : 'Editar'}</span>
            </button>
          )}
        </div>

        {sedes.length > 0 && !editandoSedes ? (
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
                {sedesExternas.length > 0 || modoSedes === 'varias' ? 'Múltiples sedes' : 'Sede única'} · {sedes.length} {sedes.length === 1 ? 'sede registrada' : 'sedes registradas'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12.5px', color: '#059669', fontWeight: 600 }}>
                <CheckCircle2 size={14} />
                <span>Guardado</span>
              </span>
            </div>

            {sedePrincipal ? (
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Building2 size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#64748b' }}>{sedesExternas.length > 0 || modoSedes === 'varias' ? 'Sede Principal:' : 'Sede:'}</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{sedePrincipal.nombre}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#475569', paddingLeft: '23px' }}>
                  <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                  <span>
                    {Array.from(new Set([sedePrincipal.direccion, sedePrincipal.distrito, sedePrincipal.provincia, sedePrincipal.departamento, sedePrincipal.pais].filter(Boolean)))
                      .join(' · ') || 'Sin dirección registrada'}
                    {sedePrincipal.referencia_ubicacion ? ` · Ref: ${sedePrincipal.referencia_ubicacion}` : ''}
                  </span>
                </div>
              </div>
            ) : modoSedes !== 'sin_sede' && (
              <div style={{ padding: '11px 14px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                  <Building2 size={15} color="#d97706" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#92400e', fontWeight: 500 }}>Sede Principal: Te hace falta registrar la Sede Principal</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditandoSedes(true)}
                  style={{ padding: '5px 11px', borderRadius: '7px', border: '1px solid #fcd34d', background: '#ffffff', color: '#b45309', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Registrar ahora
                </button>
              </div>
            )}

            {renderBarraFiltroSedes()}

            {(() => {
              const renderNodoLectura = (s: SedeRow, idx: number, nivel: number): React.ReactNode => {
                const hijosRaw = hijosPorSede.get(s.id) ?? [];
                const hijos = hayFiltroSedeActivo && !coincideSede(s)
                  ? hijosRaw.filter((h) => coincideSede(h) || tieneDescendienteCoincidente(h.id))
                  : hijosRaw;
                const tieneHijos = hijos.length > 0;
                const abierto = hayFiltroSedeActivo || Boolean(sedesAbiertas[s.id]);
                const direccionTxt =
                  Array.from(new Set([s.direccion, s.distrito, s.provincia, s.departamento, s.pais].filter(Boolean))).join(' · ') ||
                  'Sin dirección registrada';
                return (
                  <React.Fragment key={s.id}>
                    <div
                      style={{
                        marginLeft: `${nivel * 24}px`,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                          {tieneHijos ? (
                            <button
                              type="button"
                              onClick={() => setSedesAbiertas((p) => ({ ...p, [s.id]: !p[s.id] }))}
                              style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', color: '#64748b' }}
                              aria-label={`Expandir ${s.nombre}`}
                            >
                              <ChevronRight size={15} style={{ transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }} />
                            </button>
                          ) : (
                            <span style={{ width: '15px', flexShrink: 0 }} />
                          )}
                          <Building size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                          <span style={{ color: '#64748b' }}>{nivel === 1 ? `Sucursal ${idx + 1}:` : 'Sub-sede:'}</span>
                          <span style={{ color: '#0f172a', fontWeight: 500 }}>{s.nombre}</span>
                        </div>
                        {tieneHijos && (
                          <button
                            type="button"
                            onClick={() => setSedesAbiertas((p) => ({ ...p, [s.id]: !p[s.id] }))}
                            style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '2px 9px', cursor: 'pointer' }}
                          >
                            {hijos.length} {hijos.length === 1 ? 'sub-sede' : 'sub-sedes'}
                          </button>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', paddingLeft: '46px' }}>
                        <MapPin size={13} color="#64748b" style={{ flexShrink: 0 }} />
                        <span>
                          {direccionTxt}
                          {s.referencia_ubicacion ? ` · Ref: ${s.referencia_ubicacion}` : ''}
                        </span>
                      </div>
                    </div>
                    {tieneHijos && abierto && hijos.map((h, hi) => renderNodoLectura(h, hi, nivel + 1))}
                  </React.Fragment>
                );
              };
              if (sedesRaizVisibles.length === 0 && hayFiltroSedeActivo) {
                return <div style={{ fontSize: '13px', color: '#64748b', padding: '8px 4px' }}>No hay sedes que coincidan con el filtro.</div>;
              }
              return (
                <>
                  {sedesRaizVisibles.map((s, idx) => renderNodoLectura(s, idx, 1))}
                  {renderPaginadorSedes()}
                </>
              );
            })()}
          </div>
        ) : (
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Modalidad operativa de sedes</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {([
                { value: 'una' as ModoSedes, label: 'Sede única' },
                { value: 'varias' as ModoSedes, label: 'Múltiples sedes' },
                { value: 'sin_sede' as ModoSedes, label: 'Sin sede física' },
              ]).map((op) => (
                <button
                  key={op.value}
                  type="button"
                  className={`tab-item ${modoSedes === op.value ? 'active' : ''}`}
                  onClick={() => void handleSeleccionarModo(op.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '8px' }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.45 }}>
            {modoSedes === 'una' && <div>Operación centralizada: la estructura se configurará solo con las áreas de tu sede.</div>}
            {modoSedes === 'varias' && <div>Múltiples sedes: incluye la sede principal y las sucursales de tu organización.</div>}
            {modoSedes === 'sin_sede' && <div>Sin sede física: operación sin sede asignada.</div>}
            <div>
              Sedes registradas: <strong style={{ color: '#0f172a', fontWeight: 500 }}>{loading ? 'Cargando...' : sedes.length}</strong>
              {' · '}Sede Principal:{' '}
              {sedePrincipal ? (
                <span style={{ color: '#059669', fontWeight: 500 }}>{sedePrincipal.nombre}</span>
              ) : (
                <span style={{ color: '#d97706', fontWeight: 500 }}>Te hace falta registrar la Sede Principal</span>
              )}
            </div>
          </div>

          {modoSedes !== '' && modoSedes !== 'sin_sede' && modoSedes !== 'varias' && (
            <form onSubmit={handleCrearSedeCentral} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                <Building2 size={15} color="#2563eb" />
                <span>{sedePrincipal ? 'Sede' : 'Registrar Sede'}</span>
              </label>
              <SedeUbicacionFields
                valor={sedeCentral}
                onChange={(patch) => setSedeCentral((prev) => ({ ...prev, ...patch }))}
                placeholderNombre="Nombre de la sede"
              />
              <button type="submit" className="btn-save" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                <Plus size={15} />
                <span>{saving ? 'Guardando...' : sedePrincipal ? 'Actualizar Sede' : 'Crear Sede'}</span>
              </button>
            </form>
          )}

          {modoSedes === 'varias' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '10px 14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>Sede Principal</span>
                  <input
                    type="text"
                    value="1"
                    readOnly
                    aria-label="Cantidad de sede principal"
                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '52px', fontSize: '13.5px', background: '#f1f5f9', color: '#475569', textAlign: 'center', fontWeight: 600, cursor: 'default' }}
                  />
                </div>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>+</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="gp-cantidad-sucursales" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', margin: 0 }}>
                    Sucursales
                  </label>
                  <input
                    id="gp-cantidad-sucursales"
                    type="number"
                    min="1"
                    value={Math.max(1, (parseInt(cantidadSedes, 10) || 2) - 1)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const sucursales = Number.isFinite(val) && val >= 1 ? val : 1;
                      setCantidadSedes(String(sucursales + 1));
                    }}
                    style={{ padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '76px', fontSize: '13.5px', background: '#ffffff', color: '#0f172a', textAlign: 'center' }}
                  />
                </div>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  · Total: <strong style={{ color: '#0f172a' }}>{Math.max(2, parseInt(cantidadSedes, 10) || 2)}</strong> sedes
                </span>
                {(cantidadGuardada === null || Number(cantidadSedes) !== cantidadGuardada) && (
                  <button
                    type="button"
                    className="btn-save"
                    disabled={saving}
                    onClick={() => void handleGuardarCantidad(false)}
                  >
                    <Check size={15} />
                    <span>Guardar cantidad</span>
                  </button>
                )}
              </div>

              {sedePrincipal && !mapaSedeCentralAbierto ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', padding: '14px', borderRadius: '10px', background: '#ffffff', border: '1px solid #bfdbfe' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={16} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                          Sede Principal · {sedePrincipal.nombre}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#64748b' }}>
                          <MapPin size={12} style={{ flexShrink: 0 }} />
                          <span>
                            {Array.from(new Set([sedePrincipal.direccion, sedePrincipal.distrito, sedePrincipal.provincia, sedePrincipal.departamento, sedePrincipal.pais].filter(Boolean)))
                              .join(' · ') || 'Sin dirección registrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      <span>Registrada</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMapaSedeCentralAbierto(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    <Pencil size={13} />
                    <span>Editar ubicación</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleCrearSedeCentral}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '10px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                    <Building2 size={15} color="#2563eb" />
                    <span>{sedePrincipal ? 'Sede Principal' : 'Registrar Sede Principal'}</span>
                  </label>
                  <SedeUbicacionFields
                    valor={sedeCentral}
                    onChange={(patch) => setSedeCentral((prev) => ({ ...prev, ...patch }))}
                    placeholderNombre="Nombre de la Sede Principal"
                  />
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-save" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                      <Plus size={15} />
                      <span>{saving ? 'Guardando...' : sedePrincipal ? 'Actualizar Sede Principal' : 'Crear Sede Principal'}</span>
                    </button>
                    {sedePrincipal && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setMapaSedeCentralAbierto(false)}
                        style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Ocultar mapa
                      </button>
                    )}
                  </div>
                </form>
              )}

              {renderBarraFiltroSedes()}

              {(() => {
                const renderNodoEdicion = (sede: SedeRow, idx: number, nivel: number): React.ReactNode => {
                  const hijosRaw = hijosPorSede.get(sede.id) ?? [];
                  const hijos = hayFiltroSedeActivo && !coincideSede(sede)
                    ? hijosRaw.filter((h) => coincideSede(h) || tieneDescendienteCoincidente(h.id))
                    : hijosRaw;
                  const tieneHijos = hijos.length > 0;
                  const abierto = hayFiltroSedeActivo || Boolean(sedesAbiertas[`edit-${sede.id}`]);
                  if (sedeExternaEditId === sede.id && sedeExternaDraft) {
                    return (
                      <React.Fragment key={sede.id}>
                        <form
                          onSubmit={handleActualizarSedeExterna}
                          style={{
                            marginLeft: `${nivel * 20}px`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '16px',
                            borderRadius: '10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                            <Building size={15} color="#0284c7" />
                            <span>{nivel === 1 ? `Sucursal: ${sede.nombre}` : `Sub-sede: ${sede.nombre}`}</span>
                          </label>
                          <SedeUbicacionFields
                            valor={sedeExternaDraft}
                            onChange={(patch) => setSedeExternaDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
                            placeholderNombre="Nombre de la sucursal"
                          />
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button type="submit" className="btn-save" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                              <Check size={15} />
                              <span>{saving ? 'Guardando...' : 'Actualizar sucursal'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setSedeExternaEditId(null);
                                setSedeExternaDraft(null);
                              }}
                              style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                            >
                              Ocultar mapa
                            </button>
                          </div>
                        </form>
                        {tieneHijos && abierto && hijos.map((h, hi) => renderNodoEdicion(h, hi, nivel + 1))}
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={sede.id}>
                      <div
                        style={{
                          marginLeft: `${nivel * 20}px`,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '14px',
                          borderRadius: '10px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {tieneHijos ? (
                              <button
                                type="button"
                                onClick={() => setSedesAbiertas((p) => ({ ...p, [`edit-${sede.id}`]: !p[`edit-${sede.id}`] }))}
                                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', color: '#64748b' }}
                                aria-label={`Expandir ${sede.nombre}`}
                              >
                                <ChevronRight size={15} style={{ transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }} />
                              </button>
                            ) : (
                              <span style={{ width: '15px', flexShrink: 0 }} />
                            )}
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Building size={15} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                                {nivel === 1 ? `Sucursal ${idx + 1} · ${sede.nombre}` : `Sub-sede · ${sede.nombre}`}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#64748b' }}>
                                <MapPin size={12} style={{ flexShrink: 0 }} />
                                <span>
                                  {Array.from(new Set([sede.direccion, sede.distrito, sede.provincia, sede.departamento, sede.pais].filter(Boolean)))
                                    .join(' · ') || 'Sin dirección registrada'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {tieneHijos && (
                              <button
                                type="button"
                                onClick={() => setSedesAbiertas((p) => ({ ...p, [`edit-${sede.id}`]: !p[`edit-${sede.id}`] }))}
                                style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '3px 10px', cursor: 'pointer' }}
                              >
                                {hijos.length} {hijos.length === 1 ? 'sub-sede' : 'sub-sedes'}
                              </button>
                            )}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                              <CheckCircle2 size={13} />
                              <span>Registrada</span>
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSedeExternaEditId(sede.id);
                            setSedeExternaDraft(sedeADatos(sede));
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <Pencil size={13} />
                          <span>Editar ubicación</span>
                        </button>
                      </div>
                      {tieneHijos && abierto && hijos.map((h, hi) => renderNodoEdicion(h, hi, nivel + 1))}
                    </React.Fragment>
                  );
                };
                return (
                  <>
                    {sedesRaizVisibles.map((sede, idx) => renderNodoEdicion(sede, idx, 1))}
                    {renderPaginadorSedes()}
                  </>
                );
              })()}

              {sedePrincipal && !mapaSedeCentralAbierto && cantidadGuardada !== null && Number(cantidadSedes) === cantidadGuardada && !registrandoExternas && cantidadGuardada > sedes.length && (() => {
                const faltantes = cantidadGuardada - sedes.length;
                return (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '14px',
                      borderRadius: '10px',
                      background: omitirRegistroExternas ? '#f8fafc' : '#f0fdf4',
                      border: `1px solid ${omitirRegistroExternas ? '#e2e8f0' : '#bbf7d0'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: omitirRegistroExternas ? '#475569' : '#15803d' }}>
                        {omitirRegistroExternas ? 'Sucursales pendientes de registro' : 'Registro de sucursales'}
                      </div>
                      <div style={{ fontSize: '13px', color: omitirRegistroExternas ? '#64748b' : '#166534', marginTop: '4px' }}>
                        {faltantes === 1
                          ? 'Falta 1 sucursal por registrar para completar la cantidad indicada.'
                          : `Faltan ${faltantes} sucursales por registrar para completar la cantidad indicada.`}
                        {omitirRegistroExternas && ' Guardado para continuar después.'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className={omitirRegistroExternas ? undefined : 'btn-save'}
                        disabled={saving}
                        onClick={() => void handleGuardarCantidad(true)}
                        style={omitirRegistroExternas
                          ? { alignSelf: 'flex-start', padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }
                          : { alignSelf: 'flex-start' }}
                      >
                        {!omitirRegistroExternas && <Check size={15} />}
                        <span>Registrar ahora</span>
                      </button>
                      {!omitirRegistroExternas && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleContinuarDespues}
                          style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Continuar después
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {registrandoExternas && (
            <form onSubmit={handleGuardarSedesExternas} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {externas.map((s, i) => {
                const numeroSucursal = sedesExternas.length + i + 1;
                const abierta = i === sucursalActivaIdx;
                const completa = Boolean(s.nombre.trim());
                if (!abierta) {
                  return (
                    <div
                      key={i}
                      onClick={() => setSucursalActivaIdx(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px' }}>
                        <Building size={14} color="#0284c7" />
                        <span style={{ fontWeight: 600, color: '#334155' }}>Sucursal {numeroSucursal}</span>
                        <span style={{ color: completa ? '#0f172a' : '#94a3b8' }}>
                          {completa ? `· ${s.nombre.trim()}` : '· Pendiente de completar'}
                        </span>
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, color: completa ? '#059669' : '#2563eb' }}>
                        {completa && <Pencil size={12} />}
                        <span>{completa ? 'Lista · Editar' : 'Completar'}</span>
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        <Building size={15} color="#0284c7" />
                        <span>Sucursal {numeroSucursal}</span>
                      </span>
                      {i < externas.length - 1 && (
                        <button
                          type="button"
                          onClick={() => setSucursalActivaIdx(i + 1)}
                          style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Siguiente sucursal →
                        </button>
                      )}
                    </div>
                    <SedeUbicacionFields
                      valor={s}
                      onChange={(patch) => setExternas((prev) => prev.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))}
                      placeholderNombre="Nombre de la sucursal"
                    />
                  </div>
                );
              })}
              <button type="submit" className="btn-save" disabled={saving} style={{ alignSelf: 'flex-start' }}>
                <Check size={15} />
                <span>Guardar sucursales</span>
              </button>
            </form>
          )}
        </div>
        )}
      </div>

      {/* Bloque 2: Paso 2: sector público / privado */}
      {!loading && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Landmark size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h2>Paso 2 · Sector Institucional y Estructura</h2>
              <p>Selecciona el sector de tu institución y personaliza el nombre de cada área cuando lo necesites.</p>
            </div>
            {unidades.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAliasEdits({});
                  setConfirmandoReinicio(false);
                  setEditandoSector((v) => !v);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {editandoSector ? <X size={13} /> : <Pencil size={13} />}
                <span>{editandoSector ? 'Cerrar' : 'Editar'}</span>
              </button>
            )}
          </div>

          {unidades.length > 0 && !editandoSector ? (
            <div className="card-body">
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Sector configurado: </span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>
                    {sector === 'publico' ? 'Sector Público' : 'Sector Privado'}
                  </span>
                  <span style={{ color: '#64748b' }}> · {unidades.length} áreas registradas</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Guardado</span>
                </span>
              </div>
            </div>
          ) : (
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`tab-item ${sector === 'publico' ? 'active' : ''}`}
                onClick={() => setSector('publico')}
                style={{ flex: 1, justifyContent: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <Globe2 size={15} />
                <span>Sector Público</span>
              </button>
              <button
                type="button"
                className={`tab-item ${sector === 'privado' ? 'active' : ''}`}
                onClick={() => setSector('privado')}
                style={{ flex: 1, justifyContent: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              >
                <Building2 size={15} />
                <span>Sector Privado</span>
              </button>
            </div>

            {/* Sedes guardadas en el Paso 1: encapsuladas aparte, jerárquicas,
                sin convertirlas en áreas del organigrama. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Sedes registradas</span>
              {sedePrincipal ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#ffffff', fontSize: '13.5px' }}>
                    <Building2 size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#64748b', fontWeight: 500, flexShrink: 0 }}>
                      {sedesExternas.length > 0 || modoSedes === 'varias' ? 'Sede Principal:' : 'Sede:'}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{sedePrincipal.nombre}</span>
                  </div>
                  {(() => {
                    const renderResumenSede = (sede: SedeRow, idx: number, nivel: number): React.ReactNode => {
                      const hijos = hijosPorSede.get(sede.id) ?? [];
                      const tieneHijos = hijos.length > 0;
                      const abierto = Boolean(sedesAbiertas[`res-${sede.id}`]);
                      return (
                        <React.Fragment key={sede.id}>
                          <div style={{ marginLeft: `${nivel * 24}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13.5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {tieneHijos ? (
                                <button
                                  type="button"
                                  onClick={() => setSedesAbiertas((p) => ({ ...p, [`res-${sede.id}`]: !p[`res-${sede.id}`] }))}
                                  style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', color: '#64748b' }}
                                >
                                  <ChevronRight size={14} style={{ transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }} />
                                </button>
                              ) : (
                                <span style={{ width: '14px', flexShrink: 0 }} />
                              )}
                              <Building size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                              <span style={{ color: '#64748b', fontWeight: 500, flexShrink: 0 }}>
                                {nivel === 1 ? `Sucursal ${idx + 1}:` : 'Sub-sede:'}
                              </span>
                              <span style={{ color: '#0f172a', fontWeight: 500 }}>{sede.nombre}</span>
                            </div>
                            {tieneHijos && (
                              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', background: '#f1f5f9', borderRadius: '999px', padding: '1px 8px' }}>
                                {hijos.length}
                              </span>
                            )}
                          </div>
                          {tieneHijos && abierto && hijos.map((h, hi) => renderResumenSede(h, hi, nivel + 1))}
                        </React.Fragment>
                      );
                    };
                    return (
                      <>
                        {sedesRaiz.slice(0, limiteSedesVisibles).map((sede, idx) => renderResumenSede(sede, idx, 1))}
                        {sedesRaiz.length > limiteSedesVisibles && (
                          <button
                            type="button"
                            onClick={() => setLimiteSedesVisibles((n) => n + 10)}
                            style={{ alignSelf: 'flex-start', marginLeft: '24px', padding: '5px 12px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                          >
                            Mostrar más sedes ({sedesRaiz.length - limiteSedesVisibles} restantes)
                          </button>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13.5px', color: '#64748b' }}>
                  Aún no hay sedes registradas. Regístralas en el Paso 1.
                </div>
              )}
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Las sedes se registran en el Paso 1 y no se convierten en áreas del organigrama.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  {unidades.length > 0 ? 'Estructura organizacional (puedes editar el alias con el lápiz)' : 'Estructura organizacional inicial (puedes editar o agregar áreas antes de aplicar)'}
                </span>
                {unidades.length > 0 ? (
                  confirmandoReinicio ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', padding: '5px 10px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <span style={{ fontSize: '12px', color: '#b91c1c', fontWeight: 500 }}>¿Reiniciar áreas actuales?</span>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleReiniciarEstructura()}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#ffffff', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Sí, reiniciar
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setConfirmandoReinicio(false)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setConfirmandoReinicio(true)}
                      style={{ padding: '5px 10px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                    >
                      Reiniciar estructura
                    </button>
                  )
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
                    <Pencil size={12} color="#2563eb" />
                    <span>Luego podrás editar el alias de cada área aquí mismo</span>
                  </span>
                )}
              </div>
              {unidades.length > 0 ? (
                unidades.map((u) => {
                  const esRaiz = u.nivel === 1;
                  const indent = Math.max(0, (u.nivel - 1) * 20);
                  const valorActual = aliasEdits[u.id] ?? (u.alias || u.nombre_estandar);
                  return (
                    <div
                      key={u.id}
                      style={{
                        marginLeft: `${indent}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: esRaiz ? '8px 12px' : '6px 10px',
                        borderRadius: '8px',
                        border: `1px solid ${esRaiz ? '#bfdbfe' : '#e2e8f0'}`,
                        background: esRaiz ? '#eff6ff' : '#ffffff',
                        fontSize: '13.5px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: esRaiz ? '#2563eb' : '#f1f5f9',
                          color: esRaiz ? '#ffffff' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {u.ruta || `${u.nivel}`}
                      </span>
                      <input
                        type="text"
                        value={valorActual}
                        onChange={(e) => setAliasEdits((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        placeholder={u.nombre_estandar}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '13.5px',
                          fontWeight: esRaiz ? 600 : (u.nivel === 2 ? 500 : 400),
                        }}
                      />
                    </div>
                  );
                })
              ) : (
                (() => {
                  const nodosOrdenados: Array<{ key: string; parentKey: string | null; name: string; unitType: GestorUnitBorrador['unitType']; nivel: number; codigo: string; tieneHijos: boolean }> = [];
                  const visitar = (parentKey: string | null, prefijo: string, nivel: number) => {
                    const hijos = borradores.filter((n) => n.parentKey === parentKey);
                    hijos.forEach((h, i) => {
                      const codigo = prefijo ? `${prefijo}.${i + 1}` : `${i + 1}`;
                      const tieneHijos = borradores.some((c) => c.parentKey === h.key);
                      nodosOrdenados.push({ key: h.key, parentKey: h.parentKey, name: h.name, unitType: h.unitType, nivel, codigo, tieneHijos });
                      if (!colapsadosBorrador[h.key]) {
                        visitar(h.key, codigo, nivel + 1);
                      }
                    });
                  };
                  visitar(null, '', 1);
                  const crearBorradorExtra = (
                    parentKey: string | null,
                    name: string,
                    unitType: GestorUnitBorrador['unitType'],
                  ): GestorUnitBorrador => {
                    const nuevaKey = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                    return {
                      key: nuevaKey,
                      parentKey,
                      name,
                      unitType,
                      metadata: {
                        plantilla: {
                          origen: sector,
                          version: '2026-11',
                          nombre_original: name,
                          key_plantilla: nuevaKey,
                        },
                      },
                    };
                  };
                  const eliminarSubarbol = (targetKey: string) => {
                    const quitar = new Set<string>([targetKey]);
                    let agregado = true;
                    while (agregado) {
                      agregado = false;
                      borradores.forEach((b) => {
                        if (b.parentKey && quitar.has(b.parentKey) && !quitar.has(b.key)) {
                          quitar.add(b.key);
                          agregado = true;
                        }
                      });
                    }
                    setBorradores((prev) => prev.filter((b) => !quitar.has(b.key)));
                  };

                  return nodosOrdenados.map((nodo) => {
                    const esRaiz = nodo.nivel === 1;
                    const indent = Math.max(0, (nodo.nivel - 1) * 20);
                    return (
                      <div
                        key={nodo.key}
                        style={{
                          marginLeft: `${indent}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          padding: esRaiz ? '8px 12px' : '6px 10px',
                          borderRadius: '8px',
                          border: `1px solid ${esRaiz ? '#bfdbfe' : '#e2e8f0'}`,
                          background: esRaiz ? '#eff6ff' : '#ffffff',
                          fontSize: '13.5px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          {nodo.tieneHijos && (
                            <button
                              type="button"
                              onClick={() => setColapsadosBorrador((prev) => ({ ...prev, [nodo.key]: !prev[nodo.key] }))}
                              title={colapsadosBorrador[nodo.key] ? 'Expandir subáreas' : 'Colapsar subáreas'}
                              style={{ padding: '2px', border: 'none', background: 'transparent', color: colapsadosBorrador[nodo.key] ? '#64748b' : '#0284c7', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                            >
                              {colapsadosBorrador[nodo.key] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              background: esRaiz ? '#2563eb' : '#f1f5f9',
                              color: esRaiz ? '#ffffff' : '#475569',
                              fontSize: '12px',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {nodo.codigo}
                          </span>
                          <input
                            type="text"
                            value={nodo.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBorradores((prev) => prev.map((b) => (b.key === nodo.key ? { ...b, name: val } : b)));
                            }}
                            style={{
                              flex: 1,
                              minWidth: 0,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13.5px',
                              background: '#ffffff',
                              color: '#0f172a',
                              fontWeight: esRaiz ? 600 : (nodo.nivel === 2 ? 500 : 400),
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setBorradores((prev) => [
                                ...prev,
                                crearBorradorExtra(nodo.parentKey, 'Nueva área', nodo.unitType),
                              ]);
                            }}
                            title="Agregar área en el mismo nivel"
                            style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0066ff', cursor: 'pointer', display: 'flex' }}
                          >
                            <Plus size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setColapsadosBorrador((prev) => ({ ...prev, [nodo.key]: false }));
                              setBorradores((prev) => [
                                ...prev,
                                crearBorradorExtra(nodo.key, 'Nueva subárea', nodo.unitType === 'institution' ? 'office' : nodo.unitType),
                              ]);
                            }}
                            title="Agregar subárea hija"
                            style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#0284c7', cursor: 'pointer', display: 'flex' }}
                          >
                            <CornerDownRight size={13} />
                          </button>
                          {!esRaiz && (
                            <button
                              type="button"
                              onClick={() => eliminarSubarbol(nodo.key)}
                              title="Eliminar área"
                              style={{ padding: '4px 6px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', display: 'flex' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {unidades.length > 0 ? (
              <button
                type="button"
                className="btn-save"
                disabled={saving}
                onClick={() => void handleGuardarAliasesLote()}
                style={{ alignSelf: 'flex-start' }}
              >
                <Check size={15} />
                <span>{saving ? 'Guardando...' : 'Guardar cambios'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-save"
                disabled={saving}
                onClick={handlePrecargarPlantilla}
                style={{ alignSelf: 'flex-start' }}
              >
                <Check size={15} />
                <span>{saving ? 'Aplicando...' : 'Aplicar esta estructura inicial'}</span>
              </button>
            )}
          </div>
          )}
        </div>
      )}

      {/* Bloque 3: Paso 3 · Unidad Responsable de Proyectos */}
      {unidades.length > 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ShieldCheck size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h2>Paso 3 · Unidad Responsable de Proyectos</h2>
              <p>Selecciona el área responsable de liderar la gestión de proyectos en tu organización.</p>
            </div>
            {configGestion?.unidad_responsable_id && (
              <button
                type="button"
                onClick={() => setEditandoGobernanza((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {editandoGobernanza ? <X size={13} /> : <Pencil size={13} />}
                <span>{editandoGobernanza ? 'Cancelar' : 'Editar'}</span>
              </button>
            )}
          </div>

          {configGestion?.unidad_responsable_id && !editandoGobernanza ? (
            <div className="card-body">
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Área responsable: </span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>
                    {unidades.find((u) => u.id === unidadResponsableId)?.alias ||
                      unidades.find((u) => u.id === unidadResponsableId)?.nombre_estandar ||
                      'Asignada'}
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Guardado</span>
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGuardarGestion} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                Unidad responsable
                <SelectEstilizado
                  value={unidadResponsableId}
                  placeholder="Selecciona un área"
                  options={unidades.map((u) => ({
                    value: u.id,
                    label: `${u.ruta ? `${u.ruta} · ` : ''}${u.alias || u.nombre_estandar}`,
                  }))}
                  onChange={(val) => setUnidadResponsableId(val)}
                />
              </label>

              <button type="submit" className="btn-save" disabled={guardandoGestion} style={{ alignSelf: 'flex-start' }}>
                <Check size={15} />
                <span>{guardandoGestion ? 'Guardando...' : configGestion?.unidad_responsable_id ? 'Actualizar área responsable' : 'Guardar área responsable'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Bloque 4: Paso 4 · Gobernanza y Asignación de Tareas (tarjeta independiente) */}
      {unidades.length > 0 && (
        <div className="cfg-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <div className="card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Layers size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <h2>Paso 4 · Gobernanza y Asignación de Tareas</h2>
              <p>Define el alcance del área responsable para asignar tareas y coordinar entre sedes o áreas.</p>
            </div>
            {configGestion?.unidad_responsable_id && (
              <button
                type="button"
                onClick={() => setEditandoPaso4((v) => !v)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {editandoPaso4 ? <X size={13} /> : <Pencil size={13} />}
                <span>{editandoPaso4 ? 'Cancelar' : 'Editar'}</span>
              </button>
            )}
          </div>

          {configGestion?.unidad_responsable_id && !editandoPaso4 ? (
            <div className="card-body">
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13.5px', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Alcance: </span>
                  <span style={{ color: '#0f172a', fontWeight: 500 }}>
                    {alcanceAsignacion === 'todas'
                      ? 'A todas las sedes y dependencias'
                      : alcanceAsignacion === 'autorizadas'
                        ? 'Solo a sedes y dependencias autorizadas'
                        : 'No asignar tareas a otras sedes ni dependencias'}
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  <span>Guardado</span>
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGuardarGestion} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                Alcance de asignación de tareas a otras dependencias o sedes
                <SelectEstilizado
                  value={alcanceAsignacion}
                  options={[
                    { value: 'ninguna', label: 'No asignar tareas a otras sedes ni dependencias' },
                    { value: 'autorizadas', label: 'Solo a sedes y dependencias autorizadas' },
                    { value: 'todas', label: 'A todas las sedes y dependencias' },
                  ]}
                  onChange={(val) => setAlcanceAsignacion(val as 'ninguna' | 'autorizadas' | 'todas')}
                />
              </label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#475569' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={puedeDarSeguimiento} onChange={(e) => setPuedeDarSeguimiento(e.target.checked)} /> Dar seguimiento
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={puedeProgramarReuniones} onChange={(e) => setPuedeProgramarReuniones(e.target.checked)} /> Programar reuniones
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={puedeGestionarParticipantes} onChange={(e) => setPuedeGestionarParticipantes(e.target.checked)} /> Gestionar participantes
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={puedeSolicitarInformacion} onChange={(e) => setPuedeSolicitarInformacion(e.target.checked)} /> Solicitar información
                </label>
              </div>

              <button type="submit" className="btn-save" disabled={guardandoGestion} style={{ alignSelf: 'flex-start' }}>
                <Check size={15} />
                <span>{guardandoGestion ? 'Guardando...' : 'Actualizar gobernanza'}</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

export default OrganizacionTab;
