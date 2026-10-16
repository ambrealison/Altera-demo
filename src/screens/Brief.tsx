import { useDemo } from "../lib/ctx";
import { PRODUCTS, RETAILER } from "../lib/calc";
import type { Product } from "../lib/types";
import { Head, useFmt } from "../components/ui";

/** The rows shown first are chosen to show what raw retailer data looks like. */
function sample(): Product[] {
  const pick = (cond: (p: Product) => boolean, n = 1) => PRODUCTS.filter(cond).slice(0, n);
  const has = (p: Product, i: string) => (p.issues ?? []).includes(i);
  const out = [
    ...pick((p) => p.dept === "Fresh Meat & Poultry" && !!p.ingredients && !p.issues?.length),
    ...pick((p) => has(p, "missing_weight")),
    ...pick((p) => has(p, "leading_zero")),
    ...pick((p) => p.code_kind === "instore"),
    ...pick((p) => p.pt === "composite" && !!p.ingredients && !p.issues?.length),
    ...pick((p) => has(p, "default_weight")),
    ...pick((p) => has(p, "per_pack_protein")),
    ...pick((p) => p.dept === "Plant-Based" && !p.issues?.length),
    ...pick((p) => has(p, "test_item")),
    ...pick((p) => p.dept === "Beer, Wine & Spirits"),
    ...pick((p) => has(p, "bad_check_digit")),
    ...pick((p) => p.dept === "Household" && !has(p, "test_item")),
    ...pick((p) => p.dept === "Cheese" && !p.ingredients),
    ...pick((p) => has(p, "no_sales")),
  ];
  return Array.from(new Set(out));
}
const ROWS = sample();

export default function Brief() {
  const { t, lang } = useDemo();
  const f = useFmt();
  const T = t.brief;
  const declared = (p: Product) => p.prot_declared_bad ?? (p.prot_src === "declared" ? p.prot : undefined);

  return (
    <div className="split">
      <div className="story">
        <Head eyebrow={T.eyebrow} title={T.title} lead={T.lead} />
        <p className="note">
          {lang === "fr"
            ? "Les cellules surlignées sont des pièges ordinaires d'une extraction : poids absent, code commençant par des zéros qu'Excel effacerait, valeur par paquet, article de test. L'agent doit les repérer, pas les deviner."
            : "Highlighted cells are the ordinary traps of an extraction: a missing weight, a code starting with zeros that Excel would erase, a per-pack value, a test item. The agent has to find them, not guess them."}
        </p>
      </div>
      <div>
        <div className="raw-meta">
          <span><b>{RETAILER.toLowerCase().replace(" ", "_")}_catalogue_2026.csv</b></span>
          <span>{f.int(PRODUCTS.length)} {T.rows}</span>
          <span>UTF-8 · ;</span>
        </div>
        <div className="tablewrap tall">
          <table className="data raw">
            <thead>
              <tr>{T.cols.map((c, i) => <th key={c} className={i >= 6 ? "r" : ""}>{c}</th>)}</tr>
            </thead>
            <tbody>
              {ROWS.map((p) => {
                const iss = p.issues ?? [];
                const d = declared(p);
                return (
                  <tr key={p.id}>
                    <td className={`code ${iss.includes("leading_zero") || iss.includes("bad_check_digit") ? "flag" : ""}`}>
                      {p.code}
                    </td>
                    <td className={`label ${iss.includes("test_item") ? "flag" : ""}`}>{p.label}</td>
                    <td>{p.brand}</td>
                    <td>{p.dept}</td>
                    <td className={`r ${p.weight_raw === undefined || iss.includes("default_weight") ? "flag" : ""}`}>{p.weight_raw === undefined ? T.missing : p.weight_raw}</td>
                    <td className={`ingr ${p.ingredients ? "" : "miss"}`} title={p.ingredients}>{p.ingredients || T.missing}</td>
                    <td className={`r ${iss.includes("per_pack_protein") ? "flag" : ""} ${d === undefined ? "miss" : ""}`}>{d === undefined ? T.missing : d}</td>
                    <td className={`r ${iss.includes("no_sales") ? "flag" : ""}`}>{p.units ?? 0}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={8} className="miss" style={{ textAlign: "center", fontFamily: "var(--mono)" }}>
                  … {f.int(PRODUCTS.length - ROWS.length)} {lang === "fr" ? "lignes de plus" : "more rows"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
