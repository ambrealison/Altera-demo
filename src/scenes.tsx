import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Lang, PtClass } from "./lib/types";
import { UI_STR, dept } from "./lib/i18n";
import { PT_CLASSES, FOOD_GROUPS } from "./lib/calc";
import { CLASS_COUNT, CLASS_EXAMPLE, CRISPS, DEPTS, F, FG_COUNT, PROT_COUNT, PT, ROUTE_COUNT, SHEET_ROWS, WWF, WWF_COMPOSITES, WWF_EXCLUDED } from "./lib/facts";
import type { Scene } from "./tour";

// The tour shows proportions, never figures: bars and rings are drawn from the fictitious
// catalogue, but no count or percentage is printed.

interface P { sub: number; focus: string[]; lang: Lang }

// ------------------------------------------------------------ helpers
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const on = (p: P, id: string) => (p.focus.includes(id) ? "focus" : "");

function useGrow(dep: unknown = 0) {
  const [g, setG] = useState(false);
  useEffect(() => {
    setG(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setG(true)));
    return () => cancelAnimationFrame(id);
  }, [dep]);
  return g;
}

export const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--animal)", composite: "var(--comp)", plant_non_core: "var(--plant-2)", plant_core: "var(--plant)",
};

// line icons, 1.6 stroke
const Ico = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);
const I = {
  sheet: "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 10h16M4 15h16M10 4v16",
  table: "M4 6h16M4 12h16M4 18h16M8 6v12",
  doc: "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6M9 12h6M9 16h3",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  check: "M5 12.5l4.2 4.2L19 7",
  cross: "M7 7l10 10M17 7L7 17",
  shield: "M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0",
  bolt: "M13 3L5 13h6l-1 8 8-10h-6z",
  report: "M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5M9 17v-3M12 17v-6M15 17v-2",
};

function Bar({ v, color = "var(--green)", grow, h = 8 }: { v: number; color?: string; grow: boolean; h?: number }) {
  return <div className="track" style={{ height: h }}><i style={{ width: grow ? `${Math.max(0, Math.min(1, v)) * 100}%` : 0, background: color }} /></div>;
}
function Split({ plant, grow, h = 10 }: { plant: number; grow: boolean; h?: number }) {
  return (
    <div className="abar" style={{ height: h }}>
      <i style={{ width: grow ? `${plant * 100}%` : 0, background: "var(--plant)" }} />
      <i style={{ width: grow ? `${(1 - plant) * 100}%` : 0, background: "var(--animal)" }} />
    </div>
  );
}
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
const Card = ({ title, aside, children, className, anchor, style }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; anchor?: string; style?: CSSProperties }) => (
  <div className={cx("card", className)} data-anchor={anchor} style={style}>
    {title && <div className="ctitle">{title}{aside}</div>}
    {children}
  </div>
);
const Legend = ({ items }: { items: [string, string][] }) => (
  <span className="legend" style={{ margin: 0 }}>{items.map(([c, l]) => <span key={l}><i style={{ background: c }} />{l}</span>)}</span>
);


