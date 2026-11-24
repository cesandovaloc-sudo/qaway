/**
 * PermisosTab.tsx (configuracion) — Etapa 6-B
 * ===========================================
 * Pantalla de PERMISOS CURABLES del modelo del Gestor: el admin de la empresa
 * asigna rol (admin/editor/operativo/visor) y las llaves delicadas v1
 * (gp.crear_proyecto · gp.editar_proyecto · gp.administrar_edt ·
 * gp.registrar_personas) a los usuarios de su tenant. Escritura directa a
 * public.user_app_roles (RLS uar_tenant_admin_manage manda en la DB).
 *
 * Estética propia del Gestor (tabla simple, sin inspiración de productos ajenos).
 * Estados honestos: sin sesión, sin permiso, directorio vacío, error de red.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, CheckSquare, ChevronDown, ChevronRight, Copy, FolderKanban, Key, KeyRound, Layers, Mail, Pencil, Plus, Save, Search, Send, ShieldAlert, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { APP_SLUG } from '../../services/contextoSesion';
import { aNodosJerarquia, listarUnidadesParaJerarquia } from '../../services/organizacionJerarquiaLectura';
import { calcularNumeracion } from '../../services/organizacionJerarquia';
import SelectEstilizado, { type SelectOption } from './SelectEstilizado';
import {
  LLAVES_V1,
  ROLES_GP,
  listarUsuariosEmpresa,
  guardarRolGp,
  usePerfilGp,
  type LlavePermiso,
  type UsuarioEmpresa,
} from '../../services/gpPermisosService';

type EstadoCarga =
  | { fase: 'cargando' }
  | { fase: 'lista'; usuarios: UsuarioEmpresa[] }
  | { fase: 'error'; mensaje: string };

interface Borrador {
  rol: string;
  permisos: string[];
}

const ETIQUETAS_LLAVE: Record<string, string> = {
  'gp.crear_proyecto': 'Crear proyecto',
  'gp.editar_proyecto': 'Editar proyecto',
  'gp.eliminar_proyecto': 'Eliminar proyecto',
  'gp.administrar_edt': 'Administrar EDT',
  'gp.registrar_personas': 'Registrar / invitar personas',
};

interface DefinicionPermisoEsquema {
  id: string;
  grupo: 'Proyectos' | 'Estructura EDT' | 'Tareas y Seguimiento' | 'Equipo y Gobernanza';
  nombre: string;
  descripcion: string;
  rolesBase: string[];
  llaveCurable?: LlavePermiso;
}

const ESQUEMA_PERMISOS: DefinicionPermisoEsquema[] = [
  {
    id: 'crear_proyecto',
    grupo: 'Proyectos',
    nombre: 'Crear proyectos',
    descripcion: 'Permite crear nuevos proyectos y definir su alcance inicial.',
    rolesBase: ['admin'],
    llaveCurable: 'gp.crear_proyecto',
  },
  {
    id: 'editar_proyecto',
    grupo: 'Proyectos',
    nombre: 'Editar información del proyecto',
    descripcion: 'Modifica nombre, fechas, sedes y parámetros generales del proyecto.',
    rolesBase: ['admin'],
    llaveCurable: 'gp.editar_proyecto',
  },
  {
    id: 'eliminar_proyecto',
    grupo: 'Proyectos',
    nombre: 'Eliminar proyectos',
    descripcion: 'Permite eliminar permanentemente proyectos y sus datos asociados (permiso especial).',
    rolesBase: ['admin'],
    llaveCurable: 'gp.eliminar_proyecto',
  },
  {
    id: 'consultar_proyecto',
    grupo: 'Proyectos',
    nombre: 'Consultar proyectos de la empresa',
    descripcion: 'Acceso de lectura al resumen, cronograma y reportes del tenant.',
    rolesBase: ['admin', 'editor', 'operativo', 'visor'],
  },
  {
    id: 'administrar_edt',
    grupo: 'Estructura EDT',
    nombre: 'Administrar estructura EDT',
    descripcion: 'Crea, reorganiza o elimina componentes, hitos y entregables en el Gantt.',
    rolesBase: ['admin'],
    llaveCurable: 'gp.administrar_edt',
  },
  {
    id: 'crear_tarea',
    grupo: 'Tareas y Seguimiento',
    nombre: 'Crear tareas y actividades',
    descripcion: 'Registra nuevas tareas operativas dentro de los proyectos asignados.',
    rolesBase: ['admin', 'editor', 'operativo'],
  },
  {
    id: 'editar_propio',
    grupo: 'Tareas y Seguimiento',
    nombre: 'Editar tareas propias',
    descripcion: 'Actualiza el avance, fechas y estado de las tareas creadas por el usuario.',
    rolesBase: ['admin', 'editor', 'operativo'],
  },
  {
    id: 'editar_ajena',
    grupo: 'Tareas y Seguimiento',
    nombre: 'Editar tareas de otros integrantes',
    descripcion: 'Modifica tareas y avances asignados a cualquier miembro del equipo.',
    rolesBase: ['admin', 'editor'],
  },
  {
    id: 'registrar_personas',
    grupo: 'Equipo y Gobernanza',
    nombre: 'Registrar / invitar personas y equipos',
    descripcion: 'Agrega integrantes en el módulo Equipo y habilita responsables operativos.',
    rolesBase: ['admin'],
    llaveCurable: 'gp.registrar_personas',
  },
  {
    id: 'administrar_permisos',
    grupo: 'Equipo y Gobernanza',
    nombre: 'Administrar permisos de la empresa',
    descripcion: 'Asigna roles y llaves delicadas sobre el directorio de usuarios del tenant.',
    rolesBase: ['admin'],
  },
];

export default function PermisosTab() {
  const { perfil, capacidades } = usePerfilGp();
  const [estado, setEstado] = useState<EstadoCarga>({ fase: 'cargando' });
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [llaveEditando, setLlaveEditando] = useState<LlavePermiso | null>(null);
  const [invitarAbierto, setInvitarAbierto] = useState(false);
  const [metodoAlta, setMetodoAlta] = useState<'correo' | 'directo'>('correo');
  const [inviteModo, setInviteModo] = useState<'uno' | 'varios'>('uno');
  const [inviteNombre, setInviteNombre] = useState('');
  const [inviteApellido, setInviteApellido] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTelefono, setInviteTelefono] = useState('');
  const [inviteClave, setInviteClave] = useState('');
  const [inviteRol, setInviteRol] = useState<'editor' | 'viewer' | 'guest'>('editor');
  const [inviteUnidadId, setInviteUnidadId] = useState('');
  const [inviteUnidadLote, setInviteUnidadLote] = useState('');
  const [unidadesArea, setUnidadesArea] = useState<SelectOption[]>([]);
  const [inviteFilas, setInviteFilas] = useState<Array<{ id: string; nombre: string; apellido: string; email: string; telefono: string; clave: string; rol: 'editor' | 'viewer' | 'guest'; unidadId: string }>>([
    { id: 'fila-1', nombre: '', apellido: '', email: '', telefono: '', clave: '', rol: 'editor', unidadId: '' },
  ]);
  const [credencialesCreadas, setCredencialesCreadas] = useState<Array<{ tipo: 'directo' | 'correo'; nombre: string; email: string; telefono: string; password: string; enviado?: boolean }>>([]);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [copiadoResumen, setCopiadoResumen] = useState(false);
  const [llavesMenuAbiertoId, setLlavesMenuAbiertoId] = useState<string | null>(null);
  const [miembrosUnidad, setMiembrosUnidad] = useState<Record<string, string>>({});
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [areasAbiertas, setAreasAbiertas] = useState<Record<string, boolean>>({});
  const [esquemaAbierto, setEsquemaAbierto] = useState<Record<string, boolean>>({});
  const [unidadResponsableId, setUnidadResponsableId] = useState<string | null>(null);
  const [llaveUserMenuAbierto, setLlaveUserMenuAbierto] = useState(false);
  const [llaveUserFiltro, setLlaveUserFiltro] = useState('');
  const [llaveAreasAbiertas, setLlaveAreasAbiertas] = useState<Record<string, boolean>>({});
  const [guardandoLoteLlave, setGuardandoLoteLlave] = useState(false);
  const inviteInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [enviandoInvite, setEnviandoInvite] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  const puedeAdministrar = Boolean(perfil) && capacidades.administrarPermisos;

  const cargar = () => {
    setEstado({ fase: 'cargando' });
    listarUsuariosEmpresa()
      .then((r) => {
        if (r.estado === 'lista') {
          setEstado({ fase: 'lista', usuarios: r.usuarios });
          const iniciales: Record<string, Borrador> = {};
          r.usuarios.forEach((u) => {
            iniciales[u.id] = { rol: u.rol ?? 'visor', permisos: [...u.permisos] };
          });
          setBorradores(iniciales);
        } else {
          setEstado({ fase: 'error', mensaje: r.mensaje });
        }
      })
      .catch((e: unknown) => {
        setEstado({ fase: 'error', mensaje: e instanceof Error ? e.message : 'Error desconocido.' });
      });
  };

  useEffect(() => {
    if (!puedeAdministrar) return;
    cargar();
    if (perfil?.tenantId) {
      Promise.all([
        listarUnidadesParaJerarquia({ tenantId: perfil.tenantId }).catch(() => []),
        supabase
          ? supabase
              .from('gestor_unidad_miembros')
              .select('user_id, unit_id')
              .eq('tenant_id', perfil.tenantId)
              .eq('status', 'active')
              .then((res) => (res.data ?? []) as Array<{ user_id: string | null; unit_id: string }>, () => [])
          : Promise.resolve([]),
        supabase
          ? supabase
              .from('gp_config_gestion_proyectos')
              .select('unidad_responsable_id')
              .eq('empresa_id', perfil.tenantId)
              .maybeSingle()
              .then((res) => (res.data?.unidad_responsable_id ? String(res.data.unidad_responsable_id) : null), () => null)
          : Promise.resolve(null),
      ]).then(([rows, miembros, respId]) => {
        setUnidadResponsableId(respId);
        const mapa = calcularNumeracion(aNodosJerarquia(rows));
        const ordenarPorRuta = (aId: string, bId: string): number => {
          const pa = (mapa.get(aId)?.ruta ?? '9999').split('.').map(Number);
          const pb = (mapa.get(bId)?.ruta ?? '9999').split('.').map(Number);
          const len = Math.max(pa.length, pb.length);
          for (let i = 0; i < len; i += 1) {
            const va = pa[i] ?? 0;
            const vb = pb[i] ?? 0;
            if (va !== vb) return va - vb;
          }
          return 0;
        };
        const ordenadas = [...rows].sort((a, b) => ordenarPorRuta(a.id, b.id));
        const opciones: SelectOption[] = ordenadas.map((u) => {
          const info = mapa.get(u.id);
          return {
            value: u.id,
            label: respId && u.id === respId ? `${u.name} · Área responsable` : u.name,
            badge: info?.ruta,
            nivel: info?.nivel ?? 1,
            parentValue: u.parentUnitId,
          };
        });
        setUnidadesArea(opciones);

        const mapaMiembros: Record<string, string> = {};
        for (const m of miembros) {
          if (m.user_id && m.unit_id) mapaMiembros[m.user_id] = m.unit_id;
        }
        setMiembrosUnidad(mapaMiembros);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeAdministrar, perfil?.tenantId]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 4000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  useEffect(() => {
    if (!llavesMenuAbiertoId && !llaveUserMenuAbierto) return;
    const onDoc = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (llavesMenuAbiertoId && !target?.closest('[data-llaves-menu="true"]')) {
        setLlavesMenuAbiertoId(null);
      }
      if (llaveUserMenuAbierto && !target?.closest('[data-llave-user-menu="true"]')) {
        setLlaveUserMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [llavesMenuAbiertoId, llaveUserMenuAbierto]);

  const gruposPorArea = useMemo(() => {
    const usuarios = estado.fase === 'lista' ? estado.usuarios : [];
    const q = busquedaUsuario.trim().toLowerCase();
    const filtrados = usuarios.filter((u) => {
      if ((u.rol ?? 'visor') === 'admin') return false;
      if (!q) return true;
      return (u.nombre ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q);
    });

    const porUnidad = new Map<string, UsuarioEmpresa[]>();
    for (const u of filtrados) {
      const key = miembrosUnidad[u.id] || '__SIN_AREA__';
      const arr = porUnidad.get(key) ?? [];
      arr.push(u);
      porUnidad.set(key, arr);
    }

    const resultado: Array<{ key: string; badge?: string; label: string; usuarios: UsuarioEmpresa[] }> = [];
    for (const area of unidadesArea) {
      const lista = porUnidad.get(area.value);
      if (lista && lista.length > 0) {
        resultado.push({ key: area.value, badge: area.badge, label: area.label, usuarios: lista });
        porUnidad.delete(area.value);
      }
    }
    const sinArea = porUnidad.get('__SIN_AREA__');
    if (sinArea && sinArea.length > 0) {
      resultado.push({ key: '__SIN_AREA__', label: 'Sin área asignada', usuarios: sinArea });
      porUnidad.delete('__SIN_AREA__');
    }
    for (const [k, lista] of porUnidad.entries()) {
      if (lista.length > 0) {
        resultado.push({ key: k, label: 'Área no listada', usuarios: lista });
      }
    }
    return resultado;
  }, [estado, busquedaUsuario, miembrosUnidad, unidadesArea]);

  if (!perfil) {
    return (
      <div style={estiloPanel}>
        <Aviso
          icono={<ShieldCheck size={18} />}
          titulo="Permisos con identidad real"
          texto="Los permisos se administran con la sesión de Qaway Hub. Inicia sesión (o recarga dentro del Hub) para ver este panel."
        />
      </div>
    );
  }

  if (!puedeAdministrar) {
    return (
      <div style={estiloPanel}>
        <Aviso
          icono={<ShieldCheck size={18} />}
          titulo="Solo el admin de la empresa"
          texto="Tu rol puede consultar este panel pero no curar permisos. Solicita cambios al admin de tu empresa."
        />
      </div>
    );
  }

  if (estado.fase === 'cargando') {
    return <div style={estiloPanel}><p style={estiloTexto}>Cargando directorio de la empresa…</p></div>;
  }

  if (estado.fase === 'error') {
    return (
      <div style={estiloPanel}>
        <Aviso icono={<ShieldCheck size={18} />} titulo="No disponible" texto={estado.mensaje} />
        <button type="button" style={estiloBotonSecundario} onClick={cargar}>Reintentar</button>
      </div>
    );
  }

  const guardar = async (u: UsuarioEmpresa) => {
    const borrador = borradores[u.id];
    if (!borrador || !perfil.tenantId) return;
    setGuardandoId(u.id);
    setAviso(null);
    const r = await guardarRolGp({
      userId: u.id,
      tenantId: perfil.tenantId,
      rol: borrador.rol,
      permisos: borrador.permisos,
    });
    setGuardandoId(null);
    if (r.ok) {
      setAviso({ tipo: 'ok', texto: `Permisos de "${u.nombre ?? u.email ?? u.id}" guardados.` });
      cargar();
    } else {
      setAviso({ tipo: 'error', texto: r.mensaje });
    }
  };

  const agregarFilaInvite = (rolBase: 'editor' | 'viewer' | 'guest', unidadBase?: string) => {
    const nuevaId = `fila-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setInviteFilas((prev) => [
      ...prev,
      { id: nuevaId, nombre: '', apellido: '', email: '', telefono: '', clave: '', rol: rolBase, unidadId: unidadBase ?? inviteUnidadLote },
    ]);
    requestAnimationFrame(() => inviteInputRefs.current[nuevaId]?.focus());
  };

  const resolverEnlaceCorreo = (email: string): string => {
    const dom = email.split('@')[1]?.toLowerCase() ?? '';
    if (dom === 'gmail.com' || dom === 'googlemail.com') return 'https://mail.google.com';
    if (dom.startsWith('outlook.') || dom.startsWith('hotmail.') || dom.startsWith('live.')) return 'https://outlook.live.com';
    return `${window.location.origin}/login?redirect=${encodeURIComponent('/hub/gestor_proyectos')}`;
  };

  const armarMensajeAcceso = (cred: { tipo: 'directo' | 'correo'; nombre: string; email: string; password: string }) => {
    const saludo = cred.nombre ? `Hola ${cred.nombre},` : 'Hola,';
    if (cred.tipo === 'correo') {
      const correoUrl = resolverEnlaceCorreo(cred.email);
      return `${saludo} te enviamos una invitación al Gestor de Proyectos al correo ${cred.email}.\n\nRevisa tu bandeja de entrada (o spam) aquí: ${correoUrl}`;
    }
    const link = `${window.location.origin}/login?redirect=${encodeURIComponent('/hub/gestor_proyectos')}`;
    return `${saludo} ya tienes acceso al Gestor de Proyectos.\n\nIngresa aquí: ${link}\nUsuario: ${cred.email}\nClave provisional: ${cred.password}\n\nPor seguridad, el sistema te pedirá cambiar la clave en tu primer ingreso.`;
  };

  const normalizarTelefonoWa = (tel: string): string => {
    const digits = tel.replace(/\D/g, '');
    if (digits.length === 9 && digits.startsWith('9')) return `51${digits}`;
    return digits;
  };

  const enviarInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !perfil.tenantId) return;

    const items = inviteModo === 'uno'
      ? (inviteEmail.trim()
          ? [{ nombre: inviteNombre.trim(), apellido: inviteApellido.trim(), email: inviteEmail.trim(), telefono: inviteTelefono.trim(), clave: inviteClave.trim(), rol: inviteRol, unidadId: inviteUnidadId }]
          : [])
      : inviteFilas
          .map((f) => ({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), email: f.email.trim(), telefono: f.telefono.trim(), clave: f.clave.trim(), rol: f.rol, unidadId: f.unidadId }))
          .filter((f) => f.email.length > 0);

    if (items.length === 0) {
      setAviso({ tipo: 'error', texto: 'Ingresa al menos un correo electrónico válido.' });
      return;
    }
    const invalidos = items.filter((c) => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email));
    if (invalidos.length > 0) {
      setAviso({ tipo: 'error', texto: `Correo no válido: ${invalidos[0].email}` });
      return;
    }

    if (metodoAlta === 'directo') {
      const claveCorta = items.find((c) => c.clave.length > 0 && c.clave.length < 8);
      if (claveCorta) {
        setAviso({ tipo: 'error', texto: `La clave provisional para "${claveCorta.email}" debe tener al menos 8 caracteres (o déjala vacía para generarla automática).` });
        return;
      }
    }

    const correosExistentes = new Set(
      estado.fase === 'lista'
        ? estado.usuarios.map((u) => (u.email ?? '').trim().toLowerCase()).filter(Boolean)
        : [],
    );
    const yaEnEmpresa = items.find((c) => correosExistentes.has(c.email.toLowerCase()));
    if (yaEnEmpresa) {
      setAviso({ tipo: 'error', texto: `El correo "${yaEnEmpresa.email}" ya pertenece a esta empresa (correo duplicado).` });
      return;
    }

    const vistosLote = new Set<string>();
    for (const c of items) {
      const key = c.email.toLowerCase();
      if (vistosLote.has(key)) {
        setAviso({ tipo: 'error', texto: `Correo duplicado en el lote: ${c.email}` });
        return;
      }
      vistosLote.add(key);
    }

    setEnviandoInvite(true);
    setAviso(null);
    let enviadas = 0;
    let existentes = 0;
    let errores = 0;
    let ultimoError = '';
    const nuevasCreds: Array<{ tipo: 'directo' | 'correo'; nombre: string; email: string; telefono: string; password: string; enviado?: boolean }> = [];

    try {
      for (const item of items) {
        if (metodoAlta === 'correo') {
          const { data, error: invokeError } = await supabase.functions.invoke('invite-user', {
            body: {
              email: item.email,
              tenant_id: perfil.tenantId,
              role: item.rol,
              app_slugs: [APP_SLUG],
              unidad_id: item.unidadId || null,
              full_name: item.nombre || null,
              last_name: item.apellido || null,
            },
          });
          if (invokeError && !data?.error && !data?.status) {
            errores += 1;
            ultimoError = 'No se pudo enviar la invitación.';
          } else if (data?.status === 'existing_account' || data?.status === 'already_member') {
            existentes += 1;
          } else if (data?.error) {
            errores += 1;
            ultimoError = String(data.error);
          } else {
            enviadas += 1;
            nuevasCreds.push({
              tipo: 'correo',
              nombre: [item.nombre, item.apellido].filter(Boolean).join(' '),
              email: item.email,
              telefono: item.telefono,
              password: '',
              enviado: false,
            });
          }
        } else {
          const { data, error: invokeError } = await supabase.functions.invoke('admin-provision-user', {
            body: {
              action: 'create',
              email: item.email,
              tenant_id: perfil.tenantId,
              role: item.rol,
              app_slugs: [APP_SLUG],
              unidad_id: item.unidadId || null,
              full_name: item.nombre || null,
              last_name: item.apellido || null,
              phone: item.telefono || null,
              ...(item.clave ? { password: item.clave } : {}),
            },
          });
          if (invokeError && !data?.error && !data?.status) {
            errores += 1;
            ultimoError = 'No se pudo crear la cuenta.';
          } else if (data?.status === 'already_exists') {
            existentes += 1;
          } else if (data?.error) {
            errores += 1;
            ultimoError = String(data.error);
          } else if (data?.provisional_password) {
            enviadas += 1;
            nuevasCreds.push({
              tipo: 'directo',
              nombre: [item.nombre, item.apellido].filter(Boolean).join(' '),
              email: data.email || item.email,
              telefono: item.telefono,
              password: String(data.provisional_password),
              enviado: false,
            });
          }
        }
      }

      if (nuevasCreds.length > 0) {
        setCredencialesCreadas((prev) => [...nuevasCreds, ...prev]);
      }

      if (items.length === 1) {
        if (enviadas === 1) {
          setInviteNombre('');
          setInviteApellido('');
          setInviteEmail('');
          setInviteTelefono('');
          setInviteClave('');
          setInviteUnidadId('');
          setInviteUnidadLote('');
          setInviteFilas([{ id: `fila-${Date.now()}`, nombre: '', apellido: '', email: '', telefono: '', clave: '', rol: 'editor', unidadId: '' }]);
          setInvitarAbierto(false);
          setAviso({
            tipo: 'ok',
            texto: metodoAlta === 'correo'
              ? `Invitación enviada a "${items[0].email}".`
              : `Cuenta creada para "${items[0].email}". Ya puedes copiar o enviar su acceso por WhatsApp.`,
          });
          cargar();
        } else if (existentes === 1) {
          setAviso({ tipo: 'error', texto: `El correo "${items[0].email}" ya tiene cuenta o ya pertenece a esta empresa.` });
        } else {
          setAviso({ tipo: 'error', texto: ultimoError || 'No se pudo completar el alta.' });
        }
        return;
      }

      if (enviadas > 0) {
        setInviteUnidadLote('');
        setInviteFilas([{ id: `fila-${Date.now()}`, nombre: '', apellido: '', email: '', telefono: '', clave: '', rol: 'editor', unidadId: '' }]);
        setInvitarAbierto(false);
        cargar();
      }
      setAviso({
        tipo: errores > 0 && enviadas === 0 ? 'error' : 'ok',
        texto: `Lote procesado: ${enviadas} enviada(s)${existentes ? ` · ${existentes} ya registrada(s)` : ''}${errores ? ` · ${errores} con error (${ultimoError})` : ''}.`,
      });
    } finally {
      setEnviandoInvite(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={estiloPanel}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div>
            <b style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>
              Roles de Gestor de Proyectos
            </b>
            <span style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.45, display: 'block' }}>
              Asigna roles, áreas y llaves delicadas a los integrantes de tu empresa.
            </span>
          </div>
        </div>
        {(capacidades.administrarPermisos || capacidades.registrarPersonas) && (
          <button
            type="button"
            onClick={() => {
              setAviso(null);
              setInvitarAbierto((v) => !v);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 13px',
              borderRadius: '8px',
              border: invitarAbierto ? '1px solid #cbd5e1' : 'none',
              background: invitarAbierto ? '#ffffff' : '#2563eb',
              color: invitarAbierto ? '#0f172a' : '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {invitarAbierto ? <X size={14} /> : <UserPlus size={14} />}
            <span>{invitarAbierto ? 'Cerrar' : 'Invitar usuario'}</span>
          </button>
        )}
      </div>

      {aviso && (
        <div
          style={{
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
          }}
        >
          {aviso.tipo === 'ok' ? (
            <CheckCircle2 size={16} color="#00b96b" />
          ) : (
            <ShieldAlert size={16} color="#dc2626" />
          )}
          <span>{aviso.texto}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {estado.usuarios
          .filter((u) => (u.rol ?? 'visor') === 'admin')
          .map((u) => (
            <div key={u.id} style={estiloFila}>
              <div style={{ minWidth: '220px', flex: 1 }}>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{u.nombre ?? 'Sin nombre'}</b>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>{u.email ?? u.id}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '12px', fontWeight: 600 }}>
                <ShieldCheck size={14} />
                <span>Admin de empresa · Acceso total (todas las llaves incluidas)</span>
              </span>
            </div>
          ))}

        {invitarAbierto && (
          <form
            onSubmit={enviarInvitacion}
            style={{
              marginLeft: '20px',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #bfdbfe',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {metodoAlta === 'correo' ? <Mail size={14} /> : <KeyRound size={14} />}
                </div>
                <div>
                  <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                    {metodoAlta === 'correo' ? 'Invitar integrante(s) por correo' : 'Alta directa con clave provisional'}
                  </b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {metodoAlta === 'correo'
                      ? 'Se enviará enlace de invitación por correo vinculado a tu empresa.'
                      : 'Crea la cuenta al instante con enlace de acceso, clave provisional y cambio obligatorio al entrar.'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', gap: '4px', padding: '3px', borderRadius: '8px', background: '#e2e8f0' }}>
                  {([
                    { id: 'correo', label: 'Por correo' },
                    { id: 'directo', label: 'Acceso directo' },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoAlta(m.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: metodoAlta === m.id ? '#ffffff' : 'transparent',
                        color: metodoAlta === m.id ? '#0f172a' : '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'inline-flex', gap: '4px', padding: '3px', borderRadius: '8px', background: '#e2e8f0' }}>
                  {(['uno', 'varios'] as const).map((modo) => (
                    <button
                      key={modo}
                      type="button"
                      onClick={() => setInviteModo(modo)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: inviteModo === modo ? '#ffffff' : 'transparent',
                        color: inviteModo === modo ? '#0f172a' : '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {modo === 'uno' ? 'Uno' : 'Varios'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {inviteModo === 'uno' ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  Nombre (opcional)
                  <input
                    type="text"
                    value={inviteNombre}
                    onChange={(e) => setInviteNombre(e.target.value)}
                    placeholder="Ej. Ana"
                    style={{ height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a', fontWeight: 400 }}
                  />
                </label>
                <label style={{ flex: '1 1 130px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  Apellido (opcional)
                  <input
                    type="text"
                    value={inviteApellido}
                    onChange={(e) => setInviteApellido(e.target.value)}
                    placeholder="Ej. Torres"
                    style={{ height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a', fontWeight: 400 }}
                  />
                </label>
                <label style={{ flex: '2 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="nombre@empresa.com"
                    style={{ height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a', fontWeight: 400 }}
                  />
                </label>
                <label style={{ flex: '1.2 1 150px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  Teléfono (WhatsApp)
                  <input
                    type="tel"
                    value={inviteTelefono}
                    onChange={(e) => setInviteTelefono(e.target.value)}
                    placeholder="Ej. 999888777"
                    style={{ height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a', fontWeight: 400 }}
                  />
                </label>
                {metodoAlta === 'directo' && (
                  <label style={{ flex: '1.3 1 170px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                    Clave provisional (opcional)
                    <input
                      type="text"
                      value={inviteClave}
                        onChange={(e) => setInviteClave(e.target.value)}
                        placeholder="Auto o DNI (8+ car.)"
                        style={{ height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a', fontWeight: 400 }}
                      />
                    </label>
                )}
                <div style={{ flex: '1.5 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  <span>Área / Unidad</span>
                  <SelectEstilizado
                    value={inviteUnidadId}
                    placeholder="Sin área asignada (opcional)"
                    options={[{ value: '', label: 'Sin área asignada (opcional)' }, ...unidadesArea]}
                    onChange={(val) => setInviteUnidadId(val)}
                  />
                </div>
                <div style={{ flex: '1.3 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  <span>Rol inicial</span>
                  <SelectEstilizado
                    value={inviteRol}
                    options={[
                      { value: 'editor', label: 'Editor (opera y registra)' },
                      { value: 'viewer', label: 'Visor (solo lectura)' },
                      { value: 'guest', label: 'Invitado (consulta limitada)' },
                    ]}
                    onChange={(val) => setInviteRol(val as 'editor' | 'viewer' | 'guest')}
                  />
                </div>
                <button
                  type="submit"
                  disabled={enviandoInvite}
                  style={{ ...estiloBotonPrimario, height: '38px', padding: '0 14px', boxSizing: 'border-box', borderRadius: '8px', fontSize: '13.5px', opacity: enviandoInvite ? 0.65 : 1 }}
                >
                  {metodoAlta === 'correo' ? <Send size={13} /> : <KeyRound size={13} />}
                  <span>
                    {enviandoInvite
                      ? 'Procesando…'
                      : metodoAlta === 'correo'
                        ? 'Enviar invitación'
                        : 'Crear acceso directo'}
                  </span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '8px 10px', borderRadius: '8px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Área para todo el lote:</span>
                  <div style={{ flex: '1 1 240px', maxWidth: '340px' }}>
                    <SelectEstilizado
                      value={inviteUnidadLote}
                      placeholder="Sin área asignada (aplicar a filas)"
                      options={[{ value: '', label: 'Sin área asignada (opcional)' }, ...unidadesArea]}
                      onChange={(val) => {
                        setInviteUnidadLote(val);
                        setInviteFilas((prev) => prev.map((f) => ({ ...f, unidadId: val })));
                      }}
                    />
                  </div>
                </div>
                {inviteFilas.map((fila, idx) => (
                  <div key={fila.id} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={fila.nombre}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, nombre: val } : f)));
                      }}
                      placeholder="Nombre"
                      style={{ flex: '1 1 100px', height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a' }}
                    />
                    <input
                      type="text"
                      value={fila.apellido}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, apellido: val } : f)));
                      }}
                      placeholder="Apellido"
                      style={{ flex: '1 1 100px', height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a' }}
                    />
                    <input
                      ref={(el) => { inviteInputRefs.current[fila.id] = el; }}
                      type="email"
                      value={fila.email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, email: val } : f)));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const siguiente = inviteFilas[idx + 1];
                          if (siguiente) {
                            inviteInputRefs.current[siguiente.id]?.focus();
                          } else {
                            agregarFilaInvite(fila.rol, fila.unidadId);
                          }
                        }
                      }}
                      placeholder={`correo${idx + 1}@empresa.com (Enter)`}
                      style={{ flex: '2 1 180px', height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a' }}
                    />
                    <input
                      type="tel"
                      value={fila.telefono}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, telefono: val } : f)));
                      }}
                      placeholder="Teléfono (WhatsApp)"
                      style={{ flex: '1 1 125px', height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a' }}
                    />
                    {metodoAlta === 'directo' && (
                      <input
                        type="text"
                        value={fila.clave}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, clave: val } : f)));
                        }}
                        placeholder="Clave (auto/DNI)"
                        style={{ flex: '1 1 120px', height: '38px', padding: '0 12px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13.5px', color: '#0f172a' }}
                      />
                    )}
                    <div style={{ flex: '1.5 1 180px' }}>
                      <SelectEstilizado
                        value={fila.unidadId}
                        placeholder="Área / Unidad"
                        options={[{ value: '', label: 'Sin área asignada' }, ...unidadesArea]}
                        onChange={(val) => setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, unidadId: val } : f)))}
                      />
                    </div>
                    <div style={{ flex: '1 1 140px' }}>
                      <SelectEstilizado
                        value={fila.rol}
                        options={[
                          { value: 'editor', label: 'Editor' },
                          { value: 'viewer', label: 'Visor' },
                          { value: 'guest', label: 'Invitado' },
                        ]}
                        onChange={(val) => {
                          const v = val as 'editor' | 'viewer' | 'guest';
                          setInviteFilas((prev) => prev.map((f) => (f.id === fila.id ? { ...f, rol: v } : f)));
                        }}
                      />
                    </div>
                    {inviteFilas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setInviteFilas((prev) => prev.filter((f) => f.id !== fila.id))}
                        title="Quitar fila"
                        style={{ width: '38px', height: '38px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => agregarFilaInvite(inviteFilas[inviteFilas.length - 1]?.rol ?? 'editor', inviteFilas[inviteFilas.length - 1]?.unidadId ?? inviteUnidadLote)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '7px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Plus size={13} />
                    <span>Agregar fila</span>
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoInvite}
                    style={{ ...estiloBotonPrimario, height: '38px', padding: '0 14px', boxSizing: 'border-box', borderRadius: '8px', fontSize: '13.5px', opacity: enviandoInvite ? 0.65 : 1 }}
                  >
                    {metodoAlta === 'correo' ? <Send size={13} /> : <KeyRound size={13} />}
                    <span>
                      {enviandoInvite
                        ? 'Procesando…'
                        : metodoAlta === 'correo'
                          ? 'Enviar invitaciones'
                          : 'Crear accesos directos'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {credencialesCreadas.length > 0 && (
          <div
            style={{
              marginLeft: '20px',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <KeyRound size={15} color="#2563eb" />
                <b style={{ fontSize: '13px', color: '#0f172a' }}>
                  Accesos y avisos listos para entregar ({credencialesCreadas.length})
                </b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const resumen = credencialesCreadas.map((c) => armarMensajeAcceso(c)).join('\n\n---\n\n');
                    navigator.clipboard?.writeText(resumen);
                    setCopiadoResumen(true);
                    window.setTimeout(() => setCopiadoResumen(false), 2000);
                  }}
                  style={{ ...estiloBotonSecundario, height: '32px', padding: '0 10px', boxSizing: 'border-box', fontSize: '12px' }}
                >
                  <Copy size={13} />
                  <span>{copiadoResumen ? 'Resumen copiado' : 'Copiar resumen completo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCredencialesCreadas([])}
                  style={{ ...estiloBotonSecundario, height: '32px', padding: '0 10px', boxSizing: 'border-box', fontSize: '12px' }}
                >
                  <X size={13} />
                  <span>Ocultar</span>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {credencialesCreadas.map((cred, i) => {
                const msg = armarMensajeAcceso(cred);
                const telWa = cred.telefono ? normalizarTelefonoWa(cred.telefono) : '';
                const waUrl = telWa
                  ? `https://wa.me/${telWa}?text=${encodeURIComponent(msg)}`
                  : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                const correoUrl = resolverEnlaceCorreo(cred.email);
                return (
                  <div
                    key={`${cred.email}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      flexWrap: 'wrap',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ minWidth: '220px', flex: 1 }}>
                      <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                        {cred.nombre || cred.email}
                      </b>
                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {cred.tipo === 'directo' ? (
                          <>
                            Usuario: <b>{cred.email}</b> · Clave provisional: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, color: '#0f172a' }}>{cred.password}</code>
                          </>
                        ) : (
                          <>
                            Invitación enviada a <b>{cred.email}</b> · Bandeja:{' '}
                            <a href={correoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                              Abrir correo
                            </a>
                          </>
                        )}
                        {cred.telefono ? ` · Tel: ${cred.telefono}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(msg);
                          setCopiadoIdx(i);
                          window.setTimeout(() => setCopiadoIdx((cur) => (cur === i ? null : cur)), 2000);
                        }}
                        style={{
                          ...estiloBotonSecundario,
                          height: '34px',
                          padding: '0 12px',
                          boxSizing: 'border-box',
                          borderRadius: '8px',
                          fontSize: '12px',
                          lineHeight: '1',
                          margin: 0,
                        }}
                      >
                        <Copy size={13} />
                        <span>{copiadoIdx === i ? 'Copiado' : 'Copiar mensaje'}</span>
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...estiloBotonPrimario,
                          height: '34px',
                          padding: '0 12px',
                          boxSizing: 'border-box',
                          borderRadius: '8px',
                          fontSize: '12px',
                          lineHeight: '1',
                          margin: 0,
                          textDecoration: 'none',
                        }}
                      >
                        <Send size={13} />
                        <span>{cred.tipo === 'directo' ? 'Enviar por WhatsApp' : 'Avisar por WhatsApp'}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {estado.usuarios.filter((u) => (u.rol ?? 'visor') !== 'admin').length > 0 && (
          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
              <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar integrante por nombre o correo..."
                style={{ width: '100%', height: '36px', padding: '0 12px 0 32px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px', color: '#0f172a' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {gruposPorArea.length} {gruposPorArea.length === 1 ? 'grupo' : 'grupos'} por área
            </span>
          </div>
        )}

        {gruposPorArea.map((grupo) => {
          const abierta = busquedaUsuario.trim() !== '' || Boolean(areasAbiertas[grupo.key]);
          return (
            <div key={grupo.key} style={{ marginLeft: '20px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setAreasAbiertas((prev) => ({ ...prev, [grupo.key]: !prev[grupo.key] }))}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <ChevronRight
                    size={15}
                    style={{
                      color: '#64748b',
                      flexShrink: 0,
                      transform: abierta ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                  {grupo.badge && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', borderRadius: '5px', padding: '2px 7px', flexShrink: 0 }}>
                      {grupo.badge}
                    </span>
                  )}
                  <b style={{ fontSize: '13px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {grupo.label}
                  </b>
                  {unidadResponsableId && grupo.key === unidadResponsableId && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '1px 8px', flexShrink: 0 }}>
                      Área responsable
                    </span>
                  )}
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', background: '#e2e8f0', borderRadius: '999px', padding: '2px 9px', flexShrink: 0 }}>
                  {grupo.usuarios.length} {grupo.usuarios.length === 1 ? 'usuario' : 'usuarios'}
                </span>
              </button>
              {abierta && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 10px 10px' }}>
                  {grupo.usuarios.map((u) => {
                    const borrador = borradores[u.id] ?? { rol: 'visor', permisos: [] };
                    const sucio =
                      borrador.rol !== (u.rol ?? 'visor') ||
                      borrador.permisos.length !== u.permisos.length ||
                      borrador.permisos.some((k) => !u.permisos.includes(k));
                    const nombreLimpio = u.nombre && u.nombre.trim().toLowerCase() !== (u.email ?? '').trim().toLowerCase()
                      ? u.nombre
                      : null;
                    const menuLlavesAbierto = llavesMenuAbiertoId === u.id;
                    const resumenLlaves = borrador.permisos.length === 0
                      ? 'Sin llaves delicadas'
                      : borrador.permisos.length === 1
                        ? (ETIQUETAS_LLAVE[borrador.permisos[0]] ?? borrador.permisos[0])
                        : `${borrador.permisos.length} llaves activas`;
                    const opcionesRol = [
                      ...ROLES_GP.filter((r) => r !== 'admin').map((r) => ({ value: r, label: r })),
                      ...(!ROLES_GP.includes(borrador.rol as (typeof ROLES_GP)[number]) && borrador.rol
                        ? [{ value: borrador.rol, label: `${borrador.rol} (actual)` }]
                        : []),
                    ];
                    return (
                      <div key={u.id} style={{ ...estiloFila, background: '#ffffff', alignItems: 'flex-end' }}>
                        <div style={{ minWidth: '210px', flex: '1.5 1 210px', alignSelf: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <b style={{ fontSize: '13px', color: '#0f172a' }}>{nombreLimpio ?? (u.email ?? u.id)}</b>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: u.mustChangePassword ? '#fef3c7' : '#ecfdf5',
                                color: u.mustChangePassword ? '#b45309' : '#059669',
                                border: `1px solid ${u.mustChangePassword ? '#fde68a' : '#a7f3d0'}`,
                              }}
                            >
                              {u.mustChangePassword ? 'Pendiente de ingreso' : 'Activo'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: nombreLimpio ? '#64748b' : '#94a3b8', marginTop: '2px' }}>
                            {nombreLimpio ? (u.email ?? u.id) : 'Pendiente de nombre (invitado)'}
                            {u.phone ? ` · ${u.phone}` : ''}
                          </div>
                        </div>
                        <div style={{ flex: '0 0 140px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                          <span style={{ fontWeight: 600 }}>Rol</span>
                          <SelectEstilizado
                            value={borrador.rol}
                            options={opcionesRol}
                            onChange={(val) =>
                              setBorradores((prev) => ({ ...prev, [u.id]: { ...borrador, rol: val } }))
                            }
                          />
                        </div>
                        <div
                          data-llaves-menu="true"
                          style={{ position: 'relative', flex: '1 1 210px', maxWidth: '260px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                            <Key size={11} /> Llaves delicadas (v1)
                          </span>
                          <button
                            type="button"
                            onClick={() => setLlavesMenuAbiertoId((prev) => (prev === u.id ? null : u.id))}
                            style={{
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              boxSizing: 'border-box',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: borrador.permisos.length > 0 ? '#0f172a' : '#64748b',
                              fontSize: '13px',
                              fontWeight: borrador.permisos.length > 0 ? 500 : 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumenLlaves}</span>
                            <ChevronDown
                              size={14}
                              style={{
                                color: '#64748b',
                                flexShrink: 0,
                                transform: menuLlavesAbierto ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.15s ease',
                              }}
                            />
                          </button>
                          {menuLlavesAbierto && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                left: 0,
                                minWidth: '250px',
                                zIndex: 1200,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                              }}
                            >
                              {LLAVES_V1.map((llave) => {
                                const activa = borrador.permisos.includes(llave);
                                return (
                                  <button
                                    key={llave}
                                    type="button"
                                    onClick={() =>
                                      setBorradores((prev) => ({
                                        ...prev,
                                        [u.id]: {
                                          ...borrador,
                                          permisos: activa
                                            ? borrador.permisos.filter((k) => k !== llave)
                                            : [...borrador.permisos, llave],
                                        },
                                      }))
                                    }
                                    style={{
                                      width: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '10px',
                                      padding: '8px 10px',
                                      border: 'none',
                                      borderRadius: '7px',
                                      background: activa ? '#eff6ff' : 'transparent',
                                      color: activa ? '#1d4ed8' : '#334155',
                                      fontSize: '13px',
                                      fontWeight: activa ? 500 : 400,
                                      cursor: 'pointer',
                                      textAlign: 'left',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    <span>{ETIQUETAS_LLAVE[llave] ?? llave}</span>
                                    {activa && <Check size={14} />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <a
                          href={(() => {
                            const link = `${window.location.origin}/login?redirect=${encodeURIComponent('/hub/gestor_proyectos')}`;
                            const saludo = nombreLimpio ? `Hola ${nombreLimpio},` : 'Hola,';
                            const msg = u.mustChangePassword
                              ? `${saludo} recuerda ingresar al Gestor de Proyectos con tu correo ${u.email ?? ''} y cambiar tu clave provisional en tu primer acceso: ${link}`
                              : `${saludo} puedes ingresar al Gestor de Proyectos aquí: ${link}`;
                            const telWa = u.phone ? normalizarTelefonoWa(u.phone) : '';
                            return telWa
                              ? `https://wa.me/${telWa}?text=${encodeURIComponent(msg)}`
                              : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={u.phone ? `Enviar mensaje por WhatsApp a ${u.phone}` : 'Enviar mensaje por WhatsApp'}
                          style={{
                            ...estiloBotonSecundario,
                            height: '38px',
                            padding: '0 12px',
                            boxSizing: 'border-box',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            lineHeight: '1',
                            textDecoration: 'none',
                          }}
                        >
                          <Send size={13} />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          style={{ ...estiloBotonPrimario, height: '38px', padding: '0 14px', boxSizing: 'border-box', borderRadius: '8px', opacity: sucio ? 1 : 0.5, cursor: sucio ? 'pointer' : 'default' }}
                          disabled={!sucio || guardandoId === u.id}
                          onClick={() => guardar(u)}
                        >
                          <Save size={13} />
                          {guardandoId === u.id ? 'Guardando…' : 'Guardar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {estado.usuarios.length === 0 && (
          <p style={estiloTexto}>La empresa no tiene usuarios en el directorio (public.users del tenant).</p>
        )}
      </div>
      <p style={{ ...estiloTexto, marginTop: '16px', fontSize: '12px', lineHeight: 1.5 }}>
        El rol <b>admin</b> lo ve todo; <b>editor</b> + llaves = totales; <b>operativo</b> registra lo suyo;
        <b> visor</b> solo consulta. El mando real vive en RLS — aquí se curan las llaves del jsonb.
      </p>
    </div>

      {/* Cápsula independiente: Esquema completo de permisos del Gestor */}
      <div style={{ ...estiloPanel, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <b style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '4px' }}>Esquema de Permisos de Gestor de Proyectos</b>
            <span style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.45, display: 'block' }}>
              Detalle completo de capacidades por módulo. Los permisos con llave curable permiten otorgar acceso puntual a usuarios específicos.
            </span>
          </div>
        </div>

        {(['Proyectos', 'Estructura EDT', 'Tareas y Seguimiento', 'Equipo y Gobernanza'] as const).map((grupo) => {
          const items = ESQUEMA_PERMISOS.filter((p) => p.grupo === grupo);
          const grupoAbierto = Boolean(esquemaAbierto[grupo]);
          const iconoGrupo = grupo === 'Proyectos'
            ? <FolderKanban size={15} color="#2563eb" />
            : grupo === 'Estructura EDT'
              ? <Layers size={15} color="#2563eb" />
              : grupo === 'Tareas y Seguimiento'
                ? <CheckSquare size={15} color="#2563eb" />
                : <Users size={15} color="#2563eb" />;
          return (
            <div key={grupo} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: grupoAbierto ? 'visible' : 'hidden', background: '#ffffff' }}>
              <button
                type="button"
                onClick={() => setEsquemaAbierto((prev) => ({ ...prev, [grupo]: !prev[grupo] }))}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  background: '#f8fafc',
                  border: 'none',
                  borderRadius: grupoAbierto ? '10px 10px 0 0' : '10px',
                  borderBottom: grupoAbierto ? '1px solid #e2e8f0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <ChevronRight
                    size={15}
                    style={{
                      color: '#64748b',
                      transform: grupoAbierto ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                  {iconoGrupo}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{grupo}</span>
                </span>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', background: '#e2e8f0', borderRadius: '999px', padding: '2px 9px' }}>
                  {items.length} {items.length === 1 ? 'capacidad' : 'capacidades'}
                </span>
              </button>
              {grupoAbierto && items.map((item, idx) => {
                const usuariosNoAdmin = estado.usuarios.filter((u) => (u.rol ?? 'visor') !== 'admin');
                const usuariosConLlave = item.llaveCurable
                  ? usuariosNoAdmin.filter((u) => u.permisos.includes(item.llaveCurable!))
                  : [];
                const editandoEstaLlave = Boolean(item.llaveCurable && llaveEditando === item.llaveCurable);
                const aplicarLlaveLote = async (objetivos: UsuarioEmpresa[], otorgar: boolean, contexto: string) => {
                  if (!perfil.tenantId || !item.llaveCurable || objetivos.length === 0) return;
                  setGuardandoLoteLlave(true);
                  const res = await Promise.all(
                    objetivos.map((u) => {
                      const nuevos = otorgar
                        ? Array.from(new Set([...u.permisos, item.llaveCurable!]))
                        : u.permisos.filter((k) => k !== item.llaveCurable);
                      return guardarRolGp({
                        userId: u.id,
                        tenantId: perfil.tenantId!,
                        rol: u.rol ?? 'visor',
                        permisos: nuevos,
                      });
                    }),
                  );
                  setGuardandoLoteLlave(false);
                  const okCount = res.filter((r) => r.ok).length;
                  if (okCount > 0) {
                    setAviso({
                      tipo: 'ok',
                      texto: otorgar
                        ? `Llave otorgada a ${okCount} integrante(s) (${contexto}).`
                        : `Llave retirada de ${okCount} integrante(s) (${contexto}).`,
                    });
                    cargar();
                  } else {
                    setAviso({ tipo: 'error', texto: res[0]?.mensaje || 'No se pudo actualizar la llave.' });
                  }
                };
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '16px 18px',
                      borderTop: idx === 0 ? 'none' : '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1.2 1 230px', minWidth: '200px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{item.nombre}</div>
                      <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px', lineHeight: 1.45 }}>{item.descripcion}</div>
                    </div>
                    <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b' }}>Otorgado a</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {item.rolesBase.map((r) => (
                          <span key={r} style={{ padding: '2px 8px', borderRadius: '999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '11.5px', fontWeight: 600 }}>
                            Rol: {r}
                          </span>
                        ))}
                        {usuariosConLlave.map((u) => (
                          <span key={u.id} style={{ padding: '2px 8px', borderRadius: '999px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '11.5px', fontWeight: 500 }}>
                            {u.nombre || u.email}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      data-llave-user-menu={editandoEstaLlave && item.llaveCurable ? 'true' : undefined}
                      style={{ position: 'relative', flex: '0 0 310px', minHeight: '32px', display: 'flex', alignItems: 'center' }}
                    >
                      {item.llaveCurable && (
                        usuariosNoAdmin.length === 0 ? (
                          <span style={{ fontSize: '12px', color: editandoEstaLlave ? '#64748b' : '#94a3b8', whiteSpace: 'nowrap' }}>
                            Sin usuarios adicionales
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={!editandoEstaLlave || guardandoLoteLlave}
                              onClick={() => {
                                if (!editandoEstaLlave) return;
                                setLlaveUserMenuAbierto((v) => !v);
                              }}
                              style={{
                                width: '100%',
                                height: '32px',
                                padding: '0 10px',
                                boxSizing: 'border-box',
                                borderRadius: '7px',
                                border: !editandoEstaLlave
                                  ? '1px solid #e2e8f0'
                                  : llaveUserMenuAbierto
                                    ? '1px solid #2563eb'
                                    : '1px solid #cbd5e1',
                                background: !editandoEstaLlave ? '#f8fafc' : '#ffffff',
                                color: !editandoEstaLlave ? '#94a3b8' : '#0f172a',
                                fontSize: '12.5px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                cursor: !editandoEstaLlave ? 'not-allowed' : guardandoLoteLlave ? 'wait' : 'pointer',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Área o persona ({usuariosConLlave.length}/{usuariosNoAdmin.length})
                              </span>
                              <ChevronDown
                                size={14}
                                style={{
                                  color: !editandoEstaLlave ? '#cbd5e1' : '#64748b',
                                  flexShrink: 0,
                                  transform: editandoEstaLlave && llaveUserMenuAbierto ? 'rotate(180deg)' : 'none',
                                  transition: 'transform 0.15s ease',
                                }}
                              />
                            </button>
                            {editandoEstaLlave && llaveUserMenuAbierto && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 'calc(100% + 6px)',
                                  left: 0,
                                  right: 0,
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  zIndex: 1300,
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                  boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
                                  padding: '8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                }}
                              >
                                <div style={{ position: 'relative' }}>
                                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                  <input
                                    type="text"
                                    value={llaveUserFiltro}
                                    onChange={(e) => setLlaveUserFiltro(e.target.value)}
                                    placeholder="Filtrar área o usuario..."
                                    style={{ width: '100%', height: '32px', padding: '0 10px 0 28px', boxSizing: 'border-box', borderRadius: '7px', border: '1px solid #cbd5e1', fontSize: '12.5px', color: '#0f172a' }}
                                  />
                                </div>

                                {(() => {
                                  const todosMarcados = usuariosNoAdmin.length > 0 && usuariosConLlave.length === usuariosNoAdmin.length;
                                  const algunoMarcado = usuariosConLlave.length > 0 && !todosMarcados;
                                  return (
                                    <label
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px',
                                        padding: '6px 8px',
                                        borderRadius: '7px',
                                        background: '#f8fafc',
                                        border: '1px solid #f1f5f9',
                                        cursor: guardandoLoteLlave ? 'wait' : 'pointer',
                                        fontSize: '12.5px',
                                        fontWeight: 600,
                                        color: '#0f172a',
                                      }}
                                    >
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                          type="checkbox"
                                          checked={todosMarcados}
                                          ref={(el) => { if (el) el.indeterminate = algunoMarcado; }}
                                          disabled={guardandoLoteLlave}
                                          onChange={() => aplicarLlaveLote(usuariosNoAdmin, !todosMarcados, 'todos los usuarios')}
                                        />
                                        <span>Todos los usuarios</span>
                                      </span>
                                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#e2e8f0', borderRadius: '999px', padding: '1px 7px' }}>
                                        {usuariosConLlave.length}/{usuariosNoAdmin.length}
                                      </span>
                                    </label>
                                  );
                                })()}

                                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', padding: '2px 4px 0' }}>
                                  ÁREAS Y USUARIOS
                                </div>

                                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {(() => {
                                    const fq = llaveUserFiltro.trim().toLowerCase();
                                    const lista = usuariosNoAdmin.filter((u) => {
                                      if (!fq) return true;
                                      const uArea = unidadesArea.find((a) => a.value === miembrosUnidad[u.id]);
                                      const areaMatch = uArea ? uArea.label.toLowerCase().includes(fq) : false;
                                      return areaMatch || (u.nombre ?? '').toLowerCase().includes(fq) || (u.email ?? '').toLowerCase().includes(fq);
                                    });
                                    const mapG = new Map<string, UsuarioEmpresa[]>();
                                    for (const u of lista) {
                                      const k = miembrosUnidad[u.id] || '__SIN_AREA__';
                                      const arr = mapG.get(k) ?? [];
                                      arr.push(u);
                                      mapG.set(k, arr);
                                    }
                                    const gruposMenu: Array<{ key: string; label: string; users: UsuarioEmpresa[] }> = [];
                                    for (const a of unidadesArea) {
                                      const us = mapG.get(a.value);
                                      if (us && us.length > 0) {
                                        gruposMenu.push({ key: a.value, label: a.badge ? `${a.badge} · ${a.label}` : a.label, users: us });
                                        mapG.delete(a.value);
                                      }
                                    }
                                    const sinA = mapG.get('__SIN_AREA__');
                                    if (sinA && sinA.length > 0) gruposMenu.push({ key: '__SIN_AREA__', label: 'Sin área asignada', users: sinA });

                                    if (gruposMenu.length === 0) {
                                      return <span style={{ padding: '8px', fontSize: '12px', color: '#64748b' }}>Sin coincidencias.</span>;
                                    }
                                    return gruposMenu.map((g) => {
                                      const abiertoG = fq !== '' || Boolean(llaveAreasAbiertas[g.key]);
                                      const conEnArea = g.users.filter((u) => u.permisos.includes(item.llaveCurable!)).length;
                                      const areaTodos = conEnArea === g.users.length;
                                      const areaParcial = conEnArea > 0 && !areaTodos;
                                      return (
                                        <div key={g.key} style={{ border: '1px solid #f1f5f9', borderRadius: '7px', overflow: 'hidden' }}>
                                          <div
                                            style={{
                                              width: '100%',
                                              padding: '6px 8px',
                                              background: '#f8fafc',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: '6px',
                                              boxSizing: 'border-box',
                                            }}
                                          >
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                                              <button
                                                type="button"
                                                aria-label={`Expandir ${g.label}`}
                                                onClick={() => setLlaveAreasAbiertas((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}
                                                style={{ border: 'none', background: 'transparent', padding: '2px', cursor: 'pointer', display: 'inline-flex', color: '#64748b', flexShrink: 0 }}
                                              >
                                                <ChevronRight size={13} style={{ transform: abiertoG ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }} />
                                              </button>
                                              <input
                                                type="checkbox"
                                                checked={areaTodos}
                                                ref={(el) => { if (el) el.indeterminate = areaParcial; }}
                                                disabled={guardandoLoteLlave}
                                                onChange={() => aplicarLlaveLote(g.users, !areaTodos, g.label)}
                                                style={{ cursor: guardandoLoteLlave ? 'wait' : 'pointer', flexShrink: 0 }}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => setLlaveAreasAbiertas((prev) => ({ ...prev, [g.key]: !prev[g.key] }))}
                                                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
                                              >
                                                {g.label}
                                              </button>
                                            </span>
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#e2e8f0', borderRadius: '999px', padding: '1px 7px', flexShrink: 0 }}>
                                              {conEnArea}/{g.users.length}
                                            </span>
                                          </div>
                                          {abiertoG && (
                                            <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 4px 4px 22px', gap: '2px' }}>
                                              {g.users.map((u) => {
                                                const tiene = u.permisos.includes(item.llaveCurable!);
                                                return (
                                                  <label
                                                    key={u.id}
                                                    style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '8px',
                                                      padding: '5px 8px',
                                                      borderRadius: '6px',
                                                      cursor: guardandoId === u.id ? 'wait' : 'pointer',
                                                      fontSize: '12.5px',
                                                      color: tiene ? '#1d4ed8' : '#334155',
                                                      background: tiene ? '#eff6ff' : 'transparent',
                                                    }}
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={tiene}
                                                      disabled={guardandoId === u.id || guardandoLoteLlave}
                                                      onChange={async () => {
                                                        if (!perfil.tenantId) return;
                                                        const nuevosPermisos = tiene
                                                          ? u.permisos.filter((k) => k !== item.llaveCurable)
                                                          : [...u.permisos, item.llaveCurable!];
                                                        setGuardandoId(u.id);
                                                        const r = await guardarRolGp({
                                                          userId: u.id,
                                                          tenantId: perfil.tenantId,
                                                          rol: u.rol ?? 'visor',
                                                          permisos: nuevosPermisos,
                                                        });
                                                        setGuardandoId(null);
                                                        if (r.ok) {
                                                          setAviso({ tipo: 'ok', texto: `Llave actualizada para "${u.nombre ?? u.email}".` });
                                                          cargar();
                                                        } else {
                                                          setAviso({ tipo: 'error', texto: r.mensaje });
                                                        }
                                                      }}
                                                    />
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                      {u.nombre || u.email}
                                                    </span>
                                                  </label>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              </div>
                            )}
                          </>
                        )
                      )}
                    </div>
                    <div style={{ flexShrink: 0, minWidth: '84px', display: 'flex', justifyContent: 'flex-end' }}>
                      {item.llaveCurable ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (editandoEstaLlave) {
                              setLlaveEditando(null);
                              setLlaveUserMenuAbierto(false);
                            } else {
                              setLlaveEditando(item.llaveCurable!);
                              setLlaveUserMenuAbierto(false);
                            }
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          <Pencil size={12} color="#2563eb" />
                          <span>{editandoEstaLlave ? 'Cerrar' : 'Editar'}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Según rol asignado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Aviso({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <span style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }}>{icono}</span>
      <div>
        <b style={{ fontSize: '13px', color: '#0f172a' }}>{titulo}</b>
        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#475569' }}>{texto}</p>
      </div>
    </div>
  );
}

const estiloPanel: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
};

const estiloTexto: React.CSSProperties = { fontSize: '12.5px', color: '#475569', margin: 0 };

const estiloFila: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  padding: '14px 18px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  background: '#f8fafc',
};

const estiloSelect: React.CSSProperties = {
  height: '30px',
  padding: '0 8px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '12px',
  background: '#ffffff',
};

const estiloBotonPrimario: React.CSSProperties = {
  height: '32px',
  padding: '0 12px',
  border: 'none',
  background: '#0284c7',
  color: '#ffffff',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 650,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  whiteSpace: 'nowrap',
};

const estiloBotonSecundario: React.CSSProperties = {
  ...estiloBotonPrimario,
  background: '#ffffff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  marginTop: '10px',
};
