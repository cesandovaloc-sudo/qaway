// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Mail, Save, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { usePerfilVisible } from '../../services/perfilVisibleService';
import UpdatePasswordCard from '../../../../../../components/auth/UpdatePasswordCard';

interface PerfilTabProps {
  notify?: (msg: string) => void;
}

const FUENTE = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function comprimirAvatar(file: File, maxSize = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No se pudo procesar la imagen.'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

export default function PerfilTab({ notify }: PerfilTabProps) {
  const [listo, setListo] = useState(false);
  const { perfil } = usePerfilGp();
  const { perfil: visible } = usePerfilVisible();

  const [nombreInput, setNombreInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const email = visible?.email || '';
  const rol = visible?.rol || perfil?.rol || 'viewer';
  const empresa = visible?.tenantNombre || '';

  useEffect(() => {
    setNombreInput(String(visible?.nombre || '').trim());
  }, [visible?.nombre]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const metaAvatar = data?.user?.user_metadata?.avatar_url;
      if (metaAvatar) setAvatarUrl(String(metaAvatar));
    });
  }, []);

  const persistirPerfil = async (nuevoNombre: string, nuevoAvatar: string | null) => {
    if (!supabase) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const { data: userData, error: authErr } = await supabase.auth.updateUser({
        data: {
          full_name: nuevoNombre,
          avatar_url: nuevoAvatar,
        },
      });
      if (authErr) throw authErr;

      const uid = userData?.user?.id || perfil?.userId;
      if (uid) {
        await supabase
          .from('users')
          .update({ full_name: nuevoNombre, avatar_url: nuevoAvatar })
          .eq('id', uid);
      }
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado en tu cuenta.' });
      notify?.('Perfil actualizado correctamente.');
    } catch (e: any) {
      setProfileMsg({ type: 'err', text: e?.message || 'No se pudo actualizar el perfil.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await comprimirAvatar(file, 256);
      setAvatarUrl(dataUrl);
      await persistirPerfil(nombreInput.trim(), dataUrl);
    } catch (err: any) {
      setProfileMsg({ type: 'err', text: err?.message || 'Error al procesar la foto.' });
    } finally {
      e.target.value = '';
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
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserRound size={26} color="#64748b" />
              )}
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0f172a' }}>Foto de perfil</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Se optimiza automáticamente (256×256) y se sincroniza con Hub y Academy.</div>
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
              {avatarUrl && (
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => {
                    setAvatarUrl('');
                    void persistirPerfil(nombreInput.trim(), null);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '13px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
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
            <button
              type="button"
              disabled={savingProfile || !nombreInput.trim()}
              onClick={() => persistirPerfil(nombreInput.trim(), avatarUrl || null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile || !nombreInput.trim() ? 0.6 : 1 }}
            >
              <Save size={14} />
              <span>Guardar</span>
            </button>
          </div>

          <Fila icono={<Mail size={15} />} etiqueta="Correo" valor={email || 'Sin correo registrado'} />
          <Fila icono={<ShieldCheck size={15} />} etiqueta="Rol en esta empresa" valor={String(rol)} />
          <Fila icono={<AlertCircle size={15} />} etiqueta="Empresa" valor={empresa || 'Sin empresa asignada'} />
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
        title="Cambiar contraseña"
        subtitle="Define una contraseña personal para proteger el acceso a tu cuenta."
        submitLabel="Guardar contraseña"
        onSuccess={() => {
          setListo(true);
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
