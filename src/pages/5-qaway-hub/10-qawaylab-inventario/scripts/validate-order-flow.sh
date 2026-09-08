#!/usr/bin/env bash
# ============================================================
# Valida el flujo real de pedidos (orders/order_items/payments)
# contra Supabase con RLS: invitado, usuario y admin + storage.
#
# Uso:
#   Contra el proyecto local (dev): bash scripts/validate-order-flow.sh
#   Contra el proyecto real (tras aplicar las migraciones):
#     SUPABASE_URL=<url> SUPABASE_ANON_KEY=<anon> \
#     SUPABASE_SERVICE_ROLE_KEY=<service> bash scripts/validate-order-flow.sh
#
# Esperado: 16 ok / 0 fail. Los datos creados son de prueba
# (notas 'TEST *'), borrables desde el panel/SQL del proyecto.
# ============================================================

# Credenciales: prioridad a env vars, fallback a Supabase local (CLI)
if [ -n "$SUPABASE_URL" ]; then
  URL=${SUPABASE_URL%/}
  ANON=$SUPABASE_ANON_KEY
  SERVICE=$SUPABASE_SERVICE_ROLE_KEY
else
  cd "$(dirname "$0")/.." 2>/dev/null || true
  URL=$(npx supabase status -o env 2>/dev/null | grep '^API_URL' | cut -d= -f2- | tr -d '"')
  ANON=$(npx supabase status -o env 2>/dev/null | grep '^ANON_KEY' | cut -d= -f2- | tr -d '"')
  SERVICE=$(npx supabase status -o env 2>/dev/null | grep '^SERVICE_ROLE_KEY' | cut -d= -f2- | tr -d '"')
  # Esperar readiness solo en localhost
  for i in $(seq 1 40); do
    AH=$(curl -s -o /dev/null -w '%{http_code}' "${URL:-http://localhost:54321}/auth/v1/health")
    SH=$(curl -s -o /dev/null -w '%{http_code}' "${URL:-http://localhost:54321}/storage/v1/bucket")
    [ "$AH" = "200" ] && [ "$SH" != "502" ] && [ "$SH" != "000" ] && break
    sleep 2
  done
