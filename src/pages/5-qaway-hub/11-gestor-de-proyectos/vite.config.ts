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
    // Dep local @qawaylab/pago (file:) crea symlink: resolver desde node_modules
    preserveSymlinks: true,
  },
  server: {
    port: 9600,
  },
  preview: {
    port: 9600,
  },
})
