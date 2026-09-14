# App / Implementación — Carrito funcional, candado Producto vs Servicio y Pago real

Módulo: `src/pages/5-qaway-hub/3-qawaylab-pagos`
Rama: `main-web` · Repo: `1-qawaylab-web`
Estado: **Fases 1 y 2** + **camino de pago** + **checkout simplificado y voucher estilizado** (2026-09-13). Programa de beneficios **OCULTO tras `SHOW_BENEFITS = false` — no eliminado**. Pendiente: pasarela real.
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

---

## 9. Iteración aplicada — Camino de pago y correcciones críticas (2026-09-13)

**Origen:** pruebas en pantalla reportaron 3 fallos críticos del flujo de compra. Se verificaron contra el código, la base y el catálogo real antes de tocar nada. Los 3 eran ciertos; además se encontró un fallo mayor no detectado.

### Diagnóstico verificado

1. **Imagen rota de `tienda-online`:** CONFIRMADO. La URL devolvía **HTTP 404**. Auditoría completa del catálogo (**20 productos**, verificados uno por uno con `curl`): **1 sola imagen rota**. El fallo estaba duplicado en la fila de Supabase y en el fallback local.
2. **"Monto total: S/ 0.00":** CONFIRMADO. La confirmación leía montos derivados de `items`, y `onSuccess` vacía el carrito.
3. **"Volver a la tienda" deja el carrito vacío:** CONFIRMADO. El botón hacía `window.location.reload()` sobre la propia ruta del checkout.
4. **Fallo mayor no detectado — el pedido nunca se guardaba:** `PagosAppPage` pasaba `user={{ id: 'user-demo-001' }}`, que **no es un UUID** y no cumple la política RLS (`auth.uid() = user_id or user_id is null`). El insert era **rechazado**, el error se registraba como *warning* y se devolvía un pedido simulado. Ningún pedido del Hub llegaba a Supabase.

### Puntos esenciales de la corrección

1. **Persistencia real.** Se dejó de pasar el usuario ficticio: el pedido entra como invitado (`user_id NULL`), que la política RLS sí admite. Es el arreglo que hace que un pedido exista de verdad.
2. **Snapshot congelado.** `setOrderCompleted` guarda `subtotal`, `discount`, `total`, beneficio, método, código de pedido y pasos. La confirmación lee solo de ahí: se acabó el "S/ 0.00".
3. **Camino de pago explícito.** Nuevo `lib/paymentConfig.js`: cada método declara `operational` y, si no lo está, **por qué**. El checkout muestra la etiqueta *Disponible / En habilitación* y un aviso honesto al elegir uno no operativo. Regla aplicada: **nunca ofrecer un método que no pueda completarse sin decirlo**.
4. **Próximos pasos reales por método.** `paymentSteps()` devuelve 2–3 pasos concretos según el método, y se renderizan en la confirmación junto a un CTA de WhatsApp con el **código de pedido y el monto ya redactados**. Esto es lo que resuelve "no se entiende el camino de pago": antes la pantalla de éxito no decía qué hacer.
5. **Stripe dejó de ser un callejón sin salida.** Antes, elegirlo mostraba "éxito" sin ningún dato ni monto. Ahora tiene su bloque propio con monto y sus pasos.
6. **Indicador de pasos** (nuevo `CheckoutSteps`): Carrito → Datos y pago → Confirmación.
7. **Navegación sana.** "Volver a la tienda" es un enlace a la landing de precios (ancla, no `reload`), y se añadió "Ver mis pedidos". Se usan anclas y no `Link`/`useNavigate` a propósito: `Checkout` se renderiza en tests sin `Router` y los hooks de router romperían el contrato del host.
8. **Imagen a prueba de caídas.** `ItemMedia` (nuevo, por ítem) degrada con `onError` a un marcador neutro: una URL muerta ya no muestra el cuadro roto. La URL de `tienda-online` se reemplazó por una **verificada con 200**. Queda pendiente la misma corrección en la fila de Supabase: el rol `anon` solo tiene `select` sobre `products`, así que **no se puede escribir desde aquí**.
9. **Correo opcional** para el comprobante, precargado desde el formulario de la landing (`qaway_checkout_user`), y guardado en `shipping_address.email`.
10. **Copy alineada en el carrito:** la nota hablaba de "beneficio de descuento" (ya inexistente) y la fila "Delivery / Acceso — Gratis" no aplica a servicios. Se pasan por props desde el carrito, sin tocar el componente `OrderSummary` (cuyos textos están fijados por tests).

### Candado Visual respetado

Todas las clases son nuevas y aditivas (`.checkout-steps`, `.checkout-step*`, `.method-head`, `.method-tag`, `.method-notice`, `.product-media-empty`, `.next-steps*`). **Ninguna regla CSS existente fue modificada** y **ningún texto fijado por los tests del host fue alterado**.

### Verificación ejecutada

- `oxlint` sobre todo el módulo: **0 errores**.
- Tests del host Inventario (`Checkout`, `CartItems`, `CartView`, `OrderSummary`, `storefrontUtils`): **65 pasan**, 2 fallan.
- **Compilación de la ruta:** con el dev server levantado en un puerto temporal, los **8 módulos** del carrito (PagosAppPage, Checkout, CartItems, CheckoutSteps, BenefitIcon, paymentConfig, benefits, storefront.css) se transforman con **HTTP 200** y `/hub/pagos/carrito` responde **200**. Servidor apagado tras verificar.

