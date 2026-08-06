import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('react') || normalizedId.includes('react-dom') || normalizedId.includes('react-router-dom')) {
              return 'vendor-react'
            }

            if (normalizedId.includes('@supabase')) {
              return 'vendor-supabase'
            }

            if (normalizedId.includes('recharts')) {
              return 'vendor-charts'
            }

            if (normalizedId.includes('gsap') || normalizedId.includes('framer-motion')) {
              return 'vendor-motion'
            }

            return
          }

          if (normalizedId.includes('/src/pages/1-inicio/') || normalizedId.includes('/src/pages/4-academy/')) {
            return 'page-brand-core'
          }

          if (normalizedId.includes('/src/pages/2-estudio/')) return 'page-estudio'
          if (normalizedId.includes('/src/pages/3-sistemas-digitales/')) return 'page-sistemas'
          if (normalizedId.includes('/src/pages/5-qaway-hub/')) return 'page-hub'
          if (normalizedId.includes('/src/pages/6-recursos/')) return 'page-recursos'
          if (normalizedId.includes('/src/pages/7-blog/')) return 'page-blog'
          if (normalizedId.includes('/src/pages/8-landings/')) return 'page-landings'
          if (normalizedId.includes('/src/pages/9-pruebas/')) return 'page-pruebas'
        },
      },
    },
  },
  server: {
    port: 4000,
    host: true,
  },
})