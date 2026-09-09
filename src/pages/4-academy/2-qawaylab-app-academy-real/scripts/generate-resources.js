// Script para generar recursos reales por lección (PDF, Excel, Word)
// npm install pdfkit exceljs docx (ya instalados)
// Uso: node scripts/generate-resources.js

import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.resolve(__dirname, '..', 'public', 'resources')

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// ============================================================
// GENERADORES POR FORMATO
// ============================================================

function generatePDF(filename, title, contentLines, options = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const filePath = path.join(outputDir, filename)
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)

    // Header bar
    doc.rect(0, 0, doc.page.width, 8).fill(options.color || '#2563eb')

    // Title
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a')
      .text(title, 50, 40)

    // Decorative line
    doc.moveTo(50, 72).lineTo(350, 72).lineWidth(2).stroke(options.color || '#2563eb')

    // Course info
    if (options.courseName) {
      doc.font('Helvetica').fontSize(10).fillColor('#64748b')
        .text(`Curso: ${options.courseName}`, 50, 88)
    }
    if (options.lessonName) {
      doc.font('Helvetica').fontSize(10).fillColor('#64748b')
        .text(`Lección: ${options.lessonName}`, 50, 104)
    }

    let yPos = 140
    for (const line of contentLines) {
      if (typeof line === 'string') {
        doc.font('Helvetica').fontSize(11).fillColor('#334155')
          .text(line, 50, yPos, { width: 495 })
        yPos += 24
      } else if (line.type === 'bullet') {
        doc.font('Helvetica').fontSize(11).fillColor('#334155')
          .text(`  •  ${line.text}`, 50, yPos, { width: 475, indent: 20 })
        yPos += 22
      } else if (line.type === 'subtitle') {
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#1e293b')
          .text(line.text, 50, yPos)
        yPos += 30
      } else if (line.type === 'code') {
        doc.rect(50, yPos - 4, 495, 26).fill('#f1f5f9')
        doc.font('Courier').fontSize(9).fillColor('#1e293b')
          .text(line.text, 60, yPos, { width: 475 })
        yPos += 30
      }
    }

    // Footer
    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8')
      .text('Qaway Academy - Material de estudio', 50, doc.page.height - 50, { align: 'center' })

    doc.end()
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

async function generateExcel(filename, sheetName, headers, rows, options = {}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Qaway Academy'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(sheetName)

  // Header style
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: options.headerColor || 'FF2563EB' } },
    border: {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    },
    alignment: { horizontal: 'left', vertical: 'middle' },
  }

  // Add headers
  const headerRow = sheet.addRow(headers)
  headerRow.eachCell((cell) => {
    cell.font = headerStyle.font
    cell.fill = headerStyle.fill
    cell.border = headerStyle.border
    cell.alignment = headerStyle.alignment
  })

  // Add data rows
  rows.forEach((rowData) => {
    const row = sheet.addRow(rowData)
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      }
      cell.alignment = { horizontal: 'left', vertical: 'middle' }
    })
  })

  // Auto-width columns
  headers.forEach((_, i) => {
    const maxLen = Math.max(
      String(headers[i]).length,
      ...rows.map(r => String(r[i] || '').length)
    )
    sheet.getColumn(i + 1).width = Math.min(Math.max(maxLen + 3, 12), 40)
  })

  const filePath = path.join(outputDir, filename)
  await workbook.xlsx.writeFile(filePath)
  return filePath
}

