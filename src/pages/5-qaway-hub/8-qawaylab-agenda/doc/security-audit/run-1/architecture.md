# Architecture — qawaylab-agenda (scoped run 1)

## 1. Product, principals, normal authority, protected resources

Multi-tenant, white-label appointment-booking SPA (Peru, PEN) modelled on Cal.com. Served to a small-business operator ("Negocio") who configures service types and weekly availability, and to an anonymous end customer who books a 3-step slot. Sold per customer, each with its own Supabase project (`README.md:3`, `AGENTS.md:16`).

Principals, by design, from source:

- **P0 anonymous visitor** — holds only the publishable anon key. Reads businesses, active event types, schedules, availability exceptions, and the `booked_slots` view; inserts one `bookings` row. This is the lowest-trust surface and the only one reachable without an account.
- **P1 booking customer (no account)** — holds a bearer capability (`cancel_token`) in a URL path. Authorizes cancel/reschedule, not read.
- **P2 business owner** — Supabase `authenticated` session plus a `businesses` row with `owner_id = auth.uid()`. Full CRUD on its own tenant.
- **P3 any self-registered account** — `signUp` and Google OAuth are open (`agendaAdapter.ts:41,45`); any success is auto-provisioned as a tenant owner (`agendaAdapter.ts:60-72`).
- **P4 demo pseudo-user** — client-fabricated `Session` (`AgendaContext.tsx:290-353`); no DB privilege.

Protected resources: customer PII (`bookings.customer_name/email/phone`, `0001:55-57`), tenant separation, `businesses.whatsapp_number` and `branding` (`0001:12-13`), and the integrity of each tenant's calendar.

## 2. Comparable baseline

Cal.com (`README.md:3`, `0001:2`) and the Calendly/Picktime family (`DESIGN.md:52`). Cal.com's trade-off: it authenticates the *booker* before revealing a slot and derives every authorization decision server-side from the authenticated principal. This target accepts the opposite trade-off — anonymous write access, capability-token mutation, and a PII-free projection view as the public occupancy channel. That baseline is calibration only; it does not excuse a demonstrated defect, and the token-in-URL capability pattern is precisely the class of design that has leaked in comparable products.

## 3. Stack, deployment paths, offline limits

TypeScript/TSX + one JSX module. React 19, Vite 8, Tailwind v4, react-router-dom 7, `@supabase/supabase-js` 2.112, framer-motion, lucide-react, oxlint (`package.json:13-32`). No server, no middleware, no proxy, no SSR (`vite.config.js:1-15`).

Two entry shapes exist. The **live** one is a same-origin component mount: the hub lazy-loads `AgendaAppPage.jsx` at `/hub/agenda/*` (out-of-target `AppRouter.jsx:349-356`). The **standalone** SPA shape (`index.html:14` → `src/main.tsx` → `src/App.tsx`) is dead — `index.html:14` requests `/src/main.jsx`, which does not exist. Consequently `src/App.tsx` is unreachable and the real route table is `AgendaAppPage.jsx:34-47`.

No `node_modules` inside the target, no test file, no test-runner config, no lint config, no CI config, no `supabase/functions/` source. `npm install` needs the network (prohibited) and every functional path is a live Supabase call, so **no bounded local execution is possible**. This run is source-only; every check is `method: "source"`, `artifact: null`.

## 4. Entry surfaces and source-to-sink paths

1. `:slug` → `agendaAdapter.ts:89` `.eq('slug', slug)` → `businesses` under `anon_read_business ... using (true)` (`0001:97`). Any unknown slug silently returns a hardcoded demo business (`agendaAdapter.ts:110-169`).
2. `:slug/:eventSlug` → client-side `Array.find`, falling back to `eventTypes[0]` (`PublicBookingPage.tsx:47-55`).
3. `:token` → `agendaAdapter.ts:183` `.eq('cancel_token', token)` (denied for anon by `0001:108`) **and** `agendaAdapter.ts:190` `rpc('secure_manage_booking')` (`0001:121-157`, `security definer`, granted to anon at `0001:157`).
4. Public PII form → `AgendaContext.tsx:172-184` → `agendaAdapter.ts:172` anon `INSERT` into `bookings` under `0002:8-19`.
5. `panel` → `AdminPanelPage.tsx:443` `if (!session)` is the only client gate; all privileged writes delegate to RLS `0001:91-95`.
6. `booked_slots` view (`0001:115-118`, granted to anon at `0001:158`) bypasses `bookings` RLS.
7. `loginAsDemo` fabricates a session in React state and reaches the live insert path (`AgendaContext.tsx:106-110,186`).

