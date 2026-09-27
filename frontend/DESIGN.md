# Nexlify-SCM — Frontend Design System Specification

> Structured design system document conforming to the 9-section standard for LLM-native and human-engineered B2B web applications.

---

## 1. Visual Theme & Atmosphere

Nexlify-SCM embodies the precision, resilience, and operational clarity demanded by high-volume European supply chains. The interface communicates institutional reliability and real-time command through a clean architectural aesthetic, high-density data layouts, and intentional micro-interactions.

**Key Characteristics:**
- **High-Density Information Architecture:** Space-efficient data grids, collapsible sidebars, and contextual drawers designed for procurement officers, warehouse managers, and freight dispatchers.
- **Role-Colored Ambient Signaling:** Consistent semantic colors per operational domain: Emerald for Buyer & Procurement, Amber for Supplier & WMS, Sky/Blue for Logistics & TMS, and Rose/Red for System Admin & Governance.
- **Monospaced Data Legibility:** Mandatory monospaced typography (`font-mono`) with tabular figures (`tabular-nums`) for currency amounts (PLN/EUR), NIP/Tax IDs, VINs, container codes, and timestamps.
- **Atmospheric Layering over Flat Gray:** Subtle zinc/slate background contrasts, frosted translucent headers (`backdrop-blur-md`), and layered 1px borders instead of heavy dropshadows.
- **Accessible-by-Default Controls:** Visible keyboard focus indicators (`ring-2 ring-primary ring-offset-2`), WCAG 2.1 AA contrast ratios, screen reader announcements (`aria-live`), and skip-to-content mechanisms.
- **Zero Horizontal Window Scroll:** Guaranteed responsive containment across 320px to 4K displays with horizontal overflow wrappers on dense data tables.

---

## 2. Color Palette & Roles

Nexlify-SCM uses an intentional semantic color token system compatible with Tailwind CSS v4 and modern CSS color functions.

### Primary & Brand Accents
- **Brand Primary / Buyer Accent** (`#059669` / `oklch(0.627 0.194 149.214)`): `--color-primary` — Primary CTA, buyer workspace highlights, order confirmations.
- **Brand Primary Hover** (`#047857`): `--color-primary-hover` — Interactive button hover state.
- **Supplier / WMS Accent** (`#d97706`): `--color-supplier` — Warehouse reservations, picking queues, supplier actions.
- **Logistics / TMS Accent** (`#0284c7`): `--color-logistics` — Freight routing, GraphHopper map controls, vehicle tracking.
- **Admin / Governance Accent** (`#e11d48`): `--color-admin` — Kafka DLT audit, KYC approvals, credit facility overrides.

### Semantic Status
- **Success / In Stock** (`#10b981`): `--color-success` — Active routes, verified KYC, completed Sagas, available inventory.
- **Warning / Pending** (`#f59e0b`): `--color-warning` — Low stock, pending customs, delayed transit, unpaid invoices.
- **Destructive / Error** (`#ef4444`): `--color-destructive` — Kafka dead letters, rejected bids, out-of-stock items, failed transactions.
- **Info / Neutral Alert** (`#3b82f6`): `--color-info` — System notifications, metadata badges, informational tooltips.

### Interactive & States
- **Link Default** (`#059669`): `--color-link` — Text links within body and tables.
- **Link Hover** (`#047857`): `--color-link-hover` — Underlined hover state.
- **Focus Ring** (`#10b981`): `--color-focus-ring` — Visible 2px outline offset by 2px on focused elements.

### Neutral Scale (Slate & Dark Mode Surfaces)
- **Base White / Dark 950** (`#ffffff` / `#020617`): `--color-neutral-0` — Global page viewport background.
- **Slate 50 / Dark 900** (`#f8fafc` / `#0f172a`): `--color-neutral-50` — Table headers, secondary card surfaces, input backgrounds.
- **Slate 100 / Dark 850** (`#f1f5f9` / `#1e293b`): `--color-neutral-100` — Hover row backgrounds, badge backdrops.
- **Slate 200 / Dark 800** (`#e2e8f0` / `#334155`): `--color-neutral-200` — Standard borders, card dividers, tab separators.
- **Slate 400 / Dark 500** (`#94a3b8` / `#64748b`): `--color-neutral-400` — Placeholder text, inactive tab text, disabled icons.
- **Slate 600 / Dark 400** (`#475569` / `#94a3b8`): `--color-neutral-600` — Secondary text, table column headers, helper captions.
- **Slate 900 / Dark 100** (`#0f172a` / `#f1f5f9`): `--color-neutral-900` — Primary body copy, table cell text, strong headers.

### Shadow Values
- **Shadow 2XS** (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`): Subtle border companion for cards.
- **Shadow SM** (`0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)`): Standard card elevation.
- **Shadow MD** (`0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`): Dropdowns, popovers, hovering cards.
- **Shadow LG** (`0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)`): Modals, dialogs, slide-over panels.

---

## 3. Typography Rules

Nexlify-SCM standardizes on two geometric typefaces that balance high technical scannability with enterprise refinement.

- **Primary UI & Display Font:** `Plus Jakarta Sans`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Secondary Monospace & Numbers Font:** `JetBrains Mono`, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
- **OpenType Feature Settings:** `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';`

