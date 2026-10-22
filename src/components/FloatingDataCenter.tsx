import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * FloatingDataCenter
 * A small floating illustration (on-prem server, cloud, DR server) pinned to the bottom-left
 * of the HOME page on large screens. It follows the visitor's scroll:
 *   first third  -> Migration  (cyan data rises from the racks into the cloud)
 *   second third -> Disaster recovery (amber replication to the DR site)
 *   last third   -> Implementation (LEDs come on one by one, links turn green)
 *
 * - Image lives in /public, so it is referenced by an absolute path.
 * - Scroll position is written to a CSS variable; React only re-renders when the phase changes.
 * - Desktop only (xl and up), never intercepts clicks (except the small hide button),
 *   and animations stop for visitors who prefer reduced motion.
 */

const IMG = '/Data_center_module_illustration_2K_20261022173328-Photoroom.png';

type Mode = 'migration' | 'dr' | 'impl';

const MODES: Record<Mode, { title: string; text: string; color: string }> = {
  migration: { title: 'Migration', text: 'Workloads move to the cloud in waves', color: '#22d3ee' },
  dr: { title: 'Disaster recovery', text: 'Replication keeps the DR site current', color: '#fbbf24' },
  impl: { title: 'Implementation', text: 'Every link up, every server healthy', color: '#34d399' }
};

const LEDS: Array<[number, number]> = [
  [745, 562], [745, 596], [745, 630], [745, 661],
  [860, 560], [860, 594], [860, 628], [860, 660]
];

const css = `
.dcm-tilt{transform:perspective(1000px) rotateY(calc(var(--dc-p,0)*-6deg + 3deg)) translateY(calc(var(--dc-p,0)*-18px));transition:transform .15s linear}
.dcm-float{animation:dcm-fl 7s ease-in-out infinite}
@keyframes dcm-fl{50%{transform:translateY(-8px)}}
.dcm-gl{position:absolute;border-radius:9999px;opacity:0;transition:opacity .7s;pointer-events:none}
.dcm-gc{left:30%;top:6%;width:36%;height:44%;background:radial-gradient(closest-side,rgba(34,211,238,.45),transparent)}
.dcm-ga{left:56%;top:22%;width:36%;height:42%;background:radial-gradient(closest-side,rgba(251,191,36,.5),transparent)}
.dcm-gg{left:30%;top:50%;width:34%;height:46%;background:radial-gradient(closest-side,rgba(52,211,153,.4),transparent)}
.dcm-layer{opacity:0;transition:opacity .7s}
.dcm-f{fill:none;stroke-linecap:round;stroke-width:3}
.dcm-up{stroke:#22d3ee;stroke-dasharray:2 16;animation:dcm-flow 1.1s linear infinite}
.dcm-am{stroke:#fbbf24;stroke-dasharray:3 12;animation:dcm-flow 1.4s linear infinite}
.dcm-gr{stroke:#34d399;stroke-dasharray:6 10;animation:dcm-flow 1.6s linear infinite}
@keyframes dcm-flow{to{stroke-dashoffset:-18}}
.dcm-led{fill:#34d399;opacity:0}
@keyframes dcm-on{from{opacity:0}to{opacity:1}}
[data-dcm="migration"] .dcm-lm,[data-dcm="dr"] .dcm-ld,[data-dcm="impl"] .dcm-li{opacity:1}
[data-dcm="migration"] .dcm-gc{opacity:.9}
[data-dcm="dr"] .dcm-ga{opacity:1}
[data-dcm="impl"] .dcm-gg{opacity:.85}
[data-dcm="impl"] .dcm-led{animation:dcm-on .4s forwards;animation-delay:calc(var(--i)*.2s)}
@media (prefers-reduced-motion:reduce){
  .dcm-tilt{transform:none;transition:none}
  .dcm-float,.dcm-up,.dcm-am,.dcm-gr,.dcm-led{animation:none!important}
  .dcm-layer,.dcm-gl{transition:none}
}
`;

export const FloatingDataCenter: React.FC = () => {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const rootRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('migration');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!onHome) return;
    let raf: number | null = null;

    const update = () => {
      raf = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rootRef.current?.style.setProperty('--dc-p', p.toFixed(3));
      const next: Mode = p < 0.34 ? 'migration' : p < 0.67 ? 'dr' : 'impl';
      setMode((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [onHome]);

  if (!onHome) return null;
  const m = MODES[mode];

  return (
    <div
      ref={rootRef}
      className="hidden xl:block fixed left-4 bottom-4 z-20 w-[300px] 2xl:w-[360px] pointer-events-none select-none"
    >
      <style>{css}</style>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="pointer-events-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 border border-slate-700 text-cyan-200 backdrop-blur-md cursor-pointer"
        >
          Show data center
        </button>
      ) : (
        <>
          <div className="dcm-tilt">
            <div className="dcm-float">
              <div data-dcm={mode} className="relative" style={{ aspectRatio: '2576 / 1438' }}>
                <img
                  src={IMG}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute inset-0 w-full h-full"
                />
                <div className="dcm-gl dcm-gc" />
                <div className="dcm-gl dcm-ga" />
                <div className="dcm-gl dcm-gg" />

                <svg
                  viewBox="0 0 1600 893"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <filter id="dcm-blur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" />
                    </filter>
                  </defs>

                  {/* Migration: data rises from the on-prem racks to the cloud */}
                  <g className="dcm-layer dcm-lm" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-up" d="M560 490V290" />
                    <path className="dcm-f dcm-up" d="M610 495V285" style={{ animationDelay: '-.3s' }} />
                    <path className="dcm-f dcm-up" d="M660 500V280" style={{ animationDelay: '-.6s' }} />
                    <path className="dcm-f dcm-up" d="M715 495V290" style={{ animationDelay: '-.2s' }} />
                    <path className="dcm-f dcm-up" d="M770 490V300" style={{ animationDelay: '-.5s' }} />
                  </g>

                  {/* Disaster recovery: replication to the DR site */}
                  <g className="dcm-layer dcm-ld" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-am" d="M807 484C870 350 1025 236 1155 323" />
                    <path className="dcm-f dcm-am" d="M815 490C890 370 1040 260 1160 335" style={{ animationDelay: '-.4s' }} />
                    <path className="dcm-f dcm-am" d="M822 498C905 390 1050 285 1165 348" style={{ animationDelay: '-.8s' }} />
                  </g>

                  {/* Implementation: links up, circuits green */}
                  <g className="dcm-layer dcm-li" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-gr" d="M610 770C520 810 420 850 330 893" />
                    <path className="dcm-f dcm-gr" d="M700 775C640 830 560 870 520 893" style={{ animationDelay: '-.5s' }} />
                    <path className="dcm-f dcm-gr" d="M1010 700C1150 660 1290 600 1330 540" style={{ animationDelay: '-.9s' }} />
                  </g>

                  <g filter="url(#dcm-blur)">
                    {LEDS.map(([x, y], i) => (
                      <circle
                        key={i}
                        className="dcm-led"
                        style={{ ['--i' as any]: i }}
                        cx={x}
                        cy={y}
                        r={5}
                      />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
            <span
              className="block w-2 h-2 rounded-full shrink-0"
              style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
            />
            <span className="text-[11px] leading-tight text-slate-200 flex-1">
              <span className="font-semibold">{m.title}.</span> {m.text}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Hide data center illustration"
              className="pointer-events-auto text-slate-400 hover:text-white text-sm leading-none px-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
};
