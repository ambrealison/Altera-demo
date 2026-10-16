import type { Lang } from "./types";

/** Fill {placeholders}. */
export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

// ------------------------------------------------------------ page chrome and slides
const en = {
  demo: "Interactive demo",
  cta: "Plan a meeting",
  back: "Back",
  next: "Next",
  finish: "Finish",
  fictitious: "Fictitious data · Harbour Market does not exist",
  cover: {
    eyebrow: "Altera AI · Interactive demo",
    title: "From product file to protein ratio.",
    lead: "See how Altera AI turns a retailer's catalogue into a protein ratio. Fictitious data, real method.",
    start: "Start the demo",
    meta: "About 2 minutes · 5 chapters",
  },
  intro: {
    eyebrow: "The protein ratio",
    title: "What share of your protein is plant-based?",
    lead: "Add up the protein in everything you sell over a year. The protein ratio is the plant share.",
    kg: "kg of protein sold",
    plant: "plant",
    methods: "Two recognised methodologies, calculated separately",
    why: ["Set a target", "Report on it", "Know where to act"],
    go: "See Altera AI at work",
    items: [
      { e: "🥩", n: "Beef mince", k: 120, p: 0 },
      { e: "🥛", n: "Milk", k: 110, p: 0 },
      { e: "🧀", n: "Cheddar", k: 60, p: 0 },
      { e: "🍞", n: "Bread", k: 45, p: 45 },
      { e: "🫘", n: "Lentils", k: 30, p: 30 },
      { e: "🍕", n: "Pizza", k: 20, p: 10 },
    ],
  },
  end: {
    eyebrow: "Your turn",
    title: "Measure your own catalogue.",
    lead: "Altera AI applies this method to your real data, under NDA, with a person reviewing every uncertain case.",
    restart: "Restart the demo",
    sample: "Download the sample Excel",
    disclaimer: "Harbour Market, its brands and its figures are invented. On a real engagement, accuracy depends on the data supplied and is measured each time.",
    built: "Built with Claude",
  },
};
type Dict = typeof en;

const fr: Dict = {
  demo: "Démo interactive",
  cta: "Planifier un échange",
  back: "Retour",
  next: "Suivant",
  finish: "Terminer",
  fictitious: "Données fictives · Harbour Market n'existe pas",
  cover: {
    eyebrow: "Altera AI · Démo interactive",
    title: "Du fichier produits au ratio protéique.",
    lead: "Découvrez comment Altera AI transforme le catalogue d'un distributeur en ratio protéique. Données fictives, méthode réelle.",
    start: "Commencer la démo",
    meta: "Environ 2 minutes · 5 chapitres",
  },
  intro: {
    eyebrow: "Le ratio protéique",
    title: "Quelle part de vos protéines est végétale ?",
    lead: "Additionnez les protéines de tout ce que vous vendez sur un an. Le ratio protéique, c'est la part végétale.",
    kg: "kg de protéines vendues",
    plant: "végétal",
    methods: "Deux méthodologies reconnues, calculées séparément",
    why: ["Fixer un objectif", "En rendre compte", "Savoir où agir"],
    go: "Voir Altera AI à l'œuvre",
    items: [
      { e: "🥩", n: "Bœuf haché", k: 120, p: 0 },
      { e: "🥛", n: "Lait", k: 110, p: 0 },
      { e: "🧀", n: "Cheddar", k: 60, p: 0 },
      { e: "🍞", n: "Pain", k: 45, p: 45 },
      { e: "🫘", n: "Lentilles", k: 30, p: 30 },
      { e: "🍕", n: "Pizza", k: 20, p: 10 },
    ],
  },
  end: {
    eyebrow: "À vous",
    title: "Mesurez votre propre catalogue.",
    lead: "Altera AI applique cette méthode à vos données réelles, sous NDA, avec une personne qui relit chaque cas incertain.",
    restart: "Revoir la démo",
    sample: "Télécharger l'Excel d'exemple",
    disclaimer: "Harbour Market, ses marques et ses chiffres sont inventés. Sur une vraie mission, l'exactitude dépend des données fournies et se mesure à chaque fois.",
    built: "Conçu avec Claude",
  },
};

export const STRINGS: Record<Lang, Dict> = { en, fr };

// ------------------------------------------------------------ five chapters, in the order of the method
// 1 Import = steps 1–2 · 2 Classify = step 3 · 3 Protein = steps 4–5 · 4 Ratio = steps 6–7 · 5 Deliver = steps 8–11
export const CHAPTERS: Record<Lang, string[]> = {
  en: ["Import", "Classify", "Protein", "Ratio", "Deliver"],
  fr: ["Import", "Classification", "Protéines", "Ratio", "Livraison"],
};

