import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, X } from 'lucide-react'
import type { SalesReportColumn } from '@/utils/salesExport'

interface ColumnPickerModalProps {
  open: boolean
  title: string
  subtitle?: string
  options: SalesReportColumn[]
  initialSelected?: string[]
  confirming?: boolean
  onConfirm: (selected: string[]) => void
  onCancel: () => void
}

export function ColumnPickerModal({
  open,
  title,
  subtitle,
  options,
  initialSelected,
  confirming = false,
  onConfirm,
  onCancel,
}: ColumnPickerModalProps) {
  const enabledKeys = useMemo(() => options.filter(opt => opt.enabled).map(opt => opt.key), [options])
  const [selected, setSelected] = useState<string[]>(() => initialSelected ?? enabledKeys)

  useEffect(() => {
    if (open) {
      const seed = initialSelected && initialSelected.length > 0 ? initialSelected : enabledKeys
      setSelected(seed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const toggle = (key: string) => {
    setSelected(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }

  const allSelected = enabledKeys.length > 0 && enabledKeys.every(k => selected.includes(k))

  let lastGroup = ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection controls */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {selected.length} de {enabledKeys.length} columnas seleccionadas
          </p>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setSelected(enabledKeys)}
              disabled={allSelected}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Seleccionar todo
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Quitar todo
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {options.map(opt => {
            const showGroup = opt.group !== lastGroup
            lastGroup = opt.group
            const checked = selected.includes(opt.key)
            return (
              <div key={opt.key}>
                {showGroup && (
                  <p className="px-2 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {opt.group}
                  </p>
                )}
                <label
                  className={`flex items-start gap-3 px-2 py-2 rounded-lg ${
                    opt.enabled ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!opt.enabled}
                    onChange={() => toggle(opt.key)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block text-sm text-gray-800">{opt.label}</span>
                    {opt.note && <span className="block text-xs text-gray-400">{opt.note}</span>}
                  </span>
                </label>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={confirming || selected.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {confirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {confirming ? 'Generando...' : 'Descargar'}
          </button>
        </div>
      </div>
    </div>
  )
}
