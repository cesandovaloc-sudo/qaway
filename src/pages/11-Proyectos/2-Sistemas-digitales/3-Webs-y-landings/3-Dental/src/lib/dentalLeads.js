import { hasSupabaseEnv, supabase } from "./supabaseClient";

const tableName = import.meta.env.VITE_SUPABASE_LEADS_TABLE || "dental_leads";

export async function createDentalLead(payload) {
  if (!hasSupabaseEnv || !supabase) {
    return {
      ok: false,
      mode: "missing_env",
      message: "Completa las variables de Supabase para guardar leads reales.",
    };
  }

  const { error } = await supabase.from(tableName).insert({
    full_name: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    age: payload.age,
    treatment_interest: payload.treatmentInterest,
    message: payload.message,
    accepted_privacy: payload.acceptedPrivacy,
    source: "landing-dental",
    created_at: new Date().toISOString(),
  });

  if (error) {
    return {
      ok: false,
      mode: "supabase_error",
      message: error.message || "No se pudo guardar el lead.",
    };
  }

  return {
    ok: true,
    mode: "inserted",
    message: "Tu evaluacion fue registrada correctamente.",
  };
}