// ------------------------------------------------------------ tooltip copy, one entry per stop
export const TIPS: Record<Lang, Record<string, [string, string]>> = {
  en: {
    import: ["Send your catalogue as is", "No need to clean it first. Missing weights, ingredients or protein values are normal — Altera AI deals with them."],
    scope: ["Only what you sell counts", "Non-food and unsold items are set aside. {measured} food products remain."],
    classify: ["Every product, sorted automatically", "Each product is classified under Protein Tracker and WWF: what is already known first, then AI for the rest."],
    review: ["When the AI hesitates, a person checks", "An uncertain answer is never accepted silently. Here, {rev} products are flagged for review."],
    protein: ["Missing protein, filled in", "When a value is missing or implausible, it is completed from reference sources — and keeps its source."],
    split: ["Plant or animal? Measured.", "These crisps contain milk, yet {pl} of their protein comes from potato. Altera AI measures it, product by product."],
    ratio: ["Your protein ratio", "{ratio} of the protein you sell is plant-based. Each product weighs as much as it sells."],
    aisles: ["See where to act", "Aisle by aisle, you see where your protein comes from — and which aisles move the ratio."],
    excel: ["A file ready to share", "Everything is checked before it leaves. In the Excel file, change the volumes and every figure updates."],
    privacy: ["Your data stays yours", "Sales figures never go to the AI, and nothing is ever shared with another retailer."],
  },
  fr: {
    import: ["Envoyez votre catalogue tel quel", "Inutile de le nettoyer. Poids, ingrédients ou protéines manquants : c'est normal, Altera AI s'en charge."],
    scope: ["Seul ce que vous vendez compte", "Le non-alimentaire et les produits non vendus sont mis de côté. Il reste {measured} produits alimentaires."],
    classify: ["Chaque produit classé automatiquement", "Chaque produit est classé selon Protein Tracker et WWF : d'abord ce qui est déjà connu, puis l'IA pour le reste."],
    review: ["Quand l'IA hésite, une personne vérifie", "Une réponse incertaine n'est jamais acceptée en silence. Ici, {rev} produits sont signalés pour relecture."],
    protein: ["Les protéines manquantes, complétées", "Quand une valeur manque ou paraît fausse, elle est complétée à partir de sources de référence — et garde sa source."],
    split: ["Végétal ou animal ? Mesuré.", "Ces chips contiennent du lait, mais {pl} de leurs protéines viennent de la pomme de terre. Altera AI le mesure, produit par produit."],
    ratio: ["Votre ratio protéique", "{ratio} des protéines que vous vendez sont végétales. Chaque produit pèse selon ses ventes."],
    aisles: ["Voyez où agir", "Rayon par rayon, vous voyez d'où viennent vos protéines — et quels rayons font bouger le ratio."],
    excel: ["Un fichier prêt à partager", "Tout est contrôlé avant de partir. Dans le fichier Excel, changez les volumes : tous les chiffres se mettent à jour."],
    privacy: ["Vos données restent les vôtres", "Les chiffres de vente ne sont jamais envoyés à l'IA, et rien n'est jamais partagé avec un autre distributeur."],
  },
};

// ------------------------------------------------------------ in-app labels
const uiEn = {
  project: "Harbour Market · Catalogue FY2026",
  workflow: "Altera AI",
  stepOf: "Chapter {n} of 5",
  sub: [
    "Your catalogue, exactly as it comes out of your systems.",
    "Every product sorted, under both methodologies.",
    "How much protein, and where it comes from.",
    "One figure, weighted by what you sell.",
    "Checked, then delivered, ready to share.",
  ],
  products: "products",
  completeness: "What the file contains",
  fillCols: { ingredients: "Ingredient lists", protein: "Protein values", weight: "Net weights" },
  kept: "{n} food products sold", setAside: "{n} set aside · non-food, tests, unsold",
  missing: "missing",
  classes: { animal_core: "Animal", composite: "Mixed", plant_non_core: "Plant, other", plant_core: "Plant, protein-rich" },
  classHint: { animal_core: "Meat, fish, dairy, eggs", composite: "Ready meals, pastries, pizza", plant_non_core: "Bread, fruit, vegetables, snacks", plant_core: "Pulses, tofu, nuts, alternatives" },
  toReview: "To review",
  protein: "Protein", per100: "g per 100 g", completed: "Completed", declared: "Declared", from: "Source: {s}",
  sourceOff: "Open Food Facts", sourceDecl: "declared by the retailer",
  contains: "Contains milk", originAnimal: "WWF origin: animal",
  split: "Where the protein comes from", plant: "Plant", animal: "Animal",
  ingredients: "Ingredients",
  ratioHead: "Plant share of the protein you sell", ptTag: "Protein Tracker",
  wwfHead: "Plant share · protein-rich foods & dairy", wwfTag: "WWF",
  byAisle: "By aisle", tonnes: "t of protein",
  file: "Harbour_Market_protein_ratio.xlsx", fileMeta: "Every product, every figure, its source",
  volumes: "Volumes", checked: "Checked before delivery",
  checks: ["Every total reconciled", "Both methodologies' rules applied", "A sample reviewed by a person"],
  privacyTitle: "Your data stays yours",
  privacy: ["Sales volumes never go to the AI", "Never shared with another retailer", "What Altera learns about a product, never who sold it"],
};
type UI = typeof uiEn;

