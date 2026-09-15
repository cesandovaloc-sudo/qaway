/**
 * taypi-pago-test — crea un pago en TAYPI Sandbox y registra el pendiente.
 *
 * MODELO A (aprobado): esta función es el ÚNICO escritor del pago de pasarela.
 * El navegador envía SOLO `{ orderId }`. El importe se recalcula aquí desde
 * `order_items`, nunca se acepta del cliente.
 *
 * Contrato:
 *   ENTRADA  { orderId }
 *   SALIDA   { success, orderId, payment_id, status, amount, currency,
 *              reference, checkout_token, checkout_url, qr_code, qr_image,
 *              expires_at, created_at }
 *
 * Credenciales: TAYPI_TEST_PUBLIC_KEY, TAYPI_TEST_SECRET_KEY y, para la
 * escritura en el núcleo, SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (inyectados
 * por defecto en todo proyecto Supabase).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_TEST_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_TEST_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const TAYPI_BASE_URL = "https://sandbox.taypi.pe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Método no permitido" }, 405);
  }

  try {
    if (!TAYPI_PUBLIC_KEY || !TAYPI_SECRET_KEY) {
      return jsonResponse(
        { success: false, error: "Faltan las credenciales de TAYPI" },
        500,
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return jsonResponse(
        { success: false, error: "Faltan las credenciales de Supabase" },
        500,
      );
    }

    // ── 1. Entrada: SOLO orderId ──────────────────────────────────────────
    const body = await req.json();

    const orderId =
      typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!orderId) {
      return jsonResponse(
        { success: false, error: "Falta orderId" },
        400,
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── 2. La orden y su importe salen de la base (nunca del navegador) ────
    const { data: orden, error: ordenError } = await supabase
      .from("orders")
      .select("id, user_id")
      .eq("id", orderId)
      .maybeSingle();

    if (ordenError) {
      console.error("ORDEN ERROR:", ordenError);
      return jsonResponse(
        { success: false, error: "No se pudo leer la orden" },
        500,
      );
    }

    if (!orden) {
      return jsonResponse(
        { success: false, error: "La orden no existe" },
        404,
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("unit_price, quantity")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("ITEMS ERROR:", itemsError);
      return jsonResponse(
        { success: false, error: "No se pudieron leer los ítems de la orden" },
        500,
      );
    }

    if (!items || items.length === 0) {
      return jsonResponse(
        { success: false, error: "La orden no tiene ítems" },
        409,
      );
    }

    const total =
      Math.round(
        items.reduce(
          (suma, item) =>
            suma + Number(item.unit_price || 0) * Number(item.quantity || 1),
          0,
        ) * 100,
      ) / 100;

    if (!Number.isFinite(total) || total <= 0) {
      return jsonResponse(
        { success: false, error: "La orden no tiene un importe válido" },
        409,
      );
    }

    // El importe NO se acepta del cliente. Si llega uno, solo se usa para
    // detectar una incoherencia y abortar: nunca como fuente de verdad.
    if (body?.amount != null) {
      const enviado = Math.round(Number(body.amount) * 100);
      if (!Number.isFinite(enviado) || enviado !== Math.round(total * 100)) {
        console.error("MONTO INCOHERENTE:", body.amount, "vs", total);
        return jsonResponse(
          { success: false, error: "El monto no coincide con la orden" },
          409,
        );
      }
    }

    // ── 3. Crear el pago en TAYPI Sandbox ─────────────────────────────────
    const path = "/api/v1/payments";
    const method = "POST";

    const reference = orderId;
    const description = `Pedido ${orderId.slice(0, 8)} · Qaway Lab`;

    const payload = JSON.stringify({
      amount: total.toFixed(2),
      currency: "PEN",
      reference,
      description,
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Manifiesto firmado por TAYPI: {timestamp}\n{method}\n{path}\n{body}
    const signatureString = [timestamp, method, path, payload].join("\n");

    const encoder = new TextEncoder();

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(TAYPI_SECRET_KEY),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(signatureString),
    );

    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    // Idempotency-Key ESTABLE por orden: un reintento del navegador debe
    // recuperar el MISMO pago de TAYPI, no crear uno nuevo.
    const idempotencyKey = `taypi-${orderId}`;

    const response = await fetch(`${TAYPI_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAYPI_PUBLIC_KEY}`,
        "Taypi-Signature": signature,
        "Taypi-Timestamp": timestamp,
        "Idempotency-Key": idempotencyKey,
      },
      body: payload,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("TAYPI API ERROR:", result);

      return jsonResponse(
        {
          success: false,
          error: result?.message || "TAYPI rechazó la creación del pago",
          code: result?.code || null,
        },
        response.status,
      );
    }

    const payment = result?.data;
    const paymentId = String(payment?.payment_id ?? "");

    if (!paymentId) {
      console.error("TAYPI sin payment_id:", result);

      return jsonResponse(
        { success: false, error: "TAYPI no devolvió payment_id" },
        502,
      );
    }

    // ── 4. Registrar el pendiente en `payments` (núcleo existente) ────────
    // Una sola fila por pago TAYPI. Se comprueba por (provider, provider_id)
    // en lugar de usar upsert: el índice único de esa clave es PARCIAL y
    // ON CONFLICT no puede inferirlo. Si dos peticiones simultáneas llegan a
    // insertar, el índice parcial actúa como red de seguridad.
    const { data: existente, error: existenteError } = await supabase
      .from("payments")
      .select("id")
      .eq("provider", "taypi")
      .eq("provider_id", paymentId)
      .maybeSingle();

    if (existenteError) {
      console.error("PAYMENTS SELECT ERROR:", existenteError);
    }

    if (existente?.id) {
      const { error: updateError } = await supabase
        .from("payments")
        .update({ amount: total, status: "pending" })
        .eq("id", existente.id);

      if (updateError) {
        console.error("PAYMENTS UPDATE ERROR:", updateError);
      }
    } else {
      const { error: insertError } = await supabase.from("payments").insert({
        order_id: orderId,
        user_id: orden.user_id ?? null,
        provider: "taypi",
        provider_id: paymentId,
        amount: total,
        currency: "PEN",
        status: "pending",
      });

      if (insertError) {
        console.error("PAYMENTS INSERT ERROR:", insertError);
      }
    }

    // ── 5. Respuesta al frontend ──────────────────────────────────────────
    return jsonResponse(
      {
        success: true,
        orderId,
        payment_id: paymentId,
        status: payment?.status,
        amount: total,
        currency: payment?.currency ?? "PEN",
        reference: payment?.reference ?? reference,
        checkout_token: payment?.checkout_token,
        checkout_url: payment?.checkout_url,
        qr_code: payment?.qr_code,
        qr_image: payment?.qr_image,
        expires_at: payment?.expires_at,
        created_at: payment?.created_at,
      },
      200,
    );
  } catch (error) {
    console.error("TAYPI ERROR:", error);

    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error interno",
      },
      500,
    );
  }
});
