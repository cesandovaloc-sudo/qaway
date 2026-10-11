import ErrorBoundary from '@/app/errors/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import { ProjectPerspectiveProvider } from '@/context/ProjectPerspectiveContext'
import AppRouter from '@/app/router/AppRouter'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <ProjectPerspectiveProvider>
            <AppRouter />
          </ProjectPerspectiveProvider>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
