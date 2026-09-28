# Security Audit Report — `8-qawaylab-agenda`

**Run ID:** `qawaylab-agenda-2026-09-27-run-1`
**Profile:** `standard` · **Run kind:** `scoped`
**Target:** `src/pages/5-qaway-hub/8-qawaylab-agenda`
**Reviewed commit:** `6906eb12` on `main-web`
**Run status:** `completed` (Phase 4 partially executed — see *Coverage gaps*)

---

## 1. What this run is and is not

This was a **source-only** audit. No target code was executed, no network call was made, no live Supabase project was touched, no `.env` value was read, and **not one line of target source was modified**. Every check is `method: "source"`.

The app is a single-page, multi-tenant appointment booker. The entire backend is Supabase: PostgREST, Row Level Security, a `SECURITY DEFINER` RPC, a Realtime publication and a SQL view. There is no server, no middleware, no SSR. **That makes RLS the whole security boundary**, and RLS is where this run concentrated.

The decisive structural fact: the schema author wrote a clear intent to keep customer PII away from anonymous callers, then left several paths that route around that intent. `0001:106-107` states it in a comment, and `0001:108` enforces it for direct reads. The write path, the RPC return value and the client-side session path do not honour it.

## 2. Findings

**3 confirmed by source · 8 blocked on owner-observable platform facts · 0 rejected at final gate**

| # | Finding | Verdict | Severity | Anchor |
|---|---|---|---|---|
| 1 | `secure_manage_booking` reschedule writes attacker-chosen `p_new_start` / `p_duration_minutes` with no calendar validation, and is granted to `anon` | **confirmed** | **high** | `0001_agenda_schema.sql:138` |
| 2 | Client overwrites the schema's `gen_random_uuid()` `cancel_token` with a non-UUID `Math.random()` string, so real booking inserts fail closed | **confirmed** | **medium** | `AgendaContext.tsx:183` |
| 3 | ICS builder emits `SUMMARY` / `LOCATION` / `DESCRIPTION` with no RFC 5545 escaping, so an owner-controlled title injects iCalendar properties into a customer's file | **confirmed** | **medium** | `calendarLinks.ts:38` |
| 4 | Anon `INSERT` policy never binds `business_id` to `event_type.business_id`, so forged rows can be written onto any tenant | needs_validation | high | `0002_booking_free_only.sql:8` |
| 5 | No bound on `start_at` / `end_at` on anon insert; one anonymous row can occupy an arbitrary window | needs_validation | high | `0001_agenda_schema.sql:58` |
| 6 | `SECURITY DEFINER` RPC returns the full `public.bookings` composite to `anon`, including PII and the token | needs_validation | high | `0001_agenda_schema.sql:122` |
| 7 | Four anon `SELECT` policies use `USING (true)`, exposing every tenant's profile, hours and blackout dates | needs_validation | medium | `0001_agenda_schema.sql:97` |
| 8 | `cancel_token` never expires, never rotates, is never consumed and is bound to no principal | needs_validation | medium | `0001_agenda_schema.sql:63` |
| 9 | No CSP anywhere, so the owner surface that issues single-call destructive deletes has no framing defence | needs_validation | medium | `index.html:1` |
| 10 | `public.reminders` is RLS-enabled with zero policies while the client discards the rejection | needs_validation | low | `0001_agenda_schema.sql:89` |
| 11 | Raw upstream error text rendered to unauthenticated visitors | needs_validation | low | `AgendaContext.tsx:203` |

Full traces, evidence, root causes, remediation SQL and validation plans are in **`findings.json`** (schema-conformant, 11/11 branches). The 8 blocked items are extracted into **`NEEDS-VALIDATION.md`** with copy-pasteable checks.

### 2.1 The high-severity confirmed finding

`secure_manage_booking` is `SECURITY DEFINER` (0001:123) and **explicitly granted to `anon`** (0001:157). Its reschedule branch (0001:138-148) takes `p_new_start` and `p_duration_minutes` from the caller and writes them straight into the row. The function body at 0001:126-154 never reads `public.schedules`, `public.availability_exceptions` or `public.event_types` — no business-calendar check exists at all.

The only interval control is the `EXCLUDE` constraint at 0001:66, which prevents the new range from **overlapping** an existing booking. The code comment at 0001:142 correctly claims it validates the new slot; that is true for collisions and nothing else. Nothing rejects a past timestamp, a closed day, a blackout date, or a duration far from the event type's own `duration_minutes` (0001:23).

