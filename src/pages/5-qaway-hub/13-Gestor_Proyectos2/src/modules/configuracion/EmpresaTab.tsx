// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { usePerfilVisible } from '../../services/perfilVisibleService';
import { esImagenPermitida, optimizarImagen } from '../../../../14-Librerías/services/imageOptimization';
import { PAISES } from '@/config/paises';
import DatosEmpresaCard, {
  contactoDesdeForm,
  formDesdeTenant,
  rubroDesdeForm,
  validarDatosEmpresa,
} from '../../../../../../components/auth/DatosEmpresaCard';

interface EmpresaTabProps {
  notify?: (msg: string) => void;
}

/**
 * Datos de la Empresa dentro de Configuración.
 * Todos los usuarios pueden VER los datos relevantes (nombre, RUC, razón
 * social, teléfono, ubicación). Solo un admin puede EDITARLOS.
 * Ni el botón global "Guardar Parámetros" ni esta vista escriben features
 * sin spread: onboarding_completed debe conservarse.
 */
export default function EmpresaTab({ notify }: EmpresaTabProps) {
  const { perfil, capacidades } = usePerfilGp();
  const esAdmin = Boolean(
    perfil?.esPlataforma ||
    perfil?.rol === 'admin' ||
    capacidades?.administrarPermisos
  );

  const { perfil: visible, recargar } = usePerfilVisible();
  const inicial = visible?.tenant ? formDesdeTenant(visible.tenant) : null;

  const [tenant, setTenant] = useState<any>(visible?.tenant || null);
  const [logoUrl, setLogoUrl] = useState<string>(() =>
    typeof visible?.tenant?.branding?.logo_url === 'string' ? visible.tenant.branding.logo_url : ''
  );
  const [logoPendiente, setLogoPendiente] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');
  const [logoEliminado, setLogoEliminado] = useState(false);
  const [logoMarcoBlanco, setLogoMarcoBlanco] = useState<boolean>(() =>
    Boolean(visible?.tenant?.branding?.logo_marco_blanco)
  );

  useEffect(() => {
    const dbLogo = typeof visible?.tenant?.branding?.logo_url === 'string' ? visible.tenant.branding.logo_url : '';
    setLogoUrl(dbLogo);
    setLogoMarcoBlanco(Boolean(visible?.tenant?.branding?.logo_marco_blanco));
    if (visible?.tenant) setTenant(visible.tenant);
  }, [visible?.tenant]);

  useEffect(() => () => {
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
  }, [logoPreviewUrl]);

  const logoMostrado = logoPendiente ? logoPreviewUrl : (logoEliminado ? '' : logoUrl);
  const [form, setForm] = useState<any>(
    inicial?.form || {
      name: '', country: '', rubro: '', customRubro: '', constituida: false,
      legal: '', ruc: '', phone: '', email: '',
    }
  );
  const [prefix, setPrefix] = useState(inicial?.prefix || '+51');
  const [errores, setErrores] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editando, setEditando] = useState(false);

  // Tenant y responsable YA vienen resueltos desde App.tsx (usePerfilVisible).
  // Antes este tab nacía con el formulario en blanco y lo llenaba tras tres
  // consultas: ese era el destello al abrir Configuración.
  const responsable = visible?.responsable || '';

  function setField(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
    setErrores((x: any) => ({ ...x, [k]: undefined }));
    setError(null);
  }

  function setCountry(v: string) {
    setForm((f: any) => ({ ...f, country: v }));
    setErrores((x: any) => ({ ...x, country: undefined }));
    const match = PAISES.find((p: any) => p.nombre === v);
    if (match?.dial) setPrefix(match.dial);
  }

  function setNumeric(k: string, raw: string, max: number) {
    setField(k, raw.replace(/\D/g, '').slice(0, max || 25));
  }

  async function handleGuardar() {
    setError(null);
    if (!esAdmin) return;
    const errs = validarDatosEmpresa(form);
    if (Object.keys(errs).length) {
      setErrores(errs);
      setError('Completa los campos marcados antes de guardar.');
      return;
    }
    if (!tenant?.id) {
      setError('No se encontró la empresa de tu cuenta.');
      return;
    }
    setSaving(true);
    try {
      let logoFinal: string | null = logoUrl || null;
      const logoPath = `logos/${tenant.id}.webp`;
      if (logoEliminado) {
        await supabase.storage.from('resources').remove([logoPath]);
        logoFinal = null;
      } else if (logoPendiente) {
        const optimizado = await optimizarImagen(logoPendiente, { mode: 'general', maxEdge: 512, quality: 0.85 });
        const { error: uploadErr } = await supabase.storage
          .from('resources')
          .upload(logoPath, optimizado.blob, {
            upsert: true,
            contentType: 'image/webp',
            cacheControl: '3600',
          });
        if (uploadErr) {
          throw new Error(`No se pudo subir el logo a Supabase Storage: ${uploadErr.message}`);
        }
        const { data: pub } = supabase.storage.from('resources').getPublicUrl(logoPath);
        logoFinal = `${pub.publicUrl}?v=${Date.now()}`;
      }

      const { error: upErr } = await supabase
        .from('tenants')
        .update({
          name: form.name.trim(),
          legal_name: form.constituida ? form.legal.trim() : null,
          branding: {
            ...(tenant.branding || {}),
            logo_url: logoFinal,
            logo_marco_blanco: logoMarcoBlanco,
          },
          content: {
            ...(tenant.content || {}),
            contact: contactoDesdeForm(form, prefix),
            tax_id: form.constituida ? form.ruc.trim() : null,
          },
          features: {
            ...(tenant.features || {}),
            rubro: rubroDesdeForm(form),
            onboarding_completed: true,
          },
        })
        .eq('id', tenant.id);
      if (upErr) throw upErr;
      setTenant((t: any) => ({
        ...(t || {}),
        name: form.name.trim(),
        legal_name: form.constituida ? form.legal.trim() : null,
        branding: {
          ...(t?.branding || {}),
          logo_url: logoFinal,
          logo_marco_blanco: logoMarcoBlanco,
        },
        content: {
          ...(t?.content || {}),
          contact: contactoDesdeForm(form, prefix),
          tax_id: form.constituida ? form.ruc.trim() : null,
        },
        features: {
          ...(t?.features || {}),
          rubro: rubroDesdeForm(form),
          onboarding_completed: true,
        },
      }));
      setLogoUrl(logoFinal || '');
      setLogoPendiente(null);
      setLogoPreviewUrl('');
      setLogoEliminado(false);
      // Refresca la caché compartida sin volver a mostrar el formulario vacío.
      await recargar();
      setEditando(false);
      notify?.('Datos de la empresa guardados correctamente.');
    } catch (e: any) {
      setError(e?.message || 'No se pudieron guardar los datos de la empresa.');
    } finally {
      setSaving(false);
    }
  }

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (!esImagenPermitida(file)) {
      setError('Formato no permitido. Usa PNG, JPG o WebP.');
      return;
    }
    setLogoEliminado(false);
    setLogoPendiente(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <DatosEmpresaCard
      fullWidth
      form={form}
      setField={setField}
      setCountry={setCountry}
      setNumeric={setNumeric}
      prefix={prefix}
      setPrefix={setPrefix}
      errores={errores}
      error={error}
      onSubmit={handleGuardar}
      saving={saving}
      submitLabel="Guardar datos de la empresa"
      title="Datos de la Empresa"
      subtitle="Información fiscal y de contacto de tu organización."
      soloLectura={!esAdmin || !editando}
      headerAction={
        esAdmin ? (
          <button
            type="button"
            onClick={() => {
              if (editando) {
                setLogoPendiente(null);
                setLogoPreviewUrl('');
                setLogoEliminado(false);
                setLogoUrl(typeof tenant?.branding?.logo_url === 'string' ? tenant.branding.logo_url : '');
                setLogoMarcoBlanco(Boolean(tenant?.branding?.logo_marco_blanco));
              }
              setEditando((v) => !v);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {editando ? <X size={14} /> : <Pencil size={14} />}
            <span>{editando ? 'Cancelar' : 'Editar'}</span>
          </button>
        ) : null
      }
      encabezadoExtra={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {logoMostrado ? (
                <img
                  src={logoMostrado}
                  alt={form.name || 'Logo de la empresa'}
                  style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px' }}
                />
              ) : (
                <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
                  {(form.name || 'E').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Logo institucional</span>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Se muestra en la barra lateral y encabezados de reporte.</span>
              </div>
            </div>

            {esAdmin && editando && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {logoMostrado && (
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      checked={logoMarcoBlanco}
                      onChange={(e) => setLogoMarcoBlanco(e.target.checked)}
                    />
                    <span>Marco blanco</span>
                  </label>
                )}
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={13} />
                  <span>{logoMostrado ? 'Cambiar logo' : 'Subir logo'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoFile} style={{ display: 'none' }} />
                </label>
                {logoMostrado && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPendiente(null);
                      setLogoPreviewUrl('');
                      setLogoEliminado(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Quitar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 280px) minmax(0, 540px)',
              gap: '24px',
              padding: '16px 0',
              borderBottom: '1px solid #f1f5f9',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                Responsable de la cuenta
              </label>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Administrador titular registrado para esta empresa.
              </p>
            </div>
            <div style={{ minWidth: 0 }}>
              <input
                type="text"
                readOnly
                disabled
                value={responsable || '—'}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '14px',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'default',
                }}
              />
            </div>
          </div>
        </div>
      }
    />
  );
}
