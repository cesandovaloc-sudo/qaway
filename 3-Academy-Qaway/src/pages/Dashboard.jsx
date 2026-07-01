import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import supabase, { isSupabaseConfigured } from '@/lib/supabase'

export default function Dashboard() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="pt-32 pb-20 section-container text-center">
        <p className="text-[#666860]">Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="pt-32 pb-20 section-container text-center">
        <p className="text-[#666860]">Necesitas iniciar sesión para ver tu panel.</p>
        <Link
          to="/acceder"
          className="mt-4 inline-block text-sm text-[#ff4b0b] hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* ─── Header ─── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-[#0d0f0d]">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#ff4b0b]">
              Panel del alumno
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
              Bienvenido, {session.user.user_metadata?.full_name || 'Alumno'}
            </h1>
            <p className="mt-2 text-sm text-[#666860]">
              Aquí verás tus cursos, progreso y certificados.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Courses ─── */}
      <section className="py-section bg-[#f5f5f4]">
        <div className="section-container">
          <h2 className="text-lg font-semibold text-[#0d0f0d]">Mis cursos</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 bg-white rounded-sm border border-[#0d0f0d]/6"
            >
              <p className="text-sm text-[#666860]">
                Aún no tienes cursos inscritos.
              </p>
              <Link
                to="/cursos"
                className="mt-3 inline-block text-sm text-[#ff4b0b] hover:underline"
              >
                Explorar cursos →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
