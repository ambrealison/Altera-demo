# Altera AI — interactive demo

A presenter-driven walkthrough of how Altera AI turns a retailer's catalogue into a
protein ratio, under the Protein Tracker (GPA / ProVeg) and WWF Planet-Based Diets
methodologies. English and French.

**All data is fictitious.** Harbour Market, its brands, codes and volumes are invented.
EAN codes use GS1's documentation example prefixes. No figure in this demo describes a
real retailer or a measured accuracy.

## Use

- `←` / `→` (or the buttons) move between steps. On a step with an action, the first
  `→` runs it, the second moves on.
- Links are shareable per step and language: `…/?lang=fr#classify`.
- Click any product to see how each value was obtained.

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
