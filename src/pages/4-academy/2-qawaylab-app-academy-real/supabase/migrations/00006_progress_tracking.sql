-- Qaway Academy - Progress Tracking System
-- Migration 00006
-- Adds columns for video heartbeat tracking (COMPLETION_THRESHOLD = 0.95)
-- ============================================================

-- Tracking columns for video progress
alter table public.progress
  add column if not exists seconds_watched int not null default 0,
  add column if not exists total_watch_time int not null default 0,
  add column if not exists last_position int not null default 0,
  add column if not exists updated_at timestamptz default now();

-- Index for faster progress queries by student
create index if not exists idx_progress_student_completed
  on public.progress(student_id, completed);
