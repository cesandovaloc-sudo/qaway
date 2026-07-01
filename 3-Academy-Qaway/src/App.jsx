import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Catalog from '@/pages/Catalog'
import CourseDetail from '@/pages/CourseDetail'
import Login from '@/pages/Auth/Login'
import Register from '@/pages/Auth/Register'
import Recover from '@/pages/Auth/Recover'
import Dashboard from '@/pages/Dashboard'
import Lesson from '@/pages/Lesson'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cursos" element={<Catalog />} />
            <Route path="/cursos/:slug" element={<CourseDetail />} />
            <Route path="/cursos/:slug/leccion/:lessonId" element={<Lesson />} />
            <Route path="/acceder" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/recuperar" element={<Recover />} />
            <Route path="/panel" element={<Dashboard />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </BrowserRouter>
  )
}