async function generateWord(filename, title, sections, options = {}) {
  const children = []

  // Title
  children.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Course/lesson info
  if (options.courseName) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Curso: `, bold: true, size: 22 }),
          new TextRun({ text: options.courseName, size: 22 }),
        ],
        spacing: { after: 100 },
      })
    )
  }

  // Decorative line
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '────────────────────────', color: '94a3b8', size: 16 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Content sections
  for (const section of sections) {
    if (section.type === 'heading') {
      children.push(
        new Paragraph({
          text: section.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      )
    } else if (section.type === 'text') {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: section.text, size: 22 })],
          spacing: { after: 120 },
        })
      )
    } else if (section.type === 'bullet') {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: '•  ', bold: true, size: 22 }),
            new TextRun({ text: section.text, size: 22 }),
          ],
          indent: { left: 400 },
          spacing: { after: 80 },
        })
      )
    } else if (section.type === 'table' && section.data) {
      const tableRows = section.data.map((row, idx) => {
        const cells = row.map(cellText =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: String(cellText),
                bold: idx === 0,
                size: 20,
              })],
            })],
          })
        )
        return new TableRow({ children: cells })
      })

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      )
      children.push(new Paragraph({ spacing: { after: 200 } }))
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Qaway Academy — Material de estudio', size: 18, color: '94a3b8' })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
    })
  )

  const doc = new Document({
    title,
    description: options.description || '',
    creator: 'Qaway Academy',
    sections: [{ children }],
  })

  const filePath = path.join(outputDir, filename)
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(filePath, buffer)
  return filePath
}

// ============================================================
// DEFINICIÓN DE RECURSOS POR LECCIÓN
// ============================================================

const resourceDefs = [
  // === CURSO 1: Introducción al Desarrollo Web ===
  {
    type: 'pdf',
    filename: 'guia-html5-estructura.pdf',
    title: 'Guía de HTML5 - Estructura Básica',
    courseId: 'c0000000-0001-0000-0000-000000000001',
    lessonId: 'b0000101-0000-0000-0000-000000000001',
    courseName: 'Introducción al Desarrollo Web',
    lessonName: '¿Qué es HTML? Estructura básica',
    color: '#2563eb',
    content: [
      { type: 'subtitle', text: 'Etiquetas Fundamentales' },
      { type: 'bullet', text: '<!DOCTYPE html> — Declaración del tipo de documento' },
      { type: 'bullet', text: '<html> — Raíz del documento' },
      { type: 'bullet', text: '<head> — Metadatos y configuración' },
      { type: 'bullet', text: '<body> — Contenido visible' },
      { type: 'subtitle', text: 'Ejemplo de Estructura' },
      { type: 'code', text: '<!DOCTYPE html>' },
      { type: 'code', text: '<html lang="es">' },
      { type: 'code', text: '  <head><title>Mi página</title></head>' },
      { type: 'code', text: '  <body><h1>Hola Mundo</h1></body>' },
      { type: 'code', text: '</html>' },
      { type: 'subtitle', text: 'Buenas Prácticas' },
      { type: 'bullet', text: 'Usar siempre minúsculas en etiquetas' },
      { type: 'bullet', text: 'Cerrar todas las etiquetas' },
      { type: 'bullet', text: 'Incluir atributo lang en <html>' },
    ],
  },
  {
    type: 'excel',
    filename: 'ejercicios-etiquetas-html.xlsx',
    title: 'Ejercicios de Etiquetas HTML',
    courseId: 'c0000000-0001-0000-0000-000000000001',
    lessonId: 'b0000102-0000-0000-0000-000000000001',
    courseName: 'Introducción al Desarrollo Web',
    lessonName: 'Etiquetas HTML esenciales',
    sheetName: 'Ejercicios',
    headers: ['Ejercicio', 'Etiqueta a usar', 'Descripción', 'Dificultad'],
    rows: [
      ['1', 'h1 a h6', 'Crear una jerarquía de títulos', 'Fácil'],
      ['2', 'p', 'Escribir un párrafo con texto Lorem', 'Fácil'],
      ['3', 'a', 'Crear un enlace a Google', 'Fácil'],
      ['4', 'img', 'Insertar una imagen con alt text', 'Fácil'],
      ['5', 'ul/ol', 'Lista de compras ordenada y desordenada', 'Media'],
      ['6', 'table', 'Tabla de horario de clases', 'Media'],
      ['7', 'form', 'Formulario de registro con 5 campos', 'Difícil'],
      ['8', 'section/article', 'Estructurar un artículo de blog', 'Difícil'],
      ['9', 'header/footer', 'Crear header y footer semánticos', 'Media'],
      ['10', 'nav', 'Barra de navegación con 4 enlaces', 'Media'],
    ],
  },
  {
    type: 'excel',
    filename: 'practica-flexbox-grid.xlsx',
    title: 'Práctica Flexbox y Grid',
    courseId: 'c0000000-0001-0000-0000-000000000001',
    lessonId: 'b0000105-0000-0000-0000-000000000001',
    courseName: 'Introducción al Desarrollo Web',
    lessonName: 'Flexbox, Grid y responsive',
    sheetName: 'Ejercicios CSS',
    headers: ['Ejercicio', 'Técnica', 'Descripción', 'Breakpoint'],
    rows: [
      ['1', 'Flexbox', 'Centrar un div horizontal y verticalmente', 'Todos'],
      ['2', 'Flexbox', 'Barra de navegación con espacio entre items', 'Todos'],
      ['3', 'Flexbox', 'Grid de 3 columnas con gap de 16px', '>768px'],
      ['4', 'Grid', 'Layout de 12 columnas con sidebar', '>1024px'],
      ['5', 'Grid', 'Masonry básico con grid-auto-rows', '>768px'],
      ['6', 'Responsive', 'Menú hamburguesa con media query', '<768px'],
      ['7', 'Responsive', 'Imagen que cambia de tamaño', 'Todos'],
      ['8', 'Flexbox+Grid', 'Card grid responsive con flexbox interior', 'Todos'],
    ],
  },
  {
    type: 'word',
    filename: 'plantilla-despliegue-web.docx',
    title: 'Plantilla de Despliegue Web',
    courseId: 'c0000000-0001-0000-0000-000000000001',
    lessonId: 'b0000109-0000-0000-0000-000000000001',
    courseName: 'Introducción al Desarrollo Web',
    lessonName: 'Construcción y despliegue',
    sections: [
      { type: 'heading', text: 'Checklist de Despliegue' },
      { type: 'text', text: 'Sigue estos pasos para publicar tu sitio web correctamente.' },
      { type: 'table', data: [
        ['#', 'Paso', 'Estado', 'Notas'],
        ['1', 'Optimizar imágenes', '☐', 'Usar WebP o comprimir PNG'],
        ['2', 'Minificar CSS/JS', '☐', 'Usar herramientas online'],
        ['3', 'Verificar enlaces rotos', '☐', 'Revisar todas las páginas'],
        ['4', 'Test en móvil', '☐', 'Chrome DevTools > responsive'],
        ['5', 'Configurar dominio', '☐', 'DNS apuntando al hosting'],
        ['6', 'Subir archivos por FTP', '☐', 'FileZilla o similar'],
        ['7', 'SSL/HTTPS', '☐', 'Certificado gratuito Let\'s Encrypt'],
        ['8', 'Test final', '☐', 'Navegar todo el sitio'],
      ]},
      { type: 'heading', text: 'Opciones de Hosting' },
      { type: 'bullet', text: 'GitHub Pages — Gratuito, ideal para proyectos' },
      { type: 'bullet', text: 'Netlify — Plan gratuito con formularios + funciones' },
      { type: 'bullet', text: 'Vercel — Excelente para frameworks modernos' },
      { type: 'bullet', text: 'Hosting tradicional — cPanel, FTP, bases de datos' },
    ],
  },

  // === CURSO 2: JavaScript Avanzado ===
  {
    type: 'pdf',
    filename: 'guia-closures-event-loop.pdf',
    title: 'Guía de Closures y Event Loop',
    courseId: 'c0000000-0002-0000-0000-000000000002',
    lessonId: 'b0000201-0000-0000-0000-000000000001',
    courseName: 'JavaScript Avanzado',
    lessonName: 'Closures y el Event Loop',
    color: '#7c3aed',
    content: [
      { type: 'subtitle', text: '¿Qué es un Closure?' },
      { type: 'bullet', text: 'Una función que recuerda su ámbito léxico incluso cuando se ejecuta fuera de él' },
      { type: 'bullet', text: 'Útil para crear variables privadas y factory functions' },
      { type: 'code', text: 'function crearContador() {' },
      { type: 'code', text: '  let count = 0' },
      { type: 'code', text: '  return () => ++count' },
      { type: 'code', text: '}' },
      { type: 'subtitle', text: 'El Event Loop' },
      { type: 'bullet', text: 'Call Stack: ejecuta funciones en orden LIFO' },
      { type: 'bullet', text: 'Task Queue: callbacks de setTimeout, eventos DOM' },
      { type: 'bullet', text: 'Microtask Queue: promesas, mutationObserver' },
      { type: 'subtitle', text: 'Orden de ejecución' },
      { type: 'code', text: 'console.log("1") // Sincrónico' },
      { type: 'code', text: 'setTimeout(() => console.log("2"), 0) // Task' },
      { type: 'code', text: 'Promise.resolve().then(() => console.log("3")) // Microtask' },
      { type: 'code', text: 'console.log("4") // Sincrónico' },
      { type: 'subtitle', text: 'Resultado: 1, 4, 3, 2' },
    ],
  },
  {
    type: 'excel',
    filename: 'ejercicios-async-await.xlsx',
    title: 'Ejercicios de Async/Await',
    courseId: 'c0000000-0002-0000-0000-000000000002',
    lessonId: 'b0000204-0000-0000-0000-000000000001',
    courseName: 'JavaScript Avanzado',
    lessonName: 'Async/Await y Streams',
    sheetName: 'Ejercicios JS',
    headerColor: 'FF7C3AED',
    headers: ['Ejercicio', 'Concepto', 'Descripción', 'Código inicial'],
    rows: [
      ['1', 'Async básico', 'Crear función async que retorne un mensaje', 'async function saludo() {}'],
      ['2', 'Await fetch', 'Obtener datos de una API pública', 'const res = await fetch(url)'],
      ['3', 'Error handling', 'Capturar error con try/catch en async', 'try { ... } catch (e) {}'],
      ['4', 'Promise.all', 'Ejecutar 3 promesas en paralelo', 'await Promise.all([...])'],
      ['5', 'Promise.race', 'Implementar timeout con race', 'await Promise.race([...])'],
      ['6', 'Async iterable', 'Procesar datos con for-await-of', 'for await (const item of items) {}'],
    ],
  },

  // === CURSO 6: Data Science Fundamentals ===
  {
    type: 'pdf',
    filename: 'cheatsheet-python-data-science.pdf',
    title: 'Cheatsheet Python para Data Science',
    courseId: 'c0000000-0006-0000-0000-000000000006',
    lessonId: 'b0000601-0000-0000-0000-000000000001',
    courseName: 'Data Science Fundamentals',
    lessonName: 'Python básico para datos',
    color: '#059669',
    content: [
      { type: 'subtitle', text: 'Tipos de Datos Esenciales' },
      { type: 'bullet', text: 'int, float, str, bool, list, dict, tuple, set' },
      { type: 'subtitle', text: 'List Comprehensions' },
      { type: 'code', text: '[x**2 for x in range(10) if x % 2 == 0]' },
      { type: 'subtitle', text: 'NumPy Básico' },
      { type: 'code', text: 'import numpy as np' },
      { type: 'code', text: 'arr = np.array([1, 2, 3, 4, 5])' },
      { type: 'code', text: 'arr.mean(), arr.std(), arr.sum()' },
      { type: 'subtitle', text: 'Pandas Esencial' },
      { type: 'code', text: 'import pandas as pd' },
      { type: 'code', text: 'df = pd.read_csv("datos.csv")' },
      { type: 'code', text: 'df.head(), df.info(), df.describe()' },
      { type: 'code', text: 'df.groupby("categoria").mean()' },
      { type: 'subtitle', text: 'Consejos' },
      { type: 'bullet', text: 'Usa .shape y .dtypes para explorar datasets' },
      { type: 'bullet', text: '.isnull().sum() para detectar valores nulos' },
      { type: 'bullet', text: 'Prefiere .loc[] sobre .iloc[] para claridad' },
    ],
  },
  {
    type: 'excel',
    filename: 'datos-ejemplo-graficos.xlsx',
    title: 'Datos de Ejemplo para Gráficos',
    courseId: 'c0000000-0006-0000-0000-000000000006',
    lessonId: 'b0000603-0000-0000-0000-000000000001',
    courseName: 'Data Science Fundamentals',
    lessonName: 'Matplotlib y Seaborn',
    sheetName: 'Ventas Mensuales',
    headerColor: 'FF059669',
    headers: ['Mes', 'Producto A', 'Producto B', 'Producto C', 'Total'],
    rows: [
      ['Enero', 120, 85, 45, 250],
      ['Febrero', 135, 92, 52, 279],
      ['Marzo', 110, 78, 48, 236],
      ['Abril', 145, 95, 55, 295],
      ['Mayo', 160, 100, 60, 320],
      ['Junio', 155, 110, 58, 323],
      ['Julio', 170, 115, 62, 347],
      ['Agosto', 165, 108, 65, 338],
      ['Septiembre', 148, 102, 50, 300],
      ['Octubre', 140, 98, 48, 286],
      ['Noviembre', 158, 112, 55, 325],
      ['Diciembre', 200, 130, 70, 400],
    ],
  },
  {
    type: 'word',
    filename: 'guia-proyecto-final-ds.docx',
    title: 'Guía del Proyecto Final - Data Science',
    courseId: 'c0000000-0006-0000-0000-000000000006',
    lessonId: 'b0000606-0000-0000-0000-000000000001',
    courseName: 'Data Science Fundamentals',
    lessonName: 'Proyecto final de datos',
    sections: [
      { type: 'heading', text: 'Descripción del Proyecto' },
      { type: 'text', text: 'Realizarás un análisis completo de datos de principio a fin, aplicando todo lo aprendido en el curso: Python, Pandas, visualización y ML introductorio.' },
      { type: 'heading', text: 'Dataset Recomendado' },
      { type: 'bullet', text: 'Kaggle: Titanic - Machine Learning from Disaster' },
      { type: 'bullet', text: 'Kaggle: Iris Flower Dataset' },
      { type: 'bullet', text: 'Google Dataset Search: datos abiertos de tu interés' },
      { type: 'heading', text: 'Entregables' },
      { type: 'table', data: [
        ['Entregable', 'Formato', 'Peso'],
        ['1. Notebook de análisis', 'Jupyter (.ipynb)', '40%'],
        ['2. Dashboard visual', 'PDF con gráficos', '30%'],
        ['3. Informe ejecutivo', 'PDF 1 página', '20%'],
        ['4. Código fuente', 'GitHub repo', '10%'],
      ]},
      { type: 'heading', text: 'Criterios de Evaluación' },
      { type: 'bullet', text: 'Limpieza y preparación de datos correcta' },
      { type: 'bullet', text: 'Análisis exploratorio con visualizaciones claras' },
      { type: 'bullet', text: 'Modelo de ML con métricas de rendimiento' },
      { type: 'bullet', text: 'Conclusiones accionables basadas en datos' },
    ],
  },
  {
    type: 'excel',
    filename: 'datos-proyecto-ds.xlsx',
    title: 'Datos Complementarios - Proyecto Final',
    courseId: 'c0000000-0006-0000-0000-000000000006',
    lessonId: 'b0000606-0000-0000-0000-000000000001',
    courseName: 'Data Science Fundamentals',
    lessonName: 'Proyecto final de datos',
    sheetName: 'Datos Clientes',
    headerColor: 'FF059669',
    headers: ['ID', 'Edad', 'Ingreso', 'Gasto Mensual', 'Score', 'Segmento'],
    rows: [
      ['C001', 25, 1800, 450, 72, 'Joven'],
      ['C002', 34, 3200, 820, 85, 'Profesional'],
      ['C003', 45, 5000, 1200, 91, 'Premium'],
      ['C004', 22, 1500, 380, 65, 'Estudiante'],
      ['C005', 38, 4100, 950, 88, 'Profesional'],
      ['C006', 51, 6500, 1500, 95, 'Premium'],
      ['C007', 29, 2200, 600, 78, 'Joven'],
      ['C008', 42, 4800, 1100, 90, 'Premium'],
      ['C009', 31, 2800, 700, 82, 'Profesional'],
      ['C010', 27, 2000, 520, 75, 'Joven'],
    ],
  },
]

// ============================================================
// EJECUCIÓN
// ============================================================

async function main() {
  console.log('📦 Generando recursos por lección...\n')

  let count = 0
  for (const def of resourceDefs) {
    count++
    const prefix = `[${count}/${resourceDefs.length}]`
    process.stdout.write(`${prefix} ${def.title} (${def.type.toUpperCase()})... `)

    try {
      switch (def.type) {
        case 'pdf':
          await generatePDF(def.filename, def.title, def.content, {
            courseName: def.courseName,
            lessonName: def.lessonName,
            color: def.color,
          })
          break

        case 'excel':
          await generateExcel(def.filename, def.sheetName, def.headers, def.rows, {
            headerColor: def.headerColor,
          })
          break

        case 'word':
          await generateWord(def.filename, def.title, def.sections, {
            courseName: def.courseName,
          })
          break
      }
      const stats = fs.statSync(path.join(outputDir, def.filename))
      const sizeKB = (stats.size / 1024).toFixed(1)
      console.log(`✅  (${sizeKB} KB)`)
    } catch (err) {
      console.log(`❌ Error: ${err.message}`)
    }
  }

  console.log(`\n📁 ${count} recursos guardados en: ${outputDir}`)
  console.log('   Cursos cubiertos: 3')
  console.log('   Lecciones distintas: 8')
  console.log('   PDF: 3 | Excel: 4 | Word: 2\n')
}

main().catch(console.error)
