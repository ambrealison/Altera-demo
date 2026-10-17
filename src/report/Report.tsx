// The sample insights report: nine 16:9 pages in the layout of a real Altera restitution,
// on Harbour Market's fictitious data. Rendered as the preview in the demo and, through
// report.html, as the downloadable PDF (scripts/build_report.mjs).
import type { ReactNode } from "react";
import type { Lang, PtClass } from "../lib/types";
import { fmtNum } from "../lib/calc";
import { UI_STR, dept } from "../lib/i18n";
import {
  ANIMAL_DETAIL, BRANDS, CLASSES, COMPOSITES, DEPTS_ANIMAL, LOOSE, NL_AVERAGE, PHD, PLANT_DETAIL, RATIOS,
  REFINED_POINTS, SCOPE, type Detail,
} from "../lib/insights";
import "./report.css";

export const REPORT_PAGES = 9;
export const PAGE_W = 1280, PAGE_H = 720;

const DETAIL_LABEL: Record<Lang, Record<Detail, string>> = {
  en: {
    red_meat: "Red meat", poultry: "Poultry", cheese: "Cheese", milk: "Milk, yoghurt and cream", fish: "Fish and seafood",
    processed: "Processed meats and dishes", eggs: "Eggs", animal_other: "Other animal products",
    refined: "Refined grains", fruit_veg: "Fruit and vegetables", pulses: "Pulses", whole_grain: "Whole grains", nuts: "Nuts",
    discretionary: "Discretionary products", dairy_alt: "Plant-based dairy alternatives", meat_alt: "Plant-based meat alternatives",
    starchy: "Starchy foods", outside_wwf: "Outside the WWF scope", tofu: "Tofu, tempeh, seitan", seeds: "Seeds", plant_other: "Other plant products",
    comp_meat: "Meat-based dishes", comp_fish: "Fish-based dishes", comp_veggie: "Vegetarian dishes", comp_vegan: "Vegan dishes", comp_other: "Other composites",
  },
  fr: {
    red_meat: "Viande rouge", poultry: "Volaille", cheese: "Fromage", milk: "Lait, yaourts et crèmes", fish: "Poisson et fruits de mer",
    processed: "Charcuterie et plats transformés", eggs: "Œufs", animal_other: "Autres produits animaux",
    refined: "Céréales raffinées", fruit_veg: "Fruits et légumes", pulses: "Légumineuses", whole_grain: "Céréales complètes", nuts: "Fruits à coque",
    discretionary: "Produits discrétionnaires", dairy_alt: "Alternatives végétales aux laitiers", meat_alt: "Alternatives végétales à la viande",
    starchy: "Féculents", outside_wwf: "Hors périmètre WWF", tofu: "Tofu, tempeh, seitan", seeds: "Graines", plant_other: "Autres produits végétaux",
    comp_meat: "Plats à base de viande", comp_fish: "Plats à base de poisson", comp_veggie: "Plats végétariens", comp_vegan: "Plats végétaliens", comp_other: "Autres composites",
  },
};

