export type Lang = "en" | "fr";
export type Profile = "retailer" | "ngo";

export type PtClass = "animal_core" | "plant_core" | "plant_non_core" | "composite";
export type Route = "inherited" | "stratum" | "model";
export type ProtSrc = "declared" | "reference_base" | "off_ean" | "name_match" | "stratum_median";
export type SplitSrc = "one_side" | "class" | "step4a" | "ingredients" | "nevo" | "convention";

export interface Wwf {
  struct?: "whole" | "composite";
  fg?: string;
  src?: "plant" | "animal";
  sub?: string;
  cat?: string;
  excl?: string;
}

export interface Product {
  id: string;
  code: string;
  code_kind: "ean" | "instore" | "bad_check";
  label: string;
  name: string;
  brand: string;
  own?: boolean;
  dept: string;
  family: string;
  note?: string;
  ingredients?: string;
  quid?: boolean;
  weight_raw?: number;
  weight: number;
  weight_src: "declared" | "label" | "typical_piece" | "variable";
  units?: number;
  rank?: number;
  issues?: string[];
  in_scope?: boolean;
  pt_in?: boolean;
  wwf_in?: boolean;
  route?: Route;
  conf?: number;
  review?: boolean;
  requeried?: boolean;
  prot?: number;
  prot_src?: ProtSrc;
  prot_declared_bad?: number;
  fat?: number;
  carb?: number;
  pt?: PtClass;
  plant?: number;
  animal?: number;
  level?: "A" | "B";
  split_src?: SplitSrc;
  dairy?: number;
  wwf: Wwf;
}

export interface Catalogue {
  meta: { retailer: string; products: number; seed: number };
  products: Product[];
}

export type Multipliers = Record<string, number>;
