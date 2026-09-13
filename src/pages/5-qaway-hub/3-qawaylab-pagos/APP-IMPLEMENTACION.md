# App / Implementación — Carrito funcional, candado Producto vs Servicio y Pago real

Módulo: `src/pages/5-qaway-hub/3-qawaylab-pagos`
Rama: `main-web` · Repo: `1-qawaylab-web`
Estado: **Fases 1 y 2 APLICADAS** + **bloque de Beneficios optimizado** (2026-09-13). Fases 3-5 y Parte B pendientes.
Bitácora hermana: `ITERACION-CARRITO.md`

---

## 0. Puntos esenciales de esta iteración

1. **Duplicado de 2 cuadros en el carrito: CONFIRMADO.** Causa raíz localizada y distinta a la reportada en un punto clave.
2. **No es solo el `localStorage` de la landing.** El duplicado se reproduce *incluso sin* la landing, por carrera de carga entre `SAMPLE_PRODUCTS` y `dbProducts` de Supabase.
3. **Candado de Servicio existe a medias:** `PagosAppPage.addToCart` ya bloquea re-agregar servicios, pero el bloqueo **falla por identidad** y **no existe en la UI** (`CartItems` muestra `+` / `−` para todo).
4. **El panel de productos de Pagos SÍ separa Producto vs Servicio** (form + listado) — pero **no está enrutado**: `ProductsManager` y `PaymentsPanel` se importan en `PagosAppPage.jsx:7-8` y nunca se renderizan. No hay panel accesible.
5. **El panel de Inventario NO puede separar Producto vs Servicio con `type`**: ahí `type` significa `simple | variant | composite` (estructura), no naturaleza comercial. El diagnóstico asume `service`/`physical` en esa tabla: **no aplica**.
6. **"Carrito funcional" tiene dos capas distintas**: (A) carrito + pedido (lógica, resoluble ya) y (B) cobro real (Mercado Pago). La capa B es la que hoy impide que el carrito *cobre*; ver Parte B.
7. Regla de negocio **ambigua y bloqueante**: "no más de dos compras del mismo servicio" — ver §5, pregunta 1.
8. Nada de esto toca diseño: solo lógica de datos, botones existentes y etiquetas.

---

## 1. Verificación del diagnóstico (archivo por archivo)

### 1.1 Duplicado: por qué aparecen 2 cuadros con `?add=one-web`

**Camino real, en orden de ejecución:**

| # | Qué pasa | Archivo · línea |
|---|----------|-----------------|
| 1 | El botón del plan guarda un objeto con `id: 'one-web'` en `localStorage.qaway_cart` | `8-desarollo web/components/QawayPricingSection.jsx:46-49` |
| 2 | Navega con `?add=one-web` | `QawayPricingSection.jsx:54` |
| 3 | Primer render: `dbProducts = []` → el pool cae a `SAMPLE_PRODUCTS` | `PagosAppPage.jsx:219` |
| 4 | Encuentra el estático (`id: 'one-web'`) y lo agrega | `PagosAppPage.jsx:220-232` |
| 5 | Supabase responde y `setDbProducts(...)` | `PagosAppPage.jsx:191-212` |
| 6 | El `useEffect` **se re-ejecuta** porque depende de `dbProducts` | `PagosAppPage.jsx:234` |
| 7 | Ahora encuentra el mismo producto con **UUID de Supabase** | `PagosAppPage.jsx:220-222` |
| 8 | `addToCart` compara `'one-web' === '<uuid>'` → `false` → **inserta segunda fila** | `PagosAppPage.jsx:238-249` |

**Conclusión:** hay **tres** causas que se suman:
- **(a) Carrera de carga** (`SAMPLE_PRODUCTS` antes de que llegue Supabase) — el efecto se dispara dos veces con dos identidades distintas. *Esta es la causa principal y sobrevive aunque se borre el `localStorage`.*
- **(b) Doble fuente de verdad** (`localStorage` de la landing **y** `?add=` parametrizado) — introduce una identidad provisional con `id` estático.
- **(c) Ausencia de clave canónica** — `addToCart` solo compara `id`.

