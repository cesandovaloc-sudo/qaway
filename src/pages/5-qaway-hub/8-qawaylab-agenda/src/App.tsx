import { Routes, Route } from 'react-router-dom'
import { AgendaProvider, useAgenda } from './agenda/context/AgendaContext'
import HomePage from './agenda/pages/HomePage'
import PublicBookingPage from './agenda/pages/PublicBookingPage'
import ManageBookingPage from './agenda/pages/ManageBookingPage'
import AdminPanelPage from './agenda/pages/AdminPanelPage'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Toast() {
  const { toast } = useAgenda()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-surface border border-line text-main font-bold text-xs rounded-2xl px-5 py-3.5 shadow-2xl shadow-slate-300/50"
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel" element={<AdminPanelPage />} />
        <Route path="/:slug/:eventSlug" element={<PublicBookingPage />} />
        <Route path="/:slug" element={<PublicBookingPage />} />
        <Route path="/gestionar/:token" element={<ManageBookingPage />} />
      </Routes>
      <Toast />
    </>
  )
}
