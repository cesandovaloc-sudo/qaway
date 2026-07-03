// ─── Mock Data Extendido: Módulos, Lecciones, Recursos, Tareas ──
import { courses } from './courses'

// Generar módulos y lecciones para cada curso del catálogo
export function generateMockModules(courseSlug) {
  const course = courses.find(c => c.slug === courseSlug)
  if (!course) return []

  return course.curriculum.map((mod, mi) => ({
    id: `${course.id}-mod-${mi + 1}`,
    courseId: course.id,
    title: mod.title,
    position: mi + 1,
    description: `${mod.lessons.length} lecciones`,
    lessons: mod.lessons.map((lesson, li) => ({
      id: `${course.id}-mod-${mi + 1}-les-${li + 1}`,
      moduleId: `${course.id}-mod-${mi + 1}`,
      title: lesson,
      position: li + 1,
      description: `Lección ${li + 1} de ${mod.title}`,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoProvider: 'youtube',
      duration: `${Math.floor(8 + Math.random() * 15)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      isFree: mi === 0 && li < 2,
      content: `
        <h2>${lesson}</h2>
        <p>En esta lección aprenderás los conceptos fundamentales necesarios para avanzar en el módulo.</p>
        <h3>Puntos clave</h3>
        <ul>
          <li>Comprender los fundamentos teóricos</li>
          <li>Aplicar los conceptos en ejemplos prácticos</li>
          <li>Identificar patrones y mejores prácticas</li>
          <li>Prepararte para el siguiente módulo</li>
        </ul>
        <h3>Ejercicio práctico</h3>
        <p>Intenta aplicar lo aprendido en un caso real de tu día a día. Toma notas y comparte tus resultados en la sección de tareas.</p>
      `,
    })),
  }))
}

// Recursos descargables mock
export const mockResources = [
  // Curso 1 - Fundamentos IA
  { id: 'res-1', courseId: 1, lessonId: '1-mod-1-les-1', title: 'Guía rápida de ChatGPT', description: 'Prompt templates esenciales para empezar', fileUrl: '#', fileType: 'pdf', fileSize: '1.2 MB', isFree: true },
  { id: 'res-2', courseId: 1, lessonId: null, title: 'Plantilla de diagnóstico IA', description: 'Evalúa qué tareas puedes automatizar', fileUrl: '#', fileType: 'pdf', fileSize: '890 KB', isFree: true },
  { id: 'res-3', courseId: 1, lessonId: '1-mod-2-les-3', title: 'Cheatsheet de Prompts Avanzados', description: '50+ prompts probados para productividad', fileUrl: '#', fileType: 'pdf', fileSize: '2.1 MB', isFree: false },
  // Curso 2 - Automatización
  { id: 'res-4', courseId: 2, lessonId: null, title: 'Blueprint de Workflow', description: 'Diagrama de flujo para diseñar automatizaciones', fileUrl: '#', fileType: 'pdf', fileSize: '1.5 MB', isFree: true },
  { id: 'res-5', courseId: 2, lessonId: '2-mod-2-les-1', title: 'Conexiones API comunes', description: 'Lista de APIs gratuitas para comenzar', fileUrl: '#', fileType: 'pdf', fileSize: '670 KB', isFree: false },
  // Curso 3 - Branding
  { id: 'res-6', courseId: 3, lessonId: '3-mod-2-les-2', title: 'Brief de Marca', description: 'Plantilla completa para brief de branding', fileUrl: '#', fileType: 'pdf', fileSize: '340 KB', isFree: true },
  { id: 'res-7', courseId: 3, lessonId: null, title: 'Guía de Paletas de Color', description: 'Combinaciones cromáticas profesionales', fileUrl: '#', fileType: 'pdf', fileSize: '4.2 MB', isFree: false },
  // Recursos generales
  { id: 'res-8', courseId: null, lessonId: null, title: 'Kit de Herramientas IA', description: 'Las 20 herramientas que usamos en Qaway', fileUrl: '#', fileType: 'zip', fileSize: '180 KB', isFree: true },
  { id: 'res-9', courseId: null, lessonId: null, title: 'Calendario Editorial 2026', description: 'Planificador anual de contenido', fileUrl: '#', fileType: 'pdf', fileSize: '890 KB', isFree: true },
]

// Tareas mock
export const mockAssignments = [
  { id: 'asg-1', courseId: 1, lessonId: '1-mod-1-les-3', title: 'Diagnóstico personal de IA', description: 'Identifica 5 tareas de tu día que podrías automatizar con IA y describe cómo lo harías.', dueDays: 3, maxScore: 100 },
  { id: 'asg-2', courseId: 1, lessonId: '1-mod-2-les-2', title: 'Prompt perfecto', description: 'Escribe 3 prompts optimizados para diferentes herramientas de IA y explica por qué funcionan.', dueDays: 5, maxScore: 100 },
  { id: 'asg-3', courseId: 2, lessonId: '2-mod-1-les-2', title: 'Diseña tu primer workflow', description: 'Crea un diagrama de flujo para automatizar un proceso repetitivo de tu trabajo o negocio.', dueDays: 4, maxScore: 100 },
  { id: 'asg-4', courseId: 3, lessonId: '3-mod-3-les-4', title: 'Propuesta de identidad visual', description: 'Desarrolla una propuesta completa de identidad visual para una marca ficticia.', dueDays: 7, maxScore: 100 },
]

// Certificados mock
export const mockCertificates = [
  { id: 'cert-1', courseId: 1, courseTitle: 'Fundamentos de IA Aplicada', issuedAt: '2026-06-15', verificationCode: 'QA-CERT-1A2B3C' },
  { id: 'cert-2', courseId: 5, courseTitle: 'Productividad Extrema con Herramientas IA', issuedAt: '2026-06-20', verificationCode: 'QA-CERT-4D5E6F' },
]

// Alumnos mock (para admin)
export const mockStudents = [
  { id: 'stu-1', name: 'María García', email: 'maria@ejemplo.com', avatar: 'https://picsum.photos/seed/maria/100/100', enrolledCourses: 3, completedCourses: 1, avgProgress: 65, lastActivity: '2026-06-28T14:30:00', status: 'active' },
  { id: 'stu-2', name: 'Pedro López', email: 'pedro@ejemplo.com', avatar: 'https://picsum.photos/seed/pedro/100/100', enrolledCourses: 2, completedCourses: 0, avgProgress: 30, lastActivity: '2026-06-25T09:15:00', status: 'at-risk' },
  { id: 'stu-3', name: 'Ana Martínez', email: 'ana@ejemplo.com', avatar: 'https://picsum.photos/seed/ana/100/100', enrolledCourses: 5, completedCourses: 2, avgProgress: 78, lastActivity: '2026-06-29T11:00:00', status: 'active' },
  { id: 'stu-4', name: 'Carlos Sánchez', email: 'carlos@ejemplo.com', avatar: 'https://picsum.photos/seed/carlos/100/100', enrolledCourses: 1, completedCourses: 0, avgProgress: 5, lastActivity: '2026-06-10T16:45:00', status: 'inactive' },
  { id: 'stu-5', name: 'Laura Jiménez', email: 'laura@ejemplo.com', avatar: 'https://picsum.photos/seed/laura/100/100', enrolledCourses: 4, completedCourses: 1, avgProgress: 45, lastActivity: '2026-06-27T08:30:00', status: 'active' },
  { id: 'stu-6', name: 'Diego Ramírez', email: 'diego@ejemplo.com', avatar: 'https://picsum.photos/seed/diego/100/100', enrolledCourses: 0, completedCourses: 0, avgProgress: 0, lastActivity: '2026-05-20T10:00:00', status: 'inactive' },
  { id: 'stu-7', name: 'Sofía Torres', email: 'sofia@ejemplo.com', avatar: 'https://picsum.photos/seed/sofia/100/100', enrolledCourses: 2, completedCourses: 1, avgProgress: 88, lastActivity: '2026-06-29T15:20:00', status: 'active' },
  { id: 'stu-8', name: 'Roberto Vega', email: 'roberto@ejemplo.com', avatar: 'https://picsum.photos/seed/roberto/100/100', enrolledCourses: 3, completedCourses: 0, avgProgress: 22, lastActivity: '2026-06-22T13:10:00', status: 'at-risk' },
]

// Progreso mock del alumno actual (para dashboard)
export const mockMyEnrollments = [
  {
    courseId: 1,
    courseSlug: 'fundamentos-ia-aplicada',
    courseTitle: 'Fundamentos de IA Aplicada',
    progress: 72,
    status: 'active',
    enrolledAt: '2026-06-01',
    lastLessonTitle: 'Prompts avanzados',
    lastLessonId: '1-mod-2-les-3',
    completedLessons: 13,
    totalLessons: 18,
    nextLessonTitle: 'Casos de uso',
    nextLessonId: '1-mod-2-les-4',
  },
  {
    courseId: 5,
    courseSlug: 'productividad-herramientas-ia',
    courseTitle: 'Productividad Extrema con Herramientas IA',
    progress: 35,
    status: 'active',
    enrolledAt: '2026-06-10',
    lastLessonTitle: 'Herramientas esenciales',
    lastLessonId: '5-mod-1-les-2',
    completedLessons: 5,
    totalLessons: 14,
    nextLessonTitle: 'Criterios de selección',
    nextLessonId: '5-mod-1-les-3',
  },
  {
    courseId: 8,
    courseSlug: 'presencia-profesional-linkedin',
    courseTitle: 'Presencia Profesional en LinkedIn',
    progress: 100,
    status: 'completed',
    enrolledAt: '2026-05-15',
    completedAt: '2026-06-20',
    completedLessons: 16,
    totalLessons: 16,
  },
]

// Helper: obtener módulos de un curso
export function getModulesForCourse(courseSlug) {
  return generateMockModules(courseSlug)
}

// Helper: obtener lecciones de un módulo
export function getLessonsForModule(moduleId) {
  for (const course of courses) {
    const modules = generateMockModules(course.slug)
    const mod = modules.find(m => m.id === moduleId)
    if (mod) return mod.lessons
  }
  return []
}

// Helper: obtener lección por ID
export function getLessonById(lessonId) {
  for (const course of courses) {
    const modules = generateMockModules(course.slug)
    for (const mod of modules) {
      const lesson = mod.lessons.find(l => l.id === lessonId)
      if (lesson) return { lesson, module: mod, course }
    }
  }
  return null
}

// Helper: obtener recursos de un curso
export function getResourcesForCourse(courseId) {
  return mockResources.filter(r => r.courseId === courseId || r.courseId === null)
}

// Helper: obtener recursos globales (sin curso)
export function getGlobalResources() {
  return mockResources.filter(r => r.courseId === null)
}

// Helper: obtener tareas de un curso
export function getAssignmentsForCourse(courseId) {
  return mockAssignments.filter(a => a.courseId === courseId)
}

// ─── Docentes mock (para admin) ────────────────────────
export const mockTeachers = [
  { id: 'tch-1', name: 'Andrea Morales', email: 'andrea@qaway.com', avatar: 'https://picsum.photos/seed/andrea-t/100/100', role: 'instructor', coursesAssigned: [1, 4, 5], status: 'active', joinedAt: '2026-01-15' },
  { id: 'tch-2', name: 'Carlos Ruiz', email: 'carlos@qaway.com', avatar: 'https://picsum.photos/seed/carlos-t/100/100', role: 'instructor', coursesAssigned: [3, 8], status: 'active', joinedAt: '2026-02-01' },
  { id: 'tch-3', name: 'Valeria Torres', email: 'valeria@qaway.com', avatar: 'https://picsum.photos/seed/valeria-t/100/100', role: 'instructor', coursesAssigned: [2, 7, 9], status: 'active', joinedAt: '2026-03-10' },
  { id: 'tch-4', name: 'Admin Qaway', email: 'admin@qaway.com', avatar: 'https://picsum.photos/seed/admin/100/100', role: 'admin', coursesAssigned: [], status: 'active', joinedAt: '2026-01-01' },
]

// ─── Usuarios mock (para permisos) ────────────────────────
export const mockUsers = [
  ...mockStudents.map(s => ({ id: s.id, name: s.name, email: s.email, avatar: s.avatar, role: 'student' })),
  ...mockTeachers,
]

// ─── Transcripciones mock ────────────────────────────
export const mockTranscripts = {
  '1-mod-1-les-1': [
    { time: '0:00', text: 'Bienvenido a esta lección. Hoy vamos a explorar qué es exactamente la inteligencia artificial.' },
    { time: '0:45', text: 'La IA no es magia, es simplemente un conjunto de algoritmos entrenados con datos para reconocer patrones.' },
    { time: '1:30', text: 'Existen varios tipos de IA: desde sistemas reactivos hasta modelos de aprendizaje profundo.' },
    { time: '2:15', text: 'Para empezar, nos enfocaremos en los modelos de lenguaje grande, como ChatGPT y Claude.' },
    { time: '3:00', text: 'Estos modelos han sido entrenados con millones de documentos y pueden entender y generar texto.' },
    { time: '4:00', text: 'Lo importante es entender que la IA es una herramienta, no un reemplazo del juicio humano.' },
    { time: '5:00', text: 'En las siguientes lecciones veremos cómo aplicarla en tareas concretas de tu día a día.' },
  ],
  '1-mod-1-les-2': [
    { time: '0:00', text: 'En esta lección veremos los diferentes tipos de modelos de IA que existen actualmente.' },
    { time: '1:00', text: 'Los modelos pueden clasificarse por su arquitectura, su propósito y la forma en que fueron entrenados.' },
    { time: '2:30', text: 'Los modelos de lenguaje grande o LLMs son los más populares hoy en día.' },
    { time: '4:00', text: 'Pero también existen modelos especializados en imágenes, audio y datos estructurados.' },
    { time: '5:30', text: 'Cada tipo de modelo tiene sus fortalezas y debilidades que debemos conocer.' },
  ],
}

export function getTranscriptForLesson(lessonId) {
  return mockTranscripts[lessonId] || [
    { time: '0:00', text: 'Transcripción no disponible para esta lección.' },
  ]
}

// ─── Helper: progreso de video en localStorage ────────
export function getVideoProgress(lessonId) {
  try {
    const data = localStorage.getItem(`qaway-video-${lessonId}`)
    return data ? JSON.parse(data) : { watched: false, lastTime: 0, completed: false }
  } catch { return { watched: false, lastTime: 0, completed: false } }
}

export function saveVideoProgress(lessonId, progress) {
  try {
    localStorage.setItem(`qaway-video-${lessonId}`, JSON.stringify(progress))
  } catch { /* silent */ }
}

export function markLessonCompleted(lessonId) {
  const progress = getVideoProgress(lessonId)
  progress.completed = true
  progress.watched = true
  saveVideoProgress(lessonId, progress)
}

// Helper: estado del alumno (para monitoreo)
export function getStudentStatus(lastActivity) {
  const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSince <= 3) return 'active'
  if (daysSince <= 7) return 'at-risk'
  return 'inactive'
}

// Helper: alumnos que necesitan email de motivación
export function getStudentsNeedingMotivation(students) {
  return students.filter(s => {
    const daysSince = Math.floor((Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    return daysSince >= 5 && s.avgProgress < 50
  })
}
