import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function Recover() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/acceder`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al enviar el correo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-surface-500">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      {sent ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Correo enviado</h2>
          <p className="text-sm text-surface-500 mb-6">
            Si existe una cuenta con {email}, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/acceder" className="btn-primary">
            Volver a Acceder
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="label-field">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@correo.com"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link to="/acceder" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              ← Volver a Acceder
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
