// Script to generate an Excel file with all Academy routes for testing
// Run: node scripts/generate-routes-excel.js
// Requires exceljs (already in package.json)

import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BASE_URL = 'http://localhost:5147'

const routes = [
  // ─── Públicas ────────────────────────────────────────────
  { section: 'Públicas', role: 'Público', url: '/', label: 'Inicio (Landing)', description: 'Hero, beneficios, cursos destacados' },
  { section: 'Públicas', role: 'Público', url: '/cursos', label: 'Catálogo de Cursos', description: '6 cursos, filtros por categoría/nivel/búsqueda' },
  { section: 'Públicas', role: 'Público', url: '/cursos/introduccion-al-desarrollo-web', label: 'Detalle de Curso', description: 'Breadcrumbs, módulos, requisitos, instructor, CTA' },
  { section: 'Públicas', role: 'Público', url: '/acceder', label: 'Iniciar Sesión', description: 'Formulario login' },
  { section: 'Públicas', role: 'Público', url: '/registro', label: 'Registrarse', description: 'Formulario registro' },
  { section: 'Públicas', role: 'Público', url: '/recuperar', label: 'Recuperar Contraseña', description: 'Formulario recuperación' },
  { section: 'Públicas', role: 'Público', url: '/checkout', label: 'Checkout (Pasarela de Pagos)', description: '🆕 Selección método de pago + Pago Directo' },

  // ─── Admin ────────────────────────────────────────────────
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin', label: 'Dashboard Admin', description: 'Stats: Alumnos, Docentes, Cursos, Ingresos. Links rápidos.' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/alumnos', label: 'Gestionar Alumnos', description: 'Tabla con estudiantes, buscador' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/docentes', label: 'Gestionar Docentes', description: 'Tabla con docentes' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/cursos', label: 'Gestionar Cursos', description: 'Tabla con 8 cursos, buscador + filtro' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/cursos/nuevo', label: 'Crear Curso', description: 'Formulario de creación' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/cursos/introduccion-al-desarrollo-web/editar', label: 'Editar Curso', description: 'Formulario de edición' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/pagos', label: 'Gestionar Pagos', description: '🆕 Aprobar/rechazar Pago Directo + historial' },
  { section: 'Admin', role: 'admin@qaway.test', url: '/admin/permisos', label: 'Roles y Permisos', description: 'Matriz estática (documentativa)' },

  // ─── Docente ──────────────────────────────────────────────
  { section: 'Docente', role: 'teacher@qaway.test', url: '/docente', label: 'Panel Docente', description: 'Stats: cursos, alumnos, tareas pendientes/revisadas' },
  { section: 'Docente', role: 'teacher@qaway.test', url: '/docente/tareas', label: 'Revisión de Tareas', description: 'Filtros: Todas/Pendiente/Revisada/Aprobada/Devuelta' },
  { section: 'Docente', role: 'teacher@qaway.test', url: '/docente/cursos/introduccion-al-desarrollo-web', label: 'Gestionar Curso', description: 'Módulos, lecciones, recursos. Subir recurso.' },

  // ─── Estudiante ───────────────────────────────────────────
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel', label: 'Panel Estudiante', description: 'Tabs: Todos/En curso/Completados/Certificados. Progreso.' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/cursos', label: 'Mis Cursos', description: 'Lista de cursos inscritos' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/cursos/introduccion-al-desarrollo-web', label: 'Hub del Curso', description: 'Módulos, lecciones, progreso' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/cursos/introduccion-al-desarrollo-web/leccion/1', label: 'Lección (Video)', description: 'Reproductor + sidebar + recursos. Probar Vista Previa PDF/Word/Excel.' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/recursos', label: 'Mis Recursos', description: 'Todos los recursos descargables' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/certificados', label: 'Mis Certificados', description: 'Certificados obtenidos' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/configuracion', label: 'Configuración', description: 'Editar perfil: nombre, bio' },
  { section: 'Estudiante', role: 'student@qaway.test', url: '/panel/compras', label: 'Mis Compras', description: 'Historial de pagos' },
]

