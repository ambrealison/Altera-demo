// What the insights report says about Harbour Market, computed from the fictitious catalogue.
// The figures match the sample workbook: WWF in tonnes of product (dairy equivalents),
// Protein Tracker in tonnes of protein.
import { FOOD_GROUPS, PRODUCTS, PT_CLASSES, inScope, massKg } from "./calc";
import { PT, WWF } from "./facts";
import type { Product, ProtSrc, PtClass } from "./types";

const kg = (p: Product) => massKg(p, {});
const protKg = (p: Product) => (kg(p) * (p.prot ?? 0)) / 100;
const plantKg = (p: Product) => (kg(p) * (p.plant ?? 0)) / 100;
const animalKg = (p: Product) => (kg(p) * (p.animal ?? 0)) / 100;
const sum = (xs: Product[], f: (p: Product) => number) => xs.reduce((a, p) => a + f(p), 0);

// ------------------------------------------------------------ WWF, whole products in dairy equivalents
const g = WWF.byGroup;
const plantOf = (keys: readonly string[]) => keys.reduce((a, k) => a + g[k].plant, 0);
const totalOf = (keys: readonly string[]) => keys.reduce((a, k) => a + g[k].total, 0);
export const WWF_KPI = {
  fg1: g.FG1.plant / g.FG1.total,
  fg2: g.FG2.plant / g.FG2.total,
  diet: plantOf(FOOD_GROUPS) / totalOf(FOOD_GROUPS),
  /** Planetary Health Diet proportions, as printed in Appendix D. */
  phd: { fg1: 0.6, diet: 0.74 },
};
export const WWF_GROUPS = FOOD_GROUPS.map((k) => ({ fg: k, plant: g[k].plant, animal: g[k].animal, total: g[k].total }));

// ------------------------------------------------------------ Protein Tracker
export const PT_KPI = {
  ratio: PT.ratio,
  totalT: PT.total / 1000,
  levelA: PT.levelA / PT.total,
  classes: PT_CLASSES.map((c: PtClass) => ({ cls: c, share: PT.byClass[c] / PT.total })),
};

export const DEPT_ROWS = PT.byDept.map((d) => ({
  dept: d.dept, plantT: d.plant / 1000, animalT: d.animal / 1000, totalT: d.total / 1000,
  share: d.total / PT.total, animalShare: d.animal / PT.animal, ratio: d.ratio,
}));

const byAnimal = [...DEPT_ROWS].sort((a, b) => b.animalT - a.animalT);
const top3 = byAnimal.slice(0, 3);
const own = inScope.filter((p) => p.own || p.brand === "Harbour Market");
const others = inScope.filter((p) => !(p.own || p.brand === "Harbour Market"));
const plantDept = [...DEPT_ROWS].filter((d) => d.ratio > 0.9).sort((a, b) => b.totalT - a.totalT)[0];

export const FINDINGS = {
  biggest: DEPT_ROWS[0],
  top3: { depts: top3.map((d) => d.dept), share: top3.reduce((a, d) => a + d.animalShare, 0) },
  own: {
    share: sum(own, protKg) / PT.total,
    ratio: sum(own, plantKg) / sum(own, protKg),
    brands: sum(others, plantKg) / sum(others, protKg),
  },
  plantEngine: plantDept,
};

// families that carry the most animal protein
const fam = new Map<string, number>();
for (const p of inScope) fam.set(p.family, (fam.get(p.family) ?? 0) + animalKg(p));
export const ANIMAL_FAMILIES = [...fam].sort((a, b) => b[1] - a[1]).slice(0, 5)
  .map(([family, a]) => ({ family, animalT: a / 1000, share: a / PT.animal }));

// where the protein values come from, weighted by protein sold
const SRC: ProtSrc[] = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"];
export const PROT_SOURCES = SRC.map((s) => ({ src: s, share: sum(inScope.filter((p) => p.prot_src === s), protKg) / PT.total }));

// ------------------------------------------------------------ levers, each computed product by product
interface Shift { plant: number; animal: number }
function ptAfter(d: Shift) {
  return (PT.plant + d.plant) / (PT.total + d.plant + d.animal);
}

// 1 · move 10% of red meat to plant-based mince, at the protein content of the meat alternatives sold
const redMeat = inScope.filter((p) => p.wwf_in && p.wwf.struct === "whole" && p.wwf.sub === "red_meat");
const alt = inScope.filter((p) => p.family === "Meat Alternatives");
const altProt = sum(alt, protKg) / sum(alt, kg);
const rmMass = sum(redMeat, kg) * 0.1;
const l1 = {
  pt: ptAfter({ plant: rmMass * altProt - sum(redMeat, plantKg) * 0.1, animal: -sum(redMeat, animalKg) * 0.1 }),
  wwfFg1: (g.FG1.plant + rmMass / 1000) / g.FG1.total,
};

// 2 · grow pulses, nuts and seeds by a quarter
const pulses = inScope.filter((p) => p.wwf_in && p.wwf.fg === "FG1" && ["pulses", "nuts", "seeds"].includes(p.wwf.sub ?? ""));
const pMass = sum(pulses, kg) * 0.25;
const l2 = {
  pt: ptAfter({ plant: sum(pulses, plantKg) * 0.25, animal: sum(pulses, animalKg) * 0.25 }),
  wwfFg1: (g.FG1.plant + pMass / 1000) / (g.FG1.total + pMass / 1000),
};

// 3 · swap 15% of cow's milk for soya drink
const milk = inScope.filter((p) => p.family === "Milk");
const soya = PRODUCTS.find((p) => /soya drink/i.test(p.name))!;
const mMass = sum(milk, kg) * 0.15;
const l3 = {
  pt: ptAfter({ plant: (mMass * (soya.prot ?? 0)) / 100, animal: -sum(milk, animalKg) * 0.15 }),
  wwfFg2: (g.FG2.plant + mMass / 1000) / g.FG2.total,
};

export const LEVERS = [
  { id: "meat", wwfKey: "FG1" as const, wwf: l1.wwfFg1 - WWF_KPI.fg1, pt: l1.pt - PT.ratio },
  { id: "pulses", wwfKey: "FG1" as const, wwf: l2.wwfFg1 - WWF_KPI.fg1, pt: l2.pt - PT.ratio },
  { id: "milk", wwfKey: "FG2" as const, wwf: l3.wwfFg2 - WWF_KPI.fg2, pt: l3.pt - PT.ratio },
];
