// Decorative SVG components with driving / auto-school theme

/** Steering wheel — 3 spoke */
export function SteeringWheel({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" strokeWidth="7" stroke="currentColor" />
      {/* Hub */}
      <circle cx="50" cy="50" r="11" strokeWidth="5" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
      {/* Horn pad (small centre cap) */}
      <circle cx="50" cy="50" r="5" fill="currentColor" />
      {/* 3 spokes */}
      <line x1="50" y1="39" x2="50" y2="6"  strokeWidth="6" stroke="currentColor" />
      <line x1="40" y1="55" x2="9"  y2="73" strokeWidth="6" stroke="currentColor" />
      <line x1="60" y1="55" x2="91" y2="73" strokeWidth="6" stroke="currentColor" />
    </svg>
  )
}

/** Tyre / road-wheel — 5 spoke rim */
export function Tyre({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      strokeLinecap="round"
      className={className}
      style={style}
      aria-hidden
    >
      {/* Tyre body */}
      <circle cx="50" cy="50" r="46" strokeWidth="8" stroke="currentColor" fill="currentColor" fillOpacity="0.08" />
      {/* Rim */}
      <circle cx="50" cy="50" r="28" strokeWidth="4" stroke="currentColor" />
      {/* Hub cap */}
      <circle cx="50" cy="50" r="7"  fill="currentColor" />
      {/* 5 spokes */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x2 = 50 + 28 * Math.sin(rad)
        const y2 = 50 - 28 * Math.cos(rad)
        return (
          <line
            key={i}
            x1="50" y1="50"
            x2={x2.toFixed(1)} y2={y2.toFixed(1)}
            strokeWidth="4.5"
            stroke="currentColor"
          />
        )
      })}
    </svg>
  )
}

/** Traffic light — 3 lamps in housing */
export function TrafficLight({
  active = 'green',
  className = '',
}: {
  active?: 'red' | 'yellow' | 'green'
  className?: string
}) {
  return (
    <svg viewBox="0 0 56 120" fill="none" className={className} aria-hidden>
      {/* Post */}
      <rect x="25" y="100" width="6" height="18" rx="2" fill="#6b7280" />
      {/* Housing */}
      <rect x="6" y="4" width="44" height="96" rx="10" fill="#1f2937" />
      <rect x="8" y="6" width="40" height="92" rx="8" fill="#111827" />
      {/* Shade lips */}
      <rect x="6"  y="28" width="44" height="4" rx="1" fill="#374151" />
      <rect x="6"  y="58" width="44" height="4" rx="1" fill="#374151" />
      {/* Red lamp */}
      <circle cx="28" cy="22" r="12"
        fill={active === 'red' ? '#ef4444' : '#4b1919'}
        style={active === 'red' ? { filter: 'drop-shadow(0 0 6px #ef4444)' } : undefined}
      />
      {/* Yellow lamp */}
      <circle cx="28" cy="52" r="12"
        fill={active === 'yellow' ? '#fbbf24' : '#4b3c00'}
        style={active === 'yellow' ? { filter: 'drop-shadow(0 0 6px #fbbf24)' } : undefined}
      />
      {/* Green lamp */}
      <circle cx="28" cy="82" r="12"
        fill={active === 'green' ? '#22c55e' : '#053b1a'}
        style={active === 'green' ? { filter: 'drop-shadow(0 0 6px #22c55e)' } : undefined}
      />
      {/* Lens shine */}
      <circle cx="24" cy="18" r="3" fill="white" fillOpacity="0.15" />
      <circle cx="24" cy="48" r="3" fill="white" fillOpacity="0.15" />
      <circle cx="24" cy="78" r="3" fill="white" fillOpacity="0.15" />
    </svg>
  )
}

/** Speedometer — half-circle gauge */
export function Speedometer({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg viewBox="0 0 120 70" fill="none" className={className} aria-hidden>
      {/* Gauge arc background */}
      <path d="M10 60 A50 50 0 0 1 110 60" strokeWidth="8" stroke="#e5e7eb" strokeLinecap="round" />
      {/* Speed arc (≈70% full — "cruising") */}
      <path d="M10 60 A50 50 0 0 1 95 22" strokeWidth="8" stroke="#22c55e" strokeLinecap="round" />
      {/* Tick marks */}
      {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
        const rad = ((deg + 180) * Math.PI) / 180
        const cx = 60, cy = 60, r1 = 44, r2 = 38
        const x1 = (cx + r1 * Math.cos(rad)).toFixed(1)
        const y1 = (cy + r1 * Math.sin(rad)).toFixed(1)
        const x2 = (cx + r2 * Math.cos(rad)).toFixed(1)
        const y2 = (cy + r2 * Math.sin(rad)).toFixed(1)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" stroke="#9ca3af" />
      })}
      {/* Needle — pointing ~70% */}
      <line x1="60" y1="60" x2="92" y2="23" strokeWidth="3" stroke="#374151" strokeLinecap="round" />
      {/* Hub */}
      <circle cx="60" cy="60" r="6" fill="#374151" />
      <circle cx="60" cy="60" r="3" fill="#6b7280" />
    </svg>
  )
}

