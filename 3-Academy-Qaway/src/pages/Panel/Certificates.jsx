import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SectionHeader from '@/components/academy/SectionHeader'
import { mockCertificates } from '@/data/internal'

export default function Certificates() {
  return (
    <div>
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 bg-[#0d0f0d]">
        <div className="section-container">
          <SectionHeader
            eyebrow="Logros"
            title="Mis certificados"
            description="Todos los cursos que has completado y tus certificados emitidos."
            dark
          />
        </div>
      </section>

      <section className="py-section md:py-[80px] bg-[#f5f5f4] min-h-[50dvh]">
        <div className="section-container">
          {mockCertificates.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#666860]">Aún no tienes certificados. Completa un curso para obtener tu primer certificado.</p>
              <Link to="/cursos" className="mt-3 inline-block text-sm font-semibold text-[#ff4b0b] hover:underline">
                Explorar cursos →
              </Link>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">
              {mockCertificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-6 bg-white border border-[#0d0f0d]/8 flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-[#ff4b0b]">Certificado</span>
                    <h3 className="mt-1 text-sm font-bold text-[#0d0f0d]">{cert.courseTitle}</h3>
                    <p className="mt-1 text-[11px] text-[#666860]">
                      Emitido el {new Date(cert.issuedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#666860]">
                      Código: <span className="font-mono text-[#0d0f0d]">{cert.verificationCode}</span>
                    </p>
                  </div>
                  <button className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-[#0d0f0d]/10 hover:bg-[#0d0f0d] hover:text-white transition-all shrink-0">
                    Descargar PDF
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