Corrección al diagnóstico recibido: el punto (a) no estaba contemplado y es el que garantiza el bug incluso en un usuario nuevo.

### 1.2 Candado de Servicio: dónde está y dónde falta

- **Existe (parcial)** en `PagosAppPage.jsx:241-243`: si el ítem ya existe y es `service`/`course`, retorna `prev` (no incrementa). Correcto en intención.
- **Falla** porque nunca reconoce el ítem como "el mismo" (§1.1).
- **No existe en la UI**: `CartItems.jsx:57-72` renderiza `−` / `+` sin condición. El usuario puede subir un servicio a 2, 3, N unidades manualmente. La observación es correcta.
- **Riesgo adicional:** `updateQuantity` (`PagosAppPage.jsx:252-260`) no valida tipo. Ahí hay que poner el candado real, no solo en el render.

### 1.3 Panel de Productos — corrección importante

**a) Panel de Pagos (`3-qawaylab-pagos/admin/ProductsManager.jsx`) — SÍ separa, pero está desconectado.**
- Ya tiene el desplegable de tipo: `course / digital / service / physical` (`ProductsManager.jsx:3-8`).
- Ya muestra la etiqueta en el listado con precio, stock y categoría (`ProductsManager.jsx:196-199`).
- **Problema:** `PagosAppPage.jsx` lo importa (línea 8) pero **no define ninguna `<Route>` para el admin**. Solo existen `carrito`, `checkout`, `purchases` (`PagosAppPage.jsx:281-343`). El panel solo es visible en `demo/src/App.jsx:264`.
- **Acción:** exponer el admin requiere una ruta nueva (y decidir protección por rol).

**b) Panel de Inventario (`10-qawaylab-inventario/src/components/products/ProductTable.tsx`) — la propuesta no aplica.**
- En ese módulo `type` es `'simple' | 'variant' | 'composite'` (`src/types/index.ts:32`) = **estructura del producto**, no Producto vs Servicio.
- La categoría muestra `p.category_id`, que es un **UUID FK** (`ProductTable.tsx:55`), no un nombre. El `—` aparece porque el UUID no se resuelve, no porque sea un servicio.
- **No existe** un campo "servicio" en la tabla `products` del inventario (`20260813000001_baseline_inventario.sql`).
- **Conclusión:** separar Producto vs Servicio en Inventario es un **cambio de esquema** (columna nueva o usar `categories`), no un ajuste de render. Decisión en §5, pregunta 3.
- Nota: los servicios de la landing (`one-web`, etc.) viven en la tabla `products` de **Pagos**, que es otro esquema. Ojo: `PagosAppPage.jsx` consulta `status === 'active'`, mientras ese esquema tiene `check (status in ('active','draft','archived'))` (`3-qawaylab-pagos/supabase/00001_schema.sql:70`) y el admin crea con `status: 'draft'` (`ProductsManager.jsx:81`). Si el producto está en `draft`, el pool cae al `SAMPLE_PRODUCTS` y reaparece el punto (a).

### 1.4 Regla "no más de 2 compras del mismo servicio por usuario"

Hoy **no existe en ninguna capa**: ni cliente, ni RLS, ni trigger. El carrito es `localStorage` sin validación contra el historial (`orders` / `order_items`). Ver §5, pregunta 1 antes de implementar: el número 2 y su alcance deben confirmarse.

---

## 2. Diseño técnico de la solución (sin parches)

### 2.1 Clave canónica de línea de carrito — fuente única de verdad

En `components/storefront/utils.js` agregar un helper y usarlo en **todos** los puntos de mutación:

```js
// Identidad canónica de un ítem de carrito. Un producto es "el mismo"
// si comparte sku, slug o id, en ese orden de prioridad.
export function itemKey(item) {
  return String(item?.sku || item?.slug || item?.id || item?.product_id || '')
}
```

