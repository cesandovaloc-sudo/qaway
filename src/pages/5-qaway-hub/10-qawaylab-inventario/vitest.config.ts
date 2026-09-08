import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    testTimeout: 30000,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Nota: el módulo @qawaylab/pago vive fuera del root (repo hermano) y el
      // provider v8 no colecta archivos externos al proyecto — su cobertura se
      // reporta por inventario de tests, no en este reporte.
      include: ['src/**/*.{ts,tsx}', 'contracts/**/*.{ts,tsx}'],
      exclude: [
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'contracts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    // @qawaylab/pago es un paquete linkeado (file:) con .jsx: inline para que
    // Vite lo procese (y la entrada index.js resuelva sus .jsx internos) en vez
    // de externalizarlo y que Node falle con ERR_UNKNOWN_FILE_EXTENSION.
    server: {
      deps: {
        inline: ['@qawaylab/pago'],
      },
    },
    exclude: ['node_modules', 'dist'],
    // Integration tests can be run with --integration flag
    // They require real Supabase credentials in .env.test
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Dep local @qawaylab/pago (file:) crea symlink: resolver desde node_modules
    // (mismo comportamiento que vite.config.ts) para que los .jsx del módulo
    // encuentren react/jsx-dev-runtime del host.
    preserveSymlinks: true,
  },
})
