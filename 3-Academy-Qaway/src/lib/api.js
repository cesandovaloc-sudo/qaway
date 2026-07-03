// ─── Qaway Academy — API Layer ──────────────────────────
// Punto único de acceso a datos. Actualmente re-exporta
// datos mock. Cuando Supabase esté configurado con .env,
// reemplazar cada función con su equivalente asíncrono.
// ──────────────────────────────────────────────────────

import supabase, { isSupabaseConfigured } from './supabase'

// ─── CURSOS (mock sync / Supabase async) ────────────
import {
  courses as mockCourses,
  featuredCourses as mockFeatured,
  instructors as mockInstructors,
  categories as mockCategories,
  levels as mockLevels,
  getCourseBySlug as mockGetCourseBySlug,
  getInstructorById as mockGetInstructorById,
  getCategoryBySlug as mockGetCategoryBySlug,
} from '@/data/courses'

export const courses = mockCourses
export const featuredCourses = mockFeatured
export const categories = mockCategories
export const levels = mockLevels
export const instructors = mockInstructors

export function getCourseBySlug(slug) {
  return mockGetCourseBySlug(slug)
}

export function getInstructorById(id) {
  return mockGetInstructorById(id)
}

export function getCategoryBySlug(slug) {
  return mockGetCategoryBySlug(slug)
}

// ─── MÓDULOS, LECCIONES, RECURSOS, TAREAS ───────────
import {
  generateMockModules,
  getModulesForCourse as mockGetModules,
  getLessonById as mockGetLessonById,
  getResourcesForCourse as mockGetResources,
  getGlobalResources as mockGetGlobal,
  getAssignmentsForCourse as mockGetAssignments,
  mockResources,
  mockAssignments,
  mockCertificates,
  mockStudents,
  mockTeachers,
  mockUsers,
  mockMyEnrollments,
  getTranscriptForLesson,
  getVideoProgress,
  saveVideoProgress,
  markLessonCompleted,
  getStudentStatus,
  getStudentsNeedingMotivation,
} from '@/data/internal'

export {
  generateMockModules,
  mockGetModules as getModulesForCourse,
  mockGetLessonById as getLessonById,
  mockGetResources as getResourcesForCourse,
  mockGetGlobal as getGlobalResources,
  mockGetAssignments as getAssignmentsForCourse,
  mockResources,
  mockAssignments,
  mockCertificates,
  mockStudents,
  mockTeachers,
  mockUsers,
  mockMyEnrollments,
  getTranscriptForLesson,
  getVideoProgress,
  saveVideoProgress,
  markLessonCompleted,
  getStudentStatus,
  getStudentsNeedingMotivation,
}

// ─── FUTURO: consultas Supabase asíncronas ──────────
// Cuando tengas credenciales en .env, descomenta lo que
// necesites y cambia los exports de arriba a async.

/*
export async function fetchCourses() {
  if (!isSupabaseConfigured()) return mockCourses
  const { data, error } = await supabase.from('courses').select('*').eq('is_published', true)
  if (error) { console.error(error); return mockCourses }
  return data.length > 0 ? data : mockCourses
}
*/
