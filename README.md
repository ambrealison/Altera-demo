# Altera AI: interactive demo

A guided product tour of Altera AI, in the style of Arcade or Navattic, written for
retailers' CSR teams, NGOs (such as Madre Brava or ProVeg) and retailers new to the topic.

The visitor first says who they are (retailer or NGO). Then:

1. **Why now**: the movement in short, with a still map of the retailers that publish.
2. **The protein ratio**: an illustrative basket with three levers to try; WWF and the
   Protein Tracker react differently, which is the point.
3. **What you receive**: the three pages of the sample insights report, zoomable, with
   the report (PDF) and the workbook (XLSX) to download.
4. **Two methodologies**, side by side.
5. **The tour**: the Altera AI app window, one hotspot and one tooltip per stop. Seven
   steps, each named after what the tool does, follow in order the eleven steps of
   "How Altera AI works" (Altera-agent repository). One product, a bag of crisps, is
   followed from end to end: in the sidebar, in each screen and in each tooltip.
   Tooltips are short; "Learn more" opens the detail, and technical terms explain
   themselves on hover. The sidebar steps are clickable.
6. **The movement** across Europe (public sources, cited on the page), then a call to
   action that depends on the profile.

The tour itself shows proportions, never figures. English and French; WWF always comes first.

Design follows alterafood.org: Archivo and Inter, warm paper background, ink and
lavender pills, the app shown in a peach frame.

**All data is fictitious.** Harbour Market, its brands, codes and volumes are invented.
EAN codes use GS1's documentation example prefixes. No figure in this demo describes a
real retailer or a measured accuracy.

## Use

- **Next** / **Back** in the tooltip, a click on the pulsing hotspot, or `←` / `→`.
- **Play** in the header runs the demo by itself; the Next button fills as time passes,
  and resting the pointer on a tooltip pauses it.
- Every screen has its own link. Query parameters:

  | Parameter | Effect |
  | --- | --- |
  | `lang=fr` | French (English by default) |
  | `for=ngo` | NGO profile: its "why now" and its closing call to action |
  | `path=quick` | the 1-minute version: one stop per step, no methodology slide |
  | `autoplay=1` | plays by itself, for an embed on a website |
  | `speed=1.4` | shortens every pause (0.5 to 3) |

  For the website: `<iframe src="https://ambrealison.github.io/Altera-demo/?path=quick&autoplay=1" …>`.

## Structure

- `src/tour.ts`: the 14 stops (chapter, screen, what is revealed, anchor, tooltip side).
- `src/scenes.tsx`: the seven app screens.
- `src/Frame.tsx`: the app window, the chapter sidebar, hotspot and tooltip placement.
- `src/slides.tsx`: cover, why now, the ratio and its levers, what you receive, the two methodologies.
- `src/report/`: the sample insights report (three A4 pages), shown in the demo and printed from `report.html`.
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

    FFMPEG=/path/to/ffmpeg node scripts/record_video.mjs en 1.4

records the 1-minute version as `media/altera-demo-1min-en.mp4` (1920×1080, not committed),
for LinkedIn and emails. Use `fr` for French.

## Deploy

Every push to `main` builds and publishes to GitHub Pages
(`.github/workflows/pages.yml`). The build uses a relative base, so the same output
works on `ambrealison.github.io/Altera-demo/` and on a custom domain.

To serve it from a custom domain, first create the DNS record
(`CNAME demo → ambrealison.github.io`), then set the domain in the repository's
Pages settings.

## Change the call to action

`src/config.ts` holds the booking link.
