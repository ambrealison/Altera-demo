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
  next: "Next page",
  nextStep: "Next step",
  fictitious: "Fictitious data · Harbour Market does not exist",
  cover: {
    eyebrow: "Altera AI · Interactive demo",
    title: "From product file to protein ratio.",
    lead: "How Altera AI measures the plant share of the protein a retailer sells, under the WWF and Protein Tracker methodologies. Fictitious data, real method.",
    start: "Start the demo",
    meta: "About 4 minutes · 10 steps",
  },
  why: {
    eyebrow: "Why now",
    title: "Retailers are starting to publish.",
    lead: "Retailers are starting to measure the plant share of the protein they sell, and more and more of them publish it.",
    points: [
      ["Retailers publish", "{n} European retailers already disclose their protein split."],
      ["Rankings track it", "Questionmark's Superlist Europe 2026 checks whether the largest supermarkets disclose it."],
      ["Targets need a baseline", "A retailer can only commit to a share it has measured."],
    ] as [string, string][],
    mapNote: "Green: retailers that publish their split. Lavender: retailers that measure it or have set a target. Public sources; the full map closes the demo.",
  },
  receive: {
    eyebrow: "What you receive",
    title: "A report you can act on.",
    lead: "Every engagement ends with an insights report, a formula-driven workbook and the line-level file. Here is the report, on Harbour Market's fictitious data.",
    open: "Open page {n}",
    pdf: "Download the sample report",
    xlsx: "Download the sample workbook",
    close: "Close",
    prev: "Previous page",
    nextPage: "Next page",
  },
  methods: {
    eyebrow: "Two methodologies",
    title: "Two methods. Never merged.",
    lead: "Altera AI applies both to every product. They measure different things, so they give different figures, reported side by side.",
    rows: { owner: "Owner", unit: "Measures", groups: "Classification", scope: "Excluded", reports: "Reported" },
    wwf: {
      name: "WWF Planet-Based Diets", owner: "WWF", unit: "Tonnes of product",
      groups: "Food groups FG1 to FG7, whole or composite · composites by category",
      scope: "Appendix A: alcohol, most beverages, condiments, stock…",
      reports: "Plant / animal split of FG1 and FG2 in dairy equivalents · scope statement",
    },
    pt: {
      name: "Protein Tracker", owner: "Green Protein Alliance · ProVeg", unit: "Tonnes of protein",
      groups: "Animal core · Composite · Plant-based core · Plant-based non-core",
      scope: "Non-food only",
      reports: "Plant share of protein, by class · share of data at level A and B",
    },
    go: "See Altera AI at work",
  },
  end: {
    eyebrow: "The movement is accelerating",
    title: "Europe's retailers are measuring.",
    lead: "Across Europe, retailers measure the plant share of the protein they sell, and more and more of them publish it.",
    kpis: { publishes: "retailers publish their split", measures: "more measure it or have set a target", countries: "countries" },
    qm: "In Questionmark's Superlist Europe 2026, 12 of the 27 largest European supermarkets disclose their protein split.",
    legend: { publishes: "Publishes its split", measures: "Measures it or has set a target", none: "No public data found" },
    hint: "Hover over a country",
    hintTouch: "Tap a country",
    target: "Target",
    comparability: "Figures are each retailer's own, with its own method and scope: Protein Tracker counts protein, WWF counts product. They are not comparable with each other.",
    sources: "Sources",
    collected: "Public sources, collected October 2026.",
    ctaTitle: "Measure your own catalogue.",
    ctaLead: "All we need is one export of your catalogue: labels, barcodes and volumes sold, or at least your sales ranks. Altera AI does the rest, under NDA, and delivers a ratio you can publish.",
    restart: "Restart the demo",
    sample: "Download the sample workbook",
    report: "Download the sample report",
    disclaimer: "Harbour Market, its brands and its figures are invented. On a real engagement, accuracy depends on the data supplied and is measured each time.",
  },
};
type Dict = typeof en;

