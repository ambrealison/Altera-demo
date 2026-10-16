import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { Lang } from "./lib/types";
import { CHAPTERS, STRINGS, TIPS, UI_STR, fill } from "./lib/i18n";
import { fmtPct } from "./lib/calc";
import { F, REVIEW } from "./lib/facts";
import { STOPS, type Stop } from "./tour";
import { SceneView } from "./scenes";

const W = 1240, H = 760, TIP_W = 340, GAP = 26;

function tipVars(lang: Lang) {
  return {
    measured: F.funnel.measured, rev: REVIEW.length,
    pl: fmtPct(F.crispsPlant, lang, 0), ratio: fmtPct(F.ptRatio, lang, 1),
  };
}
type Side = "left" | "right" | "below" | "above";

interface Props { index: number; lang: Lang; onNext: () => void; onBack: () => void }

export function Tour({ index, lang, onNext, onBack }: Props) {
  const stop: Stop = STOPS[index];
  const S = STRINGS[lang];
  const U = UI_STR[lang];
  const fitRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [pt, setPt] = useState<{ x: number; y: number; side: Side } | null>(null);
  const [tipH, setTipH] = useState(220);

  // fit the 1240×760 canvas into the available space
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const narrow = window.innerWidth < 760;
      setMobile(narrow);
      setScale(narrow ? w / W : Math.min(w / W, h / H, 1.15));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // locate the anchor in canvas coordinates; re-measure while the scene animates
  const locate = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !scale) return;
    const a = c.querySelector<HTMLElement>(`[data-anchor="${stop.anchor}"]`);
    if (!a) { setPt(null); return; }
    const cr = c.getBoundingClientRect(), ar = a.getBoundingClientRect();
    const l = (ar.left - cr.left) / scale, t = (ar.top - cr.top) / scale;
    const w = ar.width / scale, h = ar.height / scale;
    const cx = l + w / 2;
    const y = h > 180 ? t + 44 : t + h / 2;
    // the hotspot sits on the edge of the target that faces the tooltip,
    // so the tooltip never hides what it describes
    const roomRight = l + w + GAP + TIP_W < W - 12;
    const side: Side = stop.side ?? (w >= 300 ? (cx > W * 0.55 ? "left" : "right") : roomRight ? "right" : "left");
    if (side === "below") setPt({ x: cx, y: t + h, side });
    else if (side === "above") setPt({ x: cx, y: t, side });
    else if (side === "right") setPt({ x: l + w, y, side });
    else setPt({ x: l, y, side });
  }, [stop.anchor, stop.side, scale]);

  useLayoutEffect(() => {
    setPt(null);
    const timers = [60, 300, 700, 1200].map((t) => window.setTimeout(locate, t));
    return () => timers.forEach(clearTimeout);
  }, [locate, index, lang]);

  useLayoutEffect(() => {
    if (tipRef.current) setTipH(tipRef.current.offsetHeight);
  }, [pt, index, lang]);

  const [title, body] = TIPS[lang][stop.id];
  const text = fill(body, tipVars(lang));
  const last = index === STOPS.length - 1;

  // tooltip beside the hotspot: right if there is room, else left; clamped vertically
  let tip = { left: 0, top: 0, arrowTop: 0, arrowLeft: 0, side: "right" as Side };
  if (pt?.side === "below" || pt?.side === "above") {
    const left = Math.max(12, Math.min(W - TIP_W - 12, pt.x - TIP_W / 2));
    const top = pt.side === "below" ? pt.y + GAP : pt.y - GAP - tipH;
    tip = { left, top, arrowTop: 0, arrowLeft: pt.x - left - 7, side: pt.side };
  } else if (pt) {
    const right = pt.side === "right" && pt.x + GAP + TIP_W < W - 12;
    const left = right ? pt.x + GAP : Math.max(12, pt.x - GAP - TIP_W);
    const top = Math.max(16, Math.min(H - tipH - 16, pt.y - tipH / 2));
    tip = { left, top, arrowTop: Math.max(18, Math.min(tipH - 32, pt.y - top - 7)), arrowLeft: 0, side: right ? "right" : "left" };
  }

  const card = (
    <div className={mobile ? "tip sheet-tip" : "tip"} ref={tipRef} key={`${index}-${lang}`}
      style={mobile ? undefined : { left: tip.left, top: tip.top, visibility: pt ? "visible" : "hidden" }}
      role="dialog" aria-live="polite" aria-label={title}>
      {!mobile && pt && <span className="arrow" style={
        tip.side === "below" ? { top: -6, left: tip.arrowLeft }
        : tip.side === "above" ? { bottom: -6, left: tip.arrowLeft }
        : { top: tip.arrowTop, [tip.side === "right" ? "left" : "right"]: -6 }} />}
      <div className="tmeta">
        <span>{String(stop.chapter).padStart(2, "0")} · {CHAPTERS[lang][stop.chapter - 1]}</span>
        <span>{index + 1} / {STOPS.length}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="tact">
        <button className="tback" onClick={onBack} aria-label={S.back}>←</button>
        <span className="dotsbar" aria-hidden>
          {CHAPTERS[lang].map((_, i) => <i key={i} className={i < stop.chapter ? "on" : ""} />)}
        </span>
        <button className="tnext" onClick={onNext} autoFocus>{last ? S.finish : S.next} <span>→</span></button>
      </div>
    </div>
  );

  return (
    <div className="tour">
      <div className="fit" ref={fitRef} style={mobile ? { flex: "none", height: H * scale } : undefined}>
        <div className="scaled" style={{ width: W * scale, height: H * scale, opacity: scale ? 1 : 0 }}>
          <div className="canvas" ref={canvasRef} style={{ transform: `scale(${scale})` }}>
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
                    {CHAPTERS[lang].map((s, i) => (
                      <div key={s} className={`sstep ${i + 1 < stop.chapter ? "done" : i + 1 === stop.chapter ? "now" : ""}`}>
                        <span className="c">{i + 1 < stop.chapter ? "✓" : i + 1}</span>{s}
                      </div>
                    ))}
                    <div className="side-foot">{S.fictitious}</div>
                  </aside>
                  <main className="main">
                    <div className="shead" key={`h-${stop.chapter}-${lang}`} style={{ animation: "fadein .5s both" }}>
                      <div className="k">{fill(U.stepOf, { n: stop.chapter })}</div>
                      <h2>{CHAPTERS[lang][stop.chapter - 1]}</h2>
                      <p>{U.sub[stop.chapter - 1]}</p>
                    </div>
                    <div className="scene" key={`${stop.scene}-${lang}`}>
                      <SceneView scene={stop.scene} sub={stop.sub} anchor={stop.anchor} lang={lang} />
                    </div>
                  </main>
                </div>
              </div>
            </div>
            <div className="layer">
              {pt && (
                <button className="hot" key={`hot-${index}`} style={{ left: pt.x, top: pt.y }} onClick={onNext} aria-label={S.next}>
                  <i />
                </button>
              )}
              {!mobile && card}
            </div>
          </div>
        </div>
      </div>
      {mobile && card}
    </div>
  );
}
