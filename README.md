# Altera AI — interactive demo

A guided product tour of Altera AI, in the style of Arcade or Navattic: three intro
slides (the protein ratio, the two methodologies, why it matters), then the Altera AI
app window with one hotspot and one tooltip per stop, following the eleven steps of
"How Altera AI works" (Altera-agent repository). English and French. The visitor can
only move forward or back — nothing else on the page is clickable.

Design follows alterafood.org: Archivo and Inter, warm paper background, ink and
lavender pills, the app shown in a peach frame.

**All data is fictitious.** Harbour Market, its brands, codes and volumes are invented.
EAN codes use GS1's documentation example prefixes. No figure in this demo describes a
real retailer or a measured accuracy.

## Use

- **Next** / **Back** in the tooltip, a click on the pulsing hotspot, or `←` / `→`.
- Every screen has its own link: `…/?lang=fr#classify`, `…/?lang=en#result`.

## Structure

- `src/tour.ts` — the 23 stops: step of the method, screen, what is revealed, anchor.
- `src/scenes.tsx` — the eleven app screens.
- `src/Frame.tsx` — the app window, the step sidebar, hotspot and tooltip placement.
- `src/slides.tsx` — intro and closing slides.
- `src/lib/i18n.ts` — every text, EN and FR. `src/lib/facts.ts` — every number shown.

## Develop

    npm install
    npm run dev          # http://localhost:5173
    npm run build        # type-check and build into dist/

## Data

    npm run data

regenerates, deterministically:

- `src/data/catalogue.json` — 800 products (`scripts/generate_dataset.py`). The script
  refuses to write a catalogue that breaks a methodology rule (plant/animal invariant,
  composites with a food group, ×10 outside cheese, mass balance…).
- `public/downloads/` — the demo workbook and line-level CSV
  (`scripts/build_deliverable.py`). Every figure is a formula; the script recalculates
  the workbook with LibreOffice and compares it to Python before finishing.

Both need Python 3 with `openpyxl`; the recalculation check needs LibreOffice.

## Deploy

Every push to `main` builds and publishes to GitHub Pages
(`.github/workflows/pages.yml`). The build uses a relative base, so the same output
works on `ambrealison.github.io/Altera-demo/` and on a custom domain.

To serve it from a custom domain, first create the DNS record
(`CNAME demo → ambrealison.github.io`), then set the domain in the repository's
Pages settings.

## Change the call to action

`src/config.ts` holds the booking link.
