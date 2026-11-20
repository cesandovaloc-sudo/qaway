import { AlertCircle, Building2, CheckCircle2 } from 'lucide-react'
import { PAISES } from '@/config/paises'

// Tarjeta ÚNICA de datos de empresa. La usa el alta (/completar-perfil) y la
// edición dentro del Gestor (Configuración → Datos de la Empresa). La carátula
// es la misma de UpdatePasswordCard: no se rediseña nada.

export const RUBROS = [
  'Veterinaria', 'Salud Clínica', 'Retail', 'Gastronomía', 'Contabilidad',
  'Finanzas', 'Tecnología', 'Educación', 'Turismo', 'Hospedaje',
  'Construcción', 'Inmobiliaria', 'Transporte', 'Logística', 'Manufactura',
  'Servicios profesionales', 'Otro',
]

const FUENTE = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

export const S = {
  card: {
    width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: '14px',
    border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden', fontFamily: FUENTE,
  },
  header: {
    padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  iconBox: {
    width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eff6ff',
    color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  title: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 },
  subtitle: { margin: '2px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 },
  form: { padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' },
  error: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
    backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px',
  },
  label: { fontSize: '13px', fontWeight: 500, color: '#334155' },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '14px', color: '#0f172a',
    backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none',
  },
  readonly: { backgroundColor: '#f8fafc', color: '#475569' },
  fieldError: { fontSize: '11.5px', color: '#b91c1c' },
  button: {
    marginTop: '6px', width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none',
    backgroundColor: '#2563eb', color: '#ffffff', fontSize: '14px', fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  },
  aviso: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px',
    backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '13px',
  },
}

export function splitPhone(raw) {
  const s = String(raw || '').trim()
  const m = s.match(/^(\+\d{1,4})\s*(.*)$/)
  if (m) return { prefix: m[1], digits: m[2].replace(/\D/g, '') }
  return { prefix: '', digits: s.replace(/\D/g, '') }
}

export function formDesdeTenant(t) {
  const contacto = t?.content?.contact || {}
  const telefono = splitPhone(contacto.phone)
  const rubroGuardado = t?.features?.rubro || ''
  const rubroEsStandard = RUBROS.includes(rubroGuardado)
  return {
    prefix: telefono.prefix || '+51',
    form: {
      name: t?.name || '',
      country: contacto.country || '',
      rubro: rubroEsStandard ? rubroGuardado : (rubroGuardado ? 'Otro' : ''),
      customRubro: rubroEsStandard ? '' : rubroGuardado,
      constituida: Boolean(t?.legal_name || t?.content?.tax_id),
      legal: t?.legal_name || '',
      ruc: String(t?.content?.tax_id || ''),
      phone: telefono.digits,
      email: contacto.email || '',
    },
  }
}

export function validarDatosEmpresa(form) {
  const errs = {}
  const pais = PAISES.find((p) => p.nombre === form.country) || null
  if (!form.name.trim()) errs.name = 'Escribe el nombre comercial de tu empresa.'
  if (!form.country) errs.country = 'Selecciona tu país.'
  if (!form.rubro) errs.rubro = 'Selecciona el rubro de tu empresa.'
  else if (form.rubro === 'Otro' && !form.customRubro.trim()) errs.customRubro = 'Escribe tu rubro o actividad específica.'
  if (!form.phone) errs.phone = 'Escribe tu teléfono / WhatsApp.'
  else if (form.phone.length < (pais?.minDigitos || 6)) errs.phone = `El número necesita al menos ${pais?.minDigitos || 6} dígitos.`
  else if (pais?.maxDigitos && form.phone.length > pais.maxDigitos) errs.phone = `El número de ${pais.nombre} tiene como máximo ${pais.maxDigitos} dígitos.`
  if (!form.email.trim()) errs.email = 'Escribe el correo de contacto.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Escribe un correo válido (ej. nombre@empresa.com).'
  if (form.constituida) {
    if (!form.legal.trim()) errs.legal = 'Escribe la razón social de la empresa.'
    if (!form.ruc.trim()) errs.ruc = 'Escribe el RUC / identificación fiscal.'
    else if (pais?.rucDigitos && form.ruc.trim().length !== pais.rucDigitos) {
      errs.ruc = `El RUC de ${pais.nombre} debe tener exactamente ${pais.rucDigitos} dígitos.`
    }
  }
  return errs
}

export function contactoDesdeForm(form, prefix) {
  return {
    email: form.email.trim(),
    phone: `${prefix} ${form.phone}`.trim(),
    address: '',
    country: form.country,
  }
}

export function rubroDesdeForm(form) {
  return form.rubro === 'Otro' ? form.customRubro.trim() : form.rubro
}

