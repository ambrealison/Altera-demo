// The guided tour: seven steps, one page each, named after what Altera AI does. They follow
// in order the eleven steps of "How Altera AI works" (Altera-agent repository):
//   1 Reads and scopes the file      method steps 1 and 2
//   2 Classifies every product       step 3
//   3 Completes protein content      step 4
//   4 Splits plant and animal        step 5
//   5 Calculates both ratios         steps 6 and 7 (WWF first)
//   6 Checks and measures accuracy   steps 8 and 9
//   7 Delivers the results           steps 10 and 11

export type Scene = "intake" | "classify" | "protein" | "split" | "calculate" | "quality" | "deliver";

export interface Stop {
  /** Key into TIPS. */
  id: string;
  /** Step, 1 to 7. */
  chapter: number;
  scene: Scene;
  /** Sub-state of the scene; each page shows its scene in full. */
  sub: number;
  /** data-anchor of the parts of the screen the step is about: framed, the rest toned down. */
  focus: string[];
}

export const STOPS: Stop[] = [
  { id: "intake", chapter: 1, scene: "intake", sub: 1, focus: ["scope"] },
  { id: "classes", chapter: 2, scene: "classify", sub: 1, focus: ["wwf-groups", "pt-classes"] },
  { id: "cascade", chapter: 3, scene: "protein", sub: 1, focus: ["cascade"] },
  { id: "origin", chapter: 4, scene: "split", sub: 1, focus: ["split", "levels"] },
  { id: "ratios", chapter: 5, scene: "calculate", sub: 2, focus: ["wwf", "pt"] },
  { id: "accuracy", chapter: 6, scene: "quality", sub: 1, focus: ["accuracy"] },
  { id: "deliverables", chapter: 7, scene: "deliver", sub: 1, focus: ["deliverables", "governance"] },
];
