import { Routes, Route } from 'react-router-dom'
import { ClinicaProvider, useClinica } from './clinica/context/ClinicaContext'
import HomePage from './clinica/pages/HomePage'
import LoginPage from './clinica/pages/LoginPage'
import DashboardPage from './clinica/pages/DashboardPage'
import PatientDetailPage from './clinica/pages/PatientDetailPage'
import PublicRecordPage from './clinica/pages/PublicRecordPage'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Toast() {
  const { toast } = useClinica()
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-white text-zinc-900 font-bold text-sm rounded-full px-5 py-3 shadow-2xl"
        >
          {toast.type === 'err' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/panel" element={<DashboardPage />} />
      <Route path="/paciente/:id" element={<PatientDetailPage />} />
      <Route path="/expediente/:token" element={<PublicRecordPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ClinicaProvider>
      <AppRoutes />
      <Toast />
    </ClinicaProvider>
  )
}
