import { useState, useEffect } from 'react'
import { Check, X, Plus, Minus, Shield, Sparkles, ArrowRight, Loader2, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { setDeviceName } from '../../lib/localStorage'
import { cx } from '../../lib/utils'
import { Button, Modal, Toggle } from '../../components/ui'
import { inputCls } from '../../components/ui/Field'

export function VotePanel({ vote, closed, filledSlots, myResponse, me, toast, onChanged }) {
  const [nameModal, setNameModal] = useState(false)
  const [nameDraft, setNameDraft] = useState(me.current.name)
  const [attending, setAttending] = useState(myResponse ? myResponse.attending : null)
  const [withGuests, setWithGuests] = useState((myResponse?.guests || 0) > 0)
  const [guestMale, setGuestMale] = useState(myResponse?.guest_male_count || 0)
  const [guestFemale, setGuestFemale] = useState(myResponse?.guest_female_count || 0)
  const [saving, setSaving] = useState(false)

  const guests = guestMale + guestFemale

  useEffect(() => {
    if (myResponse) {
      setAttending(myResponse.attending)
      const gm = myResponse.guest_male_count || 0
      const gf = myResponse.guest_female_count || 0
      setGuestMale(gm)
      setGuestFemale(gf)
      setWithGuests((gm + gf) > 0)
    }
  }, [myResponse?.id, myResponse?.attending, myResponse?.guest_male_count, myResponse?.guest_female_count])

  const otherSlots = filledSlots - (myResponse?.attending ? 1 + (myResponse.guests || 0) : 0)
  const remainingForMe = vote.max_slots - otherSlots
  const maxGuestsForMe = Math.max(0, remainingForMe - 1)
  const canAddGuest = guests < maxGuestsForMe

  const ensureName = (cb) => {
    if (me.current.name) return cb()
    setNameDraft('')
    setNameModal(() => () => cb)
  }

  async function persist(nextAttending, nextGuestMale, nextGuestFemale) {
    if (!me.current.name) return
    setSaving(true)
    try {
      const totalGuests = nextAttending ? nextGuestMale + nextGuestFemale : 0
      const payload = {
        vote_id: vote.id,
        anonymous_user_id: me.current.id,
        name: me.current.name,
        attending: nextAttending,
        guests: totalGuests,
        guest_male_count: nextAttending ? nextGuestMale : 0,
        guest_female_count: nextAttending ? nextGuestFemale : 0,
      }
      // Silently attach auth member_id if the user is logged in via FeeTap
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) payload.member_id = session.user.id

      const { error } = await supabase
        .from('responses')
        .upsert(payload, { onConflict: 'vote_id,anonymous_user_id' })
      if (error) throw error
      toast(nextAttending ? "You're in ✅" : 'Marked as not attending')
      onChanged()
    } catch (e) {
      toast(e.message || 'Could not save vote')
    } finally {
      setSaving(false)
    }
  }

  function choose(yes) {
    if (closed) return
    const apply = () => {
      setAttending(yes)
      if (!yes) {
        setWithGuests(false)
        setGuestMale(0)
        setGuestFemale(0)
        persist(false, 0, 0)
      } else {
        persist(true, withGuests ? guestMale : 0, withGuests ? guestFemale : 0)
      }
    }
    ensureName(apply)
  }

  function confirmName() {
    const n = nameDraft.trim()
    if (n.length < 2) return
    setDeviceName(n)
    me.current.name = n
    const pending = typeof nameModal === 'function' ? nameModal() : null
    setNameModal(false)
    if (typeof pending === 'function') pending()
  }

  function adjustMale(delta) {
    const next = Math.max(0, Math.min(guestMale + delta, maxGuestsForMe - guestFemale))
    setGuestMale(next)
    persist(true, next, guestFemale)
  }

  function adjustFemale(delta) {
    const next = Math.max(0, Math.min(guestFemale + delta, maxGuestsForMe - guestMale))
    setGuestFemale(next)
    persist(true, guestMale, next)
  }

  const yesFull = otherSlots >= vote.max_slots && !myResponse?.attending

  if (closed) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white/80 p-7 text-center backdrop-blur-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50">
          <Lock className="h-6 w-6 text-red-500" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Voting is closed</h3>
        <p className="mt-1 text-sm text-slate-500">
          {myResponse
            ? `Your final answer: ${myResponse.attending
                ? `Attending${guests > 0 ? ` (+${guestMale}M +${guestFemale}F)` : ''}`
                : 'Not attending'}.`
            : 'The deadline has passed. Check the results on the right.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/80 p-7 backdrop-blur-xl">
      <h3 className="text-lg font-bold text-slate-900">Will you play?</h3>
      <p className="mt-1 text-sm text-slate-500">
        {me.current.name
          ? <>Voting as <strong className="text-slate-700">{me.current.name}</strong></>
          : 'No login needed — just your name.'}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => choose(true)} disabled={saving || yesFull}
          className={cx('group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition disabled:opacity-50',
            attending === true ? 'border-lime-400 bg-lime-50' : 'border-slate-200 bg-white hover:border-slate-300')}>
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl',
            attending === true ? 'bg-lime-400 text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200')}>
            <Check className="h-5 w-5" strokeWidth={3} />
          </span>
          <p className="mt-3 font-bold text-slate-900">Yes</p>
          <p className="text-xs text-slate-500">{yesFull ? 'Court is full' : 'Count me in'}</p>
        </button>

        <button onClick={() => choose(false)} disabled={saving}
          className={cx('group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition disabled:opacity-50',
            attending === false ? 'border-slate-900 bg-slate-900' : 'border-slate-200 bg-white hover:border-slate-300')}>
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl',
            attending === false ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200')}>
            <X className="h-5 w-5" strokeWidth={3} />
          </span>
          <p className={cx('mt-3 font-bold', attending === false ? 'text-white' : 'text-slate-900')}>No</p>
          <p className={cx('text-xs', attending === false ? 'text-slate-300' : 'text-slate-500')}>Can't make it</p>
        </button>
      </div>

      {attending === true && (
        <div className="mt-5 animate-fade-in space-y-4">
          <Toggle checked={withGuests} label="Bring guests" onChange={(v) => {
            setWithGuests(v)
            if (!v) { setGuestMale(0); setGuestFemale(0); persist(true, 0, 0) }
          }} />

          {withGuests && (
            <div className="animate-fade-in rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Guests</span>
                <span>{maxGuestsForMe - guests} slot{maxGuestsForMe - guests !== 1 ? 's' : ''} remaining</span>
              </div>

              {/* Male guests */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">♂ Male guests</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustMale(-1)}
                    disabled={guestMale <= 0 || saving}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 disabled:opacity-30">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-xl font-black tabular-nums text-slate-900">{guestMale}</span>
                  <button
                    onClick={() => adjustMale(1)}
                    disabled={!canAddGuest || saving}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-30">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Female guests */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">♀ Female guests</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => adjustFemale(-1)}
                    disabled={guestFemale <= 0 || saving}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 disabled:opacity-30">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-xl font-black tabular-nums text-slate-900">{guestFemale}</span>
                  <button
                    onClick={() => adjustFemale(1)}
                    disabled={!canAddGuest || saving}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-30">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!canAddGuest && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Shield className="h-3.5 w-3.5" /> Slot limit reached — guest cap protected.
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">
            You're taking <span className="text-lime-400">{1 + guests}</span> slot{1 + guests > 1 ? 's' : ''}
            {guests > 0 && <span className="ml-1 text-slate-400 text-xs">(+{guestMale}M +{guestFemale}F)</span>}
          </div>
        </div>
      )}

      {saving && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
        </p>
      )}

      <Modal open={!!nameModal} onClose={() => setNameModal(false)}>
        <div className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-lime-400">
            <Sparkles className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-xl font-bold text-slate-900">What's your name?</h3>
          <p className="mt-1 text-sm text-slate-500">No account needed — we'll remember you on this device.</p>
        </div>
        <input
          autoFocus
          className={cx(inputCls, 'mt-5 text-center text-lg')}
          placeholder="e.g. Nguyễn Văn A"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && confirmName()}
        />
        <Button variant="volt" size="lg" className="mt-4 w-full" onClick={confirmName}
          disabled={nameDraft.trim().length < 2}>
          Continue <ArrowRight className="h-5 w-5" />
        </Button>
      </Modal>
    </div>
  )
}
