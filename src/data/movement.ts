// Retailers that measure or publish their plant / animal protein split, from public sources only.
// Collected 16 October 2026. Figures are each retailer's own, with its own method and scope:
// they are not comparable across methods (Protein Tracker counts protein; WWF counts product).

export type Status = "publishes" | "measures";
type L = { en: string; fr: string };

export interface Retailer {
  name: string;
  status: Status;
  /** Plant share, in %, as published. */
  value?: number;
  /** What the published figure measures. */
  metric?: L;
  year?: string;
  target?: L;
  src: SourceId;
}
export interface Country { id: number; name: L; note?: L; retailers: Retailer[] }

export type SourceId = "pt2025" | "qmEu" | "qmBe" | "rewe" | "lidlAt" | "lidlFr" | "lidlGb" | "ad";
export const SOURCES: Record<SourceId, { label: string; url: string }> = {
  pt2025: {
    label: "Green Protein Alliance & ProVeg Nederland, The Protein Tracker: National Supermarket Protein Split 2025, March 2026",
    url: "https://eiweet.nl/wp-content/uploads/2026/03/2026_March_The-Protein-Tracker-Dutch-national-retail-protein-split-2025-Green-Protein-Alliance-ProVeg-Netherlands-1.pdf",
  },
  qmEu: {
    label: "Questionmark, ProVeg International, WWF Netherlands, Madre Brava, Superlist Environment Europe 2026, January 2026",
    url: "https://www.thequestionmark.org/download/superlist-report-eu-environment-2026-v1.0.en.pdf",
  },
  qmBe: {
    label: "Questionmark, Superlist Environment Belgium 2026, October 2026",
    url: "https://www.thequestionmark.org/download/superlist-report-be-environment-2026-v1.0.en.pdf",
  },
  rewe: {
    label: "REWE Group, Proteinstrategie, Positionspapier, July 2025",
    url: "https://www.rewe-group.com/content/uploads/2025/08/proteinstrategie-positionspapier.pdf",
  },
  lidlAt: {
    label: "Lidl Österreich, press release “Lidl Österreich veröffentlicht erstmals Anteil tierischer Proteinquellen” (web archive, February 2024)",
    url: "https://web.archive.org/web/20240216215232/https://corporate.lidl.at/content/download/83769/file/PA_Protein%20Shift%20bei%20Lidl%20%C3%96sterreich.pdf",
  },
  lidlFr: {
    label: "Lidl, Conscious nutrition strategy: protein sources measured with the WWF methodology across its countries (info.lidl)",
    url: "https://info.lidl/en/our-responsibility/promoting-health/conscious-nutrition-strategy",
  },
  lidlGb: {
    label: "Green Queen, on Lidl GB's “Beyond the basket” report FY2023/24, November 2025",
    url: "https://www.greenqueen.com.hk/lidl-gb-sustainability-report-emissions-healthy-plant-based-food-sales/",
  },
  ad: {
    label: "Ahold Delhaize, protein split target of 50% by 2030 for European food retail brands, 29 January 2025",
    url: "https://newsroom.aholddelhaize.com/ahold-delhaize-announces-protein-split-target-of-50-by-2030-for-european-food-retail-brands/",
  },
};

const PT: L = { en: "plant protein in total sales · Protein Tracker", fr: "protéines végétales dans les ventes · Protein Tracker" };
const WWF_RICH: L = { en: "plant share of protein-rich foods · WWF method", fr: "part végétale des aliments protéiques · méthode WWF" };
const WWF_TOTAL: L = { en: "plant-based food in total sales · WWF method", fr: "aliments végétaux dans les ventes totales · méthode WWF" };
const t = (en: string, fr: string): L => ({ en, fr });
const nl = (name: string, value: number, target: number): Retailer => ({
  name, status: "publishes", value, metric: PT, year: "2025", target: t(`${target}% plant by 2030`, `${target} % de végétal en 2030`), src: "pt2025",
});
const AD_TARGET = t("Group target: 50% plant-based food sales by 2030", "Objectif du groupe : 50 % de ventes alimentaires végétales en 2030");

