import { useMemo, useState } from "react";
import { useDemo, useInstant, useReveal, type ScreenProps } from "../lib/ctx";
import { fill } from "../lib/i18n";
import { DEPARTMENTS, PRODUCTS, inScope } from "../lib/calc";
import type { Product } from "../lib/types";
import { Head, Pending, RunButton, RouteChip, useFmt } from "../components/ui";

type Rows = Product[];
interface Check {
  id: string;
  en: [string, string];
  fr: [string, string];
  /** Lines that break the rule. */
  test: (rows: Rows) => Product[];
  /** Introduce one defect, on a copy. */
  breakIt: (rows: Rows) => Rows;
}

const near = (a: number, b: number) => Math.abs(a - b) < 0.011;
const first = (cond: (p: Product) => boolean) => inScope.find(cond)!;
const swap = (rows: Rows, target: Product, patch: Partial<Product>) => rows.map((p) => (p.id === target.id ? { ...p, ...patch } : p));
const inPt = (rows: Rows) => rows.filter((p) => p.pt_in);

const CHEDDAR = first((p) => p.family === "Hard Cheese");
const OAT = first((p) => p.note === "plant_alt");
const LASAGNE = first((p) => p.family === "Ready Meals" && p.pt === "composite" && p.wwf.cat === "meat_based");
const CRISPS = first((p) => p.note === "origin_vs_split");
const BROCCOLI = first((p) => p.wwf.fg === "FG4");
const YOGHURT = first((p) => p.family === "Yoghurt" && p.wwf.fg === "FG2");
const CAKE = first((p) => p.note === "cakes" && p.level === "B");
const STEAK = first((p) => p.prot_src === "stratum_median");
const CANDLE = PRODUCTS.find((p) => p.note === "non_food")!;
const SEASONAL = first((p) => p.dept === "Frozen");
const LZ = PRODUCTS.find((p) => (p.issues ?? []).includes("leading_zero"))!;

