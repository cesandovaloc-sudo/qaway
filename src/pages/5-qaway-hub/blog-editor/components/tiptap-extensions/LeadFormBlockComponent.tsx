import React, { useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Pencil, Trash2, Mail, CheckCircle2, Download } from 'lucide-react'

export default function LeadFormBlockComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props
  const {
    type,
    title,
    description,
    buttonText,
    successMessage,
    downloadUrl,
    themeColor,
    textColor,
    fields,
  } = node.attrs

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDesc, setEditDesc] = useState(description)
  const [editBtn, setEditBtn] = useState(buttonText)
  const [editSuccess, setEditSuccess] = useState(successMessage)
  const [editUrl, setEditUrl] = useState(downloadUrl)
  const [editColor, setEditColor] = useState(themeColor || '#ff4b0b')
  const [editTextColor, setEditTextColor] = useState(textColor || '#ffffff')
  const [editFields, setEditFields] = useState(fields || { name: true, email: true, phone: false, company: false })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSave = () => {
    updateAttributes({
      title: editTitle,
      description: editDesc,
      buttonText: editBtn,
      successMessage: editSuccess,
      downloadUrl: editUrl,
      themeColor: editColor,
      textColor: editTextColor,
      fields: editFields,
    })
    setIsEditing(false)
  }

  return (
    <NodeViewWrapper className="my-6 relative group font-sans not-prose">
      {/* Botones de acción flotantes al pasar el mouse */}
      <div className="absolute right-3 -top-3.5 z-20 hidden group-hover:flex items-center gap-1.5 bg-white border border-line p-1 rounded-xl shadow-md animate-in fade-in duration-100">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="px-2.5 py-1 text-[11px] font-bold text-accent bg-accent/10 hover:bg-accent hover:text-white rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          title="Editar formulario y colores (o haz doble clic)"
        >
          <Pencil className="w-3 h-3" />
          <span>{isEditing ? 'Cerrar' : 'Editar Formulario'}</span>
        </button>
        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
          title="Eliminar formulario"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isEditing ? (
        <div className="p-5 bg-white border-2 border-accent/40 rounded-2xl shadow-lg space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5 text-accent" />
              <span>Editar Formulario de Leads (HubSpot Video 5)</span>
            </span>
            <span className="text-[10px] font-mono text-muted bg-surface-muted px-2 py-0.5 rounded">
              Tipo: {type.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-muted block mb-1">Título de la Llamada:</label>
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="font-bold text-muted block mb-1">Texto del Botón:</label>
              <input
                type="text"
                value={editBtn}
                onChange={e => setEditBtn(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-muted block mb-1">Descripción / Propuesta de Valor:</label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              className="w-full bg-surface-muted border border-line rounded-lg p-2 text-xs text-primary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Mensaje de Éxito & Descarga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted block mb-1">Mensaje de Éxito:</label>
              <input
                type="text"
                value={editSuccess}
                onChange={e => setEditSuccess(e.target.value)}
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-1.5 text-xs text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted block mb-1">URL de Descarga (Opcional):</label>
              <input
                type="text"
                value={editUrl}
                onChange={e => setEditUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-muted border border-line rounded-lg px-3 py-1.5 text-xs text-primary font-mono focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Selectores de Color Libres */}
          <div className="p-3 bg-surface-muted rounded-xl border border-line grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted block mb-1">Color del Tema / Botón:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-7 h-7 rounded border border-line cursor-pointer"
                />
                <input
                  type="text"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                  className="w-20 bg-white border border-line rounded px-2 py-0.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted block mb-1">Color del Texto del Botón:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editTextColor}
                  onChange={e => setEditTextColor(e.target.value)}
                  className="w-7 h-7 rounded border border-line cursor-pointer"
                />
                <input
                  type="text"
                  value={editTextColor}
                  onChange={e => setEditTextColor(e.target.value)}
                  className="w-20 bg-white border border-line rounded px-2 py-0.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-muted block">Campos solicitados:</span>
            <div className="flex flex-wrap gap-4 text-[11px]">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked disabled className="accent-accent" />
                <span>Correo (Obligatorio)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.name}
                  onChange={e => setEditFields((f: any) => ({ ...f, name: e.target.checked }))}
                  className="accent-accent cursor-pointer"
                />
                <span>Nombre Completo</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.phone}
                  onChange={e => setEditFields((f: any) => ({ ...f, phone: e.target.checked }))}
                  className="accent-accent cursor-pointer"
                />
                <span>Teléfono / WhatsApp</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editFields.company}
                  onChange={e => setEditFields((f: any) => ({ ...f, company: e.target.checked }))}
                  className="accent-accent cursor-pointer"
                />
                <span>Empresa</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-muted hover:text-primary cursor-pointer font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-accent hover:bg-accent-dark text-white font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className="p-5 sm:p-6 bg-[#fafafc] border border-line rounded-2xl shadow-xs space-y-3.5 transition-all hover:border-primary/30 cursor-pointer"
          title="Doble clic para editar formulario"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
                <Mail className="w-3.5 h-3.5" />
                <span>Formulario de Captura de Leads</span>
                {type !== 'inline' && (
                  <span className="bg-surface-muted text-muted px-1.5 py-0.2 rounded border border-line">
                    {type}
                  </span>
                )}
              </div>
              <h4 className="font-display font-bold text-sm sm:text-base text-primary m-0">{title}</h4>
              {description && <p className="text-xs text-muted mt-1 m-0 leading-relaxed">{description}</p>}
            </div>
          </div>

          {isSubmitted ? (
            <div className="p-4 bg-white border border-success/30 rounded-xl space-y-2 text-center animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto" />
              <p className="font-bold text-xs text-success m-0">{successMessage || '¡Gracias por registrarte!'}</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline mt-1"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar recurso ahora
                </a>
              )}
            </div>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault()
                setIsSubmitted(true)
              }}
              className="space-y-2 pt-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fields?.name && (
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre completo"
                    className="w-full bg-white border border-line rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                )}
                <input
                  type="email"
                  required
                  placeholder="tu.correo@empresa.com"
                  className={`w-full bg-white border border-line rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent ${
                    !fields?.name ? 'sm:col-span-2' : ''
                  }`}
                />
                {fields?.phone && (
                  <input
                    type="tel"
                    placeholder="+51 999 999 999 (WhatsApp)"
                    className="w-full bg-white border border-line rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                )}
                {fields?.company && (
                  <input
                    type="text"
                    placeholder="Nombre de empresa"
                    className="w-full bg-white border border-line rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-transform hover:scale-[1.01] shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                style={{ backgroundColor: themeColor || '#ff4b0b', color: textColor || '#ffffff' }}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{buttonText || 'Enviar Formulario'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </NodeViewWrapper>
  )
}
