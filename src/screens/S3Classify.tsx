import { useMemo, useState } from "react";
import { useCount, useDemo, useInstant, useReveal, type ScreenProps } from "../lib/ctx";
import { VOCAB, fill } from "../lib/i18n";
import { PRODUCTS, inScope } from "../lib/calc";
import type { Product, Route } from "../lib/types";
import { AgentLog, ClassChip, Head, Pending, RouteChip, RunButton, WwfChip, useFmt, type LogLine } from "../components/ui";

const ROUTES: Route[] = ["inherited", "stratum", "model"];
type Filter = "all" | Route | "review";

function samples(): Product[] {
  const by = (cond: (p: Product) => boolean, n: number) => inScope.filter(cond).slice(0, n);
  return [
    ...by((p) => p.route === "inherited" && p.dept === "Dairy & Eggs", 1),
    ...by((p) => p.route === "model" && p.note === "origin_vs_split", 1),
    ...by((p) => p.route === "stratum", 1),
    ...by((p) => p.route === "model" && p.note === "egg_pasta", 1),
    ...by((p) => p.route === "model" && !!p.requeried, 1),
    ...by((p) => p.route === "inherited" && p.dept === "Fresh Meat & Poultry", 1),
    ...by((p) => p.route === "model" && p.note === "plant_alt", 1),
    ...by((p) => p.route === "model" && p.note === "two_composites", 1),
    ...by((p) => p.route === "model" && !!p.review, 1),
  ];
}
const SAMPLES = samples();

export default function S3({ ran, run, take }: ScreenProps) {
  const { t, lang, open } = useDemo();
  const f = useFmt();
  const T = t.s3;
  const V = VOCAB[lang];
  const instant = useInstant(ran, take);
  const N = inScope.length;
  const counts = Object.fromEntries(ROUTES.map((r) => [r, inScope.filter((p) => p.route === r).length])) as Record<Route, number>;
  const nReview = inScope.filter((p) => p.review).length;

  const wwfTxt = (p: Product) => p.wwf.excl ? V[p.wwf.excl] : p.wwf.struct === "composite" ? `composite · ${V[p.wwf.cat ?? ""]}` : `${p.wwf.fg}${p.wwf.sub ? " " + V[p.wwf.sub] : ""}`;
  const lines: LogLine[] = [
    { g: "ok", text: T.logTrial },
    ...SAMPLES.flatMap((p): LogLine[] => {
      const head = <><b>{p.label}</b> <span className="dim">→ {V[p.route!]}</span></>;
      const res = <span className="dim">{"   "}{V[p.pt!]} · {wwfTxt(p)} · {f.pct(p.conf ?? 0, 0)}</span>;
      const out: LogLine[] = [{ g: "arrow", text: head }];
      if (p.requeried) out.push({ g: "warn", text: <span className="dim">{T.logRequery}</span> });
      out.push({ g: p.review ? "warn" : "ok", text: res });
      return out;
    }),
    { g: "ok", text: <b>{fill(T.logDone, { n: f.int(N) })}</b> },
  ];
  const shown = useReveal(ran, lines.length, 330, instant, take);
  const done = shown >= lines.length;
  const progress = useCount(ran && !instant, 1, 330 * lines.length, take);
  const k = instant || done ? 1 : progress;

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PRODUCTS.filter((p) =>
      (filter === "all" || (filter === "review" ? p.review : p.route === filter)) &&
      (!s || p.label.toLowerCase().includes(s) || p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s)));
  }, [filter, q]);

  return (
    <div className="stack" style={{ gap: 32 }}>
      <div className="split">
        <div className="story">
          <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
          <RunButton ran={ran} run={run} label={fill(T.action, { n: f.int(N) })} />
          <div className="card tint" style={{ marginTop: 22 }}>
            <h3 className="mini">{T.rulesTitle}</h3>
            <ul className="small" style={{ margin: 0, paddingLeft: 18, color: "#374151" }}>
              {T.rules.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
        <div className="stack">
          <div className="lanes">
            {ROUTES.map((r) => (
              <div className="lane" key={r}>
                <div className="n">{f.int(Math.round(counts[r] * (ran ? k : 0)))}</div>
                <div className="t">{T.routes[r].t}</div>
                <div className="track"><span className={`fill ${r === "model" ? "navy" : r === "stratum" ? "gold" : "soft"}`} style={{ width: `${ran ? (100 * counts[r] * k) / N : 0}%`, transition: "none" }} /></div>
                <div className="b">{T.routes[r].b}</div>
              </div>
            ))}
          </div>
          {!ran ? <Pending label={fill(T.action, { n: f.int(N) })} run={run} /> : (
            <AgentLog title={`altera-ai · classify · ${f.int(Math.round(N * k))} / ${f.int(N)}`} lines={lines} shown={shown} running={!done} />
          )}
          {ran && done && (
            <button className="btn btn-ghost btn-wrap" style={{ alignSelf: "flex-start" }} onClick={() => setFilter("review")}>
              <span className="chip review">{nReview}</span> {fill(T.review, { n: nReview }).replace(String(nReview), "").trim()}
            </button>
          )}
        </div>
      </div>

      {ran && done && (
        <section style={{ animation: "enter .5s both" }}>
          <div className="card-head">
            <div>
              <h2 className="sub">{T.exploreTitle}</h2>
              <div className="muted small">{T.exploreLead}</div>
            </div>
          </div>
          <div className="toolbar">
            <div className="seg" role="group">
              {(["all", "inherited", "stratum", "model", "review"] as Filter[]).map((x) => (
                <button key={x} aria-pressed={filter === x} onClick={() => setFilter(x)}>
                  {T.filters[x]}<span className="n">{x === "all" ? PRODUCTS.length : x === "review" ? nReview : counts[x]}</span>
                </button>
              ))}
            </div>
            <input className="search" placeholder={T.search} value={q} onChange={(e) => setQ(e.target.value)} />
            <span className="muted small mono">{fill(T.shown, { n: f.int(rows.length), total: f.int(PRODUCTS.length) })}</span>
          </div>
          <div className="tablewrap tall">
            <table className="data">
              <thead>
                <tr>
                  <th>{lang === "fr" ? "Libellé caisse" : "Till label"}</th>
                  <th>{lang === "fr" ? "Rayon" : "Department"}</th>
                  <th>{t.drawer.route}</th>
                  <th>Protein Tracker</th>
                  <th>WWF</th>
                  <th className="r">{t.drawer.confidence}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="click" onClick={() => open(p)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") open(p); }}>
                    <td className="label">{p.label}</td>
                    <td>{f.dept(p.dept)}</td>
                    <td><RouteChip p={p} /></td>
                    <td><ClassChip c={p.in_scope ? p.pt : undefined} /></td>
                    <td><WwfChip p={p} /></td>
                    <td className="r mono">{p.conf ? f.pct(p.conf, 0) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
