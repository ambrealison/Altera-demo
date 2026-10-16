import type { Lang } from "./lib/types";
import { STRINGS, UI_STR } from "./lib/i18n";
import { BOOKING_URL, DOWNLOADS } from "./config";
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
  const U = UI_STR[lang];
  const c = 2 * Math.PI * 34;
  return (
    <div className="peek rise d4" aria-hidden>
      <div className="peek-frame">
        <div className="peek-win">
          <div className="peek-bar"><span className="wlogo">Altera<em>.ai</em></span><span className="crumb"><b>Harbour Market</b></span><span className="badge">Demo</span></div>
          <div className="peek-body">
            <div className="banner">
              <div>
                <div className="tagrow"><b>{U.ptTag}</b></div>
                <div className="h">{U.ratioHead}</div>
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

export function Intro({ lang, onNext }: P) {
  const T = STRINGS[lang].intro;
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
          <div className="why-row rise d3">{T.why.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="actions rise d4"><button className="pill pill-dark" onClick={onNext} autoFocus>{T.go} <Arrow /></button></div>
        </div>
        <div className="basket rise d2">
          <div className="basket-items">
            {T.items.map((it, i) => (
              <div className="bitem rise" key={it.n} style={{ animationDelay: `${0.3 + i * 0.09}s` }}>
                <span className="bem">{it.e}</span>
                <span className="bn">{it.n}</span>
                <span className="bbar">
                  <i style={{ width: `${(100 * it.p) / max}%`, background: "var(--plant)" }} />
                  <i style={{ width: `${(100 * (it.k - it.p)) / max}%`, background: "var(--animal)" }} />
                </span>
                <span className="bk">{it.k}</span>
              </div>
            ))}
          </div>
          <div className="bsum rise" style={{ animationDelay: "0.95s" }}>
            <div className="bar-split" style={{ height: 18, margin: 0 }}>
              <i style={{ width: `${share * 100}%`, background: "var(--plant)" }} />
              <i style={{ width: `${(1 - share) * 100}%`, background: "var(--animal)" }} />
            </div>
            <div className="result-line" style={{ marginTop: 14 }}>
              <b>{Math.round(share * 100)}{lang === "fr" ? " %" : "%"}</b><span>{T.plant}</span>
            </div>
            <div className="fmeta" style={{ marginTop: 2 }}>{total} {T.kg}</div>
          </div>
          <div className="methods-row rise" style={{ animationDelay: "1.1s" }}>
            <span className="mpill" style={{ background: "var(--lav)" }}><b>Protein Tracker</b>Green Protein Alliance</span>
            <span className="mpill" style={{ background: "var(--peach)" }}><b>WWF</b>Planet-Based Diets</span>
          </div>
          <div className="fmeta" style={{ textAlign: "center", marginTop: 8 }}>{T.methods}</div>
        </div>
      </div>
    </section>
  );
}

export function End({ lang, onRestart }: { lang: Lang; onRestart: () => void }) {
  const T = STRINGS[lang].end;
  const S = STRINGS[lang];
  return (
    <section className="slide cover">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display xl rise d1">{T.title}</h1>
      <p className="lead rise d2">{T.lead}</p>
      <div className="actions rise d3">
        <a className="pill pill-lav" href={BOOKING_URL} target="_blank" rel="noopener" autoFocus>{S.cta} <Arrow /></a>
        <button className="pill pill-ghost" onClick={onRestart}>{T.restart}</button>
      </div>
      <div className="end-note rise d4">
        <p>{T.disclaimer}</p>
        <span style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <a className="textlink" href={DOWNLOADS.workbook} download>{T.sample}</a>
          <span>{T.built}</span>
        </span>
      </div>
    </section>
  );
}
