-- ============================================================
-- FASE 1 · Módulo 2-Agentes · Extensiones requeridas
-- 2026-09-22 · Autoptr: agente-supabase
-- pgvector para RAG (embeddings 768 dims) + uuid
-- Idempotente. Sin cron (Fase 2).
-- ============================================================

create extension if not exists vector;
create extension if not exists "uuid-ossp";