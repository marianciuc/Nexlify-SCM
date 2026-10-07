# Frontend Product Audit & Anti-Slop Overhaul — remaining work

## Context

Nexlify-SCM is a B2B procurement/supply-chain platform (React 19 + TanStack Router file-based routing + Tailwind v4 + shadcn/ui + i18next). A product-wide UX overhaul is in progress. Completed already (do not redo): supplier products/products.$sku/orders/dashboard/scorecard, admin users/analytics, logistics fleet/routes/routes.$routeId — all rewritten table-first using shared primitives; supplier/edi placeholder deleted; nav trimmed; all locale namespaces filled; boundary casts replaced by `Record<Status, TranslationPath>` label maps.

This plan covers the REMAINING pages and passes. Governing principle: the existing frontend is not truth — every page must justify itself by real user value (who uses it, what task, how often). Delete/merge/demote freely; never break business logic.

## Global Constraints (binding)

1. **Design system primitives** (src/components/): `PageHeader` (title JSX, subtitle, actions), `StatusBadge` (tones: success|warning|danger|info|neutral), `OrderStatusBadge`, `StockStatusBadge`, `MoneyDisplay` (PLN-hardcoded, NO currency prop; variants currency|inline), `QuantityDisplay` (mono tabular-nums). Use them; do not invent parallel primitives.
2. **Anti-slop**: no `text-2xs`; no raw `slate-*`/`red-*` colors (use tokens: text-muted-foreground, bg-muted, bg-card, border-border, text-primary, bg-background); no card-in-card; no decorative gradients; no fake KPI cards; no giant headings; StatusBadge instead of inline Badge className ternaries.
3. **Lists are tables** when users compare records (products/orders/invoices/RFQs/shipments/claims/contracts/drivers/waybills). Criterion: can a user scan 20 rows? Cards only for genuinely card-shaped content.
4. **i18n**: all user-visible strings through `t()`. New keys go into `public/locales/en/translation.json` AND `public/locales/ru/translation.json` (2-space indent, ensure_ascii=false), then run `node scripts/generate-translation-types.cjs`. Label maps typed `Record<StatusEnum, TranslationPath>` importing `type TranslationPath` from `@/types/generated-locale`. NEVER cast `t` to `(key: string) => string`.
5. **Verification per task**: `npx tsc --noEmit -p tsconfig.json` → 0 errors; `npx vite build` succeeds; `npx eslint <touched files> --fix` → no new errors (pre-existing `no-explicit-any` warnings acceptable). cn locale incompleteness is pre-existing — out of scope, never "fix" it.
6. **Never** hand-edit `src/routeTree.gen.ts` (auto-generated). Never change API/data hooks' contracts (`src/hooks/useScmQueries.ts`) — presentation only, unless a task explicitly says otherwise.
7. Responsive: wide ops tables may use `overflow-x-auto` with a sensible `min-w`, but mobile-critical flows (forms, filters, primary actions) must be genuinely usable at 375px: single-column forms, wrapping toolbars, full-width primary buttons. Directional arrow icons get `rtl:rotate-180`.
8. Accessibility: labeled inputs, aria-labels on icon-only buttons, `role="progressbar"` + aria-valuenow on progress bars, semantic table headers, sr-only captions on data tables.
9. Commit style: conventional commits scoped per task, attribution line `Co-Authored-By: Claude Code <noreply@anthropic.com>`.

**Exemplars to read before writing** (canonical patterns): `src/routes/admin/users.tsx` (table + bulk selection + filter pills with counts + search + empty state), `src/routes/logistics/fleet.tsx` (stat cells + filters + payload bars), `src/routes/supplier/products.tsx` (toolbar chips + 8-col table), `src/routes/supplier/products.$sku.tsx` (detail page + tabs + back link).

## Tasks

### Task 1 — KYC verification queue overhaul
File: `src/routes/admin/users.verification.tsx` (796 lines).
Goal: table-first KYC queue. One row per pending organization: org name+NIP, role, submitted date, document count/completeness, risk flags, age of submission, actions (review → approve/reject with reason). Bulk selection + bulk approve/reject like admin/users.tsx. Filter pills (all/pending/changes-requested/resubmitted) with live counts, search by name/NIP. Empty state. No document-preview card soup — document lists belong in the review dialog/detail, not on the queue.
Keep all existing business actions and dialogs' logic; restructure presentation only.

### Task 2 — Tenant detail + admin settings
Files: `src/routes/admin/users.$tenantId.tsx`, `src/routes/admin/settings.tsx` (219 lines).
Tenant detail: PageHeader with org identity + KYC StatusBadge; sections as dense definition tables/tables (credit line, exposure with utilization bar, users, recent activity). Remove card soup if present.
Admin settings: audit what the page actually configures (environment/mock mode, Keycloak URLs). Keep functional form fields with proper Labels; remove decorative chrome. If any section is pure decoration with no effect, delete that section (note it in the report).

