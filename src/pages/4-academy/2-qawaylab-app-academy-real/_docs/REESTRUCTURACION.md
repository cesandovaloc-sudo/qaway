# Reestructuración — 1-qawaylab-projects
## Guardado el 30/07/2026 para retomar después

### Objetivo
Unificar `1-Web-Qaway` + `4-Proyectos/Qawa Lab Proyectos` en una sola carpeta padre `1-qawaylab-projects/` donde cada proyecto vive con su propio repo y build separado.

### Estructura deseada
```
📂 1-qawaylab-projects/                    ← PADRE (sin .git)
├── 📂 01-qawaylab-frontend/               ← Web (source/ + dist/)
├── 📂 02-qawaylab-academy/                ← Academy (source/ + dist/)
├── 📂 03-qawaylab-pagos/                  ← Pagos (solo source/)
├── 📂 04-qawaylab-bootcamp/
├── 📂 05-qawaylab-transcripcion/
├── 📂 06-qawaylab-dental/
├── 📄 .htaccess
└── 📄 index.html
```

### Cambios necesarios por proyecto

1. **Frontend**: mover `1-Web-Qaway/1-Frontend/` → `01-qawaylab-frontend/source/`
   - `vite.config.js`: cambiar `outDir: 'dist'` → `outDir: path.resolve(__dirname, '../dist')`
   - Package.json: agregar `mkdir -p ../dist` en script build
   - Mover `.htaccess`, `index.html` raíz actual a la nueva raíz

2. **Academy**: mover `4-Proyectos/.../1-Qaway-Academy/` → `02-qawaylab-academy/source/`
   - Mismo cambio en `vite.config.js`
   - Verificar `supabase link` (debería seguir funcionando)

3. **Pagos**: mover `4-Proyectos/.../5-Qaway-Lab-Pagos/` → `03-qawaylab-pagos/source/`
   - No tiene build (es librería)

4. **Documentos con rutas absolutas a actualizar**:
   - `DEPLOY_PREVIEW_WORKFLOW.md`
   - `WORKFLOW_FLUJOGRAMA.md`
   - `ACADEMY-SUPABASE-PLAYBOOK.md`
   - `Reglas-frontend-antes-de-cerrar.md`

### Tiempo estimado: ~1 hora
### Dificultad: Media (más que nada por docs y Hostinger)
