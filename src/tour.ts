// The guided tour. Five chapters that follow, in order, the eleven steps of
// "How Altera AI works" (Altera-agent repository):
//   1 Import    — steps 1 and 2 (receive, scope)
//   2 Classify  — step 3
//   3 Protein   — steps 4 and 5 (content, plant / animal split)
//   4 Ratio     — steps 6 and 7 (volumes, calculation)
//   5 Deliver   — steps 8 to 11 (checks, accuracy, delivery, what is kept)

export type Scene = "import" | "classify" | "protein" | "ratio" | "deliver";

export interface Stop {
  /** Key into TIPS. */
  id: string;
  /** Chapter, 1 to 5. */
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
  { id: "import", chapter: 1, scene: "import", sub: 0, anchor: "file", side: "below" },
  { id: "scope", chapter: 1, scene: "import", sub: 1, anchor: "scope", side: "above" },
  { id: "classify", chapter: 2, scene: "classify", sub: 0, anchor: "buckets", side: "below" },
  { id: "review", chapter: 2, scene: "classify", sub: 1, anchor: "review", side: "above" },
  { id: "protein", chapter: 3, scene: "protein", sub: 0, anchor: "prot-value", side: "below" },
  { id: "split", chapter: 3, scene: "protein", sub: 1, anchor: "split", side: "left" },
  { id: "ratio", chapter: 4, scene: "ratio", sub: 0, anchor: "ring", side: "right" },
  { id: "aisles", chapter: 4, scene: "ratio", sub: 1, anchor: "aisles", side: "left" },
  { id: "excel", chapter: 5, scene: "deliver", sub: 0, anchor: "excel", side: "right" },
  { id: "privacy", chapter: 5, scene: "deliver", sub: 1, anchor: "privacy", side: "left" },
];
