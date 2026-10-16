import { useEffect, useState, type ReactNode } from "react";
import type { Lang, Product, PtClass } from "./lib/types";
import { UI_STR, dept, fill } from "./lib/i18n";
import { fmtInt, fmtNum, fmtPct, PT_CLASSES, hasIssue } from "./lib/calc";
import { AISLES, CLASS_COUNT, CLASS_TILES, CRISPS, DEPT_ICON, F, IMPORT_TILES, REVIEW, icon, shortName } from "./lib/facts";
import type { Scene } from "./tour";

interface P { sub: number; anchor: string; lang: Lang }

// ------------------------------------------------------------ helpers
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const on = (p: P, id: string) => (p.anchor === id ? "focus" : "");

function useGrow(dep: unknown = 0) {
  const [g, setG] = useState(false);
  useEffect(() => {
    setG(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setG(true)));
    return () => cancelAnimationFrame(id);
  }, [dep]);
  return g;
}

function useCount(to: number, ms = 1200, dep: unknown = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, dep]);
  return v;
}

const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};

function Ring({ value, size, stroke, track, color, children }: { value: number; size: number; stroke: number; track: string; color: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * Math.max(0.001, value)} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-in">{children}</div>
    </div>
  );
}

function Tile({ p, i, badge, out }: { p: Product; i: number; badge?: ReactNode; out?: boolean }) {
  return (
    <div className={cx("tile", out && "out")} style={{ animationDelay: `${i * 0.035}s` }}>
      <span className="em">{icon(p)}</span>
      <span className="nm">{shortName(p)}</span>
      {badge}
    </div>
  );
}

// ------------------------------------------------------------ 1 · import (steps 1–2)
function Import(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const n = useCount(F.rows, 900);
  const outOf = (x: Product) => p.sub >= 1 && (x.dept === "Household" || hasIssue(x, "no_sales") || hasIssue(x, "test_item"));
  const rows: [keyof typeof U.fillCols, number][] = [["ingredients", F.fill.ingredients], ["protein", F.fill.protein], ["weight", F.fill.weight]];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "330px minmax(0, 1fr)", flex: 1, minHeight: 0 }}>
      <div className="col">
        <div className={cx("card", on(p, "file"))} data-anchor="file">
          <div className="file">
            <div className="fico" style={{ background: "var(--green)" }}>CSV</div>
            <div style={{ minWidth: 0 }}>
              <div className="fname" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>harbour_market_catalogue.csv</div>
              <div className="fmeta"><b className="big" style={{ fontSize: 22, color: "var(--ink)" }}>{fmtInt(n, p.lang)}</b> {U.products}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ctitle">{U.completeness}</div>
          {rows.map(([k, v]) => (
            <div key={k} className="brow" style={{ gridTemplateColumns: "minmax(0, 1fr) 90px 40px" }}>
              <span>{U.fillCols[k]}</span>
              <div className="track"><i className="peach" style={{ width: g ? `${v * 100}%` : 0 }} /></div>
              <span className="v">{fmtPct(v, p.lang, 0)}</span>
            </div>
          ))}
        </div>
        <div className={cx("card", p.sub < 1 && "dim", on(p, "scope"))} data-anchor="scope">
          <div className="big" style={{ fontSize: 40, color: "var(--green)" }}>{fmtInt(F.funnel.measured, p.lang)}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{fill(U.kept, { n: "" }).trim()}</div>
          <div className="fmeta" style={{ marginTop: 6 }}>{fill(U.setAside, { n: F.setAside })}</div>
        </div>
      </div>
      <div className="card tiles-card">
        <div className="tiles">
          {IMPORT_TILES.map((x, i) => (
            <Tile key={x.id} p={x} i={i} out={outOf(x)}
              badge={outOf(x) ? <span className="tb bad">✕</span> : x.prot_src !== "declared" && x.dept !== "Household" ? <span className="tb">?</span> : null} />
          ))}
        </div>
        <div className="legend" style={{ marginTop: 12 }}><span><i style={{ background: "var(--peach)" }} />? {U.fillCols.protein.toLowerCase()} · {U.missing}</span></div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 2 · classify (step 3)
