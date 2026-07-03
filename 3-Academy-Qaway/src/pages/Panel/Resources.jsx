import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/academy/SectionHeader'
import ResourceCard from '@/components/academy/ResourceCard'
import { mockResources } from '@/data/internal'

export default function Resources() {
  const [filter, setFilter] = useState('todos')
  const free = mockResources.filter(r => r.isFree)
  const premium = mockResources.filter(r => !r.isFree)

  const filtered = filter === 'todos' ? mockResources : filter === 'gratis' ? free : premium

  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <SectionHeader
            eyebrow="Material de apoyo"
            title="Recursos descargables"
            description="Plantillas, guías, cheatsheets y herramientas para potenciar tu aprendizaje."
            dark
          />
        </div>
      </section>

      <section className="py-4 bg-white border-b border-[#0d0f0d]/6">
        <div className="section-container">
          <div className="flex gap-4">
            {[
              { id: 'todos', label: 'Todos', count: mockResources.length },
              { id: 'gratis', label: 'Gratis', count: free.length },
              { id: 'premium', label: 'Premium', count: premium.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`text-xs font-semibold tracking-wider uppercase py-2 transition-colors ${
                  filter === tab.id ? 'text-[#ff4b0b]' : 'text-[#666860] hover:text-[#0d0f0d]'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-[10px] opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#666860] text-center py-16">No hay recursos en esta categoría.</p>
          ) : (
            <div className="max-w-2xl space-y-2">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <ResourceCard resource={r} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
