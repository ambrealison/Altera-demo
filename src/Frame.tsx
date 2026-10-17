import { useLayoutEffect, useRef, useState } from "react";
import type { Lang } from "./lib/types";
import { STEPS, STRINGS, TIPS, UI_STR, fill } from "./lib/i18n";
import { STOPS, type Stop } from "./tour";
import { SceneView } from "./scenes";

const W = 1240, H = 760;
/** Below this width the explanation moves under the app window. */
const NARROW = 1000;

interface Props { index: number; lang: Lang; onNext: () => void; onBack: () => void }

/**
 * One step of the tour. The app window is shown whole; what the step is about is framed
 * in lavender and the rest toned down. The explanation sits beside the window (below it
 * on narrow screens), so it never covers the interface.
 */
export function Tour({ index, lang, onNext, onBack }: Props) {
  const stop: Stop = STOPS[index];
  const S = STRINGS[lang];
  const U = UI_STR[lang];
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [narrow, setNarrow] = useState(false);

  // fit the 1240×760 window into the space left by the explanation
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const fit = () => {
      const n = window.innerWidth < NARROW;
      setNarrow(n);
      const w = el.clientWidth, h = el.clientHeight;
      setScale(n ? w / W : Math.min(w / W, h / H, 1.1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener("resize", fit);
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);

  const tip = TIPS[lang][stop.id];
  const last = index === STOPS.length - 1;

  return (
    <div className={`tour ${narrow ? "narrow" : ""}`}>
      <div className="stage" ref={stageRef} style={narrow ? { height: H * scale } : undefined}>
        <div className="scaled" style={{ width: W * scale, height: H * scale, opacity: scale ? 1 : 0 }}>
          <div className="canvas" style={{ transform: `scale(${scale})` }}>
            <div className="frame">
              <div className="window">
                <div className="wbar">
                  <span className="wlogo">Altera<em>.ai</em></span>
                  <span className="crumb"><b>{U.project.split("·")[0]}</b>·{U.project.split("·")[1]}</span>
                  <span className="wright"><span className="badge">Demo</span><span className="avatar">HM</span></span>
                </div>
                <div className="wbody">
                  <aside className="side">
                    <div className="side-label">{U.workflow}</div>
                    {STEPS[lang].map((s, i) => {
                      const n = i + 1;
                      const state = n < stop.chapter ? "done" : n === stop.chapter ? "now" : "";
                      return (
                        <div key={s} className={`sstep ${state}`} aria-current={n === stop.chapter ? "step" : undefined}>
                          <span className="c">{n < stop.chapter ? "✓" : n}</span>
                          <span className="st">{s}</span>
                        </div>
                      );
                    })}
                    <div className="side-foot">{S.fictitious}</div>
                  </aside>
                  <main className="main">
                    <div className="shead" key={`h-${stop.chapter}-${lang}`} style={{ animation: "fadein .5s both" }}>
                      <div className="k">{fill(U.stepN, { n: stop.chapter })}<span className="kstep">Altera AI</span></div>
                      <h2>{STEPS[lang][stop.chapter - 1]}</h2>
                      <p>{U.sub[stop.chapter - 1]}</p>
                    </div>
                    <div className="scene spot" key={`${stop.scene}-${lang}`}>
                      <SceneView scene={stop.scene} sub={stop.sub} focus={stop.focus} lang={lang} />
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="guide" key={`${index}-${lang}`} aria-live="polite" aria-label={tip.t}>
        <div className="g-meta">{fill(U.stepOf, { n: stop.chapter, t: STOPS.length })}</div>
        <div className="g-bars" aria-hidden>
          {STOPS.map((s) => <i key={s.id} className={s.chapter < stop.chapter ? "done" : s.chapter === stop.chapter ? "now" : ""} />)}
        </div>
        <h2>{tip.t}</h2>
        <p>{tip.s}</p>
        <div className="g-nav">
          <button className="g-back" onClick={onBack} aria-label={S.back}>←</button>
          <button className="g-next" onClick={onNext} autoFocus>{last ? S.next : S.nextStep} <span>→</span></button>
        </div>
      </aside>
    </div>
  );
}
