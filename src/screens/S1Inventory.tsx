import { useDemo, useInstant, useReveal, type ScreenProps } from "../lib/ctx";
import { fill } from "../lib/i18n";
import { FILL, PRODUCTS, RETAILER, hasIssue } from "../lib/calc";
import { AgentLog, Bars, Head, Pending, RunButton, useFmt, type LogLine } from "../components/ui";

export default function S1({ ran, run, take }: ScreenProps) {
  const { t, lang } = useDemo();
  const f = useFmt();
  const T = t.s1;
  const instant = useInstant(ran, take);
  const vars = {
    lz: PRODUCTS.filter((p) => hasIssue(p, "leading_zero")).length,
    rows: f.int(PRODUCTS.length),
    sold: f.int(PRODUCTS.filter((p) => (p.units ?? 0) > 0).length),
    known: f.int(PRODUCTS.filter((p) => p.route === "inherited").length),
  };
  const lines: LogLine[] = T.log.map((s, i) => ({ g: i === 1 ? "warn" : "ok", text: fill(s, vars) }));
  const shown = useReveal(ran, lines.length, 520, instant, take);
  const done = shown >= lines.length;

  const fillData = (Object.keys(FILL) as (keyof typeof FILL)[]).map((k) => ({
    label: T.fill[k], value: FILL[k], display: f.pct(FILL[k], FILL[k] < 1 && FILL[k] > 0.99 ? 1 : 0),
    tone: FILL[k] > 0.95 ? "navy" : FILL[k] > 0.7 ? "soft" : "gold",
  }));

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <RunButton ran={ran} run={run} label={T.action} />
        <p className="note">{T.note}</p>
      </div>
      <div className="stack">
        {!ran ? <Pending label={T.action} run={run} /> : (
          <AgentLog title={`altera-ai · ${RETAILER.toLowerCase().replace(" ", "-")} · ${lang === "fr" ? "inventaire" : "inventory"}`} lines={lines} shown={shown} running={!done} />
        )}
        {ran && (
          <div className="card" style={{ opacity: done ? 1 : 0.35, transition: "opacity .5s" }}>
            <h3 className="mini">{T.fillTitle}</h3>
            <Bars data={fillData} max={1} on={done} />
          </div>
        )}
      </div>
    </div>
  );
}
