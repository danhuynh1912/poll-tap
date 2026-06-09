export function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5">
      <span className="relative transition group-hover:scale-105">
        <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden>
          <rect width="32" height="32" rx="8" fill="#0f172a" />
          <path d="M9 22V10h6.2a4 4 0 0 1 0 8H12" fill="none" stroke="#ccff00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22.5" cy="11" r="2" fill="#ccff00" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        POLL<span className="text-lime-500">TAP</span>
      </span>
    </button>
  )
}
