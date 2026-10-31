# Atentamente Production Repository

This is the static production website. Work on `main` only when the user authorizes it. Use directory-style `index.html` routes and portable document-relative URLs. It must work at repository root, under GitHub Pages project hosting, and on future AWS S3 + CloudFront hosting. Do not introduce frameworks, runtime servers, databases, APIs, server-side routing, or build requirements. Do not reference files outside this repository at runtime.

`../dev_/` is read-only reference material. Inspect it when useful but never modify it. The approved screenshots are in `../dev_/screens_front/`. New direct user requirements take precedence over screenshots, then approved production interactions. Copy only assets required by production.

## Routes and interface

- Home `/`
- Work `/work/`
- Work projects such as `/work/clon/`
- Actions `/actions/`
- About `/about/`

Use Archivo Black for the fixed `Atentamente` header brand. Use Generation Mono only for the interactive About wordmark. Times Newer Roman Regular is for the interface, navigation, counters, and editorial text. Use the actual Times Newer Roman Italic font file for italic text. Keep the desktop gutter at 15px.

The fixed header has no opaque background. It uses `mix-blend-mode: difference`. The left side contains only the brand. The right navigation reads `Work,  Actions,  About`, with two spaces after each comma. Keep the active link in place and underline it. Do not add breadcrumb navigation, pills, shadows, borders, or a desktop hamburger menu.

Every page except Home has a fixed viewport footer: `B/N` on the left, `ES/EN` on the right. `B/N` toggles interface background and text polarity, including About's black default. It must NEVER filter, desaturate, dim, or change photography. `ES/EN` is a semantic hook for future language switching; do not invent translations.

## Home

Home contains only the fixed header and two-layer slider, with no footer or supplementary content. Preserve its existing transition, counter, previous/next, looping, keyboard, wheel lock, touch swipe, and custom cursor behavior. Use exactly nine images in numeric filename order from `assets/rsc/home/`. Each image occupies a black 100dvh media container and uses centered `object-fit: contain`, preserving aspect ratio without crop or distortion.

## Work and project galleries

Preserve Work's finite-clone horizontal loop, drag and wheel movement, spacing, hover title reveal, and project data architecture. Do not add visible carousel arrows or infinitely grow the DOM. Photography must remain unchanged by B/N.

Work projects reuse `assets/js/project-gallery.js`. Preserve native horizontal scroll, click expansion, 600ms transition and easing, wheel, drag, touch, and Escape collapse. All images start collapsed. Keep the italic project description centered at approximately 50vw independent of the brand and right navigation.

## About

About defaults to a black composition and scrolls vertically. Use `assets/fonts/Generation_Mono/generation-mono.otf` for the large central `ATENTAMENTE` wordmark while preserving its pointer-driven ScaleX behavior. The top labels and main statement use Times Newer Roman Regular at 30pt with the approved copy. Below them, keep four 14pt columns: selected projects/clients, services, team/contact, and recognitions/talks. Keep the authored contact links functional: mailto email, direct WhatsApp number without prefilled text, and Instagram. Leave enough bottom space above the fixed footer.

## Actions

Actions replaces the old section completely. Its four data-driven tabs `00`–`03` show the active tab in brackets and a subtitle. Each tab displays a five-column editorial image grid at the desktop reference width. Reuse a randomized source pool during vertical browsing without immediate duplicate neighbors where practical. Recycle/remove distant batches so the DOM stays bounded and scrolling remains continuous. Switching tabs initializes that collection cleanly. Clicking an item opens a 96% white viewport overlay with a full-color, contained image. `Close [X]`, background click, and Escape close it; image click does not. Preserve scroll position and focus on close. The footer remains pinned beneath the overlay.

## Code and validation

Keep shared CSS in `assets/css/base.css`, page styles in page-specific CSS, and reusable Vanilla JavaScript under `assets/js/`. Keep Home, Work, project, Actions, and About interactions isolated. Do not begin a responsive redesign without approved references.

After a phase, serve the repository through a local static HTTP server. Verify affected routes and assets, browser console, interactions, desktop visual fidelity, JavaScript syntax, `git diff --check`, and portable links. Runtime HTML/CSS/JS must contain no references to `../dev_/`, `/dev_`, or source screenshots. Do not commit `.DS_Store`, temporary screenshots, browser profiles, validation scripts, caches, logs, unused assets, or secrets. Do not force-push or rewrite history.