function Campo({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={S.label}>{label}</label>
      {children}
      {error ? <span style={S.fieldError}>{error}</span> : null}
    </div>
  )
}

export default function DatosEmpresaCard({
  fullWidth = false,
  form,
  setField,
  setCountry,
  setNumeric,
  prefix,
  setPrefix,
  errores = {},
  error = null,
  onSubmit,
  saving = false,
  submitLabel = 'Guardar y continuar',
  title = 'Completa los datos de tu empresa',
  subtitle = 'Solo falta esta información para entrar a tu espacio de trabajo.',
  soloLectura = false,
  encabezadoExtra = null,
}) {
  const pais = PAISES.find((p) => p.nombre === form.country) || null
  const input = (extra = {}) => ({ ...S.input, ...(soloLectura ? S.readonly : {}), ...extra })

  return (
    <div style={fullWidth ? { ...S.card, maxWidth: 'none', boxShadow: 'none' } : S.card}>
      <div style={S.header}>
        <div style={S.iconBox}><Building2 size={18} /></div>
        <div>
          <h1 className="no-qw" style={S.title}>{title}</h1>
          <p style={S.subtitle}>{subtitle}</p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (!soloLectura) onSubmit?.(e) }}
        style={S.form}
      >
        {error ? (
          <div style={S.error}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        ) : null}

        {soloLectura ? (
          <div style={S.aviso}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Solo lectura: estos datos los administra un administrador de la empresa.</span>
          </div>
        ) : null}

        {encabezadoExtra}

        <Campo label="Nombre comercial" error={errores.name}>
          <input style={input()} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Ej. CoraVet" readOnly={soloLectura} required />
        </Campo>

        <Campo label="País / ubicación" error={errores.country}>
          <select style={input()} value={form.country} onChange={(e) => setCountry(e.target.value)} disabled={soloLectura} required>
            <option value="">Selecciona tu país…</option>
            {PAISES.map((p) => <option key={p.codigo} value={p.nombre}>{p.nombre}</option>)}
          </select>
        </Campo>

        <Campo label="Rubro / actividad" error={errores.rubro}>
          <select style={input()} value={form.rubro} onChange={(e) => setField('rubro', e.target.value)} disabled={soloLectura} required>
            <option value="">Selecciona tu rubro…</option>
            {RUBROS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Campo>

        {form.rubro === 'Otro' ? (
          <Campo label="Especifica tu rubro" error={errores.customRubro}>
            <input style={input()} value={form.customRubro} onChange={(e) => setField('customRubro', e.target.value)} placeholder="Ej. Consultoría, Arquitectura…" readOnly={soloLectura} required />
          </Campo>
        ) : null}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
          <input type="checkbox" checked={form.constituida} onChange={(e) => setField('constituida', e.target.checked)} disabled={soloLectura} />
          ¿Es una empresa constituida?
        </label>

        {form.constituida ? (
          <>
            <Campo label="Razón social" error={errores.legal}>
              <input style={input()} value={form.legal} onChange={(e) => setField('legal', e.target.value)} placeholder="Nombre legal de la empresa" readOnly={soloLectura} required />
            </Campo>
            <Campo label={pais?.nombre === 'Perú' ? 'RUC / identificación fiscal' : 'Identificación fiscal / RUC'} error={errores.ruc}>
              <input
                style={input()}
                value={form.ruc}
                onChange={(e) => setNumeric('ruc', e.target.value, (pais?.rucDigitos || 14) + 2)}
                placeholder={pais?.nombre === 'Perú' ? 'Ej. 20601234567' : 'Ingresa tu identificación'}
                inputMode="numeric"
                readOnly={soloLectura}
                required
              />
            </Campo>
          </>
        ) : null}

        <Campo label="Teléfono / WhatsApp" error={errores.phone}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.replace(/[^\d+ ]/g, '').slice(0, 6))}
              placeholder="+51"
              inputMode="tel"
              readOnly={soloLectura}
              style={input({ width: '84px', flexShrink: 0 })}
            />
            <input
              value={form.phone}
              onChange={(e) => setNumeric('phone', e.target.value, pais?.maxDigitos ? pais.maxDigitos + 2 : 15)}
              placeholder="999 999 999"
              inputMode="tel"
              readOnly={soloLectura}
              style={input()}
              required
            />
          </div>
        </Campo>

        <Campo label="Correo de contacto" error={errores.email}>
          <input type="email" style={input()} value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="contacto@empresa.com" readOnly={soloLectura} required />
        </Campo>

        {soloLectura ? null : (
          <button type="submit" disabled={saving} style={{ ...S.button, opacity: saving ? 0.55 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
            <CheckCircle2 size={16} />
            <span>{saving ? 'Guardando...' : submitLabel}</span>
          </button>
        )}
      </form>
    </div>
  )
}
