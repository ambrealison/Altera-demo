import type { ReactNode } from "react";
import { useDemo, useMounted } from "../lib/ctx";
import { VOCAB, dept } from "../lib/i18n";
import { fmtInt, fmtNum, fmtPct } from "../lib/calc";
import type { Product, PtClass } from "../lib/types";

export function Head({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: ReactNode }) {
  return (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="title">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </>
  );
}

export function RunButton({ ran, run, label }: { ran: boolean; run: () => void; label: string }) {
  const { t } = useDemo();
  return (
    <button className={ran ? "btn btn-ghost" : "btn btn-run"} onClick={run}>
      {ran ? `↻ ${t.replay}` : `▶ ${label}`}
    </button>
  );
}

export function Pending({ label, run }: { label: string; run: () => void }) {
  const { lang } = useDemo();
  return (
    <div className="pending">
      <div>{lang === "fr" ? "En attente de lancement" : "Waiting to run"}</div>
      <button className="btn btn-run" onClick={run}>▶ {label}</button>
    </div>
  );
}

// ------------------------------------------------------------ agent log
export interface LogLine { g?: "ok" | "warn" | "arrow"; text: ReactNode }

export function AgentLog({ lines, shown, title, running }: { lines: LogLine[]; shown: number; title: string; running: boolean }) {
  const glyph = { ok: "✓", warn: "!", arrow: "›" } as const;
  return (
    <div className="log" role="log" aria-live="polite">
      <div className="log-head">
        <span className={running ? "live" : "live idle"} aria-hidden />
        <span>{title}</span>
      </div>
      <div className="log-body">
        {lines.slice(0, shown).map((l, i) => (
          <div className="log-line" key={i}>
            <span className={`g ${l.g === "warn" ? "warn" : l.g === "arrow" ? "arrow" : ""}`}>{glyph[l.g ?? "ok"]}</span>
            <span>{l.text}</span>
          </div>
        ))}
        {shown < lines.length && <span className="cursor" aria-hidden />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ bars
export interface BarDatum { label: ReactNode; value: number; display?: string; tone?: string; title?: string }

export function Bars({ data, max, on = true, tall = false }: { data: BarDatum[]; max?: number; on?: boolean; tall?: boolean }) {
  const mounted = useMounted();
  const top = max ?? Math.max(...data.map((d) => d.value), 1e-9);
  return (
    <div className="bars">
      {data.map((d, i) => (
        <div className="bar-row" key={i} title={d.title}>
          <span className="lab">{d.label}</span>
          <span className={tall ? "track tall" : "track"}>
            <span className={`fill ${d.tone ?? "navy"}`} style={{ width: on && mounted ? `${(100 * d.value) / top}%` : 0 }} />
          </span>
          <span className="val">{d.display ?? d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Stacked({ parts, on = true, height }: { parts: { value: number; color: string; label?: string }[]; on?: boolean; height?: number }) {
  const mounted = useMounted();
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div className="stacked" style={height ? { height } : undefined}>
      {parts.map((p, i) => (
        <div key={i} style={{ flexBasis: on && mounted ? `${(100 * p.value) / total}%` : "0%", background: p.color }}>
          {p.value / total > 0.08 ? p.label : ""}
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { color: string; label: ReactNode }[] }) {
  return (
    <div className="legend">
      {items.map((it, i) => (
        <span key={i}><i style={{ background: it.color }} />{it.label}</span>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ chips
export const CLASS_COLOR: Record<PtClass, string> = {
  animal_core: "var(--blue)", composite: "var(--comp)", plant_non_core: "var(--plant-soft)", plant_core: "var(--plant)",
};

export function ClassChip({ c }: { c?: PtClass }) {
  const { lang } = useDemo();
  if (!c) return null;
  return <span className={`chip ${c}`}><span className="dot" />{VOCAB[lang][c]}</span>;
}

export function RouteChip({ p }: { p: Product }) {
  const { lang } = useDemo();
  if (!p.route) return <span className="chip excl">{lang === "fr" ? "Hors périmètre" : "Out of scope"}</span>;
  const short = {
    en: { inherited: "Inherited", stratum: "Neighbours", model: "Model" },
    fr: { inherited: "Hérité", stratum: "Voisins", model: "Modèle" },
  }[lang][p.route];
  return (
    <span className="row" style={{ gap: 4 }}>
      <span className={`chip ${p.route}`}>{short}</span>
      {p.review && <span className="chip review">{lang === "fr" ? "À relire" : "Review"}</span>}
    </span>
  );
}

export function WwfChip({ p }: { p: Product }) {
  const { lang } = useDemo();
  const V = VOCAB[lang];
  if (!p.in_scope) return null;
  if (p.wwf.excl) return <span className="chip excl">{lang === "fr" ? "Exclu" : "Excluded"}</span>;
  if (p.wwf.struct === "composite") return <span className="chip composite">Composite · {V[p.wwf.cat ?? ""]}</span>;
  return <span className="chip">{p.wwf.fg}{p.wwf.sub ? ` · ${V[p.wwf.sub]}` : ""}</span>;
}

export function SplitBar({ p }: { p: Product }) {
  const t = p.prot || 0;
  const pl = t ? (100 * (p.plant ?? 0)) / t : 0;
  return (
    <div className="splitbar" aria-hidden>
      <div className="pl" style={{ width: `${pl}%` }} />
      <div className="an" style={{ width: `${t ? 100 - pl : 0}%` }} />
    </div>
  );
}

export function useFmt() {
  const { lang } = useDemo();
  return {
    int: (n: number) => fmtInt(n, lang),
    pct: (n: number, d = 1) => fmtPct(n, lang, d),
    num: (n: number, d = 1) => fmtNum(n, lang, d),
    dept: (d: string) => dept(d, lang),
    kg: (kg: number) => (kg >= 1 ? `${fmtNum(kg, lang, kg % 1 ? 2 : 0)} kg` : `${fmtInt(kg * 1000, lang)} g`),
  };
}
