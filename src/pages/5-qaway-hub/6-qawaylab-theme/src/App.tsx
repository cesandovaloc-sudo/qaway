import { ThemeProvider } from './theme/context/ThemeContext'
import EditorPage from './theme/pages/EditorPage'

export default function App() {
  return (
    <ThemeProvider>
      <EditorPage />
    </ThemeProvider>
  )
}
