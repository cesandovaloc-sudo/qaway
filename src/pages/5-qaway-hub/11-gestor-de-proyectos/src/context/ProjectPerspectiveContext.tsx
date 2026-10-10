import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ProjectPerspectiveRole = 'super_admin' | 'coordinador' | 'gestor'

export interface ProjectPersona {
  role: ProjectPerspectiveRole
  name: string
  title: string
  scope: string
  avatar: string
  description: string
  tag: string
  accentColor: string
}

export const PROJECT_PERSONAS: Record<ProjectPerspectiveRole, ProjectPersona> = {
  super_admin: {
    role: 'super_admin',
    name: 'Carlos Sandoval',
    title: 'Super Administrador (Fundador)',
    scope: 'Todas las Organizaciones & Proyectos',
    avatar: 'CS',
    description: 'Control supremo del SaaS. Visión macro de todas las instancias, finanzas EVM y configuración global.',
    tag: 'Control Global',
    accentColor: '#ff4b0b',
  },
  coordinador: {
    role: 'coordinador',
    name: 'Coordinador General',
    title: 'Coordinador de Gestores (PMO)',
    scope: 'Supervisión Nacional · 26 Regiones',
    avatar: 'CG',
    description: 'Torre de control operativo. Auditoría diaria de respuestas de campo, semáforos preventivos y envíos de WhatsApp.',
    tag: 'Supervisión',
    accentColor: '#3b82f6',
  },
  gestor: {
    role: 'gestor',
    name: 'Carlos Sandoval',
    title: 'Gestor Territorial (Junín / Oxapampa)',
    scope: 'UGEL Huancavelica, Satipo, Oxapampa, Tarma',
    avatar: 'CS',
    description: 'Bandeja de ejecución en campo. Monitoreo directo de UGELs asignadas, registro de acuerdos y descargo en 1 clic.',
    tag: 'Mi Bandeja',
    accentColor: '#10b981',
  },
}

interface ProjectPerspectiveContextValue {
  perspective: ProjectPerspectiveRole
  currentPersona: ProjectPersona
  setPerspective: (role: ProjectPerspectiveRole) => void
  isSuperAdmin: boolean
  isCoordinador: boolean
  isGestor: boolean
}

const STORAGE_KEY = 'qaway_project_perspective'

const ProjectPerspectiveContext = createContext<ProjectPerspectiveContextValue | undefined>(undefined)

export function ProjectPerspectiveProvider({ children }: { children: ReactNode }) {
  const [perspective, setPerspectiveState] = useState<ProjectPerspectiveRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'coordinador' || saved === 'gestor') return saved
      return 'super_admin'
    } catch {
      return 'super_admin'
    }
  })

  const setPerspective = (role: ProjectPerspectiveRole) => {
    setPerspectiveState(role)
    try {
      localStorage.setItem(STORAGE_KEY, role)
      window.dispatchEvent(new CustomEvent('qaway-perspective-change', { detail: role }))
    } catch {
      // Ignorar storage errors
    }
  }

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const custom = event as CustomEvent<ProjectPerspectiveRole>
      if (custom.detail && custom.detail !== perspective) {
        setPerspectiveState(custom.detail)
      }
    }
    window.addEventListener('qaway-perspective-change', handleEvent)
    return () => window.removeEventListener('qaway-perspective-change', handleEvent)
  }, [perspective])

  const currentPersona = PROJECT_PERSONAS[perspective]

  const value: ProjectPerspectiveContextValue = {
    perspective,
    currentPersona,
    setPerspective,
    isSuperAdmin: perspective === 'super_admin',
    isCoordinador: perspective === 'coordinador',
    isGestor: perspective === 'gestor',
  }

  return (
    <ProjectPerspectiveContext.Provider value={value}>
      {children}
    </ProjectPerspectiveContext.Provider>
  )
}

export function useProjectPerspective(): ProjectPerspectiveContextValue {
  const context = useContext(ProjectPerspectiveContext)
  if (!context) {
    // Fallback defensivo si se usa fuera del Provider
    return {
      perspective: 'super_admin',
      currentPersona: PROJECT_PERSONAS.super_admin,
      setPerspective: () => {},
      isSuperAdmin: true,
      isCoordinador: false,
      isGestor: false,
    }
  }
  return context
}
