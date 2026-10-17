import type { ReactNode } from "react";
import type { Lang } from "./lib/types";
import { GLOSSARY } from "./lib/i18n";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const RE: Record<Lang, RegExp> = {
  en: new RegExp(`(?<![\\p{L}\\d])(${GLOSSARY.en.map(([t]) => esc(t)).join("|")})(?![\\p{L}\\d])`, "giu"),
  fr: new RegExp(`(?<![\\p{L}\\d])(${GLOSSARY.fr.map(([t]) => esc(t)).join("|")})(?![\\p{L}\\d])`, "giu"),
};

/** A term with its definition, shown on hover or keyboard focus. */
function Term({ def, children }: { def: string; children: ReactNode }) {
  return (
    <span className="term" tabIndex={0}>
      {children}
      <span className="term-pop" role="tooltip">{def}</span>
    </span>
  );
}

/** Text in which the first occurrence of each glossary term explains itself. */
export function Gloss({ text, lang }: { text: string; lang: Lang }) {
  const out: ReactNode[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(RE[lang])) {
    const key = m[0].toLowerCase();
    const def = GLOSSARY[lang].find(([t]) => t.toLowerCase() === key)?.[1];
    if (!def || seen.has(key) || m.index === undefined) continue;
    seen.add(key);
    out.push(text.slice(last, m.index));
    out.push(<Term key={m.index} def={def}>{m[0]}</Term>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}