function Classify(p: P) {
  const U = UI_STR[p.lang];
  return (
    <>
      <div className="buckets" data-anchor="buckets">
        {PT_CLASSES.map((c, ci) => (
          <Bucket key={c} c={c} ci={ci} lang={p.lang} focus={p.anchor === "buckets"} />
        ))}
      </div>
      <div className={cx("card review-strip", p.sub < 1 && "dim", on(p, "review"))} data-anchor="review">
        <div className="ctitle" style={{ margin: 0, minWidth: 120 }}>{U.toReview}<span className="chip warn" style={{ marginLeft: 8 }}>{REVIEW.length}</span></div>
        <div className="mini-row">
          {REVIEW.map((x) => (
            <span className="mini" key={x.id} title={shortName(x)}>{icon(x)}<span className="q">?</span></span>
          ))}
        </div>
      </div>
    </>
  );
}

function Bucket({ c, ci, lang, focus }: { c: PtClass; ci: number; lang: Lang; focus: boolean }) {
  const U = UI_STR[lang];
  const n = useCount(CLASS_COUNT[c], 1300);
  const tiles = CLASS_TILES[c];
  return (
    <div className={cx("bucket", focus && "lit")} style={{ ["--c" as string]: CLASS_COLOR[c] }}>
      <div className="bhead">
        <span className="bdot" />
        <span className="bname">{U.classes[c]}</span>
      </div>
      <div className="big bcount">{fmtInt(n, lang)}</div>
      <div className="bhint">{U.classHint[c]}</div>
      <div className="bgrid">
        {tiles.slice(0, 8).map((x, i) => (
          <span className="mini drop" key={x.id} title={shortName(x)} style={{ animationDelay: `${0.25 + ci * 0.12 + i * 0.05}s` }}>{icon(x)}</span>
        ))}
      </div>
      {CLASS_COUNT[c] > 8 && <div className="bmore">+{fmtInt(CLASS_COUNT[c] - 8, lang)}</div>}
    </div>
  );
}

// ------------------------------------------------------------ 3 · protein (steps 4–5)
function Protein(p: P) {
  const U = UI_STR[p.lang];
  const pl = F.crispsPlant;
  const ingr = (CRISPS.ingredients ?? "").split(/(whey powder \(milk\)|milk)/i);
  const declared = CRISPS.prot_src === "declared";
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", flex: 1, minHeight: 0 }}>
      <div className="card product">
        <div className="pemoji">{icon(CRISPS)}</div>
        <div className="fmeta" style={{ textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 600, fontSize: 11 }}>{CRISPS.brand}</div>
        <div className="pname">{shortName(CRISPS)}</div>
        <div className="ctitle" style={{ marginTop: 18 }}>{U.ingredients}</div>
        <p className="pingr">{ingr.map((s, i) => (/milk/i.test(s) ? <span key={i} className="hl">{s}</span> : <span key={i}>{s}</span>))}</p>
        <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 18 }}>
          <span className="chip animal_core"><i />{U.contains}</span>
          <span className="chip">{U.originAnimal}</span>
        </div>
      </div>
      <div className="col">
        <div className={cx("card", on(p, "prot-value"))} data-anchor="prot-value">
          <div className="ctitle">{U.protein}<span className={cx("chip", declared ? "" : "ok")}>{declared ? U.declared : `✓ ${U.completed}`}</span></div>
          <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
            <span className="big" style={{ fontSize: 46 }}>{fmtNum(CRISPS.prot ?? 0, p.lang, 1)}</span>
            <span className="fmeta">{U.per100}</span>
          </div>
          <div className="fmeta" style={{ marginTop: 6 }}>{fill(U.from, { s: declared ? U.sourceDecl : U.sourceOff })}</div>
        </div>
        <div className={cx("card", p.sub < 1 && "dim", on(p, "split"))} data-anchor="split" style={{ flex: 1 }}>
          <div className="ctitle">{U.split}</div>
          <div className="row" style={{ alignItems: "center", gap: 22 }}>
            <Ring value={p.sub >= 1 ? pl : 0} size={136} stroke={16} track="var(--peach)" color="var(--plant)">
              <b className="big" style={{ fontSize: 30 }}>{fmtPct(pl, p.lang, 0)}</b>
              <span className="fmeta">{U.plant.toLowerCase()}</span>
            </Ring>
            <div className="col" style={{ gap: 10 }}>
              <span className="legend" style={{ margin: 0 }}><span><i style={{ background: "var(--plant)" }} />{U.plant} · {fmtPct(pl, p.lang, 0)}</span></span>
              <span className="legend" style={{ margin: 0 }}><span><i style={{ background: "var(--peach)" }} />{U.animal} · {fmtPct(1 - pl, p.lang, 0)}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 4 · ratio (steps 6–7)
