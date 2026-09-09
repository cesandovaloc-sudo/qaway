import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, Component, type ReactNode, type ErrorInfo } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import RouteFallback from '@/components/common/RouteFallback'

// Sube al inicio de la página en cada cambio de ruta (React Router no lo hace por defecto,
// lo que hacía que las páginas se abrieran con el scroll heredado de la anterior)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Red de seguridad global: si cualquier error de render ocurre, mostramos una
// pantalla de respaldo con botón recargar en vez de una página blanca
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
import PublicLayout from '@/layouts/PublicLayout'
import AuthLayout from '@/layouts/AuthLayout'
import LessonLayout from '@/layouts/LessonLayout'

// Layouts cargados de forma eager: así el sidebar/navbar NUNCA se desmontan al
// navegar (sin destello de pantalla completa). Solo las páginas son lazy, y cada
// layout envuelve su <Outlet /> con un Suspense ligero (RouteFallback).
import StudentLayout from '@/layouts/StudentLayout'
import TeacherLayout from '@/layouts/TeacherLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Lazy-loaded public pages
const Home = lazy(() => import('@/pages/public/Home'))
const Courses = lazy(() => import('@/pages/public/Courses'))
const CourseDetail = lazy(() => import('@/pages/public/CourseDetail'))
const Login = lazy(() => import('@/pages/public/Login'))
const Register = lazy(() => import('@/pages/public/Register'))
const Recover = lazy(() => import('@/pages/public/Recover'))

// Lazy-loaded student pages
const StudentPanel = lazy(() => import('@/pages/student/Panel'))
const CourseHub = lazy(() => import('@/pages/student/CourseHub'))
const Lesson = lazy(() => import('@/pages/student/Lesson'))
const PublicLesson = lazy(() => import('@/pages/public/LessonPreview'))
const Resources = lazy(() => import('@/pages/student/Resources'))
const Certificates = lazy(() => import('@/pages/student/Certificates'))
const Settings = lazy(() => import('@/pages/student/Settings'))
const Purchases = lazy(() => import('@/pages/student/Purchases'))
const MyCourses = lazy(() => import('@/pages/student/MyCourses'))
const Checkout = lazy(() => import('@/pages/Checkout'))

// Lazy-loaded teacher pages
const TeacherDashboard = lazy(() => import('@/pages/teacher/Dashboard'))
const TeacherCourses = lazy(() => import('@/pages/teacher/Courses'))
const CourseManage = lazy(() => import('@/pages/teacher/CourseManage'))
const TaskReview = lazy(() => import('@/pages/teacher/TaskReview'))
const TeacherContent = lazy(() => import('@/pages/teacher/Content'))
const TeacherStudents = lazy(() => import('@/pages/teacher/Students'))

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const Students = lazy(() => import('@/pages/admin/Students'))
const Teachers = lazy(() => import('@/pages/admin/Teachers'))
const AdminCourses = lazy(() => import('@/pages/admin/Courses'))
const CourseNew = lazy(() => import('@/pages/admin/CourseNew'))
const CourseEdit = lazy(() => import('@/pages/admin/CourseEdit'))
const Permissions = lazy(() => import('@/pages/admin/Permissions'))
const AdminPayments = lazy(() => import('@/pages/admin/Payments'))
const AdminCategories = lazy(() => import('@/pages/admin/Categories'))
const NotFound = lazy(() => import('@/pages/NotFound'))

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
  if (!user) return <Navigate to="/acceder" replace />

  const roleRoutes: Record<string, string> = {
    teacher: '/docente',
    editor: '/docente',
    admin: '/admin',
    support: '/admin',
  }
  if (profile && roleRoutes[profile.role || '']) return <Navigate to={roleRoutes[profile.role || '']} replace />

  return <Lesson />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="cursos" element={<Courses />} />
              <Route path="cursos/:slug" element={<CourseDetail />} />
            </Route>

            {/* Lecciones — mismo layout para público y estudiante */}
            <Route element={<LessonLayout />}>
              <Route path="cursos/:slug/leccion/:lessonId" element={<PublicLesson />} />
              <Route path="panel/cursos/:slug/leccion/:lessonId" element={<StudentLessonGate />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="acceder" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route path="recuperar" element={<Recover />} />
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
    </BrowserRouter>
  )
}