const fr: Dict = {
  demo: "Démo interactive",
  cta: "Planifier un échange",
  back: "Retour",
  next: "Page suivante",
  nextStep: "Étape suivante",
  fictitious: "Données fictives · Harbour Market n'existe pas",
  cover: {
    eyebrow: "Altera AI · Démo interactive",
    title: "Du fichier produits au ratio protéique.",
    lead: "Comment Altera AI mesure la part végétale des protéines vendues par un distributeur, selon les méthodologies WWF et Protein Tracker. Données fictives, méthode réelle.",
    start: "Commencer la démo",
    meta: "Environ 4 minutes · 10 étapes",
  },
  why: {
    eyebrow: "Pourquoi maintenant",
    title: "Les distributeurs commencent à publier.",
    lead: "Les distributeurs commencent à mesurer la part végétale des protéines qu'ils vendent, et ils sont de plus en plus nombreux à la publier.",
    points: [
      ["Les distributeurs publient", "{n} distributeurs européens publient déjà leur ratio protéique."],
      ["Les classements le suivent", "Le Superlist Europe 2026 de Questionmark vérifie si les plus grands supermarchés le publient."],
      ["Un objectif demande une base", "Un distributeur ne s'engage que sur une part qu'il a mesurée."],
    ] as [string, string][],
    mapNote: "En vert, les enseignes qui publient leur ratio ; en lavande, celles qui le mesurent ou se sont fixé un objectif. Sources publiques ; la carte complète clôt la démo.",
  },
  receive: {
    eyebrow: "Ce que vous recevez",
    title: "Un rapport pour agir.",
    lead: "Chaque mission se conclut par un rapport d'analyse, un classeur tout en formules et le fichier ligne à ligne. Voici le rapport, sur les données fictives de Harbour Market.",
    open: "Ouvrir la page {n}",
    pdf: "Télécharger le rapport d'exemple",
    xlsx: "Télécharger le classeur d'exemple",
    close: "Fermer",
    prev: "Page précédente",
    nextPage: "Page suivante",
  },
  methods: {
    eyebrow: "Deux méthodologies",
    title: "Deux méthodes. Jamais mélangées.",
    lead: "Altera AI applique les deux à chaque produit. Elles ne mesurent pas la même chose, donc elles donnent des chiffres différents, présentés côte à côte.",
    rows: { owner: "Porteur", unit: "Mesure", groups: "Classification", scope: "Exclusions", reports: "Restitution" },
    wwf: {
      name: "WWF Planet-Based Diets", owner: "WWF", unit: "Tonnes de produit",
      groups: "Groupes FG1 à FG7, entier ou composite · composites par catégorie",
      scope: "Appendix A : alcool, la plupart des boissons, condiments, bouillons…",
      reports: "Partage végétal / animal de FG1 et FG2 en équivalents lait · déclaration de périmètre",
    },
    pt: {
      name: "Protein Tracker", owner: "Green Protein Alliance · ProVeg", unit: "Tonnes de protéines",
      groups: "Animal core · Composite · Plant-based core · Plant-based non-core",
      scope: "Le non-alimentaire seulement",
      reports: "Part végétale des protéines, par classe · part des données en niveau A et B",
    },
    go: "Voir Altera AI à l'œuvre",
  },
  end: {
    eyebrow: "Le mouvement s'accélère",
    title: "Les distributeurs européens mesurent.",
    lead: "Partout en Europe, des distributeurs mesurent la part végétale des protéines qu'ils vendent, et ils sont de plus en plus nombreux à la publier.",
    kpis: { publishes: "enseignes publient leur ratio", measures: "autres le mesurent ou se sont fixé un objectif", countries: "pays" },
    qm: "Dans le Superlist Europe 2026 de Questionmark, 12 des 27 plus grands supermarchés européens publient leur ratio protéique.",
    legend: { publishes: "Publie son ratio", measures: "Le mesure ou s'est fixé un objectif", none: "Aucune donnée publique trouvée" },
    hint: "Survolez un pays",
    hintTouch: "Touchez un pays",
    target: "Objectif",
    comparability: "Chaque chiffre est celui publié par l'enseigne, avec sa méthode et son périmètre : le Protein Tracker compte des protéines, WWF des produits. Ils ne se comparent pas entre eux.",
    sources: "Sources",
    collected: "Sources publiques, relevées en octobre 2026.",
    ctaTitle: "Mesurez votre propre catalogue.",
    ctaLead: "Il nous suffit d'un export de votre catalogue : libellés, codes-barres et volumes vendus, ou à défaut vos rangs de vente. Altera AI fait le reste, sous NDA, et livre un ratio que vous pouvez publier.",
    restart: "Revoir la démo",
    sample: "Télécharger le classeur d'exemple",
    report: "Télécharger le rapport d'exemple",
    disclaimer: "Harbour Market, ses marques et ses chiffres sont inventés. Sur une vraie mission, l'exactitude dépend des données fournies et se mesure à chaque fois.",
  },
};

export const STRINGS: Record<Lang, Dict> = { en, fr };


