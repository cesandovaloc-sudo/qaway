// Paletas de color premium y temas para gráficos Recharts estilo PowerBI / Google Analytics 4

export const ANALYTICS_PALETTES = [
  {
    id: 'powerbi-dark',
    name: 'PowerBI Dark Pro',
    desc: 'Contraste elevado con acentos ámbar, cian y esmeralda',
    colors: ['#00b4d8', '#ffb703', '#10b981', '#f72585', '#7209b7', '#4cc9f0'],
    bg: '#0f172a',
    cardBg: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    grid: '#334155',
  },
  {
    id: 'ga4-clean',
    name: 'Google Analytics 4',
    desc: 'Azules corporativos y menta limpios sobre blanco',
    colors: ['#1a73e8', '#12b5cb', '#fa7b17', '#e37400', '#137333', '#a142f4'],
    bg: '#f8f9fa',
    cardBg: '#ffffff',
    text: '#202124',
    textMuted: '#5f6368',
    grid: '#e8eaed',
  },
  {
    id: 'linear-slate',
    name: 'Linear Graphite',
    desc: 'Monocromático sobrio y elegante estilo Apple & Linear',
    colors: ['#27272a', '#71717a', '#a1a1aa', '#52525b', '#3f3f46', '#18181b'],
    bg: '#fafafa',
    cardBg: '#ffffff',
    text: '#18181b',
    textMuted: '#71717a',
    grid: '#f4f4f5',
  },
  {
    id: 'qaway-coral',
    name: 'Qaway Coral & Energy',
    desc: 'Identidad corporativa con naranja cálido y carbón suave',
    colors: ['#ff4b0b', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'],
    bg: '#fbfbfa',
    cardBg: '#ffffff',
    text: '#191918',
    textMuted: '#787875',
    grid: '#f0ede8',
  },
  {
    id: 'fintech-emerald',
    name: 'Fintech Emerald',
    desc: 'Paleta enfocada en crecimiento, balances y salud financiera',
    colors: ['#059669', '#10b981', '#34d399', '#0284c7', '#6366f1', '#f59e0b'],
    bg: '#f0fdf4',
    cardBg: '#ffffff',
    text: '#064e3b',
    textMuted: '#047857',
    grid: '#dcfce7',
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    desc: 'Estilo terminal futurista con púrpuras, rosas y cianes',
    colors: ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#eab308', '#f97316'],
    bg: '#050814',
    cardBg: '#0b1329',
    text: '#f1f5f9',
    textMuted: '#64748b',
    grid: '#1e293b',
  }
]

export const formatters = {
  currency: (val, currency = 'S/') => {
    if (val === undefined || val === null || isNaN(val)) return `${currency} 0`
    if (Math.abs(val) >= 1_000_000) return `${currency} ${(val / 1_000_000).toFixed(1)}M`
    if (Math.abs(val) >= 1_000) return `${currency} ${(val / 1_000).toFixed(1)}k`
    return `${currency} ${Number(val).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  },
  number: (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0'
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
    if (Math.abs(val) >= 1_000) return `${(val / 1_000).toFixed(1)}k`
    return Number(val).toLocaleString('es-PE')
  },
  percent: (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.0%'
    return `${Number(val).toFixed(1)}%`
  },
  duration: (minutes) => {
    if (!minutes || isNaN(minutes)) return '0m'
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      const m = Math.round(minutes % 60)
      return `${h}h ${m > 0 ? `${m}m` : ''}`
    }
    return `${Math.round(minutes)} min`
  }
}
