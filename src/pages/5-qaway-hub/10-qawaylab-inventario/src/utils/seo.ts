export type RobotsDirective = 'index' | 'noindex'

export interface PageMeta {
  title: string
  description?: string
  robots?: RobotsDirective
}

/** Define title, meta description y robots de la página actual (SPA) */
export function setPageMeta({ title, description, robots }: PageMeta): void {
  document.title = title

  if (description !== undefined) {
    const meta = ensureMeta('description')
    meta.content = description
  }

  if (robots !== undefined) {
    const meta = ensureMeta('robots')
    meta.content = robots
  }
}

function ensureMeta(name: string): HTMLMetaElement {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.name = name
    document.head.appendChild(meta)
  }
  return meta
}
