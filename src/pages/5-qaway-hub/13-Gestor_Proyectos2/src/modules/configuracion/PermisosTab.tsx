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
import { Key, Save, ShieldCheck, Users } from 'lucide-react';
import {
  LLAVES_V1,
  ROLES_GP,
  listarUsuariosEmpresa,
  guardarRolGp,
  usePerfilGp,
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

export default function PermisosTab() {
  const { perfil, capacidades } = usePerfilGp();
  const [estado, setEstado] = useState<EstadoCarga>({ fase: 'cargando' });
  const [borradores, setBorradores] = useState<Record<string, Borrador>>({});
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
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
