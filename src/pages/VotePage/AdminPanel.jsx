import { useState } from 'react'
import { Crown, Lock, Check, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { cx } from '../../lib/utils'
import { Button } from '../../components/ui'

export function AdminPanel({ vote, closed, filledSlots, toast, onChanged }) {
  const [busy, setBusy] = useState(false)

  async function toggleClosed() {
    setBusy(true)
    try {
      const { error } = await supabase
        .from('votes').update({ is_closed: !vote.is_closed }).eq('id', vote.id)
      if (error) throw error
      toast(vote.is_closed ? 'Vote re-opened' : 'Vote closed')
      onChanged()
    } catch (e) {
      toast(e.message || 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-lime-400" />
        <h3 className="font-bold">Admin controls</h3>
      </div>
      <p className="mt-1 text-sm text-slate-400">Owner-only. This panel is hidden without the admin token.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Filled</p>
          <p className="text-2xl font-black text-lime-400">{filledSlots}<span className="text-base text-slate-500">/{vote.max_slots}</span></p>
        </div>
        <div className="rounded-2xl bg-slate-800 p-3 text-center">
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-lg font-bold">{closed ? 'Closed' : 'Open'}</p>
        </div>
      </div>

      <Button
        variant={vote.is_closed ? 'volt' : 'danger'}
        className={cx('mt-4 w-full', !vote.is_closed && 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700')}
        onClick={toggleClosed}
        disabled={busy}
      >
        {busy
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : vote.is_closed
            ? <><Check className="h-4 w-4" /> Re-open voting</>
            : <><Lock className="h-4 w-4" /> Close vote now</>}
      </Button>
      {!vote.is_closed && closed && (
        <p className="mt-2 text-center text-xs text-slate-500">Already closed automatically by deadline.</p>
      )}
    </div>
  )
}
