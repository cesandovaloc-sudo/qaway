import { Routes, Route, Link } from 'react-router-dom'
import { AgendaProvider, useAgenda } from './src/agenda/context/AgendaContext'
import HomePage from './src/agenda/pages/HomePage'
import PublicBookingPage from './src/agenda/pages/PublicBookingPage'
import ManageBookingPage from './src/agenda/pages/ManageBookingPage'
import AdminPanelPage from './src/agenda/pages/AdminPanelPage'
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

function Toast() {
  const { toast } = useAgenda()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-white border border-slate-200 text-slate-900 font-bold text-xs rounded-2xl px-5 py-3.5 shadow-2xl shadow-purple-500/10"
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AgendaInnerRoutes() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="panel" element={<AdminPanelPage />} />
        <Route path="gestionar/:token" element={<ManageBookingPage />} />
        <Route path=":slug/:eventSlug" element={<PublicBookingPage />} />
        <Route path=":slug" element={<PublicBookingPage />} />
      </Routes>
      <Toast />
    </>
  )
}

export default function AgendaAppPage() {
  useSetNavbarVariant('light')

  return (
    <div className="agenda-app-root min-h-screen bg-[#f5f6fe] text-slate-900 font-sans pt-20 selection:bg-indigo-500 selection:text-white">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/hub"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Hub
            </Link>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-xs font-bold text-indigo-600">Qaway Agenda & Citas</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/hub/agenda"
              className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/hub/agenda/panel"
              className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              Mi Panel
            </Link>
          </div>
        </div>
      </div>

      <AgendaProvider>
        <AgendaInnerRoutes />
      </AgendaProvider>
    </div>
  )
}
