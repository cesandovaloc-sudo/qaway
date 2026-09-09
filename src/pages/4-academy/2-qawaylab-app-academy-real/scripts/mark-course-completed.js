// Script temporal para marcar un curso como completado
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const STUDENT_ID = '6025d56b-aefe-41b7-b14a-700089eb8879'
const COURSE_ID = 'c0000000-0006-0000-0000-000000000006'

// All lesson IDs for "Data Science Fundamentals"
const lessonIds = [
  'b0000601-0000-0000-0000-000000000001',
  'b0000602-0000-0000-0000-000000000001',
  'b0000603-0000-0000-0000-000000000001',
  'b0000604-0000-0000-0000-000000000001',
  'b0000605-0000-0000-0000-000000000001',
  'b0000606-0000-0000-0000-000000000001',
]

async function main() {
  console.log('📝 Marking Data Science Fundamentals as completed...\n')

  // 1. Mark all lessons as completed
  console.log('✅ Marking all lessons as completed...')
  const progressRecords = lessonIds.map(lessonId => ({
    student_id: STUDENT_ID,
    lesson_id: lessonId,
    completed: true,
    seconds_watched: 600,
    completed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }))

  const { data: _progressData, error: progressError } = await supabase
    .from('progress')
    .upsert(progressRecords, { onConflict: 'student_id,lesson_id' })

  if (progressError) {
    console.error('❌ Error marking progress:', progressError)
    return
  }
  console.log(`   ${lessonIds.length} lessons marked as completed ✅`)

  // 2. Update enrollment to completed
  console.log('📝 Updating enrollment status...')
  const { data: _enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('student_id', STUDENT_ID)
    .eq('course_id', COURSE_ID)

  if (enrollmentError) {
    console.error('❌ Error updating enrollment:', enrollmentError)
    return
  }
  console.log('   Enrollment updated to "completed" ✅')

  console.log('\n🎉 Done! Data Science Fundamentals is now completed.')
  console.log('   Refresh your browser to see it in the "Completados" tab.')
}

main().catch(console.error)
