import React from 'react'
import { motion } from 'framer-motion'
import { Megaphone, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { useCRM } from '../context/CRMContext'

const DEMO_CAMPAIGNS = [
  {
    id: 'camp-meta-1',
    name: 'Qaway Lab_Ventas_Individuales',
    platform: 'Meta Ads (Instagram & Facebook)',
    status: 'Activa',
    spend: 340.00,
    revenue: 1490.00,
    leadsCount: 38,
    impressions: 24500,
    clicks: 1280
  },
  {
    id: 'camp-meta-2',
    name: 'Identidad Visual & Branding Digital',
    platform: 'Meta Ads (Click-to-WhatsApp CTWA)',
    status: 'Activa',
    spend: 210.00,
    revenue: 890.00,
    leadsCount: 24,
    impressions: 18200,
    clicks: 940
  },
  {
    id: 'camp-b2b-notion',
    name: 'Plantillas Notion B2B Enterprise',
    platform: 'TikTok Ads & Google Search',
    status: 'Pausada',
    spend: 150.00,
    revenue: 520.00,
    leadsCount: 16,
    impressions: 9800,
    clicks: 410
  }
]

export default function CampaignsView() {
  const { campaigns } = useCRM()
  const isUsingDemo = !campaigns || campaigns.length === 0
  const displayCampaigns = isUsingDemo ? DEMO_CAMPAIGNS : campaigns

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-600" /> Gestor de Campañas
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Control y monitoreo del rendimiento publicitario y adquisición.</p>
        </div>
        {isUsingDemo && (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Datos de Demostración Meta Ads
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {displayCampaigns.map((camp, i) => {
          const cpl = camp.leadsCount > 0 ? (camp.spend / camp.leadsCount).toFixed(2) : '0.00'
          const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : '0.00'
          const roi = camp.spend > 0 ? (((camp.revenue - camp.spend) / camp.spend) * 100).toFixed(0) : '0'
          const roas = camp.spend > 0 ? (camp.revenue / camp.spend).toFixed(2) : '0.00'

          return (
            <motion.div 
              key={camp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[15px] border border-zinc-200 shadow-xs overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-100 flex justify-between items-start">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 ${camp.status === 'Activa' ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    <Activity className="w-3 h-3" /> {camp.status}
                  </span>
                  <h3 className="text-lg font-black text-zinc-900 leading-tight">{camp.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-medium">{camp.platform}</p>
                </div>
              </div>
              
              <div className="p-5 bg-zinc-50/50">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Gasto
                    </span>
                    <strong className="text-sm font-black text-zinc-800">${camp.spend.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> ROI
                    </span>
                    <strong className={`text-sm font-black ${Number(roi) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {roi}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Leads
                    </span>
                    <strong className="text-sm font-black text-zinc-800">{camp.leadsCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                      CPL Promedio
                    </span>
                    <strong className="text-sm font-black text-zinc-800">${cpl}</strong>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-100/50 px-5 py-3 border-t border-zinc-100 flex justify-between items-center text-[11px] font-medium text-zinc-500">
                <span>Impresiones: {camp.impressions ? camp.impressions.toLocaleString() : '0'}</span>
                <span>CTR: {ctr}%</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">ROAS: {roas}x</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
