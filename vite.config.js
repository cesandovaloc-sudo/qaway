import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // manualChunks removido — estándar v3 #25: "No usar manualChunks por costumbre"
      },
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4100,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/tsconfig.node.json', '**/.git/**'],
    },
  },
})