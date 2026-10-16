import { useEffect, useState, type ReactNode } from "react";
import type { Lang, PtClass } from "./lib/types";
import { UI_STR, VOCAB, dept, fill } from "./lib/i18n";
import { fmtInt, fmtNum, fmtPct, FOOD_GROUPS, PT_CLASSES } from "./lib/calc";
import { EX, F, PER_PACK, PT, RAW_PREVIEW, VOLUME_ROWS, WWF } from "./lib/facts";
import type { Scene } from "./tour";

interface P { sub: number; anchor: string; lang: Lang }

// ------------------------------------------------------------ helpers
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const on = (p: P, id: string) => (p.anchor === id ? "focus" : "");

/** true one frame after mount, so widths animate from zero */
function useGrow(dep: unknown = 0) {
  const [g, setG] = useState(false);
  useEffect(() => {
    setG(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setG(true)));
    return () => cancelAnimationFrame(id);
  }, [dep]);
  return g;
}

function useCount(to: number, ms = 1100, from = 0, dep: unknown = 0) {
  const [v, setV] = useState(from);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, from, dep]);
  return v;
}

const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};

function Bar({ v, tone = "", grow }: { v: number; tone?: string; grow: boolean }) {
  return <div className="track"><i className={tone} style={{ width: grow ? `${Math.max(0, Math.min(1, v)) * 100}%` : 0 }} /></div>;
}

