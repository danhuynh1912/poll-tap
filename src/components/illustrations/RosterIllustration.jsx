import { cx } from '../../lib/utils'

const AVATARS = [
  { cx: 200, cy: 110, r: 34, init: 'D', yes: true,  fd: '0s',    dur: '5.8s' },
  { cx: 340, cy:  72, r: 28, init: 'M', yes: true,  fd: '0.6s',  dur: '6.4s' },
  { cx: 116, cy: 220, r: 26, init: 'A', yes: false, fd: '1.1s',  dur: '5.2s' },
  { cx: 310, cy: 200, r: 30, init: 'H', yes: true,  fd: '0.3s',  dur: '7s'   },
  { cx: 180, cy: 310, r: 28, init: 'L', yes: true,  fd: '0.9s',  dur: '6s'   },
  { cx: 360, cy: 310, r: 24, init: 'T', yes: true,  fd: '1.4s',  dur: '5.5s' },
  { cx:  90, cy: 330, r: 22, init: 'P', yes: false, fd: '0.7s',  dur: '6.8s' },
]
const HUB = { cx: 232, cy: 210 }

export function RosterIllustration({ className = '' }) {
  return (
    <div className={cx('relative overflow-hidden rounded-3xl', className)}>
      <svg viewBox="0 0 460 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ccff00" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow1" cx="30%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#ccff00" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow2" cx="75%" cy="75%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="avatarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        <rect width="460" height="420" rx="24" fill="url(#bgGrad)" />
        <rect width="460" height="420" rx="24" fill="url(#glow1)" />
        <rect width="460" height="420" rx="24" fill="url(#glow2)" />

        {Array.from({ length: 8 }).map((_, col) =>
          Array.from({ length: 7 }).map((_, row) => (
            <circle key={`${col}-${row}`} cx={30 + col * 58} cy={30 + row * 58} r="1.2" fill="#ffffff" fillOpacity="0.06" />
          ))
        )}

        <circle cx={HUB.cx} cy={HUB.cy} r="80" fill="url(#hubGlow)" />

        {AVATARS.map((a, i) => (
          <line key={`line-${i}`} x1={HUB.cx} y1={HUB.cy} x2={a.cx} y2={a.cy}
            stroke={a.yes ? '#ccff00' : '#475569'}
            strokeOpacity={a.yes ? '0.25' : '0.15'}
            strokeWidth="1.5" strokeDasharray="4 5"
          />
        ))}

        <circle cx={HUB.cx} cy={HUB.cy} r="38" fill="#0f172a" stroke="#ccff00" strokeWidth="2" strokeOpacity="0.6" filter="url(#avatarShadow)" />
        <circle cx={HUB.cx} cy={HUB.cy} r="38" fill="#ccff00" fillOpacity="0.06" />
        <path
          d={`M${HUB.cx - 10} ${HUB.cy + 12}V${HUB.cy - 12}h10a8 8 0 0 1 0 16h-6`}
          stroke="#ccff00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx={HUB.cx + 14} cy={HUB.cy - 8} r="3.5" fill="#ccff00" />

        {AVATARS.map((a, i) => (
          <g key={`av-${i}`}>
            <animateTransform attributeName="transform" type="translate"
              values="0 0; 0 -8; 0 0" dur={a.dur} begin={a.fd} repeatCount="indefinite" additive="sum"
            />
            {a.yes && (
              <circle cx={a.cx} cy={a.cy} r={a.r + 12} fill="#ccff00" fillOpacity="0.08" filter="url(#soft)" />
            )}
            <circle cx={a.cx} cy={a.cy} r={a.r} fill="#1e293b"
              stroke={a.yes ? '#ccff00' : '#334155'} strokeWidth={a.yes ? '2' : '1.5'}
              filter="url(#avatarShadow)"
            />
            <text x={a.cx} y={a.cy + 1} textAnchor="middle" dominantBaseline="middle"
              fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
              fontWeight="900" fontSize={a.r * 0.7} fill={a.yes ? '#ccff00' : '#64748b'}
            >
              {a.init}
            </text>
            <circle cx={a.cx + a.r * 0.68} cy={a.cy - a.r * 0.68} r="11"
              fill={a.yes ? '#ccff00' : '#1e293b'}
              stroke={a.yes ? '#ccff00' : '#475569'} strokeWidth="1.5"
            />
            {a.yes ? (
              <path d={`M${a.cx + a.r * 0.68 - 5} ${a.cy - a.r * 0.68}l3 3 5 -5`}
                stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              />
            ) : (
              <>
                <line x1={a.cx + a.r * 0.68 - 4} y1={a.cy - a.r * 0.68 - 4} x2={a.cx + a.r * 0.68 + 4} y2={a.cy - a.r * 0.68 + 4} stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1={a.cx + a.r * 0.68 + 4} y1={a.cy - a.r * 0.68 - 4} x2={a.cx + a.r * 0.68 - 4} y2={a.cy - a.r * 0.68 + 4} stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </g>
        ))}

        <rect x="130" y="378" width="200" height="32" rx="16" fill="#ccff00" fillOpacity="0.1" stroke="#ccff00" strokeOpacity="0.3" strokeWidth="1" />
        <text x="230" y="399" textAnchor="middle" fontFamily="Inter, ui-sans-serif" fontWeight="700" fontSize="13" fill="#ccff00" fillOpacity="0.9">
          5 attending · 2 declined
        </text>
      </svg>
    </div>
  )
}
