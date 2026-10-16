import { useDemo, useInstant, useReveal, useMounted, type ScreenProps } from "../lib/ctx";
import { fill } from "../lib/i18n";
import { FUNNEL, PRODUCTS, hasIssue } from "../lib/calc";
import { Head, Pending, RunButton, useFmt } from "../components/ui";

const ex = (cond: Parameters<typeof PRODUCTS.find>[0]) => PRODUCTS.find(cond)!;

export default function S2({ ran, run, take }: ScreenProps) {
  const { t, lang, open } = useDemo();
  const f = useFmt();
  const T = t.s2;
  const instant = useInstant(ran, take);
  const shown = useReveal(ran, 7, 420, instant, take);
  const mounted = useMounted(take);
  const N = FUNNEL.received;

  const rows = [
    { k: T.funnel.received, v: FUNNEL.received, kind: "total" },
    { k: T.funnel.tests, v: -FUNNEL.tests, kind: "cut" },
    { k: T.funnel.nonFood, v: -FUNNEL.nonFood, kind: "cut" },
    { k: T.funnel.unsold, v: -FUNNEL.unsold, kind: "cut" },
    { k: T.funnel.measured, v: FUNNEL.measured, kind: "total" },
    { k: T.funnel.wwfExcl, v: -FUNNEL.wwfExcluded, kind: "cut" },
    { k: T.funnel.wwf, v: FUNNEL.wwf, kind: "wwf" },
  ];

  const lz = ex((p) => hasIssue(p, "leading_zero"));
  const bad = ex((p) => p.code_kind === "bad_check");
  const shared = PRODUCTS.filter((p) => hasIssue(p, "shared_code"));
  const pair = shared.filter((p) => p.code === shared[0].code);
  const lbl = ex((p) => p.weight_src === "label" && /\dX\d/.test(p.label)) ?? ex((p) => p.weight_src === "label");
  const piece = ex((p) => p.weight_src === "typical_piece");

  const keys = [
    { ...T.keys.ean, b: fill(T.keys.ean.b, { n: f.int(PRODUCTS.filter((p) => p.code_kind === "ean").length) }),
      ex: <><span>{lz.code}</span> <span className="muted">· {lang === "fr" ? "zéros conservés, lu comme texte" : "zeros kept, read as text"}</span></>, p: lz },
    { ...T.keys.internal, b: fill(T.keys.internal.b, { instore: PRODUCTS.filter((p) => p.code_kind === "instore").length, bad: PRODUCTS.filter((p) => p.code_kind === "bad_check").length }),
      ex: <><s>{bad.code}</s> <span className="muted">· {lang === "fr" ? "clé de contrôle fausse" : "check digit fails"}</span></>, p: bad },
    { ...T.keys.shared, b: fill(T.keys.shared.b, { n: shared.length }),
      ex: <>{pair[0].code} → {pair.map((p) => p.label).join("  |  ")}</>, p: pair[0] },
    { ...T.keys.weight, b: fill(T.keys.weight.b, { label: PRODUCTS.filter((p) => p.weight_src === "label").length, piece: PRODUCTS.filter((p) => p.weight_src === "typical_piece").length }),
      ex: <>{lbl.label} → <ins>{f.kg(lbl.weight)}</ins> · {piece.label} <s>1.0</s> → <ins>{f.kg(piece.weight)}</ins></>, p: piece },
  ];

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <RunButton ran={ran} run={run} label={T.action} />
        <p className="note">{T.wwfNote}</p>
      </div>
      <div className="stack">
        {!ran ? <Pending label={T.action} run={run} /> : (
          <div className="card">
            <div className="funnel">
              {rows.map((r, i) => {
                const on = i < shown && mounted;
                const w = (100 * r.v) / N;
                return (
                  <div className="fun-row" key={i} style={{ opacity: i < shown ? 1 : 0.15, transition: "opacity .4s" }}>
                    <div className={`fun-bar ${r.kind === "cut" ? "cut" : r.kind === "wwf" ? "wwf" : ""}`}
                      style={{ width: r.kind === "cut" ? "fit-content" : on ? `${Math.min(100, w)}%` : "0%" }}>{r.k}</div>
                    <span className={`v ${r.kind === "cut" ? "cut" : ""}`}>{r.v > 0 ? f.int(r.v) : `− ${f.int(-r.v)}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {ran && shown >= rows.length && (
          <div className="keys">
            {keys.map((k, i) => (
              <div className="key" key={i} style={{ animation: `enter .4s ${i * 0.08}s both` }}>
                <div className="t">{k.t}</div>
                <div className="b">{k.b}</div>
                <button className="ex" onClick={() => open(k.p)} style={{ border: 0, width: "100%", textAlign: "left", cursor: "pointer" }}>{k.ex}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
