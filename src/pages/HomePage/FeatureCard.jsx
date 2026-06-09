import { cx } from '../../lib/utils'

export function FeatureCard({ icon: Icon, title, desc, glyph }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 transition hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/[0.04]">
      <div className="pointer-events-none absolute -right-6 -top-6 text-slate-100 transition group-hover:text-lime-200">
        {glyph}
      </div>
      <div className="relative">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-lime-400">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  )
}
