import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import Navbar, { NavbarProvider } from '@/components/layout/Navbar'
import { BlogProvider } from './context/BlogContext'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import './styles/blog-editor.css'

function BlogHubStudio() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEditing = Boolean(id) || searchParams.get('mode') === 'editor' || searchParams.has('id')

  return (
    <NavbarProvider>
      <div className="blog-editor-root w-full min-h-screen bg-white text-primary flex flex-col">
        <Navbar />
        <div className="flex-1 pt-20">
          {isEditing ? <EditorPage /> : <DashboardPage />}
        </div>
      </div>
    </NavbarProvider>
  )
}

export default function BlogEditorPage() {
  return (
    <BlogProvider>
      <BlogHubStudio />
    </BlogProvider>
  )
}