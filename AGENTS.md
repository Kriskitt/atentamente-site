# Atentamente Production Repository

This is the static production site. Work on `main` only when the user authorizes it. Preserve existing user changes. Never force-push or rewrite history. `../dev_/` is read-only. Approved visual references are in `../dev_/screens_front/desktop/`, `tablet/`, and `mobile/`; direct user requirements take priority over screenshots, then approved interactions.

Keep HTML, CSS, and Vanilla JavaScript with directory-style `index.html` routes and document-relative URLs. The site must work at repository root, under GitHub Pages project hosting, and on future AWS S3 + CloudFront hosting. Do not add frameworks, build requirements, servers, databases, APIs, or runtime references outside this repository. Routes: `/`, `/work/`, `/work/clon/`, `/actions/`, `/about/`.

## Responsive system and interface

Desktop is at least 1033px; tablet is 441–1032px; mobile is at most 440px. Avoid unrelated breakpoints. Shared CSS belongs in `assets/css/base.css`; page styles belong in page CSS; reusable page interactions belong under `assets/js/`. Do not add a hamburger menu. Global interface sizes are 11px on desktop/tablet and fixed 10px on mobile. Desktop gutter is 15px.

Every page loads dark (black background, white interface), without localStorage persistence. `B/N` switches the interface to white background/black text and back without changing photography or video. Every page starts with `<html lang="es">`. The `EN/ES` control changes only `html.lang` between `es` and `en` and the polarity label between `B/N` and `B/W`; it does not translate copy or persist state. Home has no footer. All other routes have a fixed footer with Archivo Black labels.

The fixed header has no opaque background and uses difference blending over media. Brand text is uppercase `ATENTAMENTE` in Archivo Black. Navigation reads `Work,  Actions,  About` with two spaces after commas, also in Archivo Black. Only the active navigation link is underlined; brand and navigation have no hover underline. Keep the active link in place and avoid breadcrumbs, pills, shadows, borders, and desktop hamburger menus. Times Newer Roman Regular is used for counters and editorial text; use the real italic file only where italic is authored.

## Home

Preserve the two-layer transition, previous/next, looping, counter, wheel lock, keyboard, touch swipe, and custom cursor. Use nine logical slides in numeric order. Desktop/tablet sources are `assets/rsc/home/desktop-tablet/`; slides 1, 2, 5, 7, 8 use `cover`, while 3, 4, 6, 9 use `contain`. Mobile sources are exclusively `assets/rsc/home/mobile/`, with mobile-specific `cover` fitting by default. Support `.webm` with muted autoplay, loop, playsinline, hidden controls, and pause inactive video. Media stay centered, keep aspect ratio, and occupy a black 100dvh environment. Counter and fine-pointer cursor use `←` and `→`. No footer or supplementary Home content.

## Work and projects

Desktop Work keeps the finite-clone horizontal loop, drag, wheel, spacing, and hover title behavior. Tablet remains horizontal with all images/titles normally visible and no hover presentation. Mobile renders one canonical vertical list with number left, media center, title right, natural page scroll, and no horizontal drag/wheel. Rebuild cleanly when crossing mobile width.

Project pages reuse `assets/js/project-gallery.js`. Desktop/tablet keep native horizontal scroll, click expansion, wheel, drag, touch, Escape collapse, and 600ms easing. All items start collapsed. Description is Times Newer Roman Regular and centered against the viewport. Support image and `.webm` slides in the same gallery; muted looping videos pause when out of view. Mobile uses vertical natural scroll; expansion stays in flow, approaches usable viewport width, preserves aspect ratio, and has no horizontal drag/wheel.

## About

About is full bleed, dark by default, and vertically scrollable. Preserve the authored `.about-scaled-text` `font-family` and `line-height` exactly; preserve pointer-driven ScaleX. Fit the resting full `ATENTAMENTE` within the stage at every range. The descriptor uses the approved graphic-practice copy, Times Newer Roman Regular, explicit white or black text by polarity, and normal blending. Desktop/tablet descriptor is 30px and body columns 14px; mobile descriptor is 22px and columns 10px. Desktop/tablet have four columns in order: Selected Projects / Clients, Services, Recognitions / Talks / Press, Team / Contact. Mobile uses two columns. The Press entry links to `https://www.underconsideration.com/brandnew/archives/friday_likes_592.php`. Preserve mailto, direct WhatsApp without prefilled text, and Instagram links. Keep content clear of the fixed footer.

## Actions

Four data-driven tabs `00`–`03` show the active label in brackets. Tab 00 has no description; tabs 01–03 render a description only when authored content exists. Do not invent descriptions. Grid has no side padding. Desktop uses five irregular editorial columns and bounded randomized/recycled infinite browsing. Tablet uses three finite columns; mobile uses one finite column. Reinitialize cleanly across breakpoints. Overlay is black at about 86% opacity and shows contained full-color media. Close [X], Escape, and background click close it; media click navigates canonical items without closing. Navigation does not loop; desktop uses left/right custom `←`/`→` cursor zones, tablet/mobile use left/right taps. Preserve scroll and opener focus on close; prefetch adjacent items where practical. Footer stays pinned beneath overlay.

## Validation and hygiene

After changes, serve with a local static HTTP server and check routes, assets, console, interactions, syntax, visual references at 1920px, 1032px, 768px, 440px, and 390px, `git diff --check`, and root/nested path portability. Runtime HTML/CSS/JS must not reference `../dev_/`, `/dev_`, or source screenshots. Do not commit `.DS_Store`, temporary screenshots, browser profiles, validation scripts, caches, logs, unused assets, or secrets.