### Pendiente (requiere credenciales o decisión del negocio)

- **Pasarela real** de Mercado Pago / Stripe: access token, Edge Function que cree la preferencia, `back_urls` y webhook.
- **Datos de cobro reales:** `ACCOUNT_INFO` en `lib/paymentConfig.js` sigue con valores de ejemplo y el voucher continúa siendo opcional (su obligatoriedad está fijada por tests del host).
- **Corregir la fila `tienda-online` en Supabase** (requiere rol con escritura).
- **Autenticación real** y enrutado del panel admin (`PaymentsManager`/`PaymentsPanel` siguen sin ruta).
- **Los 2 tests que fallan** documentan un conflicto real: si `createOrder`/`createPayment` fallan, el checkout igual muestra "Pedido registrado con éxito". Hay que decidir si debe fallar de forma visible.

---

## 10. Iteración aplicada — Retiro de beneficios, voucher estilizado y cierre de flujo (2026-09-13)

### Ajustes solicitados y resultado

1. **Retiro del bloque "Beneficio de compra" — aplicado.** El checkout ahora fluye **Datos de contacto y entrega → Forma de pago → Resumen y Confirmar pedido**. Se eliminaron el bloque, su estado, sus imports, y las filas **Beneficio**, **Descuento** y **Subtotal** del resumen. La data queda con un **fallback neutro** (`promotion: null`) para no romper la tabla `orders`, y se quitó `promotionLabel`. La nota del pago ya no menciona beneficios.
2. **Voucher estilizado — aplicado.** El `<input type="file">` gris quedó oculto de forma accesible dentro de una **zona dashed** con el texto *Subir captura o Voucher de pago*, ayuda de formatos, y al seleccionar muestra **nombre + peso** con acción **Quitar archivo** (que además limpia el input por ref). No deforma la caja de datos bancarios: va dentro de ella, a ancho completo.
3. **Cierre de flujo en pagos manuales — ya existía; refinado.** El enlace a WhatsApp con el número oficial (`51930756781`), el código de pedido y el monto ya estaba desde la iteración 9. Se refinó: el mensaje ahora dice *"adjunto el voucher del pedido #… por S/ …"* y el botón cambia de etiqueta según el método — **Enviar mi voucher por WhatsApp** en Yape/Transferencia, **Coordinar por WhatsApp** en los métodos en habilitación.

### Módulo de beneficios: LATENTE (decisión de producto)

`lib/benefits.js`, `components/storefront/BenefitIcon.jsx` y sus ~150 líneas de CSS **se conservan** y quedan marcados como latentes, listos para reutilizar en otro servicio. Ya no se renderiza nada del bloque. No se perdió la maqueta.

### Contratos del host actualizados (autorizado)

En `10-qawaylab-inventario/.../Checkout.test.tsx` se actualizaron las 4 assertions que fijaban el bloque retirado. En lugar de solo borrar el test del beneficio, se **reemplazó por uno que documenta el retiro** (`queryByText('Beneficio de compra')` y `queryByRole` de "Soporte Prioritario" ausentes) y se dejó el conteo de radios en **4**. El test de `OrderSummary` siguió verde sin tocarlo, porque su nota por defecto vive en ese componente y no en el checkout.

### Bug atrapado durante la verificación

Al retirar el motor de beneficios quedó un `discount` huérfano en la llamada a `ordersService.createOrder`, que habría lanzado **`ReferenceError` al confirmar cualquier pedido**. El linter **no lo marcó**; lo detectó un grep dirigido y se corrigió. `orders.createOrder` mantiene su parámetro `discount` (default 0), así que la compatibilidad sigue intacta.

### Verificación ejecutada

- `oxlint` sobre todo el módulo: **0 errores**.
- Tests del host (`Checkout`, `CartItems`, `CartView`, `OrderSummary`, `storefrontUtils`): **65 pasan**, 2 fallan (los 2 preexistentes de `createOrder`/`createPayment`).
- **Compilación de la ruta:** dev server en puerto temporal → **8 de 8 módulos** transforman con **HTTP 200**, y `/hub/pagos/carrito` y `/hub/pagos/checkout` responden **200**. Servidor apagado tras verificar.

### Pendiente (sin cambios respecto de la iteración 9)

Pasarela real de Mercado Pago/Stripe con credenciales, datos de cobro reales, corregir la fila `tienda-online` en Supabase (requiere rol con escritura), autenticación real y enrutado del panel admin, y decidir si el checkout debe fallar visiblemente cuando el pedido no se registra.

---

## 11. Corrección de la iteración 10 — Beneficios OCULTOS y fin del pantallazo (2026-09-13)

### Qué estuvo mal

La instrucción fue **ocultar** el programa de beneficios, no eliminarlo. En la iteración 10 se quitó el **JSX** que lo pintaba (quedaron intactos el módulo, los iconos y el CSS). Fue una lectura demasiado estrecha de la instrucción y se corrigió.

