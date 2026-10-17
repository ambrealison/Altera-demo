import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Lang, Product, PtClass } from "./lib/types";
import { UI_STR, fill } from "./lib/i18n";
import { PRODUCTS, PT_CLASSES, FOOD_GROUPS, fmtInt, fmtNum } from "./lib/calc";
import { CRISPS, F, PER_PACK, PROT_COUNT, PT, ROUTE_COUNT, WWF } from "./lib/facts";
import type { Scene } from "./tour";

// Every screen of the tour has two numbered parts, 1 and 2, and the explanation beside
// the window has one paragraph for each: nothing is shown that the text does not explain.
// The screens show proportions; the only figures are those of single example products.

interface P { lang: Lang }

// ------------------------------------------------------------ helpers
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

function useGrow() {
  const [g, setG] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setG(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return g;
}

export const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};
const CAT_COLOR: Record<string, string> = { meat_based: "var(--animal)", seafood_based: "var(--sky)", vegetarian: "var(--plant-2)", vegan: "var(--plant)" };

// line icons, 1.6 stroke
const Ico = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
const I = {
  sheet: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M4 15h16M10 4v16",
  table: "M4 6h16M4 12h16M4 18h16M8 6v12",
  doc: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h3",
  report: "M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5M9 17v-3M12 17v-6M15 17v-2",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  check: "M5 12.5l4.2 4.2L19 7",
  cross: "M7 7l10 10M17 7L7 17",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0",
  bolt: "M13 3L5 13h6l-1 8 8-10h-6z",
};

