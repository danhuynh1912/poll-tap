export function RacketGlyph({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <ellipse cx="26" cy="22" rx="16" ry="19" stroke="currentColor" strokeWidth="2.4" />
      <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="1">
        <line x1="14" y1="14" x2="38" y2="30" />
        <line x1="12" y1="22" x2="40" y2="22" />
        <line x1="14" y1="30" x2="38" y2="14" />
        <line x1="20" y1="8" x2="20" y2="36" />
        <line x1="32" y1="8" x2="32" y2="36" />
      </g>
      <path d="M37 35 L52 54" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  )
}