### Recuperación: evaluación y resultado

No se perdió material y **no hubo que reescribir nada**:

| Material | Estado | Fuente de recuperación |
|---|---|---|
| `lib/benefits.js` (catálogo + motor de totales) | nunca se tocó | working tree |
| `components/storefront/BenefitIcon.jsx` | nunca se tocó | working tree |
| 22 reglas CSS `.benefit-*` + `.section-hint` | nunca se tocaron | working tree |
| **JSX del bloque** (grilla, tarjetas, estado, filas del resumen) | se había quitado | commit `6b988482` |

El JSX se restauró **verbatim** desde el commit anterior a la eliminación. Verificación de integridad ejecutada: comparación de los **tokens de clase `benefit-*`** entre la versión previa y la actual → **11 tokens, idénticos, sin faltantes**.

### Cómo quedó: interruptor de una línea

Nuevo `const SHOW_BENEFITS = false` en `Checkout.jsx`. El bloque completo sigue montado y **gateado** por esa constante:
- `availableBenefits` se resuelve solo si el interruptor está encendido; con él apagado `selectedBenefit` es `null`, el descuento queda en 0 y **un beneficio oculto no altera precios en silencio**.
- `promotion` viaja como `null` mientras está oculto (fallback neutro pedido) y vuelve a llevar el id al reencenderlo; `promotionLabel` igual.
- La sección, las filas del resumen y las líneas de la confirmación están todas gateadas, no borradas.
- **Reencender la sección = poner `true`.** Un solo cambio.

### Pantallazo de "carrito vacío": era una regresión propia

Al hacer determinista la resolución del `?add=` (iteración 9) el efecto quedó esperando la respuesta de Supabase. Con el carrito vacío, esa espera mostraba el **estado vacío real** durante la consulta. Antes era imperceptible porque el producto entraba en el primer pase, sin red.

**Solución aplicada:** se distingue "vacío" de "resolviendo":
- `PagosAppPage` lleva `pendingAdd` (el slug en resolución).
- `CartView` acepta `loading` (default `false`) y, con carrito vacío + `loading`, muestra *"Agregando tu producto…"* reutilizando `.empty-state` → **cero CSS nuevo**.
- Se mantiene la espera, porque la tabla `products` es la fuente de verdad del precio y la imagen.
- Al ser `loading` default `false`, los tests del host quedan intactos.

### Verificación ejecutada

- `oxlint` sobre el módulo: **0 errores**.
- Tests del host: **65 pasan**, 2 fallan (los 2 preexistentes).
- Integridad del material recuperado: **11/11 tokens `benefit-*` idénticos**.
- **Compilación de la ruta:** dev server en puerto temporal → **8 de 8 módulos** con HTTP 200; `/hub/pagos/carrito` y `/hub/pagos/checkout` responden **200**. Servidor apagado tras verificar.

---

## 12. Backlog abierto — observaciones del 2026-09-13 (revisión de pantalla)

Tareas registradas a partir de la revisión visual del checkout. **Pendientes de aprobación; ninguna aplicada.**

### T1 · Espaciado del encabezado del checkout — BUG PROPIO CONFIRMADO
El párrafo `Ingresa tus datos de contacto…` y el indicador de pasos quedan pegados, sin aire.
**Causa raíz medida:** `.section-copy` **no tiene `margin`** (`storefront.css:85-90`) y `.checkout-steps` tiene `margin: 0 0 22px` → **0 de separación arriba**.
**Fix:** dar margen superior al stepper (clase propia, sin tocar `.section-copy`, que es compartida).

### T2 · ¿Migas de pan o indicador de pasos?
**NO son migas de pan y no deben serlo.** Son cosas distintas:
- **Migas de pan:** ubican al usuario en una **jerarquía** (Inicio › Blog › Artículo). Son navegación, no proceso.
- **Indicador de pasos (stepper):** muestran avance en un **proceso lineal con fin**. Es lo correcto para un checkout.
**Decisión propuesta:** mantener el stepper (correcto para checkout), corregir T1 y, opcionalmente, hacer clicable el paso ya cumplido para volver al carrito. No convertirlo en migas de pan.

### T3 · Placeholders de entrega física en un carrito de servicios
`Ej. Miraflores`, `Av. Principal 123` y `Referencia de casa, dpto, o nota del pedido…` son ejemplos de **reparto a domicilio** y no aplican a la compra de un servicio digital. Propuestas 4 alternativas (A–D) para que se elija una.
**Causa de fondo (mayor):** `Distrito / Ciudad` y `Dirección` son **obligatorios** (`required`) y para un servicio digital son fricción pura. Fix real propuesto: hacerlos **opcionales** y **condicionales** a que el carrito tenga algún ítem físico.

### T4 · Desplegable del método de pago — CONFIRMADO, está mal
Al elegir *Yape / Plin Directo*, el bloque de datos bancarios + voucher se abre **al final de la lista**, debajo de *Transferencia bancaria / Pago Directo*, no debajo de la opción elegida.
**Causa raíz:** el panel se renderiza **después** del `.choice-grid` completo (`Checkout.jsx:454-460`), que contiene las 4 tarjetas.
**Fix:** renderizar el panel **dentro del mismo ítem de la tarjeta elegida**, para que el efecto quede junto a su causa (divulgación progresiva adyacente al disparador).
**Restricción:** mantener los textos que fijan los tests del host (`Datos para transferir o Yapear:`, `BCP Cuenta:`, `getByLabelText(/Voucher/)`, y su ausencia con Mercado Pago).

