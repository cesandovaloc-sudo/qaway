import { useEffect, useState } from 'react'
import {
  Building2,
  FileStack,
  Percent,
  Ruler,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  Link2,
} from 'lucide-react'
import { fiscalService } from '@/services/fiscalService'
import type { BusinessSettings, Tax, SunatUnit, InvoiceSeries, TaxType } from '@/types'

type Tab = 'negocio' | 'series' | 'impuestos' | 'unidades'

const tabs: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: 'negocio', label: 'Negocio', icon: Building2 },
  { key: 'series', label: 'Series', icon: FileStack },
  { key: 'impuestos', label: 'Impuestos', icon: Percent },
  { key: 'unidades', label: 'Unidades', icon: Ruler },
]

const taxTypeOptions: { value: TaxType; label: string }[] = [
  { value: 'igv', label: 'IGV' },
  { value: 'isc', label: 'ISC' },
  { value: 'exonerado', label: 'Exonerado' },
  { value: 'inafecto', label: 'Inafecto' },
  { value: 'gratuito', label: 'Gratuito' },
]

const tipoDocLabels: Record<string, string> = {
  '01': 'Factura',
  '03': 'Boleta',
  '07': 'Nota crédito',
  '08': 'Nota débito',
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('negocio')
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">Configuración</h1>
        <p className="text-sm text-muted mt-1">
          Configuración fiscal y general de la aplicación.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'negocio' && <BusinessTab onError={setError} />}
      {tab === 'series' && <SeriesTab onError={setError} />}
      {tab === 'impuestos' && <TaxesTab onError={setError} />}
      {tab === 'unidades' && <UnitsTab onError={setError} />}
    </div>
  )
}

