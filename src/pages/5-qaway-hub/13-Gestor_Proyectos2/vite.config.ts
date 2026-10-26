import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Módulo Tareas v2 vendido intacto: tsc lo ve vía src/tareas-vendor.d.ts y
      // Vite lo empaqueta desde el archivo real (ruta absoluta para que dev y
      // build resuelvan igual).
      '@tareas-v2/app': fileURLToPath(
        new URL('./qaway-tareas-v2-completo/qaway-tareas/src/App.tsx', import.meta.url),
      ),
      '@cronograma/app': fileURLToPath(
        new URL('./qaway-cronograma/src/App.tsx', import.meta.url),
      ),
    },
  },
});
