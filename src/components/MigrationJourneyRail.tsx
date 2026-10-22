import React, { useEffect, useRef, useState } from 'react';
import { Server, Cloud } from 'lucide-react';

/**
 * MigrationJourneyRail
 * A slim, fixed rail on the right edge. A glowing "workload" dot travels from an on-prem
 * rack (top) to the hyperscaler cloud (bottom) as the visitor scrolls the page.
 * The four milestones match the "How evacuations are delivered" phases on the homepage.
 *
 * - Decorative layer: aria-hidden except for the milestone buttons.
 * - Desktop only (hidden below lg), so it never covers content on phones or tablets.
 * - Scroll progress is written straight to a CSS variable (no React re-render per frame).
 * - Honors prefers-reduced-motion.
 */

const PHASES = [
  { label: 'Discover', at: 0 },
  { label: 'Size & Decouple', at: 1 / 3 },
  { label: 'Live Cutover', at: 2 / 3 },
  { label: 'Day-2 DR', at: 1 }
];

const phaseForProgress = (p: number) => {
  if (p < 0.2) return 0;
  if (p < 0.5) return 1;
  if (p < 0.8) return 2;
  return 3;
};

export const MigrationJourneyRail: React.FC = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const [phase, setPhase] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollable(max > 400);
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      railRef.current?.style.setProperty('--p', p.toFixed(4));
      setPhase((prev) => {
        const next = phaseForProgress(p);
        return prev === next ? prev : next;
      });
    };

    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const jumpTo = (at: number) => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: max * at, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!scrollable) return null;

  return (
    <nav
      aria-label="Page progress"
      className="hidden lg:flex fixed right-3 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 select-none"
    >
      <Server className="w-4 h-4 text-slate-400" aria-hidden="true" />

      <div
        ref={railRef}
        style={{ ['--p' as any]: 0 }}
        className="relative h-[46vh] min-h-[260px] w-6 flex justify-center"
      >
        {/* Track */}
        <div className="absolute inset-y-0 w-px bg-slate-600/40" aria-hidden="true" />

        {/* Filled progress */}
        <div
          aria-hidden="true"
          className="absolute top-0 w-px bg-gradient-to-b from-cyan-400 to-emerald-400"
          style={{ height: 'calc(var(--p) * 100%)' }}
        />

        {/* Travelling workload dot */}
        <div
          aria-hidden="true"
          className="absolute -translate-y-1/2"
          style={{ top: 'calc(var(--p) * 100%)' }}
        >
          <span className="block w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_3px_rgba(34,211,238,0.55)]" />
        </div>

        {/* Milestones */}
        {PHASES.map((ph, i) => {
          const active = phase === i;
          const passed = phase > i;
          return (
            <button
              key={ph.label}
              type="button"
              onClick={() => jumpTo(ph.at)}
              aria-label={`Scroll to ${ph.label}`}
              aria-current={active ? 'step' : undefined}
              className="group absolute -translate-y-1/2 flex items-center justify-center w-6 h-6 cursor-pointer"
              style={{ top: `${ph.at * 100}%` }}
            >
              <span
                className={`block rounded-full border transition-all motion-reduce:transition-none ${
                  active
                    ? 'w-3 h-3 bg-cyan-400 border-cyan-200'
                    : passed
                    ? 'w-2 h-2 bg-emerald-400 border-emerald-300'
                    : 'w-2 h-2 bg-slate-900 border-slate-500 group-hover:border-cyan-300'
                }`}
              />
              <span
                className={`absolute right-7 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-900/90 border border-slate-700 text-cyan-200 backdrop-blur-sm transition-opacity motion-reduce:transition-none ${
                  active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }`}
              >
                {ph.label}
              </span>
            </button>
          );
        })}
      </div>

      <Cloud className="w-4 h-4 text-cyan-400" aria-hidden="true" />
    </nav>
  );
};
