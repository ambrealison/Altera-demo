import { useDemo, useInstant, useReveal, type ScreenProps } from "../lib/ctx";
import { EXPLAIN, VOCAB, fill } from "../lib/i18n";
import { inScope } from "../lib/calc";
import type { Product, SplitSrc } from "../lib/types";
import { Bars, ClassChip, Head, Pending, RunButton, SplitBar, useFmt } from "../components/ui";

const A: SplitSrc[] = ["one_side", "ingredients", "nevo"];
const B: SplitSrc[] = ["class", "step4a", "convention"];
const pick = (src: SplitSrc, cond: (p: Product) => boolean = () => true) =>
  inScope.find((p) => p.split_src === src && cond(p))!;
const EXAMPLES = [
  pick("one_side", (p) => p.note === "houmous"),
  pick("ingredients", (p) => p.note === "egg_pasta"),
  pick("nevo", (p) => p.note === "origin_vs_split"),
  pick("class", (p) => p.dept === "Fresh Meat & Poultry"),
  pick("step4a", (p) => p.note === "breaded"),
  pick("convention", (p) => p.note === "cakes"),
].filter(Boolean);

export default function S5({ ran, run, take }: ScreenProps) {
  const { t, lang, open } = useDemo();
  const f = useFmt();
  const T = t.s5;
  const V = VOCAB[lang];
  const instant = useInstant(ran, take);
  const shown = useReveal(ran, 3, 650, instant, take);
  const N = inScope.length;
  const n = (s: SplitSrc) => inScope.filter((p) => p.split_src === s).length;
  const nA = A.reduce((a, s) => a + n(s), 0);
  const bars = (srcs: SplitSrc[], tone: string, on: boolean) => srcs.map((s) => ({ label: V[s], value: on ? n(s) : 0, display: f.int(n(s)), tone }));

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <RunButton ran={ran} run={run} label={fill(T.action, { n: f.int(N) })} />
        <div className="card tint" style={{ marginTop: 22 }}>
          <h3 className="mini">{T.invariantTitle}</h3>
          <p className="small" style={{ margin: 0, color: "#374151" }}>{T.invariant}</p>
        </div>
      </div>
      <div className="stack">
        {!ran ? <Pending label={fill(T.action, { n: f.int(N) })} run={run} /> : (
          <div className="card">
            <h3 className="mini">{T.cascadeTitle}</h3>
            <div className="stack" style={{ gap: 18 }}>
              <div style={{ opacity: shown >= 1 ? 1 : 0.2, transition: "opacity .4s" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="row" style={{ gap: 8 }}><span className="chip lvA">A</span><b className="small" style={{ color: "var(--navy)" }}>{T.levelA}</b></span>
                  <span className="mono small">{f.int(nA)} · {f.pct(nA / N, 0)}</span>
                </div>
                <Bars data={bars(A, "navy", shown >= 1)} max={N / 2} />
              </div>
              <div style={{ opacity: shown >= 2 ? 1 : 0.2, transition: "opacity .4s" }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="row" style={{ gap: 8 }}><span className="chip lvB">B</span><b className="small" style={{ color: "var(--navy)" }}>{T.levelB}</b></span>
                  <span className="mono small">{f.int(N - nA)} · {f.pct((N - nA) / N, 0)}</span>
                </div>
                <Bars data={bars(B, "soft", shown >= 2)} max={N / 2} />
              </div>
              <p className="muted small" style={{ margin: 0 }}>{T.levelNote}</p>
            </div>
          </div>
        )}
        {ran && shown >= 3 && (
          <div style={{ animation: "enter .45s both" }}>
            <h3 className="mini">{T.examplesTitle}</h3>
            <div className="examples">
              {EXAMPLES.map((p) => (
                <button className="ex-card" key={p.id} onClick={() => open(p)}>
                  <span className="lbl">{p.label}</span>
                  <span className="row" style={{ gap: 6 }}>
                    <ClassChip c={p.pt} />
                    <span className={`chip lv${p.level}`}>{p.level}</span>
                  </span>
                  <SplitBar p={p} />
                  <span className="row small" style={{ justifyContent: "space-between" }}>
                    <span style={{ color: "var(--plant)" }}>{f.pct((p.plant ?? 0) / (p.prot || 1), 0)}</span>
                    <span style={{ color: "var(--blue)" }}>{f.pct((p.animal ?? 0) / (p.prot || 1), 0)}</span>
                  </span>
                  <span className="src"><b style={{ color: "var(--navy)", fontWeight: 500 }}>{V[p.split_src ?? ""]}</b> — {EXPLAIN[lang][p.split_src ?? ""]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
