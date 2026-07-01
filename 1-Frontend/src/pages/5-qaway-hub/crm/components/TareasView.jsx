import { Target } from 'lucide-react'

export default function TareasView() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-black/5 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-[#ff4b0b]" />
        <h2 className="text-2xl font-bold tracking-tight text-[#191918]">Tareas y Seguimientos</h2>
      </div>
      <p className="text-black/60 max-w-2xl">
        Lista de quehaceres (To-Do) del equipo. Aquí se asignarán reuniones, recordatorios de llamadas y cierres.
      </p>
    </div>
  )
}
