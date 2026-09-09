// Script para generar certificados PDF profesionales con pdfkit
// npm install pdfkit (ya instalado)
// Uso: node scripts/generate-certificates.js

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '..', 'public', 'certificates')

// Asegurar que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}

function generateCertificate({ studentName, courseName, instructorName, completedAt, outputPath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    })

    const stream = fs.createWriteStream(outputPath)
    doc.pipe(stream)

    const w = 842 // A4 landscape width
    const h = 595 // A4 landscape height

    // ===== FONDO PRINCIPAL =====
    // Fondo blanco crema
    doc.rect(0, 0, w, h)
      .fill('#faf9f6')

    // ===== BORDE DECORATIVO EXTERNO =====
    doc.rect(20, 20, w - 40, h - 40)
      .lineWidth(3)
      .stroke('#1e3a8a')

    // Borde interno delgado
    doc.rect(30, 30, w - 60, h - 60)
      .lineWidth(1)
      .stroke('#93c5fd')

    // Borde punteado (simulado con rectangulo adicional)
    doc.rect(35, 35, w - 70, h - 70)
      .lineWidth(0.5)
      .strokeOpacity(0.3)
      .stroke('#64748b')

    // ===== ESQUINAS DECORATIVAS =====
    const cornerSize = 40
    const corners = [
      { x: 30, y: 30, dx: 1, dy: 1 },
      { x: w - 30, y: 30, dx: -1, dy: 1 },
      { x: 30, y: h - 30, dx: 1, dy: -1 },
      { x: w - 30, y: h - 30, dx: -1, dy: -1 },
    ]
    
    corners.forEach(({ x, y, dx, dy }) => {
      doc.moveTo(x, y + dy * cornerSize)
        .lineTo(x, y)
        .lineTo(x + dx * cornerSize, y)
        .lineWidth(2.5)
        .stroke('#1e3a8a')
    })

    // ===== LÍNEA DECORATIVA SUPERIOR =====
    const lineY = 110
    doc.moveTo(140, lineY)
      .lineTo(w / 2 - 80, lineY)
      .lineWidth(1.5)
      .stroke('#3b82f6')
    
    doc.moveTo(w / 2 + 80, lineY)
      .lineTo(w - 140, lineY)
      .lineWidth(1.5)
      .stroke('#3b82f6')

    // Pequeño diamante decorativo en el centro
    doc.fontSize(8)
      .fillColor('#3b82f6')
      .text('◆', w / 2 - 4, lineY - 8)

    // ===== TÍTULO PRINCIPAL =====
    doc.font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#64748b')
      .text('QAWAY ACADEMY', w / 2, 60, { align: 'center' })

    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#94a3b8')
      .text('Plataforma de Aprendizaje', w / 2, 80, { align: 'center' })

    // ===== TÍTULO DEL CERTIFICADO =====
    doc.font('Times-Roman')
      .fontSize(14)
      .fillColor('#475569')
      .text('Otorga el presente', w / 2, 150, { align: 'center' })

    doc.font('Times-Bold')
      .fontSize(32)
      .fillColor('#1e3a8a')
      .text('CERTIFICADO DE FINALIZACIÓN', w / 2, 172, { align: 'center' })

    // ===== TEXTO "A" =====
    doc.font('Times-Roman')
      .fontSize(13)
      .fillColor('#475569')
      .text('a', w / 2, 225, { align: 'center' })

    // ===== NOMBRE DEL ESTUDIANTE =====
    doc.font('Times-Bold')
      .fontSize(36)
      .fillColor('#0f172a')
      .text(studentName, w / 2, 245, { align: 'center' })

    // ===== TEXTO DEL CURSO =====
    doc.font('Times-Roman')
      .fontSize(14)
      .fillColor('#475569')
      .text('Por haber completado satisfactoriamente el curso', w / 2, 305, { align: 'center' })

    doc.font('Times-Bold')
      .fontSize(22)
      .fillColor('#2563eb')
      .text(courseName, w / 2, 332, { align: 'center' })

    // ===== LÍNEA SEPARADORA =====
    const sepY = 395
    doc.moveTo(w / 2 - 120, sepY)
      .lineTo(w / 2 + 120, sepY)
      .lineWidth(1)
      .strokeOpacity(0.4)
      .stroke('#94a3b8')

    // ===== FECHA =====
    doc.font('Helvetica')
      .fontSize(11)
      .fillColor('#64748b')
      .text(`Fecha de finalización: ${formatDate(completedAt)}`, w / 2, 410, { align: 'center' })

    // ===== INSTRUCTOR =====
    if (instructorName) {
      doc.font('Helvetica')
        .fontSize(11)
        .fillColor('#64748b')
        .text(`Instructor: ${instructorName}`, w / 2, 432, { align: 'center' })
    }

    // ===== LÍNEA DE FIRMA =====
    const signY = 480
    doc.moveTo(w / 2 - 100, signY)
      .lineTo(w / 2 + 100, signY)
      .lineWidth(1)
      .stroke('#1e3a8a')

    doc.font('Helvetica')
      .fontSize(9)
      .fillColor('#94a3b8')
      .text('Firma del instructor', w / 2, signY + 8, { align: 'center' })

    // ===== NÚMERO DE CERTIFICADO =====
    const certId = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
    doc.font('Helvetica')
      .fontSize(7)
      .fillColor('#cbd5e1')
      .text(`Cert. #${certId}`, w / 2, h - 55, { align: 'center' })

    // ===== FINALIZAR =====
    doc.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

// ===== CONFIGURACIÓN DE CERTIFICADOS A GENERAR =====
const certificates = [
  {
    studentName: 'Estudiante de Prueba',
    courseName: 'Data Science Fundamentals',
    instructorName: 'Ana Martínez',
    completedAt: new Date().toISOString(),
    filename: 'data-science-fundamentals.pdf',
  },
  {
    studentName: 'Estudiante de Prueba',
    courseName: 'Introducción al Desarrollo Web',
    instructorName: 'Carlos López',
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    filename: 'introduccion-desarrollo-web.pdf',
  },
]

async function main() {
  console.log('🎓 Generando certificados PDF...\n')

  for (const cert of certificates) {
    const outputPath = path.join(outputDir, cert.filename)
    console.log(`   → ${cert.courseName} para ${cert.studentName}...`)
    await generateCertificate({
      studentName: cert.studentName,
      courseName: cert.courseName,
      instructorName: cert.instructorName,
      completedAt: cert.completedAt,
      outputPath,
    })
    console.log(`     ✅ Guardado en public/certificates/${cert.filename}`)
  }

  console.log(`\n📁 Todos los certificados están en: ${outputDir}`)
  console.log('   Sirven estáticamente desde Vite en: /certificates/...\n')
}

main().catch(console.error)