const CHECKS: Check[] = [
  { id: "inv_animal", en: ["Animal core carries no plant protein", "Every Animal core line has a plant share of exactly zero."], fr: ["Animal core sans protéine végétale", "Chaque ligne Animal core a une part végétale strictement nulle."],
    test: (r) => inPt(r).filter((p) => p.pt === "animal_core" && (p.plant ?? 0) > 0),
    breakIt: (r) => swap(r, CHEDDAR, { plant: 0.8, animal: (CHEDDAR.prot ?? 0) - 0.8 }) },
  { id: "inv_plant", en: ["Plant classes carry no animal protein", "Plant-based core and non-core lines have an animal share of zero."], fr: ["Classes végétales sans protéine animale", "Les lignes Végétal core et non core ont une part animale nulle."],
    test: (r) => inPt(r).filter((p) => (p.pt === "plant_core" || p.pt === "plant_non_core") && (p.animal ?? 0) > 0),
    breakIt: (r) => swap(r, OAT, { plant: (OAT.prot ?? 0) - 0.3, animal: 0.3 }) },
  { id: "comp_both", en: ["A composite carries both", "Every composite has plant and animal protein above zero."], fr: ["Un composite porte les deux", "Chaque composite a des protéines végétales et animales non nulles."],
    test: (r) => inPt(r).filter((p) => p.pt === "composite" && (!(p.plant! > 0) || !(p.animal! > 0))),
    breakIt: (r) => swap(r, LASAGNE, { plant: 0, animal: LASAGNE.prot }) },
  { id: "balance", en: ["Plant + animal = total, line by line", "The split never adds or removes protein."], fr: ["Végétal + animal = total, ligne à ligne", "Le partage n'ajoute ni ne retire de protéine."],
    test: (r) => inPt(r).filter((p) => !near((p.plant ?? 0) + (p.animal ?? 0), p.prot ?? 0)),
    breakIt: (r) => swap(r, CRISPS, { plant: (CRISPS.plant ?? 0) + 1 }) },
  { id: "level_b", en: ["Level B composites follow 50/50", "Without a measured split, the published convention applies."], fr: ["Composites de niveau B à 50/50", "Sans partage mesuré, la convention publiée s'applique."],
    test: (r) => inPt(r).filter((p) => p.pt === "composite" && p.level === "B" && !near(p.plant ?? 0, p.animal ?? 0)),
    breakIt: (r) => swap(r, CAKE, { plant: +((CAKE.prot ?? 0) * 0.7).toFixed(2), animal: +((CAKE.prot ?? 0) * 0.3).toFixed(2) }) },
  { id: "comp_fg", en: ["A WWF composite has no food group", "Composites are reported by category only."], fr: ["Un composite WWF n'a pas de groupe", "Les composites ne se déclarent que par catégorie."],
    test: (r) => r.filter((p) => p.wwf_in && p.wwf.struct === "composite" && !!p.wwf.fg),
    breakIt: (r) => swap(r, LASAGNE, { wwf: { ...LASAGNE.wwf, fg: "FG1" } }) },
  { id: "subgroups", en: ["Sub-groups only in FG1, FG2, FG3, FG5", "As the WWF methodology flow chart defines them."], fr: ["Sous-groupes seulement en FG1, FG2, FG3, FG5", "Comme le définit le logigramme de la méthodologie WWF."],
    test: (r) => r.filter((p) => p.wwf_in && p.wwf.struct === "whole" && !!p.wwf.sub && !["FG1", "FG2", "FG3", "FG5"].includes(p.wwf.fg ?? "")),
    breakIt: (r) => swap(r, BROCCOLI, { wwf: { ...BROCCOLI.wwf, sub: "whole_grain" } }) },
  { id: "dairy", en: ["×10 on cheese only", "Dairy equivalents: hard and soft cheese ×10, everything else ×1."], fr: ["×10 sur le fromage seulement", "Équivalents lait : fromages à pâte dure et molle ×10, tout le reste ×1."],
    test: (r) => r.filter((p) => (p.dairy ?? 1) !== 1 && p.note !== "cheese_factor"),
    breakIt: (r) => swap(r, YOGHURT, { dairy: 10 }) },
  { id: "sources", en: ["Every protein value has a source", "Declared, reference base, Open Food Facts, food table or family median."], fr: ["Chaque teneur a une source", "Déclarée, base de référence, Open Food Facts, table ou médiane de famille."],
    test: (r) => inPt(r).filter((p) => !p.prot_src),
    breakIt: (r) => swap(r, STEAK, { prot_src: undefined }) },
  { id: "scope", en: ["Nothing out of scope is counted", "Non-food, test items and unsold lines weigh zero."], fr: ["Rien de hors périmètre n'est compté", "Non-alimentaire, articles de test et lignes non vendues pèsent zéro."],
    test: (r) => r.filter((p) => p.pt_in && (!p.in_scope || p.dept === "Household")),
    breakIt: (r) => swap(r, CANDLE, { pt_in: true, prot: 7.8, plant: 7.8, animal: 0, pt: "plant_non_core" }) },
  { id: "reconcile", en: ["Every department is in the table", "A total equal to the sum of its rows can still leave a department out."], fr: ["Chaque rayon figure au tableau", "Un total égal à la somme de ses lignes peut quand même oublier un rayon."],
    test: (r) => inPt(r).filter((p) => !DEPARTMENTS.includes(p.dept)),
    breakIt: (r) => swap(r, SEASONAL, { dept: "Seasonal" }) },
  { id: "codes", en: ["Codes kept as text", "Leading zeros intact: a code read as a number loses them."], fr: ["Codes conservés en texte", "Zéros initiaux intacts : un code lu comme un nombre les perd."],
    test: (r) => r.filter((p) => p.code.length !== 13),
    breakIt: (r) => swap(r, LZ, { code: LZ.code.replace(/^0+/, "") }) },
];

