import type { Lang } from "./lib/types";
import { STRINGS } from "./lib/i18n";
import { fmtNum } from "./lib/calc";
import { F } from "./lib/facts";

interface P { lang: Lang; onNext: () => void }
const Arrow = () => <span className="arr">→</span>;

export function Cover({ lang, onNext }: P) {
  const T = STRINGS[lang].cover;
  return (
    <section className="slide cover">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display xl rise d1">{T.title}</h1>
      <p className="lead rise d2">{T.lead}</p>
      <div className="actions rise d3">
        <button className="pill pill-dark" onClick={onNext} autoFocus>{T.start} <Arrow /></button>
        <span className="meta">{T.meta}</span>
      </div>
      <Peek lang={lang} />
    </section>
  );
}

/** A glimpse of the app window, as on the alterafood.org hero. */
function Peek({ lang }: { lang: Lang }) {
  const c = 2 * Math.PI * 34;
  const label = lang === "fr" ? "Part végétale des protéines" : "Plant share of protein";
  return (
    <div className="peek rise d4" aria-hidden>
      <div className="peek-frame">
        <div className="peek-win">
          <div className="peek-bar"><span className="wlogo">Altera<em>.ai</em></span><span className="crumb"><b>Harbour Market</b></span><span className="badge">Demo</span></div>
          <div className="peek-body">
            <div className="banner">
              <div>
                <div className="tagrow"><b>WWF</b><b>Protein Tracker</b></div>
                <div className="h">{label}</div>
                <div className="big">{fmtNum(F.ptRatio * 100, lang, 1)}<small>%</small></div>
              </div>
              <svg width="84" height="84" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(249,206,169,.9)" strokeWidth="9" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#bfe3c9" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${c * F.ptRatio} ${c}`} transform="rotate(-90 40 40)" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Ratio({ lang, onNext }: P) {
  const T = STRINGS[lang].ratio;
  const S = STRINGS[lang];
  const total = T.items.reduce((a, i) => a + i.k, 0);
  const plant = T.items.reduce((a, i) => a + i.p, 0);
  const share = plant / total;
  const max = Math.max(...T.items.map((i) => i.k));
  return (
    <section className="slide">
      <div className="intro-grid">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead}</p>
          <ul className="why-list rise d3">{T.why.map((w) => <li key={w}>{w}</li>)}</ul>
          <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
        </div>
        <div className="basket rise d2">
          <div className="frac"><span className="t">{T.top}</span><span className="b">{T.bottom}</span></div>
          <div className="basket-items">
            {T.items.map((it, i) => (
              <div className="bitem rise" key={it.n} style={{ animationDelay: `${0.35 + i * 0.08}s` }}>
                <span className="bn">{it.n}</span>
                <span className="bbar">
                  <i style={{ width: `${(100 * it.p) / max}%`, background: "var(--plant)" }} />
                  <i style={{ width: `${(100 * (it.k - it.p)) / max}%`, background: "var(--animal)" }} />
                </span>
                <span className="bk">{it.k}</span>
              </div>
            ))}
          </div>
          <div className="bsum rise" style={{ animationDelay: "0.9s" }}>
            <div className="bar-split" style={{ height: 14, margin: 0 }}>
              <i style={{ width: `${share * 100}%`, background: "var(--plant)" }} />
              <i style={{ width: `${(1 - share) * 100}%`, background: "var(--animal)" }} />
            </div>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline", marginTop: 14 }}>
              <div className="result-line"><b>{Math.round(share * 100)}{lang === "fr" ? " %" : "%"}</b><span>{T.plant}</span></div>
              <span className="fmeta">{total} {T.kg}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Methods({ lang, onNext }: P) {
  const T = STRINGS[lang].methods;
  const rows = ["owner", "unit", "groups", "scope", "reports"] as const;
  return (
    <section className="slide">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display lg rise d1">{T.title}</h1>
      <p className="lead rise d2" style={{ maxWidth: "62ch" }}>{T.lead}</p>
      <div className="mtable rise d3">
        <div className="mhead" />
        <div className="mhead" style={{ background: "var(--peach)" }}><b>{T.wwf.name}</b></div>
        <div className="mhead" style={{ background: "var(--lav)" }}><b>{T.pt.name}</b></div>
        {rows.map((r) => (
          <div key={r} style={{ display: "contents" }}>
            <div className="mlabel">{T.rows[r]}</div>
            <div className={`mcell ${r === "unit" ? "strong" : ""}`}>{T.wwf[r]}</div>
            <div className={`mcell ${r === "unit" ? "strong" : ""}`}>{T.pt[r]}</div>
          </div>
        ))}
      </div>
      <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{T.go} <Arrow /></button></div>
    </section>
  );
}
