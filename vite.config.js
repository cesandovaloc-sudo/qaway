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
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: '$1',
        async customResolver(source, importer, options) {
          if (importer && importer.replace(/\\/g, '/').includes('2-qawaylab-app-academy-real')) {
            const target = path.resolve(__dirname, 'src/pages/4-academy/2-qawaylab-app-academy-real/src', source)
            return this.resolve(target, importer, { skipSelf: true, ...options })
          }
          const mainTarget = path.resolve(__dirname, 'src', source)
          return this.resolve(mainTarget, importer, { skipSelf: true, ...options })
        },
      },
      { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  build: {
    emptyOutDir: false,
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