/** Road cone / traffic cone */
export function TrafficCone({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none" className={className} aria-hidden>
      {/* Base */}
      <ellipse cx="30" cy="72" rx="24" ry="5" fill="#d97706" />
      {/* Cone body */}
      <path d="M30 4 L54 70 L6 70 Z" fill="#f59e0b" />
      {/* White stripes */}
      <path d="M19 36 L41 36 L39 44 L21 44 Z" fill="white" fillOpacity="0.8" />
      <path d="M24 54 L36 54 L35 60 L25 60 Z" fill="white" fillOpacity="0.8" />
      {/* Shadow gradient effect */}
      <path d="M30 4 L54 70 L42 70 Z" fill="#d97706" fillOpacity="0.35" />
      {/* Tip */}
      <circle cx="30" cy="7" r="3" fill="#fbbf24" />
    </svg>
  )
}

/** Car silhouette — modern sedan side profile */
export function CarSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 90" fill="none" className={className} aria-hidden>
      {/* ── Body shell ── */}
      <path
        d="M18 62
           C18 62 14 62 12 58
           L12 50
           C12 50 14 46 18 46
           L22 46
           C24 38 28 34 34 32
           L52 18
           C60 13 72 11 92 10
           L148 10
           C164 10 176 14 184 22
           L200 38
           C208 42 212 46 214 50
           L220 50
           C224 50 228 54 228 58
           L228 62
           Z"
        fill="currentColor"
        fillOpacity="0.88"
      />
      {/* ── Roof curve ── */}
      <path
        d="M54 46 C58 32 68 18 86 13 L148 13 C162 13 172 20 180 32 L196 46 Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      {/* ── Front windshield ── */}
      <path
        d="M148 15 C162 15 172 22 178 34 L192 46 L148 46 Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      {/* ── Rear windshield ── */}
      <path
        d="M86 15 C72 15 64 22 58 34 L50 46 L96 46 Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      {/* ── Side windows ── */}
      <path
        d="M100 14 L144 14 L144 44 L100 44 Z"
        rx="2"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
      {/* B-pillar */}
      <line x1="100" y1="14" x2="100" y2="46" stroke="currentColor" strokeWidth="3" strokeOpacity="0.6" />
      {/* ── Door lines ── */}
      <path d="M98 46 L98 62" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="2 2" />
      <path d="M148 46 L148 62" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="2 2" />
      {/* ── Side mirror ── */}
      <path d="M196 38 L204 38 L204 44 L196 42 Z" fill="currentColor" fillOpacity="0.7" />
      {/* ── Door handle front ── */}
      <rect x="160" y="50" width="12" height="3" rx="1.5" fill="currentColor" fillOpacity="0.4" />
      {/* ── Door handle rear ── */}
      <rect x="112" y="50" width="12" height="3" rx="1.5" fill="currentColor" fillOpacity="0.4" />
      {/* ── Front bumper ── */}
      <path d="M214 54 C220 54 226 56 228 60 L228 64 L212 64 L212 54 Z" fill="currentColor" fillOpacity="0.6" />
      {/* ── Rear bumper ── */}
      <path d="M26 54 C20 54 14 56 12 60 L12 64 L28 64 L28 54 Z" fill="currentColor" fillOpacity="0.6" />
      {/* ── Front wheel arch ── */}
      <path d="M168 62 C168 46 206 46 206 62" fill="currentColor" fillOpacity="0.3" />
      {/* ── Rear wheel arch ── */}
      <path d="M34 62 C34 46 72 46 72 62" fill="currentColor" fillOpacity="0.3" />
      {/* ── Front tyre ── */}
      <circle cx="187" cy="67" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="187" cy="67" r="8"  fill="currentColor" fillOpacity="0.2"  stroke="currentColor" strokeWidth="1.5" />
      <circle cx="187" cy="67" r="3"  fill="currentColor" />
      {[0,60,120,180,240,300].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        return <line key={i} x1="187" y1="67" x2={(187 + 8 * Math.sin(r)).toFixed(1)} y2={(67 - 8 * Math.cos(r)).toFixed(1)} strokeWidth="1.5" stroke="currentColor" strokeOpacity="0.6" />
      })}
      {/* ── Rear tyre ── */}
      <circle cx="53"  cy="67" r="14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="53"  cy="67" r="8"  fill="currentColor" fillOpacity="0.2"  stroke="currentColor" strokeWidth="1.5" />
      <circle cx="53"  cy="67" r="3"  fill="currentColor" />
      {[0,60,120,180,240,300].map((deg, i) => {
        const r = (deg * Math.PI) / 180
        return <line key={i} x1="53" y1="67" x2={(53 + 8 * Math.sin(r)).toFixed(1)} y2={(67 - 8 * Math.cos(r)).toFixed(1)} strokeWidth="1.5" stroke="currentColor" strokeOpacity="0.6" />
      })}
      {/* ── Headlight ── */}
      <path d="M214 40 L226 44 L226 50 L214 50 Z" rx="2" fill="#fbbf24" fillOpacity="0.9" />
      <path d="M216 42 L224 45 L224 48 L216 48 Z" fill="white" fillOpacity="0.4" />
      {/* ── Tail light ── */}
      <path d="M26 42 L14 46 L14 52 L26 52 Z" rx="2" fill="#ef4444" fillOpacity="0.85" />
      {/* ── Exhaust ── */}
      <ellipse cx="22" cy="64" rx="4" ry="2.5" fill="currentColor" fillOpacity="0.4" />
    </svg>
  )
}
