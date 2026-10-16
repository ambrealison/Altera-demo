// The guided tour. Seven steps, each named after what Altera AI does, that follow in order
// the eleven steps of "How Altera AI works" (Altera-agent repository):
//   1 Reads and scopes the file      steps 1–2   receive and inventory, scope and keys
//   2 Classifies every product       step 3
//   3 Completes protein content      step 4
//   4 Splits plant and animal        step 5
//   5 Calculates both ratios         steps 6–7   volumes, both methodologies (WWF first)
//   6 Checks and measures accuracy   steps 8–9
//   7 Delivers the results           steps 10–11

export type Scene = "intake" | "classify" | "protein" | "split" | "calculate" | "quality" | "deliver";

export interface Stop {
  /** Key into TIPS. */
  id: string;
  /** Step, 1 to 7. */
  chapter: number;
  scene: Scene;
  /** Sub-state of the scene: what is revealed so far. */
  sub: number;
  /** data-anchor of the element the hotspot points at. */
  anchor: string;
  /** Where the tooltip goes; by default beside the target, on the side with room. */
  side?: "left" | "right" | "below" | "above";
}

export const STOPS: Stop[] = [
  { id: "intake", chapter: 1, scene: "intake", sub: 0, anchor: "inventory", side: "right" },
  { id: "scope", chapter: 1, scene: "intake", sub: 1, anchor: "scope", side: "left" },
  { id: "classes", chapter: 2, scene: "classify", sub: 0, anchor: "wwf-groups", side: "below" },
  { id: "sources", chapter: 2, scene: "classify", sub: 1, anchor: "sources", side: "above" },
  { id: "cascade", chapter: 3, scene: "protein", sub: 0, anchor: "cascade", side: "right" },
  { id: "perpack", chapter: 3, scene: "protein", sub: 1, anchor: "perpack", side: "left" },
  { id: "origin", chapter: 4, scene: "split", sub: 0, anchor: "split", side: "right" },
  { id: "levels", chapter: 4, scene: "split", sub: 1, anchor: "levels", side: "left" },
  { id: "wwf", chapter: 5, scene: "calculate", sub: 0, anchor: "wwf", side: "below" },
  { id: "pt", chapter: 5, scene: "calculate", sub: 1, anchor: "pt", side: "below" },
  { id: "depts", chapter: 5, scene: "calculate", sub: 2, anchor: "depts", side: "above" },
  { id: "checks", chapter: 6, scene: "quality", sub: 0, anchor: "checks", side: "right" },
  { id: "accuracy", chapter: 6, scene: "quality", sub: 1, anchor: "accuracy", side: "left" },
  { id: "deliverables", chapter: 7, scene: "deliver", sub: 0, anchor: "deliverables", side: "right" },
  { id: "governance", chapter: 7, scene: "deliver", sub: 1, anchor: "governance", side: "left" },
];
