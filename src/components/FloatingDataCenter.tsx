import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * FloatingDataCenter (v3)
 * Large illustration that travels across the HOME page as the visitor scrolls,
 * like the 3D ball on the Y68 site: fixed, eased/lagged motion, slight tilt toward the cursor.
 *
 *   first third  -> Migration  (cyan data between rack and cloud, cloud glows)
 *   second third -> Disaster recovery (amber replication to the DR box)
 *   last third   -> Implementation (LEDs on one by one, circuits turn green)
 *
 * Put data-center.webp in /public (public/data-center.webp). Open /data-center.webp on your site to confirm it loads.
 * All overlay coordinates are in the PNG's OWN pixel space (1977 x 1536).
 */

const IMG = '/data-center.webp';
const W = 1977;
const H = 1536;

type Mode = 'migration' | 'dr' | 'impl';

const MODES: Record<Mode, { title: string; text: string; color: string }> = {
  migration: { title: 'Migration', text: 'Workloads move to the cloud in waves', color: '#22d3ee' },
  dr: { title: 'Disaster recovery', text: 'Replication keeps the DR site current', color: '#fbbf24' },
  impl: { title: 'Implementation', text: 'Every link up, every server healthy', color: '#34d399' }
};

/**
 * Where the illustration sits at each scroll progress (0 = top, 1 = bottom of page).
 * x / y are offsets from screen centre in vw / vh. s is scale.
 * Tune these to keep it clear of your text blocks.
 */
const WAYPOINTS = [
  { p: 0.0, x: 36, y: 8, s: 1.0 },
  { p: 0.34, x: -38, y: 10, s: 1.0 },
  { p: 0.67, x: 37, y: 8, s: 1.0 },
  { p: 1.0, x: 38, y: 24, s: 0.7 }
];

const sample = (p: number) => {
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    if (p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      const e = t * t * (3 - 2 * t); // smoothstep
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: a.s + (b.s - a.s) * e };
    }
  }
  const l = WAYPOINTS[WAYPOINTS.length - 1];
  return { x: l.x, y: l.y, s: l.s };
};

/** LED positions on the real PNG: green column on the rack, blue column, amber on the DR box. */
const LEDS_GREEN: Array<[number, number]> = [[828, 1002], [830, 1048], [830, 1096], [830, 1138]];
const LEDS_BLUE: Array<[number, number]> = [[1005, 948], [1005, 1000], [1005, 1042], [1005, 1085]];
const LEDS_AMBER: Array<[number, number]> = [[1668, 582], [1668, 618], [1668, 652], [1668, 684], [1535, 660], [1535, 700], [1535, 742]];

const css = `
.dcm-float{animation:dcm-fl 7s ease-in-out infinite}
@keyframes dcm-fl{50%{transform:translateY(-10px)}}
.dcm-tilt{transform:perspective(1100px) rotateX(var(--dc-rx,0deg)) rotateY(var(--dc-ry,0deg));transition:transform .25s ease-out}
.dcm-gl,.dcm-layer{opacity:0;transition:opacity .8s}
.dcm-f{fill:none;stroke-linecap:round;stroke-width:6}
.dcm-up{stroke:#22d3ee;stroke-dasharray:3 22;animation:dcm-flow 1.2s linear infinite}
.dcm-am{stroke:#fbbf24;stroke-dasharray:4 16;animation:dcm-flow 1.5s linear infinite}
.dcm-gr{stroke:#34d399;stroke-dasharray:8 14;animation:dcm-flow 1.7s linear infinite}
@keyframes dcm-flow{to{stroke-dashoffset:-25}}
.dcm-led{opacity:0}
@keyframes dcm-on{from{opacity:0}to{opacity:1}}
[data-dcm="migration"] .dcm-lm,[data-dcm="dr"] .dcm-ld,[data-dcm="impl"] .dcm-li{opacity:1}
[data-dcm="migration"] .dcm-gc{opacity:1}
[data-dcm="dr"] .dcm-ga{opacity:1}
[data-dcm="impl"] .dcm-gg{opacity:.9}
[data-dcm="impl"] .dcm-led{animation:dcm-on .4s forwards;animation-delay:calc(var(--i)*.18s)}
@media (prefers-reduced-motion:reduce){
  .dcm-float,.dcm-up,.dcm-am,.dcm-gr,.dcm-led{animation:none!important}
  .dcm-tilt{transform:none;transition:none}
  .dcm-layer,.dcm-gl{transition:none}
  [data-dcm="impl"] .dcm-led{opacity:1}
}
`;