### Type Scale Hierarchy

| Role | Font | Size (rem / px) | Weight | Line Height | Letter Spacing | Usage Notes |
|---|---|---|---|---|---|---|
| **Display / Metric** | Plus Jakarta Sans | `2.25rem / 36px` | 700 (Bold) | 1.15 | `-0.025em` | Top KPI highlights, order summary totals |
| **Page H1** | Plus Jakarta Sans | `1.5rem / 24px` | 700 (Bold) | 1.25 | `-0.02em` | Workspace screen titles, dashboard headings |
| **Section H2** | Plus Jakarta Sans | `1.125rem / 18px` | 600 (Semibold) | 1.35 | `-0.015em` | Card titles, modal headers, table headers |
| **Card H3** | Plus Jakarta Sans | `0.875rem / 14px` | 600 (Semibold) | 1.4 | `-0.01em` | Subsection captions, card subheaders |
| **Body Default** | Plus Jakarta Sans | `0.875rem / 14px` | 400 (Regular) | 1.5 | `0` | Primary table data, modal text, form inputs |
| **Body Small** | Plus Jakarta Sans | `0.75rem / 12px` | 400 / 500 | 1.4 | `0.005em` | Form labels, helper captions, tooltips |
| **Micro Caption** | Plus Jakarta Sans | `0.6875rem / 11px` | 500 / 600 | 1.3 | `0.02em` | Table superheaders, status badges |
| **Monospace Monetary** | JetBrains Mono | `0.875rem / 14px` | 600 (Semibold) | 1.4 | `0` | Prices (`1,250.00 PLN`), subtotals, VAT amounts |
| **Monospace Technical**| JetBrains Mono | `0.75rem / 12px` | 500 (Medium) | 1.4 | `0` | NIP, VIN, SKU, Kafka topic, Saga IDs |

---

## 4. Component Stylings

### Buttons

- **Primary Button:**
  - CSS: `bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-lg shadow-2xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.99]`
  - Min touch target: `min-h-[36px] sm:min-h-[40px]`
- **Secondary / Outline Button:**
  - CSS: `border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary`
- **Ghost Action Button:**
  - CSS: `hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary`
  - Requirement: Must always carry an explicit `aria-label` when containing only icons.

### Data Tables

- **Container Wrapper:**
  - Mandatory responsive wrapper: `<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">`
  - Table minimum width: `min-w-[700px]` (or `min-w-[850px]` for high-column screens) to prevent column pinching on viewports < 1024px.
- **Header:**
  - `bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider py-3 px-4 border-b border-slate-200 dark:border-slate-800`
- **Rows:**
  - `divide-y divide-slate-100 dark:divide-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors`
- **Monetary Cells:**
  - `text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100`

### Input Fields & Controls

- **Standard Text / Number Input:**
  - `bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-lg px-3 py-2 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary transition-all`
  - Font size rule: minimum `16px` on mobile screens or `text-sm` with proper viewport meta to prevent iOS Safari auto-zoom.
- **Search Inputs:**
  - Left-aligned icon (`h-4 w-4 text-slate-400`), `pl-9` padding, clear placeholder and descriptive `aria-label`.

### Badges & Status Pills

- **Verified / Success:** `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`
- **Warning / Review:** `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`
- **Destructive / Error:** `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`
- **Neutral / Code:** `bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-mono text-2xs`

---

## 5. Layout Principles & Spacing

Nexlify-SCM adheres to an 8-point base spatial grid (with a 4-point micro-step for compact badges and inputs).

- **Base Grid Unit:** `8px` (`0.5rem`)
- **Spacing Scale:** `4px (0.25rem)` / `8px (0.5rem)` / `12px (0.75rem)` / `16px (1rem)` / `24px (1.5rem)` / `32px (2rem)` / `48px (3rem)` / `64px (4rem)`
- **Max Container Width:** `1440px` (`max-w-7xl` or `max-w-screen-2xl`), centered with `mx-auto`
- **Page Margin:** `px-4 sm:px-6 lg:px-8`
- **Section Vertical Rhythm:** `space-y-6` between header, KPI ribbons, filter controls, and table panels.
- **Border Radius Scale:**
  - Badges & Micro-tags: `rounded-md` (`6px`)
  - Inputs & Buttons: `rounded-lg` (`8px`)
  - Cards & Table Panels: `rounded-xl` (`12px`)
  - Modals & Drawers: `rounded-2xl` (`16px`)
  - Pills & Avatars: `rounded-full` (`9999px`)

---

## 6. Depth & Elevation

| Level | Elevation Name | Shadow Spec | Usage Context |
|---|---|---|---|
| **0** | Flat Surface | `none`, 1px border | Default page backgrounds, flat utility wrappers, inline table rows |
| **1** | Raised Card | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` | Standard metric cards, catalog item tiles, invoice panels |
| **2** | Interactive Hover | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` | Catalog cards on hover, active dropdown menus |
| **3** | Floating Overlay | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05)` | Sticky header bar, modal dialogs, GraphHopper map toolbars |
| **4** | Global Alert / Toast | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)` | Sonner toast notifications, command palette dialog |

