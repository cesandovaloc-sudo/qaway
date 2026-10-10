import { useEffect, useState } from 'react'
import { FolderKanban, Plus, X } from 'lucide-react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import { projectsService } from '@/services/projectsService'
import {
  PROJECT_CATEGORY_META,
  PROJECT_METHODOLOGY_META,
  type Currency,
  type NewProjectInput,
  type ProjectCategory,
  type ProjectMethodology,
} from '@/types/project.types'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  code: string
  name: string
  client: string
  description: string
  category: ProjectCategory
  methodology: ProjectMethodology
  currency: Currency
  budgetAllocated: string
  startDate: string
  targetDate: string
  manager: string
  membersCount: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL_FORM: FormState = {
  code: '',
  name: '',
  client: '',
  description: '',
  category: 'software',
  methodology: 'scrum',
  currency: 'PEN',
  budgetAllocated: '',
  startDate: '',
  targetDate: '',
  manager: '',
  membersCount: '4',
}

const inputClass =
  'w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/15'
const labelClass = 'text-xs font-semibold text-zinc-600 mb-1.5 block'

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!form.code.trim()) errors.code = 'El código es obligatorio.'
  else if (form.code.trim().length < 3) errors.code = 'Mínimo 3 caracteres.'
  else if (
    projectsService
      .getSnapshot()
      .projects.some((project) => project.code.toUpperCase() === form.code.trim().toUpperCase())
  ) {
    errors.code = 'Ya existe un proyecto con ese código.'
  }

  if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
  if (!form.client.trim()) errors.client = 'Indica el cliente o área interna.'
  if (!form.description.trim()) errors.description = 'Agrega una descripción breve.'
  if (!form.manager.trim()) errors.manager = 'Asigna un responsable.'

  const budget = Number(form.budgetAllocated)
  if (!form.budgetAllocated.trim() || Number.isNaN(budget)) errors.budgetAllocated = 'Ingresa un monto.'
  else if (budget <= 0) errors.budgetAllocated = 'El presupuesto debe ser mayor a 0.'

  const members = Number(form.membersCount)
  if (!form.membersCount.trim() || Number.isNaN(members)) errors.membersCount = 'Indica el tamaño.'
  else if (members < 1) errors.membersCount = 'Mínimo 1 integrante.'

  if (!form.startDate) errors.startDate = 'Selecciona la fecha de inicio.'
  if (!form.targetDate) errors.targetDate = 'Selecciona la fecha objetivo.'
  else if (form.startDate && form.targetDate < form.startDate) {
    errors.targetDate = 'La fecha objetivo debe ser posterior al inicio.'
  }

  return errors
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const cardRef = useDismissOnEscapeOrOutside(isOpen, onClose)

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM)
      setErrors({})
      setSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const payload: NewProjectInput = {
      code: form.code,
      name: form.name,
      client: form.client,
      description: form.description,
      category: form.category,
      methodology: form.methodology,
      currency: form.currency,
      budgetAllocated: Number(form.budgetAllocated),
      startDate: form.startDate,
      targetDate: form.targetDate,
      manager: form.manager,
      membersCount: Number(form.membersCount),
    }
    projectsService.createProject(payload)
    setSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Nuevo proyecto"
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
        style={{ animation: 'gp-modal-in .28s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <style>{`
          @keyframes gp-modal-in{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:none}}
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <FolderKanban size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900">Nuevo proyecto</h2>
              <p className="text-[13px] text-zinc-500">
                Registra un proyecto universal: metodología, fechas y presupuesto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-4 gap-y-4 px-6 py-5 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="gp-code">Código *</label>
            <input
              id="gp-code"
              value={form.code}
              onChange={(event) => update('code', event.target.value)}
              placeholder="PRJ-NUEVO"
              className={inputClass}
            />
            {errors.code && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.code}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-name">Nombre *</label>
            <input
              id="gp-name"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Plataforma Core Cloud"
              className={inputClass}
            />
            {errors.name && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-client">Cliente / Área *</label>
            <input
              id="gp-client"
              value={form.client}
              onChange={(event) => update('client', event.target.value)}
              placeholder="Cliente o área interna"
              className={inputClass}
            />
            {errors.client && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.client}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-manager">Responsable *</label>
            <input
              id="gp-manager"
              value={form.manager}
              onChange={(event) => update('manager', event.target.value)}
              placeholder="Nombre del project manager"
              className={inputClass}
            />
            {errors.manager && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.manager}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-category">Categoría</label>
            <select
              id="gp-category"
              value={form.category}
              onChange={(event) => update('category', event.target.value as ProjectCategory)}
              className={inputClass}
            >
              {(Object.keys(PROJECT_CATEGORY_META) as ProjectCategory[]).map((category) => (
                <option key={category} value={category}>
                  {PROJECT_CATEGORY_META[category].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-methodology">Metodología</label>
            <select
              id="gp-methodology"
              value={form.methodology}
              onChange={(event) => update('methodology', event.target.value as ProjectMethodology)}
              className={inputClass}
            >
              {(Object.keys(PROJECT_METHODOLOGY_META) as ProjectMethodology[]).map((methodology) => (
                <option key={methodology} value={methodology}>
                  {PROJECT_METHODOLOGY_META[methodology].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-budget">Presupuesto *</label>
            <div className="flex gap-2">
              <input
                id="gp-budget"
                type="number"
                min={0}
                value={form.budgetAllocated}
                onChange={(event) => update('budgetAllocated', event.target.value)}
                placeholder="0"
                className={inputClass}
              />
              <select
                aria-label="Moneda"
                value={form.currency}
                onChange={(event) => update('currency', event.target.value as Currency)}
                className={`${inputClass} w-24 shrink-0`}
              >
                <option value="PEN">PEN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            {errors.budgetAllocated && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.budgetAllocated}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-members">Integrantes *</label>
            <input
              id="gp-members"
              type="number"
              min={1}
              value={form.membersCount}
              onChange={(event) => update('membersCount', event.target.value)}
              className={inputClass}
            />
            {errors.membersCount && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.membersCount}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-start">Fecha de inicio *</label>
            <input
              id="gp-start"
              type="date"
              value={form.startDate}
              onChange={(event) => update('startDate', event.target.value)}
              className={inputClass}
            />
            {errors.startDate && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-target">Fecha objetivo *</label>
            <input
              id="gp-target"
              type="date"
              min={form.startDate || undefined}
              value={form.targetDate}
              onChange={(event) => update('targetDate', event.target.value)}
              className={inputClass}
            />
            {errors.targetDate && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.targetDate}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="gp-description">Descripción *</label>
            <textarea
              id="gp-description"
              rows={2}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="Objetivo y alcance del proyecto…"
              className={`${inputClass} h-auto resize-none py-2.5`}
            />
            {errors.description && (
              <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.description}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              <Plus size={16} />
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
