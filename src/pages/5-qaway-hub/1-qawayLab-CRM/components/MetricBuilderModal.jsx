import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Activity, Clock, Percent, DollarSign, Briefcase } from 'lucide-react'
import { useCRM } from '../context/CRMContext'

export default function MetricBuilderModal({ onClose }) {
  const { addCustomMetric } = useCRM()
  
  const [metric, setMetric] = useState({
    id: `custom_${Date.now()}`,
    name: '',
    type: 'number',
    dataSource: 'leads',
    field: 'budget',
    aggregation: 'sum',
    visualization: 'card', // card, bar, pie
    groupBy: 'status', // status, campaignId, agent
    icon: 'Activity',
    color: 'blue',
    visibleForRoles: ['management']
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!metric.name.trim()) return
    addCustomMetric(metric)
    onClose()
  }

  const toggleRole = (role) => {
    setMetric(prev => ({
      ...prev,
      visibleForRoles: prev.visibleForRoles.includes(role)
        ? prev.visibleForRoles.filter(r => r !== role)
        : [...prev.visibleForRoles, role]
    }))
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[15px] w-full max-w-xl overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h2 className="text-lg font-black text-zinc-900">Crear Métrica Personalizada</h2>
            <p className="text-xs text-zinc-500 font-medium">Define reglas de cálculo basadas en datos reales.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Nombre de la Métrica</label>
            <input
              type="text"
              required
              value={metric.name}
              onChange={e => setMetric({...metric, name: e.target.value})}
              placeholder="Ej: Costo Operativo, Tiempo de Respuesta..."
              className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Origen de Datos</label>
              <select
                value={metric.dataSource}
                onChange={e => setMetric({...metric, dataSource: e.target.value})}
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
              >
                <option value="leads">Registros (Leads)</option>
                <option value="campaigns">Campañas Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Tipo de Cálculo</label>
              <select
                value={metric.aggregation}
                onChange={e => setMetric({...metric, aggregation: e.target.value})}
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
              >
                <option value="sum">Sumar (Total)</option>
                <option value="average">Promediar</option>
                <option value="count">Contar Registros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Campo a Evaluar</label>
              <input
                type="text"
                value={metric.field}
                onChange={e => setMetric({...metric, field: e.target.value})}
                placeholder="Ej: budget, responseTime..."
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Formato Numérico</label>
              <select
                value={metric.type}
                onChange={e => setMetric({...metric, type: e.target.value})}
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
              >
                <option value="currency">Moneda ($)</option>
                <option value="number">Número</option>
                <option value="percentage">Porcentaje (%)</option>
                <option value="time">Tiempo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Visualización</label>
              <select
                value={metric.visualization}
                onChange={e => setMetric({...metric, visualization: e.target.value})}
                className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
              >
                <option value="card">Tarjeta Numérica (Card)</option>
                <option value="bar">Gráfico de Barras</option>
                <option value="pie">Gráfico de Pastel (Pie)</option>
              </select>
            </div>
            {metric.visualization !== 'card' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Agrupar Por</label>
                <select
                  value={metric.groupBy}
                  onChange={e => setMetric({...metric, groupBy: e.target.value})}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 text-sm font-semibold rounded-[15px] px-4 py-3 outline-none focus:border-zinc-400 transition-all"
                >
                  {metric.dataSource === 'leads' ? (
                    <>
                      <option value="status">Estado (Embudo)</option>
                      <option value="campaignId">Campaña</option>
                      <option value="priority">Prioridad</option>
                    </>
                  ) : (
                    <>
                      <option value="name">Nombre de Campaña</option>
                      <option value="platform">Plataforma</option>
                      <option value="status">Estado</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Visibilidad de Rol (Seguridad)</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggleRole('management')}
                disabled // Administrador siempre lo ve
                className="flex-1 py-2 text-xs font-bold rounded-lg border bg-zinc-900 text-white border-zinc-900 opacity-50 cursor-not-allowed"
              >
                Administrador
              </button>
              <button
                type="button"
                onClick={() => toggleRole('marketing')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  metric.visibleForRoles.includes('marketing')
                    ? 'border-purple-500 text-purple-700 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                    : 'border-zinc-200 text-zinc-400 bg-white hover:bg-zinc-50'
                }`}
              >
                Marketing
              </button>
              <button
                type="button"
                onClick={() => toggleRole('sales')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  metric.visibleForRoles.includes('sales')
                    ? 'border-cyan-500 text-cyan-700 bg-cyan-500/10 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'border-zinc-200 text-zinc-400 bg-white hover:bg-zinc-50'
                }`}
              >
                Ventas
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-[15px] transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-[15px] transition-colors shadow-md">
              Crear Métrica
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