// ------------------------------------------------------------ 1 · reads and scopes the file (method steps 1–2)
function Intake(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const N = F.funnel.received;
  const fills: [keyof typeof U.fillCols, number][] = [
    ["label", F.fill.label], ["weight", F.fill.weight], ["ingredients", F.fill.ingredients], ["protein", F.fill.protein], ["volumes", F.fill.volumes],
  ];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)", flex: 1, minHeight: 0 }}>
      <div className="col">
        <Card>
          <div className="file">
            <span className="fico"><Ico d={I.sheet} size={22} /></span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="fname mono">harbour_market_catalogue.csv</div>
              <div className="fmeta">{U.fileMeta}</div>
            </div>
          </div>
          <div className="pillnote"><Ico d={I.lock} size={14} />{U.archived}</div>
        </Card>
        <Card title={U.inventory} className={on(p, "inventory")} anchor="inventory" style={{ flex: 1 }}>
          {fills.map(([k, v]) => (
            <div key={k} className="brow" style={{ gridTemplateColumns: "minmax(0, 1fr) 170px", padding: "6px 0" }}>
              <span>{U.fillCols[k]}</span>
              <Bar v={v} grow={g} color={v > 0.95 ? "var(--ink)" : v > 0.75 ? "var(--green-2)" : "var(--animal)"} />
            </div>
          ))}
        </Card>
      </div>
      <Card title={U.scopeTitle} className={cx(p.sub < 1 && "dim", on(p, "scope"))} anchor="scope">
        <div className="wf">
          <div className="wf-row"><span>{U.received}</span><div className="wf-bar"><i style={{ width: g ? "100%" : 0, background: "var(--ink)" }} /></div></div>
          {[U.nonFood, U.tests, U.unsold].map((k) => <div className="wf-cut" key={k}><span>× {k}</span></div>)}
          <div className="wf-row"><span>{U.ptScope}</span><div className="wf-bar"><i style={{ width: g ? `${(100 * F.funnel.measured) / N}%` : 0, background: "var(--green)" }} /></div></div>
          <div className="wf-cut"><span>× {U.appendixA}</span></div>
          <div className="excl">{Object.values(U.excl).map((e) => <span key={e}>{e}</span>)}</div>
          <div className="wf-row"><span>{U.wwfScope}</span><div className="wf-bar"><i style={{ width: g ? `${(100 * F.funnel.wwf) / N}%` : 0, background: "var(--comp)" }} /></div></div>
        </div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 2 · classifies every product (method step 3)
function Classify(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const maxC = Math.max(...PT_CLASSES.map((c) => CLASS_COUNT[c]));
  const maxG = Math.max(...FOOD_GROUPS.map((k) => FG_COUNT[k]), WWF_COMPOSITES, WWF_EXCLUDED);
  const N = F.funnel.measured;
  const routes = [["inherited", "var(--ink)"], ["stratum", "var(--comp)"], ["model", "var(--green)"]] as const;
  return (
    <>
      <div className="grid2">
        <Card title="WWF · Planet-Based Diets" aside={<span className="chip">{U.sevenGroups}</span>} className={on(p, "wwf-groups")} anchor="wwf-groups">
          <div className="fgrid">
            {FOOD_GROUPS.map((k) => (
              <div className="frow2" key={k}><b className="fgk">{k}</b><span>{U.fg[k as keyof typeof U.fg]}</span><Bar v={FG_COUNT[k] / maxG} grow={g} color="var(--ink)" h={5} /></div>
            ))}
            <div className="frow2"><b className="fgk" style={{ color: "var(--comp)" }}>C</b><span>{U.composite}</span><Bar v={WWF_COMPOSITES / maxG} grow={g} color="var(--comp)" h={5} /></div>
            <div className="frow2 muted"><b className="fgk">×</b><span>{U.excluded}</span><Bar v={WWF_EXCLUDED / maxG} grow={g} color="var(--faint)" h={5} /></div>
          </div>
        </Card>
        <Card title="Protein Tracker" aside={<span className="chip">{U.fourClasses}</span>} className={on(p, "pt-classes")} anchor="pt-classes">
          {PT_CLASSES.map((c) => (
            <div className="crow" key={c}>
              <span className="cdot" style={{ background: CLASS_COLOR[c] }} />
              <span className="cname"><span>{U.classes[c]}</span><small className="mono">{CLASS_EXAMPLE[c]?.label}</small></span>
              <Bar v={CLASS_COUNT[c] / maxC} grow={g} color={CLASS_COLOR[c]} h={6} />
            </div>
          ))}
        </Card>
      </div>
      <Card title={U.sourcesTitle} className={cx(p.sub < 1 && "dim", on(p, "sources"))} anchor="sources">
        <div className="seg-bar">
          {routes.map(([r, col]) => <i key={r} style={{ flexBasis: g ? `${(100 * ROUTE_COUNT[r]) / N}%` : "0%", background: col }} />)}
        </div>
        <div className="routes">
          {routes.map(([r, col]) => (
            <div key={r}><b><i style={{ background: col }} />{U.sources[r][0]}</b><span>{U.sources[r][1]}</span></div>
          ))}
        </div>
      </Card>
    </>
  );
}

