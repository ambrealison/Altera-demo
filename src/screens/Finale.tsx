import { useDemo } from "../lib/ctx";
import { BOOKING_URL } from "../config";
import { Head } from "../components/ui";

export default function Finale() {
  const { t } = useDemo();
  const T = t.finale;
  return (
    <div className="finale">
      <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
      <div className="row" style={{ gap: 12 }}>
        <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noopener" style={{ padding: "13px 24px", fontSize: 16 }}>{t.cta} →</a>
        <a className="btn btn-ghost" href="#ratio">{T.secondary}</a>
      </div>
      <p className="disclaimer">{T.disclaimer}</p>
      <span className="built">{t.builtWith}</span>
    </div>
  );
}