// ------------------------------------------------------------ 1 · receive and inventory
function Import(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const fillKeys = Object.keys(F.fill) as (keyof typeof F.fill)[];
  const lz = EX.leadingZero.code;
  const zeros = lz.match(/^0+/)?.[0] ?? "";
  return (
    <>
      <div className={cx("card", on(p, "file"))}>
        <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div className="file" data-anchor="file">
            <div className="fico" style={{ background: "var(--green)" }}>CSV</div>
            <div>
              <div className="fname">harbour_market_catalogue_2026.csv</div>
              <div className="fmeta">{fmtInt(F.rows, p.lang)} {U.rows} · {F.cols} {U.columns} · 186 KB</div>
            </div>
          </div>
          <span className="chip ok">🔒 {U.archived}</span>
        </div>
        <table className="t" style={{ marginTop: 14 }}>
          <thead><tr>{U.preview.map((h, i) => <th key={h} className={i >= 3 ? "r" : ""}>{h}</th>)}</tr></thead>
          <tbody>
            {RAW_PREVIEW.slice(0, 3).map((r) => (
              <tr key={r.id}>
                <td className="code">{r.code}</td>
                <td className="lbl">{r.label}</td>
                <td>{r.dept}</td>
                <td className={cx("r", r.weight_raw === undefined && "miss")}>{r.weight_raw ?? "—"}</td>
                <td className={cx("r", r.prot_src !== "declared" && "miss")}>{r.prot_src === "declared" ? r.prot : "—"}</td>
                <td className="r">{fmtInt(r.units ?? 0, p.lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid2" style={{ flex: 1, minHeight: 0 }}>
        <div className={cx("card", p.sub < 1 && "dim", on(p, "csv"))} data-anchor="csv">
          <div className="ctitle">{U.readAs}</div>
          <div className="row" style={{ alignItems: "center", gap: 8 }}>
            <span className="chip ok" style={{ fontSize: 14, padding: "6px 14px" }}>CSV ✓</span>
            <span className="chip" style={{ fontSize: 14, padding: "6px 14px", textDecoration: "line-through", color: "var(--faint)" }}>XLSX</span>
          </div>
          <div style={{ marginTop: 22, fontFamily: "var(--mono)", fontSize: 26, letterSpacing: "0.02em" }}>
            <span style={{ color: "var(--green)", background: "var(--green-soft)", borderRadius: 6, padding: "0 4px" }}>{zeros}</span>{lz.slice(zeros.length)}
          </div>
          <div className="fmeta" style={{ marginTop: 8 }}>{fill(U.codesZero, { n: F.leadingZero })}</div>
        </div>
        <div className={cx("card", p.sub < 1 && "dim")}>
          <div className="ctitle">{U.fillRate}</div>
          {fillKeys.map((k) => (
            <div key={k} className={cx("brow", k === "protein" && on(p, "fill-protein"))} data-anchor={k === "protein" ? "fill-protein" : undefined}>
              <span>{U.fillCols[k]}</span>
              <Bar v={F.fill[k]} grow={g && p.sub >= 1} tone={F.fill[k] > 0.95 ? "ink" : ""} />
              <span className="v">{fmtPct(F.fill[k], p.lang, F.fill[k] < 1 && F.fill[k] > 0.99 ? 1 : 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------ 2 · scope and keys
function Scope(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const N = F.funnel.received;
  const rows: { k: string; v: number; kind: "total" | "cut" | "wwf"; a?: string }[] = [
    { k: U.funnel.received, v: N, kind: "total" },
    { k: U.funnel.tests, v: -F.funnel.tests, kind: "cut" },
    { k: U.funnel.nonFood, v: -F.funnel.nonFood, kind: "cut" },
    { k: U.funnel.unsold, v: -F.funnel.unsold, kind: "cut" },
    { k: U.funnel.measured, v: F.funnel.measured, kind: "total", a: "measured" },
    { k: U.funnel.wwfExcl, v: -F.funnel.wwfExcluded, kind: "cut" },
    { k: U.funnel.wwf, v: F.funnel.wwf, kind: "wwf" },
  ];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)", flex: 1 }}>
      <div className="card">
        <div className="ctitle">{U.funnel.received} → {U.funnel.measured}</div>
        <div className="funnel">
          {rows.map((r, i) => (
            <div className="frow" key={i}>
              <div className={cx("fbar", r.kind === "cut" && "cut", r.kind === "wwf" && "wwf", r.a && on(p, r.a))}
                style={{ width: r.kind === "cut" ? undefined : g ? `${(100 * r.v) / N}%` : "0%" }}>{r.k}</div>
              <span className={cx("v", r.kind === "cut" && "cut")} data-anchor={r.a}>{r.v > 0 ? fmtInt(r.v, p.lang) : `− ${fmtInt(-r.v, p.lang)}`}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className={cx("card", p.sub < 1 && "dim", on(p, "codes"))} data-anchor="codes">
          <div className="ctitle">{U.codes}</div>
          {([["ean", F.ean, "ok"], ["instore", F.instore, "warn"], ["bad", F.badCheck, "bad"], ["shared", F.shared, "warn"]] as const).map(([k, n, tone]) => (
            <div className="line-item" key={k}>
              <span className={cx("tick", tone === "bad" && "no")} style={tone === "warn" ? { background: "var(--peach-soft)", color: "var(--animal-ink)" } : undefined}>{tone === "ok" ? "✓" : tone === "bad" ? "✕" : "!"}</span>
              <span style={{ flex: 1 }}>{U.codeRows[k]}</span>
              <b className="num">{fmtInt(n, p.lang)}</b>
            </div>
          ))}
          <div className="code" style={{ marginTop: 8 }}>{EX.instore.code} · {EX.instore.label}</div>
        </div>
        <div className={cx("card", p.sub < 2 && "dim", on(p, "weights"))} data-anchor="weights">
          <div className="ctitle">{U.weights}</div>
          <div className="line-item"><span className="tick">✓</span><span style={{ flex: 1 }}>{U.weightRows.label}</span><b className="num">{F.wLabel}</b></div>
          <div className="code" style={{ padding: "2px 0 6px 30px" }}>{EX.passata.label} → <b style={{ color: "var(--green)" }}>{fmtNum(EX.passata.weight, p.lang, 1)} kg</b></div>
          <div className="line-item"><span className="tick">✓</span><span style={{ flex: 1 }}>{U.weightRows.piece}</span><b className="num">{F.wPiece}</b></div>
          <div className="code" style={{ padding: "2px 0 6px 30px" }}>{EX.piece.label} · <s>1.0</s> → <b style={{ color: "var(--green)" }}>{fmtNum(EX.piece.weight, p.lang, 2)} kg</b></div>
          <div className="line-item"><span className="tick">✓</span><span style={{ flex: 1 }}>{U.weightRows.variable}</span><b className="num">{F.wVariable}</b></div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 3 · classify
function Classify(p: P) {
  const U = UI_STR[p.lang];
  const V = VOCAB[p.lang];
  const g = useGrow();
  const N = F.funnel.measured;
  const m = EX.model;
  const focusSrc = p.sub === 0 ? "inherited" : p.sub === 1 ? "stratum" : null;
  return (
    <>
      <div className="grid3">
        {(["inherited", "stratum", "model"] as const).map((r) => (
          <div key={r} className={cx("card", focusSrc && focusSrc !== r && "dim", on(p, `src-${r}`))} data-anchor={`src-${r}`}>
            <div className="ctitle">{U.sources[r][0]}<span className="chip">{fmtPct(F.routes[r] / N, p.lang, 0)}</span></div>
            <div className="big" style={{ fontSize: 40 }}>{fmtInt(F.routes[r], p.lang)}</div>
            <div className="fmeta" style={{ margin: "6px 0 12px" }}>{U.sources[r][1]}</div>
            <Bar v={F.routes[r] / N} grow={g} tone={r === "model" ? "ink" : r === "stratum" ? "lav" : ""} />
          </div>
        ))}
      </div>
      <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)", flex: 1, minHeight: 0 }}>
        <div className={cx("card", p.sub < 2 && "dim")}>
          <div className="ctitle">{U.sent}<span className="lbl">{m.label}</span></div>
          <dl className="kv">
            <dt>{U.fields[0]}</dt><dd className="lbl">{m.label}</dd>
            <dt>{U.fields[1]}</dt><dd>{m.name}</dd>
            <dt>{U.fields[2]}</dt><dd>{m.brand}</dd>
            <dt>{U.fields[3]}</dt><dd>{dept(m.dept, p.lang)}</dd>
            <dt>{U.fields[4]}</dt><dd>{m.ingredients}</dd>
            <dt>{U.fields[5]}</dt><dd>{fmtNum(m.weight, p.lang, 2)} kg</dd>
          </dl>
          <div className={cx("lock", on(p, "not-sent"))} data-anchor="not-sent" style={{ marginTop: 12 }}>
            <span className="ico">✕</span>
            <span><b>{U.notSent}</b> · {U.notSentList}</span>
          </div>
          <div className="row" style={{ marginTop: 12, alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span className="ctitle" style={{ margin: 0 }}>{U.answer}</span>
            <span className={`chip ${m.pt}`}><i />{V[m.pt ?? ""]}</span>
            <span className="chip">WWF · {V.composite_s} · {V[m.wwf.cat ?? ""]}</span>
            <span className="chip ok">✓ {fmtPct(m.conf ?? 0, p.lang, 0)}</span>
          </div>
        </div>
        <div className={cx("card", p.sub < 3 && "dim", on(p, "review"))} data-anchor="review">
          <div className="ctitle">{U.reviewQueue}<span className="chip warn">{F.review.length} {U.flagged}</span></div>
          {F.review.slice(0, 6).map((r) => (
            <div className="line-item" key={r.id}>
              <span className="tick" style={{ background: "var(--peach-soft)", color: "var(--animal-ink)" }}>?</span>
              <span className="lbl" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
              <span className="num" style={{ color: "var(--animal-ink)", fontWeight: 600, fontSize: 12.5 }}>{fmtPct(r.conf ?? 0, p.lang, 0)}</span>
            </div>
          ))}
          <div className="fmeta" style={{ marginTop: 6 }}>{fill(U.more, { n: F.review.length - 6 })}</div>
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------ 4 · protein content
function Protein(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const N = F.funnel.measured;
  const order = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"] as const;
  const pk = PER_PACK;
  return (
    <div className="grid2" style={{ flex: 1 }}>
      <div className="card">
        <div className="ctitle">{U.cascade}</div>
        {order.map((s, i) => (
          <div key={s} className={cx("brow", s === "declared" && on(p, "src-declared"))} data-anchor={s === "declared" ? "src-declared" : undefined}
            style={{ gridTemplateColumns: "22px minmax(0, 1fr) 110px 44px", padding: "10px 6px" }}>
            <span className="tick" style={{ background: i === 0 ? "var(--ink)" : "var(--paper)", color: i === 0 ? "var(--white)" : "var(--muted)" }}>{i + 1}</span>
            <span>{U.protSrc[s]}</span>
            <Bar v={F.protSrc[s] / N} grow={g} tone={i === 0 ? "ink" : ""} />
            <span className="v">{fmtInt(F.protSrc[s], p.lang)}</span>
          </div>
        ))}
        <div className="lock" style={{ marginTop: 14 }}><span className="ico">⇣</span><span>{p.lang === "fr" ? "Chaque source n'est essayée que si la précédente n'a rien donné." : "Each source is tried only when the one before it gave nothing."}</span></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card soft">
          <div className="ctitle">{U.checksDeclared}</div>
          {U.checksDeclaredList.map((c) => <div className="line-item" key={c}><span className="tick">✓</span>{c}</div>)}
        </div>
        <div className={cx("card", p.sub < 1 && "dim", on(p, "perpack"))} data-anchor="perpack">
          <div className="ctitle">{U.caught}<span className="chip bad">!</span></div>
          <div className="lbl" style={{ marginBottom: 10 }}>{pk.p.label}</div>
          <div className="grid3" style={{ gap: 10 }}>
            <div><div className="fmeta">{U.declared}</div><div className="big" style={{ fontSize: 26, color: "var(--red)" }}><s>{fmtNum(pk.p.prot_declared_bad ?? 0, p.lang, 1)}</s></div><div className="fmeta">g /100 g</div></div>
            <div><div className="fmeta">{U.energy}</div><div className="big" style={{ fontSize: 26 }}>{fmtInt(pk.impliedKcal, p.lang)}</div><div className="fmeta">≠ {fmtInt(pk.declaredKcal, p.lang)} kcal</div></div>
            <div><div className="fmeta">{U.kept}</div><div className="big" style={{ fontSize: 26, color: "var(--green)" }}>{fmtNum(pk.p.prot ?? 0, p.lang, 1)}</div><div className="fmeta">g · Open Food Facts</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 5 · plant / animal split
function Split(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const c = EX.crisps;
  const pl = (c.plant ?? 0) / (c.prot || 1);
  const ingr = (c.ingredients ?? "").split(/(whey powder \(milk\)|milk)/i);
  const N = F.funnel.measured;
  return (
    <div className="grid2" style={{ flex: 1, alignItems: "start" }}>
      <div className="card">
        <div className="ctitle">{c.brand}<span className="chip composite"><i />{VOCAB[p.lang].composite}</span></div>
        <div className="lbl" style={{ fontSize: 14 }}>{c.label}</div>
        <div className="fmeta" style={{ margin: "8px 0 16px", lineHeight: 1.5 }}>
          {ingr.map((s, i) => (/milk/i.test(s) ? <span key={i} className="hl">{s}</span> : <span key={i}>{s}</span>))}
        </div>
        <div className="line-item"><span style={{ flex: 1, color: "var(--muted)" }}>{U.origin}</span><span className="chip animal_core"><i />{U.originVal}</span></div>
        <div style={{ marginTop: 16 }} className={on(p, "split-bar")} data-anchor="split-bar">
          <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5, marginBottom: 8 }}>
            <span style={{ color: "var(--muted)" }}>{U.split}</span>
            <span className="num"><b style={{ color: "var(--green)" }}>{U.plant} {fmtPct(pl, p.lang, 0)}</b> · <span style={{ color: "var(--animal-ink)" }}>{U.animal} {fmtPct(1 - pl, p.lang, 0)}</span></span>
          </div>
          <div className="stack-bar" style={{ height: 34, borderRadius: 10 }}>
            <i style={{ flexBasis: g ? `${pl * 100}%` : "0%", background: "var(--plant)" }}>{fmtPct(pl, p.lang, 0)}</i>
            <i style={{ flexBasis: g ? `${(1 - pl) * 100}%` : "0%", background: "var(--animal)" }} />
          </div>
        </div>
        <div className="line-item" style={{ marginTop: 12 }}><span style={{ flex: 1, color: "var(--muted)" }}>{U.via}</span><b style={{ fontSize: 12.5 }}>{U.splitSrc.nevo} · {p.lang === "fr" ? "niveau" : "level"} {c.level}</b></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card soft">
          <div className="ctitle">{U.splitCascade}</div>
          {U.splitCascadeList.map((s, i) => <div className="line-item" key={s}><span className="tick" style={{ background: "var(--white)", color: "var(--ink)" }}>{i + 1}</span>{s}</div>)}
        </div>
        <div className={cx("card", p.sub < 1 && "dim")}>
          {([["A", F.levelA, F.levelAProtein, "level-a"], ["B", F.levelB, 1 - F.levelAProtein, ""]] as const).map(([lv, n, share, a]) => (
            <div key={lv} className={cx("brow", a && on(p, a))} data-anchor={a || undefined} style={{ gridTemplateColumns: "minmax(0, 1fr) 120px 60px", padding: "8px 6px" }}>
              <span><span className={cx("chip", lv === "A" ? "ink" : "")} style={{ marginRight: 8 }}>{lv}</span>{lv === "A" ? U.levelA.split("·")[1] : U.levelB.split("·")[1]}<span className="fmeta"> · {fmtInt(n, p.lang)} / {fmtInt(N, p.lang)}</span></span>
              <Bar v={share} grow={g && p.sub >= 1} tone={lv === "A" ? "ink" : "soft"} />
              <span className="v">{fmtPct(share, p.lang, 0)}</span>
            </div>
          ))}
          <div className="fmeta" style={{ padding: "4px 6px 0" }}>{p.lang === "fr" ? "Part des protéines vendues" : "Share of protein sold"}</div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 6 · volumes
function Volumes(p: P) {
  const U = UI_STR[p.lang];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", flex: 1 }}>
      <div className="card">
        <table className="t">
          <thead>
            <tr>
              <th>{U.volCols[0]}</th><th className="r">{U.volCols[1]}</th><th className="r">{U.volCols[2]}</th>
              <th className={cx("r", on(p, "mass"))} data-anchor="mass" style={{ borderRadius: 6 }}>{U.volCols[3]}</th>
            </tr>
          </thead>
          <tbody>
            {VOLUME_ROWS.map((r, i) => (
              <tr key={r.id} className="appear" style={{ animationDelay: `${i * 0.08}s` }}>
                <td><div className="lbl">{r.label}</div><div className="fmeta" style={{ fontSize: 11.5 }}>{dept(r.dept, p.lang)}</div></td>
                <td className="r">{fmtInt(r.units ?? 0, p.lang)}</td>
                <td className="r">× {fmtNum(r.weight, p.lang, r.weight < 1 ? 2 : 1)} kg</td>
                <td className="r"><b>{fmtInt((r.units ?? 0) * r.weight, p.lang)} kg</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fmeta" style={{ marginTop: 10 }}>{p.lang === "fr" ? `… et ${fmtInt(F.funnel.measured - VOLUME_ROWS.length, p.lang)} autres produits` : `… and ${fmtInt(F.funnel.measured - VOLUME_ROWS.length, p.lang)} more products`}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          {U.volChecks.map((c) => <div className="line-item" key={c}><span className="tick">✓</span>{c}</div>)}
        </div>
        <div className="lock" style={{ padding: 14 }}><span className="ico">🔒</span><span>{U.volLock}</span></div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 7 · calculate
function Results(p: P) {
  const U = UI_STR[p.lang];
  const V = VOCAB[p.lang];
  const wwfView = p.sub >= 1;
  const g = useGrow(wwfView);
  const ratio = useCount(wwfView ? F.wwfPlant : F.ptRatio, 1200, 0, wwfView);
  const depts = PT.byDept.slice(0, 6);
  const fgMax = Math.max(...FOOD_GROUPS.map((k) => WWF.byGroup[k].total));
  const ring = 2 * Math.PI * 34;
  return (
    <>
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <div className={cx("seg", on(p, "toggle"))} data-anchor="toggle">
          <span className={wwfView ? "" : "on"}>🌱 Protein Tracker</span>
          <span className={wwfView ? "on" : ""}>🌍 WWF</span>
        </div>
        <span className="dl">⇩ {U.download}</span>
      </div>
      <div className="banner">
        <div>
          <div className="tagrow"><b>{U.result}</b>{U.fy}</div>
          <div className="h">{wwfView ? U.wwfHeadline : U.ptHeadline}</div>
          <div className={cx("big", on(p, "result"))} data-anchor="result" style={{ display: "inline-block", borderRadius: 10, padding: "2px 6px", marginLeft: -6 }}>{fmtNum(ratio * 100, p.lang, 1)}<small>%</small></div>
          <div className="tagrow" style={{ marginTop: 6, letterSpacing: "0.06em", textTransform: "none" }}>
            {wwfView ? U.wwfNote : (p.lang === "fr"
              ? `${fmtNum(PT.plant / 1000, p.lang, 0)} t végétales sur ${fmtNum(PT.total / 1000, p.lang, 0)} t de protéines vendues`
              : `${fmtNum(PT.plant / 1000, p.lang, 0)} t plant out of ${fmtNum(PT.total / 1000, p.lang, 0)} t of protein sold`)}
          </div>
        </div>
        <svg width="96" height="96" viewBox="0 0 80 80" aria-hidden>
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(249,206,169,.9)" strokeWidth="9" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#bfe3c9" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${ring * ratio} ${ring}`} transform="rotate(-90 40 40)" />
        </svg>
      </div>
      {!wwfView ? (
        <div className="grid2" key="pt" style={{ flex: 1, minHeight: 0 }}>
          <div className="card appear">
            <div className="ctitle">{U.byClass}</div>
            <div className="stack-bar">
              {PT_CLASSES.map((c) => <i key={c} style={{ flexBasis: g ? `${(100 * PT.byClass[c]) / PT.total}%` : "0%", background: CLASS_COLOR[c] }}>{PT.byClass[c] / PT.total > 0.09 ? fmtPct(PT.byClass[c] / PT.total, p.lang, 0) : ""}</i>)}
            </div>
            <div className="legend">{PT_CLASSES.map((c) => <span key={c}><i style={{ background: CLASS_COLOR[c] }} />{UI_STR[p.lang].classes[c]}</span>)}</div>
          </div>
          <div className="card appear">
            <div className="ctitle">{U.byDept}</div>
            {depts.map((d) => (
              <div className="brow" key={d.dept} style={{ gridTemplateColumns: "minmax(0, 1fr) 130px 44px", padding: "3px 4px" }}>
                <span>{dept(d.dept, p.lang)}</span><Bar v={d.ratio} grow={g} /><span className="v">{fmtPct(d.ratio, p.lang, 0)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid2" key="wwf" style={{ flex: 1, minHeight: 0 }}>
          <div className="card appear">
            <div className="ctitle">{U.fgTitle}</div>
            {FOOD_GROUPS.map((k) => {
              const gr = WWF.byGroup[k];
              return (
                <div className="brow" key={k} style={{ gridTemplateColumns: "minmax(0, 1fr) 120px 56px", padding: "2px 4px" }}>
                  <span><b style={{ fontFamily: "var(--display)" }}>{k}</b> {V[k]}</span>
                  <div className="track" style={{ display: "flex" }}>
                    <i style={{ width: g ? `${(100 * gr.plant) / fgMax}%` : 0, borderRadius: 0 }} />
                    <i className="peach" style={{ width: g ? `${(100 * gr.animal) / fgMax}%` : 0, borderRadius: 0 }} />
                  </div>
                  <span className="v">{fmtInt(gr.total, p.lang)} t</span>
                </div>
              );
            })}
          </div>
          <div className="card appear">
            <div className="ctitle">{U.wholeComp}</div>
            <div className="stack-bar">
              <i style={{ flexBasis: g ? `${F.wwfWhole * 100}%` : "0%", background: "var(--ink)" }}>{fmtPct(F.wwfWhole, p.lang, 0)}</i>
              <i style={{ flexBasis: g ? `${(1 - F.wwfWhole) * 100}%` : "0%", background: "var(--comp)" }} />
            </div>
            <div className="legend"><span><i style={{ background: "var(--ink)" }} />{V.whole}</span><span><i style={{ background: "var(--comp)" }} />{V.composite_s}</span></div>
            <div className="ctitle" style={{ marginTop: 16 }}>{U.cats}</div>
            {Object.entries(WWF.byCategory).map(([k, v]) => (
              <div className="brow" key={k} style={{ gridTemplateColumns: "minmax(0, 1fr) 110px 50px", padding: "2px 4px" }}>
                <span>{V[k]}</span><Bar v={v / WWF.compositeT} grow={g} tone="lav" /><span className="v">{fmtInt(v, p.lang)} t</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ------------------------------------------------------------ 8 · check
const CHECKS: Record<Lang, string[]> = {
  en: ["Animal core carries no plant protein", "Plant classes carry no animal protein", "A composite carries both", "Plant + animal = total, row by row", "Level B composites follow 50/50", "Each total equals the sum of its block", "Every table covers every value of its column", "Energy balance of declared values", "No food group on a WWF composite", "Sub-groups only in FG1, FG2, FG3, FG5", "×10 factor on cheese only", "Every formula recomputed outside the workbook"],
  fr: ["Animal core sans protéine végétale", "Classes végétales sans protéine animale", "Un composite porte les deux", "Végétal + animal = total, ligne à ligne", "Composites de niveau B à 50/50", "Chaque total égale la somme de son bloc", "Chaque tableau couvre toutes les valeurs de sa colonne", "Bilan énergétique des valeurs déclarées", "Pas de groupe sur un composite WWF", "Sous-groupes seulement en FG1, FG2, FG3, FG5", "Facteur ×10 sur le fromage seulement", "Chaque formule recalculée hors du classeur"],
};
function Checks(p: P) {
  const U = UI_STR[p.lang];
  const list = CHECKS[p.lang];
  const done = p.sub >= 1;
  const e = EX.emmental;
  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="ctitle">
        {U.checks}
        <span className={cx("chip", done ? "ok" : "bad", on(p, "checks-pass"))} data-anchor="checks-pass">{done ? `✓ ${fill(U.allPassed, { n: list.length })}` : `1 ${U.fabricated.toLowerCase()}`}</span>
      </div>
      <div className={cx("lock", !done && on(p, "check-fail"))} data-anchor="check-fail"
        style={{ background: done ? "var(--green-soft)" : "#fbe4df", marginBottom: 12, transition: "background .5s" }}>
        <span className="ico" style={{ background: done ? "var(--green)" : "var(--red)" }}>{done ? "✓" : "✕"}</span>
        <span>
          <b>{list[0]}</b> · {done
            ? `${U.fabricated} — ${p.lang === "fr" ? "rétabli, le contrôle repasse au vert" : "restored, the check is green again"}`
            : <>{U.fabricated} : <span className="lbl">{e.label}</span> · {p.lang === "fr" ? "végétal" : "plant"} 0,8 g → {U.failedAsExpected}</>}
        </span>
      </div>
      <div className="grid2" style={{ gap: "0 28px" }}>
        {list.map((c, i) => (
          <div className="line-item" key={c}>
            <span className={cx("tick", !done && i === 0 && "no", !done && i > 0 && "wait")}>{done ? "✓" : i === 0 ? "✕" : "·"}</span>
            <span style={{ flex: 1 }}>{c}</span>
          </div>
        ))}
      </div>
      <div className="fmeta" style={{ marginTop: 12, opacity: done ? 1 : 0, transition: "opacity .5s" }}>{U.formulas}</div>
    </div>
  );
}

// ------------------------------------------------------------ 9 · measure accuracy
function Accuracy(p: P) {
  const U = UI_STR[p.lang];
  return (
    <div className="grid2" style={{ flex: 1 }}>
      <div className="card">
        <div className="ctitle">{U.sample}<span className={cx("chip ink", on(p, "sealed"))} data-anchor="sealed">🔒 {U.sealedBadge}</span></div>
        <div className="dots">
          {Array.from({ length: 200 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 20) * 0.015 + Math.floor(i / 20) * 0.04}s` }} />)}
        </div>
        <div className="fmeta" style={{ marginTop: 14 }}>{U.sampleMeta}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <div className="ctitle">{U.perField}</div>
          {U.accFields.map((f) => (
            <div className="line-item" key={f}><span className="tick" style={{ background: "var(--lav-soft)", color: "var(--lav-ink)" }}>✎</span><span style={{ flex: 1 }}>{f}</span><span className="fmeta">{U.perFieldNote}</span></div>
          ))}
        </div>
        <div className="lock" style={{ padding: 14 }}><span className="ico">👤</span><span>{U.reviewer}</span></div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 10 · deliver
function Deliver(p: P) {
  const U = UI_STR[p.lang];
  const scope = fill(U.scopeText, { measured: F.funnel.measured, nonFood: F.funnel.nonFood, tests: F.funnel.tests, unsold: F.funnel.unsold });
  const rows = VOLUME_ROWS.slice(0, 4);
  return (
    <div className="grid3" style={{ flex: 1, alignItems: "start" }}>
      <div className={cx("card", p.sub === 1 && "dim", on(p, "workbook"))} data-anchor="workbook">
        <div className="file"><div className="fico" style={{ background: "var(--green)" }}>XLSX</div><div><div className="fname">{U.files.workbook[0]}</div><div className="fmeta">{U.files.workbook[1]}</div></div></div>
        <div className="sheet">
          <span className="h">{U.volCols[0]}</span><span className="h in">{U.input}</span><span className="h">kg</span><span className="h">{p.lang === "fr" ? "Prot. vég." : "Plant prot."}</span>
          {rows.map((r) => (
            <span key={r.id} style={{ display: "contents" }}>
              <span>{r.name.split(",")[0]}</span><span className="in">{fmtInt(r.units ?? 0, p.lang)}</span><span className="f">=B×C</span><span className="f">=D×E</span>
            </span>
          ))}
        </div>
      </div>
      <div className={cx("card", p.sub === 0 && "dim", on(p, "csv-file"))} data-anchor="csv-file">
        <div className="file"><div className="fico" style={{ background: "var(--ink)" }}>CSV</div><div><div className="fname">{U.files.csv[0]}</div><div className="fmeta">{U.files.csv[1]}</div></div></div>
        <div style={{ marginTop: 12 }}>
          {(p.lang === "fr" ? ["Classe Protein Tracker", "Groupe et structure WWF", "Protéines /100 g · source", "Végétal / animal · niveau A ou B", "Poids net · source"] : ["Protein Tracker class", "WWF group and structure", "Protein /100 g · source", "Plant / animal · level A or B", "Net weight · source"]).map((c) => (
            <div className="line-item" key={c}><span className="tick">✓</span>{c}</div>
          ))}
        </div>
      </div>
      <div className={cx("card", p.sub === 0 && "dim", on(p, "csv-file"))}>
        <div className="file"><div className="fico" style={{ background: "var(--lav-ink)" }}>DOC</div><div><div className="fname">{U.files.scope[0]}</div><div className="fmeta">{U.files.scope[1]}</div></div></div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)", background: "var(--bg)", borderRadius: 12, padding: 12, margin: "12px 0 0" }}>{scope}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 11 · build on each engagement
function RefBase(p: P) {
  const U = UI_STR[p.lang];
  const n = useCount(F.knownBefore + F.newToBase, 1600, F.knownBefore);
  return (
    <div className="grid2" style={{ flex: 1 }}>
      <div className={cx("card", on(p, "refbase"))} style={{ display: "flex", flexDirection: "column", paddingTop: 22 }}>
        <div className="ctitle">{U.refbase}<span className="chip">{U.keyed}</span></div>
        <div className="counter">{fmtInt(n, p.lang)}</div>
        <div className="fmeta" style={{ marginTop: 6 }}>{U.eans}</div>
        <div className="chip ok" data-anchor="refbase" style={{ alignSelf: "flex-start", marginTop: 16 }}>{fill(U.fromThis, { n: fmtInt(F.newToBase, p.lang) })}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="card">
          <div className="ctitle">{U.goesIn}</div>
          {U.goesInList.map((x) => <div className="line-item" key={x}><span className="tick">✓</span>{x}</div>)}
        </div>
        <div className="card">
          <div className="ctitle">{U.neverIn}</div>
          {U.neverInList.map((x) => <div className="line-item" key={x}><span className="tick no">✕</span>{x}</div>)}
        </div>
      </div>
    </div>
  );
}

const SCENES: Record<Scene, (p: P) => ReactNode> = {
  import: Import, scope: Scope, classify: Classify, protein: Protein, split: Split, volumes: Volumes,
  results: Results, checks: Checks, accuracy: Accuracy, deliver: Deliver, refbase: RefBase,
};

export function SceneView({ scene, ...p }: P & { scene: Scene }) {
  const C = SCENES[scene];
  return <C {...p} />;
}