## 5. Trust boundaries and strongest source-visible control

| Boundary | Strongest source-visible control |
|---|---|
| anon → PostgREST | RLS policies `0001:97-100`, `0002:8-19`; `0001:108,110` deny-all for read/update |
| anon → definer RPC | function body only: `0001:130` `where cancel_token = p_token`, `security definer` |
| anon → `reminders` | RLS on (`0001:89`), zero policies → deny-all, fail-closed |
| authenticated → own tenant | `0001:91-95`, tenant re-derived from `auth.uid()` — sound |
| browser-held session | `supabase.ts:19-21` localStorage, `storageKey` namespaced; `detectSessionInUrl` unset (library default true) |
| tenant provisioning | `0001:91` `with check (owner_id = auth.uid())`; client cannot forge an owner |

**The load-bearing asymmetry:** for the five `owner_*` policies the client-supplied `business_id` is only a filter and the grant is re-derived server-side. For `anon_insert_booking` (`0002:8-19`), `secure_manage_booking` (`0001:121-157`), and the `USING (true)` policies, the client's own value *is* the authorization input.

## 6. Starting paths

`supabase/migrations/0001_agenda_schema.sql`, `supabase/migrations/0002_booking_free_only.sql`, `src/agenda/adapters/agendaAdapter.ts`, `src/agenda/context/AgendaContext.tsx`, `src/agenda/pages/AdminPanelPage.tsx`, `src/agenda/pages/PublicBookingPage.tsx`, `src/agenda/pages/ManageBookingPage.tsx`, `src/agenda/pages/HomePage.tsx`, `src/agenda/utils/calendarLinks.ts`, `src/config/supabase.ts`, `src/App.tsx`, `AgendaAppPage.jsx`, `src/main.tsx`, `index.html`, `vite.config.js`, `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `README.md`, `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, `APP_IMPLEMENTACION.md`, `supabase/README.md`, `supabase/config.toml`.

## 7. Prior coverage, exclusions

No prior ledger or findings file exists for this target; `doc/` was created by this run. This is a first-run baseline, never a claim of exhaustion.

**Positive source patterns worth preserving:** the five `owner_*` policies re-derive the tenant from `auth.uid()` rather than trusting a body field; `search_path` is pinned on the definer function and every object reference is schema-qualified; `anon_read_own_booking`/`anon_update_own_booking` are `USING (false)` deny-all; `reminders` is fail-closed; `booked_slots` projects only four non-PII columns; the EXCLUDE constraint on `(business_id, slot_range)` makes double-booking atomic; session storage is namespaced; no `dangerouslySetInnerHTML`, `eval`, or `postMessage` exists anywhere.

**Documentation claims contradicted by source** (recorded as coverage-relevant, not as vulnerabilities): `README.md:16` promises a commented cron block that does not exist in either migration; `README.md:13` points at the local migrations as authoritative; `AGENTS.md:16` claims per-app Supabase isolation; `PRODUCT.md:22` claims a private database per customer; `APP_IMPLEMENTACION.md:17-18` claims a `storageKey` isolation that the hub build does not apply.

## 8. Companion selection

Selected: `DATA-ISOLATION-AND-LIFECYCLE.md` (multi-tenant RLS store, capability token as a signed-reference-shaped object, derived `booked_slots` copy, queued `reminders`); `WEB-PROTOCOL-AND-AUTH.md` (GoTrue sessions, OAuth/reset redirects, bearer capability in a URL, anon-key scope); `CLIENT-SIDE.md` (SPA, localStorage session, JSX rendering of attacker-controlled text, URL/ICS sinks, no CSP); `CLOUD-AND-DEPLOYMENT.md` (Supabase definer function as workload authority, no table GRANT/REVOKE, deployment facts not in source); `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md` (unauthenticated INSERT, unbounded queries, client-authoritative duration feeding a slot loop); `SUPPLY-CHAIN-AND-RELEASE.md` (16/16 floating dependency ranges, lockfile not consumed by the shipped build, unused runtime dep).

Excluded: `AI-AND-LLM.md` (no model, tool-call, or memory surface); `MEMORY-SAFETY-AND-BINARY.md` (no native, FFI, or parser code); `DESKTOP-MOBILE-AND-LOCAL-IPC.md` (no native shell, deep link, or webview bridge); `PROTOCOLS-RPC-AND-MESSAGING.md` (PostgREST is HTTP+JSON covered by the web companion; the only broker/webhook surface is the out-of-scope edge function and WhatsApp webhook).
