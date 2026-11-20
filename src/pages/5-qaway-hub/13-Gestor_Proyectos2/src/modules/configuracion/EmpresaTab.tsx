// @ts-nocheck
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { usePerfilGp } from '../../services/gpPermisosService';
import { usePerfilVisible } from '../../services/perfilVisibleService';
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
    if (match?.prefijo) setPrefix(match.prefijo);
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
      const { error: upErr } = await supabase
        .from('tenants')
        .update({
          name: form.name.trim(),
          legal_name: form.constituida ? form.legal.trim() : null,
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
      // Refresca la caché compartida sin volver a mostrar el formulario vacío.
      void recargar();
      notify?.('Datos de la empresa guardados correctamente.');
    } catch (e: any) {
      setError(e?.message || 'No se pudieron guardar los datos de la empresa.');
    } finally {
      setSaving(false);
    }
  }

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
      soloLectura={!esAdmin}
      encabezadoExtra={
        responsable ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Responsable de la cuenta
            </span>
            <span style={{ fontSize: '14px', color: '#0f172a' }}>{responsable}</span>
          </div>
        ) : null
      }
    />
  );
}
