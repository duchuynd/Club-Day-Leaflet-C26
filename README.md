# Business Club · Club Day C26

Static three-page leaflet for RMIT Vietnam Business Club – SGS.

## Local preview

From this directory:

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173 in a browser. No install or build step is needed.

## Pages

1. Meet BC: introduction, GLICE values, animated vector department heart with live Blode Starkly text, and four department introductions.
2. Explore BC: one looping photo row per internal project category, external projects, and strategic partner.
3. Join BC: Humans of BC, recruitment QR links, and contact information.

Internal galleries support touch swipes, mouse dragging, arrows, keyboard navigation, photo selectors, and pause/play. Autoplay pauses while a gallery is hovered, focused, outside the viewport, or the browser tab is hidden. Reduced motion disables autoplay and animated transitions.

Project photos are optimized WebP copies of the supplied Elements files. `dist/assets/projects/manifest.json` records the original source paths. Fonts are served locally.

`extract_assets.py` is the legacy crop script for the previous sample layout; do not rerun it against the revised three-page samples.

The entry point is `dist/index.html`; styles and interactions are in `dist/style.css` and `dist/app.js`.
