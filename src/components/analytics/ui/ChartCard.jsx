import React, { useState } from 'react'
import { Download, Table, BarChart3, Info } from 'lucide-react'

export default function ChartCard({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-500/10 text-blue-600',
  children,
  data = [],
  theme = 'light',
  className = '',
  actionExtra,
  height = '320px',
  infoText
}) {
  const [viewMode, setViewMode] = useState('chart') // 'chart' | 'table'
  const isDark = theme === 'dark' || theme?.id?.includes('dark') || theme?.id?.includes('cyber')

  const handleExportCsv = () => {
    if (!data || !data.length) return
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n')
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${title?.toLowerCase().replace(/\s+/g, '_') || 'grafico'}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
        isDark
          ? 'bg-slate-900/90 border-slate-800/90 text-white'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base sm:text-lg tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeColor}`}>
                {badge}
              </span>
            )}
            {infoText && (
              <div className="group relative inline-block">
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-48 p-2 text-[10px] rounded-lg bg-slate-950 text-white shadow-xl z-30 pointer-events-none">
                  {infoText}
                </div>
              </div>
            )}
          </div>
          {subtitle && (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {actionExtra}
          
          {data && data.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-blue-500 text-white border-blue-600'
                    : isDark
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title={viewMode === 'chart' ? 'Ver como tabla' : 'Ver como gráfico'}
              >
                {viewMode === 'chart' ? <Table className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title="Exportar CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex-1" style={{ minHeight: height }}>
        {viewMode === 'chart' ? (
          children
        ) : (
          <div className="w-full h-full max-h-[340px] overflow-auto rounded-xl border border-slate-700/30 text-xs">
            <table className="w-full text-left border-collapse">
              <thead className={isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                <tr>
                  {Object.keys(data[0] || {}).map((header, idx) => (
                    <th key={idx} className="p-2 font-semibold capitalize border-b border-slate-700/20">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-slate-700/10 ${
                      isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="p-2 font-mono text-[11px]">
                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
