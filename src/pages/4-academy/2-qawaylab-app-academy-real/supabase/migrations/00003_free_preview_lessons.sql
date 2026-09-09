-- Qaway Academy - Free Preview Lessons
-- Migration 00003: Schema only (no seed data)

alter table public.courses
  add column free_preview_lessons int not null default 1;
