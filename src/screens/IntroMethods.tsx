import { useState } from "react";
import { useDemo } from "../lib/ctx";
import { NOTES, VOCAB } from "../lib/i18n";
import { PRODUCTS, FOOD_GROUPS } from "../lib/calc";
import type { PtClass } from "../lib/types";
import { ClassChip, Head, SplitBar, useFmt } from "../components/ui";

const LENS_NOTES = ["breaded", "origin_vs_split", "egg_pasta", "two_composites", "cheese_factor", "alcohol", "plant_alt"];
const LENS = LENS_NOTES.map((n) => PRODUCTS.find((p) => p.note === n && p.in_scope && p.ingredients)!).filter(Boolean);

const CLASS_TEXT: Record<"en" | "fr", Record<PtClass, string>> = {
  en: {
    animal_core: "Meat, fish, eggs, dairy: protein of animal origin.",
    composite: "Animal and plant protein in one product: ready meals, pastries, pizza.",
    plant_core: "Protein-rich plant foods: pulses, nuts, tofu, plant-based alternatives.",
    plant_non_core: "Other plant foods: cereals, bread, fruit, vegetables, snacks.",
  },
  fr: {
    animal_core: "Viande, poisson, œufs, produits laitiers : protéines d'origine animale.",
    composite: "Protéines animales et végétales dans un même produit : plats préparés, viennoiseries, pizzas.",
    plant_core: "Aliments végétaux riches en protéines : légumineuses, fruits à coque, tofu, alternatives végétales.",
    plant_non_core: "Autres aliments végétaux : céréales, pain, fruits, légumes, snacks.",
  },
};

export default function IntroMethods() {
  const { t, lang } = useDemo();
  const f = useFmt();
  const T = t.introMethods;
  const V = VOCAB[lang];
  const [pick, setPick] = useState(0);
  const p = LENS[pick];

  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="wide">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
      </div>

      <div className="methods">
        <article className="method">
          <span className="owner">{T.pt.owner}</span>
          <span className="nm">{T.pt.name}</span>
          <span className="unit">{T.pt.unit}</span>
          <p className="body" style={{ margin: 0 }}>{T.pt.body}</p>
          <div className="classes">
            {(["animal_core", "composite", "plant_non_core", "plant_core"] as PtClass[]).map((c) => (
              <div key={c} className={`cls ${c}`} style={{ background: `var(--c-${c})` }}>
                <b>{V[c]}</b>{CLASS_TEXT[lang][c]}
              </div>
            ))}
          </div>
          <p className="muted small" style={{ margin: 0 }}>{T.pt.level}</p>
        </article>

        <article className="method">
          <span className="owner">{T.wwf.owner}</span>
          <span className="nm">{T.wwf.name}</span>
          <span className="unit">{T.wwf.unit}</span>
          <p className="body" style={{ margin: 0 }}>{T.wwf.body}</p>
          <div className="fgs">
            {FOOD_GROUPS.map((g) => (
              <div className="fg" key={g}><b>{g}</b>{V[g]}</div>
            ))}
          </div>
          <p className="muted small" style={{ margin: 0 }}>{T.wwf.dairy} {T.wwf.excl}</p>
        </article>
      </div>

      <div className="card tint">
        <div className="card-head" style={{ flexWrap: "wrap" }}>
          <div>
            <h2 className="sub">{T.lensTitle}</h2>
            <div className="muted small">{T.lensLead}</div>
          </div>
        </div>
        <div className="picker" role="group">
          {LENS.map((x, i) => (
            <button key={x.id} aria-pressed={i === pick} onClick={() => setPick(i)}>{x.label}</button>
          ))}
        </div>
        {p && (
          <>
            <div className="lens">
              <div className="side">
                <div className="owner">Protein Tracker</div>
                <div className="row" style={{ marginBottom: 10 }}>
                  <ClassChip c={p.pt} />
                  <span className={`chip lv${p.level}`}>{lang === "fr" ? "Niveau" : "Level"} {p.level}</span>
                </div>
                <SplitBar p={p} />
                <div className="row small" style={{ marginTop: 8, justifyContent: "space-between" }}>
                  <span style={{ color: "var(--plant)" }}>{t.drawer.plant} {f.num(p.plant ?? 0, 2)} g</span>
                  <span style={{ color: "var(--blue)" }}>{t.drawer.animal} {f.num(p.animal ?? 0, 2)} g</span>
                </div>
                <div className="muted small" style={{ marginTop: 4 }}>{lang === "fr" ? "pour 100 g de produit" : "per 100 g of product"}</div>
              </div>
              <div className="side">
                <div className="owner">WWF Planet-Based Diets</div>
                {p.wwf.excl ? (
                  <div><span className="chip excl">{V[p.wwf.excl]}</span></div>
                ) : p.wwf.struct === "composite" ? (
                  <div className="stack" style={{ gap: 6 }}>
                    <span className="chip composite" style={{ alignSelf: "flex-start" }}>{V.composite_s}</span>
                    <span className="small">{lang === "fr" ? "Catégorie" : "Category"} : <b>{V[p.wwf.cat ?? ""]}</b></span>
                    <span className="muted small">{lang === "fr" ? "Un composite n'a pas de groupe d'aliments." : "A composite has no food group."}</span>
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 6 }}>
                    <span className="chip" style={{ alignSelf: "flex-start" }}>{V.whole}</span>
                    <span className="small"><b>{p.wwf.fg}</b> · {V[p.wwf.fg ?? ""]}{p.wwf.sub ? ` · ${V[p.wwf.sub]}` : ""}</span>
                    <span className="small">{lang === "fr" ? "Origine" : "Origin"} : {V[p.wwf.src ?? ""]}{p.dairy && p.dairy > 1 ? ` · ${lang === "fr" ? "équivalent lait" : "dairy equivalent"} ×${p.dairy}` : ""}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="note" style={{ marginTop: 14 }}>
              <span className="mono small" style={{ color: "var(--navy)" }}>{p.name}</span> — {NOTES[lang][p.note ?? ""]}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
