import { useMemo, useState } from "react";
import type { Lang } from "./lib/types";
import { STRINGS } from "./lib/i18n";
import { BOOKING_URL, DOWNLOADS } from "./config";
import europe from "./data/europe.json";
import { COUNT, COUNTRIES, SOURCES, type Country, type SourceId } from "./data/movement";

const Arrow = () => <span className="arr">→</span>;
interface Shape { id: number; name: string; d: string; cx: number; cy: number }
const map = europe as { w: number; h: number; countries: Shape[] };
const BY_ID = new Map(COUNTRIES.map((c) => [c.id, c]));
const SOURCE_ORDER = Object.keys(SOURCES) as SourceId[];

function status(c?: Country): "publishes" | "measures" | "none" {
  if (!c) return "none";
  return c.retailers.some((r) => r.status === "publishes") ? "publishes" : "measures";
}

/** The closing page: the movement across Europe, then the call to action. */
export function Movement({ lang, onRestart }: { lang: Lang; onRestart: () => void }) {
  const T = STRINGS[lang].end;
  const S = STRINGS[lang];
  const [sel, setSel] = useState<number>(528);
  const country = BY_ID.get(sel) ?? BY_ID.get(528)!;
  const num = (v: number) => v.toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 }) + (lang === "fr" ? " %" : "%");
  const touch = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches;

  // draw countries with data last so their outline sits on top
  const shapes = useMemo(() => [...map.countries].sort((a, b) => Number(BY_ID.has(a.id)) - Number(BY_ID.has(b.id))), []);

  return (
    <section className="slide movement">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display lg rise d1">{T.title}</h1>
      <p className="lead rise d2" style={{ maxWidth: "60ch" }}>{T.lead}</p>

      <div className="mv-grid rise d3">
        <div className="mv-side">
          <div className="mv-kpis">
            <div><b>{COUNT.publishes}</b><span>{T.kpis.publishes}</span></div>
            <div><b>{COUNT.measures}</b><span>{T.kpis.measures}</span></div>
            <div><b>{COUNT.countries}</b><span>{T.kpis.countries}</span></div>
          </div>
          <p className="mv-qm">{T.qm} <a href={SOURCES.qmEu.url} target="_blank" rel="noopener">[{SOURCE_ORDER.indexOf("qmEu") + 1}]</a></p>

          <div className="mv-panel" key={country.id} aria-live="polite">
            <div className="mv-panel-head">
              <span className={`mv-dot ${status(country)}`} />
              <b>{country.name[lang]}</b>
              <span className="fmeta">{country.retailers.length}</span>
            </div>
            {country.note && <p className="mv-note">{country.note[lang]}</p>}
            <div className="mv-list">
              {country.retailers.map((r) => (
                <div className="mv-row" key={r.name}>
                  <span className={`mv-dot ${r.status}`} />
                  <div className="mv-main">
                    <b>{r.name}</b>
                    {r.metric && <span>{r.metric[lang]}{r.year ? ` · ${r.year}` : ""}</span>}
                    {r.target && <span className="mv-target">{r.status === "publishes" ? `${T.target}${lang === "fr" ? " : " : ": "}` : ""}{r.target[lang]}</span>}
                  </div>
                  {r.value !== undefined && <span className="mv-val">{num(r.value)}</span>}
                  <a className="mv-src" href={SOURCES[r.src].url} target="_blank" rel="noopener" title={SOURCES[r.src].label}>[{SOURCE_ORDER.indexOf(r.src) + 1}]</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mv-map">
          <svg viewBox={`0 0 ${map.w} ${map.h}`} role="img" aria-label={T.title}>
            {shapes.map((c) => {
              const d = BY_ID.get(c.id);
              const st = status(d);
              return (
                <path key={c.id} d={c.d} className={`mv-c ${st} ${c.id === sel ? "sel" : ""}`}
                  onMouseEnter={d ? () => setSel(c.id) : undefined} onClick={d ? () => setSel(c.id) : undefined}>
                  <title>{d ? d.name[lang] : c.name}</title>
                </path>
              );
            })}
            {COUNTRIES.map((c) => {
              const m = map.countries.find((x) => x.id === c.id);
              if (!m) return null;
              const n = c.retailers.length;
              const r = 8 + Math.sqrt(n) * 3.2;
              return (
                <g key={c.id} className={`mv-pin ${status(c)} ${c.id === sel ? "sel" : ""}`} transform={`translate(${m.cx} ${m.cy})`}
                  onMouseEnter={() => setSel(c.id)} onClick={() => setSel(c.id)}>
                  <circle r={r + 6} className="halo" />
                  <circle r={r} />
                  <text dy="0.35em">{n}</text>
                </g>
              );
            })}
          </svg>
          <div className="mv-legend">
            <span><i className="publishes" />{T.legend.publishes}</span>
            <span><i className="measures" />{T.legend.measures}</span>
            <span><i className="none" />{T.legend.none}</span>
            <span className="mv-hint">{touch ? T.hintTouch : T.hint}</span>
          </div>
        </div>
      </div>

      <div className="mv-cta rise d4">
        <div>
          <h2>{T.ctaTitle}</h2>
          <p>{T.ctaLead}</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <a className="pill pill-lav" href={BOOKING_URL} target="_blank" rel="noopener">{S.cta} <Arrow /></a>
          <button className="pill pill-ghost light" onClick={onRestart}>{T.restart}</button>
        </div>
      </div>

      <div className="mv-sources rise d5">
        <p className="mv-comp">{T.comparability}</p>
        <div className="fmeta upper" style={{ margin: "14px 0 8px" }}>{T.sources} · <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>{T.collected}</span></div>
        <ol>
          {SOURCE_ORDER.map((id) => <li key={id}><a href={SOURCES[id].url} target="_blank" rel="noopener">{SOURCES[id].label}</a></li>)}
        </ol>
        <div className="end-note">
          <p>{T.disclaimer}</p>
          <span style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <a className="textlink" href={DOWNLOADS.workbook} download>{T.sample}</a>
            <span>{T.built}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
