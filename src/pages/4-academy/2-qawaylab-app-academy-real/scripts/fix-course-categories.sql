-- Fix course categories to match the new category system
-- Run this in Supabase SQL Editor or via CLI

UPDATE public.courses
SET category = 'Desarrollo'
WHERE category IN ('Frontend', 'Backend');

UPDATE public.courses
SET category = 'Inteligencia Artificial'
WHERE category = 'Datos';

-- Verify the changes
SELECT id, title, category, level FROM public.courses ORDER BY title;
