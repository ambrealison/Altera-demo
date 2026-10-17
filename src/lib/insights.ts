// What the sample insights report says about Harbour Market, computed from the fictitious
// catalogue. The figures match the sample workbook: WWF in tonnes of product (dairy
// equivalents), Protein Tracker in tonnes of protein.
import { FOOD_GROUPS, PRODUCTS, PT_CLASSES, inScope } from "./calc";
import type { Product, PtClass } from "./types";

const kg = (p: Product, f = 1) => (p.units ?? 0) * p.weight * f;
const protKg = (p: Product) => (kg(p) * (p.prot ?? 0)) / 100;
const plantKg = (p: Product) => (kg(p) * (p.plant ?? 0)) / 100;
const animalKg = (p: Product) => (kg(p) * (p.animal ?? 0)) / 100;
const sum = (xs: Product[], f: (p: Product) => number) => xs.reduce((a, p) => a + f(p), 0);
const OWN = (p: Product) => !!p.own || p.brand === "Harbour Market";

// ------------------------------------------------------------ the three ratios, for any set of volumes
/** WWF FG1 and whole-diet plant shares (dairy equivalents) and the Protein Tracker ratio. */
export function ratiosWith(factor: (p: Product) => number = () => 1) {
  const g: Record<string, { plant: number; total: number }> = {};
  for (const k of FOOD_GROUPS) g[k] = { plant: 0, total: 0 };
  let pl = 0, pr = 0;
  for (const p of inScope) {
    const m = kg(p, factor(p));
    pr += (m * (p.prot ?? 0)) / 100;
    pl += (m * (p.plant ?? 0)) / 100;
    if (!p.wwf_in || p.wwf.struct !== "whole" || !g[p.wwf.fg ?? ""]) continue;
    const t = (p.wwf.fg === "FG2" ? m * (p.dairy ?? 1) : m) / 1000;
    g[p.wwf.fg!].total += t;
    if (p.wwf.src === "plant") g[p.wwf.fg!].plant += t;
  }
  const all = FOOD_GROUPS.reduce((a, k) => ({ plant: a.plant + g[k].plant, total: a.total + g[k].total }), { plant: 0, total: 0 });
  return { fg1: g.FG1.plant / g.FG1.total, diet: all.plant / all.total, pt: pl / pr };
}
export const RATIOS = ratiosWith();
/** Planetary Health Diet proportions, as printed in Appendix D. */
export const PHD = { fg1: 0.6, diet: 0.74 };
/** Dutch supermarkets' average plant share of protein, 2025 (The Protein Tracker, March 2026). */
export const NL_AVERAGE = 0.426;

const PT_TOTAL = sum(inScope, protKg);
const PT_ANIMAL = sum(inScope, animalKg);

// ------------------------------------------------------------ scope
export const SCOPE = {
  received: PRODUCTS.length,
  measured: inScope.length,
  massT: sum(inScope, (p) => kg(p)) / 1000,
  protT: PT_TOTAL / 1000,
  declared: sum(inScope.filter((p) => p.prot_src === "declared"), protKg) / PT_TOTAL,
  levelA: sum(inScope.filter((p) => p.level === "A"), protKg) / PT_TOTAL,
};

// ------------------------------------------------------------ the GPA detail of each class
export type Detail =
  | "red_meat" | "poultry" | "fish" | "eggs" | "cheese" | "milk" | "processed" | "animal_other"
  | "refined" | "whole_grain" | "fruit_veg" | "starchy" | "discretionary" | "outside_wwf" | "plant_other"
  | "pulses" | "nuts" | "seeds" | "meat_alt" | "tofu" | "dairy_alt"
  | "comp_meat" | "comp_fish" | "comp_veggie" | "comp_vegan" | "comp_other";

const PROCESSED = new Set(["Cooked Meats", "Cured Meats", "Pâté", "Sausages & Burgers"]);
/** The GPA sub-category of a product within its Protein Tracker class (same rule as the workbook). */
export function detail(p: Product): Detail {
  const w = p.wwf, fg = w.fg, sub = w.sub ?? "";
  switch (p.pt) {
    case "animal_core":
      if (!p.wwf_in) return "animal_other";
      if (PROCESSED.has(p.family)) return "processed";
      if (fg === "FG1") return ({ red_meat: "red_meat", poultry: "poultry", fish_shellfish: "fish", eggs: "eggs" } as Record<string, Detail>)[sub] ?? "animal_other";
      if (/Cheese/.test(p.family)) return "cheese";
      if (["Milk", "Milk Drinks", "Yoghurt"].includes(p.family)) return "milk";
      return "animal_other";
    case "composite":
      if (w.struct === "composite") return ({ meat_based: "comp_meat", seafood_based: "comp_fish", vegetarian: "comp_veggie", vegan: "comp_vegan" } as Record<string, Detail>)[w.cat ?? ""] ?? "comp_other";
      return "comp_other";
    case "plant_non_core":
      if (!p.wwf_in) return "outside_wwf";
      if (fg === "FG5") return sub === "whole_grain" ? "whole_grain" : "refined";
      return ({ FG4: "fruit_veg", FG6: "starchy", FG7: "discretionary" } as Record<string, Detail>)[fg ?? ""] ?? "plant_other";
    default:
      return ({ pulses: "pulses", nuts: "nuts", seeds: "seeds", alternative_products: "meat_alt", tofu_tempeh_seitan: "tofu", dairy_alternatives: "dairy_alt" } as Record<string, Detail>)[sub] ?? "plant_other";
  }
}