// ------------------------------------------------------------ the ten steps of the method, from your file to the two ratios
// They follow "The Altera protein ratio method": receive, scope, classify, protein content,
// split, volumes, calculate (WWF first, then Protein Tracker), check and measure, deliver.
export const STEPS: Record<Lang, string[]> = {
  en: ["Data received", "Scope", "Classification", "Protein content", "Plant / animal split", "Volumes", "WWF ratio", "Protein Tracker ratio", "Checks and accuracy", "Delivery"],
  fr: ["Réception des données", "Périmètre", "Classification", "Teneur en protéines", "Partage végétal / animal", "Volumes", "Ratio WWF", "Ratio Protein Tracker", "Contrôles et exactitude", "Livraison"],
};

// ------------------------------------------------------------ the explanation of each step: a title, then one paragraph per numbered part of the screen
export interface Tip { t: string; p: [string, string] }

export const TIPS: Record<Lang, Record<string, Tip>> = {
  en: {
    data: { t: "We receive your files", p: [
      "Your catalogue and your sales are archived exactly as received. Altera works on a copy, never on your originals.",
      "Every column is inventoried: how often the net weight, the ingredients, the declared protein and the volumes are filled in, and how many of your products Altera already knows.",
    ] },
    scope: { t: "We keep what counts", p: [
      "Only food sold over the year counts. Test items, customer orders and non-food leave the scope. For WWF, Appendix A also sets aside alcohol, most drinks, condiments and stock.",
      "Barcodes are checked before any match, and every net weight is qualified: read from the label when it is missing, never taken from a default value.",
    ] },
    classify: { t: "Each product is classified twice", p: [
      "Once for WWF: a food group from FG1 to FG7 with a plant or animal origin, or a composite category. Once for the Protein Tracker: one of four classes. The two are never merged.",
      "Products Altera already knows keep their classification, by barcode. Others take that of their segment when all its known products agree. The language model classifies the rest, one product at a time.",
    ] },
    protein: { t: "Each product gets its protein per 100 g", p: [
      "Your declared value comes first, once checked. Missing values come, in this order, from the Altera reference base, Open Food Facts, a name match in Open Food Facts, NEVO and the national table (CIQUAL in France), then the median of the segment.",
      "Every value must add up with the energy on the label. A per-pack figure entered as per 100 g is caught and replaced, and the replacement keeps its source.",
    ] },
    split: { t: "Each product's protein is split, plant and animal", p: [
      "Origin is not the split. These crisps count as animal origin for WWF because of the milk, yet almost all their protein comes from potato.",
      "The split is read from the ingredient list, then from the NEVO and CIQUAL food tables. Only a composite that cannot be measured falls back to 50/50. Measured rows are level A, the convention is level B.",
    ] },
    volumes: { t: "Your sales give each product its weight", p: [
      "With your volumes: kilos sold = units sold × net weight, once the units are checked (consumer units, not cases), as well as duplicates and negative volumes.",
      "With sales ranks only, Altera estimates volumes with a rank-to-kilos curve per department, accepted only if the plant share stays within one point of real volumes. Your real volumes can replace them at any time.",
    ] },
    wwf: { t: "The WWF ratio, in tonnes of product", p: [
      "Whole products are added up in tonnes, by food group and origin. Dairy counts in dairy equivalents, cheese at a factor of 10. The plant share of FG1 (protein-rich foods) and FG2 (dairy) is the split WWF asks for.",
      "Products that mix animal and plant ingredients are reported apart, by category: meat-based, seafood-based, vegetarian, vegan.",
    ] },
    pt: { t: "The Protein Tracker ratio, in tonnes of protein", p: [
      "Row by row, kilos sold × protein per 100 g gives the protein sold, split plant and animal. The ratio is plant protein ÷ total protein, across all food.",
      "It breaks down by the four classes, with the share of data at level A and B. It is reported next to WWF, never merged with it: the two do not measure the same thing.",
    ] },
    quality: { t: "Checked, then measured by people", p: [
      "Automated checks: every total equals the sum of its block, plant + animal = total on every row, the methodology rules hold, and every formula of the workbook is recomputed.",
      "Then a sealed sample is reviewed by hand: 500 rows at random, the 500 products weighing most in tonnes of protein, and the 3 best sellers of every category. One accuracy rate per field.",
    ] },
    deliver: { t: "What you receive, and what Altera keeps", p: [
      "A workbook whose only input is your volumes, the line-level file with the source of every value, the scope statement WWF requires, and the insights report.",
      "Product knowledge (classes, contents, splits) enriches the Altera reference base by barcode, without your name. Your volumes, ranks and hierarchy never do, and nothing from one retailer is shown to another.",
    ] },
  },
  fr: {
    data: { t: "Nous recevons vos fichiers", p: [
      "Votre catalogue et vos ventes sont archivés tels que reçus. Altera travaille sur une copie, jamais sur vos originaux.",
      "Chaque colonne est inventoriée : à quel point le poids net, les ingrédients, les protéines déclarées et les volumes sont remplis, et combien de vos produits Altera connaît déjà.",
    ] },
    scope: { t: "Nous gardons ce qui compte", p: [
      "Seuls les produits alimentaires vendus sur l'année comptent. Les articles de test, les commandes clients et le non-alimentaire sortent du périmètre. Pour WWF, l'Appendix A écarte aussi l'alcool, la plupart des boissons, les condiments et les bouillons.",
      "Les codes-barres sont vérifiés avant tout rapprochement, et chaque poids net est qualifié : lu sur l'étiquette s'il manque, jamais repris d'une valeur par défaut.",
    ] },
    classify: { t: "Chaque produit est classé deux fois", p: [
      "Une fois pour WWF : un groupe d'aliments de FG1 à FG7 avec une origine végétale ou animale, ou une catégorie de composite. Une fois pour le Protein Tracker : une classe parmi quatre. Les deux ne sont jamais fusionnées.",
      "Les produits déjà connus d'Altera gardent leur classification, par code-barres. Les autres prennent celle de leur segment quand tous ses produits connus s'accordent. Le modèle de langage classe le reste, un produit à la fois.",
    ] },
    protein: { t: "Chaque produit reçoit sa teneur pour 100 g", p: [
      "Votre valeur déclarée passe en premier, une fois contrôlée. Les valeurs manquantes viennent, dans cet ordre, de la base de référence Altera, d'Open Food Facts, d'un rapprochement par le nom dans Open Food Facts, NEVO et la table nationale (CIQUAL en France), puis de la médiane du segment.",
      "Chaque valeur doit concorder avec l'énergie de l'étiquette. Un chiffre par paquet saisi pour 100 g est repéré et remplacé, et la valeur retenue garde sa source.",
    ] },
    split: { t: "Les protéines de chaque produit sont partagées, végétal et animal", p: [
      "L'origine n'est pas le partage. Ces chips comptent d'origine animale pour WWF à cause du lait, alors que presque toutes leurs protéines viennent de la pomme de terre.",
      "Le partage se lit dans la liste d'ingrédients, puis dans les tables NEVO et CIQUAL. Seul un composite qu'on ne peut pas mesurer passe à 50/50. Les lignes mesurées sont de niveau A, la convention est de niveau B.",
    ] },
    volumes: { t: "Vos ventes donnent son poids à chaque produit", p: [
      "Avec vos volumes : kilos vendus = unités vendues × poids net, une fois vérifiées les unités (unités consommateur, pas colis), les doublons et les volumes négatifs.",
      "Avec vos seuls rangs de vente, Altera estime les volumes par une courbe rang-kilos par rayon, retenue seulement si la part végétale reste à moins d'un point de celle des volumes réels. Vos volumes réels peuvent les remplacer à tout moment.",
    ] },
    wwf: { t: "Le ratio WWF, en tonnes de produit", p: [
      "Les produits entiers s'additionnent en tonnes, par groupe d'aliments et par origine. Les laitiers comptent en équivalents lait, le fromage au facteur 10. La part végétale de FG1 (aliments protéiques) et de FG2 (laitiers) est le partage que demande WWF.",
      "Les produits qui mêlent ingrédients animaux et végétaux sont présentés à part, par catégorie : viande, produits de la mer, végétarien, végétalien.",
    ] },
    pt: { t: "Le ratio Protein Tracker, en tonnes de protéines", p: [
      "Ligne à ligne, kilos vendus × protéines pour 100 g donne les protéines vendues, partagées entre végétal et animal. Le ratio vaut protéines végétales ÷ protéines totales, sur tout l'alimentaire.",
      "Il se décline par les quatre classes, avec la part des données en niveau A et B. Il est présenté à côté de WWF, jamais fusionné avec lui : les deux ne mesurent pas la même chose.",
    ] },
    quality: { t: "Contrôlé, puis mesuré par des personnes", p: [
      "Contrôles automatiques : chaque total égale la somme de son bloc, végétal + animal = total sur chaque ligne, les règles de méthode sont respectées, et chaque formule du classeur est recalculée.",
      "Puis un échantillon scellé est relu à la main : 500 lignes au hasard, les 500 produits qui pèsent le plus en tonnes de protéines, et les 3 meilleures ventes de chaque catégorie. Un taux d'exactitude par champ.",
    ] },
    deliver: { t: "Ce que vous recevez, et ce qu'Altera garde", p: [
      "Un classeur dont la seule saisie est vos volumes, le fichier ligne à ligne avec la source de chaque valeur, la déclaration de périmètre exigée par WWF, et le rapport d'analyse.",
      "La connaissance produit (classes, teneurs, partages) enrichit la base de référence Altera par code-barres, sans votre nom. Vos volumes, rangs et nomenclature jamais, et rien d'un distributeur n'est montré à un autre.",
    ] },
  },
};

