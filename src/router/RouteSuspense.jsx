import { Suspense } from 'react'

export function RouteLoading() {
  return (
    <div
      role="status"
      aria-label="Cargando página"
      className="min-h-[40vh] w-full flex flex-col items-center justify-center gap-4 select-none"
    >
      <span className="w-9 h-9 rounded-full border-[3px] border-zinc-300 border-t-[#ff4b0b] animate-spin" />
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">Qaway · Cargando</span>
    </div>
  )
}

export function RouteSuspense({ children }) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>
}