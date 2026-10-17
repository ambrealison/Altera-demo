// The sample insights report: three A4 pages, rendered both as the preview in the demo
// and, through report.html, as the downloadable PDF (scripts/build_report.mjs).
import type { ReactNode } from "react";
import type { Lang, PtClass } from "../lib/types";
import { fmtNum, fmtPct } from "../lib/calc";
import { UI_STR, dept } from "../lib/i18n";
import { ANIMAL_FAMILIES, DEPT_ROWS, FINDINGS, LEVERS, PROT_SOURCES, PT_KPI, WWF_GROUPS, WWF_KPI } from "../lib/insights";
import "./report.css";

export const REPORT_PAGES = 3;

const T = {
  en: {
    kind: "Insights report",
    retailer: "Harbour Market · FY2026",
    fictitious: "Fictitious data",
    pages: ["At a glance", "Where the protein comes from", "What would move it"],
    title: "Where your protein comes from, and what would move it.",
    wwfFg1: "Plant share of protein-rich foods (FG1)",
    wwfDiet: "Plant share of the whole diet",
    ptRatio: "Plant share of all protein sold",
    phd: "Planetary Health Diet: {v}",
    levelA: "Measured at level A: {v} of protein",
    unitWwf: "Tonnes of product, dairy equivalents",
    unitPt: "Tonnes of protein",
    findings: "Key findings",
    f1: "of all the protein sold comes from {d}, almost all of it animal.",
    f2: "of animal protein comes from three departments: {a}, {b} and {c}.",
    f3: "of protein is own label, at a plant share of {o} against {b} for brands: the lever you control most directly.",
    f4: "of protein comes from {d}, {r} of it plant: the plant engine of the catalogue.",
    groups: "WWF · food groups, whole products",
    groupsNote: "Tonnes of product, dairy in dairy equivalents. Plant share by weight.",
    fg: { FG1: "Protein-rich foods", FG2: "Dairy and alternatives", FG3: "Fats and oils", FG4: "Fruit and vegetables", FG5: "Grains", FG6: "Tubers", FG7: "Foods high in fat, salt, sugar" } as Record<string, string>,
    classes: "Protein Tracker · the four classes",
    classesNote: "Share of all protein sold.",
    depts: "Protein Tracker · by department",
    deptsNote: "Tonnes of protein sold, plant and animal.",
    plant: "Plant", animal: "Animal", share: "Plant share",
    levers: "Three levers, computed",
    leversNote: "Each lever is computed product by product on the fictitious catalogue, all else equal. Points of plant share.",
    lever: { meat: "Move 10% of red meat sales to plant-based mince", pulses: "Grow pulses, nuts and seeds sales by 25%", milk: "Swap 15% of cow's milk for soya drink" } as Record<string, string>,
    colLever: "Lever", colWwf: "WWF", colPt: "Protein Tracker",
    families: "Where the animal protein is",
    familiesNote: "The five families that carry the most animal protein.",
    quality: "Data behind the figures",
    sources: "Source of the protein values, weighted by protein sold",
    accuracy: "Accuracy is measured on a sealed control sample, reviewed by hand: 500 rows drawn at random, the 500 products weighing most in tonnes of protein, and the 3 best sellers of every category. One rate per field; this fictitious copy shows none.",
    method: "How to read this report",
    methodText: "WWF Planet-Based Diets counts tonnes of product, with dairy in dairy equivalents. The Protein Tracker counts tonnes of protein. Altera AI applies both to every product, separately: the two are never merged, so their figures differ.",
    foot: "Altera AI · Fictitious data: Harbour Market, its brands and its figures are invented.",
    page: "Page {n} / {t}",
  },
  fr: {
    kind: "Rapport d'analyse",
    retailer: "Harbour Market · 2026",
    fictitious: "Données fictives",
    pages: ["En un coup d'œil", "D'où viennent les protéines", "Ce qui le ferait bouger"],
    title: "D'où viennent vos protéines, et ce qui les ferait bouger.",
    wwfFg1: "Part végétale des aliments protéiques (FG1)",
    wwfDiet: "Part végétale de l'alimentation entière",
    ptRatio: "Part végétale des protéines vendues",
    phd: "Planetary Health Diet : {v}",
    levelA: "Mesuré en niveau A : {v} des protéines",
    unitWwf: "Tonnes de produit, équivalents lait",
    unitPt: "Tonnes de protéines",
    findings: "Enseignements clés",
    f1: "des protéines vendues viennent du rayon {d}, presque toutes animales.",
    f2: "des protéines animales viennent de trois rayons : {a}, {b} et {c}.",
    f3: "des protéines sont à marque propre, avec une part végétale de {o} contre {b} pour les marques : le levier le plus direct.",
    f4: "des protéines viennent du rayon {d}, à {r} végétales : le moteur végétal du catalogue.",
    groups: "WWF · groupes d'aliments, produits entiers",
    groupsNote: "Tonnes de produit, laitiers en équivalents lait. Part végétale en poids.",
    fg: { FG1: "Aliments protéiques", FG2: "Laitiers et alternatives", FG3: "Matières grasses", FG4: "Fruits et légumes", FG5: "Céréales", FG6: "Tubercules", FG7: "Produits gras, salés, sucrés" } as Record<string, string>,
    classes: "Protein Tracker · les quatre classes",
    classesNote: "Part de toutes les protéines vendues.",
    depts: "Protein Tracker · par rayon",
    deptsNote: "Tonnes de protéines vendues, végétales et animales.",
    plant: "Végétal", animal: "Animal", share: "Part végétale",
    levers: "Trois leviers, chiffrés",
    leversNote: "Chaque levier est calculé produit par produit sur le catalogue fictif, toutes choses égales par ailleurs. En points de part végétale.",
    lever: { meat: "Basculer 10 % des ventes de viande rouge vers du haché végétal", pulses: "Augmenter de 25 % les ventes de légumineuses, fruits à coque et graines", milk: "Remplacer 15 % du lait de vache par de la boisson au soja" } as Record<string, string>,
    colLever: "Levier", colWwf: "WWF", colPt: "Protein Tracker",
    families: "Où sont les protéines animales",
    familiesNote: "Les cinq familles qui portent le plus de protéines animales.",
    quality: "Les données derrière les chiffres",
    sources: "Source des teneurs en protéines, pondérée par les protéines vendues",
    accuracy: "L'exactitude se mesure sur un échantillon de contrôle scellé, relu à la main : 500 lignes tirées au hasard, les 500 produits qui pèsent le plus en tonnes de protéines, et les 3 meilleures ventes de chaque catégorie. Un taux par champ ; cette copie fictive n'en affiche aucun.",
    method: "Comment lire ce rapport",
    methodText: "WWF Planet-Based Diets compte des tonnes de produit, les laitiers en équivalents lait. Le Protein Tracker compte des tonnes de protéines. Altera AI applique les deux à chaque produit, séparément : elles ne sont jamais fusionnées, d'où des chiffres différents.",
    foot: "Altera AI · Données fictives : Harbour Market, ses marques et ses chiffres sont inventés.",
    page: "Page {n} / {t}",
  },
};
export const REPORT_TITLES = { en: T.en.pages, fr: T.fr.pages };