// ------------------------------------------------------------ glossary: terms explained on hover, wherever they appear
export const GLOSSARY: Record<Lang, [string, string][]> = {
  en: [
    ["Appendix A", "WWF's list of exclusions: alcohol, most beverages, coffee and tea, condiments, herbs and spices, stock."],
    ["dairy equivalents", "WWF converts dairy into the milk it takes to make it. Cheese counts ×10."],
    ["FG1", "WWF food group 1: protein-rich foods, such as meat, fish, eggs, pulses, nuts and their alternatives."],
    ["FG2", "WWF food group 2: dairy and plant-based alternatives."],
    ["FG7", "WWF food group 7: foods high in fat, salt or sugar."],
    ["Composite", "For the Protein Tracker, a product whose protein is partly plant, partly animal. WWF uses the word for mixed dishes."],
    ["50/50 convention", "Half plant, half animal: a convention for composites that cannot be measured. Level B."],
    ["level A", "A plant / animal split measured from the ingredients or a food composition table."],
    ["level B", "A split that follows a convention, such as the product's class, when nothing can be measured."],
    ["NEVO", "The Dutch food composition table, published by RIVM."],
    ["CIQUAL", "The French food composition table, published by ANSES."],
    ["Open Food Facts", "An open database of food labels, searchable by barcode."],
  ],
  fr: [
    ["Appendix A", "La liste d'exclusions de WWF : alcool, la plupart des boissons, café et thé, condiments, herbes et épices, bouillons."],
    ["équivalents lait", "WWF convertit les laitiers en lait nécessaire à leur fabrication. Le fromage compte ×10."],
    ["FG1", "Groupe 1 de WWF : aliments riches en protéines, comme la viande, le poisson, les œufs, les légumineuses, les fruits à coque et leurs alternatives."],
    ["FG2", "Groupe 2 de WWF : produits laitiers et alternatives végétales."],
    ["FG7", "Groupe 7 de WWF : produits riches en gras, sel ou sucre."],
    ["Composite", "Pour le Protein Tracker, un produit dont les protéines sont en partie végétales, en partie animales. WWF emploie le mot pour les plats mixtes."],
    ["convention 50/50", "Moitié végétal, moitié animal : une convention pour les composites qu'on ne peut pas mesurer. Niveau B."],
    ["niveau A", "Un partage végétal / animal mesuré à partir des ingrédients ou d'une table de composition."],
    ["niveau B", "Un partage qui suit une convention, comme la classe du produit, faute de pouvoir mesurer."],
    ["NEVO", "La table de composition des aliments néerlandaise, publiée par le RIVM."],
    ["CIQUAL", "La table de composition des aliments française, publiée par l'Anses."],
    ["Open Food Facts", "Une base ouverte d'étiquettes alimentaires, consultable par code-barres."],
  ],
};


