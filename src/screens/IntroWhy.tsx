import { useDemo } from "../lib/ctx";
import { Head } from "../components/ui";

export default function IntroWhy() {
  const { t } = useDemo();
  const T = t.introWhy;
  return (
    <div className="wide">
      <Head eyebrow={T.eyebrow} title={T.title} />
      <div className="why-grid">
        {T.cards.map((c, i) => (
          <article className="why-card" key={i}>
            <h3>{c.t}</h3>
            <p>{c.b}</p>
          </article>
        ))}
      </div>
      <p className="closing">{T.closing}</p>
    </div>
  );
}
