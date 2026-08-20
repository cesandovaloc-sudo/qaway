import { createClient } from "@supabase/supabase-js";

type OrderPayload = {
  customerName?: unknown; phone?: unknown; district?: unknown; address?: unknown; promotionChoice?: unknown; paymentMethod?: unknown; notes?: unknown;
  items?: Array<{ productId?: unknown; name?: unknown; quantity?: unknown; unitPriceCents?: unknown }>;
};

function orderNumber() { return `MS-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }

export async function POST(request: Request) {
  const payload = await request.json() as OrderPayload;
  if (!payload.customerName || !payload.phone || !payload.district || !payload.address || !payload.promotionChoice || !Array.isArray(payload.items) || !payload.items.length) return Response.json({ error: "Faltan datos obligatorios del pedido." }, { status: 400 });
  if (!["discount", "delivery"].includes(String(payload.promotionChoice))) return Response.json({ error: "El beneficio elegido no es válido." }, { status: 400 });
  const number = orderNumber();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ orderNumber: number, mode: "preview" });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: order, error } = await supabase.from("orders").insert({ order_number: number, customer_name: String(payload.customerName), phone: String(payload.phone), district: String(payload.district), address: String(payload.address), promotion_choice: String(payload.promotionChoice), payment_method: String(payload.paymentMethod ?? "coordinate"), notes: payload.notes ? String(payload.notes) : null, status: "pending_confirmation" }).select("id").single();
  if (error || !order) return Response.json({ error: "No se pudo registrar el pedido." }, { status: 500 });
  const itemRows = payload.items.map((item) => ({ order_id: order.id, product_id: String(item.productId), product_name: String(item.name), quantity: Number(item.quantity), unit_price_cents: item.unitPriceCents == null ? null : Number(item.unitPriceCents) }));
  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) return Response.json({ error: "El pedido se creó, pero faltó registrar sus productos." }, { status: 500 });
  return Response.json({ orderNumber: number });
}
