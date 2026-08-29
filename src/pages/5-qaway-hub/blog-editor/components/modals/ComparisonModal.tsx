import React, { useState } from 'react'
import { X, Columns2, Check, AlertCircle } from 'lucide-react'

export interface ComparisonData {
  leftTitle: string
  leftItems: string[]
  rightTitle: string
  rightItems: string[]
}

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: ComparisonData) => void
}

export default function ComparisonModal({ isOpen, onClose, onInsert }: ComparisonModalProps) {
  const [leftTitle, setLeftTitle] = useState('Método Tradicional / Antes')
  const [leftText, setLeftText] = useState(
    'Procesos manuales lentos\nFalta de seguimiento en WhatsApp\nDatos dispersos en hojas de cálculo'
  )
  const [rightTitle, setRightTitle] = useState('Con Automatización Qaway Lab')
  const [rightText, setRightText] = useState(
    'Respuestas inmediatas 24/7\nEmbudo centralizado en tiempo real\nMayor conversión sin aumentar equipo'
  )

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInsert({
      leftTitle: leftTitle.trim() || 'Antes',
      leftItems: leftText.split('\n').map(s => s.trim()).filter(Boolean),
      rightTitle: rightTitle.trim() || 'Con Qaway Lab',
      rightItems: rightText.split('\n').map(s => s.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-accent" />
            Insertar Tabla Comparativa (Antes vs Después)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Columna Izquierda (Tradicional/Antes) */}
            <div className="space-y-2 bg-danger/5 p-3 rounded-xl border border-danger/20">
              <label className="text-xs font-bold text-danger flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Columna 1 (Antes / Desventajas)
              </label>
              <input
                type="text"
                value={leftTitle}
                onChange={e => setLeftTitle(e.target.value)}
                placeholder="Título columna 1"
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-danger"
              />
              <textarea
                rows={4}
                value={leftText}
                onChange={e => setLeftText(e.target.value)}
                placeholder="Un punto por línea..."
                className="w-full bg-white border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-danger resize-none"
              />
            </div>

            {/* Columna Derecha (Qaway/Después) */}
            <div className="space-y-2 bg-success/5 p-3 rounded-xl border border-success/20">
              <label className="text-xs font-bold text-success flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Columna 2 (Después / Ventajas)
              </label>
              <input
                type="text"
                value={rightTitle}
                onChange={e => setRightTitle(e.target.value)}
                placeholder="Título columna 2"
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-success"
              />
              <textarea
                rows={4}
                value={rightText}
                onChange={e => setRightText(e.target.value)}
                placeholder="Un punto por línea..."
                className="w-full bg-white border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-success resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted hover:text-primary rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Insertar Comparativa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
