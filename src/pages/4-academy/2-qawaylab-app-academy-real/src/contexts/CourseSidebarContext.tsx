import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface SidebarLesson {
  id: string
  title: string
  number?: number
  isFreePreview?: boolean
}

export interface SidebarModule {
  id: string
  title: string
  lessons?: SidebarLesson[]
}

export interface CourseSidebarState {
  visible: boolean
  title: string
  slug: string
  modules: SidebarModule[]
  currentLessonId?: string
  currentLessonTitle?: string
  currentLessonNumber?: number
  totalLessons?: number
  currentLessonDuration?: number
  progressPct?: number
  completed?: boolean
  forceCollapse?: boolean
  coursePath?: string
  lessonSteps?: { id: string; icon?: string | null; label: string }[]
  activeStep?: string
  setActiveStep?: (id: string) => void
}

interface CourseSidebarContextValue {
  courseSidebar: CourseSidebarState | null
  setCourseSidebar: (state: CourseSidebarState | null) => void
}

const CourseSidebarContext = createContext<CourseSidebarContextValue | undefined>(undefined)

export function CourseSidebarProvider({ children }: { children: ReactNode }) {
  const [courseSidebar, setCourseSidebar] = useState<CourseSidebarState | null>(null)

  const value = useMemo(() => ({ courseSidebar, setCourseSidebar }), [courseSidebar])

  return <CourseSidebarContext.Provider value={value}>{children}</CourseSidebarContext.Provider>
}

export function useCourseSidebar() {
  const context = useContext(CourseSidebarContext)
  if (!context) {
    throw new Error('useCourseSidebar must be used within CourseSidebarProvider')
  }
  return context
}
