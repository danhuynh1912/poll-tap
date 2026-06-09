export function CourtIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="court" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#ccff00" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="url(#court)" />
      <rect width="400" height="300" rx="24" fill="url(#glow)" />
      <g stroke="#ccff00" strokeOpacity="0.55" strokeWidth="1.4">
        <path d="M120 250 L70 50 L330 50 L280 250 Z" />
        <line x1="95" y1="150" x2="305" y2="150" />
        <line x1="200" y1="50" x2="200" y2="250" />
        <path d="M150 50 L150 250" strokeOpacity="0.25" />
        <path d="M250 50 L250 250" strokeOpacity="0.25" />
      </g>
      <line x1="95" y1="150" x2="305" y2="150" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.2" strokeDasharray="4 4" />
      <g className="animate-float-slow">
        <circle cx="210" cy="110" r="6" fill="#ccff00" />
        <path d="M210 110 q 18 -26 40 -34" stroke="#ccff00" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
        <path d="M250 76 l -6 -3 m 6 3 l 1 -7 m -1 7 l 6 1" stroke="#ccff00" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}
