// Every number and product the tour shows, computed once from the fictitious catalogue.
import { FILL, FUNNEL, PRODUCTS, PT_CLASSES, inScope, proteinTracker, wwf, wwfPlantShare } from "./calc";
import type { Product, PtClass } from "./types";

export const PT = proteinTracker({});
export const WWF = wwf({});

// ------------------------------------------------------------ icons
const FAMILY_ICON: Record<string, string> = {
  "BBQ & Marinated": "🍖", Baking: "🌾", Beef: "🥩", "Beer & Cider": "🍺", Biscuits: "🍪", Bread: "🍞",
  "Butter & Spreads": "🧈", Cakes: "🍰", "Canned Fish": "🐟", "Canned Vegetables": "🥫", "Cereal Bars": "🍫",
  Cereals: "🥣", Chocolate: "🍫", Condiments: "🥫", "Cooked Meats": "🥓", "Cooking Sauces": "🥫", Crisps: "🥔",
  "Cured Meats": "🥓", "Dairy Alternatives": "🌱", Dips: "🫘", Eggs: "🥚", "Exotic Fruit": "🥭", "Fresh Cheese": "🧀",
  "Fresh Fish": "🐟", "Fresh Pasta": "🍝", "Frozen Fish": "🐟", "Frozen Potatoes": "🍟", "Frozen Vegetables": "🥦",
  Fruit: "🍎", "Hard Cheese": "🧀", "Herbs & Spices": "🌿", Household: "🧻", "Ice Cream": "🍦", Juice: "🧃",
  "Meat Alternatives": "🌱", Milk: "🥛", "Milk Drinks": "🥛", "Nuts & Seeds": "🥜", Oils: "🫒", Pasta: "🍝",
  Pastries: "🥐", Pizza: "🍕", "Plant Drinks": "🌾", "Plant Yoghurts": "🥥", Pork: "🥩", Potatoes: "🥔",
  Poultry: "🍗", Pulses: "🫘", "Pâté": "🥓", "Ready Meals": "🍲", "Rice & Grains": "🍚", Sandwiches: "🥪",
  "Sausages & Burgers": "🌭", Shellfish: "🦐", "Smoked Fish": "🐟", "Soft Cheese": "🧀", "Soft Drinks": "🥤",
  Spirits: "🥃", "Sports Nutrition": "🥤", Spreads: "🥜", "Stock & Gravy": "🥫", Sushi: "🍣", "Tea & Coffee": "☕",
  "Tofu & Tempeh": "🌱", "Turkey & Lamb": "🍖", Vegetables: "🥦", Water: "💧", Wine: "🍷", Yoghurt: "🥣",
};
const PRODUCE_ICON: [RegExp, string][] = [
  [/CARROT/, "🥕"], [/TOMATO/, "🍅"], [/BANANA/, "🍌"], [/APPLE/, "🍎"], [/PEAR/, "🍐"], [/LEMON/, "🍋"],
  [/AVOCADO/, "🥑"], [/CUCUMBER/, "🥒"], [/ONION/, "🧅"], [/GRAPE/, "🍇"], [/STRAWB/, "🍓"], [/ORANGE|CLEMENTINE|EASY PEEL/, "🍊"],
  [/MUSHROOM/, "🍄"], [/PEPPER/, "🫑"], [/LETTUCE|SALAD|SPINACH/, "🥬"], [/MELON/, "🍈"], [/PINEAPPLE/, "🍍"],
  [/MANGO/, "🥭"], [/GARLIC/, "🧄"], [/CORN/, "🌽"], [/POTATO/, "🥔"], [/BLUEBERR|RASPBERR/, "🫐"], [/KIWI/, "🥝"],
];
const PRODUCE = new Set(["Fruit", "Vegetables", "Exotic Fruit", "Frozen Vegetables", "Potatoes"]);

export function icon(p: Product): string {
  if (PRODUCE.has(p.family)) for (const [re, e] of PRODUCE_ICON) if (re.test(p.label)) return e;
  return FAMILY_ICON[p.family] ?? "🛒";
}
export const DEPT_ICON: Record<string, string> = {
  "Fresh Meat & Poultry": "🥩", "Dairy & Eggs": "🥛", Cheese: "🧀", Grocery: "🥫", "Plant-Based": "🌱",
  "Fish & Seafood": "🐟", Deli: "🥓", Bakery: "🍞", Frozen: "🧊", "Ready Meals": "🍲", "Breakfast & Snacks": "🥣",
  "Fruit & Vegetables": "🥦", "Soft Drinks & Water": "🥤", "Beer, Wine & Spirits": "🍷", Household: "🧻",
};
export const shortName = (p: Product) => p.name.split(",")[0];

// ------------------------------------------------------------ tiles
/** One product per family, in a fixed order that mixes aisles; two non-food items among them. */
const TILE_FAMILIES = ["Beef", "Milk", "Bread", "Fruit", "Hard Cheese", "Pulses", "Household", "Poultry", "Yoghurt", "Pizza",
  "Vegetables", "Tofu & Tempeh", "Crisps", "Fresh Fish", "Pasta", "Eggs", "Ready Meals", "Nuts & Seeds", "Chocolate", "Meat Alternatives"];
export const IMPORT_TILES: Product[] = TILE_FAMILIES.map((f) => PRODUCTS.find((p) => p.family === f)!).filter(Boolean);

/** A sample of each class, preferring distinct families. */
export const CLASS_TILES: Record<PtClass, Product[]> = Object.fromEntries(PT_CLASSES.map((c) => {
  const rows = inScope.filter((p) => p.pt === c);
  const seen = new Set<string>(); const out: Product[] = [];
  for (const p of rows) if (!seen.has(p.family)) { seen.add(p.family); out.push(p); }
  for (const p of rows) if (out.length < 16 && !out.includes(p)) out.push(p);
  return [c, out.slice(0, 16)];
})) as Record<PtClass, Product[]>;

export const CLASS_COUNT: Record<PtClass, number> = Object.fromEntries(
  PT_CLASSES.map((c) => [c, inScope.filter((p) => p.pt === c).length]),
) as Record<PtClass, number>;

export const REVIEW = inScope.filter((p) => p.review);
export const CRISPS = PRODUCTS.find((p) => p.note === "origin_vs_split" && /SOUR/.test(p.label))!;

export const F = {
  rows: PRODUCTS.length,
  fill: FILL,
  funnel: FUNNEL,
  setAside: FUNNEL.received - FUNNEL.measured,
  ptRatio: PT.ratio,
  wwfPlant: wwfPlantShare(WWF),
  crispsPlant: (CRISPS.plant ?? 0) / (CRISPS.prot || 1),
};

export const AISLES = PT.byDept.slice(0, 7);
