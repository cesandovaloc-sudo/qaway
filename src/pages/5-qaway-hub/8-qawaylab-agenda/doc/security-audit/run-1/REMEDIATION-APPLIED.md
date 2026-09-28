# Remediation Applied — `8-qawaylab-agenda`

**Run ID:** `qawaylab-agenda-2026-09-27-run-1`
**Baseline commit (state the findings describe):** `ec257159`
**Scope of this pass:** client-side, non-Supabase findings only.
**Build/typecheck:** **not run.** `node_modules` is absent and `npm install` requires network, which is prohibited for this run. Every change below was verified by reading the resulting code and by a brace-balance check, not by compiling. **The typecheck must be run by the owner before merging.**

---

## 1. Fixed

### Fix A — Client no longer overrides the server-minted `cancel_token`
**Finding:** #2 (confirmed, medium) · **Fingerprint:** `src/agenda/context/AgendaContext.tsx:183+client-overrides-cancel-token-default`

- **Was:** `AgendaContext.tsx:183` sent `cancel_token: 'demo-token-' + Math.random().toString(36).substring(2, 9)` in the insert payload, overriding the `gen_random_uuid()` default at `0001:63`. The value was not even a valid `uuid`, so PostgREST rejected every real booking insert with `22P02`.
- **Now:** the field is absent from the payload (`AgendaContext.tsx:175-186`) and the database mints it. The demo branch is hard-gated to `import.meta.env.DEV` (`AgendaContext.tsx:190`) so it can never execute in production, and its fabricated token is now a real UUID via `crypto.randomUUID()` (`AgendaContext.tsx:194`) so the local manage-link path still works.

### Fix B — RFC 5545 escaping in the ICS builder
**Finding:** #3 (confirmed, medium) · **Fingerprint:** `src/agenda/utils/calendarLinks.ts:38+ics-summary-unescaped`

- **Was:** `SUMMARY`, `LOCATION` and `DESCRIPTION` were interpolated raw; only `DESCRIPTION` newlines were replaced, which is not RFC 5545 escaping.
- **Now:** a single `icsEscape()` helper at `calendarLinks.ts:33` escapes backslash first, then semicolon, comma, CR and LF, and is applied to all three properties (`calendarLinks.ts:52-54`). The `new Blob` sink moved to `calendarLinks.ts:63`.

### Fix C — Upstream error text no longer reaches anonymous visitors
**Finding:** #11 (needs_validation, low) · **Fingerprint:** `src/agenda/context/AgendaContext.tsx:203+raw-upstream-error-rendered-to-anonymous`

- **Was:** `return { error: error.message || 'Error al reservar' }` forwarded the raw PostgREST message to `PublicBookingPage.tsx:107`, which displays it to an unauthenticated visitor. Table, column, constraint and SQLSTATE detail were disclosed.
- **Now:** `AgendaContext.tsx:204-220` branches on the SQLSTATE/PostgREST code and returns a fixed, human-readable Spanish string. `error.message` is only used for the pre-existing `23P01` overlap test, which does not leave the machine. `PublicBookingPage.tsx` was left unchanged — the sanitization happens upstream, so the sink is closed at the source.

### Fix D — The `reminders` RLS rejection is no longer silent
**Finding:** #10 (needs_validation, low) · **Fingerprint:** `0001_agenda_schema.sql:89+reminders-rls-no-policies-client-swallows-error`

- **Was:** `agendaAdapter.ts:175-181` wrapped the insert in a `try/catch` with an empty body. supabase-js does not throw — it returns `{ error }` — so the catch was dead code and the RLS rejection was discarded entirely. The `try/catch` in the caller was dead for the same reason.
- **Now:** `insertReminders` returns `{ error }` (interface `agendaAdapter.ts:17`, implementation `agendaAdapter.ts:175-181`), and the caller (`AgendaContext.tsx:225-232`) reports the rejection via `console.warn` with only the error **code**, never the message, so no schema detail is logged. Reminders stay best-effort: the booking is never failed by a reminder rejection.

**This fix removes the silence, not the cause.** The cause is the missing RLS policy on `public.reminders`, which is Supabase-side and was not touched.

## 2. Documented, not fixed

### Finding #9 — no Content-Security-Policy
The correct place for `frame-ancestors` is an HTTP response header, and **`frame-ancestors` is ignored when delivered in a `<meta http-equiv>` tag**. This repo's only header configuration is `.htaccess` at the monorepo **root** (plus `dist/` and `public/`), all outside the audited target and shared by every sibling app. Adding a CSP there without a build and deploy check risks breaking five other applications, so it was not changed blindly.

