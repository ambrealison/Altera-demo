// The guided tour: ten steps, one page each, from the file you send to the two ratios.
// They follow "The Altera protein ratio method": receive, scope, classify, protein
// content, split, volumes, calculate (WWF first, then Protein Tracker), check, deliver.
// Each page shows two numbered parts, and the explanation has one paragraph for each.

export type Scene = "data" | "scope" | "classify" | "protein" | "split" | "volumes" | "wwf" | "pt" | "quality" | "deliver";

export interface Stop {
  /** Key into TIPS, and the screen shown. */
  id: Scene;
  /** Step, 1 to 10. */
  chapter: number;
}

export const STOPS: Stop[] = (["data", "scope", "classify", "protein", "split", "volumes", "wwf", "pt", "quality", "deliver"] as Scene[])
  .map((id, i) => ({ id, chapter: i + 1 }));
