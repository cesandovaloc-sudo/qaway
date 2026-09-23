import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    // El submódulo 10-qawaylab-inventario es un proyecto standalone con su propio
    // vitest.config, node_modules y paquete file: @qawaylab/pago: se valida con su
    // propio `npm test`. El runner raíz NO debe absorber sus tests.
    exclude: ['src/pages/5-qaway-hub/10-qawaylab-inventario/**', 'node_modules', 'dist'],
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
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
          if (importer && importer.replace(/\\/g, '/').includes('10-qawaylab-inventario')) {
            const target = path.resolve(__dirname, 'src/pages/5-qaway-hub/10-qawaylab-inventario/src', source)
            return this.resolve(target, importer, { skipSelf: true, ...options })
          }
          const mainTarget = path.resolve(__dirname, 'src', source)
          return this.resolve(mainTarget, importer, { skipSelf: true, ...options })
        },
      },
      { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
    ],
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-router'],
  },
  build: {
    // Limpia dist/ en cada build: con `false` se acumulaban bundles antiguos
    // con hash y quedaba un index.html apuntando a artefactos obsoletos.
    // Seguro: todo lo no generado por Vite vive en public/ y se recopia.
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // manualChunks removido — estándar v3 #25: "No usar manualChunks por costumbre"
      },
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4100,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/tsconfig.node.json', '**/.git/**'],
    },
  },
})