### T5 · La zona de voucher no parece un botón
Hoy es un recuadro dashed con texto: se lee como enunciado, no como acción. **Referencia enviada:** dropzone de BulkResize (recuadro dashed + **botón sólido visible** "Elegir imágenes").
**Fix propuesto:** botón sólido *Elegir archivo* dentro de la zona + soporte de **arrastrar y soltar**; al seleccionar, chip con nombre + peso y acciones *Cambiar* / *Quitar*.
**Restricción:** el `<label>` debe seguir envolviendo/asociando el `<input type="file">` para no romper los tests del host.

### T6 · Hallazgo aparte, fuera del carrito (SEO)
La captura de la inspección de URL de Google muestra que la **URL canónica de un artículo del blog apunta a `https://www.qawaylab.com/`** (el home) y el código de respuesta es **206**. Eso impide que Google indexe el artículo por su propia URL. **No es del carrito**: confirmar si se registra como tarea separada.

---

## 13. Iteración aplicada — Bloque 1 del backlog + horario de comunicación (2026-09-13)

### Cerrado en esta iteración

| Tarea | Estado | Qué se hizo |
|---|---|---|
| **T1** Espaciado del encabezado | **APLICADO** | `.checkout-steps` pasa de `margin: 0 0 22px` a `26px 0 30px`: el stepper ya no queda pegado al párrafo |
| **T2** ¿Migas de pan? | **DECIDIDO** | Se mantiene como **stepper**: es un proceso lineal, no una jerarquía. Las migas de pan serían el patrón equivocado |
| **T3** Placeholders | **PARCIAL** | Solo el campo de notas, según lo pedido: label `Notas adicionales (opcional)` y placeholder `Detalles que debamos considerar`. El resto se mantiene |
| **T4** Desplegable del método | **APLICADO** | El aviso y el panel de cobro ahora se renderizan **dentro del ítem elegido** (`Fragment` por método), no al final de la lista. Efecto junto a su causa |
| **T5** Zona de voucher | **APLICADO** | Botón sólido **Elegir archivo** dentro de la zona + **arrastrar y soltar** real (`is-dragging`) + chip con nombre y peso + *Quitar archivo*. El `<label>` sigue envolviendo al `<input type="file">` |

### Añadido: Horario de comunicación

Campo `contactSchedule` (select, opcional, default "Cualquier horario") junto al correo. Se guarda en `shipping_address.contactSchedule`. Aplica a cualquier rubro y responde a que el negocio necesita **llamar** para afinar detalles.

### Verificación

- `oxlint`: **0 errores**.
- Tests del host (`Checkout`, `CartView`, `CartItems`): **34 pasan**, 2 fallan (los 2 preexistentes).
- **7 de 7 módulos** compilan con HTTP 200; `/hub/pagos/checkout` responde **200**. Servidor temporal apagado.

---

## 14. Backlog nuevo — cierre de compra: brief y página de gracias con Pixel (propuesta)

Ideas planteadas por el responsable. **Nada aplicado.** Se detectaron dos restricciones técnicas duras que condicionan el diseño.

### T7 · Formulario de brief después del pago
**Recomendación:** no pedir el brief **dentro** del checkout (sube el abandono); hacerlo **después** de confirmar, cuando la intención del cliente es máxima y espera el onboarding. Formulario corto (5-8 campos) y guardado asociado al pedido.

**RESTRICCIÓN TÉCNICA 1 (bloqueante):** los pedidos del Hub son **de invitado** (`user_id NULL`) y la RLS de `orders` solo permite `update` al dueño (`auth.uid() = user_id`). Por lo tanto **el cliente no puede guardar el brief actualizando el pedido**. Opciones reales:
- (a) tabla nueva `order_briefs` con política `insert` para `anon` validando el código de pedido (mismo patrón que ya usa el proyecto con `is_guest_order`), o
- (b) Edge Function con `service_role`.
La opción (a) es coherente con el esquema existente. Requiere migración SQL.

### T8 · Página de "gracias" para el Pixel de Meta
**Contexto verificado:** el pixel **ya existe** — el código base con `fbq('init', '1787532068936007')` y el PageView están en `index.html:47-81`, y `src/lib/analytics/metaPixel.js` es el emisor central con **gate de consentimiento** (`trackStandard`, `trackLead`, `pageview`). **Falta el evento `Purchase` y una página donde dispararlo.**

**RESTRICCIÓN TÉCNICA 2 (bloqueante para el pixel):** Meta necesita **una URL propia de confirmación**. Un cambio de estado en la misma ruta no es fiable para el pixel y además el proyecto ya dispara `pageview()` en transiciones de ruta. Por eso la confirmación debe ser su propia ruta.

