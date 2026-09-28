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
