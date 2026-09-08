import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Dep local via file: (npm crea symlink): resolver desde node_modules
    preserveSymlinks: true,
  },
  server: {
    port: 9000,
    strictPort: true,
    open: true,
  },
})