fi
URL=${URL:-http://localhost:54321}
PASS=0; FAIL=0
ok(){ echo "  PASS $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL $1"; FAIL=$((FAIL+1)); }

echo "Target: $URL"

# 1) Tablas accesibles
for t in orders order_items payments; do
  C=$(curl -s -o /dev/null -w '%{http_code}' "$URL/rest/v1/$t?select=id&limit=1" -H "apikey: $ANON" -H "Authorization: Bearer $ANON")
  [ "$C" = "200" ] && ok "tabla $t accesible" || bad "tabla $t: HTTP $C"
done

# 2) Pedido de INVITADO — id explicito y SIN returning (como el modulo v0.3.0)
GUEST_ID=$(node -e "console.log('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'.replace(/[abce]/g, x => '0123456789abcdef'[Math.floor(Math.random()*16)]))")
RESP=$(curl -s -X POST "$URL/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d "{\"id\":\"$GUEST_ID\",\"user_id\":null,\"total\":249.9,\"payment_method\":\"yape\",\"status\":\"pending\",\"notes\":\"TEST guest\"}")
[ -n "$GUEST_ID" ] && ok "guest crea order (id $GUEST_ID)" || bad "guest crea order: $RESP"
C=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/rest/v1/order_items" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d "{\"order_id\":\"$GUEST_ID\",\"product_type\":\"physical\",\"product_title\":\"Zapatilla Test\",\"quantity\":1,\"unit_price\":249.9,\"subtotal\":249.9}")
[ "$C" = "201" ] && ok 'guest crea order_items' || bad "order_items: HTTP $C"
C=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/rest/v1/payments" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' -d "{\"id\":\"$(node -e "console.log('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff'.replace(/[bce]/g, x => '0123456789abcdef'[Math.floor(Math.random()*16)]))")\",\"user_id\":null,\"order_id\":\"$GUEST_ID\",\"amount\":249.9,\"provider\":\"manual\",\"status\":\"pending\"}")
[ "$C" = "201" ] && ok 'guest crea payment' || bad "payment: HTTP $C"
NG=$(curl -s "$URL/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).length)}catch{console.log('ERR')}})")
[ "$NG" = "0" ] && ok 'guest NO puede leer NINGUNA order (PII protegida)' || bad "guest lee $NG orders"

# 3) Usuario autenticado (con returning, como el modulo)
curl -s -X POST "$URL/auth/v1/signup" -H "apikey: $ANON" -H 'Content-Type: application/json' -d '{"email":"comprador@test.local","password":"Test1234!"}' > /dev/null
TOK2=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $ANON" -H 'Content-Type: application/json' -d '{"email":"comprador@test.local","password":"Test1234!"}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).access_token||'')}catch{console.log('')}})")
UID2=$(curl -s "$URL/auth/v1/user" -H "apikey: $ANON" -H "Authorization: Bearer $TOK2" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).id||'')}catch{console.log('')}})")
[ -n "$TOK2" ] && ok 'sign-in comprador' || bad 'sign-in comprador'
C=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $TOK2" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d "{\"user_id\":\"$UID2\",\"total\":99.0,\"payment_method\":\"directo\",\"status\":\"pending\"}")
[ "$C" = "201" ] && ok 'usuario crea order propia (con returning)' || bad "usuario crea order: HTTP $C"
N2=$(curl -s "$URL/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $TOK2" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).length)}catch{console.log('ERR')}})")
[ "$N2" = "1" ] && ok 'usuario ve SOLO su order (1)' || bad "usuario ve $N2"

# 4) Admin ve todas (requiere rol admin en public.users)
ADMINID=$(curl -s -X POST "$URL/auth/v1/admin/users" -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" -H 'Content-Type: application/json' -d '{"email":"adminx@test.local","password":"Test1234!","email_confirm":true}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).id||'')}catch{console.log('')}})")
[ -n "$ADMINID" ] && ok 'admin user creado (service)' || bad 'admin user: fallo'
C=$(curl -s -o /dev/null -w '%{http_code}' -X PATCH "$URL/rest/v1/users?id=eq.$ADMINID" -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"role":"admin"}')
[ "$C" = "200" ] && ok 'promover a admin (service role, trigger ok)' || bad "promover admin: HTTP $C"
TOKA=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $ANON" -H 'Content-Type: application/json' -d '{"email":"adminx@test.local","password":"Test1234!"}' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).access_token||'')}catch{console.log('')}})")
[ -n "$TOKA" ] && ok 'sign-in admin' || bad 'sign-in admin'
NA=$(curl -s "$URL/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $TOKA" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{console.log(JSON.parse(s).length)}catch{console.log('ERR')}})")
[ "$NA" -ge "2" ] && ok "admin ve TODAS las orders (>=2)" || bad "admin ve $NA"

# 5) Storage bucket resources (anon sube voucher y URL publica responde)
sleep 5
KEY=$(curl -s -X POST "$URL/storage/v1/object/resources/validate-$(date +%s).txt" -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: text/plain' -d 'ok' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{try{const k=JSON.parse(s).Key||'';console.log(k.split('/').slice(1).join('/'))}catch{console.log('')}})")
[ -n "$KEY" ] && ok "anon sube voucher ($KEY)" || bad 'subida voucher'
C=$(curl -s -o /dev/null -w '%{http_code}' "$URL/storage/v1/object/public/resources/$KEY")
[ "$C" = "200" ] && ok 'URL publica responde' || bad "URL publica HTTP $C"

echo
echo "RESULTADO: $PASS ok / $FAIL fail"
exit $FAIL