// ------------------------------------------------------------ in-app labels
const uiEn = {
  project: "Harbour Market · Catalogue FY2026",
  workflow: "Steps",
  stepN: "Step {n}",
  stepOf: "Step {n} of {t}",
  demoBadge: "Demo · fictitious data",
  classes: { animal_core: "Animal core", composite: "Composite", plant_non_core: "Plant-based non-core", plant_core: "Plant-based core" },
  protSrc: { declared: "Declared by you, checked", reference_base: "Altera reference base", off_ean: "Open Food Facts, by barcode", name_match: "Name match · Open Food Facts, NEVO, CIQUAL", stratum_median: "Median of the segment" },
  fg: { FG1: "Protein-rich foods", FG2: "Dairy & alternatives", FG3: "Fats & oils", FG4: "Fruit & vegetables", FG5: "Grains", FG6: "Tubers", FG7: "Foods high in fat, salt, sugar" },
  plant: "Plant", animal: "Animal",
  // 1 · receive
  files: "Files received",
  catalogueFile: "Catalogue · products and their attributes",
  salesFile: "Sales · volumes over 12 months",
  archived: "Archived as received · read-only",
  inventory: "Inventory · how complete each column is",
  fillCols: { code: "Barcode", label: "Till label", weight: "Net weight", ingredients: "Ingredient list", protein: "Declared protein", volumes: "Volumes sold" },
  known: "Already in the Altera reference base",
  // 2 · scope
  whatCounts: "What counts",
  received: "Received", nonFood: "Non-food", tests: "Test items, customer orders", unsold: "Not sold over the year",
  ptScope: "Protein Tracker scope", wwfScope: "WWF scope", appendixA: "Appendix A exclusions",
  excl: { alcohol: "Alcohol", beverage: "Soft drinks, juice, water", coffee_tea: "Coffee and tea", condiment: "Condiments", herbs_spices: "Herbs and spices", stock: "Stock" },
  codesWeights: "Barcodes and net weights",
  codes: "Codes",
  validEan: "EAN · valid check digit", internalCode: "Internal code · your stores only",
  weights: "Net weights",
  fromLabel: "{w} · read from the label", defaultWeight: "1.0 in the file · a default, replaced by {w}", byWeight: "sold by weight · volumes in kilos",
  // 3 · classify
  twoClasses: "Two classifications per product",
  product: "Product",
  composite: "Composite",
  cat: { meat_based: "meat-based", seafood_based: "seafood-based", vegetarian: "vegetarian", vegan: "vegan" } as Record<string, string>,
  origin: { plant: "plant", animal: "animal" } as Record<string, string>,
  sourcesTitle: "Where each classification comes from",
  sources: { inherited: ["Altera reference base", "Already classified, found by barcode"], stratum: ["Unanimous segment", "All known products of the segment agree"], model: ["Language model", "One product at a time, every field validated"] },
  // 4 · protein
  cascade: "Source of the protein value, in order",
  keepsSource: "Each value carries its source in the deliverable.",
  plausibility: "A value that does not add up",
  declaredLine: "Declared: {v} g of protein per 100 g",
  energyLine: "Energy: {a} kcal computed, {b} kcal on the label",
  keptLine: "Kept: {v} g, from {s}",
  // 5 · split
  ingredients: "Ingredients", wwfOrigin: "WWF origin", originVal: "Animal · contains milk",
  splitTitle: "Protein split", method: "Method", methodVal: "NEVO food table · level A",
  howSplit: "How the split is measured",
  splitSteps: [["Ingredient list", "read ingredient by ingredient"], ["NEVO food table", "plant and animal protein of each food"], ["CIQUAL group", "of the matched food"], ["50/50 convention", "only for composites that cannot be measured"]] as [string, string][],
  levelsBar: "Share of protein sold, by data level",
  levelA: "Level A · measured", levelB: "Level B · convention",
  // 6 · volumes
  withVolumes: "With your volumes",
  formulaKg: ["units sold", "net weight", "kilos sold"],
  volChecks: ["Consumer units, not cases", "No duplicates", "No negative volumes"],
  withRanks: "With sales ranks only",
  axisRank: "sales rank", axisKg: "kilos sold",
  curveNote: "One rank-to-kilos curve per department",
  accept: "Accepted only if the plant share stays within 1 point of real volumes",
  // 7 · WWF
  byGroup: "Tonnes of product, by food group",
  dairyNote: "Dairy in dairy equivalents · cheese ×10",
  required: "The split WWF asks for: FG1 and FG2",
  composites: "Composites, by category",
  catTitle: { meat_based: "Meat-based", seafood_based: "Seafood-based", vegetarian: "Vegetarian", vegan: "Vegan" } as Record<string, string>,
  // 8 · Protein Tracker
  rowByRow: "Protein sold, row by row",
  formulaProt: ["kilos sold", "protein per 100 g", "protein sold"],
  ratioLine: "Plant protein ÷ total protein",
  ptKpi: "Plant share of all protein sold",
  byClass: "By class, and by data level",
  // 9 · quality
  checksTitle: "Automated checks",
  checkGroups: [
    ["Identities", ["Plant + animal = total, row by row", "Each total equals the sum of its block", "Every table covers every value of its column"]],
    ["Methodology", ["No food group on a WWF composite", "Sub-groups only in FG1, FG2, FG3, FG5", "×10 dairy factor on cheese only"]],
    ["Data", ["Energy balance of declared values", "Every value has a source"]],
    ["Workbook", ["Every formula recomputed outside Excel", "Every tab evaluated in a spreadsheet"]],
  ] as [string, string[]][],
  sample: "Control sample, reviewed by hand", sealed: "Sealed before review",
  sampleGroups: [["500", "rows drawn at random"], ["500", "largest products in tonnes of protein"], ["3", "best sellers of every category"]] as [string, string][],
  fields: ["Whole or composite", "Food group", "Sub-group", "Protein Tracker class"], perEngagement: "one accuracy rate per field",
  // 10 · deliver
  youReceive: "What you receive",
  files4: [
    ["Workbook", "XLSX", "Formula-driven · one input: your volumes"],
    ["Line-level file", "CSV", "Classes, contents, split, data level, source of every value"],
    ["Scope statement", "DOC", "Required by WWF · Appendix A, tab 6"],
    ["Insights report", "PDF", "Where the ratio comes from, what would move it"],
  ] as [string, string, string][],
  whoKeeps: "Who keeps what",
  staysYours: "Stays yours", staysList: ["Sales volumes", "Sales ranks", "Your department hierarchy", "Your name"],
  alteraKeeps: "Enriches the Altera reference base", keepsList: ["Classifications", "Protein contents", "Plant / animal splits"],
  keepsNote: "By barcode, without your name.",
  noCrossing: "Nothing from one retailer is ever shown to another.",
};
type UI = typeof uiEn;

