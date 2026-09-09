import { useState, useEffect, useCallback } from 'react'
import { handleAuthError } from '@/lib/auth'

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err instanceof Error ? err.message : String(err) : 'Error al cargar datos'
      setError(message)
      console.error('Data fetch error:', err)
      // Si el error es por sesión expirada, forzar cierre de sesión
      // para que los layouts redirijan a /acceder
      handleAuthError(err).catch(() => {})
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}
