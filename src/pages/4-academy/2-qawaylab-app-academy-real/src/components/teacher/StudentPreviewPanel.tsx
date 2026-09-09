import { useState } from 'react'
import { useTeacherPreview } from '@/contexts/TeacherPreviewContext'
import { getResourceIcon } from '@/lib/services/resources'

export default function StudentPreviewPanel() {
  const { previewLesson, courseTitle } = useTeacherPreview()
  const [activeTab, setActiveTab] = useState('content')

  if (!previewLesson) {
    return (
      <div className="flex items-center justify-center h-full py-16 px-6 text-center">
        <div>
          <span className="text-4xl block mb-3">👁</span>
          <p className="text-sm font-medium text-surface-700">Vista del estudiante</p>
          <p className="text-xs text-surface-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
            Selecciona una lección para ver cómo la ve el estudiante.
          </p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'content', label: 'Contenido', icon: '📄' },
    { id: 'resources', label: 'Recursos', icon: '📎' },
    { id: 'transcript', label: 'Transcripción', icon: '🎤' },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Video placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center group">
        {previewLesson.video_url ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-transform group-hover:scale-110">
                <svg className="ml-1 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80">
              {previewLesson.duration || '—'}
            </div>
          </>
        ) : (
          <div className="text-center px-4">
            <span className="text-2xl block mb-2">🎬</span>
            <p className="text-[11px] text-white/50">Sin video</p>
          </div>
        )}
        <div className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/70">
          Vista previa
        </div>
      </div>

      {/* Lesson info */}
      <div className="px-4 py-3 border-b border-surface-100">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 mb-1">
          {courseTitle || 'Curso'}
        </p>
        <h3 className="text-sm font-semibold text-surface-900 leading-snug">
          {previewLesson.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            previewLesson.status === 'published'
              ? 'badge-success'
              : previewLesson.status === 'review'
              ? 'badge-warning'
              : 'bg-surface-100 text-surface-500'
          }`}>
            {previewLesson.status === 'published' ? '✓ Publicado' :
             previewLesson.status === 'review' ? '⚠ Revisión' : 'Borrador'}
          </span>
          {previewLesson.transcript_status && previewLesson.transcript_status !== 'none' && (
            <span className="text-[10px] text-surface-400">🎤 Transcripción</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-400 hover:text-surface-600'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'content' && (
          <div className="p-4">
            {previewLesson.content ? (
              <div className="text-surface-600 text-xs leading-relaxed space-y-2">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                  __html: previewLesson.content.length > 800
                    ? previewLesson.content.slice(0, 800) + '...'
                    : previewLesson.content
                }} />
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-2xl block mb-2">📝</span>
                <p className="text-xs text-surface-400">Sin contenido escrito</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="p-4">
            {(previewLesson.resources && previewLesson.resources.length > 0) ? (
              <div className="space-y-2">
                {previewLesson.resources.map(r => (
                  <div key={r.id} className="flex items-center gap-2.5 rounded-none bg-surface-50 px-3 py-2.5">
                    <span className="text-base">{getResourceIcon(r.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-surface-700 truncate">{r.title}</p>
                      <p className="text-[10px] text-surface-400">{r.type}{r.file_size ? ` · ${r.file_size}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-2xl block mb-2">📎</span>
                <p className="text-xs text-surface-400">Sin recursos</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="p-4">
            {previewLesson.transcript ? (
              <div className="rounded-none bg-surface-50 p-4 max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-medium text-surface-400">
                    {previewLesson.transcript_status === 'auto' ? 'Automática (YouTube)' : 'Manual'}
                  </span>
                  <span className="text-[10px] text-surface-400">
                    {previewLesson.transcript.split('\n').filter(Boolean).length} líneas
                  </span>
                </div>
                <div className="space-y-2">
                  {previewLesson.transcript.split('\n').filter(Boolean).slice(0, 20).map((line, i) => {
                    const isTimeLine = line.match(/^\[\d+:\d+\]/)
                    return (
                      <p key={i} className={`text-[11px] leading-relaxed ${isTimeLine ? 'text-surface-500' : 'text-surface-600'}`}>
                        {isTimeLine ? (
                          <>
                            <span className="font-mono text-[10px] text-primary-500 mr-1">{line.match(/^\[\d+:\d+\]/)?.[0]}</span>
                            {line.replace(/^\[\d+:\d+\]\s*/, '')}
                          </>
                        ) : line}
                      </p>
                    )
                  })}
                  {previewLesson.transcript.split('\n').filter(Boolean).length > 20 && (
                    <p className="text-[10px] text-surface-400 text-center pt-2 border-t border-surface-200">
                      ... {previewLesson.transcript.split('\n').filter(Boolean).length - 20} líneas más
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-2xl block mb-2">🎤</span>
                <p className="text-xs text-surface-400">Sin transcripción</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
