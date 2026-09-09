import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useData } from '@/hooks/useData'
import { getCourseBySlug } from '@/lib/services/courses'
import type { Course } from '@/lib/types'
import { createPayment, simulateCulqiWebhook } from '@/lib/services/payments'
import { supabase } from '@/lib/supabase'

const PAYMENT_METHODS = [
  {
    id: 'yape',
    label: 'Yape',
    description: 'Flujo simulado para prueba; requiere integración Culqi/webhook en producción',
    icon: '📱',
    color: 'bg-surface-100 text-surface-600 border-surface-200',
    available: true,
  },
  {
    id: 'card',
    label: 'Tarjeta crédito/débito',
    description: 'Pendiente de integración con pasarela de pago',
    icon: '💳',
    color: 'bg-surface-100 text-surface-600 border-surface-200',
    available: false,
  },
  {
    id: 'pagoefectivo',
    label: 'PagoEfectivo',
    description: 'Pendiente de integración con pasarela de pago',
    icon: '🏧',
    color: 'badge-success border-surface-200',
    available: false,
  },
  {
    id: 'directo',
    label: 'Pago Directo',
    description: 'Transferencia bancaria o Yape manual; envíanos el comprobante',
    icon: '📋',
    color: 'badge-warning border-surface-200',
    available: true,
  },
]

const ACCOUNT_INFO = {
  bank: 'Banco de Crédito del Perú (BCP)',
  accountType: 'Cuenta de Ahorros',
  accountNumber: '***-*******-**-**',
  cci: '***-*******-**-**-*****',
  holder: 'Qaway Lab E.I.R.L.',
  yape: '999 888 777',
}

function formatPrice(course: Course | null) {
  const price = Number(course?.price || 0)
  return price > 0 ? price : 0
}