const T = {
  en: {
    eyebrows: ["Insights report", "The scope", "The result", "Protein Tracker", "The detail", "Where to act", "Where to act", "Year-1 work", "What is still missing"],
    fictitious: "Fictitious data · Harbour Market, its brands and its figures are invented.",
    page: "Altera · Sample insights report · {n} / {t}",
    cover: {
      eyebrow: "Insights report · Protein ratio",
      title: "The protein ratio of your catalogue",
      lead: "{n} products classified, two reference methodologies applied to the same product base, and the levers the figure points to.",
      who: "Harbour Market · Sales FY2026",
      sample: "Sample report",
      glance: "At a glance",
      bars: ["WWF · protein-rich foods (FG1)", "WWF · whole diet", "Protein Tracker · all protein"],
      phd: "Planetary Health Diet",
    },
    scope: {
      title: "One catalogue, classified product by product",
      lead: "The figure does not come from a sample. It comes from your whole range, crossed with your sales volumes.",
      c1: "products classified, from the barcode to the food group, out of {r} rows received: non-food, test items and unsold products set aside.",
      c2: "of product sold over the year, that is {p} t of protein put on the market.",
      c3: "of the protein comes with a value declared in your file. The rest is completed from reference sources, each value with its source.",
      boxT: "What stays with you.",
      box: "Classification happens at Altera; your sales volumes are never sent to the AI. The deliverable makes the calculation reproducible line by line: every product carries its protein value, the source of that value, its plant / animal split and its data level.",
      take: "A catalogue classified once serves both methodologies, and any that come after.",
      foot: "Altera classification of the Harbour Market catalogue · protein values declared by the retailer, completed with Open Food Facts and NEVO, the national food table and the Altera reference base · sales volumes FY2026.",
    },
    result: {
      title: "Two methods, two figures, one catalogue",
      lead: "WWF measures the weight of the products sold; the Protein Tracker measures protein. Both are right: they do not answer the same question.",
      cards: [
        ["WWF Planet-Based Diets", "Food group 1, protein-rich foods", "of Food Group 1 is of plant origin, measured in weight of product sold.", "Planetary Health Diet reference: {v} plant."],
        ["WWF, whole diet", "the seven food groups together", "of the diet you sell is plant, in weight and dairy equivalents.", "Planetary Health Diet reference: {v} plant."],
        ["The Protein Tracker", "Green Protein Alliance · ProVeg", "of the protein you sell is of plant origin.", "Dutch supermarkets, 2025 average: {v}."],
      ],
      boxT: "Why the gap between them is so wide.",
      box: "The Protein Tracker counts all protein, including that of bread, pasta and flour: refined grains alone weigh {x} points of your {pt}. WWF Food Group 1 keeps only protein-rich foods, where meat, eggs and fish outweigh pulses and nuts.",
      take: "The publishable figure depends on the method. What costs is not having two; it is changing scope without being able to rebuild the history.",
      foot: "WWF and Protein Tracker tabs of the workbook · WWF Planet-Based Diets, retailer methodology, Appendix D · Green Protein Alliance and ProVeg Nederland, The Protein Tracker 2025.",
    },
    classes: {
      title: "Where the protein you sell sits",
      lead: "{p} t of protein, spread over the methodology's four classes, each product in one class and one only.",
      boxT: "The key point.",
      box: "Dutch supermarkets averaged {nl} plant protein in 2025, {d} points above Harbour Market. With {ac} of your protein in animal core, the main lever is shifting animal core towards plant, more than reworking composites.",
      take: "Widening the plant range without touching the animal core moves the figure only at the margin.",
      foot: "Protein Tracker tab of the workbook, classes computed on your volumes · Dutch average: The Protein Tracker, National Supermarket Protein Split 2025.",
    },
    detail: {
      title: "What carries the animal, what carries the plant",
      lead: "The same {p} t, broken down to the level the methodology describes. Shares of all protein sold.",
      animal: "Where the animal protein is", animalSub: "{t} t, {s} of the protein sold",
      plant: "What carries your plant share", plantSub: "{t} t outside composites, {s} of the protein sold",
      rest: "Other plant lines",
      take: "The {c} t of protein in composites, where animal and plant share the same recipe, are dealt with apart.",
      foot: "Protein Tracker tab of the workbook, detail by sub-category.",
    },
    depts: {
      title: "{n} departments carry {s} of animal protein",
      lead: "{t} t of animal protein, by department of your own grid. The action plan does not need to cover all {m} products.",
      boxT: "What it means for the action plan.",
      box: "{n} departments carry {s} of the animal protein you sell, and {f} product families carry {fs}. A plan that treats these families moves the figure; a plan built elsewhere, however ambitious, will not.",
      take: "Meat and poultry come first, but dairy and cheese together carry {d} of animal protein: the second front.",
      foot: "By department and By family tabs of the workbook · the ten first departments shown.",
    },
    brands: {
      title: "{s} of the protein is under your own brand",
      lead: "{k} brands in the catalogue. Yours alone carries more protein than all national brands together.",
      c1: "of the protein sold is under Harbour Market, across {n} products.",
      c2: "under {k} national brands.",
      c3: "plant share of your own label, against {b} for national brands.",
      barsT: "Plant share, brand by brand",
      plant: "plant",
      own: "own label",
      take: "Harbour Market weighs {s} of all protein sold, at {r} plant: your own label is the lever you control most directly.",
      foot: "By brand tab of the workbook · plant share computed on protein, the Protein Tracker's unit.",
    },
    comp: {
      title: "Composites, {s} of your protein",
      lead: "Products where animal and plant protein coexist in the same recipe, from ready meals to biscuits.",
      c1: "of protein carried by composites, between animal and plant.",
      c2: "of this protein still split 50/50 by convention, for lack of a recipe.",
      c3: "of composite mass is meat-based, {f} fish-based.",
      mixT: "Composition of composites, by weight",
      mix: { meat_based: "Meat-based", vegetarian: "Vegetarian", seafood_based: "Seafood-based", vegan: "Vegan" } as Record<string, string>,
      boxT: "The year-1 steering indicator is not the ratio.",
      box: "It is the share of products moved to level A, those whose real plant / animal split is known. Every product that moves from B to A makes the figure more accurate without any product changing, and makes reformulation measurable the following year.",
      take: "A product that moves from B to A does not change your range. It changes what you can prove about it.",
      foot: "WWF and Data tabs of the workbook · levels A and B as defined by the Protein Tracker · composites are {m} of measured sales by weight.",
    },
    loose: {
      title: "Loose produce may not all be in the figure",
      lead: "What carries a barcode is measured. What is weighed at the till goes through in-store codes, and part of it may be missing from the file.",
      cards: [
        ["Loose fruit and vegetables", "{n} products sold by weight, {t} t. They pull towards plant, but are low in protein: the effect is real and limited."],
        ["Barcodes that fail the check", "{b} codes with a wrong check digit, matched by their label rather than by barcode."],
        ["Weights read from the label", "{w} products came without a net weight. Altera read it from the label, and the workbook says so."],
      ],
      boxT: "If half of the loose produce was not transmitted, the three ratios would become",
      cols: ["WWF, Food Group 1", "WWF, whole diet", "Protein Tracker"],
      same: "unchanged",
      up: "up about {v} {u}",
      down: "down about {v} {u}",
      note: "Food Group 1 does not move: fruit and vegetables belong to Food Group 4.",
      take: "As soon as you know what share of loose sales was not transmitted, we recalculate your ratio.",
      foot: "Altera estimate from the measured catalogue, assuming half of the loose sales absent · orders of magnitude to frame the reading.",
    },
  },
  fr: {
    eyebrows: ["Rapport d'analyse", "Le périmètre", "Le résultat", "Protein Tracker", "Le détail", "Où agir", "Où agir", "Le chantier de l'année 1", "Ce qui manque encore"],
    fictitious: "Données fictives · Harbour Market, ses marques et ses chiffres sont inventés.",
    page: "Altera · Rapport d'analyse d'exemple · {n} / {t}",
    cover: {
      eyebrow: "Rapport d'analyse · Ratio protéique",
      title: "Le ratio protéique de votre catalogue",
      lead: "{n} produits classés, deux méthodologies de référence appliquées à la même base produit, et les leviers que le chiffre désigne.",
      who: "Harbour Market · Ventes 2026",
      sample: "Rapport d'exemple",
      glance: "En un coup d'œil",
      bars: ["WWF · aliments protéiques (FG1)", "WWF · alimentation entière", "Protein Tracker · toutes les protéines"],
      phd: "Planetary Health Diet",
    },
    scope: {
      title: "Un seul catalogue, classé produit par produit",
      lead: "Le chiffre ne vient pas d'un échantillon. Il vient de votre assortiment complet, croisé avec vos volumes de vente.",
      c1: "produits classés, du code-barres au groupe d'aliments, sur {r} lignes reçues : non-alimentaire, articles de test et invendus écartés.",
      c2: "de produit vendu sur l'année, soit {p} t de protéines mises en marché.",
      c3: "des protéines ont une teneur déclarée dans votre fichier. Le reste est complété par des sources de référence, chaque valeur avec sa source.",
      boxT: "Ce qui reste chez vous.",
      box: "La classification se fait chez Altera ; vos volumes de vente ne sont jamais envoyés à l'IA. Le livrable rend le calcul reproductible ligne à ligne : chaque produit porte sa teneur en protéines, la source de cette valeur, son partage végétal / animal et son niveau de donnée.",
      take: "Un catalogue classé une fois sert les deux méthodologies, et toutes celles qui viendront après.",
      foot: "Classification Altera du catalogue Harbour Market · teneurs déclarées par le distributeur, complétées par Open Food Facts et NEVO, la table nationale et la base de référence Altera · volumes de vente 2026.",
    },
    result: {
      title: "Deux méthodes, deux chiffres, le même catalogue",
      lead: "WWF mesure le poids des produits vendus ; le Protein Tracker mesure les protéines. Les deux sont justes : ils ne répondent pas à la même question.",
      cards: [
        ["WWF Planet-Based Diets", "food group 1, les aliments protéiques", "du food group 1 est d'origine végétale, mesuré en poids de produit vendu.", "Référence Planetary Health Diet : {v} végétal."],
        ["WWF, assiette entière", "les sept food groups réunis", "de l'assiette que vous vendez est végétale, en poids et en équivalents lait.", "Référence Planetary Health Diet : {v} végétal."],
        ["Le Protein Tracker", "Green Protein Alliance · ProVeg", "de la protéine que vous vendez est d'origine végétale.", "Supermarchés néerlandais, moyenne 2025 : {v}."],
      ],
      boxT: "Pourquoi l'écart entre les deux est aussi grand.",
      box: "Le Protein Tracker compte toute la protéine, y compris celle du pain, des pâtes et de la farine : les céréales raffinées pèsent à elles seules {x} points de vos {pt}. Le food group 1 du WWF ne retient que les aliments protéiques, où la viande, les œufs et le poisson pèsent plus que les légumineuses et les fruits à coque.",
      take: "Le chiffre publiable n'est pas le même selon la méthode. Ce qui coûte cher n'est pas d'en avoir deux, c'est de changer de périmètre sans pouvoir reconstruire l'historique.",
      foot: "Onglets WWF et Protein Tracker du classeur · WWF Planet-Based Diets, méthodologie distributeurs, Appendix D · Green Protein Alliance et ProVeg Nederland, The Protein Tracker 2025.",
    },
    classes: {
      title: "Où se trouve la protéine que vous vendez",
      lead: "{p} t de protéines, réparties dans les quatre classes de la méthodologie, chaque produit dans une classe et une seule.",
      boxT: "Le point important.",
      box: "Les supermarchés néerlandais étaient en moyenne à {nl} de protéines végétales en 2025, soit {d} points de plus que Harbour Market. Avec {ac} de votre protéine en animal core, le levier principal est le passage de l'animal core vers le végétal, davantage que le travail sur les composites.",
      take: "Élargir l'offre végétale sans toucher aux gisements animaux ne déplace le chiffre qu'à la marge.",
      foot: "Onglet Protein Tracker du classeur, classes calculées sur vos volumes · moyenne néerlandaise : The Protein Tracker, National Supermarket Protein Split 2025.",
    },
    detail: {
      title: "Ce qui porte l'animal, ce qui porte le végétal",
      lead: "Les mêmes {p} t, ventilées au niveau que décrit la méthodologie. Parts de toute la protéine vendue.",
      animal: "Les gisements de protéine animale", animalSub: "{t} t, soit {s} de la protéine vendue",
      plant: "Ce qui porte votre part végétale", plantSub: "{t} t hors composites, soit {s} de la protéine vendue",
      rest: "Autres lignes végétales",
      take: "Les {c} t de protéines des composites, où l'animal et le végétal coexistent dans la même recette, sont traitées à part.",
      foot: "Onglet Protein Tracker du classeur, détail par sous-catégorie.",
    },
    depts: {
      title: "{n} rayons portent {s} de la protéine animale",
      lead: "{t} t de protéines animales, classées par rayon de votre nomenclature. Le plan d'action n'a pas à porter sur les {m} produits.",
      boxT: "Ce que ça veut dire pour le plan d'action.",
      box: "{n} rayons portent {s} de la protéine animale que vous vendez, et {f} familles produit en portent {fs}. Un plan qui traite ces familles déplace le chiffre ; un plan construit ailleurs, aussi ambitieux soit-il, ne le déplacera pas.",
      take: "La boucherie arrive en tête, mais crèmerie et fromages portent ensemble {d} de la protéine animale : c'est le second front.",
      foot: "Onglets Par rayon et Par famille du classeur · les dix premiers rayons affichés.",
    },
    brands: {
      title: "{s} de la protéine est sous votre propre marque",
      lead: "{k} marques dans le catalogue. La vôtre porte à elle seule plus de protéines que toutes les marques nationales réunies.",
      c1: "de la protéine vendue est sous marque Harbour Market, répartie sur {n} produits.",
      c2: "sous {k} marques nationales.",
      c3: "de part végétale pour votre marque propre, contre {b} pour les marques nationales.",
      barsT: "La part végétale, marque par marque",
      plant: "végétal",
      own: "marque propre",
      take: "Harbour Market pèse {s} de toute la protéine vendue, à {r} de part végétale : votre marque propre est le levier que vous maîtrisez le plus directement.",
      foot: "Onglet Par marque du classeur · part végétale calculée sur la protéine, unité du Protein Tracker.",
    },
    comp: {
      title: "Les composites, {s} de votre protéine",
      lead: "Les produits où protéines animales et végétales coexistent dans la même recette, des plats cuisinés aux biscuits.",
      c1: "de protéines portées par les composites, entre l'animal et le végétal.",
      c2: "de cette protéine encore partagée 50/50 par convention, faute de recette.",
      c3: "de la masse composite est à base de viande, {f} à base de poisson.",
      mixT: "Composition des composites, en poids",
      mix: { meat_based: "À base de viande", vegetarian: "Végétarien", seafood_based: "À base de poisson", vegan: "Végétalien" } as Record<string, string>,
      boxT: "L'indicateur de pilotage de l'année 1 n'est pas le ratio.",
      box: "C'est la part de produits passés en niveau A, ceux dont le partage végétal / animal réel est connu. Chaque produit qui passe de B à A rend le chiffre plus juste sans qu'aucun produit n'ait changé, et rend la reformulation mesurable l'année suivante.",
      take: "Un produit qui passe de B à A ne change pas votre assortiment. Il change ce que vous pouvez prouver sur votre assortiment.",
      foot: "Onglets WWF et Données du classeur · niveaux A et B au sens du Protein Tracker · les composites représentent {m} des ventes mesurées en poids.",
    },
    loose: {
      title: "Le vrac n'est peut-être pas tout entier dans le chiffre",
      lead: "Ce qui porte un code-barres est mesuré. Ce qui se pèse en caisse passe par des codes internes, et une partie peut manquer au fichier.",
      cards: [
        ["Fruits et légumes en vrac", "{n} produits vendus au poids, {t} t. Ils tirent vers le végétal, mais sont pauvres en protéines : l'effet est réel et limité."],
        ["Codes-barres invalides", "{b} codes à la clé de contrôle fausse, rapprochés par leur libellé plutôt que par le code-barres."],
        ["Poids lus sur l'étiquette", "{w} produits sont arrivés sans poids net. Altera l'a lu sur l'étiquette, et le classeur l'indique."],
      ],
      boxT: "Si la moitié du vrac n'a pas été transmise, voici ce que les trois ratios deviennent",
      cols: ["WWF, food group 1", "WWF, assiette entière", "Protein Tracker"],
      same: "inchangé",
      up: "hausse d'environ {v} {u}",
      down: "baisse d'environ {v} {u}",
      note: "Le food group 1 ne bouge pas : les fruits et légumes relèvent du food group 4.",
      take: "Dès que vous connaissez la part du vrac non transmise, nous recalculons votre ratio.",
      foot: "Estimation Altera à partir du catalogue mesuré, sous l'hypothèse d'un vrac absent à 50 % · ordres de grandeur destinés à cadrer la lecture.",
    },
  },
};
export const REPORT_TITLES = { en: T.en.eyebrows, fr: T.fr.eyebrows };