### Task 3 — System-audit consolidation
Files: `src/routes/admin/system-audit.tsx` (154), `system-audit.disputes.tsx` (125), `system-audit.kafka-dlt.tsx` (333).
Goal: one surface at `/admin/system-audit` with tabs: Disputes (real arbitration workflow — primary tab), Event errors / DLT (internal infra — secondary tab, technical audience). Move each child page's content into the tab structure; delete the separate route files if their URLs are no longer linked (check inbound links first, including breadcrumbs/staticData crumbs). Preserve all retry/review/resolve business actions exactly.

### Task 4 — Logistics workspace: drivers, e-CMR, map, settings
Files: `src/routes/logistics/drivers.tsx` (140), `ecmr.tsx` (248), `map.tsx` (220), `settings.tsx` (189).
Drivers: table (name, license categories, phone, assigned vehicle, status, hours/availability), search + status filter.
eCMR: waybill list as table (number, route, vehicle, status timeline simplified to StatusBadge, issued/delivered dates, action = view). Detail view (if any) as dense dl.
Map: keep the map as the primary content (it IS the page's purpose); demote side stat cards to compact stat cells; ensure legend is readable.
Settings: same treatment as Task 2's settings.

### Task 5 — Supplier ops pages
Files: `src/routes/supplier/bids.board.tsx` (369), `pricing.tsx` (300) (+ `pricing.$contractId.tsx` if linked), `orders.$orderId.fulfillment.tsx`, `settings.tsx` (184), `products.new.tsx` (513).
Bids board: RFQ list the supplier can bid on — table with deadline urgency, items count, budget fit, status; CTA to bid flow (bids.$rfqId.submit — do not rewrite the submit flow itself unless trivially broken).
Pricing: contract/price-list table; row action to pricing.$contractId detail.
Fulfillment detail: pick-list presentation — bins/batches table grouped by order line; mark-picked actions preserved.
products.new: form stays a form — proper Labels, single column on mobile, no wizard theater; keep zod schema and submit logic.

### Task 6 — Warehouse map page
File: `src/routes/supplier/inventory.map.tsx` (2396 lines — largest file in the app).
First READ fully and produce a keep/merge/remove verdict per section in the report. The map visualization is the core value — keep it. Everything else (zone lists, bin browsers, stat cards) must justify itself; convert lists to tables, deduplicate with inventory.transfers/abc-xyz data where identical, delete dead sections. Expect significant size reduction. Do not break interactive navigation (zone → bin drill-down) if it exists.

### Task 7 — Inventory transfers + ABC/XYZ
Files: `src/routes/supplier/inventory.transfers.tsx` (307), `inventory.abc-xyz.tsx` (285).
Transfers: operations table (transfer no, SKU, from/to warehouse, qty, status, initiated by, dates); filter by status; create-transfer flow preserved.
ABC/XYZ: analysis matrix stays (it's real analysis); present as a dense table with class badges; remove decorative matrix visualization cards if they duplicate the table.

### Task 8 — Buyer detail pages
Files: `src/routes/buyer/orders.$orderId.tsx`, `invoices.$invoiceId.tsx`, `catalog.$sku.tsx` (230), `settings.tsx` (276).
Order detail: status timeline simplified, line items table, totals via MoneyDisplay, delivery info dl, dispute/advance actions preserved.
Invoice detail: amounts table (net/VAT/gross) with MoneyDisplay, payment status, download action if exists.
Catalog SKU: purchase-focused: price/MOQ/stock prominence, qty input with MOQ clamp (logic preserved), add-to-cart primary action, spec data as dl.
Buyer settings: same treatment as Task 2 settings.

### Task 9 — Buyer creation flows
Files: `src/routes/buyer/requests.new.tsx` (744), `checkout.tsx` (491).
Both are real flows — keep single-page forms (no wizards). requests.new: line items as an editable table, add/remove rows, totals; deadline/budget fields prominent. checkout: delivery address form + order summary with per-vendor shipment grouping visible; place-order primary action always visible (sticky on mobile). Preserve all validation and submit logic exactly.

### Task 10 — Token & pattern mechanical sweep
Scope: whole `src/`. (a) Remove every remaining `text-2xs` (→ text-xs). (b) Replace raw `slate-*`/`red-*`/decorative color classes with design tokens or StatusBadge tones (semantic colors emerald/amber for progress bars are allowed where already established). (c) Inline leftover `function XPage() { return <XContent />; }` wrapper indirection in `logistics/fleet.tsx` and `admin/users.tsx` (export the content component directly as the route component). (d) Check for imports orphaned by (a)-(c). Batch task — one diff, mechanical, no behavior change.

### Task 11 — Responsive + a11y pass
Scope: all pages rewritten by Tasks 1–10 plus the exemplar pages.
At 375px: no horizontal page scroll (table scroll containers OK), toolbars wrap, primary buttons full-width, forms single column. At 768/1280/1440/1920: content max-widths consistent (max-w-7xl lists, max-w-4xl/5xl details), no layout jumps. A11y: every icon-only button has aria-label, inputs have Labels, tables have sr-only captions where headers not visible, focus visible on interactive rows/buttons, color contrast for text on muted backgrounds. Fix findings in place. Report per-page verdicts.

## Final review
Whole-branch review against this plan's Global Constraints + the product bar (professional enterprise procurement UI, no AI slop).