**Owner action:** add to the root `.htaccess`, scoped to this route so siblings are unaffected:

```apache
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "frame-ancestors 'none'; form-action 'self'; object-src 'none'; base-uri 'self'" env=AGENDACSP
  SetEnvIf Request_URI "^/agenda" AGENDACSP=1
</IfModule>
```

Verify the deployed header with `curl -sI https://<host>/agenda | grep -i content-security-policy`, then confirm the owner panel still loads. `script-src` was deliberately omitted: a correct policy needs the exact Vite build hash and cannot be validated without a build, which is out of scope here.

## 3. Explicitly excluded — Supabase side, for a specialised agent

These six findings were **not touched**. All of them live in `supabase/migrations/` or in RLS/grant/RPC semantics.

| Finding | Anchor | Needs |
|---|---|---|
| #1 `secure_manage_booking` reschedule unvalidated (**high, confirmed**) | `0001:138-148`, grant at `0001:157` | Constrain the branch; drop the `anon` execute grant |
| #4 anon insert does not bind `business_id` | `0002:8-19` | Add `e.business_id = business_id` to the `exists` predicate |
| #5 no bound on `start_at`/`end_at` | `0001:58-59`, `0001:66` | Add interval bounds; constrain against `event_types.duration_minutes` |
| #6 definer RPC returns the full composite | `0001:122`, `0001:153` | Reduce the return type to a projection |
| #7 four anon `USING (true)` policies | `0001:97-100` | Scope by tenant or by request; restrict columns |
| #8 `cancel_token` never expires or rotates | `0001:63`, `0001:130` | Add lifecycle columns and single-use consumption |

Ready-to-apply SQL for #1, #4, #5, #6 and #8 is already written out in the `remediation.code_changes` and `claimed_root_cause` fields of `findings.json` and does not need to be re-derived.

## 4. Blocker discovered while verifying Fix A

**The public booking flow is still non-functional, and the remaining cause is Supabase-side.**

`agendaAdapter.ts:172` performs `supabase.from('bookings').insert(booking).select().single()`. The trailing `.select()` is a read, and `0001:108` declares `anon_read_own_booking ... using (false)`. The `anon` role therefore cannot read back the row it just inserted, so the `RETURNING` clause is filtered to zero rows and PostgREST returns `PGRST116` — the client can never obtain the `cancel_token`, so the manage-booking link can never be built.

Fix A removed the malformed-UUID failure. This `RETURNING`-blocked-by-RLS failure is the next one, and it cannot be fixed client-side. The agent handling the Supabase side must choose one of:

- narrow `anon_read_own_booking` so a just-inserted row is readable, or
- add an `INSERT ... RETURNING` RPC executed by `anon` that returns only `id` and `cancel_token`, or
- have the insert carry no token at all and authenticate the customer before issuing a manage link.

A friendly message for `PGRST116` was added at `AgendaContext.tsx:213-215` so the failure is no longer silent or confusing, but it is a mitigation, not the fix.

## 5. Line-anchor drift

`findings.json` describes the tree as of commit `ec257159`, which is the correct reference for the audit. All anchors in the three modified client files have since shifted:

| File | Was | Now | Key anchors moved |
|---|---|---|---|
| `src/agenda/context/AgendaContext.tsx` | 382 lines | 402 lines | old `:183` → new `:172-186`; old `:203` → new `:204-220` |
| `src/agenda/utils/calendarLinks.ts` | 58 lines | 66 lines | old `:38` → new `:52` |
| `src/agenda/adapters/agendaAdapter.ts` | 215 lines | 215 lines | old `:175-181` → new `:175-181` (unchanged position, changed body) |

No SQL file was modified, so every Supabase-side anchor remains exactly valid.

## 6. Verification actually performed

- Brace-balance check on all three edited files: balanced.
- `import.meta.env` confirmed already in use in this target (`HomePage.tsx:9`, `supabase.ts:3-4`), so the `import.meta.env.DEV` gate matches existing convention.
- `console` usage confirmed already present (`supabase.ts:9` uses `console.error`), so `console.warn` matches existing convention.
- `insertReminders` has exactly one call site, updated; the interface signature, the implementation and the caller were all changed together.
- **Not** performed: `tsc`, `vite build`, `eslint`, and any runtime test. No build was run, per instruction and per the no-network constraint.

---

## 7. Backend remediation — applied by a specialised agent