async function generateExcel() {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Qaway Lab'
  workbook.created = new Date()

  // ─── Sheet 1: Guía de Validación ──────────────────────────
  const sheet1 = workbook.addWorksheet('Guía de Validación')

  // Define columns
  sheet1.columns = [
    { header: '#', key: 'num', width: 5 },
    { header: 'Sección', key: 'section', width: 14 },
    { header: 'Rol / Credencial', key: 'role', width: 22 },
    { header: 'Nombre de Página', key: 'label', width: 30 },
    { header: 'URL Completa', key: 'fullUrl', width: 55 },
    { header: 'Descripción', key: 'description', width: 55 },
    { header: '✓', key: 'checked', width: 6 },
  ]

  // Header style
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  }

  // Apply header style
  const headerRow = sheet1.getRow(1)
  headerRow.height = 28
  headerRow.eachCell((cell) => {
    cell.style = headerStyle
  })

  // Credentials header
  sheet1.addRow({})
  const credRow = sheet1.addRow({})
  credRow.getCell(1).value = 'Credenciales:'
  credRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1E293B' } }
  sheet1.mergeCells(`A${credRow.number}:F${credRow.number}`)

  const creds = [
    { label: 'Admin', email: 'admin@qaway.test', pass: 'Gyg@fGZk*ByL6LF' },
    { label: 'Teacher', email: 'teacher@qaway.test', pass: 'Gyg@fGZk*ByL6LF' },
    { label: 'Student', email: 'student@qaway.test', pass: 'Gyg@fGZk*ByL6LF' },
  ]

  for (const c of creds) {
    const row = sheet1.addRow([null, null, null, null, null, null, null])
    row.getCell(2).value = `${c.label}:`
    row.getCell(2).font = { bold: true }
    row.getCell(3).value = c.email
    row.getCell(3).font = { name: 'Consolas', size: 10 }
    row.getCell(4).value = c.pass
    row.getCell(4).font = { name: 'Consolas', size: 10 }
  }

  sheet1.addRow({})

  // Add routes
  let counter = 0
  let currentSection = ''

  for (const route of routes) {
    if (route.section !== currentSection) {
      currentSection = route.section
      // Section header
      const sectionRow = sheet1.addRow({})
      sectionRow.getCell(1).value = route.section
      sectionRow.getCell(1).font = { bold: true, size: 11, color: { argb: 'FF1D4ED8' } }
      sheet1.mergeCells(`A${sectionRow.number}:F${sectionRow.number}`)
      sectionRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF6FF' },
      }
    }

    counter++
    const fullUrl = `${BASE_URL}${route.url}`
    const row = sheet1.addRow({
      num: counter,
      section: route.section,
      role: route.role,
      label: route.label,
      fullUrl: fullUrl,
      description: route.description,
      checked: '',
    })

    // Make URL a clickable hyperlink
    row.getCell(5).value = {
      text: fullUrl,
      hyperlink: fullUrl,
      tooltip: `Click para abrir: ${route.label}`,
    }
    row.getCell(5).font = { color: { argb: 'FF2563EB' }, underline: true }

    // Alternate row colors
    if (counter % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        }
      })
    }
  }

  // ─── Sheet 2: Probar Pago Directo (quick instructions) ────
  const sheet2 = workbook.addWorksheet('Probar Pago Directo')

  sheet2.columns = [
    { header: 'Paso', key: 'step', width: 8 },
    { header: 'Acción', key: 'action', width: 50 },
    { header: 'URL / Detalle', key: 'detail', width: 60 },
  ]

  const headerStyle2 = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } },
    alignment: { vertical: 'middle', horizontal: 'center' },
  }

  const headerRow2 = sheet2.getRow(1)
  headerRow2.eachCell((cell) => { cell.style = headerStyle2 })

  const instructions = [
    { step: 1, action: 'Ir al checkout como invitado', detail: `${BASE_URL}/checkout` },
    { step: 2, action: 'Iniciar sesión como student@qaway.test', detail: `${BASE_URL}/acceder` },
    { step: 3, action: 'Volver al checkout', detail: `${BASE_URL}/checkout` },
    { step: 4, action: 'Seleccionar "Pago Directo"', detail: 'Ver datos de cuenta BCP' },
    { step: 5, action: 'Subir un archivo de prueba como comprobante', detail: 'Cualquier imagen o PDF' },
    { step: 6, action: 'Hacer clic en "Enviar comprobante"', detail: 'Aparece mensaje de éxito' },
    { step: 7, action: 'Cerrar sesión de student', detail: '' },
    { step: 8, action: 'Iniciar sesión como admin@qaway.test', detail: `${BASE_URL}/acceder` },
    { step: 9, action: 'Ir a /admin/pagos → tab "Pendientes"', detail: `${BASE_URL}/admin/pagos` },
    { step: 10, action: 'Hacer clic en "✅ Aprobar"', detail: 'El pago se confirma y se desbloquea el curso' },
    { step: 11, action: 'Cerrar sesión de admin', detail: '' },
    { step: 12, action: 'Iniciar sesión como student y verificar', detail: `${BASE_URL}/panel/compras` },
  ]

  for (const inst of instructions) {
    const row = sheet2.addRow(inst)
    if (inst.detail.startsWith('http')) {
      row.getCell(3).value = {
        text: inst.detail,
        hyperlink: inst.detail,
        tooltip: 'Abrir enlace',
      }
      row.getCell(3).font = { color: { argb: 'FF2563EB' }, underline: true }
    }
  }

  // ─── Save ─────────────────────────────────────────────────
  const filePath = path.join(__dirname, '..', 'RUTAS-ACADEMY.xlsx')
  await workbook.xlsx.writeFile(filePath)
  console.log(`✅ Excel generado: ${filePath}`)
}

generateExcel().catch(console.error)
