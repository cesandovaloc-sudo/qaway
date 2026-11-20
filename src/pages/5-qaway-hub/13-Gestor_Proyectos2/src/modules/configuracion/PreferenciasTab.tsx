// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { CheckCircle2, Globe2, SlidersHorizontal, Bell, LayoutDashboard } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { obtenerUsuarioSesion } from '../../services/contextoSesion';
import SelectEstilizado from './SelectEstilizado';

interface PreferenciasTabProps {
  notify?: (msg: string) => void;
}

const FUENTE = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const DEFAULTS = {
  idioma: 'es',
  notificaciones: true,
  vista: 'resumen',
};

export default function PreferenciasTab({ notify }: PreferenciasTabProps) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [usuario, setUsuario] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;
    obtenerUsuarioSesion().then((u) => {
      if (!alive) return;
      setUsuario(u);
      const guardadas = (u?.user_metadata || {}).qaway_prefs;
      if (guardadas && typeof guardadas === 'object') {
        setPrefs({ ...DEFAULTS, ...guardadas });
      }
    });
    return () => { alive = false; };
  }, []);

  function cambiar(k: string, v: any) {
    setPrefs((p: any) => ({ ...p, [k]: v }));
    setOk(false);
  }

  async function guardar() {
    setError(null);
    if (!supabase || !usuario?.id) {
      setError('No hay una sesión activa para guardar tus preferencias.');
      return;
    }
    setSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({
        data: {
          ...(usuario.user_metadata || {}),
          qaway_prefs: prefs,
        },
      });
      if (upErr) throw upErr;
      setUsuario((u: any) => ({
        ...(u || {}),
        user_metadata: { ...(u?.user_metadata || {}), qaway_prefs: prefs },
      }));
      setOk(true);
      notify?.('Preferencias guardadas correctamente.');
    } catch (e: any) {
      setError(e?.message || 'No se pudieron guardar tus preferencias.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', fontFamily: FUENTE }}>
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Preferencias de la cuenta</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Ajustes personales: aplican solo a tu usuario.</p>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error ? (
            <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px' }}>{error}</div>
          ) : null}
          {ok ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#059669', fontSize: '13px' }}>
              <CheckCircle2 size={16} /> <span>Preferencias guardadas.</span>
            </div>
          ) : null}

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <Globe2 size={15} /> Idioma
            </span>
            <SelectEstilizado
              value={prefs.idioma}
              options={[
                { value: 'es', label: 'Español' },
                { value: 'en', label: 'English' },
              ]}
              onChange={(val) => cambiar('idioma', val)}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: '#334155' }}>
              <LayoutDashboard size={15} /> Vista por defecto al entrar
            </span>
            <SelectEstilizado
              value={prefs.vista}
              options={[
                { value: 'resumen', label: 'Resumen del proyecto' },
                { value: 'cronograma', label: 'Cronograma' },
                { value: 'sedes', label: 'Sedes' },
              ]}
              onChange={(val) => cambiar('vista', val)}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
            <input type="checkbox" checked={prefs.notificaciones} onChange={(e) => cambiar('notificaciones', e.target.checked)} />
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={15} /> Recibir notificaciones del sistema</span>
          </label>

          <button
            type="button"
            onClick={guardar}
            disabled={saving}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            <CheckCircle2 size={16} />
            <span>{saving ? 'Guardando...' : 'Guardar preferencias'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
