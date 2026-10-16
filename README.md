# Altera AI — interactive demo

A guided product tour of Altera AI, in the style of Arcade or Navattic, written for
retailers' CSR teams: a cover, two intro slides (the protein ratio; WWF and Protein
Tracker side by side), then the Altera AI app window with one hotspot and one tooltip
per stop. Seven steps, each named after what the tool does, follow in order the eleven
steps of "How Altera AI works" (Altera-agent repository). The tour shows proportions,
never figures. The closing page maps, across Europe, the retailers that publish or
measure their protein split — from public sources, cited on the page — then links to
the booking page. English and French; WWF always comes first.

Design follows alterafood.org: Archivo and Inter, warm paper background, ink and
lavender pills, the app shown in a peach frame.

**All data is fictitious.** Harbour Market, its brands, codes and volumes are invented.
EAN codes use GS1's documentation example prefixes. No figure in this demo describes a
real retailer or a measured accuracy.

## Use

- **Next** / **Back** in the tooltip, a click on the pulsing hotspot, or `←` / `→`.
- Every screen has its own link: `…/?lang=fr#classes`, `…/?lang=en#wwf`.

## Structure

- `src/tour.ts` — the 14 stops: chapter, screen, what is revealed, anchor, tooltip side.
- `src/scenes.tsx` — the seven app screens.
- `src/Frame.tsx` — the app window, the chapter sidebar, hotspot and tooltip placement.
- `src/slides.tsx` — intro and closing slides.
- `src/Movement.tsx`, `src/data/movement.ts` — the closing map and its sourced data.
- `src/data/europe.json` — Natural Earth outlines, projected by `scripts/build_map.mjs`.
- `src/lib/i18n.ts` — every text, EN and FR. `src/lib/facts.ts` — the proportions the tour draws.

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
  (`scripts/build_deliverable.py`). The workbook follows the layout of a real Altera
  deliverable: Welcome (the volumes, its only input), WWF, Protein Tracker, By family,
  By department, By brand, Top and flop, and the line-level Data tab. Every figure is a
  formula; the script recalculates the workbook with LibreOffice and compares each
  formula cell to Python before finishing. It names no real retailer and shows no
  accuracy figure.

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