**Plan propuesto:**
1. `metaPixel.js` → añadir `trackPurchase({ orderId, value, currency, contents })` emitiendo `Purchase` con `value`, `currency`, `content_type` y **`event_id` = id del pedido** (deduplicación con la API de Conversiones si algún día se usa).
2. Ruta nueva `/hub/pagos/gracias?pedido=XXXXXXXX` que:
   - lee el código y el monto, **dispara `Purchase` una sola vez** (guardia por `event_id` en `sessionStorage` para que un refresco no duplique la conversión),
   - muestra los próximos pasos y el enlace de WhatsApp,
   - aloja el formulario de brief (T7).
3. El checkout navega a esa ruta al confirmar, en lugar de quedarse en su pantalla de éxito interna.

**Nota:** la deduplicación y el disparo único importan porque Meta **cuenta conversiones de más** si el evento se repite; es el error más común en este punto.

---

## 15. Corrección del layout del voucher — la causa era CSS, no diseño (2026-09-13)

La captura mostró el contenido del voucher amontonado en una sola línea y el botón solapado. **No era solo estética: era una colisión de CSS.**

**Causa raíz medida:** la regla `.field label` (`storefront.css:458-467`) aplica `text-transform: uppercase`, `font-size: 0.69rem`, `letter-spacing: 0.06em` y **`display: block`**. La zona de voucher era un `<label>` dentro de `<div className="field">`, así que:
- `display: block` **pisaba mi `display: grid`** (mayor especificidad: `.field label` = 0,2,1 vs `.upload-zone` = 0,2,0) → los hijos fluían en línea,
- y heredaba `uppercase` + tamaño diminuto → el texto se veía como un grito amontonado.

**Corrección (solución, no parche):**
1. Se sacó la zona de `.field`: es una **zona de arrastre**, no la etiqueta de un campo de formulario.
2. Se reforzaron sus propiedades (`text-transform: none`, `letter-spacing: normal`, tamaños explícitos) para que **no pueda volver a heredar** tipografía de label aunque cambie de contenedor.
3. Se reorganizó el contenido: título en su línea → fila con el **botón sólido** + "o arrastra el archivo aquí" → ayuda de formatos → chip del archivo con nombre y peso.

**Verificación:** `oxlint` 0 errores; tests del host **24 pasan** (el voucher sigue resolviéndose por su label y `user.upload` funciona); `/hub/pagos/checkout` → **200**.

---

## 16. Regla de pagos seguros + implementación base (2026-09-13)

### Verificaciones solicitadas

**Mercado Pago — visible, NO instalado.** Lo que se ve en el checkout es solo una **etiqueta**: una entrada de `PAYMENT_METHODS` en `lib/paymentConfig.js` con `operational: false` ("En habilitación"). No hay SDK, ni llamada HTTP, ni credenciales; `VITE_MERCADOPAGO_PUBLIC_KEY` / `MERCADOPAGO_ACCESS_TOKEN` existen **únicamente en el README** y ningún archivo los lee. El esquema sí acepta `provider: 'mercadopago'`, y por eso parece listo.

**Culqi — sí está en el repo, y no oculta: está diseñada en otro módulo y nunca se implementó.**
- `4-academy/2-qawaylab-app-academy-real/QAWAY-PAGOS-BRIEF.md`: brief completo del flujo Culqi (Yape QR automático, tarjetas, PagoEfectivo, comisión de referencia ~3.9% + S/0.50, `culqi-webhook.js`, `culqi-client.js` y `VITE_CULQI_PUBLIC_KEY` / `CULQI_SECRET_KEY` / `CULQI_WEBHOOK_SECRET`).
- `4-academy/.../src/lib/services/payments.ts:343-348`: `simulateCulqiWebhook`, con el comentario *"In production, this would be an Edge Function called by Culqi"*.
- `3-qawaylab-pagos`: `lib/services/payments.js:159` solo tiene el simulador; el esquema y el panel admin ya contemplan el proveedor.
→ **Diseñada, documentada y simulada; nunca conectada.** Y ese brief ya preveía una Edge Function, que es exactamente lo que ahora existe.

**¿Culqi exige RUC y ~20 días?**
- **RUC: no es obligatorio.** El procedimiento de registro de Culqi (publicado por Wally) exige que la cuenta bancaria esté a nombre del **RUC o DNI** ingresado → **acepta cualquiera de los dos**.
- **~20 días: NO verificado.** El mismo procedimiento describe que Culqi **evalúa el negocio** y responde APROBADO u OBSERVADO *"en el plazo establecido"*, **sin publicar un número de días**. No se encontró plazo oficial. Para confirmarlo: Culqi, (01) 643 1050 / WhatsApp +51 946 030 900.

### Implementado

**1. La regla:** `REGLAS-PAGOS-SEGUROS.md` — R1 a R7 + checklist de aceptación. No es un documento aspiracional: cada regla tiene su punto de verificación.

**2. El código que la aplica** (no simulacros):

| Archivo | Rol |
|---|---|
| `supabase/functions/_shared/pagos.ts` | Recálculo del total desde la base; firma HMAC-SHA256 comparada **en tiempo constante**; detección de eventos ya procesados; seam de pasarela |
| `supabase/functions/pago-crear/index.ts` | Recalcula el importe en el servidor y **aborta** si el cliente manda un monto distinto |
| `supabase/functions/pago-webhook/index.ts` | Orden obligatorio: firma → evento aprobatorio → idempotencia → coincidencia de monto → recién ahí marca pagado |

