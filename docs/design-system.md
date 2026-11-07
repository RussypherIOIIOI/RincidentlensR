# TMC design system

IncidentLens uses the official brand system of **The Meredith Collective** (TMC). Tokens, fonts, marks, icons and patterns come from the TMC brand package and the TMC Design System (`tokens.json` v1, 2026-11-01). The site applies them; it does not define new brand values.

Source: [globals.css](../src/app/globals.css) (tokens and components), [brand.tsx](../src/components/brand.tsx) (icons and mark), [site.tsx](../src/components/site.tsx) (header, hero, method band, footer).

## Brand rules applied

- Flat color only: no gradients, glows, gloss or drop shadows. Layers separate with 1px `line` rules and `surface-raised`.
- Every border and rule is 1px (`border-hair`).
- Dark (Void) is the default theme. The Method band switches to the Ivory canvas with `data-theme="light"`, alternating bands and opening on dark.
- Uppercase appears only in the `label`, `button` and `signal` styles. Headings and body text use sentence case.
- Matrix Sans is reserved for readouts: timestamps, record IDs, citation chips, ledger figures and hashes. It is never used for paragraphs.
- Icons come only from the TMC outline set (24px grid, 1.5px stroke, `currentColor`). Each sits beside a text label and is hidden from assistive technology.
- The compact mark is used under 48px (header, favicon, Apple touch icon); the horizontal lockup appears in the footer. Marks are never recolored or altered and carry ™, not ®.
- Patterns (orbits, dot matrix) appear only behind areas without text, at 100% scale and with no added color.
- Ledger readouts show only figures computed from the bundled data at build time ([ledger.ts](../src/lib/ledger.ts)). "Unresolved citations" counts references that do not resolve in their own bundle.

## Tokens

| Semantic token     | Dark value          | Light value          | Role                                |
| ------------------ | ------------------- | -------------------- | ----------------------------------- |
| `surface`          | Void `#08070D`      | Ivory `#FAF9F5`      | Page and band ground                |
| `surface-raised`   | Void 2 `#13111C`    | Ivory 2 `#F1EEE5`    | Panes, panels, scenario cards       |
| `surface-selected` | Void 3 `#221F2E`    | `#E6E2D7`            | Selected card, citation chip ground |
| `line`             | Rule dark `#2E2A3D` | Rule light `#D9D5C8` | Every border and rule               |
| `ink`              | Ivory `#FAF9F5`     | Slate `#141413`      | Primary text                        |
| `ink-muted`        | Mist `#B9B4C7`      | Stone `#5C5A55`      | Secondary text and labels           |
| `brand`            | Iris `#7F00FF`      | Iris `#7F00FF`       | Primary action fill, trace lines    |
| `brand-text`       | `#C9A6FF`           | Iris `#7F00FF`       | Links, citations, emphasis text     |
| `signal`           | Circuit `#76B900`   | Circuit `#76B900`    | Status dots and resolved readouts   |
| `signal-text`      | Circuit `#76B900`   | Olive `#5F6B32`      | Status text                         |
| `cta`              | Iris                | Slate                | Primary button fill                 |
| `focus`            | Circuit             | Iris                 | 2px keyboard focus outline          |

Evidence status maps onto the palette; the printed severity word always carries the meaning:

| Status    | Treatment                                       |
| --------- | ----------------------------------------------- |
| `error`   | `brand-text` label, Iris timeline node          |
| `warning` | Manila `#E8DDBF` label and node                 |
| `info`    | `ink-muted` label, outlined node                |
| Log text  | Manila on Void, system monospace (literal data) |

This mapping is a site-level choice; the brand system defines no error or warning colors.

## Typography

| Role    | Family                | Use                                              |
| ------- | --------------------- | ------------------------------------------------ |
| Display | Poppins 500/600       | Hero line, titles, pane and panel headings       |
| Body    | Lora 400/600          | Report statements, evidence text, descriptions   |
| Label   | Space Grotesk 400/500 | Eyebrows, chips, buttons, navigation (uppercase) |
| Signal  | Matrix Sans 400       | Timestamps, IDs, citation chips, ledger figures  |

All fonts are self-hosted WOFF2 files in [public/fonts](../public/fonts) with their SIL Open Font License texts. They keep their real family names so the brand token stacks apply unchanged, and the four above-the-fold faces are preloaded. No font CDN is used.

## Layout

The page runs header → hero (with the trace preview and ledger) → dot-matrix strip → workspace → Ivory method band → footer. The workspace shows three scenario cards, the investigation heading with a per-incident ledger, and side-by-side evidence and report panes that scroll independently, so a citation can reveal its source without moving the report. Below 900px the panes stack and the report grows with the page. Below 720px scenario cards stack and the header navigation hides; its links remain in the hero and footer. Below 375px the header status chip also hides, so the mark and name fit a 320px screen.

## Motion

Motion explains structure and never hides content from assistive technology or contrast checks:

- The hero text rises in with a clip reveal; the trace preview draws its connector lines, then rings each citation chip once.
- Switching scenarios resets both panes to the top, settles them into place and sweeps a 1px Iris line across them.
- A selected source flashes an Iris outline once.
- Method panels reveal on scroll where `animation-timeline: view()` is supported.

Animations change only `transform`, `clip-path` and outline color, never text opacity. None loops or runs longer than about two seconds. `prefers-reduced-motion: reduce` disables every animation, transition and smooth scroll.

## Interaction requirements

- Citations remain keyboard-operable links with source-specific accessible names.
- Activation moves focus to the selected source, scrolls it into view and marks it with a `brand-text` border and selected surface.
- The hero line is the page's only `h1`. The selected incident title is an `h2`, the two panes are `h3` and report sections are `h4`, so heading navigation follows the page order.
- Skip links on the home and 404 pages move focus to the investigation or the page content, so the next Tab continues there. These targets take focus without drawing a ring because they are not controls. A polite status region announces selection and generation.
- The hero trace preview is real text: assistive technology reads the statement and each cited record. Only the citation chips, which repeat the record IDs, are hidden.
- Busy and disabled states prevent duplicate generation. When live generation is unavailable the button shows a lock icon and neutral styling. Errors keep the existing report readable.
- Section headings carry decorative icons hidden from assistive technology, so their accessible names are plain text.
- Model and evidence text render as text rather than raw HTML.

## Contrast

Measured flat-color pairs (WCAG 2.2, 2026-11-06) include `brand-text` on Void 3 7.96:1, Mist on Void 2 9.26:1, Manila on Void 14.84:1, Circuit on Void 2 7.74:1, Ivory on Iris 5.96:1, Stone on Ivory 2 5.94:1 and Iris icons on Ivory 2 5.41:1 (non-text). Iris on Void 2 measured 2.98:1, so state borders on raised surfaces use `brand-text` instead. These calculations do not cover every rendered state or establish full accessibility compliance; see [verification](verification.md).

When changing tokens, check the actual foreground/background pair, focus visibility, disabled controls, long source text, narrow viewports, reduced motion and font loading. Do not hide missing-information or provenance labels to make the interface appear simpler.
