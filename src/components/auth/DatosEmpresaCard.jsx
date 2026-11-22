import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Building2, Check, CheckCircle2, ChevronDown } from 'lucide-react'
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
  if (!form.email.trim()) errs.email = 'Escribe el correo de empresa.'
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
    phone: `${prefix}${String(form.phone || '').replace(/\D/g, '')}`.trim(),
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
          <SelectEstilizado
            value={form.country}
            placeholder="Selecciona tu país…"
            options={PAISES.map((p) => ({ value: p.nombre, label: p.nombre }))}
            onChange={(val) => setCountry(val)}
            disabled={soloLectura}
          />
        </Campo>

        <Campo label="Rubro / actividad" error={errores.rubro}>
          <SelectEstilizado
            value={form.rubro}
            placeholder="Selecciona tu rubro…"
            options={RUBROS.map((r) => ({ value: r, label: r }))}
            onChange={(val) => setField('rubro', val)}
            disabled={soloLectura}
          />
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
              value={String(form.phone || '').replace(/\D/g, '').replace(/(\d{3})(?=\d)/g, '$1 ')}
              onChange={(e) => setNumeric('phone', e.target.value, pais?.maxDigitos ? pais.maxDigitos + 2 : 15)}
              placeholder="999 999 999"
              inputMode="tel"
              readOnly={soloLectura}
              style={input()}
              required
            />
          </div>
        </Campo>

        <Campo label="Correo de empresa" error={errores.email}>
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


function normalizarBusquedaSelect(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function SelectEstilizado({ value, placeholder, options, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const wrapRef = useRef(null)
  const listRef = useRef(null)
  const optionRefs = useRef([])
  const bufferRef = useRef('')
  const bufferTimerRef = useRef(null)

  const centrarOpcion = (idx) => {
    const lista = listRef.current
    const item = optionRefs.current[idx]
    if (!lista || !item) return
    const targetTop = item.offsetTop - lista.clientHeight / 2 + item.offsetHeight / 2
    lista.scrollTop = Math.max(0, targetTop)
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => () => {
    if (bufferTimerRef.current) window.clearTimeout(bufferTimerRef.current)
  }, [])

  useEffect(() => {
    if (!open) return
    const activeIdx = options.findIndex((o) => o.value === value)
    const idx = activeIdx >= 0 ? activeIdx : 0
    setHighlightedIdx(idx)
    requestAnimationFrame(() => centrarOpcion(idx))
  }, [open, value, options])

  const handleKeyDown = (e) => {
    if (disabled || options.length === 0) return
    if (e.key === 'Escape') {
      if (open) { e.preventDefault(); setOpen(false) }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      const next = highlightedIdx < options.length - 1 ? highlightedIdx + 1 : 0
      setHighlightedIdx(next)
      centrarOpcion(next)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) { setOpen(true); return }
      const prev = highlightedIdx > 0 ? highlightedIdx - 1 : options.length - 1
      setHighlightedIdx(prev)
      centrarOpcion(prev)
      return
    }
    if (e.key === 'Enter' && open && highlightedIdx >= 0 && options[highlightedIdx]) {
      e.preventDefault()
      onChange(options[highlightedIdx].value)
      setOpen(false)
      return
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const char = normalizarBusquedaSelect(e.key)
      if (!char) return
      e.preventDefault()
      if (bufferTimerRef.current) window.clearTimeout(bufferTimerRef.current)
      bufferRef.current += char
      bufferTimerRef.current = window.setTimeout(() => { bufferRef.current = '' }, 700)
      const q = bufferRef.current
      let idx = options.findIndex((o) => normalizarBusquedaSelect(o.label).startsWith(q))
      if (idx < 0) idx = options.findIndex((o) => normalizarBusquedaSelect(o.label).includes(q))
      if (idx >= 0) {
        if (open) { setHighlightedIdx(idx); centrarOpcion(idx) }
        else onChange(options[idx].value)
      }
    }
  }

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={wrapRef} onKeyDown={handleKeyDown} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        style={{
          width: '100%',
          padding: '9px 12px',
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          color: selected ? '#0f172a' : '#94a3b8',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} style={{ color: '#64748b', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.05)',
            padding: '4px',
          }}
        >
          {options.map((opt, idx) => {
            const active = opt.value === value
            const highlighted = idx === highlightedIdx
            return (
              <button
                key={opt.value}
                ref={(el) => { optionRefs.current[idx] = el }}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: '7px',
                  backgroundColor: active ? '#eff6ff' : (highlighted ? '#f1f5f9' : 'transparent'),
                  color: active ? '#1d4ed8' : '#334155',
                  fontSize: '13.5px',
                  fontWeight: active ? 500 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={() => setHighlightedIdx(idx)}
              >
                <span>{opt.label}</span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