// ------------------------------------------------------------ 3 · completes protein content (method step 4)
function Protein(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const N = F.funnel.measured;
  const order = ["declared", "reference_base", "off_ean", "name_match", "stratum_median"] as const;
  return (
    <div className="grid2" style={{ alignItems: "start" }}>
      <Card title={U.cascade} className={on(p, "cascade")} anchor="cascade">
        {order.map((s, i) => (
          <div key={s} className="casc" style={{ gridTemplateColumns: "24px minmax(0, 1fr) 130px" }}>
            <span className={cx("cidx", i === 0 && "first")}>{i + 1}</span>
            <span className="cl">{U.protSrc[s]}</span>
            <Bar v={PROT_COUNT[s] / N} grow={g} color={i === 0 ? "var(--ink)" : "var(--green-2)"} h={6} />
          </div>
        ))}
        <div className="fmeta" style={{ marginTop: 14 }}>{U.keepsSource}</div>
      </Card>
      <div className="col">
        <Card title={U.plausibility} className={cx(p.sub < 1 && "dim", on(p, "perpack"))} anchor="perpack">
          <div className="trio">
            <div><span className="ibox sm bad"><Ico d={I.cross} size={14} /></span><b>{U.declared}</b><span className="fmeta">{U.perPackDeclared}</span></div>
            <div><span className="ibox sm"><Ico d={I.bolt} size={14} /></span><b>{U.energy}</b><span className="fmeta">{U.energyFails}</span></div>
            <div><span className="ibox sm ok"><Ico d={I.check} size={14} /></span><b>{U.kept}</b><span className="fmeta">{U.keptVal}</span></div>
          </div>
          <div className="formula mono">{p.lang === "fr" ? "4 × P + 9 × L + 4 × G ≈ kcal" : "4 × P + 9 × F + 4 × C ≈ kcal"}</div>
        </Card>
        <div className="checkchips">
          {U.checksDeclared.map((c) => <span key={c}><Ico d={I.check} size={14} />{c}</span>)}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ 4 · splits plant and animal (method step 5)
function SplitScene(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const ingr = (CRISPS.ingredients ?? "").split(/(whey powder \(milk\)|milk)/i);
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)", alignItems: "start" }}>
      <Card>
        <div className="fmeta upper">{CRISPS.brand}</div>
        <div className="mono" style={{ fontSize: 18, fontWeight: 600, margin: "4px 0 14px" }}>{CRISPS.label}</div>
        <div className="ctitle" style={{ marginBottom: 6 }}>{U.ingredients}</div>
        <p className="pingr">{ingr.map((s, i) => (/milk/i.test(s) ? <mark key={i}>{s}</mark> : <span key={i}>{s}</span>))}</p>
        <dl className="spec">
          <dt>{U.protein}</dt><dd>{U.proteinVal}</dd>
          <dt>{U.origin}</dt><dd><span className="chip animal_core"><i />{U.originVal}</span></dd>
          <dt>{U.split}</dt>
          <dd className={on(p, "split")} data-anchor="split" style={{ borderRadius: 8, padding: "4px 6px", margin: "-4px -6px" }}>
            <Split plant={F.crispsPlant} grow={g} h={12} />
            <div className="row" style={{ justifyContent: "space-between", fontSize: 12.5, marginTop: 6 }}>
              <b style={{ color: "var(--green)" }}>{U.plant}</b><span style={{ color: "var(--animal-ink)" }}>{U.animal}</span>
            </div>
          </dd>
          <dt>{U.method}</dt><dd>{U.methodVal}</dd>
        </dl>
      </Card>
      <Card title={U.levelsTitle} className={cx(p.sub < 1 && "dim", on(p, "levels"))} anchor="levels">
        <div className="seg-bar" style={{ height: 34 }}>
          <i style={{ flexBasis: g ? `${F.levelA * 100}%` : "0%", background: "var(--ink)" }}><span>A</span></i>
          <i style={{ flexBasis: g ? `${(1 - F.levelA) * 100}%` : "0%", background: "var(--paper)", color: "var(--ink)" }}><span>B</span></i>
        </div>
        <div className="lvl"><b><span className="sq" style={{ background: "var(--ink)" }} />{U.levelA}</b><p>{U.levelAList}</p></div>
        <div className="lvl"><b><span className="sq" style={{ background: "var(--paper)", border: "1px solid var(--line)" }} />{U.levelB}</b><p>{U.levelBList}</p></div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 5 · calculates both ratios (method steps 6–7)
const CAT: Record<Lang, Record<string, string>> = {
  en: { meat_based: "Meat-based", seafood_based: "Seafood", vegetarian: "Vegetarian", vegan: "Vegan" },
  fr: { meat_based: "Viande", seafood_based: "Produits de la mer", vegetarian: "Végétarien", vegan: "Végan" },
};
function Calculate(p: P) {
  const U = UI_STR[p.lang];
  const g = useGrow();
  const cats = Object.keys(WWF.byCategory);
  const catColor = ["var(--animal)", "var(--sky)", "var(--plant-2)", "var(--plant)"];
  return (
    <>
      <div className="grid3">
        <div className={cx("kpi-hero", on(p, "wwf"))} data-anchor="wwf">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><span className="htag">WWF</span><div className="hlabel">{U.wwfKpi}</div></div>
            <Ring value={g ? F.wwfPlant : 0} size={84} stroke={10} track="rgba(249,206,169,.85)" color="#bfe3c9" />
          </div>
          <div className="hrows">
            {([["FG1", F.fg1Plant], ["FG2", F.fg2Plant]] as const).map(([k, s]) => (
              <div key={k} className="hrow"><b>{k}</b><Split plant={s} grow={g} h={8} /></div>
            ))}
          </div>
          <div className="hfoot"><span><i style={{ background: "#bfe3c9" }} />{U.plant}</span><span><i style={{ background: "var(--peach)" }} />{U.animal}</span><span>· {U.wwfNote}</span></div>
        </div>
        <Card title="Protein Tracker" className={cx(p.sub < 1 && "dim", on(p, "pt"))} anchor="pt">
          <div className="row" style={{ alignItems: "center", gap: 16 }}>
            <Ring value={g ? F.ptRatio : 0} size={84} stroke={10} track="var(--peach-soft)" color="var(--plant)" />
            <div className="fmeta" style={{ fontSize: 13 }}>{U.ptKpi}</div>
          </div>
          <div className="seg-bar thin" style={{ marginTop: 14 }}>
            {PT_CLASSES.map((c) => <i key={c} style={{ flexBasis: g ? `${(100 * PT.byClass[c]) / PT.total}%` : "0%", background: CLASS_COLOR[c] }} />)}
          </div>
          <div className="hfoot dark">{PT_CLASSES.map((c) => <span key={c}><i style={{ background: CLASS_COLOR[c] }} />{U.classes[c]}</span>)}</div>
        </Card>
        <Card title={U.structure} className={cx(p.sub < 1 && "dim")}>
          <div className="seg-bar thin" style={{ marginTop: 6 }}>
            <i style={{ flexBasis: g ? `${F.wwfWhole * 100}%` : "0%", background: "var(--ink)" }} />
            <i style={{ flexBasis: g ? `${(1 - F.wwfWhole) * 100}%` : "0%", background: "var(--comp)" }} />
          </div>
          <div className="hfoot dark" style={{ marginBottom: 14 }}><span><i style={{ background: "var(--ink)" }} />{p.lang === "fr" ? "Entier" : "Whole"}</span><span><i style={{ background: "var(--comp)" }} />Composite</span></div>
          <div className="seg-bar thin">
            {cats.map((k, i) => <i key={k} style={{ flexBasis: g ? `${(100 * WWF.byCategory[k]) / (WWF.compositeT || 1)}%` : "0%", background: catColor[i] }} />)}
          </div>
          <div className="hfoot dark">{cats.map((k, i) => <span key={k}><i style={{ background: catColor[i] }} />{CAT[p.lang][k]}</span>)}</div>
        </Card>
      </div>
      <Card title={U.byDept} aside={<Legend items={[["var(--plant)", U.plant], ["var(--animal)", U.animal]]} />}
        className={cx(p.sub < 2 && "dim", on(p, "depts"))} anchor="depts" style={{ flex: 1 }}>
        <div className="dgrid">
          {DEPTS.slice(0, 6).map((d) => (
            <div className="drow" key={d.dept} style={{ gridTemplateColumns: "minmax(0, 1fr) 160px" }}>
              <span className="dn">{dept(d.dept, p.lang)}</span>
              <Split plant={d.ratio} grow={g} h={8} />
            </div>
          ))}
        </div>
        <div className="fmeta mono" style={{ marginTop: 10, fontSize: 11 }}>{U.formula}</div>
      </Card>
    </>
  );
}

// ------------------------------------------------------------ 6 · checks and measures accuracy (method steps 8–9)
function Quality(p: P) {
  const U = UI_STR[p.lang];
  const tones = ["var(--green)", "var(--ink)", "var(--comp)"];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", flex: 1, minHeight: 0 }}>
      <Card title={U.checksTitle} aside={<span className="chip ok">{U.allPass}</span>} className={on(p, "checks")} anchor="checks">
        <div className="cgroups">
          {U.checkGroups.map(([gname, xs]) => (
            <div key={gname}>
              <div className="fmeta upper" style={{ marginBottom: 4 }}>{gname}</div>
              {xs.map((x) => (
                <div className="citem" key={x}><span className="tk"><Ico d={I.check} size={12} /></span>{x}</div>
              ))}
            </div>
          ))}
        </div>
      </Card>
      <Card title={U.sample} aside={<span className="chip ink"><Ico d={I.lock} size={12} /> {U.sealed}</span>} className={on(p, "accuracy")} anchor="accuracy">
        <div className="sgroups">
          {U.sampleGroups.map(([n, label], i) => (
            <div className="sgroup" key={label}>
              <div className="sdots">{Array.from({ length: i === 2 ? 9 : 30 }, (_, k) => <i key={k} style={{ background: tones[i] }} />)}</div>
              <div><b className="big">{n}</b><span>{label}</span></div>
            </div>
          ))}
        </div>
        <div className="fmeta" style={{ margin: "12px 0 6px" }}>{U.perEngagement}</div>
        <div className="fieldchips">{U.fields.map((f) => <span key={f}>{f}</span>)}</div>
        <div className="row" style={{ alignItems: "center", gap: 8, marginTop: 12 }}><span className="ibox sm"><Ico d={I.user} size={14} /></span><span className="fmeta">{U.reviewer}</span></div>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------ 7 · delivers the results (method steps 10–11)
function Deliver(p: P) {
  const U = UI_STR[p.lang];
  const icons = [I.sheet, I.report, I.table, I.doc];
  return (
    <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", flex: 1, minHeight: 0 }}>
      <Card className={on(p, "deliverables")} anchor="deliverables">
        {U.files.map(([name, kind, desc], i) => (
          <div className="frowd" key={name}>
            <span className="ibox"><Ico d={icons[i]} /></span>
            <div style={{ flex: 1, minWidth: 0 }}><div className="fname">{name}</div><div className="fmeta">{desc}</div></div>
            <span className="chip">{kind}</span>
          </div>
        ))}
        <div className="sheet">
          {U.sheetCols.map((c, i) => <span key={c} className={cx("h", i === 1 && "in")}>{c}</span>)}
          {SHEET_ROWS.map((x, r) => (
            <span key={x.id} style={{ display: "contents" }}>
              <span className="mono">{x.label}</span>
              <span className="in"><i className="skel" style={{ width: `${46 + ((r * 17) % 40)}%` }} /></span>
              <span><i className="skel g" style={{ width: `${30 + ((r * 23) % 55)}%` }} /></span>
              <span><i className="skel g" style={{ width: `${25 + ((r * 31) % 60)}%` }} /></span>
            </span>
          ))}
        </div>
      </Card>
      <Card className={cx("gov", p.sub < 1 && "dim", on(p, "governance"))} anchor="governance">
        <span className="ibox lg"><Ico d={I.shield} size={26} /></span>
        <div className="gtitle">{U.governance}</div>
        {U.governanceList.map(([t, d]) => (
          <div className="gitem" key={t}><b>{t}</b><span>{d}</span></div>
        ))}
      </Card>
    </div>
  );
}

const SCENES: Record<Scene, (p: P) => ReactNode> = {
  intake: Intake, classify: Classify, protein: Protein, split: SplitScene, calculate: Calculate, quality: Quality, deliver: Deliver,
};

export function SceneView({ scene, ...p }: P & { scene: Scene }) {
  const C = SCENES[scene];
  return <C {...p} />;
}
