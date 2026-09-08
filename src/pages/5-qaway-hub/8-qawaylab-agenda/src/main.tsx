import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AgendaProvider } from './agenda/context/AgendaContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AgendaProvider>
        <App />
      </AgendaProvider>
    </BrowserRouter>
  </StrictMode>,
)
