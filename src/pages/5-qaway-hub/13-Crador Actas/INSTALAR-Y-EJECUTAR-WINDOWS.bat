@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo ==========================================
echo   ACTAS INSTITUCIONALES - INSTALACION
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Instala Node.js 22 LTS desde https://nodejs.org/ y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)
where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Instala Python 3 desde https://www.python.org/downloads/ y marca la opcion Add Python to PATH.
  pause
  exit /b 1
)
echo [1/3] Instalando dependencias de React...
call npm install
if errorlevel 1 (echo ERROR al instalar dependencias de Node. & pause & exit /b 1)
echo [2/3] Instalando dependencias de Python...
python -m pip install -r requirements.txt
if errorlevel 1 (echo ERROR al instalar python-docx. & pause & exit /b 1)
if not exist .env copy .env.example .env >nul
echo [3/3] Instalacion completada.
echo Para iniciar la aplicacion ejecuta INICIAR-APP-WINDOWS.bat
pause
