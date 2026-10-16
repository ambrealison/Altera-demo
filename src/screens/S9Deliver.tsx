import { useDemo } from "../lib/ctx";
import { fill } from "../lib/i18n";
import { FUNNEL } from "../lib/calc";
import { DOWNLOADS } from "../config";
import { Head } from "../components/ui";

export default function S9() {
  const { t, lang } = useDemo();
  const T = t.s9;
  const scope = fill(T.scopeExcerpt, { measured: FUNNEL.measured, nonFood: FUNNEL.nonFood, tests: FUNNEL.tests, unsold: FUNNEL.unsold });
  return (
    <div className="stack" style={{ gap: 28 }}>
      <div className="wide">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
      </div>
      <div className="deliver">
        <article className="dl">
          <span className="ic" style={{ background: "var(--plant)" }}>XLSX</span>
          <h3>{T.workbook.t}</h3>
          <p>{T.workbook.b}</p>
          <a className="btn btn-primary" href={DOWNLOADS.workbook} download>{T.workbook.dl}</a>
        </article>
        <article className="dl">
          <span className="ic" style={{ background: "var(--navy)" }}>CSV</span>
          <h3>{T.file.t}</h3>
          <p>{T.file.b}</p>
          <a className="btn btn-primary" href={DOWNLOADS.file} download>{T.file.dl}</a>
        </article>
        <article className="dl">
          <span className="ic" style={{ background: "var(--gold)" }}>TXT</span>
          <h3>{T.scope.t}</h3>
          <p>{T.scope.b}</p>
          <blockquote className="scope-quote" style={{ margin: 0 }}>
            {lang === "fr" ? "« " : "“"}{scope}{lang === "fr" ? " »" : "”"}
          </blockquote>
        </article>
      </div>
      <p className="note" style={{ marginTop: 0 }}>{T.note}</p>
    </div>
  );
}
