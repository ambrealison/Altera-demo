// Build the Europe map used on the closing page.
//
//   node scripts/build_map.mjs   ->  src/data/europe.json
//
// Natural Earth outlines (world-atlas, 1:50m), projected once with a Lambert azimuthal
// equal-area projection centred on Europe, clipped to the frame and rounded, so the
// page ships plain SVG paths and needs no map library at runtime.
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoAzimuthalEqualArea, geoPath, geoCentroid } from "d3-geo";

const W = 1000, H = 820;
const topo = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url)));
const all = feature(topo, topo.objects.countries).features;

// Frame: Ireland to the Black Sea, Crete to southern Scandinavia, where the data is.
const frame = { type: "MultiPoint", coordinates: [[-10, 36], [28, 35.5], [28, 58.5], [-10, 58.5], [9, 60], [9, 35]] };
const projection = geoAzimuthalEqualArea().rotate([-10, -52]).fitExtent([[10, 10], [W - 10, H - 10]], frame).clipExtent([[-20, -20], [W + 20, H + 20]]);
const path = geoPath(projection);

// Labels and anchor points we may override (centroids of countries with overseas parts are off).
const ANCHOR = { 250: [2.4, 46.8], 528: [5.6, 52.5], 56: [4.3, 50.5], 826: [-1.8, 53.2], 724: [-3.6, 40.3], 578: [9.5, 61.5], 276: [10.2, 51.2], 756: [8.1, 46.8], 40: [14.3, 47.6] };

const round = (d) => d.replace(/(\d+\.\d)\d+/g, "$1");
const out = [];
for (const f of all) {
  const [[x0, y0], [x1, y1]] = path.bounds(f);
  if (x1 < -50 || x0 > W + 50 || y1 < -50 || y0 > H + 50) continue; // outside the frame
  const d = path(f);
  if (!d) continue;
  const id = Number.isFinite(Number(f.id)) ? Number(f.id) : -(out.length + 1); // Kosovo has no ISO code
  const c = projection(ANCHOR[id] ?? geoCentroid(f));
  out.push({ id, name: f.properties.name, d: round(d), cx: Math.round(c[0]), cy: Math.round(c[1]) });
}
writeFileSync(new URL("../src/data/europe.json", import.meta.url), JSON.stringify({ w: W, h: H, countries: out }));
console.log(`${out.length} countries · ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
