# Needs Validation — `8-qawaylab-agenda`

**Run ID:** `qawaylab-agenda-2026-09-27-run-1` · **Reviewed commit:** `6906eb12` (`main-web`)

These 8 findings are **blocked on facts this source-only run cannot establish**. None of them is a claim that the defect is absent; each is a defect proven in source whose *reachability* or *observable effect* depends on deployed platform state this target does not contain.

None of these can be closed by reading more code. Each needs a live-project check. Grouped by the single fact that gates them, so the checks can be batched.

> Generated from `findings.json` — do not hand-edit. Regenerate instead.

---

## A. Effective privileges of the `anon` and `authenticated` roles

### The anon INSERT policy validates the event type but never binds it to business_id, so a caller can write a booking row onto any tenant using any free active event type id

**Fingerprint:** `0002_booking_free_only.sql:8+anon-insert-unbound-business-id`

**Claimed root cause:** The free-only check was written to close a payment-forgery hole reported in the migration header at 0002:1-2, and it re-derives the event type but stops one predicate short of asserting the tenant binding that would make the row coherent.

**Evidence anchors:**
- `supabase/migrations/0002_booking_free_only.sql:8` — the rebuilt anon_insert_booking policy contains no business_id comparison
- `src/agenda/context/AgendaContext.tsx:173` — business_id: business.id is caller-supplied
- `src/agenda/context/AgendaContext.tsx:174` — event_type_id: eventType.id is caller-supplied and unrelated to the tenant
- `supabase/migrations/0001_agenda_schema.sql:53` — bookings.business_id references businesses.id, so the forged value is a valid tenant reference

**Blocking facts:**
- Neither migration issues grant insert on public.bookings to anon, so the effective privilege of the anon role on this table is a live-project fact that source cannot establish.
- The bookings insert currently fails earlier on the malformed cancel_token described in the separate client-override finding, so reaching this write requires that value to be valid.

**Local check:**
```
In a local Supabase stack, apply both migrations, then as the anon role run: select has_table_privilege('anon','public.bookings','INSERT'); and insert into public.bookings (business_id,event_type_id,customer_name,customer_email,customer_phone,start_at,end_at,status,payment_status) values ('<business A>','<free event type of business B>','x','x@x','1',now(),now()+interval '30 min','confirmed','pending'); and confirm whether the row is accepted.
```

**Deployment check:**
```
On the live project run the same has_table_privilege query and inspect pg_policies for public.bookings, then attempt the insert against a staging tenant and check whether the owner's panel shows the injected row.
```

### The anon insert policy imposes no bound on start_at or end_at, so one anonymous row can occupy an arbitrarily long window in a tenant's calendar

**Fingerprint:** `0001_agenda_schema.sql:58+anon-insert-unbounded-interval`

**Claimed root cause:** Interval validity was treated as a client-side concern in the booking flow, so the only server-side interval control is the collision constraint, which is a different property from bounds.

**Evidence anchors:**
- `supabase/migrations/0002_booking_free_only.sql:8` — no predicate on start_at or end_at
- `supabase/migrations/0001_agenda_schema.sql:103` — the original anon_insert_booking policy likewise omits both columns
- `supabase/migrations/0001_agenda_schema.sql:66` — collision-only constraint, no duration or lower-bound constraint
- `supabase/migrations/0001_agenda_schema.sql:23` — event_types.duration_minutes exists but is not referenced by any write-time check

**Blocking facts:**
- Effective anon INSERT privilege on public.bookings is not stated in either migration.
- Supabase's default privileges for the anon role are a live-project fact.

**Local check:**
```
Apply both migrations locally, then as anon insert a row with start_at = now() and end_at = now() + interval '10 years' for a free active event type, and attempt a normal 30-minute booking for the same business_id to confirm the exclusion error 23P01.
```

**Deployment check:**
```
Run select has_table_privilege('anon','public.bookings','INSERT') and, in a staging tenant, reproduce the wide-range insert and the follow-on collision.
```

### Four anon SELECT policies use USING (true) with no tenant scoping or column restriction, exposing every tenant's business profile and working hours

**Fingerprint:** `0001_agenda_schema.sql:97+anon-read-policies-using-true`