const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};
const MIX_COLOR: Record<string, string> = { meat_based: "var(--animal)", vegetarian: "var(--plant-2)", seafood_based: "var(--sky)", vegan: "var(--plant)" };
const put = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

function Page({ n, lang, eyebrow, title, lead, take, foot, children }: {
  n: number; lang: Lang; eyebrow: string; title: string; lead?: string; take?: string; foot?: string; children: ReactNode;
}) {
  const L = T[lang];
  return (
    <section className="rp-page">
      <header className="rp-top"><span className="rp-eyebrow">{eyebrow}</span><span className="rp-logo">Altera</span></header>
      <h1 className="rp-title">{title}</h1>
      {lead && <p className="rp-lead">{lead}</p>}
      <div className="rp-body">{children}</div>
      {take && <div className="rp-take"><i aria-hidden />{take}</div>}
      <footer className="rp-foot">
        {foot && <p className="rp-src">{foot}</p>}
        <div className="rp-line"><span>{L.fictitious}</span><span>{put(L.page, { n, t: REPORT_PAGES })}</span></div>
      </footer>
    </section>
  );
}

const Kpi = ({ big, text, tone }: { big: string; text: string; tone?: "peach" | "lav" }) => (
  <div className={`rp-card rp-kpi ${tone ?? ""}`}><b>{big}</b><p>{text}</p></div>
);
const Box = ({ title, text, tone = "lav" }: { title: string; text: string; tone?: "lav" | "peach" | "mint" }) => (
  <div className={`rp-box ${tone}`}><b>{title}</b><p>{text}</p></div>
);

