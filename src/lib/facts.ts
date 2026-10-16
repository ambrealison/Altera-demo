// Every number the tour shows, computed once from the fictitious catalogue.
import { FILL, FUNNEL, PRODUCTS, inScope, hasIssue, proteinTracker, wwf, wwfPlantShare, wwfWholeShare } from "./calc";
import type { Product, ProtSrc, Route, SplitSrc } from "./types";

const find = (cond: (p: Product) => boolean) => PRODUCTS.find(cond)!;
const count = (cond: (p: Product) => boolean, rows = inScope) => rows.filter(cond).length;

export const PT = proteinTracker({});
export const WWF = wwf({});

export const EX = {
  leadingZero: find((p) => hasIssue(p, "leading_zero")),
  passata: find((p) => p.weight_src === "label" && /PASSATA 4X400G/.test(p.label)),
  piece: find((p) => p.weight_src === "typical_piece" && /CUCUMBER/.test(p.label)),
  instore: find((p) => p.code_kind === "instore"),
  model: find((p) => p.note === "egg_pasta" && p.route === "model" && !!p.ingredients) ?? find((p) => p.note === "egg_pasta"),
  perPack: find((p) => hasIssue(p, "per_pack_protein") && /PUMPKIN/.test(p.label)),
  crisps: find((p) => p.note === "origin_vs_split" && /SOUR/.test(p.label)),
  emmental: find((p) => p.family === "Hard Cheese"),
};

export const RAW_PREVIEW: Product[] = [
  find((p) => p.dept === "Fresh Meat & Poultry" && !!p.ingredients && !p.issues?.length),
  EX.leadingZero,
  find((p) => hasIssue(p, "missing_weight")),
  EX.instore,
  find((p) => hasIssue(p, "default_weight")),
  find((p) => hasIssue(p, "test_item")),
];

const routes: Route[] = ["inherited", "stratum", "model"];
const protSrc: ProtSrc[] = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"];
const splitSrc: SplitSrc[] = ["one_side", "ingredients", "nevo", "class", "step4a", "convention"];

export const F = {
  rows: PRODUCTS.length,
  cols: 9,
  leadingZero: count((p) => hasIssue(p, "leading_zero"), PRODUCTS),
  fill: FILL,
  funnel: FUNNEL,
  ean: count((p) => p.code_kind === "ean", PRODUCTS),
  instore: count((p) => p.code_kind === "instore", PRODUCTS),
  badCheck: count((p) => p.code_kind === "bad_check", PRODUCTS),
  shared: count((p) => hasIssue(p, "shared_code"), PRODUCTS),
  wLabel: count((p) => p.weight_src === "label", PRODUCTS),
  wPiece: count((p) => p.weight_src === "typical_piece", PRODUCTS),
  wVariable: count((p) => p.weight_src === "variable", PRODUCTS),
  routes: Object.fromEntries(routes.map((r) => [r, count((p) => p.route === r)])) as Record<Route, number>,
  review: inScope.filter((p) => p.review),
  protSrc: Object.fromEntries(protSrc.map((s) => [s, count((p) => p.prot_src === s)])) as Record<ProtSrc, number>,
  splitSrc: Object.fromEntries(splitSrc.map((s) => [s, count((p) => p.split_src === s)])) as Record<SplitSrc, number>,
  levelA: count((p) => p.level === "A"),
  levelB: count((p) => p.level === "B"),
  levelAProtein: PT.levelA / PT.total,
  ptRatio: PT.ratio,
  wwfPlant: wwfPlantShare(WWF),
  wwfWhole: wwfWholeShare(WWF),
  knownBefore: count((p) => p.route === "inherited"),
  newToBase: count((p) => p.code_kind === "ean" && p.route !== "inherited"),
};

/** The per-pack catch, with the energy arithmetic that exposes it. */
export const PER_PACK = (() => {
  const p = EX.perPack;
  const fat = p.fat ?? 0, carb = p.carb ?? 0;
  const kcal = (prot: number) => Math.round(4 * prot + 9 * fat + 4 * carb);
  return { p, fat, carb, declaredKcal: kcal(p.prot ?? 0), impliedKcal: kcal(p.prot_declared_bad ?? 0) };
})();

/** Products shown in the volumes table: best sellers across the main aisles. */
export const VOLUME_ROWS: Product[] = (() => {
  const out: Product[] = [];
  for (const d of ["Dairy & Eggs", "Fresh Meat & Poultry", "Plant-Based", "Bakery", "Grocery"]) {
    const best = inScope.filter((p) => p.dept === d && (p.units ?? 0) > 0).sort((a, b) => (b.units! * b.weight) - (a.units! * a.weight))[0];
    if (best) out.push(best);
  }
  return out;
})();