Motivo de diseño: el carrito hoy guarda y compara por `id`, que **cambia según la fuente** (estático `one-web` vs UUID de Supabase). La clave canónica elimina la ambigüedad de raíz en lugar de añadir un `if` por caso.

Puntos que deben consumir `itemKey`: `PagosAppPage.addToCart` / `updateQuantity` / `removeFromCart` (`236-264`) y el `key` + callbacks de `CartItems` (`33, 60, 67, 79`). La forma del objeto en `localStorage` **no cambia** (compatible con carritos ya guardados).

### 2.2 Resolución determinista del `?add=`

Reemplazar el `useEffect` actual (`PagosAppPage.jsx:214-234`) por uno que:
1. Espere a que el catálogo esté cargado (flag `productsLoaded`) antes de resolver el slug.
2. Resuelva contra **un solo** pool (el del catálogo vigente), no contra `dbProducts ?? SAMPLE_PRODUCTS`.
3. Marque el slug como ya procesado (ref) para que recargas de `location.search` no reinyecten.
4. Limpie el parámetro con `navigate(location.pathname, { replace: true })` al terminar.

### 2.3 Candado de Servicio (doble barrera)

- **Barrera de datos** (autoritativa): en `addToCart`, si el ítem es `service`/`course` y ya existe por `itemKey`, **no inserta ni incrementa** (comportamiento ya previsto, ahora sí efectivo).
- **Barrera de escritura**: en `updateQuantity`, si el ítem es `service`/`course`, ignorar cualquier qty ≠ 1. Bloquea el intento aunque la UI falle.
- **Barrera visual** (solo etiquetas, sin romper diseño): en `CartItems.jsx`, para `service`/`course`/`digital` reemplazar el control `− qty +` por una etiqueta sobria tipo `Servicio único` reutilizando las clases existentes de la fila. Se conserva el botón `Retirar`.
- La cantidad de servicios ya nace en 1 (`QawayPricingSection.jsx:18,28,38`); estas barreras solo lo hacen cumplir.

### 2.4 Eliminar la doble fuente de verdad

En `QawayPricingSection.jsx:45-53` quitar la escritura directa a `localStorage` y dejar `?add=` como única vía. Aplicar lo mismo al patrón duplicado en `QawayLeadContactForm.jsx:143-147`. La deduplicación por `itemKey` queda como red de seguridad, no como solución principal.

### 2.5 Límite por usuario (pendiente de confirmar)

Implementación correcta (no parche): **en base de datos**, no en el cliente. Un trigger sobre `order_items` (o una función `can_purchase_service(user_id, product_id)`) que cuente compras previas **pagadas** del mismo producto y rechace el INSERT al superar el límite. Se acompaña de una verificación en UI para avisar **antes** de confirmar, nunca como única defensa.

---

## 3. Plan de ejecución por fases

Cada fase es autónoma, verificable y sin efecto destructivo.

### Fase 1 — Deduplicación e identidad canónica (arregla los 2 cuadros)
- `components/storefront/utils.js` → nuevo `itemKey`.
- `PagosAppPage.jsx` → `addToCart` / `updateQuantity` / `removeFromCart` con `itemKey`; `?add=` determinista + limpieza de query.
- `components/storefront/CartItems.jsx` → `key` y callbacks con `itemKey`.
- `QawayPricingSection.jsx` → quitar escritura a `localStorage`.
- **Resultado verificable:** `/landings/desarrollo-web-qaway` → clic en plan → `/hub/pagos/carrito?add=one-web` muestra **1 solo cuadro**, y sigue mostrando 1 tras refrescar (F5).

### Fase 2 — Candado Producto vs Servicio
- `PagosAppPage.jsx` → `updateQuantity` bloquea qty ≠ 1 en `service`/`course`.
- `CartItems.jsx` → etiqueta `Servicio único` en lugar de `+`/`−` para `service`/`course`/`digital`.
- **Resultado verificable:** no hay forma de poner un servicio en 2 desde la UI.

