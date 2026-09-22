-- ============================================================
-- FASE 1 · Módulo 2-Agentes · Seeds DEMO bajo tenant real qaway-lab
-- 2026-09-22 · Autoptr: agente-supabase
--
-- Solo datos de PRUEBA, etiquetados metadata->>'is_demo' = 'true'.
-- embedding = ARRAY_FILL(0.01, 768) DETERMINISTA: idéntico al
-- DEMO_VECTOR_768 del frontend => similarity 1.0 al consultar.
-- golden_examples.is_approved = true (visibles en search_unified_context).
-- Idempotentes: INSERT ... WHERE NOT EXISTS (sin UUIDs fijos).
--
-- Limpieza: DELETE ... WHERE tenant_id = <qaway-lab> AND metadata->>'is_demo'='true';
-- ============================================================

-- ------------------------------------------------------------
-- knowledge_base (3)
-- ------------------------------------------------------------
insert into public.knowledge_base (tenant_id, title, category, content, reference_price, embedding, metadata, is_active)
select '00000000-0000-0000-0000-000000000001',
       'Sistemas Web y Apps a Medida', 'Desarrollo',
       'Arquitecturas SaaS completas en React 19, Vite, Supabase, Tailwind v4 y PostgreSQL con alta disponibilidad y UX ergonómico.',
       'Cotización sujeta a alcance tras diagnóstico técnico',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768),
       '{"is_demo": true, "source": "seed"}'::jsonb, true
where not exists (
  select 1 from public.knowledge_base
  where tenant_id = '00000000-0000-0000-0000-000000000001' and title = 'Sistemas Web y Apps a Medida'
);

insert into public.knowledge_base (tenant_id, title, category, content, reference_price, embedding, metadata, is_active)
select '00000000-0000-0000-0000-000000000001',
       'Notion Enterprise & SOPs de Negocio', 'Operaciones',
       'Sistemas operativos completos para empresas, gestión de procesos, CRM interno y tableros operativos en Notion.',
       'Plantilla Pro oficial: S/ 49 o $15 USD',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768),
       '{"is_demo": true, "source": "seed"}'::jsonb, true
where not exists (
  select 1 from public.knowledge_base
  where tenant_id = '00000000-0000-0000-0000-000000000001' and title = 'Notion Enterprise & SOPs de Negocio'
);

insert into public.knowledge_base (tenant_id, title, category, content, reference_price, embedding, metadata, is_active)
select '00000000-0000-0000-0000-000000000001',
       'Agentes de IA con Reach y WhatsApp', 'Inteligencia Artificial',
       'Implementación de agente conversacional multi-tenant con RAG sobre base de conocimiento, entrenamiento supervisado y handoff humano.',
       'Plan Business incluido en suscripción annual',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768),
       '{"is_demo": true, "source": "seed"}'::jsonb, true
where not exists (
  select 1 from public.knowledge_base
  where tenant_id = '00000000-0000-0000-0000-000000000001' and title = 'Agentes de IA con Reach y WhatsApp'
);

-- ------------------------------------------------------------
-- faqs (2)
-- ------------------------------------------------------------
insert into public.faqs (tenant_id, question, answer, embedding, category, is_active)
select '00000000-0000-0000-0000-000000000001',
       '¿Cuánto tarda la entrega de un proyecto web?',
       'Depende del alcance: desde 10 días hábiles para landing pages hasta 6 semanas para SaaS a medida. Toda cotización incluye cronograma.',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768), 'plazos', true
where not exists (
  select 1 from public.faqs
  where tenant_id = '00000000-0000-0000-0000-000000000001' and question = '¿Cuánto tarda la entrega de un proyecto web?'
);

insert into public.faqs (tenant_id, question, answer, embedding, category, is_active)
select '00000000-0000-0000-0000-000000000001',
       '¿Ofrecen soporte y mantenimiento?',
       'Sí. Todos los planes incluyen mantenimiento y soporte técnico. El plan Business lleva horas mensuales dedicadas e iteraciones de diseño.',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768), 'soporte', true
where not exists (
  select 1 from public.faqs
  where tenant_id = '00000000-0000-0000-0000-000000000001' and question = '¿Ofrecen soporte y mantenimiento?'
);

-- ------------------------------------------------------------
-- golden_examples (3, aprobados)
-- ------------------------------------------------------------
insert into public.golden_examples (tenant_id, category, user_question, ideal_answer, rationale, embedding, is_approved, source)
select '00000000-0000-0000-0000-000000000001', 'precio',
       '¿Cuánto cuesta una página web?',
       'Depende del alcance. Una landing parte desde S/ 1,900 y un SaaS a medida se cotiza tras diagnóstico gratuito. ¿Quieres que te agende una llamada?',
       'Responder con rango y escalar a llamada; nunca fijar precios ajenos al catálogo.',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768), true, 'manual'
where not exists (
  select 1 from public.golden_examples
  where tenant_id = '00000000-0000-0000-0000-000000000001' and user_question = '¿Cuánto cuesta una página web?'
);

insert into public.golden_examples (tenant_id, category, user_question, ideal_answer, rationale, embedding, is_approved, source)
select '00000000-0000-0000-0000-000000000001', 'fuera_catalogo',
       '¿Hacen apps móviles también?',
       'Sí, desarrollamos apps móviles y PWA conectadas al mismo backend. Te conecto con el equipo de soluciones para enviarte referencias.',
       'No confirmar catálogo inexistente; derivar a referencias y persona correcta.',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768), true, 'manual'
where not exists (
  select 1 from public.golden_examples
  where tenant_id = '00000000-0000-0000-0000-000000000001' and user_question = '¿Hacen apps móviles también?'
);

insert into public.golden_examples (tenant_id, category, user_question, ideal_answer, rationale, embedding, is_approved, source)
select '00000000-0000-0000-0000-000000000001', 'queja_insulto',
       'Ustedes son estafadores, me cobraron de más',
       'Lamento la molestia. Voy a escalar tu caso al área de soporte de inmediato para revisar tu factura y darte una respuesta clara hoy mismo.',
       'Jamás discutir ni pedir datos sensibles; activar handoff humano.',
       ARRAY_FILL(0.01::real, ARRAY[768])::vector(768), true, 'manual'
where not exists (
  select 1 from public.golden_examples
  where tenant_id = '00000000-0000-0000-0000-000000000001' and user_question = 'Ustedes son estafadores, me cobraron de más'
);