**3. Hallazgo importante — R1 no se cumple hoy:** el total del pedido lo calcula el **navegador** (`lib/services/orders.js:27`) y el monto del pago también (`Checkout.jsx`). Hoy no es explotable porque no hay cobro conectado, pero es **lo primero que debe cerrarse** antes de habilitar cualquier pasarela. Queda registrado como deuda abierta en el documento de reglas.

**4. El seam no finge:** mientras `PASARELA` no esté configurada, `pago-crear` responde `PASARELA_NO_CONFIGURADA` (501) en lugar de simular un cobro o devolver un identificador falso.

### Verificación

`oxlint` sobre `supabase/functions`: **0 advertencias y 0 errores**. El módulo de pagos mantiene sus 15 avisos preexistentes. Las funciones no forman parte del build del front, así que no alteran la ruta verificada.

---

## 17. Pasos 1 y 2 del plan de pagos aplicados (2026-09-14)

### Paso 1 · Recorte de métodos de pago

**Decisión:** la línea de pago baja de 4 a **3 métodos**, cada uno con una razón distinta.

| Método | `id` | Proveedor | Habilitado |
|---|---|---|---|
| Mercado Pago | `mercadopago` | `mercadopago` | No (falta conectar) |
| Pago con QR (Yape, Plin y bancos) | `taypi` | `taypi` | No (falta conectar) |
| Yape / Plin / Transferencia | `manual` | `manual` | **Sí** |

**Qué se retiró y por qué:**
- **"Tarjeta Internacional (Stripe)"**: Stripe no abre cuenta de comercio para Perú (requiere empresa en EE.UU.) y Mercado Pago ya cubre lo internacional. Era una opción que no podía completarse.
- **"Yape / Plin Directo" + "Transferencia bancaria / Pago Directo"**: renderizaban **exactamente el mismo bloque** de datos (BCP Cuenta, CCI, Yape). Se unificaron en `manual`.

**`enabled` reemplaza a `operational`.** Un método no habilitado **se muestra con su aviso pero no se puede seleccionar** (radio deshabilitado). Antes era visible *y* elegible, lo que permitía entrar a un camino que no podía completarse. El aviso ahora vive **dentro** de la tarjeta afectada.

**Default = primer método habilitado** (`firstEnabledMethod()`). Hoy es `manual`. Al habilitar una pasarela pasa a ser el default **sin tocar código**: solo cambiando su `enabled`.

### Paso 2 · Proveedor por petición (habilita varias pasarelas a la vez)

Antes `PASARELA` era una constante global: **solo una pasarela podía estar activa**. Ahora:

| Antes | Ahora |
|---|---|
| `PASARELA` global | `PROVEEDORES` + `proveedorDeRequest(req)` → `?provider=mercadopago\|taypi` |
| Un solo `PASARELA_WEBHOOK_SECRET` | `ENV_WEBHOOK_SECRET` por proveedor (`MERCADOPAGO_WEBHOOK_SECRET`, `TAYPI_WEBHOOK_SECRET`) |
| Idempotencia por `provider_id` | Idempotencia por **`(provider, provider_id)`** |

Cada pasarela registra en su panel **su propia URL**: `.../pago-webhook?provider=<proveedor>`.

**Migración:** `supabase/migrations/20260914000001_pagos_multipasarela.sql` (idempotente, no borra datos):
1. `payments.provider` → agrega `taypi`.
2. `orders.payment_method` → agrega `taypi` y `manual`.
3. **Índice único `(provider, provider_id)`** — sin él, con dos pasarelas activas un pago podría descartarse como "duplicado" del de otra.
4. Índice de apoyo `(order_id, status)`.

### Bug que atraparon los tests (no el linter)

La subida del voucher seguía condicionada a `selectedMethod === 'yape' || 'directo'`. Con la unificación, **el voucher nunca se habría subido**. Lo detectó el test del host en la primera corrida. Corregido a `selectedMethod === 'manual'`.

Es el segundo bug que aparece por retirar el motor de beneficios y unificar métodos: confirma que **los tests del host Inventario son la red de seguridad real de este módulo**, por encima del linter.

### Tests del host actualizados (autorizado)

| Archivo | Cambio |
|---|---|
| `Checkout.test.tsx` | 3 radios en vez de 4; labels nuevos (QR y manual unificado); Stripe retirado; default = manual y no habilitados **deshabilitados**; `paymentMethod`/`provider` del submit → `manual`; test de Stripe reemplazado por uno que documenta su retiro |
| `purchaseFlow.test.tsx` | `paymentMethod` → `manual` |
| `CartPage.test.tsx` | `paymentMethod` → `manual` |

> **Acoplamiento a tener presente:** esas assertions fijan el default actual (`manual`). Cuando se habilite Mercado Pago (`enabled: true`) pasará a ser el default y habrá que revisarlas. Está anotado aquí para que no sorprenda.

### Verificación

- `oxlint`: **0 errores** en el módulo y en `supabase/functions`.
- Tests del host afectados: **58 pasan**, 2 fallan (los 2 preexistentes de `createOrder`/`createPayment`).
- **4 de 4 módulos** compilan con HTTP 200; `/hub/pagos/checkout` y `/hub/pagos/carrito` → **200**.

