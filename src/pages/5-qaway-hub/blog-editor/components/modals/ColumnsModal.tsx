import React, { useState, useRef } from 'react'
import { X, Columns2, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { uploadImage } from '../../services/storageService'

export interface ColumnsData {
  layoutType: 'equal' | 'highlight' | 'cards'
  col1Title?: string
  col1Text: string
  col2Type: 'text' | 'image'
  col2Title?: string
  col2Text?: string
  col2ImageUrl?: string
  col2ImageAlt?: string
  col2ImageCaption?: string
}

interface ColumnsModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (data: ColumnsData) => void
}

export default function ColumnsModal({ isOpen, onClose, onInsert }: ColumnsModalProps) {
  const [layoutType, setLayoutType] = useState<'equal' | 'highlight' | 'cards'>('equal')
  const [col1Title, setCol1Title] = useState('Aspecto Clave A')
  const [col1Text, setCol1Text] = useState('Describe aquí el primer concepto, beneficio o proceso en detalle.')
  const [col2Type, setCol2Type] = useState<'text' | 'image'>('text')
  const [col2Title, setCol2Title] = useState('Aspecto Clave B')
  const [col2Text, setCol2Text] = useState('Describe aquí el segundo punto en paralelo para comparar o complementar.')
  const [col2ImageUrl, setCol2ImageUrl] = useState('')
  const [col2ImageAlt, setCol2ImageAlt] = useState('')
  const [col2ImageCaption, setCol2ImageCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida.')
      return
    }
    setIsUploading(true)
    try {
      const res = await uploadImage(file)
      setCol2ImageUrl(res.url)
      if (!col2ImageAlt) setCol2ImageAlt(file.name.replace(/\.[^/.]+$/, ''))
    } catch (e) {
      console.error(e)
      alert('Error al subir imagen.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInsert({
      layoutType,
      col1Title: col1Title.trim(),
      col1Text: col1Text.trim(),
      col2Type,
      col2Title: col2Title.trim(),
      col2Text: col2Text.trim(),
      col2ImageUrl: col2ImageUrl.trim(),
      col2ImageAlt: col2ImageAlt.trim(),
      col2ImageCaption: col2ImageCaption.trim(),
    })
    // Reset para que la próxima inserción comience 100% limpia
    setCol1Title('')
    setCol1Text('')
    setCol2Title('')
    setCol2Text('')
    setCol2ImageUrl('')
    setCol2ImageAlt('')
    setCol2ImageCaption('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-accent" />
            Insertar Bloque en 2 Columnas
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Selector de Estilo de Columnas */}
          <div>
            <label className="font-bold text-muted uppercase tracking-wider block mb-1.5">
              Estilo Visual de Columnas:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLayoutType('equal')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  layoutType === 'equal'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <span>50% / 50% Limpio</span>
                <span className="block text-[10px] font-normal text-muted-light">Sin bordes</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('cards')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  layoutType === 'cards'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <span>Tarjetas Suaves</span>
                <span className="block text-[10px] font-normal text-muted-light">Cajas grises</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutType('highlight')}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  layoutType === 'highlight'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line bg-surface-muted text-muted hover:text-primary'
                }`}
              >
                <span>Destacado Oscuro</span>
                <span className="block text-[10px] font-normal text-muted-light">Caja negra + gris</span>
              </button>
            </div>
          </div>

          {/* Columna 1 */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-2">
            <span className="font-bold text-primary block">Columna 1 (Izquierda - Texto)</span>
            <input
              type="text"
              value={col1Title}
              onChange={e => setCol1Title(e.target.value)}
              placeholder="Título de la columna 1..."
              className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent font-semibold"
            />
            <textarea
              rows={3}
              required
              value={col1Text}
              onChange={e => setCol1Text(e.target.value)}
              placeholder="Contenido de la primera columna..."
              className="w-full bg-white border border-line rounded-lg p-2.5 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
            />
          </div>

          {/* Columna 2: Tipo Texto o Imagen */}
          <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary">Columna 2 (Derecha)</span>
              <div className="flex rounded-lg bg-white p-0.5 border border-line">
                <button
                  type="button"
                  onClick={() => setCol2Type('text')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    col2Type === 'text'
                      ? 'bg-accent text-white shadow-2xs'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <FileText className="w-3 h-3" /> Texto
                </button>
                <button
                  type="button"
                  onClick={() => setCol2Type('image')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    col2Type === 'image'
                      ? 'bg-accent text-white shadow-2xs'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" /> Foto
                </button>
              </div>
            </div>

            {col2Type === 'text' ? (
              <>
                <input
                  type="text"
                  value={col2Title}
                  onChange={e => setCol2Title(e.target.value)}
                  placeholder="Título de la columna 2..."
                  className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent font-semibold"
                />
                <textarea
                  rows={3}
                  required={col2Type === 'text'}
                  value={col2Text}
                  onChange={e => setCol2Text(e.target.value)}
                  placeholder="Contenido de la segunda columna..."
                  className="w-full bg-white border border-line rounded-lg p-2.5 text-xs focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
              </>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-line hover:border-accent/60 bg-white rounded-xl p-4 text-center cursor-pointer transition-colors"
                >
                  {isUploading ? (
                    <span className="text-xs font-semibold text-primary">Subiendo foto...</span>
                  ) : col2ImageUrl ? (
                    <div className="space-y-1.5">
                      <img
                        src={col2ImageUrl}
                        alt="Preview"
                        className="max-h-28 mx-auto rounded-lg object-contain border border-line"
                      />
                      <p className="text-[11px] font-semibold text-accent">Clic para cambiar imagen</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-6 h-6 text-accent mb-1" />
                      <p className="text-xs font-bold text-primary">Subir foto para Columna 2</p>
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={col2ImageUrl}
                  onChange={e => setCol2ImageUrl(e.target.value)}
                  placeholder="O pega aquí la URL de la imagen..."
                  className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-accent"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={col2ImageCaption}
                    onChange={e => setCol2ImageCaption(e.target.value)}
                    placeholder="Pie de foto (caption)..."
                    className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={col2ImageAlt}
                    onChange={e => setCol2ImageAlt(e.target.value)}
                    placeholder="Texto alternativo (alt SEO)..."
                    className="w-full bg-white border border-line rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Vista previa en tiempo real */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1 block">
              Vista previa del bloque ({layoutType}):
            </span>
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-muted/60 rounded-xl border border-line">
              <div
                className={`p-3 rounded-xl ${
                  layoutType === 'highlight'
                    ? 'bg-[#18181b] text-white'
                    : layoutType === 'cards'
                    ? 'bg-white border border-line'
                    : 'bg-transparent'
                }`}
              >
                <h5 className="font-bold text-xs">{col1Title || 'Columna 1'}</h5>
                <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{col1Text}</p>
              </div>

              <div
                className={`p-3 rounded-xl ${
                  layoutType === 'cards' || layoutType === 'highlight'
                    ? 'bg-white border border-line text-primary'
                    : 'bg-transparent'
                }`}
              >
                {col2Type === 'image' && col2ImageUrl ? (
                  <img
                    src={col2ImageUrl}
                    alt="Preview"
                    className="max-h-16 w-full object-cover rounded-lg border border-line"
                  />
                ) : (
                  <>
                    <h5 className="font-bold text-xs">{col2Title || 'Columna 2'}</h5>
                    <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{col2Text}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-line rounded-lg font-bold text-muted hover:text-primary transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-lg font-bold shadow-xs transition-colors cursor-pointer"
            >
              Insertar 2 Columnas
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