const uiFr: UI = {
  project: "Harbour Market · Catalogue 2026",
  workflow: "Altera AI",
  stepOf: "Chapitre {n} sur 5",
  sub: [
    "Votre catalogue, tel qu'il sort de vos systèmes.",
    "Chaque produit classé, selon les deux méthodologies.",
    "Combien de protéines, et d'où elles viennent.",
    "Un chiffre, pondéré par ce que vous vendez.",
    "Contrôlé, puis livré, prêt à partager.",
  ],
  products: "produits",
  completeness: "Ce que contient le fichier",
  fillCols: { ingredients: "Listes d'ingrédients", protein: "Valeurs de protéines", weight: "Poids nets" },
  kept: "{n} produits alimentaires vendus", setAside: "{n} mis de côté · non-alimentaire, tests, non vendus",
  missing: "manquant",
  classes: { animal_core: "Animal", composite: "Mixte", plant_non_core: "Autre végétal", plant_core: "Végétal riche en protéines" },
  classHint: { animal_core: "Viande, poisson, laitiers, œufs", composite: "Plats préparés, viennoiseries, pizzas", plant_non_core: "Pain, fruits, légumes, snacks", plant_core: "Légumineuses, tofu, fruits à coque, alternatives" },
  toReview: "À relire",
  protein: "Protéines", per100: "g pour 100 g", completed: "Complétée", declared: "Déclarée", from: "Source : {s}",
  sourceOff: "Open Food Facts", sourceDecl: "déclarée par le distributeur",
  contains: "Contient du lait", originAnimal: "Origine WWF : animale",
  split: "D'où viennent les protéines", plant: "Végétal", animal: "Animal",
  ingredients: "Ingrédients",
  ratioHead: "Part végétale des protéines vendues", ptTag: "Protein Tracker",
  wwfHead: "Part végétale · aliments protéiques et laitiers", wwfTag: "WWF",
  byAisle: "Par rayon", tonnes: "t de protéines",
  file: "Harbour_Market_ratio_proteique.xlsx", fileMeta: "Chaque produit, chaque chiffre, sa source",
  volumes: "Volumes", checked: "Contrôlé avant livraison",
  checks: ["Chaque total vérifié", "Les règles des deux méthodologies appliquées", "Un échantillon relu par une personne"],
  privacyTitle: "Vos données restent les vôtres",
  privacy: ["Les volumes de vente ne vont jamais à l'IA", "Jamais partagées avec un autre distributeur", "Altera retient ce qu'est un produit, jamais qui l'a vendu"],
};

export const UI_STR: Record<Lang, UI> = { en: uiEn, fr: uiFr };

export const DEPT_FR: Record<string, string> = {
  "Fresh Meat & Poultry": "Boucherie et volaille", Deli: "Charcuterie-traiteur", "Fish & Seafood": "Poissonnerie",
  "Dairy & Eggs": "Crèmerie et œufs", Cheese: "Fromages", "Plant-Based": "Végétal", "Fruit & Vegetables": "Fruits et légumes",
  Bakery: "Boulangerie", Grocery: "Épicerie", "Breakfast & Snacks": "Petit-déjeuner et snacks", Frozen: "Surgelés",
  "Ready Meals": "Plats préparés", "Soft Drinks & Water": "Boissons et eaux", "Beer, Wine & Spirits": "Bières, vins et spiritueux", Household: "Droguerie",
};
export const dept = (name: string, lang: Lang) => (lang === "fr" ? DEPT_FR[name] ?? name : name);