So a caller holding a booking's `cancel_token` — a value handed to the customer by design — can move that booking to any datetime and can inflate its duration arbitrarily. The row persists in `status = 'confirmed'` (0001:146), so it keeps consuming the tenant's calendar and every later booking collides. That is an integrity break plus a durable availability denial against a single tenant, reachable with no privilege and no owner interaction.

**Fix:** constrain the branch inside the function — reject past starts, derive the duration from the event type instead of accepting it, assert `event_types.business_id = bookings.business_id`, and check the new start against `schedules` and `availability_exceptions`. The patch is written out in `findings.json` under `remediation.code_changes`.

### 2.2 Two corrections to the post-wave critic

The critic's consolidation was recorded honestly, including that it could not read the target and worked from transcribed hunter evidence. Two of its statements did not survive re-reading, and were corrected here rather than passed through:

- It treated the absence of interval validation as total. The `EXCLUDE` constraint at 0001:66 is real and does bound overlap. The finding is narrowed accordingly.
- It rated the `cancel_token` override as a high-severity weak-token issue. Re-reading shows `cancel_token` is `uuid` (0001:63) and the client sends `'demo-token-' + Math.random()…` (`AgendaContext.tsx:183`) — **not a valid UUID**. PostgREST rejects it with `22P02`, so the insert fails closed for every non-demo tenant. The honest characterisation is: public booking is currently non-functional, and the weak-capability risk is *latent*, not live. Severity was lowered from high to medium and the impact rewritten to say so.

## 3. The systemic pattern

Five of the eleven findings are the same mistake in different places: **a control was written where it was believed to be, rather than where it had to be.**