### Fase 3 — Límite por usuario (tras responder §5-1)
- Migración Supabase (trigger/función) + aviso en `CartView`/`Checkout`.
- **Resultado verificable:** un 2.º (o 3.er) intento es rechazado por la base de datos.

### Fase 4 — Panel separado Producto vs Servicio
- `PagosAppPage.jsx` → ruta de admin que renderice `ProductsManager` (+ `PaymentsPanel`) bajo guard de rol admin.
- `ProductsManager.jsx` → filtro/agrupación visual por tipo (ya existe el dato; solo presentación).
- Inventario (`ProductTable.tsx`) → **solo si §5-3 lo confirma**; hoy no es viable sin cambio de esquema.
- **Resultado verificable:** panel accesible con Producto y Servicio claramente diferenciados.

### Fase 5 — Cobro real (Parte B, ver §4)

---

## 4. Parte B — Por qué el carrito todavía no cobra

Bloqueante independiente de las Fases 1-4, ya verificado:

- `Checkout.jsx:157-158` solo marca `provider: 'mercadopago'` en la fila `payments`; no hay redirección ni tokenización.
- `payments.js:165-182` (`createMercadoPagoPreference`) arma un objeto local, **sin `fetch`**, y **nadie lo llama**.
- `payments.js:184-188` (`simulateMercadoPagoWebhook`) marca el pago como completado a mano.
- Sin SDK, sin `api.mercadopago.com`, sin edge function de webhook (solo existe `webhook-whatsapp`).
- Sin credenciales: `.env.example` solo tiene `VITE_APP_NAME`.

**Requisitos para hacerlo real:** `VITE_MERCADOPAGO_PUBLIC_KEY` + `MERCADOPAGO_ACCESS_TOKEN` (estas jamás en el cliente), una edge function que cree la preferencia con el access token, `back_urls` apuntando a rutas reales, y un webhook que valide firma y llame a `updatePaymentStatus`. Sin credenciales del negocio no se puede completar: requiere que las proveas.

---

## 5. Decisiones que necesito antes de aplicar

1. **Límite por usuario:** ¿es **1 unidad por carrito** (visual) y **2 compras históricas por usuario** (regla de negocio)? ¿O el "2" era "no más de 1, expresado como no-duplicar"? ¿Aplica a todos los servicios o solo a los web (`one-web`, `web-comercial`, `tienda-online`)? ¿Cuentan pedidos `pending` o solo `paid`?
2. **Alcance de la Fase 4:** ¿habilito el panel de Pagos en `/hub/pagos/admin` con guard de rol admin en esta iteración, o se difiere?
3. **Inventario:** ¿confirmas que NO se toca `ProductTable.tsx` (su `type` es simple/variant/composite y `category_id` es UUID)? ¿O quieres que proponga la columna nueva para separar Producto vs Servicio ahí?
4. **Mercado Pago:** ¿entra en este ciclo o queda como fase siguiente? Necesito credenciales para que sea real.

---

## 6. Archivos que se tocarían (solo Fases 1 y 2, que son las aprobables ya)

| Archivo | Cambio | Rompe diseño |
|---------|--------|--------------|
| `components/storefront/utils.js` | + helper `itemKey` | No |
| `PagosAppPage.jsx` | identidad canónica, resolución `?add=`, candado en `updateQuantity` | No |
| `components/storefront/CartItems.jsx` | `itemKey` + etiqueta `Servicio único` | No (reutiliza estilos) |
| `8-desarollo web/components/QawayPricingSection.jsx` | quitar escritura a `localStorage` | No |

Sin `git reset`, sin `revert`, sin ramas nuevas, sin push. Commit global solo cuando el cambio esté proporcionado.

---

## 7. Iteración aplicada — Fases 1 y 2 (2026-09-13)

**Decisiones confirmadas:** 1 sola unidad por servicio en el carrito; Inventario (`ProductTable.tsx`) intacto; panel de Pagos diferido; Mercado Pago diferido; diseño, contenedores, espaciados y responsive sin alterar.

### Puntos esenciales

