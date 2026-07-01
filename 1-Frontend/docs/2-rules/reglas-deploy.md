# reglas deploy
Reglas para el proyecto.

## Buenas Prácticas y Flujo de Trabajo
- **Revisar el estado del repositorio** antes de ejecutar cualquier comando que modifique el código (siempre comprobar si el Git o "GT" está activo y limpio):
  ```bash
  git status
  git diff            # muestra cambios no cometidos
  git branch          # verifica la rama activa
  ```
- **Comprobar que no haya cambios sin commitear**. Si existen, realiza `git add .` y `git commit -m "mensaje"` antes de ejecutar scripts de build o despliegue.
- **Mantener la rama `main` o `develop` actualizada** con `git pull` para evitar conflictos de merge al lanzar el proyecto.
- **Ejecutar comandos de desarrollo dentro de la carpeta `1-Web-Qaway-React`**; así npm encuentra `package.json` y no se solicitan permisos por falta de archivo.

## Consideraciones de puerto
- Por defecto Vite usa el puerto **3000**.
- Si ese puerto está ocupado, define la variable de entorno `PORT` con otro número antes de ejecutar:
  ```bash
  # PowerShell
  $env:PORT=3001
  npm run dev
  ```
- Vite elegirá automáticamente un puerto libre si no se especifica `PORT`.