export const COUNTRIES: Country[] = [
  {
    id: 528, name: t("Netherlands", "Pays-Bas"),
    note: t("National average 2025: 42.6% plant protein across 13 chains, over 95% of the market.",
      "Moyenne nationale 2025 : 42,6 % de protéines végétales sur 13 enseignes, plus de 95 % du marché."),
    retailers: [
      nl("Albert Heijn", 43.6, 60), nl("Jumbo", 44.2, 60), nl("Lidl", 43.3, 60), nl("Aldi", 38.9, 60), nl("PLUS", 39.3, 60),
      nl("Dirk", 43.2, 60), nl("Picnic", 37.9, 60), nl("Crisp", 44.4, 60), nl("DekaMarkt", 42.0, 50), nl("Hoogvliet", 39.3, 50),
      nl("Ekoplaza", 66.2, 70), nl("Odin", 65.7, 70),
      { name: "Nettorama", status: "measures", target: t("50% plant by 2030 · split not made public", "50 % de végétal en 2030 · ratio non publié"), src: "pt2025" },
    ],
  },
  {
    id: 56, name: t("Belgium", "Belgique"),
    retailers: [
      { name: "Carrefour Belgique", status: "publishes", value: 42, metric: PT, year: "2025", target: t("50% by 2030", "50 % en 2030"), src: "qmBe" },
      { name: "Colruyt", status: "publishes", value: 31, metric: t("plant protein in total sales · Eimeet", "protéines végétales dans les ventes · Eimeet"), year: "2025", target: t("60% by 2028", "60 % en 2028"), src: "qmBe" },
      { name: "Delhaize", status: "publishes", value: 51, metric: t("plant-based share of products in range · own method", "part végétale des produits de l'assortiment · méthode propre"), year: "2025", target: t("50% by 2030", "50 % en 2030"), src: "qmBe" },
      { name: "Lidl", status: "publishes", value: 15, metric: WWF_RICH, year: "2025", target: t("20% by 2030", "20 % en 2030"), src: "qmBe" },
    ],
  },
  {
    id: 276, name: t("Germany", "Allemagne"),
    retailers: [
      { name: "Lidl", status: "publishes", value: 11, metric: WWF_RICH, year: "2024", target: t("20% of protein-rich foods by 2030", "20 % des aliments protéiques en 2030"), src: "qmEu" },
      { name: "Aldi Süd", status: "publishes", value: 13, metric: WWF_RICH, year: "2024", src: "qmEu" },
      { name: "REWE", status: "publishes", value: 54, metric: WWF_TOTAL, year: "2024", target: t("60% by 2035 (REWE and PENNY)", "60 % en 2035 (REWE et PENNY)"), src: "rewe" },
      { name: "Kaufland", status: "publishes", value: 8, metric: WWF_RICH, year: "2023", src: "qmEu" },
    ],
  },
  {
    id: 826, name: t("United Kingdom", "Royaume-Uni"),
    retailers: [
      { name: "Sainsbury's", status: "publishes", value: 13, metric: WWF_RICH, year: "2024", src: "qmEu" },
      { name: "Tesco", status: "publishes", value: 9, metric: WWF_RICH, year: "2024/25", src: "qmEu" },
      { name: "Lidl GB", status: "publishes", value: 18, metric: t("plant share of protein sales", "part végétale des protéines vendues"), year: "2024", target: t("25% by 2030", "25 % en 2030"), src: "lidlGb" },
    ],
  },
  {
    id: 756, name: t("Switzerland", "Suisse"),
    retailers: [
      { name: "Migros", status: "publishes", value: 15, metric: WWF_RICH, year: "2024", target: t("Protein target announced", "Objectif protéines annoncé"), src: "qmEu" },
      { name: "Denner", status: "publishes", value: 10, metric: WWF_RICH, year: "2024", target: t("50% by 2040", "50 % en 2040"), src: "qmEu" },
    ],
  },
  {
    id: 40, name: t("Austria", "Autriche"),
    retailers: [
      { name: "Lidl", status: "publishes", value: 12.4, metric: t("plant protein sources in range · WWF method", "sources de protéines végétales · méthode WWF"), year: "2022", target: t("20% by 2030", "20 % en 2030"), src: "lidlAt" },
    ],
  },
  {
    id: 616, name: t("Poland", "Pologne"),
    retailers: [
      { name: "Lidl", status: "publishes", value: 56, metric: WWF_TOTAL, year: "2024", target: t("+20% plant-based share by 2030", "+20 % de part végétale en 2030"), src: "qmEu" },
    ],
  },
  {
    id: 724, name: t("Spain", "Espagne"),
    retailers: [
      { name: "Lidl", status: "publishes", value: 49, metric: WWF_TOTAL, year: "2024", target: t("+20% plant-based share by 2030", "+20 % de part végétale en 2030"), src: "qmEu" },
      { name: "Carrefour", status: "measures", target: t("Protein shift in its 2030 climate roadmap · €650M from plant-based protein substitutes by 2026", "Bascule protéique dans sa feuille de route climat 2030 · 650 M€ de substituts végétaux en 2026"), src: "qmEu" },
    ],
  },
  {
    id: 250, name: t("France", "France"),
    retailers: [
      { name: "Lidl", status: "measures", target: t("Measures its plant / animal protein sources with the WWF method, as in every Lidl country", "Mesure ses sources de protéines végétales et animales selon la méthode WWF, comme dans chaque pays Lidl"), src: "lidlFr" },
      { name: "Intermarché", status: "measures", target: t("Tracks the share of animal protein in its sales · not yet published", "Suit la part de protéines animales dans ses ventes · non publié"), src: "qmEu" },
      { name: "Carrefour", status: "measures", target: t("Protein shift in its 2030 climate roadmap · €650M from plant-based protein substitutes by 2026", "Bascule protéique dans sa feuille de route climat 2030 · 650 M€ de substituts végétaux en 2026"), src: "qmEu" },
    ],
  },
  ...([[203, "Czechia", "Tchéquie", "Albert"], [642, "Romania", "Roumanie", "Mega Image"], [300, "Greece", "Grèce", "Alfa Beta"], [688, "Serbia", "Serbie", "Delhaize Serbia"]] as const).map(
    ([id, en, fr, brand]): Country => ({ id, name: t(en, fr), retailers: [{ name: `${brand} · Ahold Delhaize`, status: "measures", target: AD_TARGET, src: "ad" }] }),
  ),
];

export const COUNT = {
  publishes: COUNTRIES.reduce((a, c) => a + c.retailers.filter((r) => r.status === "publishes").length, 0),
  measures: COUNTRIES.reduce((a, c) => a + c.retailers.filter((r) => r.status === "measures").length, 0),
  countries: COUNTRIES.length,
};
