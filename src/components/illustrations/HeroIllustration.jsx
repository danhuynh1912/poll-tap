import React, { useState, useEffect } from 'react'
import { Check, X, AlertTriangle } from 'lucide-react'
import { cx } from '../../lib/utils'
import { RosterIllustration } from './RosterIllustration'

// Set to 0–4 to preview each hero variant during development.
const ACTIVE_HERO = 0

/* ── Floating Vote Cards ─────────────────────────────────────────────── */
const MOCK_VOTES = [
  { name: 'Danh',  yes: true,  guests: 0, delay: 0 },
  { name: 'Minh',  yes: true,  guests: 2, delay: 180 },
  { name: 'Anh',   yes: false, guests: 0, delay: 360 },
  { name: 'Hùng',  yes: true,  guests: 1, delay: 540 },
  { name: 'Linh',  yes: true,  guests: 0, delay: 720 },
]

function FloatingVoteCards() {
  return (
    <div className="relative rounded-3xl bg-slate-900 p-6 overflow-hidden min-h-[340px]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-64 rounded-full bg-lime-400/10 blur-3xl" />
      </div>
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tuesday Night Smash</p>
          <p className="mt-0.5 text-sm font-bold text-white">Votes coming in…</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold text-lime-400">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="relative space-y-2.5">
        {MOCK_VOTES.map((v, i) => (
          <div key={i} className="animate-slide-up flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/70 px-4 py-3 backdrop-blur"
            style={{ animationDelay: `${v.delay}ms` }}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-700 text-sm font-black text-lime-400">
              {v.name[0]}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{v.name}</p>
              {v.yes && v.guests > 0
                ? <p className="text-xs text-slate-400">+{v.guests} guest{v.guests > 1 ? 's' : ''}</p>
                : <p className="text-xs text-slate-500">{v.yes ? '1 slot' : '—'}</p>}
            </div>
            <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black',
              v.yes ? 'bg-lime-400 text-slate-900' : 'bg-slate-700 text-slate-400')}>
              {v.yes ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Pulsing Avatar Grid ─────────────────────────────────────────────── */
const AVATAR_NAMES = ['A','M','H','D','L','T','P','N','Q','B','K','C']

function PulsingAvatarGrid() {
  const filled = 7
  return (
    <div className="relative rounded-3xl bg-slate-900 p-6 overflow-hidden min-h-[340px] flex flex-col justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl" />
      </div>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tuesday Night Smash</p>
        <p className="mt-1 text-2xl font-black text-white">{filled} <span className="text-slate-500 font-medium text-lg">/ {AVATAR_NAMES.length} players</span></p>
      </div>
      <div className="relative mt-4 grid grid-cols-6 gap-3">
        {AVATAR_NAMES.map((name, i) => {
          const active = i < filled
          return (
            <div key={i}
              className={cx('animate-pop-in aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all',
                active ? 'bg-lime-400 text-slate-900' : 'border-2 border-slate-700 text-slate-600')}
              style={{ animationDelay: `${i * 80}ms` }}>
              {active ? name : <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />}
            </div>
          )
        })}
      </div>
      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-lime-400 transition-all duration-1000" style={{ width: `${(filled / AVATAR_NAMES.length) * 100}%` }} />
      </div>
      <p className="relative mt-2 text-xs text-slate-500">{AVATAR_NAMES.length - filled} spots remaining</p>
    </div>
  )
}

/* ── Slot Counter Hero ───────────────────────────────────────────────── */
const SLOT_NAMES = ['Danh', 'Minh (+2)', 'Hùng', 'Anh', 'Linh (+1)']

function SlotCounterHero() {
  return (
    <div className="relative rounded-3xl bg-slate-900 p-6 overflow-hidden min-h-[340px] flex flex-col justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl" />
      </div>
      <div className="relative text-center pt-2">
        <p className="text-[80px] font-black leading-none tabular-nums text-lime-400 animate-fade-in">6</p>
        <p className="text-slate-500 font-medium text-lg -mt-1">of <span className="text-white font-bold">8</span> slots filled</p>
      </div>
      <div className="relative mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-lime-400" style={{ width: '75%' }} />
      </div>
      <div className="relative mt-4 space-y-2">
        {SLOT_NAMES.map((n, i) => (
          <div key={i} className="animate-slide-up flex items-center gap-2" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-800 text-[10px] font-bold text-lime-400">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium text-slate-300">{n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Countdown + Urgency ─────────────────────────────────────────────── */
function CountdownHero() {
  const [secs, setSecs] = useState(2 * 3600 + 47 * 60 + 33)
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  const filled = 6; const max = 8
  const pct = (filled / max) * 100
  return (
    <div className="relative rounded-3xl bg-slate-900 p-6 overflow-hidden min-h-[340px] flex flex-col justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-red-400/10 blur-3xl" />
      </div>
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deadline closing in</p>
        <div className="mt-3 flex items-end gap-2">
          {[h, m, s].map((v, i) => (
            <React.Fragment key={i}>
              <div className="text-center">
                <div className="rounded-2xl bg-slate-800 px-3 py-2 text-3xl font-black tabular-nums text-white">{v}</div>
                <p className="mt-1 text-[10px] text-slate-500 uppercase">{['hrs','min','sec'][i]}</p>
              </div>
              {i < 2 && <span className="mb-4 text-2xl font-black text-slate-600">:</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="relative mt-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-white">Slots</span>
          <span className="font-black text-lime-400">{filled}<span className="text-slate-500 font-medium">/{max}</span></span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-lime-400 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold text-amber-300">Only 2 spots left — vote before it closes!</p>
        </div>
      </div>
    </div>
  )
}

/* ── Switcher ────────────────────────────────────────────────────────── */
export function HeroIllustration() {
  if (ACTIVE_HERO === 1) return <FloatingVoteCards />
  if (ACTIVE_HERO === 2) return <PulsingAvatarGrid />
  if (ACTIVE_HERO === 3) return <SlotCounterHero />
  if (ACTIVE_HERO === 4) return <CountdownHero />
  return <RosterIllustration />
}