const uiFr: UI = {
  project: "Harbour Market · Catalogue 2026",
  workflow: "Étapes",
  stepN: "Étape {n}",
  stepOf: "Étape {n} sur {t}",
  demoBadge: "Démo · données fictives",
  classes: { animal_core: "Animal core", composite: "Composite", plant_non_core: "Plant-based non-core", plant_core: "Plant-based core" },
  protSrc: { declared: "Déclarée par vous, contrôlée", reference_base: "Base de référence Altera", off_ean: "Open Food Facts, par code-barres", name_match: "Par le nom · Open Food Facts, NEVO, CIQUAL", stratum_median: "Médiane du segment" },
  fg: { FG1: "Aliments protéiques", FG2: "Laitiers et alternatives", FG3: "Matières grasses", FG4: "Fruits et légumes", FG5: "Céréales", FG6: "Tubercules", FG7: "Produits gras, salés, sucrés" },
  plant: "Végétal", animal: "Animal",
  files: "Fichiers reçus",
  catalogueFile: "Catalogue · les produits et leurs attributs",
  salesFile: "Ventes · volumes sur 12 mois",
  archived: "Archivés tels que reçus · lecture seule",
  inventory: "Inventaire · remplissage de chaque colonne",
  fillCols: { code: "Code-barres", label: "Libellé caisse", weight: "Poids net", ingredients: "Liste d'ingrédients", protein: "Protéines déclarées", volumes: "Volumes vendus" },
  known: "Déjà dans la base de référence Altera",
  whatCounts: "Ce qui compte",
  received: "Reçus", nonFood: "Non-alimentaire", tests: "Articles de test, commandes clients", unsold: "Non vendus sur l'année",
  ptScope: "Périmètre Protein Tracker", wwfScope: "Périmètre WWF", appendixA: "Exclusions Appendix A",
  excl: { alcohol: "Alcool", beverage: "Sodas, jus, eaux", coffee_tea: "Café et thé", condiment: "Condiments", herbs_spices: "Herbes et épices", stock: "Bouillons" },
  codesWeights: "Codes-barres et poids nets",
  codes: "Codes",
  validEan: "EAN · clé de contrôle valide", internalCode: "Code interne · vos magasins seulement",
  weights: "Poids nets",
  fromLabel: "{w} · lu sur l'étiquette", defaultWeight: "1,0 dans le fichier : valeur par défaut, remplacée par {w}", byWeight: "vendu au poids · volumes en kilos",
  twoClasses: "Deux classifications par produit",
  product: "Produit",
  composite: "Composite",
  cat: { meat_based: "viande", seafood_based: "produits de la mer", vegetarian: "végétarien", vegan: "végétalien" },
  origin: { plant: "végétal", animal: "animal" },
  sourcesTitle: "D'où vient chaque classification",
  sources: { inherited: ["Base de référence Altera", "Déjà classé, retrouvé par code-barres"], stratum: ["Segment unanime", "Tous les produits connus du segment s'accordent"], model: ["Modèle de langage", "Un produit à la fois, chaque champ validé"] },
  cascade: "Source de la teneur en protéines, dans l'ordre",
  keepsSource: "Chaque valeur porte sa source dans le livrable.",
  plausibility: "Une valeur qui ne tombe pas juste",
  declaredLine: "Déclaré : {v} g de protéines pour 100 g",
  energyLine: "Énergie : {a} kcal calculées, {b} kcal sur l'étiquette",
  keptLine: "Retenu : {v} g, issus de : {s}",
  ingredients: "Ingrédients", wwfOrigin: "Origine WWF", originVal: "Animale · contient du lait",
  splitTitle: "Partage des protéines", method: "Méthode", methodVal: "Table de composition NEVO · niveau A",
  howSplit: "Comment le partage est mesuré",
  splitSteps: [["Liste d'ingrédients", "lue ingrédient par ingrédient"], ["Table NEVO", "protéines végétales et animales de chaque aliment"], ["Groupe CIQUAL", "de l'aliment rapproché"], ["Convention 50/50", "seulement pour les composites qu'on ne peut pas mesurer"]],
  levelsBar: "Part des protéines vendues, par niveau de donnée",
  levelA: "Niveau A · mesuré", levelB: "Niveau B · convention",
  withVolumes: "Avec vos volumes",
  formulaKg: ["unités vendues", "poids net", "kilos vendus"],
  volChecks: ["Unités consommateur, pas des colis", "Pas de doublons", "Pas de volumes négatifs"],
  withRanks: "Avec vos seuls rangs de vente",
  axisRank: "rang de vente", axisKg: "kilos vendus",
  curveNote: "Une courbe rang-kilos par rayon",
  accept: "Retenue seulement si la part végétale reste à moins d'un point des volumes réels",
  byGroup: "Tonnes de produit, par groupe d'aliments",
  dairyNote: "Laitiers en équivalents lait · fromage ×10",
  required: "Le partage demandé par WWF : FG1 et FG2",
  composites: "Composites, par catégorie",
  catTitle: { meat_based: "Viande", seafood_based: "Produits de la mer", vegetarian: "Végétarien", vegan: "Végétalien" },
  rowByRow: "Protéines vendues, ligne à ligne",
  formulaProt: ["kilos vendus", "protéines pour 100 g", "protéines vendues"],
  ratioLine: "Protéines végétales ÷ protéines totales",
  ptKpi: "Part végétale de toutes les protéines vendues",
  byClass: "Par classe, et par niveau de donnée",
  checksTitle: "Contrôles automatiques",
  checkGroups: [
    ["Identités", ["Végétal + animal = total, ligne à ligne", "Chaque total égale la somme de son bloc", "Chaque tableau couvre toutes les valeurs de sa colonne"]],
    ["Méthodologie", ["Pas de groupe sur un composite WWF", "Sous-groupes seulement en FG1, FG2, FG3, FG5", "Facteur laitier ×10 sur le fromage seulement"]],
    ["Données", ["Bilan énergétique des valeurs déclarées", "Chaque valeur a une source"]],
    ["Classeur", ["Chaque formule recalculée hors d'Excel", "Chaque onglet évalué dans un tableur"]],
  ],
  sample: "Échantillon de contrôle, relu à la main", sealed: "Scellé avant relecture",
  sampleGroups: [["500", "lignes tirées au hasard"], ["500", "plus gros produits en tonnes de protéines"], ["3", "meilleures ventes de chaque catégorie"]],
  fields: ["Entier ou composite", "Groupe d'aliments", "Sous-groupe", "Classe Protein Tracker"], perEngagement: "un taux d'exactitude par champ",
  youReceive: "Ce que vous recevez",
  files4: [
    ["Classeur", "XLSX", "Tout en formules · une seule saisie : vos volumes"],
    ["Fichier ligne à ligne", "CSV", "Classes, teneurs, partage, niveau de donnée, source de chaque valeur"],
    ["Déclaration de périmètre", "DOC", "Exigée par WWF · Appendix A, onglet 6"],
    ["Rapport d'analyse", "PDF", "D'où vient le ratio, ce qui le ferait bouger"],
  ],
  whoKeeps: "Qui garde quoi",
  staysYours: "Reste à vous", staysList: ["Volumes de vente", "Rangs de vente", "Votre nomenclature de rayons", "Votre nom"],
  alteraKeeps: "Enrichit la base de référence Altera", keepsList: ["Classifications", "Teneurs en protéines", "Partages végétal / animal"],
  keepsNote: "Par code-barres, sans votre nom.",
  noCrossing: "Rien d'un distributeur n'est jamais montré à un autre.",
};

export const UI_STR: Record<Lang, UI> = { en: uiEn, fr: uiFr };

export const DEPT_FR: Record<string, string> = {
  "Fresh Meat & Poultry": "Boucherie et volaille", Deli: "Charcuterie-traiteur", "Fish & Seafood": "Poissonnerie",
  "Dairy & Eggs": "Crèmerie et œufs", Cheese: "Fromages", "Plant-Based": "Végétal", "Fruit & Vegetables": "Fruits et légumes",
  Bakery: "Boulangerie", Grocery: "Épicerie", "Breakfast & Snacks": "Petit-déjeuner et snacks", Frozen: "Surgelés",
  "Ready Meals": "Plats préparés", "Soft Drinks & Water": "Boissons et eaux", "Beer, Wine & Spirits": "Bières, vins et spiritueux", Household: "Droguerie",
};
export const dept = (name: string, lang: Lang) => (lang === "fr" ? DEPT_FR[name] ?? name : name);
