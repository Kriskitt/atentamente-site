# Atentamente Production Repository

This directory is the clean static production website for Atentamente.

Keep it fully static and compatible with AWS S3 and CloudFront. Do not add runtime server dependencies, frontend frameworks, server-side routing, databases, or build requirements unless a future phase explicitly approves a development-only workflow.

Use directory-style routes with `index.html` files. Production files must not reference external source workspaces.

Only include assets used by the website. Keep source experiments, screenshots, caches, `.DS_Store`, and unused image/font files out of this repository.
