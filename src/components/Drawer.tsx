import { useEffect } from "react";
import { useDemo } from "../lib/ctx";
import { EXPLAIN, NOTES, VOCAB, fill } from "../lib/i18n";
import type { Product } from "../lib/types";
import { ClassChip, RouteChip, SplitBar, useFmt } from "./ui";

export function Drawer({ p, onClose }: { p: Product; onClose: () => void }) {
  const { t, lang } = useDemo();
  const f = useFmt();
  const V = VOCAB[lang];
  const X = EXPLAIN[lang];
  const D = t.drawer;

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const weightRaw = p.weight_raw === undefined ? "—" : String(p.weight_raw);
  const declared = p.prot_declared_bad ?? (p.prot_src === "declared" ? p.prot : undefined);
  const weightNote =
    p.weight_src === "label" ? (lang === "fr" ? `lu dans le libellé « ${p.label} »` : `read from the label “${p.label}”`)
    : p.weight_src === "typical_piece" ? (lang === "fr" ? "poids typique de la pièce (1,0 par défaut dans le fichier)" : "typical piece weight (the file said 1.0 by default)")
    : p.weight_src === "variable" ? (lang === "fr" ? "vendu au poids, au kilo" : "sold by weight, per kilo")
    : "";

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={p.label}>
        <div className="drawer-head">
          <div className="lbl">{p.label}</div>
          <div className="nm">{p.name} · {p.brand} · {f.dept(p.dept)}</div>
          <button className="drawer-close" onClick={onClose} aria-label={D.close}>×</button>
        </div>
        <div className="drawer-body">
          <section className="dsec">
            <h4>{D.record}</h4>
            <dl className="kv">
              <dt>{D.code}</dt>
              <dd className="mono">{p.code}{p.code_kind !== "ean" && <span className="muted"> · {p.code_kind === "instore" ? (lang === "fr" ? "code magasin" : "in-store code") : (lang === "fr" ? "clé de contrôle fausse" : "check digit fails")}</span>}</dd>
              <dt>{D.weight}</dt>
              <dd className="mono">{weightRaw}{p.weight_src !== "declared" && <span className="muted"> → {f.kg(p.weight)} · {weightNote}</span>}</dd>
              <dt>{D.ingredients}</dt>
              <dd style={{ fontSize: 13.5 }}>{p.ingredients || <span className="muted">{D.noIngredients}</span>}</dd>
              <dt>{lang === "fr" ? "Protéines déclarées" : "Declared protein"}</dt>
              <dd className="mono">{declared === undefined ? "—" : `${f.num(declared)} g`}</dd>
              <dt>{D.units}</dt>
              <dd className="mono">{p.units ? f.int(p.units) : "0"}</dd>
            </dl>
          </section>

          {!p.in_scope ? (
            <section className="dsec">
              <h4>{D.outOfScope}</h4>
              <div className="why gold">{p.note && !(p.issues ?? []).includes("no_sales") ? NOTES[lang][p.note] : (lang === "fr" ? "Aucune vente sur l'année : le produit ne pèse rien dans le ratio et sort du périmètre." : "No sales over the year: the product weighs nothing in the ratio and leaves the scope.")}</div>
            </section>
          ) : (
            <>
              <section className="dsec">
                <h4>{D.classification}</h4>
                <dl className="kv">
                  <dt>{D.route}</dt>
                  <dd><RouteChip p={p} /></dd>
                  <dt>{D.confidence}</dt>
                  <dd className="mono">{f.pct(p.conf ?? 0, 0)}</dd>
                  <dt>{D.pt}</dt>
                  <dd><ClassChip c={p.pt} /></dd>
                  <dt>{D.wwf}</dt>
                  <dd>
                    {p.wwf.excl ? <span className="chip excl">{V[p.wwf.excl]}</span>
                      : p.wwf.struct === "composite" ? <>{V.composite_s} · {V[p.wwf.cat ?? ""]}</>
                      : <>{V.whole} · <b>{p.wwf.fg}</b> {V[p.wwf.fg ?? ""]}{p.wwf.sub ? ` · ${V[p.wwf.sub]}` : ""}{p.wwf.src ? ` · ${V[p.wwf.src]}` : ""}{p.dairy && p.dairy > 1 ? ` · ×${p.dairy}` : ""}</>}
                  </dd>
                </dl>
                <div className="why">
                  {fill(X[p.route ?? "model"], { family: p.family })}
                  {p.requeried && <> {X.requeried}</>}
                  {p.review && <> {X.review}</>}
                </div>
                {p.note && NOTES[lang][p.note] && <div className="why gold">{NOTES[lang][p.note]}</div>}
              </section>

              <section className="dsec">
                <h4>{D.protein}</h4>
                <dl className="kv">
                  <dt>{D.perHundred}</dt>
                  <dd className="mono"><b>{f.num(p.prot ?? 0, (p.prot ?? 0) < 1 ? 2 : 1)} g</b></dd>
                  <dt>{D.route}</dt>
                  <dd>{V[p.prot_src ?? ""]}</dd>
                </dl>
                <div className="why">
                  {p.prot_declared_bad ? fill(X.per_pack, { bad: f.num(p.prot_declared_bad) }) + " " + X[p.prot_src ?? ""] : X[p.prot_src ?? ""]}
                </div>
              </section>

              <section className="dsec">
                <h4>{D.split}</h4>
                <SplitBar p={p} />
                <dl className="kv" style={{ marginTop: 12 }}>
                  <dt>{D.plant}</dt>
                  <dd className="mono" style={{ color: "var(--plant)" }}>{f.num(p.plant ?? 0, 2)} g</dd>
                  <dt>{D.animal}</dt>
                  <dd className="mono" style={{ color: "var(--blue)" }}>{f.num(p.animal ?? 0, 2)} g</dd>
                  <dt>{D.level}</dt>
                  <dd><span className={`chip lv${p.level}`}>{lang === "fr" ? "Niveau" : "Level"} {p.level}</span></dd>
                  <dt>{D.route}</dt>
                  <dd>{V[p.split_src ?? ""]}</dd>
                </dl>
                <div className="why">{X[p.split_src ?? ""]}</div>
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
