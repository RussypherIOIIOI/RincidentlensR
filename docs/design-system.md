# JARVIS design system

The interface follows the supplied JARVIS command-center reference: dark surfaces, thin panel borders, violet selection rails, and green readiness indicators. The requested Matrix Sans family replaces the typefaces pictured in that reference.

## Tokens

Source: [globals.css](../src/app/globals.css).

| Token        | Hex       | Role                              |
| ------------ | --------- | --------------------------------- |
| Void         | `#08070D` | Canvas and top-level chrome       |
| Panel        | `#17112A` | Investigation/report surfaces     |
| Raised       | `#211932` | Secondary surfaces                |
| Iris         | `#7F00FF` | Selection borders and panel rails |
| Soft Iris    | `#C8A6FF` | Readable links and active text    |
| NVIDIA Green | `#76B900` | Readiness and next-check accents  |
| Text         | `#F5F2FF` | Primary text                      |
| Body         | `#D4CCE2` | Longer evidence/report text       |
| Muted        | `#AAA0BA` | Supporting labels                 |
| Line         | `#3A2F4B` | Structural separators             |
| Amber        | `#FFC857` | Uncertainty/warnings              |
| Danger       | `#FF5F79` | Error status                      |

Solid Iris is used primarily for structure; soft Iris supplies stronger contrast for small text. State labels and selection attributes supplement color.

## Typography and layout

Matrix Sans Regular is self-hosted as [WOFF2](../public/fonts/MatrixSans-Regular.woff2) with `font-display: swap`, a system fallback, and no synthesized font weights. Logs retain a monospace system stack for literal values. The original [SIL Open Font License](../public/fonts/OFL.txt) accompanies the asset; runtime never accesses OneDrive.

Desktop uses a scenario rail and side-by-side evidence/report panes. Below 980px the scenario rail becomes a horizontal selector. Below 720px evidence and report stack vertically; report content is allowed to grow without the desktop scroll cap. Fine borders and small corner radii preserve the reference’s panel treatment.

## Interaction requirements

- Citations remain keyboard-operable links with source-specific accessible names.
- Activation moves focus to the selected source and adds a visible selection border/background.
- The report has a skip link; a polite status region announces selection/generation.
- Busy and disabled states prevent duplicate generation. Errors retain readable report content.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- Model and evidence text render as text rather than raw HTML.

Selected foreground/background calculations recorded in [theme-verification.json](../reports/theme-verification.json) range from 6.0:1 to 16.54:1 and exceed 4.5:1. They cover eight token pairs, not every possible rendered state or complete accessibility compliance. The initial browser accessibility checks preceded this theme; see [verification](verification.md) before making broader claims.

When changing tokens, check the actual foreground/background combination, focus visibility, disabled controls, long source text, narrow viewports, and font loading. Do not hide missing-information or provenance labels to make the interface appear simpler.
