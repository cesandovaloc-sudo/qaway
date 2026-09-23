// ingest-historical-data · Fase 2 scaffold — agente-supabase
// Onboarding de cliente: DB, JSON o CSV → knowledge_base + conversaciones históricas.
// Validación y conteo hoy; el parser real se implementa en Fase 2.2 con credenciales.
import { createClient } from "npm:@supabase/supabase-js@^2";

Deno.serve(async (req) => {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    const { tenant_id, entries } = await req.json();
    if (!tenant_id) return Response.json({ error: "tenant_id requerido" }, { status: 400 });
    const list: any[] = Array.isArray(entries) ? entries : [entries];
    if (list.length === 0) return Response.json({ ok: true, inserted: 0 });

    let inserted = 0;
    for (const it of list) {
      const title = it.title ?? it.question ?? `Ingreso ${inserted + 1}`;
      const content = it.content ?? it.answer ?? "";
      const category = it.category ?? "onboarding";
      // TODO(Fase 2.2): parser CSV/XLSX + embedding real + idempotencia por hash.
      const { error } = await supabase.from("knowledge_base").insert({
        tenant_id,
        title,
        category,
        content,
        embedding: null,
        metadata: { source: "ingest-historical-data", is_demo: false },
        is_active: true,
      });
      if (!error) inserted++;
    }
    return Response.json({ ok: true, inserted, tenant_id });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
});