---

## 7. Do's and Don'ts

### Do
- **Do use tabular numbers (`tabular-nums`):** Always apply `.tabular-nums` or `tabular-nums` utility class to all prices, quantities, VAT, dimensions, dates, and timestamps to eliminate column jitter.
- **Do wrap tables in horizontal scroll containers:** Always wrap data tables with `overflow-x-auto` and a `min-w-[700px]+` table element to guarantee zero page-level sideways scroll.
- **Do provide accessible names:** Always add `aria-label` or `aria-labelledby` to icon-only buttons, modal close triggers, and search inputs.
- **Do include Skip-to-Content links:** Always place `<a href="#main-content" className="skip-to-content">Skip to content</a>` at the top of each workspace layout.
- **Do enforce visible focus indicators:** Always ensure interactive elements have high-contrast `:focus-visible` styling (`ring-2 ring-primary ring-offset-2`).
- **Do respect reduced motion:** Ensure animations degrade gracefully for users with `prefers-reduced-motion: reduce`.

### Don't
- **Don't use arbitrary spacing:** Avoid random pixel margins or paddings (`mt-[17px]`, `p-[13px]`); use Tailwind 4/8-point tokens.
- **Don't use pure `#000000` text:** Always use neutral slate shades (`text-slate-900` or `dark:text-slate-100`) for softer eye fatigue.
- **Don't hide interactive affordance:** Never remove outlines on `:focus` without providing an enhanced `:focus-visible` alternative.
- **Don't rely solely on color for status:** Always pair status badges with an icon (e.g. `CheckCircle2`, `AlertTriangle`) or explicit status text.
- **Don't truncate critical supply chain codes:** Never blindly ellipsis order numbers, NIP, or VINs without full tooltip or copy-to-clipboard accessibility.

---

## 8. Responsive Behavior & Breakpoints

### Breakpoint Strategy

| Breakpoint | Window Width | Layout Adaptations |
|---|---|---|
| **Mobile (`xs`)** | `< 640px` | Single column stacked layouts, sidebar collapses to drawer/sheet, touch target $\ge 44$px enforced, tables scroll horizontally inside cards. |
| **Tablet (`sm`/`md`)** | `640px - 1023px` | 2-column KPI grids, filters stack horizontally with scrollbars, compact navigation headers. |
| **Desktop (`lg`)** | `1024px - 1279px` | Persistent left sidebar, 3 to 4-column KPI cards, side-by-side BOM breakdown and order summary panels. |
| **Wide Screen (`xl`/`2xl`)** | `$\ge$ 1280px` | Maximum container width applied (`max-w-7xl` / `1440px`), full data table columns visible without horizontal clipping. |

### Touch Targets & Accessibility
- **Minimum Interactive Size:** All buttons, selects, and links on touch viewports measure at least `44x44px` (or standard `36px` on desktop with mouse pointers).
- **Collapsing Grids:** Product cards switch from `grid-cols-1` on mobile to `md:grid-cols-2`, `lg:grid-cols-3`, and `xl:grid-cols-4`.

---

## 9. Agent Prompt Guide

### Quick Token Reference

```css
/* Color Variables */
--color-primary: #059669;        /* Emerald 600 */
--color-primary-hover: #047857;  /* Emerald 700 */
--color-supplier: #d97706;       /* Amber 600 */
--color-logistics: #0284c7;      /* Sky 600 */
--color-admin: #e11d48;          /* Rose 600 */

/* Typography Stacks */
font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Component Code Patterns for Agents

#### 1. Metric / KPI Card Pattern
```tsx
<Card className="border-slate-200/80 dark:border-slate-800 shadow-2xs">
  <CardHeader className="pb-2">
    <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
      Total Gross Receivables
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
      128,450.00 PLN
    </div>
    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
      <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
      <span>Includes 23% statutory VAT</span>
    </p>
  </CardContent>
</Card>
```

#### 2. Responsive Table Wrapper Pattern
```tsx
<Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
  <CardContent className="p-0 overflow-x-auto">
    <table className="w-full text-left text-sm min-w-[750px]">
      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
        <tr>
          <th className="py-3 px-4">Item & SKU</th>
          <th className="py-3 px-4 text-right">Available Stock</th>
          <th className="py-3 px-4 text-right">Wholesale Price</th>
          <th className="py-3 px-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
          <td className="py-3 px-4">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Steel Beam HEB 200</span>
            <div className="font-mono text-xs text-slate-500">SKU-STL-002</div>
          </td>
          <td className="py-3 px-4 text-right tabular-nums font-mono text-emerald-600 font-medium">
            1,200 pcs
          </td>
          <td className="py-3 px-4 text-right tabular-nums font-mono font-bold text-slate-900 dark:text-slate-100">
            450.00 PLN
          </td>
          <td className="py-3 px-4 text-right">
            <Button size="sm" aria-label="Add Steel Beam to Cart" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              Add
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </CardContent>
</Card>
```
