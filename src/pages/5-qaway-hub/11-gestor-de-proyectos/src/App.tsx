import ErrorBoundary from '@/app/errors/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import AppRouter from '@/app/router/AppRouter'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
