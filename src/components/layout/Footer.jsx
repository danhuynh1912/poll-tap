import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 sm:flex-row">
        <Logo onClick={() => (window.location.href = '/')} />
        <p className="text-sm text-slate-400 hidden sm:block">Poll + Tap · Club attendance, reimagined.</p>
        <div className="flex items-center gap-2 text-slate-300">
          <span className="text-xs">© {new Date().getFullYear()} POLLTAP</span>
        </div>
      </div>
    </footer>
  )
}