function Ratio(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const v = useCount(F.ptRatio, 1400);
  const w = useCount(F.wwfPlant, 1400);
  return (
    <div className="grid2" style={{ gridTemplateColumns: "360px minmax(0, 1fr)", flex: 1, minHeight: 0 }}>
      <div className="col">
        <div className={cx("hero", on(p, "ring"))} data-anchor="ring">
          <span className="htag">{U.ptTag}</span>
          <Ring value={v} size={190} stroke={20} track="rgba(249,206,169,.9)" color="#bfe3c9">
            <b className="big" style={{ fontSize: 46, color: "var(--white)" }}>{fmtNum(v * 100, p.lang, 1)}<small style={{ fontSize: 20 }}>%</small></b>
          </Ring>
          <div className="hlabel">{U.ratioHead}</div>
        </div>
        <div className="card">
          <div className="ctitle">{U.wwfTag}<span className="chip ok">{fmtNum(w * 100, p.lang, 1)} %</span></div>
          <div className="fmeta">{U.wwfHead}</div>
        </div>
      </div>
      <div className={cx("card", p.sub < 1 && "dim", on(p, "aisles"))} data-anchor="aisles">
        <div className="ctitle">{U.byAisle}<span className="legend" style={{ margin: 0 }}><span><i style={{ background: "var(--plant)" }} />{U.plant}</span><span><i style={{ background: "var(--peach)" }} />{U.animal}</span></span></div>
        {AISLES.map((a) => (
          <div className="aisle" key={a.dept}>
            <span className="aem">{DEPT_ICON[a.dept]}</span>
            <span className="anm">{dept(a.dept, p.lang)}<small>{fmtNum(a.total / 1000, p.lang, 0)} {U.tonnes}</small></span>
            <div className="abar">
              <i style={{ width: g ? `${a.ratio * 100}%` : 0, background: "var(--plant)" }} />
              <i style={{ width: g ? `${(1 - a.ratio) * 100}%` : 0, background: "var(--peach)" }} />
            </div>
            <b className="apct">{fmtPct(a.ratio, p.lang, 0)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 5 · deliver (steps 8–11)
function Deliver(p: P) {
  const U = UI_STR[p.lang];
  const rows = [CRISPS, ...IMPORT_TILES.filter((x) => x.in_scope).slice(0, 4)];
  return (
    <div className="grid2" style={{ flex: 1, minHeight: 0 }}>
      <div className={cx("card", on(p, "excel"))} data-anchor="excel">
        <div className="file">
          <div className="fico" style={{ background: "var(--green)" }}>XLSX</div>
          <div style={{ minWidth: 0 }}><div className="fname" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{U.file}</div><div className="fmeta">{U.fileMeta}</div></div>
        </div>
        <div className="sheet">
          <span className="h" />
          <span className="h in">{U.volumes}</span>
          <span className="h">{U.protein}</span>
          <span className="h">{U.plant}</span>
          {rows.map((x) => (
            <span key={x.id} style={{ display: "contents" }}>
              <span>{icon(x)} {shortName(x)}</span>
              <span className="in">{fmtInt(x.units ?? 0, p.lang)}</span>
              <span>{fmtNum(x.prot ?? 0, p.lang, 1)} g</span>
              <span style={{ color: "var(--green)", fontWeight: 600 }}>{fmtPct((x.plant ?? 0) / (x.prot || 1), p.lang, 0)}</span>
            </span>
          ))}
        </div>
        <div className="ctitle" style={{ marginTop: 18 }}>{U.checked}</div>
        {U.checks.map((c) => <div className="line-item" key={c}><span className="tick">✓</span>{c}</div>)}
      </div>
      <div className={cx("card privacy", p.sub < 1 && "dim", on(p, "privacy"))} data-anchor="privacy">
        <div className="lockbig">🔒</div>
        <div className="pname" style={{ fontSize: 26 }}>{U.privacyTitle}</div>
        <div style={{ marginTop: 16 }}>
          {U.privacy.map((c) => <div className="line-item" key={c}><span className="tick">✓</span>{c}</div>)}
        </div>
      </div>
    </div>
  );
}

const SCENES: Record<Scene, (p: P) => ReactNode> = { import: Import, classify: Classify, protein: Protein, ratio: Ratio, deliver: Deliver };

export function SceneView({ scene, ...p }: P & { scene: Scene }) {
  const C = SCENES[scene];
  return <C {...p} />;
}
