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

/**
 * The Photoroom PNG is 1977 x 1536, i.e. cropped from the original 2576 x 1438 render.
 * All overlay coordinates below are written in the ORIGINAL render's pixel space, and the SVG
 * viewBox is the crop rectangle, so aligning the overlay means tuning just these four numbers:
 *   x, y = top-left corner of the PNG inside the original render
 *   w, h = size of that area in original pixels (keep w / h = 1977 / 1536)
 */
const CROP = { x: 450, y: 58, w: 1776, h: 1380 };
const IMG_RATIO = '1977 / 1536';

type Mode = 'migration' | 'dr' | 'impl';

const MODES: Record<Mode, { title: string; text: string; color: string }> = {
  migration: { title: 'Migration', text: 'Workloads move to the cloud in waves', color: '#22d3ee' },
  dr: { title: 'Disaster recovery', text: 'Replication keeps the DR site current', color: '#fbbf24' },
  impl: { title: 'Implementation', text: 'Every link up, every server healthy', color: '#34d399' }
};

const LEDS: Array<[number, number]> = [
  [1200, 905], [1200, 960], [1200, 1014], [1200, 1064],
  [1385, 902], [1385, 956], [1385, 1011], [1385, 1063]
];

const css = `
.dcm-tilt{transform:perspective(1000px) rotateY(calc(var(--dc-p,0)*-6deg + 3deg)) translateY(calc(var(--dc-p,0)*-18px));transition:transform .15s linear}
.dcm-float{animation:dcm-fl 7s ease-in-out infinite}
@keyframes dcm-fl{50%{transform:translateY(-8px)}}
.dcm-gl{opacity:0;transition:opacity .7s}
.dcm-layer{opacity:0;transition:opacity .7s}
.dcm-f{fill:none;stroke-linecap:round;stroke-width:5}
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
              <div data-dcm={mode} className="relative" style={{ aspectRatio: IMG_RATIO }}>
                <img
                  src={IMG}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="absolute inset-0 w-full h-full"
                />

                <svg
                  viewBox={`${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <filter id="dcm-blur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" />
                    </filter>
                    <radialGradient id="dcm-gc"><stop offset="0" stopColor="#22d3ee" stopOpacity=".45" /><stop offset="1" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
                    <radialGradient id="dcm-ga"><stop offset="0" stopColor="#fbbf24" stopOpacity=".5" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient>
                    <radialGradient id="dcm-gg"><stop offset="0" stopColor="#34d399" stopOpacity=".4" /><stop offset="1" stopColor="#34d399" stopOpacity="0" /></radialGradient>
                  </defs>

                  {/* Glows */}
                  <ellipse className="dcm-gl dcm-gc" cx="1150" cy="400" rx="480" ry="330" fill="url(#dcm-gc)" />
                  <ellipse className="dcm-gl dcm-ga" cx="1890" cy="590" rx="420" ry="300" fill="url(#dcm-ga)" />
                  <ellipse className="dcm-gl dcm-gg" cx="1250" cy="1000" rx="560" ry="380" fill="url(#dcm-gg)" />

                  {/* Migration: data rises from the on-prem racks to the cloud */}
                  <g className="dcm-layer dcm-lm" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-up" d="M905 790V470" />
                    <path className="dcm-f dcm-up" d="M985 800V460" style={{ animationDelay: '-.3s' }} />
                    <path className="dcm-f dcm-up" d="M1065 805V450" style={{ animationDelay: '-.6s' }} />
                    <path className="dcm-f dcm-up" d="M1150 800V460" style={{ animationDelay: '-.2s' }} />
                    <path className="dcm-f dcm-up" d="M1240 790V480" style={{ animationDelay: '-.5s' }} />
                  </g>

                  {/* Disaster recovery: replication to the DR site */}
                  <g className="dcm-layer dcm-ld" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-am" d="M1300 780C1400 560 1650 380 1860 520" />
                    <path className="dcm-f dcm-am" d="M1313 790C1430 590 1675 420 1870 540" style={{ animationDelay: '-.4s' }} />
                    <path className="dcm-f dcm-am" d="M1325 805C1460 625 1690 460 1880 560" style={{ animationDelay: '-.8s' }} />
                  </g>

                  {/* Implementation: links up, circuits green */}
                  <g className="dcm-layer dcm-li" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-gr" d="M982 1240C838 1305 676 1370 531 1438" />
                    <path className="dcm-f dcm-gr" d="M1127 1250C1030 1340 900 1400 837 1438" style={{ animationDelay: '-.5s' }} />
                    <path className="dcm-f dcm-gr" d="M1626 1127C1855 1063 2077 966 2144 870" style={{ animationDelay: '-.9s' }} />
                  </g>

                  <g filter="url(#dcm-blur)">
                    {LEDS.map(([x, y], i) => (
                      <circle
                        key={i}
                        className="dcm-led"
                        style={{ ['--i' as any]: i }}
                        cx={x}
                        cy={y}
                        r={8}
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
