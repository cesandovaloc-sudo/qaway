import React from 'react'
import { motion } from 'framer-motion'
import { Megaphone, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { useCRM } from '../context/CRMContext'

export default function CampaignsView() {
  const { campaigns } = useCRM()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-purple-600" /> Gestor de Campañas
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Control y monitoreo del rendimiento publicitario y adquisición.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {campaigns.map((camp, i) => {
          const cpl = camp.leadsCount > 0 ? (camp.spend / camp.leadsCount).toFixed(2) : '0.00'
          const ctr = camp.impressions > 0 ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : '0.00'
          const roi = camp.spend > 0 ? (((camp.revenue - camp.spend) / camp.spend) * 100).toFixed(0) : '0'

          return (
            <motion.div 
              key={camp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[15px] border border-zinc-200 shadow-sm overflow-hidden"
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
              <div className="bg-zinc-100/50 px-5 py-3 border-t border-zinc-100 flex justify-between text-[11px] font-medium text-zinc-500">
                <span>Impresiones: {camp.impressions.toLocaleString()}</span>
                <span>CTR: {ctr}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
