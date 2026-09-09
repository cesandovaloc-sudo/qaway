// Script para crear usuarios REALES de prueba
// Uso: node scripts/seed-test-users.js
// NOTA: Necesita la SERVICE_ROLE KEY desde Supabase Dashboard

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Credenciales ────────────────────────────────────────────
// Las pide interactivamente o desde variables de entorno
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://jkstekoaiwdjpivkrsil.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Necesitas la SERVICE ROLE KEY de Supabase.')
  console.error('   Consíguela en:')
  console.error('   https://supabase.com/dashboard/project/jkstekoaiwdjpivkrsil/settings/api')
  console.error('   Luego ejecuta:')
  console.error('   set SUPABASE_SERVICE_ROLE_KEY=tu-key-aqui && node scripts/seed-test-users.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ─── Datos de prueba ─────────────────────────────────────────
const TEACHER = { email: 'teacher@qaway.test', password: 'Gyg@fGZk*ByL6LF', name: 'Carlos López' }

const STUDENTS = [
  { email: 'luis.garcia@qaway.test', password: 'test123456', name: 'Luis García' },
  { email: 'maria.torres@qaway.test', password: 'test123456', name: 'María Torres' },
  { email: 'pedro.sanchez@qaway.test', password: 'test123456', name: 'Pedro Sánchez' },
  { email: 'ana.ramos@qaway.test', password: 'test123456', name: 'Ana Ramos' },
  { email: 'carlos.mendoza@qaway.test', password: 'test123456', name: 'Carlos Mendoza' },
  { email: 'laura.diaz@qaway.test', password: 'test123456', name: 'Laura Díaz' },
  { email: 'jorge.vega@qaway.test', password: 'test123456', name: 'Jorge Vega' },
  { email: 'sofia.castro@qaway.test', password: 'test123456', name: 'Sofía Castro' },
  { email: 'diego.rojas@qaway.test', password: 'test123456', name: 'Diego Rojas' },
  { email: 'valeria.navarro@qaway.test', password: 'test123456', name: 'Valeria Navarro' },
]

const COURSE_IDS = {
  'desarrollo-web': 'c0000000-0001-0000-0000-000000000001',
  'js-avanzado': 'c0000000-0002-0000-0000-000000000002',
}

const LESSON_IDS = {
  'html-estructura': 'b0000101-0000-0000-0000-000000000001',
  'html-etiquetas': 'b0000102-0000-0000-0000-000000000001',
  'html-formularios': 'b0000103-0000-0000-0000-000000000001',
  'js-closures': 'b0000201-0000-0000-0000-000000000001',
}

const TASKS = [
  { id: 'd0000001-0000-0000-0000-000000000001', lesson_id: LESSON_IDS['html-estructura'], title: 'Ejercicio: Tu primera página HTML', description: 'Crea una página HTML con tu biografía personal. Incluye: título, párrafos, imagen y enlace.', due_days: 7 },
  { id: 'd0000001-0000-0000-0000-000000000002', lesson_id: LESSON_IDS['html-etiquetas'], title: 'Ejercicio: Lista de tareas semántica', description: 'Usa etiquetas semánticas HTML para crear una lista de tareas pendientes.', due_days: 7 },
  { id: 'd0000001-0000-0000-0000-000000000003', lesson_id: LESSON_IDS['html-formularios'], title: 'Formulario de registro completo', description: 'Diseña un formulario de registro con nombre, email, contraseña, país y términos.', due_days: 5 },
  { id: 'd0000001-0000-0000-0000-000000000004', lesson_id: LESSON_IDS['js-closures'], title: 'Ejercicio de Closures', description: 'Implementa 3 ejemplos de closures: contador, memoización y factory function.', due_days: 10 },
]

const SUBMISSION_NOTES = [
  'Profesor, aquí está mi trabajo. Usé las etiquetas que vimos en clase.',
  'Espero sus comentarios para mejorar.',
  'Tuve problemas con la imagen pero el resto está completo.',
  'Este ejercicio me pareció muy interesante y práctico.',
  'Incluí ejemplos adicionales para demostrar comprensión.',
  'Creo que me faltó practicar más, pero aquí está mi entrega.',
  'Usé las herramientas recomendadas y funcionaron bien.',
  'Me gustaría feedback sobre la estructura del código.',
  'Completé todos los requisitos de la tarea.',
  'Es mi primer proyecto web, espero les guste.',
]

const GRADE_OPTIONS = ['Aprobado', 'Corregir', 'Devuelta']

// ─── Helper: delay ───────────────────────────────────────────
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Creando usuarios de prueba...\n')

  // 1. Crear o actualizar TEACHER
  console.log('👨‍🏫 Teacher...')
  let teacherId = null
  
  // Intentar crear, si ya existe capturamos el error
  const { data: createdTeacher, error: createError } = await supabase.auth.admin.createUser({
    email: TEACHER.email,
    password: TEACHER.password,
    email_confirm: true,
    user_metadata: { full_name: TEACHER.name },
  })
  
  if (createError?.message?.includes('already')) {
    // Ya existe — buscarlo en profiles
    console.log(`   ⏳ Ya existe, buscando perfil...`)
    const { data: profiles } = await supabase.from('profiles').select('id').eq('full_name', TEACHER.name).limit(1)
    if (profiles?.length) {
      teacherId = profiles[0].id
      await supabase.from('profiles').update({ role: 'teacher' }).eq('id', teacherId)
      console.log(`   ✅ Ya existe: ${TEACHER.email}`)
    } else {
      console.error(`   ❌ No se pudo encontrar el teacher. Revisa si ya existe en auth.users`)
      return
    }
  } else if (createError) {
    console.error(`   ❌ Error al crear teacher: ${createError.message}`)
    return
  } else {
    teacherId = createdTeacher.user.id
    await supabase.from('profiles').upsert({ id: teacherId, full_name: TEACHER.name, role: 'teacher' })
    console.log(`   ✅ Creado: ${TEACHER.email} (${teacherId.slice(0, 8)}…)`)
  }

  // 2. Asignar cursos al teacher real
  await supabase.from('courses').update({ instructor_id: teacherId }).eq('instructor_id', '00000000-0000-0000-0000-000000000001')
  console.log('   📚 Cursos asignados al teacher')

  // 3. Crear estudiantes
  const studentIds = []
  for (const s of STUDENTS) {
    process.stdout.write(`   👤 ${s.email}... `)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: s.email,
      password: s.password,
      email_confirm: true,
      user_metadata: { full_name: s.name },
    })
    
    if (error?.message?.includes('already')) {
      // Ya existe — buscarlo
      const { data: profiles } = await supabase.from('profiles').select('id').eq('full_name', s.name).limit(1)
      if (profiles?.length) {
        studentIds.push(profiles[0].id)
        await supabase.from('profiles').update({ role: 'student' }).eq('id', profiles[0].id)
        console.log(`✅ Ya existe`)
      } else {
        console.log(`❌ No encontrado`)
      }
    } else if (error) {
      console.log(`❌ ${error.message}`)
    } else {
      studentIds.push(data.user.id)
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: s.name, role: 'student' })
      console.log(`✅ Creado`)
    }
    await delay(300) // Evitar rate limiting
  }

  console.log(`\n📊 ${studentIds.length} estudiantes listos\n`)

  // 4. Inscribir estudiantes en cursos
  console.log('📝 Inscribiendo estudiantes...')
  const course1Id = COURSE_IDS['desarrollo-web']
  const course2Id = COURSE_IDS['js-avanzado']
  
  for (const sid of studentIds) {
    await supabase.from('enrollments').upsert(
      { student_id: sid, course_id: course1Id, status: 'active' },
      { onConflict: 'student_id,course_id' }
    )
    // Algunos también en curso 2
    if (Math.random() > 0.5) {
      await supabase.from('enrollments').upsert(
        { student_id: sid, course_id: course2Id, status: 'active' },
        { onConflict: 'student_id,course_id' }
      )
    }
  }
  console.log(`   ✅ ${studentIds.length} estudiantes inscritos en Curso 1`)

  // 5. Crear tareas
  console.log('📋 Creando tareas...')
  for (const task of TASKS) {
    await supabase.from('tasks').upsert(task, { onConflict: 'id' })
  }
  console.log(`   ✅ ${TASKS.length} tareas creadas`)

  // 6. Crear entregas (submissions)
  console.log('📤 Creando entregas...')
  let subCount = 0
  let pendingCount = 0
  
  // Limpiar submissions anteriores creadas con IDs hardcodeados
  await supabase.from('submissions').delete().in('task_id', TASKS.map(t => t.id))
  
  for (let i = 0; i < studentIds.length; i++) {
    const sid = studentIds[i]
    // Cada estudiante entrega 2-3 tareas
    const numTasks = 2 + (i % 2) // 2 o 3
    const taskPool = [...TASKS].sort(() => Math.random() - 0.5).slice(0, numTasks)
    
    for (const task of taskPool) {
      const isPending = Math.random() > 0.3 // 70% pendientes, 30% revisadas
      const daysAgo = Math.floor(Math.random() * 7) + 1
      
      const submission = {
        task_id: task.id,
        student_id: sid,
        file_url: isPending ? `https://example.com/submissions/student-${i}-task-${task.id.slice(0, 4)}.html` : null,
        notes: SUBMISSION_NOTES[i % SUBMISSION_NOTES.length],
        status: isPending ? 'pending' : GRADE_OPTIONS[Math.floor(Math.random() * GRADE_OPTIONS.length)] === 'Aprobado' ? 'approved' : 'returned',
        submitted_at: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      }
      
      if (!isPending) {
        submission.grade = GRADE_OPTIONS[Math.floor(Math.random() * GRADE_OPTIONS.length)]
        submission.feedback = submission.grade === 'Aprobado' 
          ? 'Buen trabajo, sigue así.' 
          : submission.grade === 'Corregir' 
            ? 'Revisa los detalles mencionados en clase y vuelve a enviar.'
            : 'Faltan elementos importantes. Revisa la rúbrica y vuelve a intentarlo.'
        submission.reviewed_at = new Date(Date.now() - (daysAgo - 1) * 86400000).toISOString()
      } else {
        pendingCount++
      }
      
      await supabase.from('submissions').insert(submission)
      subCount++
    }
  }
  
  console.log(`   ✅ ${subCount} entregas creadas (${pendingCount} pendientes de revisar)`)

  // 7. Resumen final
  console.log('\n═══════════════════════════════════════════')
  console.log('✅ TODO LISTO')
  console.log('═══════════════════════════════════════════')
  console.log('\n📋 Credenciales de prueba:')
  console.log(`   👨‍🏫 Teacher:  ${TEACHER.email} / ${TEACHER.password}`)
  console.log(`   👥 Estudiantes:`)
  for (const s of STUDENTS) {
    console.log(`      ${s.email} / ${s.password}`)
  }
  console.log('\n🌐 URLs para probar:')
  console.log(`   📊 /docente          — Panel del teacher`)
  console.log(`   📝 /docente/tareas   — Revisión de tareas (${pendingCount} pendientes)`)
  console.log(`   📚 /docente/cursos/introduccion-al-desarrollo-web — Gestión del curso`)
  console.log(`   👤 /panel            — Panel de estudiante (login con cualquier estudiante)`)
  console.log('\n✨ Listo para probar la revisión de tareas!')
}

main().catch(console.error)
