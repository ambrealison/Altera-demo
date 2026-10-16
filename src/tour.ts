// The guided tour: one stop per tooltip, in the order of the Altera AI method
// ("How Altera AI works", Altera-agent repository, steps 1 to 11).

export type Scene =
  | "import" | "scope" | "classify" | "protein" | "split" | "volumes"
  | "results" | "checks" | "accuracy" | "deliver" | "refbase";

export interface Stop {
  /** Key into TIPS. */
  id: string;
  /** Step of the method, 1 to 11. */
  step: number;
  scene: Scene;
  /** Sub-state of the scene: what is revealed so far. */
  sub: number;
  /** data-anchor of the element the hotspot points at. */
  anchor: string;
  /** Where the tooltip goes; by default beside the target, on the side with room. */
  side?: "left" | "right" | "below";
}

export const STOPS: Stop[] = [
  { id: "file", step: 1, scene: "import", sub: 0, anchor: "file" },
  { id: "csv", step: 1, scene: "import", sub: 1, anchor: "csv" },
  { id: "fill", step: 1, scene: "import", sub: 2, anchor: "fill-protein" },
  { id: "measured", step: 2, scene: "scope", sub: 0, anchor: "measured" },
  { id: "codes", step: 2, scene: "scope", sub: 1, anchor: "codes" },
  { id: "weights", step: 2, scene: "scope", sub: 2, anchor: "weights" },
  { id: "inherited", step: 3, scene: "classify", sub: 0, anchor: "src-inherited" },
  { id: "stratum", step: 3, scene: "classify", sub: 1, anchor: "src-stratum" },
  { id: "model", step: 3, scene: "classify", sub: 2, anchor: "not-sent" },
  { id: "review", step: 3, scene: "classify", sub: 3, anchor: "review" },
  { id: "cascade", step: 4, scene: "protein", sub: 0, anchor: "src-declared" },
  { id: "perpack", step: 4, scene: "protein", sub: 1, anchor: "perpack" },
  { id: "origin", step: 5, scene: "split", sub: 0, anchor: "split-bar" },
  { id: "levels", step: 5, scene: "split", sub: 1, anchor: "level-a" },
  { id: "mass", step: 6, scene: "volumes", sub: 0, anchor: "mass" },
  { id: "result", step: 7, scene: "results", sub: 0, anchor: "result" },
  { id: "toggle", step: 7, scene: "results", sub: 1, anchor: "toggle" },
  { id: "fail", step: 8, scene: "checks", sub: 0, anchor: "check-fail" },
  { id: "pass", step: 8, scene: "checks", sub: 1, anchor: "checks-pass" },
  { id: "sealed", step: 9, scene: "accuracy", sub: 0, anchor: "sealed", side: "below" },
  { id: "workbook", step: 10, scene: "deliver", sub: 0, anchor: "workbook" },
  { id: "scope", step: 10, scene: "deliver", sub: 1, anchor: "csv-file", side: "left" },
  { id: "refbase", step: 11, scene: "refbase", sub: 0, anchor: "refbase", side: "below" },
];