export default function S8({ ran, run, take }: ScreenProps) {
  const { t, lang, open } = useDemo();
  const f = useFmt();
  const T = t.s8;
  const instant = useInstant(ran, take);
  const shown = useReveal(ran, CHECKS.length, 240, instant, take);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const review = inScope.filter((p) => p.review);

  const results = useMemo(() => CHECKS.map((c) => {
    const rows = broken[c.id] ? c.breakIt(PRODUCTS) : PRODUCTS;
    return c.test(rows);
  }), [broken]);
  const nFail = results.filter((r, i) => i < shown && r.length).length;

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <RunButton ran={ran} run={run} label={T.action} />
        {ran && shown >= CHECKS.length && (
          <div className="card" style={{ marginTop: 22, animation: "enter .45s both" }}>
            <h3 className="mini">{T.reviewTitle}</h3>
            <p className="small" style={{ margin: "0 0 12px", color: "#374151" }}>{fill(T.reviewBody, { n: review.length })}</p>
            <div className="stack" style={{ gap: 6 }}>
              {review.map((p) => (
                <button key={p.id} className="row" onClick={() => open(p)}
                  style={{ border: 0, background: "var(--mist)", borderRadius: 6, padding: "6px 10px", cursor: "pointer", justifyContent: "space-between", textAlign: "left" }}>
                  <span className="mono small" style={{ color: "var(--navy)" }}>{p.label}</span>
                  <span className="row" style={{ gap: 6 }}><RouteChip p={p} /><span className="mono small muted">{f.pct(p.conf ?? 0, 0)}</span></span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="stack">
        {!ran ? <Pending label={T.action} run={run} /> : (
          <>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="mono small muted">{shown} / {CHECKS.length}</span>
              {shown >= CHECKS.length && (
                nFail ? <span className="chip fail">{nFail} {lang === "fr" ? "en échec" : "failing"}</span>
                  : <span className="chip ok">{lang === "fr" ? "Tous les contrôles passent" : "All checks pass"}</span>
              )}
            </div>
            <div className="checks">
              {CHECKS.map((c, i) => {
                const vis = i < shown;
                const bad = results[i];
                const failed = vis && bad.length > 0;
                const [title, desc] = c[lang];
                return (
                  <div key={c.id} className={`check ${failed ? "failed" : ""}`} style={{ opacity: vis ? 1 : 0.35, transition: "opacity .3s" }}>
                    <span className="ix">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="t">{title}</div>
                      <div className="d">{desc}</div>
                    </div>
                    <span className="status">
                      {vis ? <span className={`chip ${failed ? "fail" : "ok"}`}>{failed ? `${T.failed} · ${bad.length}` : `✓ ${T.passed}`}</span> : <span className="mono small muted">…</span>}
                    </span>
                    <span className="act">
                      {vis && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setBroken({ ...broken, [c.id]: !broken[c.id] })}>
                          {broken[c.id] ? T.restore : T.breakIt}
                        </button>
                      )}
                    </span>
                    {failed && (
                      <div className="fail-line">
                        {bad.slice(0, 2).map((p) => `${p.label} · ${describe(c.id, p, lang)}`).join("   |   ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function describe(id: string, p: Product, lang: "en" | "fr"): string {
  const fr = lang === "fr";
  switch (id) {
    case "inv_animal": return `Animal core · ${fr ? "végétal" : "plant"} ${p.plant} g`;
    case "inv_plant": return `${fr ? "végétal" : "plant class"} · ${fr ? "animal" : "animal"} ${p.animal} g`;
    case "comp_both": return `composite · ${fr ? "végétal" : "plant"} ${p.plant} g`;
    case "balance": return `${p.plant} + ${p.animal} ≠ ${p.prot}`;
    case "level_b": return `${fr ? "niveau B" : "level B"} · ${p.plant} / ${p.animal}`;
    case "comp_fg": return `composite · ${p.wwf.fg}`;
    case "subgroups": return `${p.wwf.fg} · ${p.wwf.sub}`;
    case "dairy": return `×${p.dairy}`;
    case "sources": return fr ? "teneur sans source" : "value without a source";
    case "scope": return fr ? "non-alimentaire compté" : "non-food counted";
    case "reconcile": return fr ? `rayon « ${p.dept} » absent du tableau` : `department “${p.dept}” missing from the table`;
    case "codes": return `${p.code} (${p.code.length} ${fr ? "chiffres" : "digits"})`;
    default: return "";
  }
}