**Status update, `2754cbd8` (`2026-09-28 15:39`):** the six Supabase-side findings excluded in §3 were implemented by a specialised agent. This section is the record of what actually landed. It was written by reading the applied migration, not by the agent that wrote it.

**Location matters.** The change is **not** in this run's directory. It went to the monorepo's central migration chain:

```
supabase/migrations/20260928160000_fix_agenda_security_hardening.sql   (345 lines, 12,759 bytes)
```

Its header declares the dependency `20260920102000_agenda_coupled_central.sql`, which exists and sorts earlier, so migration order is correct.

### Disposition of the six excluded findings

| Finding | Status | Evidence in the applied migration |
|---|---|---|
| #1 reschedule unvalidated | **resolved** | L72 token-expiry check, L78 `v_duration := coalesce(v_ev.duration_minutes, 30)`, L113 rejects a caller duration that differs from the event type, L121-125 checks `availability_exceptions`, L136 checks `schedules` |
| #4 tenant binding missing | **resolved** | L231 `if v_ev.business_id is distinct from p_business_id then` inside `secure_create_booking` |
| #5 unbounded interval | **resolved** | L241 derives duration from the event type; L254 and L264 validate exceptions and schedules on the create path |
| #6 definer RPC returns full composite | **resolved** | L187 introduces `secure_create_booking`, which returns only `cancel_token, token_expires_at, token_consumed_at` (L292) instead of the row |
| #7 anon `USING (true)` policies | **resolved** | L19 `revoke all on public.bookings from anon`, L21-23 drop the three anon policies on `bookings`, L30 `revoke select (owner_id, whatsapp_number, branding) on public.businesses from anon` |
| #8 token has no lifecycle | **resolved** | L12 `token_expires_at timestamptz default (now() + interval '30 days')`, L14 `token_consumed_at`, L165 rotation on reschedule, consumption on cancel |

### Two findings were also closed that this run had left open

- **The `RETURNING`-blocked-by-RLS blocker from §4 is resolved.** L17-18 declare that the public flow now goes entirely through an RPC: `revoke all on public.bookings from anon` means anon has no direct `INSERT`, so the `.insert().select().single()` path that produced `PGRST116` is gone. The booking flow no longer depends on an anon SELECT policy.
- **The missing `reminders` RLS policy is resolved.** L322 adds `agenda_auto_reminders()`, so reminders are created server-side by trigger rather than by the client insert that RLS was rejecting. The §1 Fix D observability change remains valid and is now informational rather than load-bearing.

### Not addressed

- **Server-side `buffer_minutes` enforcement.** A search for `buffer` in the migration returns nothing. The `EXCLUDE USING gist` constraint at `0001:66` only tests raw `start_at`/`end_at` overlap, so two back-to-back bookings can still ignore the configured buffer. The buffer is applied in the client slot generator (`AgendaContext.tsx:155`) and displayed in the panel, but nothing prevents a direct write from violating it. This was recorded in §1 as a product gap rather than a security finding, and it is still open.
- **The Realtime publication.** `0001:112` still adds `public.bookings` to `supabase_realtime`, and the applied migration does not remove it. Whether that leaks PII depends on deployed Realtime RLS enforcement, which remains unverified. This was never one of the 11 canonical findings because it is a `needs_validation` question, but it is unresolved.
- **The 8 `needs_validation` findings in `NEEDS-VALIDATION.md` have not been re-run.** Several of them were `needs_validation` precisely because they depended on effective grants; the grants changed materially in `2754cbd8`, so their local and deployment checks should be re-executed before any of them is promoted or retired.

### Encoding note

Lines 10, 16, 27 and others contain mojibake in their comment separators (`�"?�"?` instead of a box-drawing character). It is confined to comments and has no functional effect, but it will not render correctly in a diff review.

### Two migration sources exist for the agenda schema

This is an architectural question this audit did not raise and should be settled before deployment:

- **App-local:** `src/pages/5-qaway-hub/8-qawaylab-agenda/supabase/migrations/` — `0001_agenda_schema.sql`, `0002_booking_free_only.sql`
- **Central:** `supabase/migrations/` — 55 migrations including `20260920102000_agenda_coupled_central.sql` and the new `20260928160000_fix_agenda_security_hardening.sql`

The new hardening migration targets the central schema and hard-codes policy names that exist in the app-local `0001` (`anon_insert_booking`, `anon_read_own_booking`, `anon_update_own_booking`). It is therefore not clear which chain is authoritative. If the app-local files are legacy, they should be archived or annotated as such, because a future contributor applying them to a fresh database would reconstruct the vulnerable policies this audit just removed. **This is the single highest-value follow-up item.**