**Claimed root cause:** The public page needs tenant data to render, and the policies were opened to the whole table rather than scoped to the tenant the request is actually for, relying on the client's own eq('business_id', ...) filters as if they were the access control.

**Evidence anchors:**
- `supabase/migrations/0001_agenda_schema.sql:97` — anon_read_business using (true)
- `supabase/migrations/0001_agenda_schema.sql:99` — anon_read_schedules using (true)
- `supabase/migrations/0001_agenda_schema.sql:100` — anon_read_exceptions using (true)
- `supabase/migrations/0001_agenda_schema.sql:10` — owner_id is inside the publicly readable row
- `src/agenda/adapters/agendaAdapter.ts:93` — the app's own reads are correctly tenant-scoped, confirming the broad grant is unnecessary

**Blocking facts:**
- No explicit grant select on these tables to anon appears in either migration, so effective privilege is a live-project fact.
- Supabase's default privileges for anon are platform configuration, not visible in this target.

**Local check:**
```
Apply both migrations locally, then as anon run: select * from public.businesses; and select count(*) from public.schedules; and confirm rows from multiple tenants are returned.
```

**Deployment check:**
```
Run the same two queries with the anon key from the deployed bundle and count distinct business_id values returned.
```

## B. The `cancel_token` capability chain

### The SECURITY DEFINER RPC returns the entire public.bookings composite to the anon role, so any holder of a cancel_token reads back customer PII and payment fields

**Fingerprint:** `0001_agenda_schema.sql:122+definer-rpc-returns-full-booking-composite`

**Claimed root cause:** The function was written to return the updated row for convenience, and its return type was never reduced to the fields a manage-booking response actually needs.

**Evidence anchors:**
- `supabase/migrations/0001_agenda_schema.sql:122` — returns public.bookings - the composite type, not a reduced projection
- `supabase/migrations/0001_agenda_schema.sql:153` — return v_booking hands the full row back
- `supabase/migrations/0001_agenda_schema.sql:108` — anon_read_own_booking using (false) shows the intent to withhold this row from anon
- `supabase/migrations/0001_agenda_schema.sql:55` — customer_name is part of the returned composite
- `src/agenda/adapters/agendaAdapter.ts:183` — the client already performs the equivalent direct token lookup

**Blocking facts:**
- Obtaining a working cancel_token depends on the insert path, which is currently broken by the client-supplied non-uuid token recorded separately in this report.
- Whether a live deployment issues usable tokens at all is a deployed-state fact.

**Local check:**
```
Apply both migrations locally, insert a booking as an owner with a valid uuid cancel_token, then as anon call select public.secure_manage_booking('<token>'::uuid,'cancel') and confirm the returned row exposes customer_email and customer_phone.
```

**Deployment check:**
```
In staging, repeat the call and inspect the JSON response shape for the full composite.
```

### cancel_token is a permanent, non-rotating, non-single-use bearer with no principal binding, and it is the sole key to cancellation, reschedule and PII readback

**Fingerprint:** `0001_agenda_schema.sql:63+cancel-token-no-expiry-or-rotation`

**Claimed root cause:** The capability was modelled as an identifier rather than as a revocable session, and no lifecycle columns or consumption semantics were added to the schema.

**Evidence anchors:**
- `supabase/migrations/0001_agenda_schema.sql:63` — cancel_token uuid default gen_random_uuid() - no expires_at, no used_at, no revoked_at
- `supabase/migrations/0001_agenda_schema.sql:130` — token-only lookup, no binding to the booking's customer identity
- `supabase/migrations/0001_agenda_schema.sql:136` — cancel sets status only; the token is not consumed or rotated
- `src/agenda/adapters/agendaAdapter.ts:183` — client-side token lookup selects the full row with joins

**Blocking facts:**
- Whether a usable token is ever issued is currently blocked by the malformed client-supplied token recorded separately in this report.
- Actual token exposure depends on how the manage link is delivered, which is outside this target.

**Local check:**
```
Apply both migrations locally, create a booking as an owner with a valid uuid token, call the RPC with action 'cancel', then call it again with the same token and confirm it still succeeds.
```

**Deployment check:**
```
In staging, verify the same reuse behaviour and confirm no token rotation occurs after cancellation.
```

## C. Delivery-layer configuration

