// ─── Tipos centrales de Academy (alineados con el schema Supabase) ───

export interface Profile {
  id: string
  email?: string | null
  full_name?: string | null
  avatar_url?: string | null
  role?: 'student' | 'teacher' | 'admin' | 'support' | null
  bio?: string | null
  headline?: string | null
  created_at?: string
}

export interface Instructor {
  id: string
  full_name?: string | null
  avatar_url?: string | null
}

export interface Resource {
  id: string
  title: string
  type?: string | null
  file_url?: string | null
  file_size?: number | null
  created_at?: string
}

export interface Lesson {
  id: string
  module_id?: string | null
  course_id?: string | null
  title: string
  content?: string | null
  video_url?: string | null
  duration?: string | null
  sort_order?: number | null
  status?: 'draft' | 'published' | string | null
  transcript?: string | null
  transcript_status?: string | null
  module?: { id: string; title: string; course_id: string } | null
  resources?: Resource[] | null
  created_at?: string
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string | null
  sort_order?: number | null
  lessons?: Lesson[] | null
  created_at?: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  category?: string | null
  level?: string | null
  duration?: string | null
  price?: number | string | null
  is_free?: boolean | null
  image_url?: string | null
  status?: string | null
  featured?: boolean | null
  free_preview_lessons?: number | null
  what_you_learn?: string[] | null
  requirements?: string[] | null
  target_audience?: string[] | null
  instructor_id?: string | null
  instructor?: Instructor | null
  modules?: Module[] | null
  created_at?: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  status?: string | null
  enrolled_at?: string | null
  completed_at?: string | null
  course?: Course | null
  created_at?: string
}

export interface QuizQuestion {
  id: string
  quiz_id?: string | null
  question: string
  options?: string[] | null
  correct_index?: number | null
  explanation?: string | null
  sort_order?: number | null
}

export interface Quiz {
  id: string
  lesson_id: string
  title?: string | null
  passing_score?: number | null
  max_attempts?: number | null
  questions?: QuizQuestion[] | null
  created_at?: string
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  answers?: unknown | null
  score?: number | null
  completed?: boolean | null
  attempted_at?: string
  created_at?: string
}

export interface Progress {
  id: string
  student_id: string
  lesson_id: string
  completed?: boolean | null
  seconds_watched?: number | null
  completed_at?: string | null
  updated_at?: string
}

export interface CourseProgress {
  total: number
  completedIds: string[]
  completed: number
  percentage: number
  totalSecondsWatched: number
  totalDurationSeconds: number
  minutesWatched: number
  totalMinutes: number
}

export interface Payment {
  id: string
  student_id?: string | null
  enrollment_id?: string | null
  amount?: number | null
  currency?: string | null
  status?: string | null
  provider?: string | null
  created_at?: string
}

export interface Certificate {
  id: string
  student_id?: string | null
  course_id?: string | null
  url?: string | null
  certificate_url?: string | null
  course?: { id: string; title: string; slug?: string | null; duration?: string | null; instructor?: { full_name?: string | null } | null } | null
  issued_at?: string | null
  created_at?: string
}

export interface Task {
  id: string
  course_id?: string | null
  lesson_id?: string | null
  title: string
  description?: string | null
  due_date?: string | null
  status?: string | null
  created_at?: string
}

export interface Notification {
  id: string
  user_id?: string | null
  type?: string | null
  title?: string | null
  message?: string | null
  link?: string | null
  is_read?: boolean | null
  created_at?: string
}

export interface Category {
  id: string
  name: string
  slug?: string | null
  icon?: string | null
  description?: string | null
  sort_order?: number | null
  created_at?: string
}
