import React, { useState } from 'react'
import { X, HelpCircle, Plus, Trash2 } from 'lucide-react'

export interface FaqItem {
  question: string
  answer: string
}

interface FaqModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (faqs: FaqItem[]) => void
}

export default function FaqModal({ isOpen, onClose, onInsert }: FaqModalProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      question: '¿Cuánto tiempo toma implementar una automatización?',
      answer: 'Generalmente entre 3 a 7 días hábiles según la complejidad de los flujos.',
    },
    {
      question: '¿Necesito conocimientos técnicos para operarlo?',
      answer: 'No, todo queda configurado y te entregamos un panel simple e intuitivo.',
    },
  ])

  if (!isOpen) return null

  const handleAddFaq = () => {
    setFaqs(prev => [...prev, { question: '', answer: '' }])
  }

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    )
  }

  const handleRemoveFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim())
    if (validFaqs.length > 0) {
      onInsert(validFaqs)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent" />
            Insertar Preguntas Frecuentes (FAQ)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-surface-muted p-3.5 rounded-xl border border-line space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Pregunta #{idx + 1}
                  </span>
                  {faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={faq.question}
                  onChange={e => handleUpdateFaq(idx, 'question', e.target.value)}
                  placeholder="¿Cuál es la duda o pregunta frecuente?"
                  className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent text-primary"
                />

                <textarea
                  rows={2}
                  required
                  value={faq.answer}
                  onChange={e => handleUpdateFaq(idx, 'answer', e.target.value)}
                  placeholder="Respuesta clara y concisa..."
                  className="w-full bg-white border border-line rounded-lg p-2 text-xs focus:outline-none focus:border-accent resize-none text-primary"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddFaq}
            className="w-full py-2 border border-dashed border-line rounded-xl text-xs font-semibold text-accent hover:bg-accent/5 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" /> Añadir otra pregunta
          </button>

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
              Insertar FAQs
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
