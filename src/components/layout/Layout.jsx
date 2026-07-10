import { Outlet } from 'react-router-dom'
import Navbar, { NavbarProvider } from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <NavbarProvider>
      <div className="min-h-screen bg-white font-sans selection:bg-qaway-accent selection:text-black">
        <Navbar />
        <main className="relative z-10">
          <Outlet />
        </main>
        <Footer />

        <div className="noise-bg" />
      </div>
    </NavbarProvider>
  )
}