1. **Identidad canónica.** `itemKey(item)` = `sku → slug → id → product_id`, en `utils.js`. Un mismo producto resuelve a una sola clave venga del catálogo estático o de Supabase.
2. **Resolución determinista del `?add=`.** El efecto espera `productsLoaded` y la respuesta de Supabase, resuelve contra un único pool, marca el slug como procesado en `processedAddRef` y limpia el parámetro con `navigate(..., { replace: true })`. Se eliminó la ejecución doble que insertaba el servicio dos veces.
3. **Doble fuente de verdad eliminada.** `QawayPricingSection.jsx` ya no escribe en `localStorage`: solo navega con `?add=`. Se retiró el `productMap` (30 líneas de catálogo paralelo que quedaban sin uso).
4. **Candado de servicio, tres barreras:** en `addToCart` (no inserta ni incrementa), en `updateQuantity` (ignora qty ≠ 1, barrera autoritativa) y en `CartItems` (etiqueta `1 (Servicio único)` sin `+` / `−`, conservando "Retirar"). Aplica a `service` y `course`, según lo definido.
5. **Adición necesaria no prevista en el plan: `normalizeCart`.** Los carritos ya guardados con el duplicado habrían producido dos líneas con la misma `key` en React (render inestable, advertencia de clave duplicada) y totales inflados. `normalizeCart` colapsa por clave canónica y fuerza cantidad 1 en servicios al restaurar de `localStorage`. Sin esto, quien ya veía 2 cuadros habría seguido viendo 2.
6. **Diseño intacto.** Único cambio visual: en la fila de un servicio, el contenedor existente `.quantity-control` pasa de `− 1 +` a `1 (Servicio único)`. No se tocó CSS, contenedores, espaciados ni responsive.
7. **Compatibilidad con Inventario.** Inventario consume el módulo vía `file:../3-qawaylab-pagos` (symlink), así que los helpers nuevos llegan allí; son aditivos y su `CartItem` (`product_type: 'physical'`) no entra en el candado.
8. **Verificación:** `oxlint` sobre los 4 archivos → **0 errores** (11 avisos, todos preexistentes). Pendiente la prueba manual en navegador.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `components/storefront/utils.js` | + `itemKey`, `isSingleInstance`, `normalizeCart` |
| `PagosAppPage.jsx` | identidad canónica, `?add=` determinista, candado en `updateQuantity`, normalización al restaurar |
| `components/storefront/CartItems.jsx` | consumo de `itemKey`, etiqueta de servicio único |
| `QawayPricingSection.jsx` | eliminadas la escritura previa a `localStorage` y el `productMap` |

### Pendiente

- **Fase 3** — límite histórico por usuario en base de datos (el "1 por carrito" ya está implementado; el tope por usuario sigue por definir).
- **Fase 4** — panel de Pagos (diferido).
- **Parte B** — Mercado Pago con credenciales (diferido).
- `QawayLeadContactForm.jsx:141-154` conserva su propia escritura a `localStorage` con identidad estática. No genera duplicados (redirige sin `?add=`, y `itemKey` / `normalizeCart` lo absorben), pero queda como deuda para unificar en una sola vía.

---

## 8. Iteración aplicada — Bloque "Beneficio de compra" optimizado (2026-09-13)

**Pedido:** dejar el bloque optimizado por encima de la referencia de Mesa Selecta, sirviendo como **maqueta reutilizable** para otro servicio, aunque hoy no aplique a los servicios web de Qaway Lab.

### Diagnóstico del bloque anterior

Era decorativo y mentía: guardaba la elección en `orders.shipping_address.promotion` y en las notas, pero **nada la consumía**, no existía ninguna lógica de descuento en el módulo y la copy "Descuento directo aplicado en tu resumen" prometía una rebaja que nunca llegaba. Venía copiado de Mesa Selecta (`2-MesaSelecta/components/CheckoutForm.tsx:54-57`) donde sí tenía sentido (descuento por volumen / delivery por zona); al portarlo se cambió el texto pero no la lógica.

