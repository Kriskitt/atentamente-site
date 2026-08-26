# Atentamente Site

Static production website for Atentamente.

## Architecture

This repository is intended to deploy as static files to AWS S3, optionally behind CloudFront and Route 53. It does not require Node.js, server-side rendering, databases, runtime APIs, or a build process.

Routes use directory-style static files:

- `/` -> `index.html`
- `/work/` -> `work/index.html`
- `/ensayo/` -> `ensayo/index.html`
- `/about/` -> `about/index.html`

## Development

Serve the repository root with any static HTTP server, for example:

```sh
python3 -m http.server 8080
```

Production files must reference only files contained in this repository. Assets required by production must live under `assets/`.
