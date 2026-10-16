import type { Lang } from "./lib/types";
import { STRINGS, UI_STR, VOCAB } from "./lib/i18n";
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
  return (
    <div className="peek rise d4" aria-hidden>
      <div className="peek-frame">
        <div className="peek-win">
          <div className="peek-bar"><span className="wlogo">Altera<em>.ai</em></span><span className="crumb"><b>Harbour Market</b></span><span className="badge">Demo</span></div>
          <div className="peek-body">
            <div className="banner">
              <div>
                <div className="tagrow"><b>{U.result}</b>{U.fy}</div>
                <div className="h">{U.ptHeadline}</div>
                <div className="big">{fmtNum(F.ptRatio * 100, lang, 1)}<small>%</small></div>
              </div>
              <svg width="84" height="84" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(249,206,169,.9)" strokeWidth="9" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="#bfe3c9" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34 * F.ptRatio} 999`} transform="rotate(-90 40 40)" />
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
  const plant = T.items.filter((i) => i.side === "plant").reduce((a, i) => a + i.k, 0);
  const total = T.items.reduce((a, i) => a + i.k, 0);
  const share = plant / total;
  const pct = (share * 100).toLocaleString(lang === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 1 });
  return (
    <section className="slide">
      <div className="two">
        <div>
          <p className="eyebrow rise">{T.eyebrow}</p>
          <h1 className="display lg rise d1">{T.title}</h1>
          <p className="lead rise d2">{T.lead}</p>
          <div className="actions rise d3"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
        </div>
        <div className="formula-card rise d2">
          <div className="frac"><span className="t">{T.top}</span><span className="b">{T.bottom}</span></div>
          <p className="each">{T.each}</p>
          <div className="items">
            {T.items.map((it, i) => (
              <div className={`item rise d${i + 3}`} key={it.n}>
                <i style={{ background: it.side === "plant" ? "var(--plant)" : "var(--animal)" }} />
                <div><div className="n">{it.n}</div><div className="m">{it.m} · {it.u}</div></div>
                <div className="k">{it.k}<small>{T.kg}</small></div>
              </div>
            ))}
          </div>
          <div className="bar-split rise d5">
            <i style={{ width: `${share * 100}%`, background: "var(--plant)" }} />
            <i style={{ width: `${(1 - share) * 100}%`, background: "var(--animal)" }} />
          </div>
          <div className="result-line rise d6"><b>{pct}{lang === "fr" ? " %" : "%"}</b><span>{T.result}</span></div>
        </div>
      </div>
    </section>
  );
}

export function Methods({ lang, onNext }: P) {
  const T = STRINGS[lang].methods;
  const S = STRINGS[lang];
  const U = UI_STR[lang];
  const V = VOCAB[lang];
  const classes = [["animal_core", "var(--animal)"], ["composite", "var(--comp)"], ["plant_non_core", "var(--plant-2)"], ["plant_core", "var(--plant)"]] as const;
  return (
    <section className="slide">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display lg rise d1">{T.title}</h1>
      <p className="lead rise d2">{T.lead}</p>
      <div className="method-grid">
        <article className="mcard rise d3" style={{ background: "var(--lav)" }}>
          <span className="own">{T.pt.owner}</span>
          <h2>{T.pt.name}</h2>
          <span className="unit">{T.pt.unit}</span>
          <p>{T.pt.body}</p>
          <div className="tags">{classes.map(([c, col]) => <span className="tag" key={c}><i style={{ background: col }} />{U.classes[c]}</span>)}</div>
        </article>
        <article className="mcard rise d4" style={{ background: "var(--peach)" }}>
          <span className="own">{T.wwf.owner}</span>
          <h2>{T.wwf.name}</h2>
          <span className="unit">{T.wwf.unit}</span>
          <p>{T.wwf.body}</p>
          <div className="tags">{["FG1", "FG2", "FG3", "FG4", "FG5", "FG6", "FG7"].map((g) => <span className="tag" key={g}><b>{g}</b>{V[g]}</span>)}</div>
        </article>
      </div>
      <div className="actions rise d5"><button className="pill pill-dark" onClick={onNext} autoFocus>{S.next} <Arrow /></button></div>
    </section>
  );
}

export function Why({ lang, onNext }: P) {
  const T = STRINGS[lang].why;
  const colors = ["var(--sky)", "var(--pink)", "var(--green-soft)"];
  return (
    <section className="slide">
      <p className="eyebrow rise">{T.eyebrow}</p>
      <h1 className="display lg rise d1">{T.title}</h1>
      <div className="why-grid">
        {T.cards.map((c, i) => (
          <article className={`wcard rise d${i + 2}`} key={c.t} style={{ background: colors[i] }}>
            <h3>{c.t}</h3>
            <p>{c.b}</p>
          </article>
        ))}
      </div>
      <div className="actions rise d5"><button className="pill pill-dark" onClick={onNext} autoFocus>{T.go} <Arrow /></button></div>
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
