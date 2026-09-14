import { supabase } from '@/lib/supabase'
import type { Course } from '@/lib/types'

export interface CourseFilters {
  category?: string
  level?: string
  search?: string
  status?: string
}

export async function getCourses({ category, level, search, status = 'published' }: CourseFilters = {}) {
  try {
    let query = supabase
      .from('courses')
      .select(`
        id, title, slug, description, short_description, category, level,
        duration, price, is_free, image_url, status, featured, free_preview_lessons,
        instructor:instructor_id (id, full_name, avatar_url)
      `)
      .eq('status', status)

    if (category) query = query.eq('category', category)
    if (level) query = query.eq('level', level)
    if (search) query = query.ilike('title', `%${search}%`)

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    if (data && data.length > 0) {
      return data as unknown as Course[]
    }
  } catch (err) {
    console.warn('[Academy] Conexión directa Supabase falló, usando catálogo base de respaldo:', err)
  }

  // Fallback garantizado con los cursos precargados oficiales de la plataforma
  const FALLBACK_COURSES: Course[] = [
    {
      id: 'c1000000-0001-0000-0000-000000000001',
      title: 'Identidad Visual con IA',
      slug: 'identidad-visual-con-ia',
      description: 'Construye una identidad coherente usando criterio visual, herramientas de IA y un sistema que puedas seguir aplicando.',
      short_description: 'Construye una identidad coherente usando criterio visual y herramientas de IA.',
      category: 'Diseño',
      level: 'Todos los niveles',
      duration: '6 módulos',
      price: 120,
      is_free: false,
      image_url: '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
      status: 'published',
      featured: true,
      free_preview_lessons: 1,
    },
    {
      id: 'c1000000-0002-0000-0000-000000000002',
      title: 'WhatsApp Business para negocios',
      slug: 'whatsapp-business-para-negocios',
      description: 'Organiza consultas, respuestas, catálogo y seguimiento para convertir conversaciones en una mejor experiencia comercial.',
      short_description: 'Organiza consultas, respuestas y catálogo en WhatsApp Business.',
      category: 'Marketing',
      level: 'Intermedio',
      duration: '4 sesiones',
      price: 89,
      is_free: false,
      image_url: '/assets/pages/4-academy/curso-whatsapp-business2.png',
      status: 'published',
      featured: true,
      free_preview_lessons: 1,
    },
    {
      id: 'c1000000-0003-0000-0000-000000000003',
      title: 'Antigravity desde cero',
      slug: 'antigravity-desde-cero',
      description: 'Una ruta audiovisual para comprender la herramienta, experimentar con ella y llevarla a proyectos creativos reales.',
      short_description: 'Una ruta audiovisual para comprender Antigravity en proyectos reales.',
      category: 'Inteligencia Artificial',
      level: 'Principiante',
      duration: 'En YouTube',
      price: 0,
      is_free: true,
      image_url: '/assets/pages/4-academy/curso-antigravity-youtube2.png',
      status: 'published',
      featured: true,
      free_preview_lessons: 0,
    },
    {
      id: 'c1000000-0004-0000-0000-000000000004',
      title: 'IA para equipos pequeños',
      slug: 'ia-para-equipos-pequenos',
      description: 'Organiza tareas, reuniones e información con un sistema sencillo y colaborativo.',
      short_description: 'Organiza tareas y reuniones con IA en equipos reducidos.',
      category: 'Productividad',
      level: 'Intermedio',
      duration: '5 semanas',
      price: 150,
      is_free: false,
      image_url: '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
      status: 'published',
      featured: false,
      free_preview_lessons: 1,
    },
    {
      id: 'c1000000-0005-0000-0000-000000000005',
      title: 'Sistema de contenido con IA',
      slug: 'sistema-de-contenido-con-ia',
      description: 'Diseña una ruta sostenible para investigar, crear y adaptar contenido sin improvisar.',
      short_description: 'Ruta sostenible para investigar y crear contenido con IA.',
      category: 'Inteligencia Artificial',
      level: 'Avanzado',
      duration: '7 módulos',
      price: 180,
      is_free: false,
      image_url: '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
      status: 'published',
      featured: false,
      free_preview_lessons: 1,
    },
    {
      id: 'c1000000-0006-0000-0000-000000000006',
      title: 'Workflows sin código',
      slug: 'workflows-sin-codigo',
      description: 'Conecta herramientas y construye automatizaciones útiles sin depender de desarrollo complejo.',
      short_description: 'Automatizaciones no-code para optimizar procesos.',
      category: 'Automatización',
      level: 'Intermedio',
      duration: 'En vivo',
      price: 210,
      is_free: false,
      image_url: '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
      status: 'published',
      featured: false,
      free_preview_lessons: 1,
    }
  ]

  let result = FALLBACK_COURSES
  if (category && category !== 'Todos') {
    result = result.filter(c => c.category === category)
  }
  if (level && level !== 'Todos') {
    result = result.filter(c => c.level === level)
  }
  if (search) {
    result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
  }
  return result
}

