import { getResourceIcon, type StudentResource } from '@/lib/services/resources'

export default function ResourcePreview({ resource, onClose }: { resource: StudentResource; onClose: () => void }) {
  const isPdf = resource.type === 'PDF'

  if (!resource?.file_url) {
    return (
      <div className="space-y-4">
        <ResourcePreviewHeader resource={resource} onClose={onClose} />
        <div className="rounded-none border border-surface-200 bg-surface-50 p-8 text-center">
          <span className="text-3xl block mb-3">📄</span>
          <p className="text-sm text-surface-500">Archivo no disponible para vista previa.</p>
        </div>
        <BackButton onClick={onClose} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ResourcePreviewHeader resource={resource} onClose={onClose} />

      <div className="overflow-hidden rounded-none border border-surface-200 bg-surface-50">
        <object
          data={resource.file_url ?? undefined}
          type={isPdf ? 'application/pdf' : undefined}
          className="h-[600px] w-full"
        >
          <iframe
            src={resource.file_url}
            title={`Vista previa: ${resource.title}`}
            className="h-[600px] w-full"
            frameBorder="0"
          />
        </object>
      </div>

      <BackButton onClick={onClose} />
    </div>
  )
}

function ResourcePreviewHeader({ resource, onClose }: { resource: StudentResource; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl shrink-0">{getResourceIcon(resource.type)}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-900 truncate">{resource.title}</p>
          <p className="text-xs text-surface-400">{resource.type}{resource.file_size ? ` · ${resource.file_size}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={resource.file_url ?? undefined}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs px-3 py-1.5 text-primary-600 font-semibold"
        >
          Descargar
        </a>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-none text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          title="Cerrar vista previa"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
    >
      ← Volver a recursos
    </button>
  )
}