### No Content-Security-Policy is declared anywhere in the repository, so the authenticated owner surface that performs single-call destructive deletes has no framing defence

**Fingerprint:** `index.html:1+no-csp-frame-ancestors`

**Claimed root cause:** The SPA is deployed as static assets, so the response header that would carry frame-ancestors is emitted by infrastructure that lives outside this repository and was never constrained from within it.

**Evidence anchors:**
- `index.html:1` — the document head contains no Content-Security-Policy meta element
- `src/agenda/adapters/agendaAdapter.ts:199` — destructive delete on event_types
- `src/agenda/adapters/agendaAdapter.ts:207` — destructive delete on schedules

**Blocking facts:**
- The actual response headers are emitted by the deployment edge or the parent hub, neither of which is inside this target, so a source-only review cannot confirm the absence of a server-side header.

**Local check:**
```
Serve the built assets and inspect the response: curl -sI http://localhost:5173/ | grep -i content-security-policy - and confirm the header is absent.
```

**Deployment check:**
```
curl -sI https://<deployed-host>/<agenda-route>/ and check for content-security-policy, then load the owner panel inside a cross-origin iframe and confirm it renders.
```

## D. Deployed schema drift

### public.reminders is RLS-enabled with zero policies while the client discards the rejection, so reminder creation silently fails with no signal

**Fingerprint:** `0001_agenda_schema.sql:89+reminders-rls-no-policies-client-swallows-error`

**Claimed root cause:** The reminders table was added to the RLS sweep at 0001:89 but never received the policy it needs, and the client treated the insert as best-effort, which converted a hard failure into a silent one.

**Evidence anchors:**
- `supabase/migrations/0001_agenda_schema.sql:89` — RLS enabled on reminders
- `supabase/migrations/0001_agenda_schema.sql:95` — the bookings policies stop at line 95; no reminders policy exists in the file
- `src/agenda/adapters/agendaAdapter.ts:178` — empty catch body discards the RLS rejection

**Blocking facts:**
- Confirming that no policy was added outside the two migration files requires the live project's pg_policies view, and migrations applied out of band would not be visible in this target.

**Local check:**
```
Apply both migrations locally, then as the authenticated owner attempt an insert into public.reminders and confirm the RLS rejection, and confirm the client continues as if it succeeded.
```

**Deployment check:**
```
Run select * from pg_policies where tablename = 'reminders'; and check the reminders table for rows to confirm none were ever created.
```

## E. Runtime behaviour and error verbosity

### Raw upstream database error text is returned and rendered to unauthenticated visitors, exposing schema and constraint detail and acting as an enumeration oracle

**Fingerprint:** `src/agenda/context/AgendaContext.tsx:203+raw-upstream-error-rendered-to-anonymous`

**Claimed root cause:** The adapter forwards the driver's error object unchanged and the page renders whatever it is given, so an upstream-internal diagnostic becomes user-facing copy on the unauthenticated surface.

**Evidence anchors:**
- `src/agenda/context/AgendaContext.tsx:203` — raw error.message returned to the caller
- `src/agenda/context/AgendaContext.tsx:200` — SQLSTATE and constraint-name matching on the upstream message
- `src/agenda/pages/PublicBookingPage.tsx:107` — the message is stored for display on the public form

**Blocking facts:**
- The precise set of disclosed details depends on the PostgREST error verbosity configured on the live project, which is a deployed setting.
- The exact rendering of the error in the DOM could not be confirmed by execution in this run.

**Local check:**
```
Serve the app, submit a booking that triggers the exclusion constraint, and inspect the message shown on the public form for table, column, constraint or SQLSTATE detail.
```

**Deployment check:**
```
Repeat against a staging tenant and set PostgREST error verbosity to its current value before comparing.
```

---

## Batch sequence

Run **A** first. It is one query and it decides four findings. If `anon` has no `INSERT` on `public.bookings`, findings 4 and 5 are not reachable and drop to informational; if it does, both become live and the free-only policy needs the tenant binding before anything else is fixed.

Run **B** second, after finding 2 is fixed, because a usable token does not exist until the insert stops failing.

Run **C** and **D** once; both are read-only catalog or header queries.

Run **E** last, in staging, so error verbosity is observed at its production setting.