### Paso 3 (pendiente, espera credenciales)

Conectar los adaptadores de **Mercado Pago** y **TAYPI** en `crearCobroEnPasarela`, registrar las URLs de webhook en cada panel y probar con credenciales de test. Requiere: Access Token de Mercado Pago, API key + secret de TAYPI, y sus webhook secrets.

---

## 18. Orden por fricción, blindaje del panel y conversión de Meta (2026-09-14)

### Consulta: ¿cuál genera menos fricción y debería ir primero?

**Sí, el QR debe ir primero.** Orden por fricción real, y por uso:

| Puesto | Método | Fricción | Por qué |
|---|---|---|---|
| **1º** | **QR (TAYPI)** | **Mínima** | No se escribe ningún dato: se escanea. Yape supera los **14 millones de usuarios activos** en Perú —más que las tarjetas activas del país— y es el método con mayor adopción |
| 2º | Mercado Pago | Media | Datos de tarjeta o redirección; a cambio da cuotas e internacional |
| 3º | Manual | **Máxima** | Salir de la web, transferir, capturar el voucher, subirlo y esperar verificación humana. Es respaldo, no camino principal |

Aplicado en `lib/paymentConfig.js`: el array pasó de `mercadopago, taypi, manual` a **`taypi, mercadopago, manual`**, y `orderedMethods()` coloca además **los habilitados primero**. Resultado práctico: hoy (solo `manual` habilitado) se ve primero el manual; cuando se habilite el QR, sube solo al primer puesto y pasa a ser el default.

### El panel de Yape/Plin: verificación y blindaje

**Verificado primero:** el `paymentConfig.js` en disco tiene `enabled: false / false / true` y el bundle `dist/assets/Checkout-*.js` está actualizado (ya no contiene "Yape / Plin Directo" ni "Tarjeta Internacional"). Los tests del host renderizan el panel por defecto, así que el código está bien.

**Dos blindajes aplicados**, para que este tipo de fallo no pueda repetirse por un desajuste de datos:

1. **El panel ya no depende de un id escrito en el componente.** Antes: `method.id === 'manual'`. Ahora el método lo declara (`showAccounts: true`) y el checkout solo obedece al dato. Si mañana otro método muestra cuentas, se activa sin tocar el componente.
2. **El método ya seleccionado nunca se deshabilita:** `disabled={!method.enabled && method.id !== selectedMethod}`. Si un cambio de configuración dejara la selección en un método no habilitado, la UI **no puede quedar sin salida** (antes el radio quedaba marcado y bloqueado a la vez).

> Si en pantalla seguía sin desplegarse, la causa más probable es caché del navegador sobre el dev server: un **recargado forzado** (Ctrl+F5) lo resuelve. No se encontró defecto en el código ni en el bundle.

### Conversión de Meta (Pixel)

**`trackPurchase` agregado a `src/lib/analytics/metaPixel.js`** (el emisor central que ya existía con su gate de consentimiento):
- Emite `Purchase` con `value`, `currency`, `content_type`, `content_ids` y **`event_id` = id del pedido** (deduplicable con la Conversions API si algún día se suma).
- **Disparo único** por pedido vía `sessionStorage`: recargar la confirmación **no** vuelve a contarlo. Si no hay `sessionStorage`, **no emite**: repetir el evento infla las conversiones y distorsiona la optimización, que es peor que perder un evento aislado.

**Aislamiento respetado:** el módulo de pagos **no importa** herramientas de analítica del host (rompería su independencia y el host Inventario no tiene ese archivo). En su lugar, `Checkout` expone `onOrderCompleted` y **`PagosAppPage` inyecta `trackPurchase`**. Así el módulo sigue siendo agnóstico y los tests del host no cambian.

**Limpieza extra:** se retiraron las props ya muertas `stripePublishableKey` y `mercadoPagoPublicKey` (avisos de lint del módulo: 15 → **13**).

### Verificación

- `oxlint`: **0 errores** (módulo de pagos, `metaPixel`).
- Tests del host afectados: **28 pasan**, 2 fallan (los 2 preexistentes).
- **5 de 5 módulos** compilan con HTTP 200; `/hub/pagos/checkout` → **200**.

---

## 19. Correcciones de la iteración 18 (2026-09-14)

Dos correcciones sobre lo anterior, ambas señaladas por el responsable.

### C1 · El panel debe arrancar COLAPSADO y abrirse al clic

**Qué se entendió mal:** en la iteración 18 se interpretó "no despliega" como un fallo de render y se dejó el panel **siempre visible** al estar el método seleccionado. Lo pedido era lo contrario: **colapsado por defecto y desplegable al hacer clic**.

**Implementado:**
- Estado `expandedMethod` (null = ninguno). Arranca colapsado.
- `handleMethodClick(method)`: si la tarjeta no estaba elegida, la elige **y la expande**; si ya estaba elegida, **alterna** (abrir/cerrar). Se engancha al `onClick` del `<label>`, porque el `onChange` del radio no se dispara al hacer clic sobre una opción ya marcada.
- **Señal visible obligatoria:** un indicador *Ver datos de pago / Ocultar datos de pago* con chevron que rota. Un panel colapsado sin señal no se descubre.
- Accesibilidad: `aria-expanded` y `aria-controls` en el radio apuntando al panel.

