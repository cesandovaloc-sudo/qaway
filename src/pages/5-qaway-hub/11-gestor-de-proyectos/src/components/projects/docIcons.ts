import {
  BookOpen,
  CheckCircle2,
  Compass,
  FileText,
  FolderArchive,
  Landmark,
  Palette,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectDocIcon } from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// docIcons.ts — Mapa nombre → componente Lucide para documentos (Fase 18)
// La semilla guarda solo el nombre (serializable en localStorage); la UI
// resuelve el componente. `resolveDocIcon` tolera valores legacy (emojis).
// ─────────────────────────────────────────────────────────────────────────

export const PROJECT_DOC_ICONS: Record<ProjectDocIcon, LucideIcon> = {
  FileText,
  BookOpen,
  Compass,
  CheckCircle2,
  Palette,
  FolderArchive,
  Truck,
  Landmark,
}

export function resolveDocIcon(icon: string | undefined): LucideIcon {
  if (icon && icon in PROJECT_DOC_ICONS) {
    return PROJECT_DOC_ICONS[icon as ProjectDocIcon]
  }
  return FileText
}

export default PROJECT_DOC_ICONS