export function ReportPages({ lang }: { lang: Lang }) {
  const L = T[lang];
  const U = UI_STR[lang];
  const D = DETAIL_LABEL[lang];
  const num = (v: number, d = 0) => fmtNum(v, lang, d);
  const pct = (v: number, d = 1) => `${fmtNum(v * 100, lang, d)}${lang === "fr" ? " %" : "%"}`;
  const pts = (v: number) => fmtNum(v * 100, lang, 1);
  const E = L.eyebrows;
  const plantCls = CLASSES.filter((c) => c.cls === "plant_core" || c.cls === "plant_non_core");
  const animalCls = CLASSES.find((c) => c.cls === "animal_core")!;
  const compCls = CLASSES.find((c) => c.cls === "composite")!;
  const maxDept = DEPTS_ANIMAL.rows[0].share;
  const ratios = [RATIOS.fg1, RATIOS.diet, RATIOS.pt];
  const after = [LOOSE.after.fg1, LOOSE.after.diet, LOOSE.after.pt];

  return (
    <>
      {/* 1 · cover */}
      <section className="rp-page rp-cover">
        <div className="rp-cover-l">
          <span className="rp-logo big">Altera</span>
          <div className="rp-cover-mid">
            <span className="rp-eyebrow"><i aria-hidden />{L.cover.eyebrow}</span>
            <h1>{L.cover.title}</h1>
            <p>{put(L.cover.lead, { n: num(SCOPE.measured) })}</p>
            <div className="rp-who"><b>{L.cover.who}</b><span className="rp-tag">{L.cover.sample}</span></div>
          </div>
          <span className="rp-fict">{L.fictitious}</span>
        </div>
        <div className="rp-cover-r">
          <span className="rp-glance">{L.cover.glance}</span>
          {ratios.map((v, i) => (
            <div className="rp-gl" key={i}>
              <span className="rp-gl-k">{L.cover.bars[i]}</span>
              <b>{pct(v)}</b>
              <div className="rp-gauge"><i style={{ width: `${v * 100}%` }} />{i < 2 && <s style={{ left: `${(i === 0 ? PHD.fg1 : PHD.diet) * 100}%` }} />}</div>
              {i < 2 && <span className="rp-gl-ref">{L.cover.phd} · {pct(i === 0 ? PHD.fg1 : PHD.diet, 0)}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* 2 · scope */}
      <Page n={2} lang={lang} eyebrow={E[1]} title={L.scope.title} lead={L.scope.lead} take={L.scope.take} foot={L.scope.foot}>
        <div className="rp-grid3">
          <Kpi big={num(SCOPE.measured)} text={put(L.scope.c1, { r: num(SCOPE.received) })} />
          <Kpi big={`${num(SCOPE.massT)} t`} text={put(L.scope.c2, { p: num(SCOPE.protT) })} tone="peach" />
          <Kpi big={pct(SCOPE.declared, 0)} text={L.scope.c3} />
        </div>
        <Box title={L.scope.boxT} text={L.scope.box} tone="mint" />
      </Page>

      {/* 3 · result, WWF first */}
      <Page n={3} lang={lang} eyebrow={E[2]} title={L.result.title} lead={L.result.lead} take={L.result.take} foot={L.result.foot}>
        <div className="rp-grid3">
          {L.result.cards.map(([name, sub, text, ref], i) => (
            <div className={`rp-card rp-res ${i === 0 ? "peach" : ""}`} key={name}>
              <span className="rp-res-n">{name}</span>
              <span className="rp-res-s">{sub}</span>
              <b className={i === 0 ? "ink" : ""}>{pct(ratios[i])}</b>
              <p>{text}</p>
              <span className="rp-res-ref">{put(ref, { v: pct(i === 0 ? PHD.fg1 : i === 1 ? PHD.diet : NL_AVERAGE, i === 2 ? 1 : 0) })}</span>
            </div>
          ))}
        </div>
        <Box title={L.result.boxT} text={put(L.result.box, { x: pts(REFINED_POINTS), pt: pct(RATIOS.pt) })} tone="mint" />
      </Page>

      {/* 4 · Protein Tracker classes */}
      <Page n={4} lang={lang} eyebrow={E[3]} title={L.classes.title} lead={put(L.classes.lead, { p: num(SCOPE.protT) })} take={L.classes.take} foot={L.classes.foot}>
        <div className="rp-card rp-bars">
          {CLASSES.map((c) => (
            <div className="rp-bar-row" key={c.cls}>
              <span className="rp-bar-n">{U.classes[c.cls]}</span>
              <span className="rp-track"><i style={{ width: `${c.share * 100}%`, background: CLASS_COLOR[c.cls] }} /></span>
              <b>{pct(c.share)}</b>
              <span className="rp-t">{num(c.t)} t</span>
            </div>
          ))}
        </div>
        <Box title={L.classes.boxT} tone="peach"
          text={put(L.classes.box, { nl: pct(NL_AVERAGE), d: fmtNum((NL_AVERAGE - RATIOS.pt) * 100, lang, 1), ac: pct(animalCls.share, 0) })} />
      </Page>

      {/* 5 · detail */}
      <Page n={5} lang={lang} eyebrow={E[4]} title={L.detail.title} lead={put(L.detail.lead, { p: num(SCOPE.protT) })}
        take={put(L.detail.take, { c: num(compCls.t) })} foot={L.detail.foot}>
        <div className="rp-grid2">
          <div className="rp-card rp-list">
            <b className="rp-list-t">{L.detail.animal}</b>
            <span className="rp-list-s">{put(L.detail.animalSub, { t: num(animalCls.t), s: pct(animalCls.share) })}</span>
            {ANIMAL_DETAIL.map((r) => <div className="rp-li" key={r.key}><span>{D[r.key]}</span><b>{num(r.t)} t <i>·</i> {pct(r.share)}</b></div>)}
          </div>
          <div className="rp-card rp-list">
            <b className="rp-list-t">{L.detail.plant}</b>
            <span className="rp-list-s">{put(L.detail.plantSub, { t: num(plantCls.reduce((a, c) => a + c.t, 0)), s: pct(plantCls.reduce((a, c) => a + c.share, 0)) })}</span>
            {PLANT_DETAIL.top.map((r) => <div className="rp-li" key={r.key}><span>{D[r.key]}</span><b>{num(r.t)} t <i>·</i> {pct(r.share)}</b></div>)}
            <div className="rp-li muted"><span>{L.detail.rest}</span><b>{num(PLANT_DETAIL.restT)} t <i>·</i> {pct(PLANT_DETAIL.restShare)}</b></div>
          </div>
        </div>
      </Page>

      {/* 6 · departments */}
      <Page n={6} lang={lang} eyebrow={E[5]} title={put(L.depts.title, { n: DEPTS_ANIMAL.lead.n, s: pct(DEPTS_ANIMAL.lead.share, 0) })}
        lead={put(L.depts.lead, { t: num(DEPTS_ANIMAL.animalT), m: num(SCOPE.measured) })}
        take={put(L.depts.take, { d: pct(DEPTS_ANIMAL.dairy, 0) })} foot={L.depts.foot}>
        <div className="rp-card rp-bars tight">
          {DEPTS_ANIMAL.rows.map((r, i) => (
            <div className="rp-bar-row" key={r.dept}>
              <span className="rp-bar-n">{dept(r.dept, lang)}</span>
              <span className="rp-track"><i style={{ width: `${(r.share / maxDept) * 100}%`, background: i < DEPTS_ANIMAL.lead.n ? "var(--animal)" : "#e3c9b6" }} /></span>
              <span className="rp-t">{num(r.t)} t</span>
              <b>{pct(r.share)}</b>
            </div>
          ))}
        </div>
        <Box title={L.depts.boxT} tone="mint" text={put(L.depts.box, {
          n: DEPTS_ANIMAL.lead.n, s: pct(DEPTS_ANIMAL.lead.share, 0), f: DEPTS_ANIMAL.families.n, fs: pct(DEPTS_ANIMAL.families.share, 0),
        })} />
      </Page>

      {/* 7 · own label */}
      <Page n={7} lang={lang} eyebrow={E[6]} title={put(L.brands.title, { s: pct(BRANDS.ownShare, 0) })}
        lead={put(L.brands.lead, { k: BRANDS.nationalCount + 1 })}
        take={put(L.brands.take, { s: pct(BRANDS.ownShare), r: pct(BRANDS.ownRatio) })} foot={L.brands.foot}>
        <div className="rp-grid3 short">
          <Kpi big={pct(BRANDS.ownShare)} text={put(L.brands.c1, { n: num(BRANDS.ownProducts) })} />
          <Kpi big={pct(BRANDS.othersShare)} text={put(L.brands.c2, { k: BRANDS.nationalCount })} />
          <Kpi big={pct(BRANDS.ownRatio)} text={put(L.brands.c3, { b: pct(BRANDS.othersRatio) })} tone="peach" />
        </div>
        <div className="rp-card rp-bars tight">
          <span className="rp-card-t">{L.brands.barsT}</span>
          {BRANDS.rows.map((r) => (
            <div className="rp-bar-row" key={r.brand}>
              <span className="rp-bar-n">{r.brand}{r.own && <em>{L.brands.own}</em>}</span>
              <span className="rp-track"><i style={{ width: `${Math.max(r.ratio, 0.004) * 100}%`, background: r.ratio >= 0.3 ? "var(--plant)" : "var(--animal)" }} /></span>
              <b>{pct(r.ratio)} {L.brands.plant}</b>
              <span className="rp-t">{num(r.t)} t</span>
            </div>
          ))}
        </div>
      </Page>

      {/* 8 · composites */}
      <Page n={8} lang={lang} eyebrow={E[7]} title={put(L.comp.title, { s: pct(COMPOSITES.share) })} lead={L.comp.lead}
        take={L.comp.take} foot={put(L.comp.foot, { m: pct(COMPOSITES.massShare) })}>
        <div className="rp-grid3 short">
          <Kpi big={`${num(COMPOSITES.t)} t`} text={L.comp.c1} />
          <Kpi big={pct(COMPOSITES.convention, 0)} text={L.comp.c2} tone="peach" />
          <Kpi big={pct(COMPOSITES.mix[0].share, 0)} text={put(L.comp.c3, { f: pct(COMPOSITES.mix.find((m) => m.cat === "seafood_based")!.share) })} />
        </div>
        <div className="rp-card rp-mix">
          <span className="rp-card-t">{L.comp.mixT}</span>
          <div className="rp-seg">{COMPOSITES.mix.map((m) => <i key={m.cat} style={{ flexBasis: `${m.share * 100}%`, background: MIX_COLOR[m.cat] }} />)}</div>
          <div className="rp-legend">{COMPOSITES.mix.map((m) => <span key={m.cat}><i style={{ background: MIX_COLOR[m.cat] }} />{L.comp.mix[m.cat]} <b>{pct(m.share)}</b></span>)}</div>
        </div>
        <Box title={L.comp.boxT} text={L.comp.box} tone="mint" />
      </Page>

      {/* 9 · what is still missing */}
      <Page n={9} lang={lang} eyebrow={E[8]} title={L.loose.title} lead={L.loose.lead} take={L.loose.take} foot={L.loose.foot}>
        <div className="rp-grid3 short">
          {L.loose.cards.map(([h, d], i) => (
            <div className={`rp-card rp-miss ${i === 0 ? "mint" : ""}`} key={h}>
              <b><span className={i === 0 ? "up" : "dot"} aria-hidden>{i === 0 ? "↑" : "·"}</span>{h}</b>
              <p>{put(d, { n: LOOSE.products, t: num(LOOSE.massT), b: LOOSE.badCodes, w: LOOSE.labelWeights })}</p>
            </div>
          ))}
        </div>
        <div className="rp-scen">
          <b className="rp-scen-t">{L.loose.boxT}</b>
          <div className="rp-grid3 bare">
            {L.loose.cols.map((c, i) => {
              const d = after[i] - ratios[i];
              return (
                <div key={c}>
                  <span className="rp-scen-k">{c}</span>
                  <div className="rp-scen-v"><s>{pct(ratios[i])}</s><span aria-hidden>→</span><b>{pct(after[i])}</b></div>
                  <span className="rp-scen-d">{Math.abs(d) < 0.0005 ? L.loose.same : put(d > 0 ? L.loose.up : L.loose.down, {
                    v: fmtNum(Math.abs(d) * 100, lang, Math.abs(d) < 0.01 ? 1 : 0),
                    u: lang === "fr" && Math.abs(d) < 0.02 ? "point" : "points",
                  })}</span>
                </div>
              );
            })}
          </div>
          <p className="rp-scen-n">{L.loose.note}</p>
        </div>
      </Page>
    </>
  );
}