**Mitigación del riesgo:** si el comprador nunca expande el panel, la pantalla de confirmación **igual le muestra** los datos de cobro, el monto y los próximos pasos. No puede pagar a ciegas.

### C2 · El orden por fricción no se estaba aplicando

**Causa raíz:** `orderedMethods()` ordenaba por **habilitado primero**, así que el manual (el único habilitado) quedaba **arriba** e invertía el ranking que la propia iteración 18 había recomendado. El orden visible era manual → QR → Mercado Pago.

**Corregido:** se eliminó `orderedMethods()`. El orden del array **es** el orden de presentación y respeta el ranking por fricción y uso:

| Puesto | Método | Fricción |
|---|---|---|
| 1º | **QR (TAYPI)** | Mínima — Yape supera los 14 millones de usuarios activos en Perú, más que las tarjetas activas |
| 2º | Mercado Pago | Media — tarjeta o redirección, a cambio de cuotas e internacional |
| 3º | **Manual** | Máxima — transferir, capturar, subir voucher y esperar verificación humana |

**Consecuencia asumida y documentada:** mientras el QR y Mercado Pago sigan "en habilitación", esos dos aparecerán **arriba** del manual con su aviso. Es el precio de respetar el ranking; al habilitarlos, el orden ya es el definitivo y el QR pasa a ser el default solo.

### Verificación

- `oxlint`: **0 errores**; el módulo mantiene sus 13 avisos preexistentes.
- Tests del host: **28 pasan**, 2 fallan (los 2 preexistentes). Se actualizó el test del estado por defecto: ahora comprueba que el panel arranca **colapsado**; los tests que hacen clic siguen verificando que se despliega.
- **4 de 4 módulos** compilan con HTTP 200; `/hub/pagos/checkout` → **200**.
- Orden confirmado en el archivo: `taypi`, `mercadopago`, `manual`.

---

## 20. Mercado Pago implementado en el servidor (2026-09-14)

**Contexto:** TAYPI devuelve *"Registro no disponible — el registro se encuentra deshabilitado por el momento"*. No es un fallo nuestro ni algo que podamos resolver desde el código; se reintenta más adelante. Se avanza con **Mercado Pago**, que es el otro elegido.

### Lo implementado

| Pieza | Archivo | Qué hace |
|---|---|---|
| Adaptador de cobro | `_shared/pagos.ts` → `crearCobroMercadoPago` | Crea la preferencia de Checkout Pro **desde el servidor** (`POST /checkout/preferences`) con ítems e importe **recalculados desde la base** (R1), `external_reference`, `metadata.order_id`, `back_urls`, `notification_url` y `X-Idempotency-Key` |
| Selección de entorno | `mpEsTest()` | Si el token empieza con `TEST-`, devuelve `sandbox_init_point`; si no, `init_point`. Cambiar de prueba a producción es **cambiar el token**, nada más |
| Firma del webhook | `firmaMercadoPagoValida` | MP **no firma el cuerpo**: firma el *manifest* `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` con HMAC-SHA256 y se compara contra `v1` del header `x-signature`, en tiempo constante |
| Lectura del pago | `obtenerPagoMercadoPago` | El webhook de MP **no trae el monto**; hay que consultar `GET /v1/payments/{id}`. Sin esto la validación de importe (R5) sería inaplicable |
| Webhook | `pago-webhook/index.ts` | Orden intacto: firma → evento aprobatorio → idempotencia → monto → marcar pagado |
| Cobro desde el navegador | `Checkout.jsx` | Si el método tiene proveedor distinto de `manual`, llama a `pago-crear` **sin enviar el importe** y redirige a la URL de pago. Si vuelve un QR, lo muestra en la confirmación |
| QR | `Checkout.jsx` + `.qr-image` | Renderiza `qr_image` base64 (lo que devuelve TAYPI) como imagen, listo para cuando se reactive |

### Detalle que rompe integraciones y quedó resuelto

Al crear el cobro, el identificador es el de la **preferencia**; en el webhook llega el del **pago**. Son distintos. Se resuelve por `external_reference` y, al confirmar, se guarda el id del **pago** en `provider_id` para que un reintento se reconozca como repetido por R4.

### Verificación

- `oxlint`: **0 errores** (módulo + `supabase/functions`).
- Tests del host: **38 pasan**, 2 fallan (los 2 preexistentes). El cobro por pasarela no altera el flujo manual.
- **4 de 4 módulos** compilan con HTTP 200; `/hub/pagos/checkout` → **200**.

### Falta solo esto

1. **Tú:** cuenta de vendedor de Mercado Pago + aplicación → **Access Token** y **secreto de webhook**.
2. **Agente:** cargar secrets (`MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `PUBLIC_SITE_URL`), aplicar la migración, desplegar y correr las 4 pruebas.
3. **Agente:** `enabled: true` recién con las pruebas en verde.

Guía completa paso a paso para el negocio: `HABILITAR-PASARELAS.md`.