const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};
const SRC_COLOR = ["var(--ink)", "var(--green)", "var(--green-2)", "var(--plant-2)", "#c9d9ce"];

const FAMILY_FR: Record<string, string> = {
  Poultry: "Volaille", Beef: "Bœuf", Pork: "Porc", "Hard Cheese": "Fromages à pâte pressée", "Soft Cheese": "Fromages à pâte molle",
  Milk: "Lait", Yoghurt: "Yaourts", Eggs: "Œufs", "Cooked Meats": "Charcuterie cuite", "Fresh Fish": "Poisson frais",
  "Sausages & Burgers": "Saucisses et burgers", "Fresh Cheese": "Fromages frais", "Turkey & Lamb": "Dinde et agneau",
};
const family = (f: string, lang: Lang) => (lang === "fr" ? FAMILY_FR[f] ?? f : f);

const fillIn = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");

function Page({ n, lang, children }: { n: number; lang: Lang; children: ReactNode }) {
  const L = T[lang];
  return (
    <section className="rp-page">
      <header className="rp-head">
        <span className="rp-logo">Altera<em>.ai</em></span>
        <span className="rp-kind">{L.kind}</span>
        <span className="rp-right"><b>{L.retailer}</b><span className="rp-tag">{L.fictitious}</span></span>
      </header>
      <div className="rp-eyebrow">{n} · {L.pages[n - 1]}</div>
      {children}
      <footer className="rp-foot"><span>{L.foot}</span><span>{fillIn(L.page, { n: String(n), t: String(REPORT_PAGES) })}</span></footer>
    </section>
  );
}

