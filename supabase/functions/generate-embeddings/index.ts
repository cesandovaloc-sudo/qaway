// generate-embeddings · Fase 2 scaffold — agente-supabase
// Job batch nocturno: rellena embedding (vector(768)) en
// knowledge_base / faqs / golden_examples / message_embeddings donde sea null.
// Dimensión fija 768 (Gemini text-embedding-004). Proveedor por env.
import { createClient } from "npm:@supabase/supabase-js@^2";

const DIM = 768;

Deno.serve(async (req) => {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const tables = [
    { name: "knowledge_base", text: (r: any) => `${r.title} ${r.content}` },
    { name: "faqs", text: (r: any) => `${r.question} ${r.answer}` },
    { name: "golden_examples", text: (r: any) => `${r.user_question} ${r.ideal_answer}` },
  ];

  const stats: Record<string, { processed: number; failed: number }> = {};

  for (const t of tables) {
    stats[t.name] = { processed: 0, failed: 0 };
    const { data: rows, error } = await supabase
      .from(t.name)
      .select("id,title,content,question,answer,user_question,ideal_answer")
      .is("embedding", null)
      .limit(50);

    if (error || !rows) continue;

    for (const row of rows) {
      const vec = await embed(t.text(row));
      if (!vec) { stats[t.name].failed++; continue; }
      const { error: up } = await supabase.from(t.name).update({ embedding: vec }).eq("id", row.id);
      if (up) stats[t.name].failed++; else stats[t.name].processed++;
    }
  }

  // message_embeddings: sólo mensajes sin embedding aún
  stats.message_embeddings = { processed: 0, failed: 0 };
  const { data: msgs } = await supabase
    .from("messages")
    .select("id,text")
    .is("id", null) // placeholder: mensajes pendientes se marcan por message_embeddings
    .limit(50);
  // TODO(Fase 2.2): conectar join message_embeddings(message_id is null) y generar.

  return Response.json({
    ok: true,
    dim: DIM,
    provider: Deno.env.get("EMBEDDING_PROVIDER") ?? "gemini",
    model: Deno.env.get("EMBEDDING_MODEL") ?? "text-embedding-004",
    stats,
  });
});

// Fail-closed: sin credenciales NO se escribe NADA (evita polución de 0.01
// sobre datos reales). Con credenciales, Fase 2.2 implementa HTTP a Gemini/OpenAI.
async function embed(text: string): Promise<number[] | null> {
  const key = Deno.env.get("LLM_API_KEY");
  if (!key) {
    console.warn("LLM_API_KEY ausente — batch omitido (fail-closed)");
    return null;
  }
  // TODO(Fase 2.2): llamada real al proveedor (EMBEDDING_PROVIDER/MODEL).
  void text;
  return null;
}