import { useMemo } from "react";
import { useDemo } from "../lib/ctx";
import type { Multipliers } from "../lib/types";
import { proteinTracker, wwf, wwfPlantShare } from "../lib/calc";
import { Head, useFmt } from "../components/ui";

const BASE = proteinTracker({});
const BASE_WWF = wwfPlantShare(wwf({}));
const DEPTS = BASE.byDept.filter((d) => d.total > 0).map((d) => d.dept);

export default function S6() {
  const { t, lang, m, setM } = useDemo();
  const f = useFmt();
  const T = t.s6;
  const pt = useMemo(() => proteinTracker(m), [m]);
  const ww = useMemo(() => wwfPlantShare(wwf(m)), [m]);
  const changed = Object.values(m).some((v) => v !== 1);
  const dPt = pt.ratio - BASE.ratio;
  const dW = ww - BASE_WWF;
  const pts = (d: number) => `${d >= 0 ? "+" : "−"}${f.num(Math.abs(d * 100), 1)} ${lang === "fr" ? "pt" : "pts"}`;

  const scenarios: { k: string; m: Multipliers }[] = [
    { k: lang === "fr" ? "Végétal ×2" : "Plant-based ×2", m: { "Plant-Based": 2 } },
    { k: lang === "fr" ? "Boucherie −20 %" : "Fresh meat −20%", m: { "Fresh Meat & Poultry": 0.8 } },
    { k: lang === "fr" ? "Épicerie +30 %" : "Grocery +30%", m: { Grocery: 1.3 } },
  ];

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <p className="note">{T.note}</p>
      </div>
      <div className="stack">
        <div className="kpis">
          <div className="kpi">
            <div className="k">Protein Tracker · {t.s7.ptHeadline.toLowerCase()}</div>
            <div className="v" style={{ color: "var(--plant)" }}>{f.pct(pt.ratio)}</div>
            <div className={`d ${dPt > 0.0005 ? "up" : dPt < -0.0005 ? "down" : "muted"}`}>{changed ? pts(dPt) : (lang === "fr" ? "point de départ" : "baseline")}</div>
          </div>
          <div className="kpi">
            <div className="k">WWF · {lang === "fr" ? "part végétale FG1 + FG2" : "plant share FG1 + FG2"}</div>
            <div className="v" style={{ color: "var(--plant)" }}>{f.pct(ww)}</div>
            <div className={`d ${dW > 0.0005 ? "up" : dW < -0.0005 ? "down" : "muted"}`}>{changed ? pts(dW) : (lang === "fr" ? "point de départ" : "baseline")}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-head" style={{ flexWrap: "wrap" }}>
            <div>
              <h2 className="sub">{T.tryTitle}</h2>
              <div className="muted small">{T.tryLead}</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {scenarios.map((s) => <button key={s.k} className="btn btn-ghost btn-sm" onClick={() => setM({ ...m, ...s.m })}>{s.k}</button>)}
              {changed && <button className="btn btn-ghost btn-sm" onClick={() => setM({})}>{T.reset}</button>}
            </div>
          </div>
          <div className="sliders">
            {DEPTS.map((d) => {
              const v = m[d] ?? 1;
              return (
                <label className="sl" key={d}>
                  <span>{f.dept(d)}</span>
                  <input type="range" min={0} max={3} step={0.1} value={v} onChange={(e) => setM({ ...m, [d]: Number(e.target.value) })} />
                  <span className={`x ${v !== 1 ? "changed" : ""}`}>×{f.num(v, 1)}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