function Bar({ v, color = "var(--green)", grow, h = 8 }: { v: number; color?: string; grow: boolean; h?: number }) {
  return <div className="track" style={{ height: h }}><i style={{ width: grow ? `${Math.max(0, Math.min(1, v)) * 100}%` : 0, background: color }} /></div>;
}
/** Plant and animal side by side; widths are fractions of the whole bar. */
function Split({ plant, animal, grow, h = 10 }: { plant: number; animal: number; grow: boolean; h?: number }) {
  return (
    <div className="abar" style={{ height: h }}>
      <i style={{ width: grow ? `${plant * 100}%` : 0, background: "var(--plant)" }} />
      <i style={{ width: grow ? `${animal * 100}%` : 0, background: "var(--animal)" }} />
    </div>
  );
}
function Ring({ value, size, stroke, track, color }: { value: number; size: number; stroke: number; track: string; color: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} aria-hidden className="ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${c * Math.max(0.001, value)} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}
/** A numbered part of the screen; its number matches a paragraph of the explanation. */
const Card = ({ n, title, aside, children, className, style }: { n: 1 | 2; title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; style?: CSSProperties }) => (
  <div className={cx("card", className)} style={style}>
    <div className="ctitle"><span className="ct"><span className="nb">{n}</span>{title}</span>{aside}</div>
    {children}
  </div>
);
const Legend = ({ items }: { items: [string, string][] }) => (
  <span className="legend">{items.map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}</span>
);
const find = (id: string) => PRODUCTS.find((p) => p.id === id)!;
const kgOf = (p: Product) => (p.units ?? 0) * p.weight;

// ------------------------------------------------------------ 1 · data received
function Receive({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const N = PRODUCTS.length;
  const fills: [keyof typeof U.fillCols, number][] = [
    ["code", PRODUCTS.filter((p) => p.code_kind === "ean").length / N],
    ["label", F.fill.label], ["weight", F.fill.weight], ["ingredients", F.fill.ingredients], ["protein", F.fill.protein], ["volumes", F.fill.volumes],
  ];
  const color = (v: number) => (v > 0.95 ? "var(--ink)" : v > 0.75 ? "var(--green-2)" : "var(--animal)");
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }}>
      <Card n={1} title={U.files}>
        {[["harbour_market_catalogue.csv", U.catalogueFile], ["harbour_market_sales_2026.csv", U.salesFile]].map(([f, d]) => (
          <div className="file" key={f}>
            <span className="fico"><Ico d={I.sheet} size={20} /></span>
            <div style={{ minWidth: 0 }}><div className="fname mono">{f}</div><div className="fmeta">{d}</div></div>
          </div>
        ))}
        <div className="pillnote"><Ico d={I.lock} size={14} />{U.archived}</div>
      </Card>
      <Card n={2} title={U.inventory}>
        {fills.map(([k, v]) => (
          <div key={k} className="brow"><span>{U.fillCols[k]}</span><Bar v={v} grow={g} color={color(v)} /></div>
        ))}
        <div className="brow sep"><span><b>{U.known}</b></span><Bar v={ROUTE_COUNT.inherited / F.funnel.measured} grow={g} color="var(--comp)" /></div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 2 · scope
function Scope({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const N = F.funnel.received;
  const mince = find("HM00012"), pears = find("HM00007"), plantMince = find("HM00030"), cucumber = find("HM00004");
  const kg = (v: number) => `${fmtNum(v, lang, v < 1 ? 2 : 1)} kg`;
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
      <Card n={1} title={U.whatCounts}>
        <div className="wf">
          <div className="wf-row"><span>{U.received}</span><div className="wf-bar"><i style={{ width: g ? "100%" : 0, background: "var(--ink)" }} /></div></div>
          {[U.nonFood, U.tests, U.unsold].map((k) => <div className="wf-cut" key={k}>× {k}</div>)}
          <div className="wf-row"><span>{U.ptScope}</span><div className="wf-bar"><i style={{ width: g ? `${(100 * F.funnel.measured) / N}%` : 0, background: "var(--green)" }} /></div></div>
          <div className="wf-cut">× {U.appendixA}</div>
          <div className="excl">{Object.values(U.excl).map((e) => <span key={e}>{e}</span>)}</div>
          <div className="wf-row"><span>{U.wwfScope}</span><div className="wf-bar"><i style={{ width: g ? `${(100 * F.funnel.wwf) / N}%` : 0, background: "var(--comp)" }} /></div></div>
        </div>
      </Card>
      <Card n={2} title={U.codesWeights}>
        <div className="sub-t">{U.codes}</div>
        <div className="exrow"><span className="mono">{mince.code}</span><span className="chip ok"><Ico d={I.check} size={12} />{U.validEan}</span></div>
        <div className="exrow"><span className="mono">{pears.code}</span><span className="chip">{U.internalCode}</span></div>
        <div className="sub-t" style={{ marginTop: 16 }}>{U.weights}</div>
        <div className="exrow col"><span className="mono">{plantMince.label}</span><span>{fill(U.fromLabel, { w: kg(plantMince.weight) })}</span></div>
        <div className="exrow col"><span className="mono">{cucumber.label}</span><span>{fill(U.defaultWeight, { w: kg(cucumber.weight) })}</span></div>
        <div className="exrow col"><span className="mono">{pears.label}</span><span>{U.byWeight}</span></div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 3 · classification
const EXAMPLES = [
  "HM00012",                                                                  // beef mince
  PRODUCTS.find((p) => p.in_scope && p.pt === "plant_core" && /lentil/i.test(p.name))?.id ?? "HM00030",
  "HM00035",                                                                  // wholemeal bread
  "HM00113",                                                                  // beef lasagne
  "HM00140",                                                                  // cheese & onion crisps
];
function Classify({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const routes = [["inherited", "var(--ink)"], ["stratum", "var(--comp)"], ["model", "var(--green)"]] as const;
  const wwf = (p: Product) => p.wwf.struct === "composite"
    ? `${U.composite} · ${U.cat[p.wwf.cat ?? ""]}`
    : `${p.wwf.fg} · ${U.origin[p.wwf.src ?? ""]}`;
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)" }}>
      <Card n={1} title={U.twoClasses}>
        <div className="ctable">
          <span className="h">{U.product}</span><span className="h">WWF</span><span className="h">Protein Tracker</span>
          {EXAMPLES.map(find).map((p) => (
            <span key={p.id} style={{ display: "contents" }}>
              <span className="pn">{p.name.replace(/, [^,]*$/, "")}</span>
              <span><span className={cx("chip", p.wwf.struct === "composite" ? "composite" : p.wwf.src === "plant" ? "plant_core" : "animal_core")}>{wwf(p)}</span></span>
              <span><span className={cx("chip", p.pt)}><i />{U.classes[p.pt!]}</span></span>
            </span>
          ))}
        </div>
      </Card>
      <Card n={2} title={U.sourcesTitle}>
        <div className="seg-bar">
          {routes.map(([r, col]) => <i key={r} style={{ flexBasis: g ? `${(100 * ROUTE_COUNT[r]) / F.funnel.measured}%` : "0%", background: col }} />)}
        </div>
        <ol className="steps">
          {routes.map(([r, col]) => (
            <li key={r}><span className="sq" style={{ background: col }} /><div><b>{U.sources[r][0]}</b><span>{U.sources[r][1]}</span></div></li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 4 · protein content
function Protein({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const N = F.funnel.measured;
  const order = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"] as const;
  const pp = PER_PACK.p;
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)" }}>
      <Card n={1} title={U.cascade}>
        {order.map((s, i) => (
          <div key={s} className="casc">
            <span className={cx("cidx", i === 0 && "first")}>{i + 1}</span>
            <span className="cl">{U.protSrc[s]}</span>
            <Bar v={PROT_COUNT[s] / N} grow={g} color={i === 0 ? "var(--ink)" : "var(--green-2)"} h={6} />
          </div>
        ))}
        <div className="fmeta" style={{ marginTop: 12 }}>{U.keepsSource}</div>
      </Card>
      <Card n={2} title={U.plausibility}>
        <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{pp.label}</div>
        <div className="checkline"><span className="ibox sm bad"><Ico d={I.cross} size={14} /></span>{fill(U.declaredLine, { v: fmtNum(pp.prot_declared_bad ?? 0, lang, 1) })}</div>
        <div className="checkline"><span className="ibox sm"><Ico d={I.bolt} size={14} /></span>{fill(U.energyLine, { a: fmtInt(PER_PACK.impliedKcal, lang), b: fmtInt(PER_PACK.declaredKcal, lang) })}</div>
        <div className="checkline"><span className="ibox sm ok"><Ico d={I.check} size={14} /></span>{fill(U.keptLine, { v: fmtNum(pp.prot ?? 0, lang, 1), s: U.protSrc[pp.prot_src ?? "reference_base"] })}</div>
        <div className="formula mono">{lang === "fr" ? "4 × P + 9 × L + 4 × G ≈ kcal" : "4 × P + 9 × F + 4 × C ≈ kcal"}</div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 5 · plant / animal split
function SplitScene({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const ingr = (CRISPS.ingredients ?? "").split(/(whey powder \(milk\)|milk)/i);
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)" }}>
      <Card n={1} title={CRISPS.brand}>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>{CRISPS.label}</div>
        <div className="sub-t">{U.ingredients}</div>
        <p className="pingr">{ingr.map((s, i) => (/milk/i.test(s) ? <mark key={i}>{s}</mark> : <span key={i}>{s}</span>))}</p>
        <dl className="spec">
          <dt>{U.wwfOrigin}</dt><dd><span className="chip animal_core"><i />{U.originVal}</span></dd>
          <dt>{U.splitTitle}</dt>
          <dd>
            <Split plant={F.crispsPlant} animal={1 - F.crispsPlant} grow={g} h={12} />
            <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5, marginTop: 6 }}>
              <b style={{ color: "var(--green)" }}>{U.plant}</b><span style={{ color: "var(--animal-ink)" }}>{U.animal}</span>
            </div>
          </dd>
          <dt>{U.method}</dt><dd>{U.methodVal}</dd>
        </dl>
      </Card>
      <Card n={2} title={U.howSplit}>
        <ol className="steps num">
          {U.splitSteps.map(([h, d], i) => (
            <li key={h}><span className="cidx">{i + 1}</span><div><b>{h}<span className={cx("lv", i < 3 ? "a" : "b")}>{i < 3 ? "A" : "B"}</span></b><span>{d}</span></div></li>
          ))}
        </ol>
        <div className="sub-t" style={{ marginTop: 14 }}>{U.levelsBar}</div>
        <div className="seg-bar" style={{ height: 26 }}>
          <i style={{ flexBasis: g ? `${F.levelA * 100}%` : "0%", background: "var(--ink)" }}><span>A</span></i>
          <i style={{ flexBasis: g ? `${(1 - F.levelA) * 100}%` : "0%", background: "var(--paper)", color: "var(--ink)" }}><span>B</span></i>
        </div>
        <Legend items={[["var(--ink)", U.levelA], ["var(--paper)", U.levelB]]} />
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 6 · volumes
function Volumes({ lang }: P) {
  const U = UI_STR[lang];
  const p = find("HM00012");
  const [u, w, k] = U.formulaKg;
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
      <Card n={1} title={U.withVolumes}>
        <div className="eq">
          <span className="eqb">{u}</span><span className="op">×</span><span className="eqb">{w}</span><span className="op">=</span><span className="eqb strong">{k}</span>
        </div>
        <div className="exline">
          <span className="mono">{p.label}</span>
          <span className="mono">{fmtInt(p.units ?? 0, lang)} × {fmtNum(p.weight, lang, 3)} kg = {fmtInt(kgOf(p), lang)} kg</span>
        </div>
        <div className="checkchips">{U.volChecks.map((c) => <span key={c}><Ico d={I.check} size={14} />{c}</span>)}</div>
      </Card>
      <Card n={2} title={U.withRanks}>
        <svg className="curve" viewBox="0 0 320 170" role="img" aria-label={U.curveNote}>
          <line x1="34" y1="140" x2="310" y2="140" />
          <line x1="34" y1="10" x2="34" y2="140" />
          <path d="M40 18 C 70 70, 110 104, 170 120 S 270 134, 306 136" />
          {[[44, 26], [62, 55], [86, 80], [118, 99], [160, 114], [214, 125], [268, 131]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.5" />)}
          <text x="310" y="160" textAnchor="end">{U.axisRank} →</text>
          <text x="22" y="14" textAnchor="end" transform="rotate(-90 22 14)">{U.axisKg} →</text>
        </svg>
        <div className="fmeta" style={{ margin: "4px 0 10px" }}>{U.curveNote}</div>
        <div className="chip ok wrap"><Ico d={I.check} size={12} />{U.accept}</div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 7 · WWF ratio
function Wwf({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const max = Math.max(...FOOD_GROUPS.map((k) => WWF.byGroup[k].total));
  const cats = Object.keys(WWF.byCategory);
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 0.7fr)" }}>
      <Card n={1} title={U.byGroup} aside={<Legend items={[["var(--plant)", U.plant], ["var(--animal)", U.animal]]} />}>
        {FOOD_GROUPS.map((k) => {
          const r = WWF.byGroup[k];
          const req = k === "FG1" || k === "FG2";
          return (
            <div className={cx("fgrow", req && "req")} key={k}>
              <b className="fgk">{k}</b>
              <span className="fgn">{U.fg[k as keyof typeof U.fg]}</span>
              <Split plant={r.plant / max} animal={r.animal / max} grow={g} h={9} />
            </div>
          );
        })}
        <div className="wwf-foot"><span><i />{U.required}</span><span>{U.dairyNote}</span></div>
      </Card>
      <Card n={2} title={U.composites}>
        <div className="seg-bar" style={{ height: 26 }}>
          {cats.map((c) => <i key={c} style={{ flexBasis: g ? `${(100 * WWF.byCategory[c]) / (WWF.compositeT || 1)}%` : "0%", background: CAT_COLOR[c] }} />)}
        </div>
        <div className="catlist">
          {cats.map((c) => <span key={c}><i style={{ background: CAT_COLOR[c] }} />{U.catTitle[c]}</span>)}
        </div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 8 · Protein Tracker ratio
function Pt({ lang }: P) {
  const U = UI_STR[lang];
  const g = useGrow();
  const [k, pr, out] = U.formulaProt;
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
      <Card n={1} title={U.rowByRow}>
        <div className="eq">
          <span className="eqb">{k}</span><span className="op">×</span><span className="eqb">{pr}</span><span className="op">=</span><span className="eqb strong">{out}</span>
        </div>
        <Split plant={F.ptRatio} animal={1 - F.ptRatio} grow={g} h={14} />
        <Legend items={[["var(--plant)", U.plant], ["var(--animal)", U.animal]]} />
        <div className="ratio">
          <Ring value={g ? F.ptRatio : 0} size={78} stroke={10} track="var(--peach-soft)" color="var(--plant)" />
          <div><b>{U.ratioLine}</b><span className="fmeta">{U.ptKpi}</span></div>
        </div>
      </Card>
      <Card n={2} title={U.byClass}>
        <div className="seg-bar">
          {PT_CLASSES.map((c) => <i key={c} style={{ flexBasis: g ? `${(100 * PT.byClass[c]) / PT.total}%` : "0%", background: CLASS_COLOR[c] }} />)}
        </div>
        <div className="catlist">{PT_CLASSES.map((c) => <span key={c}><i style={{ background: CLASS_COLOR[c] }} />{U.classes[c]}</span>)}</div>
        <div className="seg-bar" style={{ height: 26, marginTop: 18 }}>
          <i style={{ flexBasis: g ? `${F.levelA * 100}%` : "0%", background: "var(--ink)" }}><span>A</span></i>
          <i style={{ flexBasis: g ? `${(1 - F.levelA) * 100}%` : "0%", background: "var(--paper)", color: "var(--ink)" }}><span>B</span></i>
        </div>
        <Legend items={[["var(--ink)", U.levelA], ["var(--paper)", U.levelB]]} />
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 9 · checks and accuracy
function Quality({ lang }: P) {
  const U = UI_STR[lang];
  const tones = ["var(--green)", "var(--ink)", "var(--comp)"];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)" }}>
      <Card n={1} title={U.checksTitle}>
        <div className="cgroups">
          {U.checkGroups.map(([gname, xs]) => (
            <div key={gname}>
              <div className="sub-t">{gname}</div>
              {xs.map((x) => <div className="citem" key={x}><span className="tk"><Ico d={I.check} size={12} /></span>{x}</div>)}
            </div>
          ))}
        </div>
      </Card>
      <Card n={2} title={U.sample}>
        <div className="pillnote ink"><Ico d={I.lock} size={13} />{U.sealed}</div>
        <div className="sgroups">
          {U.sampleGroups.map(([n, label], i) => (
            <div className="sgroup" key={label}>
              <div className="sdots">{Array.from({ length: i === 2 ? 9 : 30 }, (_, k) => <i key={k} style={{ background: tones[i] }} />)}</div>
              <div><b className="big">{n}</b><span>{label}</span></div>
            </div>
          ))}
        </div>
        <div className="sub-t" style={{ margin: "14px 0 6px" }}>{U.perEngagement}</div>
        <div className="fieldchips">{U.fields.map((f) => <span key={f}>{f}</span>)}</div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 10 · delivery
function Deliver({ lang }: P) {
  const U = UI_STR[lang];
  const icons = [I.sheet, I.table, I.doc, I.report];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
      <Card n={1} title={U.youReceive}>
        {U.files4.map(([name, kind, desc], i) => (
          <div className="frowd" key={name}>
            <span className="ibox"><Ico d={icons[i]} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="fname">{name}</div><div className="fmeta">{desc}</div></div>
            <span className="chip">{kind}</span>
          </div>
        ))}
      </Card>
      <Card n={2} title={U.whoKeeps}>
        <div className="keeps">
          <div className="kcol yours"><b>{U.staysYours}</b>{U.staysList.map((x) => <span key={x}><Ico d={I.lock} size={13} />{x}</span>)}</div>
          <div className="kcol altera"><b>{U.alteraKeeps}</b>{U.keepsList.map((x) => <span key={x}><Ico d={I.check} size={13} />{x}</span>)}<em>{U.keepsNote}</em></div>
        </div>
        <div className="noshare"><Ico d={I.user} size={14} />{U.noCrossing}</div>
      </Card>
    </div>
  );
}

const SCENES: Record<Scene, (p: P) => ReactNode> = {
  data: Receive, scope: Scope, classify: Classify, protein: Protein, split: SplitScene,
  volumes: Volumes, wwf: Wwf, pt: Pt, quality: Quality, deliver: Deliver,
};

export function SceneView({ scene, lang }: P & { scene: Scene }) {
  const C = SCENES[scene];
  return <C lang={lang} />;
}
