import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-qaway-accent/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-qaway-accent/5 blur-[100px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 px-6"
      >
        <div className="text-8xl font-black text-zinc-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">Ups, un enlace fuera del workflow</h1>
        <p className="text-zinc-600 mb-8 max-w-lg mx-auto leading-relaxed">
          Este recurso no está disponible por el momento 😢 <br />
          No te preocupes, el resto de la operación sigue en línea. 😎
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-qaway-accent text-black px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-qaway-accent-light transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