export async function getFeaturedCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, short_description, category, level, duration, price,
      is_free, image_url, free_preview_lessons, featured,
      instructor:instructor_id (id, full_name)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error
  return data as unknown as Course[]
}

export async function getPopularCourses(limit = 4) {
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('status', 'active')
    .limit(50)

  if (enrollError) throw enrollError

  const counts: Record<string, number> = {}
  for (const enrollment of (enrollments || [])) {
    counts[enrollment.course_id] = (counts[enrollment.course_id] || 0) + 1
  }

  const courseIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id)

  if (courseIds.length === 0) return []

  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, short_description, category, level, duration, price,
      is_free, image_url, free_preview_lessons, featured,
      instructor:instructor_id (id, full_name)
    `)
    .in('id', courseIds)
    .eq('status', 'published')

  if (error) throw error
  return data as unknown as Course[]
}

export async function getNewCourses(limit = 4) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, short_description, category, level, duration, price,
      is_free, image_url, free_preview_lessons, featured,
      instructor:instructor_id (id, full_name)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as unknown as Course[]
}

export async function getTopRatedCourses(limit = 3) {
  const { data: progressData, error: progressError } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('completed', true)
    .limit(limit * 5)

  if (progressError) throw progressError
  if (!progressData || progressData.length === 0) return []

  const lessonIds = [...new Set(progressData.map((progress) => progress.lesson_id))]

  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('module_id')
    .in('id', lessonIds)

  if (lessonError) throw lessonError
  if (!lessons || lessons.length === 0) return []

  const moduleIds = [...new Set(lessons.map((lesson) => lesson.module_id))]

  const { data: modules, error: moduleError } = await supabase
    .from('modules')
    .select('course_id')
    .in('id', moduleIds)

  if (moduleError) throw moduleError
  if (!modules || modules.length === 0) return []

  const courseIds = [...new Set(modules.map((module) => module.course_id))].slice(0, limit)

  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, short_description, category, level, duration, price,
      is_free, image_url, free_preview_lessons, featured,
      instructor:instructor_id (id, full_name)
    `)
    .in('id', courseIds)
    .eq('status', 'published')

  if (error) throw error
  return data as unknown as Course[]
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      id, title, slug, description, short_description, category, level,
      duration, price, is_free, image_url, status, featured, free_preview_lessons,
      what_you_learn, requirements, target_audience,
      instructor:instructor_id (id, full_name, avatar_url),
      modules:modules (
        id, title, description, sort_order,
        lessons:lessons (
          id, title, content, duration, video_url, sort_order, status,
          transcript, transcript_status,
          resources:resources (id, title, type, file_url, file_size)
        )
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as unknown as Course
}

export async function createCourse(data: Partial<Course>) {
  const { data: course, error } = await supabase
    .from('courses')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return course as Course
}

export async function updateCourse(id: string, data: Partial<Course>) {
  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return course as Course
}

export async function deleteCourse(id: string) {
  const { error } = await supabase
    .from('courses')
    .update({ status: 'archived' })
    .eq('id', id)

  if (error) throw error
}

/* ─── Modules ─── */

export async function createModule(courseId: string, title: string, description = '') {
  // Get the next sort_order
  const { data: existing } = await supabase
    .from('modules')
    .select('sort_order')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('modules')
    .insert({
      course_id: courseId,
      title,
      description,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateModule(moduleId: string, data: Record<string, unknown>) {
  const { data: module, error } = await supabase
    .from('modules')
    .update(data)
    .eq('id', moduleId)
    .select()
    .single()

  if (error) throw error
  return module
}

export async function deleteModule(moduleId: string) {
  const { error } = await supabase
    .from('modules')
    .delete()
    .eq('id', moduleId)

  if (error) throw error
}

/* ─── Lessons ─── */

export async function createLesson(moduleId: string, title: string) {
  // Get the next sort_order
  const { data: existing } = await supabase
    .from('lessons')
    .select('sort_order')
    .eq('module_id', moduleId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      module_id: moduleId,
      title,
      sort_order: nextOrder,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLesson(lessonId: string, data: Record<string, unknown>) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .update(data)
    .eq('id', lessonId)
    .select()
    .single()

  if (error) throw error
  return lesson
}

export async function deleteLesson(lessonId: string) {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId)

  if (error) throw error
}
