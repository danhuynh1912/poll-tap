export function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md animate-scale-in rounded-3xl border border-slate-100 bg-white/90 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}
