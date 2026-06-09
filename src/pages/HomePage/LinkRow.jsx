import { Copy } from 'lucide-react'
import { cx } from '../../lib/utils'
import { Button } from '../../components/ui'

export function LinkRow({ tone, icon: Icon, label, hint, url, onCopy }) {
  const dark = tone === 'dark'
  return (
    <div className={cx('rounded-2xl border p-4', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50')}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={cx('h-4 w-4', dark ? 'text-lime-400' : 'text-slate-500')} />
        <span className={cx('text-sm font-semibold', dark ? 'text-white' : 'text-slate-700')}>{label}</span>
        <span className={cx('text-xs', 'text-slate-400')}>· {hint}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className={cx('flex-1 truncate rounded-xl px-3 py-2 text-xs', dark ? 'bg-slate-800 text-lime-300' : 'bg-white text-slate-600 border border-slate-100')}>
          {url}
        </code>
        <Button size="sm" variant={dark ? 'volt' : 'ghost'} onClick={onCopy}>
          <Copy className="h-4 w-4" /> Copy
        </Button>
      </div>
    </div>
  )
}
