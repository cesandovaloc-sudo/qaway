import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { BlogProvider } from './context/BlogContext'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import './styles/blog-editor.css'

function BlogHubStudio() {
  const [searchParams] = useSearchParams()
  const isEditing = searchParams.get('mode') === 'editor' || searchParams.has('id')

  return (
    <div className="blog-editor-root w-full min-h-screen bg-white text-primary">
      {isEditing ? <EditorPage /> : <DashboardPage />}
    </div>
  )
}

export default function BlogEditorPage() {
  return (
    <BlogProvider>
      <BlogHubStudio />
    </BlogProvider>
  )
}