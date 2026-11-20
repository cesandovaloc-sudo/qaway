// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Mail, Phone, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { invalidarPerfilVisible, usePerfilVisible } from '../../services/perfilVisibleService';
import { formatearTelefono, telefonoParaGuardar } from '../../services/comunicacionesService';
import { invalidarCacheAcceso } from '../../../../../../router/sessionCache';
import { esImagenPermitida, optimizarAvatar } from '../../../../14-Librerías/services/imageOptimization';
import UpdatePasswordCard, { hasPendingPasswordChange } from '../../../../../../components/auth/UpdatePasswordCard';

interface PerfilTabProps {
  notify?: (msg: string) => void;
}

const FUENTE = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function PerfilTab({ notify }: PerfilTabProps) {
  const [listo, setListo] = useState(false);
  const [passwordPending, setPasswordPending] = useState(true);
  const { perfil } = usePerfilGp();
  const { perfil: visible } = usePerfilVisible();

  const [nombreInput, setNombreInput] = useState('');
  const [nombreGuardado, setNombreGuardado] = useState('');
  const [telefonoInput, setTelefonoInput] = useState('');
  const [telefonoGuardado, setTelefonoGuardado] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [fotoPendiente, setFotoPendiente] = useState<File | null>(null);
  const [fotoEliminada, setFotoEliminada] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const email = visible?.email || '';
  const rol = visible?.rol || perfil?.rol || 'viewer';
  const empresa = visible?.tenantNombre || '';
  const fotoMostrada = fotoPendiente ? previewUrl : (fotoEliminada ? '' : avatarUrl);
  const hayCambios = Boolean(fotoPendiente) || fotoEliminada
    || nombreInput.trim() !== nombreGuardado
    || telefonoInput.trim() !== telefonoGuardado;
  const telefonoValido = !telefonoInput.trim() || Boolean(telefonoParaGuardar(telefonoInput));
  const puedeGuardar = hayCambios && Boolean(nombreInput.trim()) && telefonoValido && !savingProfile;

  useEffect(() => {
    const nombre = String(visible?.nombre || '').trim();
    setNombreInput(nombre);
    setNombreGuardado(nombre);
  }, [visible?.nombre]);

  useEffect(() => {
    const telefono = formatearTelefono(visible?.phone || '');
    setTelefonoInput(telefono);
    setTelefonoGuardado(telefono);
  }, [visible?.phone]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) return;
      const metaAvatar = user.user_metadata?.avatar_url;
      if (metaAvatar) setAvatarUrl(String(metaAvatar));
      setPasswordPending(hasPendingPasswordChange(user));
    });
  }, []);

  // Guarda la cápsula completa de una sola vez. Lanza el error real para que el
  // botón único pueda conservar los cambios pendientes y mostrar el detalle.
  const persistirPerfil = async (nuevoNombre: string, nuevoAvatar: string | null, nuevoTelefono: string | null) => {
    if (!supabase) throw new Error('Servicio no disponible.');
    const { data: userData, error: authErr } = await supabase.auth.updateUser({
      data: {
        full_name: nuevoNombre,
        avatar_url: nuevoAvatar,
      },
    });
    if (authErr) throw authErr;

    // El teléfono NO se copia a user_metadata: su única fuente es users.phone.
    const uid = userData?.user?.id || perfil?.userId;
    if (uid) {
      const { error: usersErr } = await supabase
        .from('users')
        .update({ full_name: nuevoNombre, avatar_url: nuevoAvatar, phone: nuevoTelefono })
        .eq('id', uid);
      if (usersErr) throw usersErr;
    }
  };

  const subirAvatar = async (file: File, uid: string) => {
    const optimizado = await optimizarAvatar(file);
    const path = `avatars/${uid}.webp`;
    const { error: uploadError } = await supabase!.storage
      .from('avatars')
      .upload(path, optimizado.blob, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: '3600',
      });
    // Se muestra el mensaje real de Supabase: nunca se cae al JPEG base64 anterior.
    if (uploadError) {
      throw new Error(`No se pudo subir la foto a Supabase Storage. Detalle real: ${uploadError.message}`);
    }
    const { data: publicUrl } = supabase!.storage.from('avatars').getPublicUrl(path);
    return `${publicUrl.publicUrl}?v=${Date.now()}`;
  };

  // Elegir foto y borrarla son acciones locales: sólo el botón principal persiste.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setProfileMsg(null);
    if (!esImagenPermitida(file)) {
      setProfileMsg({ type: 'err', text: 'Formato no permitido. Usa PNG, JPG o WebP.' });
      return;
    }
    setFotoEliminada(false);
    setFotoPendiente(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleEliminarFoto = () => {
    setProfileMsg(null);
    setFotoPendiente(null);
    setPreviewUrl('');
    setFotoEliminada(true);
  };

  const handleGuardarCambios = async () => {
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      if (!supabase) throw new Error('Servicio no disponible.');
      const uid = perfil?.userId;
      if (!uid) throw new Error('Tu sesión no está disponible para guardar los cambios.');
      if (!nombreInput.trim()) throw new Error('Escribe tu nombre antes de guardar.');
      if (!telefonoValido) throw new Error('El teléfono debe tener entre 8 y 15 dígitos.');

      let avatarFinal: string | null = avatarUrl || null;
      if (fotoEliminada) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([`avatars/${uid}.webp`]);
        if (removeError) throw new Error(`No se pudo eliminar la foto: ${removeError.message}`);
        avatarFinal = null;
      } else if (fotoPendiente) {
        avatarFinal = await subirAvatar(fotoPendiente, uid);
      }

      const telefonoFinal = telefonoParaGuardar(telefonoInput);
      await persistirPerfil(nombreInput.trim(), avatarFinal, telefonoFinal);

      setAvatarUrl(avatarFinal || '');
      setNombreGuardado(nombreInput.trim());
      setTelefonoGuardado(formatearTelefono(telefonoFinal || ''));
      setTelefonoInput(formatearTelefono(telefonoFinal || ''));
      setFotoPendiente(null);
      setFotoEliminada(false);
      setPreviewUrl('');
      // El perfil compartido y la caché de acceso deben reflejar el teléfono ya.
      invalidarPerfilVisible();
      invalidarCacheAcceso();
      setProfileMsg({ type: 'ok', text: 'Cambios guardados correctamente.' });
      notify?.('Perfil actualizado correctamente.');
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err?.message || 'No se pudieron guardar los cambios.' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', fontFamily: FUENTE }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserRound size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Mi Perfil</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Tus datos personales sincronizados en todo el ecosistema Qaway.</p>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {profileMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', backgroundColor: profileMsg.type === 'ok' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${profileMsg.type === 'ok' ? '#a7f3d0' : '#fecaca'}`, color: profileMsg.type === 'ok' ? '#059669' : '#b91c1c', fontSize: '13px' }}>
              {profileMsg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* Foto de perfil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '999px', overflow: 'hidden', backgroundColor: '#e2e8f0', display: 'grid', placeItems: 'center', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}>
              {fotoMostrada ? (
                <img src={fotoMostrada} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserRound size={26} color="#64748b" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0f172a' }}>Foto de perfil</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Se recorta y convierte a WebP (máx. 512 px) y se sincroniza con Hub y Academy.</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
              <button
                type="button"
                disabled={savingProfile}
                onClick={() => fileRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
              >
                <Camera size={14} />
                <span>Cambiar foto</span>
              </button>
              {!fotoEliminada && fotoMostrada && (
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={handleEliminarFoto}
                  title="Eliminar foto"
                  aria-label="Eliminar foto"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '13px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
              {fotoEliminada && (
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => setFotoEliminada(false)}
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '13px', cursor: 'pointer' }}
                >
                  Deshacer
                </button>
              )}
            </div>
          </div>

          {/* Nombre editable */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <span style={{ color: '#64748b', display: 'flex' }}><UserRound size={15} /></span>
            <span style={{ fontSize: '12px', color: '#64748b', width: '150px', flexShrink: 0 }}>Nombre</span>
            <input
              type="text"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              placeholder="Tu nombre completo"
              style={{ flex: 1, minWidth: '180px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#0f172a' }}
            />
          </div>

          {/* Teléfono / WhatsApp: fuente única para mensajes y tareas ágiles. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: `1px solid ${telefonoValido ? '#e2e8f0' : '#fecaca'}`, flexWrap: 'wrap' }}>
            <span style={{ color: '#64748b', display: 'flex' }}><Phone size={15} /></span>
            <span style={{ fontSize: '12px', color: '#64748b', width: '150px', flexShrink: 0 }}>Teléfono / WhatsApp</span>
            <input
              type="tel"
              value={telefonoInput}
              onChange={(e) => {
                setTelefonoInput(e.target.value);
                setProfileMsg(null);
              }}
              placeholder="+51 999 999 999"
              style={{ flex: 1, minWidth: '180px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', color: '#0f172a' }}
            />
          </div>
          {!telefonoValido && (
            <div style={{ fontSize: '12px', color: '#b91c1c', textAlign: 'right' }}>El teléfono debe tener entre 8 y 15 dígitos.</div>
          )}

          <Fila icono={<Mail size={15} />} etiqueta="Correo" valor={email || 'Sin correo registrado'} />
          <Fila icono={<ShieldCheck size={15} />} etiqueta="Rol" valor={visible?.roleLabel || String(rol)} />
          <Fila icono={<AlertCircle size={15} />} etiqueta="Empresa" valor={empresa || 'Sin empresa asignada'} />

          {hayCambios && (
            <div style={{ fontSize: '12px', color: '#b45309', textAlign: 'right' }}>Tienes cambios sin guardar.</div>
          )}
          <button
            type="button"
            disabled={!puedeGuardar}
            onClick={() => void handleGuardarCambios()}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: puedeGuardar ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: puedeGuardar ? 1 : 0.55,
            }}
          >
            <Save size={16} />
            <span>{savingProfile ? 'Guardando...' : 'Guardar cambios'}</span>
          </button>
        </div>
      </div>

      {listo ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>Contraseña actualizada correctamente.</span>
        </div>
      ) : null}

      <UpdatePasswordCard
        supabaseClient={supabase}
        fullWidth
        title={passwordPending ? 'Define tu contraseña' : 'Cambiar contraseña'}
        subtitle={passwordPending
          ? 'Por seguridad, define una contraseña personal en tu primer ingreso.'
          : 'Actualiza la contraseña de tu cuenta cuando lo necesites.'}
        submitLabel={passwordPending ? 'Guardar contraseña' : 'Cambiar contraseña'}
        recoveryEmail={passwordPending ? '' : email}
        onSuccess={() => {
          setListo(true);
          setPasswordPending(false);
          notify?.('Contraseña actualizada correctamente.');
        }}
      />
    </div>
  );
}

function Fila({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <span style={{ color: '#64748b', display: 'flex' }}>{icono}</span>
      <span style={{ fontSize: '12px', color: '#64748b', width: '150px', flexShrink: 0 }}>{etiqueta}</span>
      <span style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-all' }}>{valor}</span>
    </div>
  );
}