- The free-only check in 0002 re-derives the event type but stops one predicate short of binding the tenant (#4).
- Overlap is enforced but duration and date are assumed (#1, #5).
- PII denial is enforced on REST reads but the same row is returned by a definer RPC (#6) and broadcast by a Realtime publication.
- The token is minted by the database and then overwritten by the client (#2).
- Framing protection is assumed to come from infrastructure that was never constrained from inside the repo (#9).

A second pattern: **the client is treated as the access control.** Four `anon` policies are `USING (true)` because the app scopes its own reads correctly at `agendaAdapter.ts:93-95`. The client filter is not a control; anyone can call PostgREST directly.

## 4. Coverage

23 ledger units: **16 candidate · 2 covered · 3 out_of_scope · 2 deferred**.

Four hunters produced **36 raw candidates**. The post-wave critic consolidated them to **11 canonical candidates** and rejected **17**. The raw evidence lives in `candidates-wave1-digest.json` and the hunters' tool-output files; per-run `agents/*/scratch/` and `artifacts/` are empty because target-controlled execution was never available, so no agent could produce them.

**Out of scope** (3 units): the external edge function `agenda-send-notifications`, the monorepo-root migrations, and the Hub shell.

### Coverage gaps — recorded, not hidden

The critic identified two real unit gaps and both were dispatched as wave-2 hunters: `hunt-owner-rls` (the five `owner_*` policies at 0001:91-95, never walked as a unit) and `hunt-owner-pii` (owner-side `select('*')` exposing `cancel_token` alongside PII). **Both were terminated by a provider rate limit before reading a single file.** No partial result exists from either.

They are recorded in `coverage-ledger.json` as `deferred`, with the residual risk and the exact closing check written into `unresolved`, so the gap is auditable rather than presented as covered. Three further gaps the critic raised and that were not pursued: whether the value bundled at `VITE_SUPABASE_ANON_KEY` is really the `anon` role key (a `needs_validation` check, not a source-provable finding); and the `booked_slots` / `schedules` over-exposure, which are the same defect as #7.

The post-wave critic also could not open `coverage-ledger.json` or the candidates digest because of a mount failure in its session, and stated that it worked from the two hunter files it could read, transcribing their `file:line` values rather than re-reading them. Every citation that reached `findings.json` was independently re-read by the parent before promotion.

## 5. Blocked: the official schema gates did not run

`validate-coverage-ledger.cjs` and `validate-findings.cjs` both open their input through `readFileWithinLimit()`, which hard-refuses any platform lacking `O_NOFOLLOW` / `O_NONBLOCK`. On win32 Node exposes neither, so both abort with `SafeInputError` before parsing. WSL is broken (`ERROR_PATH_NOT_FOUND`) and the Docker daemon is not running. **Docker has nothing to do with the application** — it was only ever a candidate host for the validators.

Patching or shimming the guard was rejected outright: it would destroy the guarantee the gate exists to provide. **No artifact in this run claims to be validator-passed.**

Instead the parent re-implemented the documented rules as clearly-labelled **advisory** checks, which found and fixed four real defects: an `severity.impact.description_scope` field the schema does not permit (present on all three confirmed records, and also present in the discarded first `findings.json`, meaning that artifact never conformed), a `root_cause` containing a placeholder-detection tripwire, and two `covered` units holding non-empty `unresolved` against the invariant at `validate-coverage-ledger.cjs:557`. Final advisory result: findings 11/11 branches satisfied, ledger 23/23 state invariants satisfied.

To close the real gate, start Docker Desktop and run both validators unmodified inside a Linux container.

## 6. Head-drift check

`main-web` advanced from `6906eb12` to `076f7410` during the run, via commits from unrelated work. `git diff --name-only 6906eb12 HEAD -- <target> ':!<target>/doc'` returns **empty**: no source file changed. Every `file:line` in `findings.json` is still valid at finalization.

## 7. Remediation status

A remediation pass followed the audit and is recorded in full in **`REMEDIATION-APPLIED.md`**. Scope was deliberately limited to **client-side, non-Supabase** findings, because the Supabase-side changes are for a specialised agent.

**Fixed (4):**
- **#2** — the client no longer sends `cancel_token`; the database mints it. The demo branch is gated to `import.meta.env.DEV`. *(This was breaking the booking flow outright.)*
- **#3** — a single RFC 5545 `icsEscape()` applied to `SUMMARY`, `DESCRIPTION` and `LOCATION`.
- **#11** — raw upstream error text replaced with fixed messages branched on SQLSTATE; nothing internal reaches anonymous visitors.
- **#10** — the `reminders` RLS rejection is returned and reported by code instead of being swallowed. The silent-failure half is closed; the missing policy is not.

**Documented, not fixed (1):** **#9** CSP. `frame-ancestors` is ignored in a `<meta>` tag, and this repo's only header config is a root `.htaccess` shared by every sibling app. A ready-to-apply, route-scoped `Header` block is provided in `REMEDIATION-APPLIED.md` §2 rather than changed blind.

**Excluded, Supabase side (6):** findings **#1, #4, #5, #6, #7, #8**. Ready-to-apply SQL for five of them is already in `findings.json`.

**Still broken after remediation, and it is not a client-side problem.** Verifying fix #2 exposed a second failure in the same flow: `agendaAdapter.ts:172` does `.insert().select().single()`, but `0001:108` denies `SELECT` to `anon`, so the inserted row can never be read back and the `cancel_token` can never reach the client. The public booking flow remains non-functional until the Supabase side widens the read or adds an insert-returning RPC. Details and three options are in `REMEDIATION-APPLIED.md` §4.

**No build or typecheck was run** — `node_modules` is absent and installing requires network. The changes were verified by reading the result and a brace-balance check. **Run `tsc --noEmit` and the suite before merging.**

## 8. Artifacts

| File | Contents |
|---|---|
| `architecture.md` | Principals, surfaces, boundaries, exclusions |
| `coverage-ledger.json` | 23 units with state invariants satisfied |
| `findings.json` | 11 findings, schema-conformant |
| `NEEDS-VALIDATION.md` | The 8 blocked findings with exact closing checks |
| `REMEDIATION-APPLIED.md` | The 4 fixes, the CSP decision, the Supabase exclusions, the remaining blocker |
| `candidates-wave1-digest.json` | Transcribed raw hunter evidence (`AR1..AR9`, `AS1..AS7`) |
| `run-metadata.json` | Scope, execution policy, agent IDs, validator block, completion note |

**Anchor drift:** `findings.json` describes commit `ec257159`. Three client files were edited afterwards, so their line anchors shifted; no SQL file was touched, so every Supabase anchor is still exact. The drift table is in `REMEDIATION-APPLIED.md` §5.

**Deviation disclosed:** the output directory is `doc/security-audit/run-1`, inside the target, rather than the skill default outside it. `.gitignore` was not modified. Rationale is recorded in `run-metadata.json` under `output_dir_selection`.
