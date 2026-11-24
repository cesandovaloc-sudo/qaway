import { useMemo, useState } from 'react'
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'

export function hasPendingPasswordChange(user) {
  const meta = user?.user_metadata || {}
  return Boolean(
    meta.must_change_password ||
    meta.requiere_cambio_clave ||
    meta.force_password_change ||
    meta.primer_ingreso ||
    meta.needs_password_change,
  )
}

export default function UpdatePasswordCard({
  fullWidth = false,
  supabaseClient,
  title = 'Actualiza tu contraseña',
  subtitle = 'Por seguridad, define una contraseña personal en tu primer ingreso.',
  submitLabel = 'Guardar y continuar',
  recoveryEmail = '',
  headerAction = null,
  locked = false,
  lockedNote = null,
  onSuccess,
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)
  const [recoveryError, setRecoveryError] = useState(null)

  const rules = useMemo(() => {
    const hasLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    const notRepeated = password.length > 0 && !/^(.)\1+$/.test(password)
    return { hasLength, hasUpper, hasLower, hasNumber, hasSymbol, notRepeated }
  }, [password])

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#e2e8f0', pct: 0 }
    if (!rules.notRepeated) return { score: 1, label: 'Muy débil (caracteres repetidos)', color: '#ef4444', pct: 20 }

    const score = [rules.hasLength, rules.hasUpper, rules.hasLower, rules.hasNumber, rules.hasSymbol].filter(Boolean).length
    if (score <= 2) return { score, label: 'Débil', color: '#ef4444', pct: 33 }
    if (score <= 4) return { score, label: 'Media', color: '#f59e0b', pct: 66 }
    return { score, label: 'Segura', color: '#10b981', pct: 100 }
  }, [password, rules])

  const isValidPassword =
    rules.hasLength && rules.hasUpper && rules.hasLower && rules.hasNumber && rules.notRepeated
  const passwordsMatch = confirm.length > 0 && password === confirm

  // Misma recuperación que el login: LoginPage.jsx:239-256 → /update-password.
  const handleRecovery = async () => {
    if (!recoveryEmail || !supabaseClient || recoveryLoading) return
    setRecoveryError(null)
    setRecoveryLoading(true)
    try {
      const resetOrigin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${resetOrigin}/update-password`,
      })
      if (resetError) setRecoveryError('No se pudo enviar el correo de recuperación.')
      else setRecoverySent(true)
    } catch {
      setRecoveryError('No se pudo enviar el correo de recuperación.')
    } finally {
      setRecoveryLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!isValidPassword) {
      setError('La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula y número (sin repetir el mismo carácter).')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!supabaseClient) {
      setError('No hay conexión activa con el servidor de autenticación.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabaseClient.auth.updateUser({
        password,
        data: {
          must_change_password: false,
          requiere_cambio_clave: false,
          force_password_change: false,
          primer_ingreso: false,
          needs_password_change: false,
        },
      })
      if (updateError) {
        setError(updateError.message)
        return
      }
      onSuccess?.()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: fullWidth ? 'none' : '440px',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)',
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lock size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="no-qw" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
            {title}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
            {subtitle}
          </p>
        </div>
        {headerAction && (
          <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
            {headerAction}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {lockedNote && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              fontSize: '12.5px',
            }}
          >
            <Lock size={14} style={{ flexShrink: 0, color: '#64748b' }} />
            <span>{lockedNote}</span>
          </div>
        )}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '13px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
            Nueva contraseña
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              disabled={locked}
              style={{
                width: '100%',
                padding: '9px 38px 9px 12px',
                fontSize: '14px',
                color: locked ? '#64748b' : '#0f172a',
                backgroundColor: locked ? '#f8fafc' : '#ffffff',
                borderRadius: '8px',
                border: `1px solid ${locked ? '#e2e8f0' : (password ? strength.color : '#cbd5e1')}`,
                outline: 'none',
                cursor: locked ? 'not-allowed' : 'text',
              }}
            />
            <button
              type="button"
              disabled={locked}
              onClick={() => setShowPwd((v) => !v)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.5 : 1,
                padding: 0,
              }}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {password.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Nivel de seguridad</span>
                <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
              <div style={{ height: '5px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${strength.pct}%`,
                    backgroundColor: strength.color,
                    transition: 'width 0.2s ease, background-color 0.2s ease',
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', marginTop: '2px', fontSize: '11.5px' }}>
                {[
                  { ok: rules.hasLength, text: 'Mín. 8 caracteres' },
                  { ok: rules.hasUpper, text: 'Una mayúscula' },
                  { ok: rules.hasLower, text: 'Una minúscula' },
                  { ok: rules.hasNumber, text: 'Un número' },
                ].map((r) => (
                  <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: r.ok ? '#059669' : '#64748b' }}>
                    <Check size={12} />
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>
            Confirmar contraseña
          </label>
          <input
            type={showPwd ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite tu nueva contraseña"
            required
            disabled={locked}
            style={{
              width: '100%',
              padding: '9px 12px',
              fontSize: '14px',
              color: locked ? '#64748b' : '#0f172a',
              backgroundColor: locked ? '#f8fafc' : '#ffffff',
              borderRadius: '8px',
              border: `1px solid ${locked ? '#e2e8f0' : (confirm ? (passwordsMatch ? '#10b981' : '#ef4444') : '#cbd5e1')}`,
              outline: 'none',
              cursor: locked ? 'not-allowed' : 'text',
            }}
          />
          {confirm.length > 0 && (
            <span style={{ fontSize: '11.5px', color: passwordsMatch ? '#059669' : '#ef4444' }}>
              {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={locked || loading || !isValidPassword || !passwordsMatch}
          style={{
            marginTop: '6px',
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: locked ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: locked || loading || !isValidPassword || !passwordsMatch ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: locked || loading || !isValidPassword || !passwordsMatch ? 0.55 : 1,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{loading ? 'Guardando...' : submitLabel}</span>
        </button>

        {recoveryEmail && !locked && (
          <div style={{ textAlign: 'center', fontSize: '12.5px', marginTop: '2px' }}>
            {recoverySent ? (
              <span style={{ color: '#059669' }}>
                Te enviamos un correo para restablecer tu contraseña.
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRecovery}
                disabled={recoveryLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2563eb',
                  fontSize: '12.5px',
                  cursor: recoveryLoading ? 'not-allowed' : 'pointer',
                  opacity: recoveryLoading ? 0.6 : 1,
                }}
              >
                {recoveryLoading ? 'Enviando correo...' : '¿Olvidaste tu contraseña?'}
              </button>
            )}
            {recoveryError && (
              <div style={{ color: '#b91c1c', marginTop: '6px' }}>{recoveryError}</div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