export const FloatingDataCenter: React.FC = () => {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const posRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>('migration');
  const [open, setOpen] = useState(true);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (!onHome) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = sample(0);
    let cur = { ...target };
    let raf: number | null = null;

    const apply = () => {
      const el = posRef.current;
      if (el) {
        el.style.transform = `translate(-50%,-50%) translate3d(${cur.x}vw,${cur.y}vh,0) scale(${cur.s})`;
      }
    };

    const tick = () => {
      raf = null;
      const k = reduce ? 1 : 0.055; // lower = heavier lag
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      cur.s += (target.s - cur.s) * k;
      apply();
      const settled =
        Math.abs(target.x - cur.x) < 0.02 && Math.abs(target.y - cur.y) < 0.02 && Math.abs(target.s - cur.s) < 0.001;
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      target = sample(p);
      const next: Mode = p < 0.34 ? 'migration' : p < 0.67 ? 'dr' : 'impl';
      setMode((prev) => (prev === next ? prev : next));
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      tiltRef.current?.style.setProperty('--dc-ry', `${(nx * 10).toFixed(2)}deg`);
      tiltRef.current?.style.setProperty('--dc-rx', `${(-ny * 8).toFixed(2)}deg`);
    };

    onScroll();
    cur = { ...target };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onMove);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [onHome, open]);

  if (!onHome) return null;
  const m = MODES[mode];

  return (
    <>
      <style>{css}</style>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="hidden lg:block fixed left-4 bottom-4 z-20 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 border border-slate-700 text-cyan-200 backdrop-blur-md cursor-pointer"
        >
          Show data center
        </button>
      ) : (
        <div
          ref={posRef}
          className="hidden lg:block fixed left-1/2 top-1/2 z-10 w-[min(24vw,360px)] pointer-events-none select-none will-change-transform"
        >
          <div ref={tiltRef} className="dcm-tilt">
            <div className="dcm-float">
              <div data-dcm={mode} className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
                <img
                  src={IMG}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  onError={() => setImgOk(false)}
                  className="absolute inset-0 w-full h-full drop-shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
                />

                {!imgOk && (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-[11px] text-rose-300 bg-slate-950/80 rounded-xl p-3">
                    Image not found: put data-center.webp in /public
                  </div>
                )}

                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full"
                >
                  <defs>
                    <filter id="dcm-blur" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" />
                    </filter>
                    <filter id="dcm-soft" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="6" />
                    </filter>
                    <radialGradient id="dcm-gc"><stop offset="0" stopColor="#22d3ee" stopOpacity=".5" /><stop offset="1" stopColor="#22d3ee" stopOpacity="0" /></radialGradient>
                    <radialGradient id="dcm-ga"><stop offset="0" stopColor="#fbbf24" stopOpacity=".55" /><stop offset="1" stopColor="#fbbf24" stopOpacity="0" /></radialGradient>
                    <radialGradient id="dcm-gg"><stop offset="0" stopColor="#34d399" stopOpacity=".45" /><stop offset="1" stopColor="#34d399" stopOpacity="0" /></radialGradient>
                  </defs>

                  {/* Glows: cloud, DR box, rack base */}
                  <ellipse className="dcm-gl dcm-gc" cx="770" cy="400" rx="470" ry="330" fill="url(#dcm-gc)" />
                  <ellipse className="dcm-gl dcm-ga" cx="1500" cy="640" rx="420" ry="300" fill="url(#dcm-ga)" />
                  <ellipse className="dcm-gl dcm-gg" cx="800" cy="1060" rx="620" ry="380" fill="url(#dcm-gg)" />

                  {/* Migration: data climbs from the rack top into the cloud */}
                  <g className="dcm-layer dcm-lm" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-up" d="M640 840V560" />
                    <path className="dcm-f dcm-up" d="M705 850V520" style={{ animationDelay: '-.3s' }} />
                    <path className="dcm-f dcm-up" d="M770 860V500" style={{ animationDelay: '-.6s' }} />
                    <path className="dcm-f dcm-up" d="M835 850V520" style={{ animationDelay: '-.2s' }} />
                    <path className="dcm-f dcm-up" d="M885 840V560" style={{ animationDelay: '-.5s' }} />
                  </g>

                  {/* Disaster recovery: amber replication from the rack to the DR box */}
                  <g className="dcm-layer dcm-ld" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-am" d="M1085 890C1160 640 1360 410 1520 470" />
                    <path className="dcm-f dcm-am" d="M1095 900C1190 670 1380 440 1540 500" style={{ animationDelay: '-.4s' }} />
                    <path className="dcm-f dcm-am" d="M1090 905C1220 800 1320 700 1440 690" style={{ animationDelay: '-.8s' }} />
                    <path className="dcm-f dcm-am" d="M1095 915C1230 820 1340 725 1460 710" style={{ animationDelay: '-1.1s' }} />
                  </g>

                  {/* Implementation: all links up, circuit lines turn green */}
                  <g className="dcm-layer dcm-li" filter="url(#dcm-blur)">
                    <path className="dcm-f dcm-gr" d="M520 1240C380 1300 200 1400 0 1500" />
                    <path className="dcm-f dcm-gr" d="M600 1265C470 1335 330 1420 130 1536" style={{ animationDelay: '-.5s' }} />
                    <path className="dcm-f dcm-gr" d="M1090 1240C1300 1290 1560 1230 1740 1070C1850 960 1850 890 1690 820" style={{ animationDelay: '-.9s' }} />
                    <path className="dcm-f dcm-gr" d="M1060 1260C1180 1330 1300 1400 1360 1440" style={{ animationDelay: '-1.3s' }} />
                  </g>

                  {/* LEDs switch on one by one in the Implementation phase */}
                  <g filter="url(#dcm-soft)">
                    {LEDS_GREEN.map(([x, y], i) => (
                      <circle key={`g${i}`} className="dcm-led" style={{ ['--i' as any]: i }} cx={x} cy={y} r={14} fill="#34d399" />
                    ))}
                    {LEDS_BLUE.map(([x, y], i) => (
                      <circle key={`b${i}`} className="dcm-led" style={{ ['--i' as any]: i + 4 }} cx={x} cy={y} r={12} fill="#34d399" />
                    ))}
                    {LEDS_AMBER.map(([x, y], i) => (
                      <circle key={`a${i}`} className="dcm-led" style={{ ['--i' as any]: i + 8 }} cx={x} cy={y} r={12} fill="#34d399" />
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-2 mx-auto w-fit max-w-full flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-800 backdrop-blur-md">
            <span
              className="block w-2 h-2 rounded-full shrink-0"
              style={{ background: m.color, boxShadow: `0 0 8px ${m.color}` }}
            />
            <span className="text-[11px] leading-tight text-slate-200">
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
        </div>
      )}
    </>
  );
};
