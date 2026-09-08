import { useState } from 'react'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload, X, Download } from 'lucide-react'
import { parseProductExcel, EXCEL_TEMPLATE_COLUMNS, downloadExcelTemplate, type ExcelProductRow } from '@/utils/excelImport'
import { productService } from '@/services/productService'

export default function ProductImport({
  onClose,
  onImported,
}: {
  onClose: () => void
  onImported: (count: number) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ExcelProductRow[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setParsing(true)
    setMessage(null)
    setRows(null)
    setErrors([])
    setFileName(file.name)
    try {
      const result = await parseProductExcel(file)
      setRows(result.products)
      setErrors(result.errors)
      if (!result.products.length && !result.errors.length) {
        setMessage({ kind: 'error', text: 'El archivo no tiene filas con datos de productos.' })
      }
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? `No se pudo leer el archivo: ${err.message}` : 'No se pudo leer el archivo.',
      })
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (!rows?.length) return
    setImporting(true)
    setMessage(null)
    try {
      const inserted = await productService.createProducts(rows)
      setMessage({
        kind: 'ok',
        text: `${inserted} producto${inserted === 1 ? '' : 's'} importado${inserted === 1 ? '' : 's'} correctamente.`,
      })
      onImported(inserted)
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? `Error al importar: ${err.message}` : 'Error al importar los productos.',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Importar productos desde Excel"
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-muted">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-brand" />
            <h2 className="font-display font-semibold text-ink">Importar productos</h2>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="p-1.5 text-muted hover:text-ink transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Dropzone */}
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-surface-muted hover:border-brand/40 transition-colors p-6 text-center">
            <Upload size={22} className="mx-auto mb-2 text-muted" />
            <p className="text-sm text-ink font-medium">
              {fileName ?? 'Selecciona un archivo Excel o CSV'}
            </p>
            <p className="text-xs text-muted mt-1">
              .xlsx, .xls o .csv — se importa la primera hoja
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {/* Columnas esperadas */}
          <div className="rounded-lg bg-surface p-3">
            <div className="flex items-start justify-between gap-4 mb-1.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-muted mt-0.5">
                Columnas reconocidas
              </p>
              <button
                type="button"
                onClick={downloadExcelTemplate}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-surface-muted rounded text-xs font-medium text-brand hover:bg-brand/5 hover:border-brand/20 transition-colors shrink-0"
              >
                <Download size={12} />
                Descargar modelo
              </button>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {EXCEL_TEMPLATE_COLUMNS.join(' · ')}
            </p>
            <p className="text-[11px] text-muted mt-1.5">
              Nombre es obligatorio. Precio con coma o punto decimal (S/ 249,90). Estado: activo / inactivo / archivado.
            </p>
          </div>

          {/* Parsing */}
          {parsing && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              Leyendo el archivo...
            </div>
          )}

          {/* Preview */}
          {rows !== null && !parsing && (
            <div className="rounded-xl border border-surface-muted overflow-hidden">
              <div className="px-4 py-3 bg-surface/60 flex items-center justify-between">
                <p className="text-sm font-medium text-ink">
                  {rows.length} producto{rows.length === 1 ? '' : 's'} listo{rows.length === 1 ? '' : 's'} para importar
                </p>
                {rows.length > 0 && (
                  <CheckCircle2 size={16} className="text-green-600" />
                )}
              </div>
              {rows.slice(0, 5).map((row, index) => (
                <div key={index} className="px-4 py-2 border-t border-surface-muted flex items-center justify-between text-sm">
                  <span className="truncate text-ink">{row.name}</span>
                  <span className="text-xs text-muted shrink-0 ml-3">
                    {row.base_price !== undefined ? `S/ ${row.base_price.toFixed(2)}` : '—'}
                    {row.stock !== undefined ? ` · ${row.stock} u.` : ''}
                  </span>
                </div>
              ))}
              {rows.length > 5 && (
                <p className="px-4 py-2 border-t border-surface-muted text-xs text-muted">
                  …y {rows.length - 5} más
                </p>
              )}
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1.5">
                <AlertCircle size={13} />
                {errors.length} fila{errors.length === 1 ? '' : 's'} omitida{errors.length === 1 ? '' : 's'}
              </p>
              <ul className="text-xs text-red-600 space-y-0.5 max-h-24 overflow-y-auto">
                {errors.slice(0, 8).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-3 text-sm ${
                message.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleImport}
              disabled={!rows?.length || importing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Importar {rows?.length || 0} producto{rows?.length === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
