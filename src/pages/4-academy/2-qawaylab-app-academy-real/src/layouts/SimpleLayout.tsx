import { Outlet, useLocation } from 'react-router-dom'

export default function SimpleLayout() {
  const location = useLocation()
  const isAcceder = location.pathname.endsWith('/acceder')
  const isAuthRoute = ['/acceder', '/registro', '/recuperar'].some(path => location.pathname.endsWith(path))

  if (isAuthRoute) {
    return (
      <div className={`flex items-center justify-center px-4 sm:px-6 relative overflow-hidden bg-[#faf9f6] ${
        isAcceder
          ? 'min-h-screen py-12'
          : 'min-h-[calc(100vh-80px)] pt-28 pb-16'
      }`}>
        {/* Destellos ambientales tornasolados institucionales de Academy */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#ff4b0b]/10 via-[#df3900]/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#ff9a70]/10 via-[#ffe6d6]/20 to-transparent blur-3xl" />
        <div className="w-full max-w-md relative z-10">
          <Outlet />
        </div>
      </div>
    )
  }

  return <Outlet />
}
