/**
 * Rutas canónicas y centralizadas de Qaway Lab Academy.
 * Evita hardcodear strings dispersos y garantiza que cualquier cambio de prefijo
 * se propague limpiamente a través de toda la aplicación.
 */

export const ACADEMY_BASE = '/academy/app'

export const academyRoutes = {
  // Públicas
  home: () => `${ACADEMY_BASE}/cursos`,
  courses: () => `${ACADEMY_BASE}/cursos`,
  courseDetail: (slug: string) => `${ACADEMY_BASE}/cursos/${slug}`,
  courseLesson: (slug: string, lessonId: string | number) => `${ACADEMY_BASE}/cursos/${slug}/leccion/${lessonId}`,
  login: (redirect?: string) => redirect ? `${ACADEMY_BASE}/acceder?redirect=${encodeURIComponent(redirect)}` : `${ACADEMY_BASE}/acceder`,
  register: () => `${ACADEMY_BASE}/registro`,
  recover: () => `${ACADEMY_BASE}/recuperar`,
  checkout: (slug: string) => `${ACADEMY_BASE}/checkout?curso=${slug}`,

  // Alumno / Panel
  studentPanel: () => `${ACADEMY_BASE}/panel`,
  studentCourses: () => `${ACADEMY_BASE}/panel/cursos`,
  studentCourseHub: (slug: string) => `${ACADEMY_BASE}/panel/cursos/${slug}`,
  studentLesson: (slug: string, lessonId: string | number) => `${ACADEMY_BASE}/panel/cursos/${slug}/leccion/${lessonId}`,
  studentResources: () => `${ACADEMY_BASE}/panel/recursos`,
  studentCertificates: () => `${ACADEMY_BASE}/panel/certificados`,
  studentPurchases: () => `${ACADEMY_BASE}/panel/compras`,
  studentSettings: () => `${ACADEMY_BASE}/panel/configuracion`,

  // Docente
  teacherDashboard: () => `${ACADEMY_BASE}/docente`,
  teacherCourses: () => `${ACADEMY_BASE}/docente/cursos`,
  teacherCourseManage: (slug: string) => `${ACADEMY_BASE}/docente/cursos/${slug}`,
  teacherTaskReview: () => `${ACADEMY_BASE}/docente/tareas`,
  teacherContent: () => `${ACADEMY_BASE}/docente/contenido`,
  teacherStudents: () => `${ACADEMY_BASE}/docente/estudiantes`,

  // Admin
  adminDashboard: () => `${ACADEMY_BASE}/admin`,
  adminStudents: () => `${ACADEMY_BASE}/admin/estudiantes`,
  adminTeachers: () => `${ACADEMY_BASE}/admin/docentes`,
  adminCourses: () => `${ACADEMY_BASE}/admin/cursos`,
  adminCourseNew: () => `${ACADEMY_BASE}/admin/cursos/nuevo`,
  adminCourseEdit: (slug: string) => `${ACADEMY_BASE}/admin/cursos/${slug}/editar`,
  adminPermissions: () => `${ACADEMY_BASE}/admin/permisos`,
  adminPayments: () => `${ACADEMY_BASE}/admin/pagos`,
  adminCategories: () => `${ACADEMY_BASE}/admin/categorias`,
}
