# Altera AI: interactive demo

A guided product tour of Altera AI, in the style of Arcade or Navattic, for retailers'
CSR teams, NGOs and retailers new to the topic. One page at a time, one button to the next:

1. **Why now**: the movement in short, with a still map of the retailers that publish.
2. **What you receive**: the sample insights report (nine pages, zoomable) and the
   workbook, both to download.
3. **Two methodologies**, side by side; technical terms explain themselves on hover.
4. **The tour**: ten steps, one page each, following "The Altera protein ratio method":
   data received, scope, classification, protein content, plant / animal split, volumes,
   WWF ratio, Protein Tracker ratio, checks and accuracy, delivery. The Altera AI app window
   is shown whole; each screen has two numbered parts, and the explanation beside the
   window (below it on narrow screens) has one paragraph for each, so nothing on screen
   goes unexplained and nothing covers the interface. A "Next step" button moves on;
   nothing else in the window is clickable.
5. **The movement** across Europe (public sources, cited on the page), then the booking link.

The tour shows proportions, never figures. English and French; WWF always comes first.

Design follows alterafood.org: Archivo and Inter, warm paper background, ink and
lavender pills, the app shown in a peach frame.

**All data is fictitious.** Harbour Market, its brands, codes and volumes are invented.
EAN codes use GS1's documentation example prefixes. No figure in this demo describes a
real retailer or a measured accuracy.

## Use

- **Next** / **Back** in the tooltip, a click on the pulsing hotspot, or `←` / `→`.
- Every page has its own link: `…/?lang=fr#classes`, `…/?lang=en#ratios`.

## Structure

- `src/tour.ts`: the ten steps, one page each.
- `src/scenes.tsx`: the ten app screens, two numbered parts each.
- `src/Frame.tsx`: the app window, the chapter sidebar, hotspot and tooltip placement.
- `src/slides.tsx`: cover, why now, what you receive, the two methodologies.
- `src/report/`: the sample insights report (nine 16:9 pages, in the layout of a real Altera restitution), shown in the demo and printed from `report.html`.
- `src/lib/insights.ts`: what the report says, computed from the catalogue (same figures as the workbook).
- `src/Gloss.tsx`: glossary terms explained on hover.
- `src/Movement.tsx`, `src/data/movement.ts`: the closing map and its sourced data.
- `src/data/europe.json`: Natural Earth outlines, projected by `scripts/build_map.mjs`.
- `src/lib/i18n.ts`: every text, EN and FR. `src/lib/facts.ts`: the proportions the tour draws.

## Develop

    npm install
    npm run dev          # http://localhost:5173
    npm run build        # type-check and build into dist/

## Data

    npm run data

regenerates, deterministically:

- `src/data/catalogue.json`: 800 products (`scripts/generate_dataset.py`). The script
  refuses to write a catalogue that breaks a methodology rule (plant/animal invariant,
  composites with a food group, ×10 outside cheese, mass balance…).
- `public/downloads/`: the demo workbook and line-level CSV
  (`scripts/build_deliverable.py`). The workbook follows the layout of a real Altera
  deliverable: Welcome (the volumes, its only input), WWF, Protein Tracker, By family,
  By department, By brand, Top and flop, and the line-level Data tab. Every figure is a
  formula; the script recalculates the workbook with LibreOffice and compares each
  formula cell to Python before finishing. It names no real retailer and shows no
  accuracy figure.

Both need Python 3 with `openpyxl`; the recalculation check needs LibreOffice.

    npm run report

prints the sample insights report to `public/downloads/HarbourMarket_Insights_Report_DEMO_{EN,FR}.pdf`
with the local Chrome (`puppeteer-core`; set `CHROME_PATH` if Chrome is elsewhere).

## Deploy

Every push to `main` builds and publishes to GitHub Pages
(`.github/workflows/pages.yml`). The build uses a relative base, so the same output
works on `ambrealison.github.io/Altera-demo/` and on a custom domain.

To serve it from a custom domain, first create the DNS record
(`CNAME demo → ambrealison.github.io`), then set the domain in the repository's
Pages settings.

## Change the call to action

`src/config.ts` holds the booking link.
