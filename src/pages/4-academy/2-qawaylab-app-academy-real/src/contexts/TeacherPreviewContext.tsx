import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Lesson, Course } from '@/lib/types'

interface TeacherPreviewContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
  previewLesson: Lesson | null
  courseTitle: string
  setPreviewLesson: (lesson: Lesson | null, courseTitle?: string) => void
  courseData: Course | null
  setCourseData: (data: Course | null) => void
}

const TeacherPreviewContext = createContext<TeacherPreviewContextValue | undefined>(undefined)

export function TeacherPreviewProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [previewLesson, setPreviewLessonState] = useState<Lesson | null>(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseData, setCourseDataState] = useState<Course | null>(null)

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  const close = useCallback(() => setIsOpen(false), [])
  const open = useCallback(() => setIsOpen(true), [])

  const setPreviewLesson = useCallback((lesson: Lesson | null, title = '') => {
    setPreviewLessonState(lesson)
    setCourseTitle(title)
    setIsOpen(true)
  }, [])

  const setCourseData = useCallback((data: Course | null) => {
    setCourseDataState(data)
  }, [])

  return (
    <TeacherPreviewContext.Provider value={{ isOpen, toggle, close, open, previewLesson, courseTitle, setPreviewLesson, courseData, setCourseData }}>
      {children}
    </TeacherPreviewContext.Provider>
  )
}

export const useTeacherPreview = () => {
  const context = useContext(TeacherPreviewContext)
  if (!context) throw new Error('useTeacherPreview must be used within a TeacherPreviewProvider')
  return context
}
