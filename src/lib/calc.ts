import type { Catalogue, Multipliers, Product, PtClass } from "./types";
import raw from "../data/catalogue.json";

export const CATALOGUE = raw as unknown as Catalogue;
export const PRODUCTS: Product[] = CATALOGUE.products;
export const RETAILER = CATALOGUE.meta.retailer;

export const DEPARTMENTS: string[] = Array.from(new Set(PRODUCTS.map((p) => p.dept))).sort();

export const PT_CLASSES: PtClass[] = ["animal_core", "composite", "plant_non_core", "plant_core"];

/** Volume sold, after the presenter's what-if multiplier for the department. */
export function units(p: Product, m: Multipliers): number {
  return (p.units ?? 0) * (m[p.dept] ?? 1);
}

/** Kilograms of product sold: units × net weight. */
export function massKg(p: Product, m: Multipliers): number {
  return units(p, m) * p.weight;
}

/** Kilograms of protein sold: units × net weight × protein per 100 g ÷ 100. */
export function proteinKg(p: Product, m: Multipliers) {
  const kg = massKg(p, m);
  return {
    total: (kg * (p.prot ?? 0)) / 100,
    plant: (kg * (p.plant ?? 0)) / 100,
    animal: (kg * (p.animal ?? 0)) / 100,
  };
}

export interface PtResult {
  plant: number;
  animal: number;
  total: number;
  ratio: number;
  byClass: Record<PtClass, number>;
  byDept: { dept: string; plant: number; animal: number; total: number; ratio: number }[];
  levelA: number;
  levelB: number;
}

export function proteinTracker(m: Multipliers): PtResult {
  const byClass = { animal_core: 0, composite: 0, plant_non_core: 0, plant_core: 0 } as Record<PtClass, number>;
  const dept = new Map<string, { plant: number; animal: number; total: number }>();
  let plant = 0, animal = 0, total = 0, levelA = 0, levelB = 0;
  for (const p of PRODUCTS) {
    if (!p.pt_in || !p.pt) continue;
    const k = proteinKg(p, m);
    plant += k.plant; animal += k.animal; total += k.total;
    byClass[p.pt] += k.total;
    if (p.level === "A") levelA += k.total; else levelB += k.total;
    const d = dept.get(p.dept) ?? { plant: 0, animal: 0, total: 0 };
    d.plant += k.plant; d.animal += k.animal; d.total += k.total;
    dept.set(p.dept, d);
  }
  const byDept = Array.from(dept, ([d, v]) => ({ dept: d, ...v, ratio: v.total ? v.plant / v.total : 0 }))
    .sort((a, b) => b.total - a.total);
  return { plant, animal, total, ratio: total ? plant / total : 0, byClass, byDept, levelA, levelB };
}

export const FOOD_GROUPS = ["FG1", "FG2", "FG3", "FG4", "FG5", "FG6", "FG7"] as const;

export interface WwfResult {
  wholeT: number;
  compositeT: number;
  byGroup: Record<string, { plant: number; animal: number; total: number }>;
  byCategory: Record<string, number>;
  excludedT: number;
}

/** WWF measures TONNES OF PRODUCT, never protein. Dairy enters in dairy equivalents. */
export function wwf(m: Multipliers): WwfResult {
  const byGroup: WwfResult["byGroup"] = {};
  for (const g of FOOD_GROUPS) byGroup[g] = { plant: 0, animal: 0, total: 0 };
  const byCategory: Record<string, number> = { meat_based: 0, seafood_based: 0, vegetarian: 0, vegan: 0 };
  let wholeT = 0, compositeT = 0, excludedT = 0;
  for (const p of PRODUCTS) {
    if (!p.in_scope) continue;
    const t = massKg(p, m) / 1000;
    if (!p.wwf_in) { excludedT += t; continue; }
    if (p.wwf.struct === "composite") {
      compositeT += t;
      if (p.wwf.cat) byCategory[p.wwf.cat] = (byCategory[p.wwf.cat] ?? 0) + t;
      continue;
    }
    wholeT += t;
    const g = byGroup[p.wwf.fg ?? ""];
    if (!g) continue;
    const eq = p.wwf.fg === "FG2" ? t * (p.dairy ?? 1) : t;
    g.total += eq;
    if (p.wwf.src === "plant") g.plant += eq; else g.animal += eq;
  }
  return { wholeT, compositeT, byGroup, byCategory, excludedT };
}

// ------------------------------------------------------------ pipeline counts
export function count<T extends string>(rows: Product[], key: (p: Product) => T | undefined) {
  const c = {} as Record<T, number>;
  for (const p of rows) {
    const k = key(p);
    if (k === undefined || (k as string) === "") continue;
    c[k] = (c[k] ?? 0) + 1;
  }
  return c;
}

export const inScope = PRODUCTS.filter((p) => p.in_scope);
export const ptScope = PRODUCTS.filter((p) => p.pt_in);
export const wwfScope = PRODUCTS.filter((p) => p.wwf_in);

export function hasIssue(p: Product, issue: string) {
  return (p.issues ?? []).includes(issue);
}

export const FUNNEL = {
  received: PRODUCTS.length,
  tests: PRODUCTS.filter((p) => hasIssue(p, "test_item")).length,
  nonFood: PRODUCTS.filter((p) => p.dept === "Household" && !hasIssue(p, "test_item")).length,
  unsold: PRODUCTS.filter((p) => hasIssue(p, "no_sales")).length,
  measured: inScope.length,
  wwfExcluded: inScope.filter((p) => !p.wwf_in).length,
  wwf: wwfScope.length,
};

/** Share of the received rows on which a column is filled. */
export const FILL = {
  label: 1,
  brand: 1,
  department: 1,
  weight: PRODUCTS.filter((p) => p.weight_raw !== undefined && p.weight_src === "declared").length / PRODUCTS.length,
  ingredients: PRODUCTS.filter((p) => p.ingredients).length / PRODUCTS.length,
  protein: PRODUCTS.filter((p) => p.prot_src === "declared" || p.prot_declared_bad).length / PRODUCTS.length,
  volumes: PRODUCTS.filter((p) => (p.units ?? 0) > 0).length / PRODUCTS.length,
};

// ------------------------------------------------------------ formatting
export function fmtInt(n: number, lang: string) {
  return Math.round(n).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB");
}
export function fmtPct(n: number, lang: string, digits = 1) {
  return (n * 100).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }) + (lang === "fr" ? " %" : "%");
}
export function fmtNum(n: number, lang: string, digits = 1) {
  return n.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
}

/** GS1 check digit, the test that separates a genuine EAN from an internal code. */
export function eanValid(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const d = code.split("").map(Number);
  const s = d.slice(0, 12).reduce((a, x, i) => a + x * (i % 2 ? 3 : 1), 0);
  return (10 - (s % 10)) % 10 === d[12];
}

/** WWF mandatory split: plant share of protein-rich foods (FG1) and dairy (FG2, in dairy equivalents). */
export function wwfPlantShare(r: WwfResult): number {
  const g1 = r.byGroup.FG1, g2 = r.byGroup.FG2;
  const tot = g1.total + g2.total;
  return tot ? (g1.plant + g2.plant) / tot : 0;
}

/** Whole products' share of the tonnes in the WWF scope. */
export function wwfWholeShare(r: WwfResult): number {
  const tot = r.wholeT + r.compositeT;
  return tot ? r.wholeT / tot : 0;
}