export default function Checkout() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const courseSlug = searchParams.get('curso')
  const { data: course, loading, error: courseError } = useData(
    () => courseSlug ? getCourseBySlug(courseSlug) : Promise.resolve(null),
    [courseSlug]
  )
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState('select')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const productPrice = formatPrice(course)

  async function handleSelectMethod(methodId: string) {
    const method = PAYMENT_METHODS.find(item => item.id === methodId)
    setSelectedMethod(methodId)
    setError('')

    if (!method?.available) {
      setError(`${method?.label ?? 'Este método'} todavía no está integrado. Usa Pago Directo o Yape para esta revisión.`)
      return
    }

    if (methodId === 'yape') {
      setStep('yape-qr')
    } else if (methodId === 'directo') {
      setStep('directo-form')
    }
  }

  async function handlePagoDirecto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || !course) return
    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const proofEntry = formData.get('proof')
      const proofFile = proofEntry instanceof File ? proofEntry : null
      let proofUrl = null

      if (proofFile && proofFile.size > 0) {
        const fileExt = proofFile.name.split('.').pop()
        const fileName = `proofs/${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, proofFile)

        if (uploadError) throw new Error('Error al subir el comprobante: ' + uploadError.message)

        const { data: urlData } = supabase.storage
          .from('resources')
          .getPublicUrl(fileName)

        proofUrl = urlData?.publicUrl || null
      }

      await createPayment({
        studentId: user.id,
        orderId: null,
        courseId: course.id,
        amount: productPrice,
        currency: 'PEN',
        provider: 'manual',
        proofUrl,
        notes: typeof formData.get('notes') === 'string' ? (formData.get('notes') as string) : null,
      })

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Error al procesar el pago')
    } finally {
      setSubmitting(false)
    }
  }

  async function simulateCulqiYape() {
    if (!user || !course) return
    setSubmitting(true)
    setError('')
    setStep('confirming')

    try {
      const payment = await createPayment({
        studentId: user.id,
        orderId: null,
        courseId: course.id,
        amount: productPrice,
        currency: 'PEN',
        provider: 'culqi_simulated',
      })
      await simulateCulqiWebhook(payment.id)
      setStep('done')
    } catch (err) {
      setStep('yape-qr')
      setError(err instanceof Error ? err.message : String(err) || 'Error al confirmar el pago simulado')
    } finally {
      setSubmitting(false)
    }
  }

  if (!courseSlug) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="card p-12 text-center">
          <h1 className="text-xl font-bold text-surface-900 mb-2">Falta seleccionar un curso</h1>
          <p className="text-surface-500 mb-6">El checkout necesita recibir un curso desde el catálogo.</p>
          <Link to="/cursos" className="btn-primary">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm text-surface-500">Cargando curso...</p>
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="card p-12 text-center">
          <h1 className="text-xl font-bold text-surface-900 mb-2">Curso no disponible</h1>
          <p className="text-surface-500 mb-6">No pudimos cargar el curso para iniciar la compra.</p>
          <Link to="/cursos" className="btn-primary">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  if (course.is_free) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="card p-12 text-center">
          <h1 className="text-xl font-bold text-surface-900 mb-2">Este curso es gratis</h1>
          <p className="text-surface-500 mb-6">La inscripción se realiza desde la página del curso.</p>
          <Link to={`/cursos/${course.slug}`} className="btn-primary">Volver al curso</Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="card p-12 text-center">
          <p className="text-surface-500 mb-4">Inicia sesión para continuar con la compra de {course.title}</p>
          <Link to={`/acceder?redirect=${encodeURIComponent(`/checkout?curso=${course.slug}`)}`} className="btn-primary">Iniciar sesión</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-12">
      <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
        <Link to="/" className="hover:text-surface-600">Inicio</Link>
        <span>/</span>
        <Link to={`/cursos/${course.slug}`} className="hover:text-surface-600">{course.title}</Link>
        <span>/</span>
        <span className="text-surface-900 font-medium">Checkout</span>
      </nav>

      {step === 'select' && (
        <>
          <div className="mb-8">
            <h1 className="section-title">Checkout</h1>
            <p className="section-subtitle mt-1">Selecciona tu método de pago</p>
          </div>

          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-surface-500">Curso</p>
                <p className="font-semibold text-surface-900">{course.title}</p>
              </div>
              <p className="text-xl font-bold text-surface-900">S/{productPrice.toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelectMethod(method.id)}
                className={`w-full card-hover p-5 flex items-center gap-4 text-left ${
                  selectedMethod === method.id ? 'ring-2 ring-primary-500' : ''
                } ${!method.available ? 'opacity-70' : ''}`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-none text-2xl ${method.color}`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900">{method.label}</p>
                  <p className="text-sm text-surface-500">{method.description}</p>
                </div>
                <span className="text-surface-300">→</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'yape-qr' && (
        <div className="card p-8 text-center">
          <span className="text-6xl block mb-4">📱</span>
          <h2 className="text-xl font-bold text-surface-900 mb-2">Paga con Yape</h2>
          <p className="text-surface-500 mb-6">Este flujo está simulado para revisión funcional. En producción debe conectarse con Culqi.</p>

          <div className="mx-auto mb-6 flex h-56 w-56 items-center justify-center rounded-none bg-white border-2 border-dashed border-surface-300">
            <div className="text-center">
              <span className="text-4xl">⬛</span>
              <p className="text-xs text-surface-400 mt-2">QR simulado</p>
              <p className="text-xs text-surface-300 mt-1">Curso: {course.title}</p>
            </div>
          </div>

          <p className="text-sm text-surface-500 mb-6">
            Monto: <strong className="text-surface-900">S/{productPrice.toFixed(2)}</strong>
          </p>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-3">
            <button onClick={simulateCulqiYape} disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Confirmando...' : 'Simular pago completado'}
            </button>
            <button onClick={() => setStep('select')} className="btn-ghost w-full text-sm">
              ← Elegir otro método
            </button>
          </div>
        </div>
      )}

      {step === 'directo-form' && (
        <div>
          <div className="mb-8">
            <h1 className="section-title">Pago Directo</h1>
            <p className="section-subtitle mt-1">Transfiere el monto y envíanos el comprobante</p>
          </div>

          <div className="card p-5 mb-6 bg-primary-50/50 border border-primary-200">
            <h3 className="font-semibold text-surface-900 mb-3">Datos de la cuenta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-surface-500">Banco:</span><span className="font-medium text-surface-900">{ACCOUNT_INFO.bank}</span></div>
              <div className="flex justify-between gap-4"><span className="text-surface-500">Tipo:</span><span className="font-medium text-surface-900">{ACCOUNT_INFO.accountType}</span></div>
              <div className="flex justify-between gap-4"><span className="text-surface-500">N° Cuenta:</span><span className="font-medium text-surface-900 font-mono">{ACCOUNT_INFO.accountNumber}</span></div>
              <div className="flex justify-between gap-4"><span className="text-surface-500">CCI:</span><span className="font-medium text-surface-900 font-mono">{ACCOUNT_INFO.cci}</span></div>
              <div className="flex justify-between gap-4"><span className="text-surface-500">Titular:</span><span className="font-medium text-surface-900">{ACCOUNT_INFO.holder}</span></div>
              <div className="flex justify-between gap-4"><span className="text-surface-500">Yape:</span><span className="font-medium text-surface-900 font-mono">{ACCOUNT_INFO.yape}</span></div>
              <div className="pt-2 text-center">
                <p className="text-sm text-surface-500">Curso: {course.title}</p>
                <p className="text-lg font-bold text-primary-700">Monto: S/{productPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePagoDirecto} className="card p-5 space-y-4">
            <div>
              <label className="label-field text-sm">Sube tu comprobante de pago</label>
              <input
                type="file"
                name="proof"
                accept="image/*,.pdf"
                required
                className="block w-full text-sm text-surface-500 mt-1 file:mr-3 file:rounded-none file:border-0 file:bg-primary-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-200"
              />
              <p className="text-xs text-surface-400 mt-1">Foto del voucher o captura de Yape (PDF o imagen)</p>
            </div>
            <div>
              <label className="label-field text-sm">Nota adicional (opcional)</label>
              <input type="text" name="notes" className="input-field text-sm mt-1" placeholder="Ej: Transferencia desde BCP" />
            </div>

            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Enviando...' : 'Enviar comprobante'}
            </button>

            <button type="button" onClick={() => setStep('select')} className="btn-ghost w-full text-sm">
              ← Elegir otro método
            </button>
          </form>
        </div>
      )}

      {step === 'confirming' && (
        <div className="card p-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 mb-4" />
          <h2 className="text-lg font-semibold text-surface-900 mb-2">Confirmando pago...</h2>
          <p className="text-sm text-surface-500">Estamos verificando tu pago simulado con Yape</p>
        </div>
      )}

      {step === 'done' && (
        <div className="card p-12 text-center">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 className="text-xl font-bold text-surface-900 mb-2">
            {selectedMethod === 'directo' ? '¡Comprobante enviado!' : '¡Pago exitoso!'}
          </h2>
          <p className="text-surface-500 mb-6">
            {selectedMethod === 'directo'
              ? 'Recibirás un correo cuando el administrador confirme el pago.'
              : 'Tu inscripción fue activada para este curso.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to={`/panel/cursos/${course.slug}`} className="btn-primary">Ir al curso</Link>
            <Link to="/cursos" className="btn-ghost">Seguir explorando</Link>
          </div>
        </div>
      )}
    </div>
  )
}
