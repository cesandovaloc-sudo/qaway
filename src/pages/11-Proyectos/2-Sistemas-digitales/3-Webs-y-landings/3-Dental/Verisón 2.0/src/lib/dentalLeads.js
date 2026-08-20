import { hasSupabaseEnv, supabase } from "./supabaseClient";

const tableName = import.meta.env.VITE_SUPABASE_LEADS_TABLE || "dental_leads";

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function createDentalLead(payload) {
  if (!hasSupabaseEnv || !supabase) {
    return {
      ok: false,
      mode: "missing_env",
      message: "La landing está lista. Configura las variables de Supabase para activar el envío real.",
    };
  }

  const lead = {
    full_name: clean(payload.fullName, 120),
    phone: clean(payload.phone, 32),
    email: clean(payload.email, 160).toLowerCase(),
    age: payload.age ? Number(payload.age) : null,
    treatment_interest: clean(payload.treatmentInterest, 100),
    message: clean(payload.message, 1200),
    accepted_privacy: Boolean(payload.acceptedPrivacy),
    source: "landing-dental-v2",
  };

  const { error } = await supabase.from(tableName).insert(lead);

  if (error) {
    return {
      ok: false,
      mode: "supabase_error",
      message: "No pudimos registrar tu solicitud. Inténtalo nuevamente en unos minutos.",
    };
  }

  return {
    ok: true,
    mode: "inserted",
    message: "Recibimos tu solicitud. Muy pronto nos pondremos en contacto contigo.",
  };
}
