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

import { useEffect, useState } from 'react';
import { CheckSquare, FolderKanban, Key, Layers, Pencil, Save, ShieldCheck, Users } from 'lucide-react';
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
    if (puedeAdministrar) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeAdministrar]);

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

  return (
    <div style={estiloPanel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Users size={17} color="#0284c7" />
        <b style={{ fontSize: '14px', color: '#0f172a' }}>Permisos de Gestor de Proyectos · {estado.usuarios.length} usuarios</b>
      </div>
      {aviso && (
        <div
          style={{
            marginBottom: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            background: aviso.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
            color: aviso.tipo === 'ok' ? '#166534' : '#b91c1c',
            border: `1px solid ${aviso.tipo === 'ok' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {aviso.texto}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {estado.usuarios.map((u) => {
          const borrador = borradores[u.id] ?? { rol: 'visor', permisos: [] };
          const sucio =
            borrador.rol !== (u.rol ?? 'visor') ||
            borrador.permisos.length !== u.permisos.length ||
            borrador.permisos.some((k) => !u.permisos.includes(k));
          return (
            <div key={u.id} style={estiloFila}>
              <div style={{ minWidth: '220px' }}>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>{u.nombre ?? 'Sin nombre'}</b>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>{u.email ?? u.id}</div>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px', color: '#64748b' }}>
                <span style={{ fontWeight: 600 }}>Rol</span>
                <select
                  value={borrador.rol}
                  onChange={(e) =>
                    setBorradores((prev) => ({ ...prev, [u.id]: { ...borrador, rol: e.target.value } }))
                  }
                  style={estiloSelect}
                >
                  {ROLES_GP.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  {!ROLES_GP.includes(borrador.rol as (typeof ROLES_GP)[number]) && borrador.rol && (
                    <option value={borrador.rol}>{borrador.rol} (actual)</option>
                  )}
                </select>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                  <Key size={11} /> Llaves delicadas (v1)
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {LLAVES_V1.map((llave) => (
                    <label key={llave} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={borrador.permisos.includes(llave)}
                        onChange={(e) =>
                          setBorradores((prev) => ({
                            ...prev,
                            [u.id]: {
                              ...borrador,
                              permisos: e.target.checked
                                ? [...borrador.permisos, llave]
                                : borrador.permisos.filter((k) => k !== llave),
                            },
                          }))
                        }
                      />
                      {ETIQUETAS_LLAVE[llave] ?? llave}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="button"
                style={{ ...estiloBotonPrimario, opacity: sucio ? 1 : 0.5, cursor: sucio ? 'pointer' : 'default' }}
                disabled={!sucio || guardandoId === u.id}
                onClick={() => guardar(u)}
              >
                <Save size={13} />
                {guardandoId === u.id ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          );
        })}
        {estado.usuarios.length === 0 && (
          <p style={estiloTexto}>La empresa no tiene usuarios en el directorio (public.users del tenant).</p>
        )}
      </div>
      <p style={{ ...estiloTexto, marginTop: '12px', fontSize: '11.5px' }}>
        El rol <b>admin</b> lo ve todo; <b>editor</b> + llaves = totales; <b>operativo</b> registra lo suyo;
        <b> visor</b> solo consulta. El mando real vive en RLS — aquí se curan las llaves del jsonb.
      </p>

      {/* Esquema completo de permisos del Gestor agrupado por módulo */}
      <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={17} />
          </div>
          <div>
            <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>Esquema de Permisos del Gestor</b>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Detalle completo de capacidades por módulo. Los permisos con llave curable permiten otorgar acceso puntual a usuarios específicos.
            </span>
          </div>
        </div>

        {(['Proyectos', 'Estructura EDT', 'Tareas y Seguimiento', 'Equipo y Gobernanza'] as const).map((grupo) => {
          const items = ESQUEMA_PERMISOS.filter((p) => p.grupo === grupo);
          const iconoGrupo = grupo === 'Proyectos'
            ? <FolderKanban size={15} color="#2563eb" />
            : grupo === 'Estructura EDT'
              ? <Layers size={15} color="#2563eb" />
              : grupo === 'Tareas y Seguimiento'
                ? <CheckSquare size={15} color="#2563eb" />
                : <Users size={15} color="#2563eb" />;
          return (
            <div key={grupo} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {iconoGrupo}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{grupo}</span>
              </div>
              {items.map((item, idx) => {
                const usuariosConLlave = item.llaveCurable
                  ? estado.usuarios.filter((u) => u.permisos.includes(item.llaveCurable!))
                  : [];
                const editandoEstaLlave = Boolean(item.llaveCurable && llaveEditando === item.llaveCurable);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 14px',
                      borderTop: idx === 0 ? 'none' : '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1.3 1 240px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{item.nombre}</div>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>{item.descripcion}</div>
                      </div>
                      <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                      <div style={{ flexShrink: 0 }}>
                        {item.llaveCurable ? (
                          <button
                            type="button"
                            onClick={() => setLlaveEditando(editandoEstaLlave ? null : item.llaveCurable!)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                          >
                            <Pencil size={12} color="#2563eb" />
                            <span>{editandoEstaLlave ? 'Cerrar' : 'Editar'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Por rol base</span>
                        )}
                      </div>
                    </div>

                    {editandoEstaLlave && item.llaveCurable && (
                      <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                          Otorgar llave "{ETIQUETAS_LLAVE[item.llaveCurable]}" a usuarios adicionales:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {estado.usuarios.map((u) => {
                            const tiene = u.permisos.includes(item.llaveCurable!);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                disabled={guardandoId === u.id}
                                onClick={async () => {
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
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '7px',
                                  border: `1px solid ${tiene ? '#a7f3d0' : '#cbd5e1'}`,
                                  background: tiene ? '#ecfdf5' : '#ffffff',
                                  color: tiene ? '#059669' : '#334155',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                }}
                              >
                                {tiene ? '✓ ' : '+ '}{u.nombre || u.email}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
  borderRadius: '10px',
  padding: '18px 20px',
};

const estiloTexto: React.CSSProperties = { fontSize: '12.5px', color: '#475569', margin: 0 };

const estiloFila: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
  padding: '12px 14px',
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
