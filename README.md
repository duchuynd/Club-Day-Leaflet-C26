# Business Club · Club Day leaflet

Static, responsive two-page leaflet based on the supplied `Sample/Page 1.png` and `Sample/Page 2.png`. No AI-generated imagery is used. All displayed images and title artwork are extracted from those samples at their original pixel resolution. `dist/assets/provenance.json` records crop coordinates.

Both pages use the supplied `Elements/Background.png`, copied unchanged to `dist/assets/leaflet-background.png`. CSS applies a separate blur and warm translucent overlay to match the sample while keeping foreground content sharp.

## Local preview

Clone this repository, then from its root run:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. Everything needed to run the website is included in `dist/`; no package installation or build is required.

The optional `extract_assets.py` utility reads the original sample files from `../Sample/` in the author's workspace. Those source samples are not required to run or host the website.

## Interaction

- Page buttons, left/right arrow keys, or horizontal swipes switch between the two leaflet pages.
- The original four heart pieces fly in and assemble when visible. Tap the heart to replay.
- Vertical scrolling remains native. Reduced-motion preferences skip the animation.
- The page number is shareable through `#page-1` and `#page-2`.

## Source assets still useful

- The introduction uses the supplied **CDA Mê Ly Display Bold** webfont from `Elements/CDA Me Ly Display 260621`. Its WOFF2 and original notice are included in `dist/assets/fonts`.

- **Blode Starkly font**: supply the licensed `.woff2`, `.woff`, `.otf`, or `.ttf`. The font file is absent from the supplied folders. Existing heading artwork preserves the exact sample lettering; live text currently uses system fallbacks. Put a webfont at `dist/assets/blode-starkly.woff2` and enable its `@font-face` rule.
- The original photographs, logos and portraits are welcome for sharper display on high-density screens. Current crops preserve the supplied sample and do not add invented detail.
- Please confirm the live recruitment destinations and contact URLs before printing the final Club Day QR.

## Deployment

The code is stored at https://github.com/duchuynd/Club-Day-Leaflet-C26. Hosting is not enabled by this source push. When publication is requested, serve the `dist` directory with static hosting. The site has no server, build step, analytics or third-party runtime dependency.