### Puntos esenciales

1. **Plantilla configurable en un solo archivo.** `lib/benefits.js` es la única fuente de verdad: `BENEFIT_PLANS` define id, label, descripción, tag, icono, `discountPercent` y `appliesTo`. Otro servicio reemplaza esa lista y la UI se adapta sola (la grilla se reparte con `auto-fit`).
2. **Descuento real, no promesa.** `computeBenefitTotals` recalcula subtotal, descuento y total; la fila "Descuento" y la fila "Subtotal" aparecen **solo** cuando `discountPercent > 0`. Con los beneficios actuales en 0, el total no cambia y no se promete nada falso. Para activar un descuento real en otro servicio basta poner `discountPercent: 10`.
3. **Copy honesta.** El beneficio que antes decía "Acceso Inmediato / Descuento" ahora es **"Acompañamiento 1:1"** (sesión de arranque); se conserva **"Soporte Prioritario"**. Se eliminó toda mención a un descuento inexistente.
4. **IDs legados preservados a propósito.** `discount` y `delivery` se mantienen porque son el valor ya persistido en pedidos y están fijados por los tests del host Inventario (`Checkout.test.tsx`). Para que un pedido viejo se entienda sin depender del id, ahora se persiste también `promotionLabel` (texto legible). Renombrar los ids exigiría migrar datos y tests en el mismo movimiento: queda como deuda consciente, no como parche.
5. **La elección ahora tiene consecuencia visible:** fila "Beneficio" en el resumen del pedido y línea "Beneficio" en la pantalla de confirmación.
6. **Diseño intacto.** Clases nuevas y aditivas (`.benefit-grid`, `.benefit-card`, `.benefit-*`, `.section-hint`). **No se modificó ninguna regla existente**: `.choice` / `.choice-grid` siguen intactas para los 4 métodos de pago, que se ven igual que antes. Se reutilizan `.form-section`, `.summary-row` y `.summary-note`.
7. **Mejoras frente a Mesa Selecta:** tarjetas con icono, etiqueta de esquina, estado seleccionado explícito (borde, icono relleno, punto + "Seleccionado"/"Elegir"), `role="radiogroup"`, anillo de foco accesible (`:focus-within`) y sin dependencias nuevas (SVG inline, porque el módulo solo tiene peers de React).
8. **`orders.createOrder` acepta `discount`** (default 0, retrocompatible) y lo resta del total del pedido, para que pedido y pago no puedan divergir cuando un servicio futuro active un descuento.
9. **Verificación ejecutada:** `oxlint` → 0 errores. Tests del host Inventario (`Checkout`, `CartItems`, `storefrontUtils`) → **46 pasan**; se detectó y corrigió 1 fallo propio (la fila Subtotal duplicaba el importe y rompía un `getByText`).

### Hallazgo colateral (NO corregido, requiere decisión)

Los tests `error de createPayment…` y `error al crear la orden…` del host Inventario **fallan desde antes de esta iteración** (verificado con `git show HEAD:.../Checkout.jsx`: los `catch` que tragan el error ya existían). Revelan un problema real: si `createOrder` o `createPayment` rechazan, el checkout **igual muestra "Pedido registrado con éxito"**, porque el `catch` sustituye el fallo por un pedido simulado. El test espera lo contrario (mostrar el mensaje y llamar a `onError`). O el código o el test están mal, y el riesgo de negocio es mostrar éxito sin pedido guardado. No se tocó: implica decidir si el checkout debe fallar de forma visible.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `lib/benefits.js` | **NUEVO** — plantilla de beneficios + motor de totales |
| `components/storefront/BenefitIcon.jsx` | **NUEVO** — set de iconos SVG sin dependencias |
| `components/Checkout.jsx` | bloque de beneficios optimizado, totales reales, resumen y confirmación coherentes |
| `lib/services/orders.js` | `createOrder` acepta `discount` (default 0) |
| `styles/storefront.css` | clases aditivas del bloque; ninguna regla existente alterada |
