import { useState } from "react";
import { useDemo, useInstant, useReveal, type ScreenProps } from "../lib/ctx";
import { VOCAB, fill } from "../lib/i18n";
import { PRODUCTS, inScope, hasIssue } from "../lib/calc";
import type { ProtSrc } from "../lib/types";
import { Bars, Head, Pending, RunButton, useFmt } from "../components/ui";

const ORDER: ProtSrc[] = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"];
const PER_PACK = PRODUCTS.filter((p) => hasIssue(p, "per_pack_protein"));

export default function S4({ ran, run, take }: ScreenProps) {
  const { t, lang, open } = useDemo();
  const f = useFmt();
  const T = t.s4;
  const V = VOCAB[lang];
  const instant = useInstant(ran, take);
  const shown = useReveal(ran, ORDER.length + 1, 450, instant, take);
  const N = inScope.length;
  const [sel, setSel] = useState(0);
  const p = PER_PACK[sel];

  // energy the pack declares, consistent with the true macronutrients
  const kcal = (prot: number) => 4 * prot + 9 * (p.fat ?? 0) + 4 * (p.carb ?? 0);
  const declaredKcal = Math.round(kcal(p.prot ?? 0));
  const impliedKcal = Math.round(kcal(p.prot_declared_bad ?? 0));

  const data = ORDER.map((s, i) => {
    const n = inScope.filter((x) => x.prot_src === s).length;
    return { label: V[s], value: i < shown ? n : 0, display: `${f.int(n)} · ${f.pct(n / N, 0)}`, tone: s === "declared" ? "navy" : "soft" };
  });

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <RunButton ran={ran} run={run} label={T.action} />
        <p className="note">{T.note}</p>
      </div>
      <div className="stack">
        {!ran ? <Pending label={T.action} run={run} /> : (
          <div className="card">
            <h3 className="mini">{T.cascadeTitle}</h3>
            <Bars data={data} max={N} />
            <p className="muted small" style={{ margin: "14px 0 0" }}>
              {lang === "fr"
                ? "Chaque source n'est essayée que si la précédente n'a rien donné. Les codes internes ne sont jamais envoyés à Open Food Facts."
                : "Each source is tried only when the one before it gave nothing. Internal codes are never sent to Open Food Facts."}
            </p>
          </div>
        )}
        {ran && shown > ORDER.length && (
          <div className="card" style={{ animation: "enter .45s both" }}>
            <div className="card-head">
              <div>
                <h3 className="mini" style={{ marginBottom: 4 }}>{T.perPackTitle}</h3>
                <div className="muted small">{T.energyBody}</div>
              </div>
            </div>
            <div className="picker" style={{ marginBottom: 14 }}>
              {PER_PACK.map((x, i) => <button key={x.id} aria-pressed={i === sel} onClick={() => setSel(i)}>{x.label}</button>)}
            </div>
            <div className="kpis">
              <div className="kpi">
                <div className="k">{lang === "fr" ? "Déclaré pour 100 g" : "Declared per 100 g"}</div>
                <div className="v" style={{ color: "var(--red)" }}>{f.num(p.prot_declared_bad ?? 0)} g</div>
                <div className="d muted">→ {f.int(impliedKcal)} kcal</div>
              </div>
              <div className="kpi">
                <div className="k">{lang === "fr" ? "Énergie déclarée" : "Declared energy"}</div>
                <div className="v">{f.int(declaredKcal)} kcal</div>
                <div className="d down">{lang === "fr" ? "écart" : "gap"} {f.int(impliedKcal - declaredKcal)} kcal</div>
              </div>
              <div className="kpi">
                <div className="k">{lang === "fr" ? "Retenu" : "Kept"}</div>
                <div className="v" style={{ color: "var(--plant)" }}>{f.num(p.prot ?? 0)} g</div>
                <div className="d muted">{V[p.prot_src ?? ""]}</div>
              </div>
            </div>
            <p className="small" style={{ margin: "14px 0 0", color: "#374151" }}>
              {fill(T.perPack, { bad: f.num(p.prot_declared_bad ?? 0), w: f.kg(p.weight), prot: f.num(p.prot ?? 0) })}{" "}
              <button className="btn btn-ghost btn-sm" onClick={() => open(p)}>{lang === "fr" ? "Voir la fiche" : "Open the record"}</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