// ── Negocio ──
function BusinessTab({ onError }: { onError: (e: string | null) => void }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fiscalService
      .getBusinessSettings()
      .then(setSettings)
      .catch(err => onError(err instanceof Error ? err.message : 'Error al cargar la configuración'))
      .finally(() => setLoading(false))
  }, [onError])

  const update = (patch: Partial<BusinessSettings>) => {
    setSettings(prev => (prev ? { ...prev, ...patch } : prev))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      const updated = await fiscalService.updateBusinessSettings({
        ruc: settings.ruc,
        razon_social: settings.razon_social,
        nombre_comercial: settings.nombre_comercial,
        direccion: settings.direccion,
        regimen: settings.regimen,
        igv_rate: Number(settings.igv_rate),
        moneda: settings.moneda,
      })
      setSettings(updated)
      setSaved(true)
      onError(null)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!settings) return null

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5 bg-white rounded-xl border border-surface-muted p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
            <input
              value={settings.ruc || ''}
              onChange={e => update({ ruc: e.target.value })}
              placeholder="20XXXXXXXXX"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Régimen</label>
            <select
              value={settings.regimen}
              onChange={e => update({ regimen: e.target.value })}
              className={inputCls}
            >
              <option value="general">General</option>
              <option value="mype_remy">MYPE Remy</option>
              <option value="mype_tributario">MYPE Tributario</option>
              <option value="no_domiciliado">No domiciliado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón social</label>
          <input
            value={settings.razon_social || ''}
            onChange={e => update({ razon_social: e.target.value })}
            placeholder="Razón social del negocio"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
          <input
            value={settings.nombre_comercial || ''}
            onChange={e => update({ nombre_comercial: e.target.value })}
            placeholder="Nombre comercial"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal</label>
          <input
            value={settings.direccion || ''}
            onChange={e => update({ direccion: e.target.value })}
            placeholder="Domicilio fiscal"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IGV (%)</label>
            <input
              type="number"
              value={settings.igv_rate}
              onChange={e => update({ igv_rate: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
            <select
              value={settings.moneda}
              onChange={e => update({ moneda: e.target.value })}
              className={inputCls}
            >
              <option value="PEN">Soles (PEN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Estado SUNAT */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-surface-muted p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900">SUNAT</h3>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-4 ${
              settings.sunat_connected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                settings.sunat_connected ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
            {settings.sunat_connected ? 'Conectado' : 'Sin conectar'}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            La integración con SUNAT (consulta RUC/DNI y facturación electrónica)
            se activa cuando se configure un proveedor autorizado. La estructura
            ya está lista: al contratar el servicio solo se ingresa el token.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Series ──
function SeriesTab({ onError }: { onError: (e: string | null) => void }) {
  const [series, setSeries] = useState<InvoiceSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [newSerie, setNewSerie] = useState({ tipo_doc: '01' as const, serie: '', descripcion: '' })

  const load = () => {
    setLoading(true)
    fiscalService
      .getSeries()
      .then(setSeries)
      .catch(err => onError(err instanceof Error ? err.message : 'Error al cargar series'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [onError])

  const handleAdd = async () => {
    if (!newSerie.serie.trim()) return
    try {
      await fiscalService.createSeries({ ...newSerie, active: true })
      setNewSerie({ tipo_doc: '01', serie: '', descripcion: '' })
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al crear serie')
    }
  }

  const handleToggle = async (s: InvoiceSeries) => {
    await fiscalService.updateSeries(s.id, { active: !s.active })
    load()
  }

  const handleDelete = async (s: InvoiceSeries) => {
    if (window.confirm(`¿Eliminar la serie ${s.serie}?`)) {
      await fiscalService.deleteSeries(s.id)
      load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const inputCls =
    'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 bg-white rounded-xl border border-surface-muted p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={newSerie.tipo_doc}
            onChange={e => setNewSerie(prev => ({ ...prev, tipo_doc: e.target.value as '01' }))}
            className={inputCls}
          >
            {(Object.keys(tipoDocLabels) as Array<'01' | '03' | '07' | '08'>).map(td => (
              <option key={td} value={td}>{tipoDocLabels[td]} ({td})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Serie</label>
          <input
            value={newSerie.serie}
            onChange={e => setNewSerie(prev => ({ ...prev, serie: e.target.value.toUpperCase() }))}
            placeholder="B001"
            className={`${inputCls} w-28`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            value={newSerie.descripcion}
            onChange={e => setNewSerie(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Boleta principal"
            className={`${inputCls} w-full`}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Serie</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Correlativo</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Activa</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {series.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-mono text-gray-900">{s.serie}</td>
                <td className="px-4 py-3 text-gray-600">{tipoDocLabels[s.tipo_doc]}</td>
                <td className="px-4 py-3 text-gray-600">{s.descripcion || '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">{s.correlativo_actual}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(s)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      s.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        s.active ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {series.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No hay series configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Impuestos ──
function TaxesTab({ onError }: { onError: (e: string | null) => void }) {
  const [taxes, setTaxes] = useState<Tax[]>([])
  const [loading, setLoading] = useState(true)
  const [newTax, setNewTax] = useState({ codigo: '10', descripcion: '', tasa: '', tipo: 'igv' as TaxType })

  const load = () => {
    setLoading(true)
    fiscalService
      .getTaxes()
      .then(setTaxes)
      .catch(err => onError(err instanceof Error ? err.message : 'Error al cargar impuestos'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [onError])

  const handleAdd = async () => {
    if (!newTax.codigo.trim() || !newTax.descripcion.trim()) return
    try {
      await fiscalService.createTax({
        codigo: newTax.codigo.trim(),
        descripcion: newTax.descripcion.trim(),
        tasa: newTax.tasa === '' ? null : Number(newTax.tasa),
        tipo: newTax.tipo,
        active: true,
      })
      setNewTax({ codigo: '10', descripcion: '', tasa: '', tipo: 'igv' })
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al crear impuesto')
    }
  }

  const handleToggle = async (t: Tax) => {
    await fiscalService.updateTax(t.id, { active: !t.active })
    load()
  }

  const handleDelete = async (t: Tax) => {
    if (window.confirm(`¿Eliminar el impuesto ${t.codigo} - ${t.descripcion}?`)) {
      await fiscalService.deleteTax(t.id)
      load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const inputCls =
    'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 bg-white rounded-xl border border-surface-muted p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
          <input
            value={newTax.codigo}
            onChange={e => setNewTax(prev => ({ ...prev, codigo: e.target.value }))}
            className={`${inputCls} w-20`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
          <select
            value={newTax.tipo}
            onChange={e => setNewTax(prev => ({ ...prev, tipo: e.target.value as TaxType }))}
            className={inputCls}
          >
            {taxTypeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            value={newTax.descripcion}
            onChange={e => setNewTax(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="IGV"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tasa %</label>
          <input
            type="number"
            value={newTax.tasa}
            onChange={e => setNewTax(prev => ({ ...prev, tasa: e.target.value }))}
            className={`${inputCls} w-20`}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Tasa</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Activo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {taxes.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-mono text-gray-900">{t.codigo}</td>
                <td className="px-4 py-3 text-gray-900">{t.descripcion}</td>
                <td className="px-4 py-3 text-gray-600">{taxTypeOptions.find(o => o.value === t.tipo)?.label}</td>
                <td className="px-4 py-3 text-right text-gray-900">{t.tasa === null ? '—' : `${t.tasa}%`}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(t)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      t.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        t.active ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {taxes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No hay impuestos configurados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Unidades SUNAT ──
function UnitsTab({ onError }: { onError: (e: string | null) => void }) {
  const [units, setUnits] = useState<SunatUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [newUnit, setNewUnit] = useState({ codigo: '', descripcion: '' })

  const load = () => {
    setLoading(true)
    fiscalService
      .getUnits()
      .then(setUnits)
      .catch(err => onError(err instanceof Error ? err.message : 'Error al cargar unidades'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [onError])

  const handleAdd = async () => {
    if (!newUnit.codigo.trim() || !newUnit.descripcion.trim()) return
    try {
      await fiscalService.createUnit({
        codigo: newUnit.codigo.trim().toUpperCase(),
        descripcion: newUnit.descripcion.trim(),
        active: true,
      })
      setNewUnit({ codigo: '', descripcion: '' })
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al crear unidad')
    }
  }

  const handleToggle = async (u: SunatUnit) => {
    await fiscalService.updateUnit(u.id, { active: !u.active })
    load()
  }

  const handleDelete = async (u: SunatUnit) => {
    if (window.confirm(`¿Eliminar la unidad ${u.codigo}?`)) {
      await fiscalService.deleteUnit(u.id)
      load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const inputCls =
    'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 bg-white rounded-xl border border-surface-muted p-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Código</label>
          <input
            value={newUnit.codigo}
            onChange={e => setNewUnit(prev => ({ ...prev, codigo: e.target.value }))}
            placeholder="NIU"
            className={`${inputCls} w-24`}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
          <input
            value={newUnit.descripcion}
            onChange={e => setNewUnit(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Unidad"
            className={`${inputCls} w-full`}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">Activa</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-mono text-gray-900">{u.codigo}</td>
                <td className="px-4 py-3 text-gray-600">{u.descripcion}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggle(u)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      u.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
                        u.active ? 'left-4' : 'left-0.5'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No hay unidades configuradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
