import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, Component } from 'react'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import RouteFallback from './src/components/common/RouteFallback'
import SimpleLayout from './src/layouts/SimpleLayout'
import LessonLayout from './src/layouts/LessonLayout'
import StudentLayout from './src/layouts/StudentLayout'
import TeacherLayout from './src/layouts/TeacherLayout'
import AdminLayout from './src/layouts/AdminLayout'

// Lazy-loaded public pages
const Courses = lazy(() => import('./src/pages/public/Courses'))
const CourseDetail = lazy(() => import('./src/pages/public/CourseDetail'))
const Login = lazy(() => import('./src/pages/public/Login'))
const Register = lazy(() => import('./src/pages/public/Register'))
const Recover = lazy(() => import('./src/pages/public/Recover'))

// Lazy-loaded student pages
const StudentPanel = lazy(() => import('./src/pages/student/Panel'))
const CourseHub = lazy(() => import('./src/pages/student/CourseHub'))
const Lesson = lazy(() => import('./src/pages/student/Lesson'))
const PublicLesson = lazy(() => import('./src/pages/public/LessonPreview'))
const Resources = lazy(() => import('./src/pages/student/Resources'))
const Certificates = lazy(() => import('./src/pages/student/Certificates'))
const Settings = lazy(() => import('./src/pages/student/Settings'))
const Purchases = lazy(() => import('./src/pages/student/Purchases'))
const MyCourses = lazy(() => import('./src/pages/student/MyCourses'))
const Checkout = lazy(() => import('./src/pages/Checkout'))

// Lazy-loaded teacher pages
const TeacherDashboard = lazy(() => import('./src/pages/teacher/Dashboard'))
const TeacherCourses = lazy(() => import('./src/pages/teacher/Courses'))
const CourseManage = lazy(() => import('./src/pages/teacher/CourseManage'))
const TaskReview = lazy(() => import('./src/pages/teacher/TaskReview'))
const TeacherContent = lazy(() => import('./src/pages/teacher/Content'))
const TeacherStudents = lazy(() => import('./src/pages/teacher/Students'))

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('./src/pages/admin/Dashboard'))
const Students = lazy(() => import('./src/pages/admin/Students'))
const Teachers = lazy(() => import('./src/pages/admin/Teachers'))
const AdminCourses = lazy(() => import('./src/pages/admin/Courses'))
const CourseNew = lazy(() => import('./src/pages/admin/CourseNew'))
const CourseEdit = lazy(() => import('./src/pages/admin/CourseEdit'))
const Permissions = lazy(() => import('./src/pages/admin/Permissions'))
const AdminPayments = lazy(() => import('./src/pages/admin/Payments'))
const AdminCategories = lazy(() => import('./src/pages/admin/Categories'))
const NotFound = lazy(() => import('./src/pages/NotFound'))

// Red de seguridad global: si cualquier error de render ocurre, mostramos una
// pantalla de respaldo con botón recargar en vez de una página blanca
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error de aplicación:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 p-6 text-center">
          <span className="mb-4 text-5xl">⚠️</span>
          <h1 className="mb-2 text-lg font-bold text-surface-900">Algo salió mal</h1>
          <p className="mb-6 max-w-md text-sm text-surface-500">
            Ocurrió un error inesperado. Recarga la página para continuar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-none bg-[#ff4b0b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e0430a]"
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="mt-3 text-sm text-surface-500">Cargando...</p>
      </div>
    </div>
  )
}

// Puerta de acceso para la lección de estudiante: mismo layout que la pública,
// con la protección de roles que antes daba StudentLayout
function StudentLessonGate() {
  const { user, profile, loading } = useAuth()

  if (loading) return <PageFallback />
  if (!user) return <Navigate to="/academy/app/acceder" replace />

  const roleRoutes = {
    teacher: '/academy/app/docente',
    editor: '/academy/app/docente',
    admin: '/academy/app/admin',
    support: '/academy/app/admin',
  }
  if (profile && roleRoutes[profile.role || '']) return <Navigate to={roleRoutes[profile.role || '']} replace />

  return <Lesson />
}

export default function AcademyAppPage() {
  return (
    <div className="academy-app-root min-h-screen">
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
          {/* Redirección del index a cursos — la web principal provee el Layout global */}
          <Route index element={<Navigate to="/academy/app/cursos" replace />} />

          {/* Public routes — sin cartula: el Layout de la web ya da navbar/footer */}
          <Route path="cursos" element={<Suspense fallback={<RouteFallback />}><Courses /></Suspense>} />
          <Route path="cursos/:slug" element={<Suspense fallback={<RouteFallback />}><CourseDetail /></Suspense>} />

          {/* Lecciones — mismo layout para público y estudiante */}
          <Route element={<LessonLayout />}>
            <Route path="cursos/:slug/leccion/:lessonId" element={<PublicLesson />} />
            <Route path="panel/cursos/:slug/leccion/:lessonId" element={<StudentLessonGate />} />
          </Route>

          {/* Auth routes */}
          <Route element={<SimpleLayout />}>
            <Route path="acceder" element={<Suspense fallback={<RouteFallback />}><Login /></Suspense>} />
            <Route path="registro" element={<Suspense fallback={<RouteFallback />}><Register /></Suspense>} />
            <Route path="recuperar" element={<Suspense fallback={<RouteFallback />}><Recover /></Suspense>} />
          </Route>

          {/* Checkout route (no layout wrapper) */}
          <Route path="checkout" element={<Suspense fallback={<RouteFallback />}><Checkout /></Suspense>} />

          {/* Student routes */}
          <Route path="panel" element={<StudentLayout />}>
            <Route index element={<StudentPanel />} />
            <Route path="cursos" element={<MyCourses />} />
            <Route path="cursos/:slug" element={<CourseHub />} />
            <Route path="recursos" element={<Resources />} />
            <Route path="certificados" element={<Certificates />} />
            <Route path="configuracion" element={<Settings />} />
            <Route path="compras" element={<Purchases />} />
          </Route>

          {/* Teacher routes */}
          <Route path="docente" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="cursos" element={<TeacherCourses />} />
            <Route path="cursos/nuevo" element={<CourseNew />} />
            <Route path="cursos/:slug" element={<CourseManage />} />
            <Route path="contenido" element={<TeacherContent />} />
            <Route path="alumnos" element={<TeacherStudents />} />
            <Route path="tareas" element={<TaskReview />} />
          </Route>

          {/* Admin routes */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="alumnos" element={<Students />} />
            <Route path="docentes" element={<Teachers />} />
            <Route path="cursos" element={<AdminCourses />} />
            <Route path="cursos/nuevo" element={<CourseNew />} />
            <Route path="cursos/:slug/editar" element={<CourseEdit />} />
            <Route path="pagos" element={<AdminPayments />} />
            <Route path="permisos" element={<Permissions />} />
            <Route path="categorias" element={<AdminCategories />} />
          </Route>

          {/* 404 - Catch all */}
          <Route path="*" element={<Suspense fallback={<RouteFallback />}><NotFound /></Suspense>} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </div>
  )
}