const byDetail = new Map<Detail, number>();
for (const p of inScope) byDetail.set(detail(p), (byDetail.get(detail(p)) ?? 0) + protKg(p));
const rows = (keys: Detail[]) => keys.map((k) => ({ key: k, t: (byDetail.get(k) ?? 0) / 1000, share: (byDetail.get(k) ?? 0) / PT_TOTAL }))
  .sort((a, b) => b.t - a.t);

export const CLASSES = PT_CLASSES.map((c: PtClass) => {
  const t = sum(inScope.filter((p) => p.pt === c), protKg);
  return { cls: c, t: t / 1000, share: t / PT_TOTAL };
}).sort((a, b) => b.share - a.share);

export const ANIMAL_DETAIL = rows(["red_meat", "poultry", "cheese", "milk", "fish", "processed", "eggs", "animal_other"]);
const PLANT_ALL = rows(["refined", "fruit_veg", "pulses", "whole_grain", "nuts", "discretionary", "dairy_alt", "meat_alt", "starchy", "outside_wwf", "tofu", "seeds", "plant_other"]);
export const PLANT_DETAIL = { top: PLANT_ALL.slice(0, 7), restT: PLANT_ALL.slice(7).reduce((a, r) => a + r.t, 0), restShare: PLANT_ALL.slice(7).reduce((a, r) => a + r.share, 0) };
export const REFINED_POINTS = sum(inScope.filter((p) => detail(p) === "refined"), plantKg) / PT_TOTAL;

// ------------------------------------------------------------ where to act: departments and families
const animalBy = (key: (p: Product) => string) => {
  const m = new Map<string, number>();
  for (const p of inScope) m.set(key(p), (m.get(key(p)) ?? 0) + animalKg(p));
  return [...m].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
};
const countTo = (xs: [string, number][], share: number) => {
  let c = 0;
  for (let i = 0; i < xs.length; i++) { c += xs[i][1]; if (c / PT_ANIMAL >= share) return { n: i + 1, share: c / PT_ANIMAL }; }
  return { n: xs.length, share: 1 };
};
const deptAnimal = animalBy((p) => p.dept);
const famAnimal = animalBy((p) => p.family);
export const DEPTS_ANIMAL = {
  animalT: PT_ANIMAL / 1000,
  rows: deptAnimal.slice(0, 10).map(([dept, a]) => ({ dept, t: a / 1000, share: a / PT_ANIMAL })),
  lead: countTo(deptAnimal, 0.75),
  families: { ...countTo(famAnimal, 2 / 3), of: famAnimal.length },
  dairy: (deptAnimal.filter(([d]) => d === "Dairy & Eggs" || d === "Cheese").reduce((a, [, v]) => a + v, 0)) / PT_ANIMAL,
};

// ------------------------------------------------------------ where to act: own label
const brandMap = new Map<string, { t: number; plant: number }>();
for (const p of inScope) {
  const b = brandMap.get(p.brand) ?? { t: 0, plant: 0 };
  b.t += protKg(p); b.plant += plantKg(p);
  brandMap.set(p.brand, b);
}
const own = inScope.filter(OWN), others = inScope.filter((p) => !OWN(p));
export const BRANDS = {
  ownShare: sum(own, protKg) / PT_TOTAL,
  ownRatio: sum(own, plantKg) / sum(own, protKg),
  othersShare: sum(others, protKg) / PT_TOTAL,
  othersRatio: sum(others, plantKg) / sum(others, protKg),
  nationalCount: new Set(others.map((p) => p.brand)).size,
  ownProducts: own.length,
  rows: [...brandMap].sort((a, b) => b[1].t - a[1].t).slice(0, 6)
    .map(([brand, v]) => ({ brand, own: brand === "Harbour Market", t: v.t / 1000, ratio: v.plant / v.t })),
};

// ------------------------------------------------------------ composites
const comp = inScope.filter((p) => p.pt === "composite");
const compT = sum(comp, protKg);
const wwfComp = inScope.filter((p) => p.wwf_in && p.wwf.struct === "composite");
const wwfCompMass = sum(wwfComp, (p) => kg(p));
export const COMPOSITES = {
  t: compT / 1000,
  share: compT / PT_TOTAL,
  convention: sum(comp.filter((p) => p.split_src === "convention"), protKg) / compT,
  massShare: wwfCompMass / sum(inScope.filter((p) => p.wwf_in), (p) => kg(p)),
  mix: ["meat_based", "vegetarian", "seafood_based", "vegan"].map((c) => ({
    cat: c, share: sum(wwfComp.filter((p) => p.wwf.cat === c), (p) => kg(p)) / wwfCompMass,
  })),
};

// ------------------------------------------------------------ what is still missing: loose produce
const loose = inScope.filter((p) => p.weight_src === "variable");
const looseIds = new Set(loose.map((p) => p.id));
export const LOOSE = {
  products: loose.length,
  instore: PRODUCTS.filter((p) => p.code_kind === "instore").length,
  badCodes: PRODUCTS.filter((p) => p.code_kind === "bad_check").length,
  labelWeights: PRODUCTS.filter((p) => p.weight_src === "label").length,
  massT: sum(loose, (p) => kg(p)) / 1000,
  /** If half of the loose sales were missing from the file, the full figure would count them twice as much. */
  after: ratiosWith((p) => (looseIds.has(p.id) ? 2 : 1)),
};
