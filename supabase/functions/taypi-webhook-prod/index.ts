import { Taypi } from "npm:taypi.pe";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TAYPI_PUBLIC_KEY = Deno.env.get("TAYPI_PROD_PUBLIC_KEY");
const TAYPI_SECRET_KEY = Deno.env.get("TAYPI_PROD_SECRET_KEY");
const TAYPI_WEBHOOK_SECRET = Deno.env.get("TAYPI_PROD_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, taypi-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Método no permitido", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    if (!TAYPI_PUBLIC_KEY || !TAYPI_SECRET_KEY) {
      console.error("Faltan credenciales TAYPI PROD");
      return new Response("Configuración incompleta", {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!TAYPI_WEBHOOK_SECRET) {
      console.error("Falta TAYPI_PROD_WEBHOOK_SECRET");
      return new Response("Webhook secret faltante", {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Faltan credenciales de Supabase");
      return new Response("Configuración incompleta", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("taypi-signature") || "";

    if (!signature) {
      console.error("Falta Taypi-Signature");
      return new Response("Firma requerida", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const taypi = new Taypi(
      TAYPI_PUBLIC_KEY,
      TAYPI_SECRET_KEY,
      {
        sandbox: false,
      },
    );

    const isValid = taypi.verifyWebhook(
      rawBody,
      signature,
      TAYPI_WEBHOOK_SECRET,
    );

    if (!isValid) {
      console.error("Firma TAYPI inválida");
      return new Response("Firma inválida", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(rawBody);
    console.log("TAYPI WEBHOOK PROD:", event);

    if (event.event !== "payment.completed") {
      return new Response(
        JSON.stringify({
          received: true,
          ignored: true,
          event: event.event || null,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const paymentId = String(event.payment_id || "");
    const orderId = String(event.reference || "");
    const eventAmount = Number(event.amount);

    if (!orderId) {
      console.error("TAYPI webhook sin reference/orderId:", event);
      return new Response(
        JSON.stringify({ received: true, error: "Falta reference" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // ── Idempotencia: Verificar si el pago ya fue completado ─────────────
    if (paymentId) {
      const { data: pagoExistente } = await supabase
        .from("payments")
        .select("id, status")
        .eq("provider", "taypi")
        .eq("provider_id", paymentId)
        .eq("status", "completed")
        .limit(1);

      if (pagoExistente && pagoExistente.length > 0) {
        console.log("Pago TAYPI ya completado previamente (idempotente):", paymentId);
        return new Response(
          JSON.stringify({ received: true, repeated: true, payment_id: paymentId }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // ── Buscar la orden usando event.reference ───────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Error al buscar orden:", orderError);
      return new Response(
        JSON.stringify({ received: true, error: "Error al consultar orden" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!order) {
      console.error("Orden no encontrada para reference:", orderId);
      return new Response(
        JSON.stringify({ received: true, error: "Orden no encontrada" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Si la orden ya está pagada
    if (order.status === "paid") {
      console.log("Orden ya marcada como paid (idempotente):", orderId);
      if (paymentId) {
        await supabase
          .from("payments")
          .update({ status: "completed" })
          .eq("provider", "taypi")
          .eq("provider_id", paymentId);
      }
      return new Response(
        JSON.stringify({ received: true, repeated: true, order_id: orderId }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // ── Verificar que event.amount coincida con el total de la orden ─────
    const orderTotalCents = Math.round(Number(order.total) * 100);
    const eventAmountCents = Math.round(eventAmount * 100);

    if (!Number.isFinite(eventAmountCents) || orderTotalCents !== eventAmountCents) {
      console.error("MONTO DISCREPANTE TAYPI PROD:", {
        orderTotal: order.total,
        orderTotalCents,
        eventAmount,
        eventAmountCents,
      });
      return new Response(
        JSON.stringify({
          received: true,
          error: "El monto no coincide con la orden",
          expected: order.total,
          received_amount: eventAmount,
        }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // ── Actualizar registro correspondiente de payments a completed ──────
    let paymentRecordId: string | null = null;

    if (paymentId) {
      const { data: payByPid } = await supabase
        .from("payments")
        .select("id")
        .eq("provider", "taypi")
        .eq("provider_id", paymentId)
        .maybeSingle();
      if (payByPid?.id) paymentRecordId = payByPid.id;
    }

    if (!paymentRecordId) {
      const { data: payByOrder } = await supabase
        .from("payments")
        .select("id")
        .eq("provider", "taypi")
        .eq("order_id", orderId)
        .maybeSingle();
      if (payByOrder?.id) paymentRecordId = payByOrder.id;
    }

    if (paymentRecordId) {
      const { error: errPayUpdate } = await supabase
        .from("payments")
        .update({
          status: "completed",
          provider_id: paymentId,
          amount: eventAmount,
        })
        .eq("id", paymentRecordId);

      if (errPayUpdate) {
        console.error("Error al actualizar payment a completed:", errPayUpdate);
        return new Response(
          JSON.stringify({ received: true, error: "Error al actualizar pago" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    } else {
      const { error: errPayInsert } = await supabase.from("payments").insert({
        order_id: orderId,
        provider: "taypi",
        provider_id: paymentId,
        amount: eventAmount,
        currency: "PEN",
        status: "completed",
      });

      if (errPayInsert) {
        console.error("Error al registrar payment completed:", errPayInsert);
        return new Response(
          JSON.stringify({ received: true, error: "Error al registrar pago" }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }

    // ── Actualizar la orden a paid ───────────────────────────────────────
    const { error: errOrderUpdate } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (errOrderUpdate) {
      console.error("Error al actualizar order a paid:", errOrderUpdate);
      return new Response(
        JSON.stringify({ received: true, error: "Error al marcar orden pagada" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    console.log("TAYPI PROD: Pago confirmado y orden pagada con éxito:", {
      orderId,
      paymentId,
      amount: eventAmount,
    });

    return new Response(
      JSON.stringify({
        received: true,
        success: true,
        event: "payment.completed",
        payment_id: paymentId,
        order_id: orderId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("TAYPI WEBHOOK PROD ERROR:", error);
    return new Response(
      JSON.stringify({
        received: false,
        error: error instanceof Error ? error.message : "Error interno",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
