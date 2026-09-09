// Fallback ligero para lazy-loading de páginas: solo ocupa el área de contenido,
// dejando visible el layout (sidebar/navbar) — evita el destello de pantalla completa.
export default function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm text-surface-500">Cargando...</p>
      </div>
    </div>
  )
}
