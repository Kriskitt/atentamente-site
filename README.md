# Atentamente Site

Static editorial portfolio built with HTML, CSS, and Vanilla JavaScript. It has no build step or runtime server dependency. Document-relative URLs support both GitHub Pages project hosting and future AWS S3 + CloudFront hosting.

## Routes

- `/` — Home slider
- `/work/` — Work index
- `/work/clon/` — Work project gallery
- `/actions/` — Actions collections
- `/about/` — Studio information

## Local preview

From the repository root:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Production CSS and JavaScript live under `assets/css/` and `assets/js/`; fonts, Home media, and project imagery also live under `assets/`.
