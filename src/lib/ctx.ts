import { createContext, useContext, useEffect, useState } from "react";
import type { Lang, Multipliers, Product } from "./types";
import type { Strings } from "./i18n";

export interface DemoCtx {
  lang: Lang;
  t: Strings;
  m: Multipliers;
  setM: (m: Multipliers) => void;
  open: (p: Product) => void;
}

export const Ctx = createContext<DemoCtx>(null as unknown as DemoCtx);
export const useDemo = () => useContext(Ctx);

/** Props every screen receives. `ran` is true once the presenter has run the step. */
export interface ScreenProps {
  ran: boolean;
  run: () => void;
  /** Bumps when the presenter asks to replay the step's animation. */
  take: number;
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveal `count` items one after another once `active` turns true.
 * With `instant` (the step was already run earlier) everything shows at once.
 */
export function useReveal(active: boolean, count: number, every = 380, instant = false, key: unknown = 0) {
  const [n, setN] = useState(instant && active ? count : 0);
  useEffect(() => {
    if (!active) { setN(0); return; }
    if (instant || reducedMotion()) { setN(count); return; }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i >= count) window.clearInterval(id);
    }, every);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count, every, key]);
  return n;
}

/** Animate a number from 0 to `to` over `ms` when `active`. */
export function useCount(active: boolean, to: number, ms = 1400, key: unknown = 0) {
  const [v, setV] = useState(active ? to : 0);
  useEffect(() => {
    if (!active) { setV(0); return; }
    if (reducedMotion()) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setV(to * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, ms, key]);
  return v;
}

/** True one frame after mount, so CSS width transitions start from zero. */
export function useMounted(dep: unknown = 0) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true)));
    return () => cancelAnimationFrame(id);
  }, [dep]);
  return on;
}

/** True when the step had already been run before this screen mounted, and not replayed since. */
export function useInstant(ran: boolean, take: number) {
  const [init] = useState({ ran, take });
  return init.ran && init.take === take;
}
