# 🚀 Qaway Lab Academy — Script de despliegue rápido
# Ejecutar en PowerShell: .\scripts\deploy-all.ps1

Write-Host "=== 🚀 Qaway Lab Academy - Deploy Completo ===" -ForegroundColor Cyan
Write-Host ""

# 1. Ir al proyecto
$projectPath = "C:\LEO\EMPRESAS\Qawa Lab Proyectos\1-Qaway-Academy"
Set-Location $projectPath

# 2. Edge Function: transcripción automática
Write-Host "📦 Desplegando Edge Function: fetch-transcript..." -ForegroundColor Yellow
supabase functions deploy fetch-transcript --no-verify-jwt
Write-Host "✅ Edge Function desplegada" -ForegroundColor Green
Write-Host ""

Write-Host ""
Write-Host "=== ✅ Despliegue completado ===" -ForegroundColor Cyan
Write-Host "📌 Migraciones pendientes: pégalas manualmente en Supabase SQL Editor"
Write-Host "   > supabase/migrations/00010_lesson_transcript.sql"

# Pausa para que el usuario vea el mensaje antes de cerrar
Read-Host "`nPresiona Enter para salir"
