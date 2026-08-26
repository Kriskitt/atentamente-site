# Atentamente Production Repository

This directory is the clean static production website for Atentamente.

Keep the final website fully static and compatible with AWS S3 and CloudFront.

Do not add runtime server dependencies, frontend frameworks, server-side routing,
databases, APIs, or build requirements unless a future phase explicitly approves
a development-only workflow.

Use directory-style routes with `index.html` files.

Production files must never depend on files outside this repository.

Only include assets actually used by the final website.

---

# Source / Reference Workspace

The sibling directory:

`../dev_/`

is the original development and reference workspace.

It contains:

- interaction experiments
- source imagery
- fonts
- prototype HTML/CSS/JS
- project gallery experiments
- visual reference screenshots

Treat `../dev_/` as READ ONLY.

Codex may inspect files inside `../dev_/` when required, but must never modify,
rename, move, optimize, or delete them.

Production files must never reference `../dev_/` at runtime.

Any required asset must be copied into this repository first.

---

# Sources of Truth

When there is a conflict, use this priority:

1. screenshots inside `../dev_/screens_front/`
2. existing functional experiments inside `../dev_/`
3. these AGENTS.md instructions
4. temporary/dummy production content

Screenshots define the visual target.

Existing experiments define interaction behavior when specifically referenced.

Do not rebuild an existing interaction from scratch unless there is a concrete
technical reason.

---

# Site Sections

The final website consists of:

- Home `/`
- Work `/work/`
- individual Work projects `/work/[slug]/`
- Ensayo `/ensayo/`
- About `/about/`

The website is an editorial portfolio.

Do not introduce conventional agency-website UI patterns that are absent from
the references.

Whitespace, partial images, overlap, horizontal movement, and unusual spatial
relationships are intentional.

---

# Global Interface Rules

Primary interface font:

`New Edge 666 Light Rounded`

Base interface size:

`11px`

Global desktop horizontal gutter:

`15px`

The global header:

- is fixed
- has no opaque background
- uses the 11px interface typography
- keeps approximately 15px left/right viewport gutters
- uses `mix-blend-mode: difference`
- should remain visually legible over both white backgrounds and photography

Do not add:

- navigation backgrounds
- pills
- shadows
- borders
- conventional desktop hamburger menus

---

# Permanent Home Rules

Home contains ONLY:

- the fixed global header
- the Home slider

Home has:

- no footer
- no B/W trigger
- no supplementary content
- no secondary text blocks

Preserve the slider interaction derived from:

`../dev_/index.html`

Do not replace its interaction unnecessarily.

---

# Permanent B/W Rules

B/W controls interface polarity only.

DEFAULT:

- page background: white
- regular interface text: black

B/W ACTIVE:

- page background: black
- regular interface text: white

Photography must NEVER be modified by B/W.

Never apply as part of B/W:

- grayscale
- desaturation
- image color filters
- altered image opacity

The global header continues using `mix-blend-mode: difference`.

Do not automatically add a B/W trigger to pages where it is not visible in the
reference screenshots.

---

# Work Index Rules

Work is a horizontally navigated editorial project index.

It should eventually support approximately 15 projects.

Important behavior:

- continuous horizontal movement
- infinite finite-clone loop
- no visible reset
- large negative space
- project number above image
- project name revealed on hover/active state
- title reveal must not cause layout shift
- neighboring items may remain partially visible

Do not create an infinitely growing DOM.

Do not turn Work into a conventional carousel with visible arrows.

---

# Individual Work Project Rules

Individual project pages reuse the production gallery architecture.

Shared gallery logic belongs in:

`assets/js/project-gallery.js`

Do not duplicate the complete gallery implementation for every project.

The project header contains:

LEFT:
breadcrumb

CENTER:
project description

RIGHT:
section navigation

The project description must always be geometrically centered relative to the
viewport.

Its center should remain at approximately:

`50vw`

It must not shift because the left breadcrumb is wider than the right
navigation.

The project description text is center-aligned.

---

# Ensayo Rules

Ensayo is an editorial horizontal canvas, not a modal gallery.

Default state is intentionally sparse.

Active essays remain within the `/ensayo/` page context.

The active experience should preserve:

- essay index
- horizontal image sequence
- compact slide numbering
- Close X
- horizontal spatial navigation

The active screenshot and end-scroll screenshot represent different positions
within the SAME horizontal canvas.

Do not implement them as separate layouts.

Do not convert Ensayo into:

- a modal
- a centered carousel
- a crossfade slideshow

Ensayo does not automatically inherit B/W.

---

# About Rules

About uses a black composition with large editorial typography.

The large ATENTAMENTE title must reuse the animation behavior found in:

`../dev_/scaleX.html`

Do not approximate the ScaleX interaction with a generic CSS animation if the
source experiment provides the intended behavior.

About editorial serif text uses Times New Roman unless the approved design is
later changed.

---

# Page Isolation During Development

Work phase by phase.

When implementing one section, do not make unrelated changes to completed
sections.

For example:

- Ensayo work should not alter Home behavior.
- About work should not redesign Work.
- asset optimization should not change approved interaction behavior.

Minimal shared refactoring is allowed only when genuinely necessary.

Avoid opportunistic cleanup during feature phases.

---

# CSS / JavaScript Organization

Keep global rules in:

`assets/css/base.css`

Prefer page-specific stylesheets:

- `assets/css/work.css`
- `assets/css/project.css`
- `assets/css/ensayo.css`
- `assets/css/about.css`

Prefer reusable/page-specific JavaScript:

- `assets/js/home-slider.js`
- `assets/js/work.js`
- `assets/js/project-gallery.js`
- `assets/js/ensayo.js`
- `assets/js/about.js`

Do not grow `base.css` into a container for all page-specific styling.

Use Vanilla JavaScript unless an existing approved implementation genuinely
requires something else.

Do not introduce React, Vue, Next.js, or similar frameworks.

---

# Asset Rules

Production assets live under:

`assets/`

Images used in production must be copied into this repository.

Never reference source assets directly from `../dev_/`.

Do not bulk-copy source image folders.

Only copy assets actually required by the production site.

Do not destructively optimize source material.

Image optimization and WOFF2 conversion should happen in a dedicated later
optimization phase.

---

# Static Hosting Rules

The final repository must work if `../dev_/` does not exist.

Routes should resolve using static `index.html` files, for example:

`/`
`/work/`
`/work/clon/`
`/ensayo/`
`/about/`

The final output must remain compatible with static AWS S3 + CloudFront hosting.

No production runtime may require:

- Node.js
- Python
- PHP
- SSR
- databases
- local APIs

---

# Validation Rules

After implementing a phase:

1. serve the repository through a local static HTTP server;
2. verify affected routes return 200;
3. verify CSS, JS, fonts, and image requests;
4. check browser console errors;
5. test the interaction affected by the phase;
6. run JavaScript syntax checks where applicable;
7. run `git diff --check`;
8. ensure production contains no runtime references to:
   - `../dev_`
   - `/dev_`
   - `screens_front`
   - source-only paths

Do not consider a page complete solely because it renders.

Visual fidelity against the corresponding screenshot is part of completion.

---

# Git Safety

This directory is the production Git repository.

Do not commit:

- `.DS_Store`
- temporary screenshots
- browser profiles
- validation scripts
- caches
- local logs
- unused source assets
- secrets

Do not push or configure a remote unless explicitly requested.