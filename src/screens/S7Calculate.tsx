import { useMemo, useState } from "react";
import { useCount, useDemo } from "../lib/ctx";
import { VOCAB, fill } from "../lib/i18n";
import { FOOD_GROUPS, PT_CLASSES, inScope, proteinTracker, wwf, wwfPlantShare, wwfWholeShare } from "../lib/calc";
import { Bars, CLASS_COLOR, Head, Legend, Stacked, useFmt } from "../components/ui";

export default function S7() {
  const { t, lang, m, setM } = useDemo();
  const f = useFmt();
  const T = t.s7;
  const V = VOCAB[lang];
  const [tab, setTab] = useState<"pt" | "wwf">("pt");
  const pt = useMemo(() => proteinTracker(m), [m]);
  const w = useMemo(() => wwf(m), [m]);
  const ratio = useCount(true, pt.ratio, 1200, tab);
  const changed = Object.values(m).some((v) => v !== 1);
  const tn = (kg: number) => f.num(kg / 1000, kg / 1000 < 10 ? 1 : 0);

  return (
    <div className="stack" style={{ gap: 26 }}>
      <div className="wide">
        <Head eyebrow={T.eyebrow} title={T.title} lead={fill(T.lead, { n: f.int(inScope.length) })} />
        <div className="row">
          <div className="seg" role="tablist">
            {(["pt", "wwf"] as const).map((k) => (
              <button key={k} role="tab" aria-pressed={tab === k} aria-selected={tab === k} onClick={() => setTab(k)}>{T.tabs[k]}</button>
            ))}
          </div>
          {changed && (
            <span className="chip stratum">
              {lang === "fr" ? "Volumes modifiés à l'étape 6" : "Volumes changed at step 6"}
              <button className="btn btn-sm" style={{ padding: "0 0 0 6px", background: "none", color: "inherit" }} onClick={() => setM({})}>× {t.s6.reset.toLowerCase()}</button>
            </span>
          )}
        </div>
      </div>

      {tab === "pt" ? (
        <div className="split" key="pt">
          <div className="stack">
            <div className="card">
              <div className="muted small">{T.ptHeadline}</div>
              <div className="figure"><span className="big">{f.pct(ratio)}</span></div>
              <div className="muted small" style={{ marginTop: 8 }}>{fill(T.ptOf, { plant: tn(pt.plant), total: tn(pt.total) })}</div>
              <div style={{ marginTop: 18 }}>
                <Stacked parts={[{ value: pt.plant, color: "var(--plant)" }, { value: pt.animal, color: "var(--blue)" }]} />
                <Legend items={[{ color: "var(--plant)", label: `${t.drawer.plant} · ${tn(pt.plant)} t` }, { color: "var(--blue)", label: `${t.drawer.animal} · ${tn(pt.animal)} t` }]} />
              </div>
            </div>
            <div className="card">
              <h3 className="mini">{T.byClass}</h3>
              <Stacked parts={PT_CLASSES.map((c) => ({ value: pt.byClass[c], color: CLASS_COLOR[c], label: f.pct(pt.byClass[c] / pt.total, 0) }))} />
              <Legend items={PT_CLASSES.map((c) => ({ color: CLASS_COLOR[c], label: `${V[c]} · ${f.pct(pt.byClass[c] / pt.total, 0)}` }))} />
            </div>
            <div className="card">
              <h3 className="mini">{T.levels}</h3>
              <div className="row" style={{ alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 30, fontWeight: 600, color: "var(--navy)" }} className="num">{f.pct(pt.levelA / pt.total, 0)}</span>
                <span className="muted small">{lang === "fr" ? `des protéines vendues · niveau B : ${f.pct(pt.levelB / pt.total, 0)}` : `of protein sold · level B: ${f.pct(pt.levelB / pt.total, 0)}`}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="mini">{T.byDept}</h3>
            <Bars data={pt.byDept.map((d) => ({ label: f.dept(d.dept), value: d.ratio, display: f.pct(d.ratio, 0), tone: "plant", title: `${tn(d.total)} t` }))} max={1} />
            <p className="muted small" style={{ margin: "14px 0 0" }}>
              {lang === "fr" ? "Rayons classés par tonnage de protéines vendu, du plus lourd au plus léger." : "Departments ordered by tonnes of protein sold, heaviest first."}
            </p>
          </div>
        </div>
      ) : (
        <div className="split" key="wwf">
          <div className="stack">
            <div className="card">
              <div className="muted small">{T.wwfSplit}</div>
              <div className="figure"><span className="big">{f.pct(wwfPlantShare(w))}</span></div>
              <div className="muted small" style={{ marginTop: 8 }}>{lang === "fr" ? "part végétale" : "plant share"} · {T.wwfDairyEq}</div>
              <div style={{ marginTop: 18 }} className="stack">
                {(["FG1", "FG2"] as const).map((g) => (
                  <div key={g}>
                    <div className="small" style={{ marginBottom: 6 }}><b>{g}</b> {V[g]}</div>
                    <Stacked height={24} parts={[{ value: w.byGroup[g].plant, color: "var(--plant)", label: f.pct(w.byGroup[g].plant / (w.byGroup[g].total || 1), 0) }, { value: w.byGroup[g].animal, color: "var(--blue)", label: f.pct(w.byGroup[g].animal / (w.byGroup[g].total || 1), 0) }]} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="mini">{lang === "fr" ? "Produits entiers et composites" : "Whole and composite products"}</h3>
              <Stacked parts={[{ value: w.wholeT, color: "var(--navy)", label: f.pct(wwfWholeShare(w), 0) }, { value: w.compositeT, color: "var(--comp)", label: f.pct(1 - wwfWholeShare(w), 0) }]} />
              <Legend items={[{ color: "var(--navy)", label: `${V.whole} · ${f.num(w.wholeT, 0)} t` }, { color: "var(--comp)", label: `${V.composite_s} · ${f.num(w.compositeT, 0)} t` }]} />
              <h3 className="mini" style={{ marginTop: 20 }}>{T.wwfComposites}</h3>
              <Bars data={Object.entries(w.byCategory).map(([k, v]) => ({ label: V[k], value: v, display: `${f.num(v, 0)} t`, tone: "comp" }))} />
            </div>
          </div>
          <div className="card">
            <h3 className="mini">{T.wwfWhole} · {T.wwfUnit}</h3>
            <Bars data={FOOD_GROUPS.map((g) => ({ label: <><b className="mono" style={{ color: "var(--gold)" }}>{g}</b> {V[g]}</>, value: w.byGroup[g].total, display: `${f.num(w.byGroup[g].total, 0)} t`, tone: g === "FG2" ? "soft" : "navy" }))} />
            <p className="muted small" style={{ margin: "14px 0 0" }}>
              {lang === "fr" ? "FG2 en équivalents lait : le fromage compte ×10." : "FG2 in dairy equivalents: cheese counts ×10."} {fill(T.wwfExcluded, { t: f.num(w.excludedT, 0) })}.
            </p>
          </div>
        </div>
      )}
      <p className="muted small mono" style={{ margin: 0 }}>{T.fictitious}</p>
    </div>
  );
}
