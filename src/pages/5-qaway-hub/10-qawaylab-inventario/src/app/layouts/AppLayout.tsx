import { Outlet } from "react-router-dom"
import Sidebar from '@/components/sidebar/Sidebar'
import Header from '@/components/header/Header'

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-surface">
      <Sidebar />
      <div className="ml-[260px] transition-all duration-300">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
