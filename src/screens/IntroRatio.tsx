import { useState } from "react";
import { useDemo } from "../lib/ctx";
import { Head, Legend, Stacked, useFmt } from "../components/ui";

/** Three toy products: enough to show that the ratio weighs protein by what is sold. */
const TOYS = [
  { id: "chicken", side: "animal", kg: 0.5, prot: 24, base: 1000, en: ["Chicken breast fillets", "500 g · 24 g protein /100 g"], fr: ["Filets de poulet", "500 g · 24 g de protéines /100 g"] },
  { id: "milk", side: "animal", kg: 1.03, prot: 3.6, base: 3000, en: ["Semi-skimmed milk", "1 L · 3.6 g protein /100 g"], fr: ["Lait demi-écrémé", "1 L · 3,6 g de protéines /100 g"] },
  { id: "chickpeas", side: "plant", kg: 0.4, prot: 7, base: 800, en: ["Chickpeas", "400 g · 7 g protein /100 g"], fr: ["Pois chiches", "400 g · 7 g de protéines /100 g"] },
] as const;

export default function IntroRatio() {
  const { t, lang } = useDemo();
  const f = useFmt();
  const T = t.introRatio;
  const [u, setU] = useState<Record<string, number>>(() => Object.fromEntries(TOYS.map((x) => [x.id, x.base])));
  const kgProt = (x: (typeof TOYS)[number]) => (u[x.id] * x.kg * x.prot) / 100;
  const plant = TOYS.filter((x) => x.side === "plant").reduce((a, x) => a + kgProt(x), 0);
  const total = TOYS.reduce((a, x) => a + kgProt(x), 0);
  const ratio = total ? plant / total : 0;
  const changed = TOYS.some((x) => u[x.id] !== x.base);

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <div className="formula" aria-label={`${T.formulaTop} / ${T.formulaBottom}`}>
          <span className="frac">
            <span className="top">{T.formulaTop}</span>
            <span className="bot">{T.formulaBottom}</span>
          </span>
        </div>
        <p className="note" style={{ marginTop: 0 }}>{T.formulaEach}</p>
      </div>

      <div className="stack">
        <div className="card">
          <div className="card-head">
            <div>
              <h2 className="sub">{T.tryTitle}</h2>
              <div className="muted small">{T.tryLead}</div>
            </div>
          </div>
          <div className="toy">
            {TOYS.map((x) => (
              <div className="toy-row" key={x.id}>
                <div>
                  <div className="nm" style={{ color: x.side === "plant" ? "var(--plant)" : "var(--blue)" }}>{x[lang][0]}</div>
                  <div className="meta">{x[lang][1]}</div>
                </div>
                <label>
                  <span className="sr">{x[lang][0]}</span>
                  <input type="range" min={0} max={5000} step={50} value={u[x.id]}
                    onChange={(e) => setU({ ...u, [x.id]: Number(e.target.value) })} />
                </label>
                <div className="p">
                  <div className="mono">{f.int(u[x.id])} <span className="muted">{T.sold}</span></div>
                  <div className="muted small">{f.num(kgProt(x), 0)} kg {lang === "fr" ? "prot." : "prot."}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22 }}>
            <Stacked height={40} parts={[
              { value: plant, color: "var(--plant)", label: `${f.num(plant, 0)} kg` },
              { value: total - plant, color: "var(--blue)", label: `${f.num(total - plant, 0)} kg` },
            ]} />
            <Legend items={[
              { color: "var(--plant)", label: lang === "fr" ? "Protéines végétales vendues" : "Plant protein sold" },
              { color: "var(--blue)", label: lang === "fr" ? "Protéines animales vendues" : "Animal protein sold" },
            ]} />
          </div>
          <div className="row" style={{ marginTop: 22, justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="muted small">{T.ratio}</div>
              <div className="figure"><span className="big">{f.pct(ratio)}</span></div>
            </div>
            <div className="row">
              <button className="btn btn-ghost btn-sm" onClick={() => setU({ ...u, chickpeas: Math.min(5000, u.chickpeas * 2) })}>{T.double}</button>
              {changed && <button className="btn btn-ghost btn-sm" onClick={() => setU(Object.fromEntries(TOYS.map((x) => [x.id, x.base])))}>{T.reset}</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
