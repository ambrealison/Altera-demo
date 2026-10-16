// Every number and product the tour shows, computed once from the fictitious catalogue.
import { FILL, FUNNEL, PRODUCTS, PT_CLASSES, FOOD_GROUPS, inScope, hasIssue, proteinTracker, wwf, wwfPlantShare, wwfWholeShare } from "./calc";
import type { Product, ProtSrc, PtClass, Route } from "./types";

export const PT = proteinTracker({});
export const WWF = wwf({});

const count = (cond: (p: Product) => boolean, rows: Product[] = inScope) => rows.filter(cond).length;

export const CLASS_COUNT = Object.fromEntries(PT_CLASSES.map((c) => [c, count((p) => p.pt === c)])) as Record<PtClass, number>;
export const CLASS_EXAMPLE = Object.fromEntries(PT_CLASSES.map((c) => [c, inScope.find((p) => p.pt === c && p.route === "inherited")!])) as Record<PtClass, Product>;

export const FG_COUNT = Object.fromEntries(FOOD_GROUPS.map((g) => [g, count((p) => !!p.wwf_in && p.wwf.struct === "whole" && p.wwf.fg === g)])) as Record<string, number>;
export const WWF_COMPOSITES = count((p) => !!p.wwf_in && p.wwf.struct === "composite");
export const WWF_EXCLUDED = count((p) => !p.wwf_in);

const EXCL = ["alcohol", "beverage", "coffee_tea", "condiment", "herbs_spices", "stock"] as const;
export const EXCL_COUNT = Object.fromEntries(EXCL.map((e) => [e, count((p) => !p.wwf_in && p.wwf.excl === e)])) as Record<(typeof EXCL)[number], number>;

const ROUTES: Route[] = ["inherited", "stratum", "model"];
export const ROUTE_COUNT = Object.fromEntries(ROUTES.map((r) => [r, count((p) => p.route === r)])) as Record<Route, number>;
export const REVIEW = inScope.filter((p) => p.review);

const PROT: ProtSrc[] = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"];
export const PROT_COUNT = Object.fromEntries(PROT.map((s) => [s, count((p) => p.prot_src === s)])) as Record<ProtSrc, number>;

export const PER_PACK = (() => {
  const p = PRODUCTS.find((x) => hasIssue(x, "per_pack_protein") && /PUMPKIN/.test(x.label))!;
  const kcal = (prot: number) => Math.round(4 * prot + 9 * (p.fat ?? 0) + 4 * (p.carb ?? 0));
  return { p, declaredKcal: kcal(p.prot ?? 0), impliedKcal: kcal(p.prot_declared_bad ?? 0) };
})();

export const CRISPS = PRODUCTS.find((p) => p.note === "origin_vs_split" && /SOUR/.test(p.label))!;

export const F = {
  rows: PRODUCTS.length,
  fill: FILL,
  funnel: FUNNEL,
  ptRatio: PT.ratio,
  levelA: PT.levelA / PT.total,
  wwfPlant: wwfPlantShare(WWF),
  wwfWhole: wwfWholeShare(WWF),
  fg1Plant: WWF.byGroup.FG1.plant / (WWF.byGroup.FG1.total || 1),
  fg2Plant: WWF.byGroup.FG2.plant / (WWF.byGroup.FG2.total || 1),
  crispsPlant: (CRISPS.plant ?? 0) / (CRISPS.prot || 1),
};

export const DEPTS = PT.byDept.slice(0, 7);

/** Rows shown in the workbook preview. */
export const SHEET_ROWS: Product[] = ["Dairy & Eggs", "Fresh Meat & Poultry", "Plant-Based", "Bakery", "Breakfast & Snacks"].map((d) =>
  inScope.filter((p) => p.dept === d && (p.units ?? 0) > 0).sort((a, b) => b.units! * b.weight - a.units! * a.weight)[0]).filter(Boolean);
