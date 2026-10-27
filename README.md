# Business Club · Club Day leaflet

Static, responsive two-page leaflet based on the supplied `Sample/Page 1.png` and `Sample/Page 2.png`. No AI-generated imagery is used. All displayed images and title artwork are extracted from those samples at their original pixel resolution. `dist/assets/provenance.json` records crop coordinates.

## Local preview

From this directory, run `python3 -m http.server 4173 --directory dist` and open http://localhost:4173.

## Interaction

- Page buttons, left/right arrow keys, or horizontal swipes switch between the two leaflet pages.
- The original four heart pieces fly in and assemble when visible. Tap the heart to replay.
- Vertical scrolling remains native. Reduced-motion preferences skip the animation.
- The page number is shareable through `#page-1` and `#page-2`.

## Source assets still useful

- **Blode Starkly font**: supply the licensed `.woff2`, `.woff`, `.otf`, or `.ttf`. The font file is absent from the supplied folders. Existing heading artwork preserves the exact sample lettering; live text currently uses system fallbacks. Put a webfont at `dist/assets/blode-starkly.woff2` and enable its `@font-face` rule.
- The original photographs, logos and portraits are welcome for sharper display on high-density screens. Current crops preserve the supplied sample and do not add invented detail.
- Please confirm the live recruitment destinations and contact URLs before printing the final Club Day QR.

## Deployment

Deploy the `dist` directory to static hosting. The site has no server, build step, analytics or third-party runtime dependency. Site identity is stored in `.openai/hosting.json`.
