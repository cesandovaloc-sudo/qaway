import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

export default function RecursosV2Page() {
  useSetNavbarVariant('dark')
  const navigate = useNavigate()

  useEffect(() => {
    // Redirigir inmediatamente al visor del Ebook
    navigate('/recursos-v2/visor', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-400">
        <div className="w-4 h-4 border-2 border-t-transparent border-[#ffd200] rounded-full animate-spin" />
        <span>Redireccionando al visor de lectura...</span>
      </div>
    </div>
  )
}