function Split({ plant, animal, max, h = 12 }: { plant: number; animal: number; max: number; h?: number }) {
  return (
    <div className="rp-bar" style={{ height: h }}>
      <i style={{ width: `${(100 * plant) / max}%`, background: "var(--plant)" }} />
      <i style={{ width: `${(100 * animal) / max}%`, background: "var(--animal)" }} />
    </div>
  );
}

export function ReportPages({ lang }: { lang: Lang }) {
  const L = T[lang];
  const U = UI_STR[lang];
  const pct = (v: number, d = 1) => fmtPct(v, lang, d);
  const pts = (v: number) => `${v >= 0 ? "+" : ""}${fmtNum(v * 100, lang, 1)} pts`;
  const t = (v: number) => `${fmtNum(v, lang, 0)} t`;
  const F = FINDINGS;
  const maxDept = Math.max(...DEPT_ROWS.map((d) => d.totalT));
  const maxFam = Math.max(...ANIMAL_FAMILIES.map((f) => f.animalT));

  return (
    <>
      {/* ---------------------------------------------------------------- 1 · at a glance */}
      <Page n={1} lang={lang}>
        <h1 className="rp-title">{L.title}</h1>
        <div className="rp-kpis">
          <div className="rp-kpi wwf">
            <span className="rp-m">WWF</span>
            <b>{pct(WWF_KPI.fg1)}</b>
            <span className="rp-k">{L.wwfFg1}</span>
            <div className="rp-gauge"><i style={{ width: `${WWF_KPI.fg1 * 100}%` }} /><s style={{ left: `${WWF_KPI.phd.fg1 * 100}%` }} /></div>
            <span className="rp-ref">{fillIn(L.phd, { v: pct(WWF_KPI.phd.fg1, 0) })}</span>
          </div>
          <div className="rp-kpi wwf">
            <span className="rp-m">WWF</span>
            <b>{pct(WWF_KPI.diet)}</b>
            <span className="rp-k">{L.wwfDiet}</span>
            <div className="rp-gauge"><i style={{ width: `${WWF_KPI.diet * 100}%` }} /><s style={{ left: `${WWF_KPI.phd.diet * 100}%` }} /></div>
            <span className="rp-ref">{fillIn(L.phd, { v: pct(WWF_KPI.phd.diet, 0) })}</span>
          </div>
          <div className="rp-kpi pt">
            <span className="rp-m">Protein Tracker</span>
            <b>{pct(PT_KPI.ratio)}</b>
            <span className="rp-k">{L.ptRatio}</span>
            <div className="rp-gauge"><i style={{ width: `${PT_KPI.ratio * 100}%` }} /></div>
            <span className="rp-ref">{fillIn(L.levelA, { v: pct(PT_KPI.levelA, 0) })}</span>
          </div>
        </div>
        <div className="rp-units"><span>WWF · {L.unitWwf}</span><span>Protein Tracker · {L.unitPt}</span></div>

        <h2 className="rp-h2">{L.findings}</h2>
        <ol className="rp-findings">
          <li><b>{pct(F.biggest.share, 0)}</b><span>{fillIn(L.f1, { d: dept(F.biggest.dept, lang) })}</span></li>
          <li><b>{pct(F.top3.share, 0)}</b><span>{fillIn(L.f2, { a: dept(F.top3.depts[0], lang), b: dept(F.top3.depts[1], lang), c: dept(F.top3.depts[2], lang) })}</span></li>
          <li><b>{pct(F.own.share, 0)}</b><span>{fillIn(L.f3, { o: pct(F.own.ratio, 0), b: pct(F.own.brands, 0) })}</span></li>
          <li><b>{pct(F.plantEngine.share, 0)}</b><span>{fillIn(L.f4, { d: dept(F.plantEngine.dept, lang), r: pct(F.plantEngine.ratio, 0) })}</span></li>
        </ol>
        <div className="rp-box">
          <b>{L.method}</b>
          <p>{L.methodText}</p>
        </div>
      </Page>

      {/* ---------------------------------------------------------------- 2 · where the protein comes from */}
      <Page n={2} lang={lang}>
        <h2 className="rp-h2 first">{L.groups}</h2>
        <p className="rp-note">{L.groupsNote}</p>
        <div className="rp-table groups">
          {WWF_GROUPS.map((r) => (
            <div className="rp-tr" key={r.fg}>
              <span className="rp-fg">{r.fg}</span>
              <span>{L.fg[r.fg]}</span>
              <Split plant={r.plant} animal={r.animal} max={Math.max(...WWF_GROUPS.map((x) => x.total))} h={10} />
              <span className="rp-num">{t(r.total)}</span>
              <span className="rp-num strong">{pct(r.total ? r.plant / r.total : 0, 0)}</span>
            </div>
          ))}
        </div>

        <h2 className="rp-h2">{L.classes}</h2>
        <p className="rp-note">{L.classesNote}</p>
        <div className="rp-seg">
          {PT_KPI.classes.map((c) => <i key={c.cls} style={{ flexBasis: `${c.share * 100}%`, background: CLASS_COLOR[c.cls] }} />)}
        </div>
        <div className="rp-legend">
          {PT_KPI.classes.map((c) => <span key={c.cls}><i style={{ background: CLASS_COLOR[c.cls] }} />{U.classes[c.cls]} <b>{pct(c.share, 0)}</b></span>)}
        </div>

        <h2 className="rp-h2">{L.depts}</h2>
        <p className="rp-note">{L.deptsNote}</p>
        <div className="rp-table depts">
          {DEPT_ROWS.map((d) => (
            <div className="rp-tr" key={d.dept}>
              <span>{dept(d.dept, lang)}</span>
              <Split plant={d.plantT} animal={d.animalT} max={maxDept} />
              <span className="rp-num">{t(d.totalT)}</span>
              <span className="rp-num strong">{pct(d.ratio, 0)}</span>
            </div>
          ))}
        </div>
        <div className="rp-legend small"><span><i style={{ background: "var(--plant)" }} />{L.plant}</span><span><i style={{ background: "var(--animal)" }} />{L.animal}</span><span className="rp-right-note">{L.share}</span></div>
      </Page>

      {/* ---------------------------------------------------------------- 3 · what would move it */}
      <Page n={3} lang={lang}>
        <h2 className="rp-h2 first">{L.levers}</h2>
        <p className="rp-note">{L.leversNote}</p>
        <div className="rp-levers">
          <div className="rp-lh"><span>{L.colLever}</span><span>{L.colWwf}</span><span>{L.colPt}</span></div>
          {LEVERS.map((l) => (
            <div className="rp-lr" key={l.id}>
              <span>{L.lever[l.id]}</span>
              <span><b>{pts(l.wwf)}</b><small>{l.wwfKey}</small></span>
              <span><b>{pts(l.pt)}</b></span>
            </div>
          ))}
        </div>

        <h2 className="rp-h2">{L.families}</h2>
        <p className="rp-note">{L.familiesNote}</p>
        <div className="rp-table fams">
          {ANIMAL_FAMILIES.map((f) => (
            <div className="rp-tr" key={f.family}>
              <span>{family(f.family, lang)}</span>
              <Split plant={0} animal={f.animalT} max={maxFam} h={10} />
              <span className="rp-num">{t(f.animalT)}</span>
              <span className="rp-num strong">{pct(f.share, 0)}</span>
            </div>
          ))}
        </div>

        <h2 className="rp-h2">{L.quality}</h2>
        <p className="rp-note">{L.sources}</p>
        <div className="rp-seg">
          {PROT_SOURCES.map((s, i) => <i key={s.src} style={{ flexBasis: `${s.share * 100}%`, background: SRC_COLOR[i] }} />)}
        </div>
        <div className="rp-legend">
          {PROT_SOURCES.map((s, i) => <span key={s.src}><i style={{ background: SRC_COLOR[i] }} />{U.protSrc[s.src]} <b>{pct(s.share, 0)}</b></span>)}
        </div>
        <div className="rp-box">
          <p><b>{fillIn(L.levelA, { v: pct(PT_KPI.levelA, 0) })}.</b> {L.accuracy}</p>
        </div>
      </Page>
    </>
  );
}
